/**
 * Matching phone numbers however they happen to be written.
 *
 * The same number reaches this shop in every shape there is:
 *
 *   +964750566731
 *   964 750 751 05 21
 *   07505123598
 *   0750 512 3598
 *   00964 750 512 3598
 *
 * The search stripped non-digits and a leading zero, which handled the spaces and the 0 but
 * not the country code — so a number typed as +964… could not find an order stored as 0750…,
 * and the staff member searching had no way to tell whether the order was missing or merely
 * written differently.
 *
 * Both sides are reduced to the same thing here: the local number, no country code and no
 * trunk zero. 07505123598, +9647505123598 and 964 750 512 3598 all become 7505123598.
 */

/**
 * The local form of a number, or an empty string if there are no digits in it.
 *
 * Partial input is kept rather than rejected — someone typing the first six digits of a
 * number is searching, not filling in a form, and should see matches as they type.
 */
export function canonicalPhone(value: unknown): string {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";

  // 00 964 …, the international prefix written out.
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Iraq's country code, however it arrived.
  if (digits.startsWith("964")) digits = digits.slice(3);
  // The trunk zero, which is there when dialling inside the country and absent when not.
  digits = digits.replace(/^0+/, "");

  return digits;
}

/**
 * Every phone number on an order, in canonical form, as one searchable string.
 *
 * Joined with a separator so one number's ending cannot run into the next one's beginning
 * and match something nobody has.
 */
export function orderPhoneKeys(order: {
  phone?: unknown;
  phone2?: unknown;
  fib?: unknown;
}): string {
  return [order.phone, order.phone2, order.fib].map(canonicalPhone).filter(Boolean).join("|");
}

/**
 * Whether a typed query looks like someone reaching for a phone number.
 *
 * Six digits is the point where a number stops colliding with prices, box numbers and order
 * numbers. Below that the ordinary text search is the better answer.
 */
export function looksLikePhoneQuery(query: string): boolean {
  return canonicalPhone(query).length >= 6;
}
