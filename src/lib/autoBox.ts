import { Order, getOrderStatus } from "@/types";

/**
 * Box numbers have always run continuously rather than restarting each month —
 * April ended at 47, May at 71, June at 109, July at 150. A new month therefore has
 * to carry on from the highest number ever used, and this floor guarantees that even
 * when no earlier orders happen to be loaded yet.
 *
 * Raise it if numbering ever needs to jump; never lower it, or a new box could take
 * a name an old box already has.
 */
export const FIRST_BOX_NUMBER = 151;

const BOX_NAME = /^Box\s+(\d+)\s*(d)?$/i;

interface AutoBoxOptions {
  /**
   * Every order that is loaded, used only to find the highest box number in use.
   * Numbering is global, so passing just one month restarts it at 1.
   */
  allOrders?: Order[];
}

/**
 * Finds the box name for a new order.
 * - Adds to the newest open box in this month while it holds < 90 pieces
 * - Starts a new box once that box reaches 90-110 pieces, or is closed
 * - A new box continues the global numbering, never restarting at 1
 *
 * `monthOrders` decides which box can still be added to, while `allOrders` decides
 * what the next number is. Keeping those separate is what stops a fresh month from
 * being appended to the previous month's still-open box.
 */
export function findAutoBoxName(
  monthOrders: Order[],
  newPieces: number,
  options: AutoBoxOptions = {},
): string {
  const boxMap = new Map<number, number>(); // boxNum -> totalPieces
  const boxNames = new Map<number, string>();
  const closedBoxes = new Set<number>();

  monthOrders.forEach((o) => {
    const rawBoxName = String(o.box_name || "").trim();
    const match = rawBoxName.match(BOX_NAME);
    if (!match) return;
    const num = parseInt(match[1]);
    const pieces = Number(o.pics_text) || 0;
    boxMap.set(num, (boxMap.get(num) || 0) + pieces);
    if (!boxNames.has(num) || match[2]) boxNames.set(num, rawBoxName);
    // A box is sealed once any order in it is no longer pending, so nothing new is
    // ever added to a box that has already been approved or shipped.
    if (getOrderStatus(o) !== "pending") closedBoxes.add(num);
  });

  // The highest number anywhere, so a new box never reuses an old name.
  let highestEver = FIRST_BOX_NUMBER - 1;
  for (const o of options.allOrders ?? monthOrders) {
    const match = String(o.box_name || "")
      .trim()
      .match(BOX_NAME);
    if (match) highestEver = Math.max(highestEver, parseInt(match[1]));
  }
  const nextBox = () => `Box ${highestEver + 1}d`;

  // Nothing boxed in this month yet — open the next box rather than joining last
  // month's, which is what "the new month starts a new box" means.
  if (boxMap.size === 0) return nextBox();

  const newestInMonth = Math.max(...boxMap.keys());
  const piecesInBox = boxMap.get(newestInMonth) || 0;

  if (closedBoxes.has(newestInMonth)) return nextBox();
  if (piecesInBox >= 90 || piecesInBox + newPieces > 110) return nextBox();

  return boxNames.get(newestInMonth) || `Box ${newestInMonth}d`;
}
