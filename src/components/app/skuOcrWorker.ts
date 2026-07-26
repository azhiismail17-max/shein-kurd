import type { Worker } from "tesseract.js";

let skuOcrWorkerPromise: Promise<Worker> | null = null;

/**
 * An OCR worker set up to read nothing but digits.
 *
 * Restricting the alphabet to ten characters is the single biggest speed win
 * available here: the recogniser stops considering letters entirely, so a small
 * cropped frame comes back in a fraction of the time a general-purpose read
 * takes. The label's letters are of no interest anyway - the product is found by
 * its number.
 */
export const getSkuOcrWorker = () => {
  if (!skuOcrWorkerPromise) {
    skuOcrWorkerPromise = import("tesseract.js").then(async ({ default: Tesseract, PSM }) => {
      const worker = await Tesseract.createWorker("eng");
      await worker.setParameters({
        // Digits plus only the letters that identify which code is which. A
        // SHEIN label carries two: "PB..." is the package and is useless here,
        // "sr..." is the product. Without those six letters both lines arrive as
        // bare digits and there is no way to tell them apart. Sixteen allowed
        // characters is still a fraction of the full sixty-two.
        tessedit_char_whitelist: "0123456789PBSRpbsr",
        // Treat the crop as one block of text rather than hunting for page
        // structure, of which there is none inside a small guide box.
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        // Digit-only classifier: skips the letter shapes completely.
        classify_bln_numeric_mode: "1",
        // The frames are synthetic canvases with no DPI metadata; saying so
        // stops Tesseract guessing and rescaling before every read.
        user_defined_dpi: "300",
      });
      return worker;
    });
  }
  return skuOcrWorkerPromise;
};

export const preloadSkuLabelReader = () => {
  void getSkuOcrWorker().catch(() => undefined);
};

// A SHEIN parcel label prints two long codes under the barcode:
//
//     PB2606050333062                 <- the package, also what the barcode holds
//     sr260404132013462352731         <- the product; its tail is the code wanted
//
// Only the second one identifies the product, and only its last digits are
// stored, so "sr260404132013462352731" has to come out as "2352731". The letter
// r is frequently misread as 1 or l, and the recogniser sprinkles spaces through
// long digit runs, so both are tolerated.
// Spaces and tabs are allowed inside a run, but never a newline: a code must not
// be able to continue onto the next line and absorb the digits printed there.
// Letting it do so turned "sr...2352731" followed by "4pcs" into "...23527314",
// and the last seven of that is a code that belongs to nobody.
const PRODUCT_CODE = /s[ \t]*[r1lij][ \t]*([\d \t]{8,})/i;
const PACKAGE_CODE = /p[ \t]*[b86][ \t]*([\d \t]{8,})/i;

const digitsOnly = (value: string) => value.replace(/\D+/g, "");
const tail = (value: string, maxDigits: number) =>
  value.length > maxDigits ? value.slice(-maxDigits) : value;

export interface ProductNumberRead {
  digits: string;
  /**
   * True when the number was found by its "sr" prefix rather than by being the
   * longest run of digits. That is strong structural evidence - the label said
   * outright which line this is - so the caller can accept it on the first frame
   * instead of waiting for a confirming read.
   */
  viaPrefix: boolean;
}

/**
 * Pull the product number out of whatever the recogniser returned.
 *
 * The "sr" code is taken whenever it can be identified, because that is the only
 * line that answers the question. Failing that, the package code is excluded and
 * the longest remaining run of digits is used - on this label the product line is
 * 21 digits against the package's 13, so length alone still picks the right one
 * when the prefixes are too blurred to read.
 */
export const readProductNumber = (text: string, maxDigits = 7): ProductNumberRead => {
  const raw = String(text || "");

  // 1. The product line, identified by its prefix. The most reliable signal.
  const product = raw.match(PRODUCT_CODE);
  if (product) {
    const digits = digitsOnly(product[1]);
    if (digits.length >= 6) return { digits: tail(digits, maxDigits), viaPrefix: true };
  }

  // 2. Otherwise gather every plausible run, minus the package code.
  const packageMatch = raw.match(PACKAGE_CODE);
  const packageDigits = packageMatch ? digitsOnly(packageMatch[1]) : "";

  const candidates: string[] = [];
  const consider = (value: string) => {
    if (value.length < 6) return;
    // The package code is never the answer, so it must not be allowed to win by
    // being the only thing read clearly.
    if (packageDigits && (value === packageDigits || packageDigits.startsWith(value))) return;
    candidates.push(value);
  };

  // Digits split by spaces belong together ("0900 92"). Only spaces are joined:
  // joining across punctuation turns the date 26/07/2026 into "26072026", which
  // then looks longer and more convincing than the real code beside it.
  for (const line of raw.split(/\r?\n/)) {
    for (const segment of line.split(/[^\d ]+/)) consider(segment.replace(/\s+/g, ""));
  }
  for (const run of raw.match(/\d{6,}/g) || []) consider(run);

  if (candidates.length === 0) return { digits: "", viaPrefix: false };

  let best = candidates[0];
  for (const candidate of candidates) {
    // Longer is better; on a tie prefer the one seen later, since the product
    // line is printed below the package line.
    if (candidate.length >= best.length) best = candidate;
  }

  return { digits: tail(best, maxDigits), viaPrefix: false };
};

/** Just the digits, for callers that do not care how they were found. */
export const extractNumberFromOcrText = (text: string, maxDigits = 7) =>
  readProductNumber(text, maxDigits).digits;
