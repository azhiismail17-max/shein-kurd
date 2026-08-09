/**
 * Getting a usable web address out of whatever was pasted into an order's link field.
 *
 * SHEIN's share button does not copy a bare link. It copies a sentence with the link at the
 * end of it:
 *
 *   I found some great items at SHEIN! These items in my shopping cart are great. I highly
 *   recommend them to everyone! https://onelink.shein.com/46/5y86nom9bxnu?shc=2_RSvS0b0W0Ph
 *
 * Staff paste that whole thing, which is the sensible thing to do. The order screens then
 * built an href with `startsWith("http") ? link : "https://" + link`, and since the sentence
 * does not start with http they glued a scheme onto the front of the prose:
 *
 *   https://I found some great items at SHEIN! ... https://onelink.shein.com/...
 *
 * The browser then percent-encodes every space and collapses the real link's `://` down to
 * `//`, which is the %20-riddled address that comes out the other end and goes nowhere.
 *
 * So the address is pulled out of the text rather than assumed to be the text. Forty-one
 * orders were storing a sentence like this.
 */

/** Matches the first web address in a piece of text. */
const URL_PATTERN = /https?:\/\/[^\s"'<>()]+/i;

/**
 * Something that looks like a host and a path but has lost its scheme, such as
 * `onelink.shein.com/46/abc` — worth rescuing with an https:// in front. A bare word or a
 * sentence is not.
 */
const BARE_HOST_PATTERN = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+(\/\S*)?$/i;

/**
 * The address to open for an order, or an empty string when there is nothing to open.
 *
 * Returning empty rather than a guess matters: an anchor pointing at a mangled address looks
 * like a working link and wastes the time of whoever taps it.
 */
export function orderLinkHref(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  // A proper address anywhere in the text wins, wherever it sits.
  const found = raw.match(URL_PATTERN);
  if (found?.[0]) {
    // Trailing punctuation from the sentence around it is not part of the address.
    return found[0].replace(/[.,;:!?)\]]+$/, "");
  }

  // No scheme, but it reads like a host and path.
  if (BARE_HOST_PATTERN.test(raw)) return `https://${raw}`;

  // Prose with no address in it. There is nothing to link to.
  return "";
}

/**
 * What to store on the order.
 *
 * The address alone, so the data is clean from here on and nothing downstream has to guess.
 * If the pasted text holds no address it is kept as it is — it may be a note the shop wants,
 * and throwing away what somebody typed is worse than storing something unlinkable.
 */
export function cleanOrderLink(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return orderLinkHref(raw) || raw;
}
