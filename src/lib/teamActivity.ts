import { arrayUnion, collection, doc, getDoc, getDocs, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TeamProfile = 'kurdistani' | 'iraqi';

export function normalizeTeamUsername(username: string) {
  return String(username || 'unknown').trim().toLowerCase();
}

export function getTeamStatsId(profile: TeamProfile, username: string) {
  return `${profile}_${normalizeTeamUsername(username)}`;
}

export function getTodayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
}

export function resolveTeamUsername(profile: TeamProfile, role: string) {
  const stored = profile === 'iraqi' ? localStorage.getItem('iraqi_auth_username') : localStorage.getItem('auth_username');
  const cleanStored = String(stored || '').trim().toLowerCase();
  const cleanRole = String(role || '').trim().toLowerCase();
  const roleNames = new Set(['owner', 'admin', 'moderator', 'modertor', 'delivery', 'delvery']);

  if (cleanRole && roleNames.has(cleanStored) && cleanStored !== cleanRole) return cleanRole;
  return cleanStored || cleanRole || 'unknown';
}

export async function recordPresence(profile: TeamProfile, username: string, role: string, isOnline: boolean) {
  const cleanUsername = String(username || role || 'unknown').trim() || 'unknown';
  await setDoc(doc(db, 'user_stats', getTeamStatsId(profile, cleanUsername)), {
    username: cleanUsername,
    role,
    profile,
    isOnline,
    lastActive: new Date().toISOString(),
  }, { merge: true });
}

export async function recordOrderCreated(profile: TeamProfile, username: string, role: string, order: any) {
  const cleanUsername = String(username || role || 'unknown').trim() || 'unknown';
  const today = getTodayKey();
  const orderId = order.row_id || order.id || Date.now();
  const sheet = order.sheet || order.sheet_name || '';
  const statsRef = doc(db, 'user_stats', getTeamStatsId(profile, cleanUsername));
  const existing = await getDoc(statsRef);
  const recentOrders = existing.exists() && Array.isArray((existing.data() as any).recentOrders)
    ? (existing.data() as any).recentOrders
    : [];
  const alreadyTracked = recentOrders.some((item: any) => String(item.id) === String(orderId) && String(item.sheet || item.sheet_name || '') === String(sheet));

  if (alreadyTracked) {
    await setDoc(statsRef, {
      username: cleanUsername,
      role,
      profile,
      isOnline: true,
      lastActive: new Date().toISOString(),
      lastOrderAt: new Date().toISOString(),
    }, { merge: true });
    return;
  }

  await setDoc(statsRef, {
    username: cleanUsername,
    role,
    profile,
    isOnline: true,
    lastActive: new Date().toISOString(),
    lastOrderAt: new Date().toISOString(),
    totalOrders: increment(1),
    [`dailyOrders.${today}`]: increment(1),
    recentOrders: arrayUnion({
      id: String(orderId),
      sheet: String(sheet),
      orderKey: `${profile}|${sheet}|${orderId}`,
      insta: String(order.insta || order.name || 'Unknown'),
      price: String(order.price || ''),
      createdAt: new Date().toISOString(),
    }),
  }, { merge: true });
}

export async function recordOrderDeleted(profile: TeamProfile, sheet: string, rowId: string | number) {
  const today = getTodayKey();
  const snap = await getDocs(collection(db, 'user_stats'));
  const updates = snap.docs.map(async (docSnap) => {
    const data = docSnap.data() as any;
    if (data.profile !== profile || !Array.isArray(data.recentOrders)) return;

    const removed = data.recentOrders.filter((order: any) => String(order.id) === String(rowId) && String(order.sheet) === String(sheet));
    if (removed.length === 0) return;

    const remaining = data.recentOrders.filter((order: any) => !(String(order.id) === String(rowId) && String(order.sheet) === String(sheet)));
    const removedToday = removed.filter((order: any) => order.createdAt && new Date(order.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' }) === today).length;

    await updateDoc(doc(db, 'user_stats', docSnap.id), {
      recentOrders: remaining,
      totalOrders: increment(-removed.length),
      ...(removedToday > 0 ? { [`dailyOrders.${today}`]: increment(-removedToday) } : {}),
    });
  });
  await Promise.all(updates);
}
