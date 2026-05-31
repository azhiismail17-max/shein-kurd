// Realtime broadcast layer using Firestore.
// GAS sheet reads take ~10s. To get sub-second sync between clients, we mirror
// every write through Firestore — anyone subscribed sees the change instantly.
import { db } from './firebase';
import {
  collection, doc, setDoc, onSnapshot, serverTimestamp, query, where, Timestamp
} from 'firebase/firestore';

const COL = 'order_updates';

export async function broadcastOrderChange(payload: any, sheet: string, rowId: string | number, action: 'upsert' | 'delete' = 'upsert') {
  try {
    const key = `${sheet}__${rowId}`;
    await setDoc(doc(db, COL, key), {
      payload,
      sheet,
      row_id: rowId,
      action,
      ts: serverTimestamp(),
      _ms: Date.now(),
    }, { merge: true });
  } catch (e) {
    // Non-fatal — sheet poll will eventually catch up
    console.warn('broadcastOrderChange failed', e);
  }
}

export function subscribeOrderChanges(handler: (change: { payload: any; sheet: string; row_id: any; action: string; _ms: number }) => void) {
  const since = Date.now() - 5000; // only react to changes from now-ish onward
  const q = query(collection(db, COL), where('_ms', '>=', since));
  const unsub = onSnapshot(q, (snap) => {
    snap.docChanges().forEach(ch => {
      if (ch.type === 'removed') return;
      const d = ch.doc.data() as any;
      if (!d || !d.sheet) return;
      handler({ payload: d.payload, sheet: d.sheet, row_id: d.row_id, action: d.action || 'upsert', _ms: d._ms || 0 });
    });
  }, (err) => console.warn('subscribeOrderChanges error', err));
  return unsub;
}
