import { Order, getOrderStatus } from '@/iraqi/types';

/**
 * Finds the appropriate box name for a new order.
 * - Looks for the latest open box that has < 90 pieces
 * - If latest box has 90-110 pieces, creates a new box
 * - If no boxes exist, starts at Box 1
 */
export function findAutoBoxName(orders: Order[], newPieces: number): string {
  // Find all existing box numbers and track which boxes are "closed"
  // (a box is closed once any order inside it is marked approved/arrived/cancelled —
  //  i.e. no longer pending — so we never add new orders to an already-approved box).
  const boxMap = new Map<number, number>(); // boxNum -> totalPieces
  const closedBoxes = new Set<number>();

  orders.forEach(o => {
    const match = String(o.box_name || '').trim().match(/^Box (\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      const pieces = Number(o.pics_text) || 0;
      boxMap.set(num, (boxMap.get(num) || 0) + pieces);
      if (getOrderStatus(o) !== 'pending') {
        closedBoxes.add(num);
      }
    }
  });

  if (boxMap.size === 0) {
    return 'Box 1';
  }

  const maxBoxNum = Math.max(...boxMap.keys());
  const currentBoxPieces = boxMap.get(maxBoxNum) || 0;

  // If the latest box is closed (any order in it is approved/arrived/cancelled),
  // start a new one — regardless of how few pieces it has. Approved boxes are sealed.
  if (closedBoxes.has(maxBoxNum)) {
    return `Box ${maxBoxNum + 1}`;
  }

  // If current box is already in the 90-110 range or would exceed 110, start new box
  if (currentBoxPieces >= 90 || currentBoxPieces + newPieces > 110) {
    return `Box ${maxBoxNum + 1}`;
  }

  // Otherwise add to current open box
  return `Box ${maxBoxNum}`;
}
