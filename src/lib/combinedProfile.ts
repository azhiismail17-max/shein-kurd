import { SCRIPT_URL as KURDISTANI_SCRIPT_URL } from '@/types';
import { SCRIPT_URL as IRAQI_SCRIPT_URL } from '@/iraqi/types';
import { getTeamStatsId, getTodayKey, normalizeTeamUsername, TeamProfile } from '@/lib/teamActivity';

export type ProfileSource = TeamProfile;

export interface CombinedAuthUser {
  username: string;
  role: string;
}

export interface CombinedRecentOrder {
  id: string;
  sheet: string;
  insta: string;
  price: string;
  createdAt: string;
  source: ProfileSource;
}

export const PROFILE_SOURCES: ProfileSource[] = ['kurdistani', 'iraqi'];

export const SOURCE_STYLES: Record<ProfileSource, { label: string; badge: string; row: string; dot: string }> = {
  kurdistani: {
    label: 'Kurdistani',
    badge: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
    row: 'border-l-sky-500 bg-sky-50/60 dark:bg-sky-500/10',
    dot: 'bg-sky-500',
  },
  iraqi: {
    label: 'Iraqi',
    badge: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    row: 'border-l-rose-500 bg-rose-50/60 dark:bg-rose-500/10',
    dot: 'bg-rose-500',
  },
};

export function parseOrderPrice(value: unknown) {
  return parseFloat(String(value || '').replace(/[^0-9.-]+/g, '')) || 0;
}

export function getCombinedUserStats(stats: Record<string, any>, username: string) {
  return getUserStatsForProfile(stats, username, 'all');
}

export function getUserStatsForProfile(stats: Record<string, any>, username: string, profile: ProfileSource | 'all') {
  const cleanUsername = normalizeTeamUsername(username);
  const today = getTodayKey();
  const sources = profile === 'all' ? PROFILE_SOURCES : [profile];
  const bySource = sources.map((source) => {
    const sourceStats = stats[getTeamStatsId(source, cleanUsername)] || {};
    const recentOrders: CombinedRecentOrder[] = Array.isArray(sourceStats.recentOrders)
      ? sourceStats.recentOrders.map((order: any) => ({
          id: String(order.id || ''),
          sheet: String(order.sheet || order.sheet_name || ''),
          insta: String(order.insta || order.name || 'Unknown'),
          price: String(order.price || ''),
          createdAt: String(order.createdAt || ''),
          source,
        }))
      : [];

    return {
      source,
      totalOrders: Number(sourceStats.totalOrders || 0),
      todayOrders: Number(sourceStats.dailyOrders?.[today] || 0),
      isOnline: sourceStats.isOnline === true && sourceStats.lastActive && Date.now() - new Date(sourceStats.lastActive).getTime() < 90000,
      isActiveToday: sourceStats.lastActive ? new Date(sourceStats.lastActive).toDateString() === new Date().toDateString() : false,
      recentOrders,
    };
  });

  const recentOrders = bySource
    .flatMap((entry) => entry.recentOrders)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return {
    totalOrders: bySource.reduce((sum, entry) => sum + entry.totalOrders, 0),
    todayOrders: bySource.reduce((sum, entry) => sum + entry.todayOrders, 0),
    totalValue: recentOrders.reduce((sum, order) => sum + parseOrderPrice(order.price), 0),
    isOnline: bySource.some((entry) => entry.isOnline),
    isActiveToday: bySource.some((entry) => entry.isActiveToday),
    bySource,
    recentOrders,
  };
}

function formatAuthUser(user: string | CombinedAuthUser): CombinedAuthUser | null {
  if (typeof user === 'string') {
    const username = user.trim();
    if (!username) return null;
    return {
      username,
      role: username.includes(' ') ? username.split(' ')[0] : username,
    };
  }

  const username = String(user.username || '').trim();
  if (!username) return null;
  return {
    username,
    role: String(user.role || '').trim(),
  };
}

export async function fetchCombinedAuthUsers(fetcher: typeof fetch, profile: ProfileSource | 'all' = 'all'): Promise<CombinedAuthUser[]> {
  const urls =
    profile === 'all'
      ? [KURDISTANI_SCRIPT_URL, IRAQI_SCRIPT_URL]
      : [profile === 'iraqi' ? IRAQI_SCRIPT_URL : KURDISTANI_SCRIPT_URL];
  const responses = await Promise.allSettled(urls.map((url) => fetcher(`${url}?action=get_auth_users`)));

  const users = new Map<string, CombinedAuthUser>();

  for (const response of responses) {
    if (response.status !== 'fulfilled') continue;
    const text = await response.value.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      continue;
    }
    if (data.status !== 'success' || !Array.isArray(data.users)) continue;

    for (const rawUser of data.users) {
      const formatted = formatAuthUser(rawUser);
      if (!formatted) continue;
      const key = normalizeTeamUsername(formatted.username);
      const existing = users.get(key);
      users.set(key, {
        username: existing?.username || formatted.username,
        role: existing?.role && existing.role !== existing.username ? existing.role : formatted.role,
      });
    }
  }

  return [...users.values()].sort((a, b) => a.username.localeCompare(b.username));
}
