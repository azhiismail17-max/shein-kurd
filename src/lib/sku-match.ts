// Text handling and product matching for the SKU / barcode search.
//
// These are pure functions kept out of the component so they can be tested on
// their own, and so the search screen keeps working after a hot reload.

export const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const compact = (value: unknown) => normalize(value).replace(/[^a-z0-9]+/g, "");

export const normalizeLink = (value: unknown) =>
  normalize(value)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");

export const normalizeBoxName = (value: unknown) => normalize(value).replace(/^box[\s-]*/i, "");

/** Long digit runs in a piece of text - the shape a SKU or barcode takes. */
export const extractIdentifiers = (value: unknown) => {
  const text = normalize(value);
  const separated = text.match(/[a-z]{0,4}[\s:_-]*\d(?:[\s:_-]*\d){5,}/gi) || [];
  return [
    ...new Set(
      separated
        .map((item) => item.replace(/[^a-z0-9]/gi, "").toLowerCase())
        .filter((item) => item.length >= 6),
    ),
  ];
};

/** The parts of a prepared order that can identify a product. */
export interface ProductMatchable {
  compactText: string;
  link: string;
  productKey: string;
}

export interface ProductSignals {
  identifiers: string[];
  link: string;
  productKey: string;
}

/**
 * Collect the things that genuinely identify a scanned product: the code that
 * was scanned, the product's own codes, and its link. Names and titles are
 * deliberately excluded - see scoreOrderAgainstProduct.
 */
export const getProductSignals = (values: {
  identifierSources: unknown[];
  link?: unknown;
}): ProductSignals => {
  const identifiers = [
    ...new Set(
      values.identifierSources
        .flatMap((source) => {
          const found = extractIdentifiers(source);
          if (found.length > 0) return found;
          // A bare code such as "090092" is already an identifier on its own.
          const bare = compact(source);
          return bare.length >= 6 ? [bare] : [];
        })
        .filter(Boolean),
    ),
  ];
  const link = normalizeLink(values.link);
  return { identifiers, link, productKey: compact(link) };
};

/**
 * How strongly an order is tied to a scanned product.
 *
 * Only a real identifier or the product link counts. This used to be scored
 * with the same fuzzy helper the text search uses, whose weakest tier rewards a
 * single shared two-character word, fed a blob that included the product title,
 * its URL and the customer name. Every order links to shein.com, so the word
 * "shein" matched every order in the month and one scan listed a dozen
 * unrelated customers' boxes as if they held the product.
 */
export const scoreOrderAgainstProduct = (prepared: ProductMatchable, signals: ProductSignals) => {
  let score = 0;

  if (
    signals.link &&
    prepared.link &&
    (prepared.link.includes(signals.link) || signals.link.includes(prepared.link))
  ) {
    score = Math.max(score, 160);
  }

  if (
    signals.productKey &&
    prepared.productKey &&
    (prepared.productKey.includes(signals.productKey) ||
      signals.productKey.includes(prepared.productKey))
  ) {
    score = Math.max(score, 160);
  }

  for (const identifier of signals.identifiers) {
    if (identifier && prepared.compactText.includes(identifier)) {
      score = Math.max(score, 140);
    }
  }

  return score;
};
