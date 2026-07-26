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
        tessedit_char_whitelist: "0123456789",
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

/**
 * Pull the product number out of whatever the recogniser returned.
 *
 * The number wanted is a run of at least six digits. Labels also carry prices
 * and dates, so the longest run wins, and ties go to the last one on the label
 * (the product code is printed below the barcode). Anything longer than seven
 * digits is trimmed to its last seven, which is how the codes are stored.
 */
export const extractNumberFromOcrText = (text: string, maxDigits = 7) => {
  const candidates: string[] = [];

  // A code often comes back with the digits split by spaces ("0900 92"), so
  // those are joined back up. Only spaces though: joining across punctuation
  // turns the date 26/07/2026 into the eight digit "26072026", which then looks
  // longer and more convincing than the real product number next to it.
  for (const line of String(text || "").split(/\r?\n/)) {
    for (const segment of line.split(/[^\d ]+/)) {
      const digitsInSegment = segment.replace(/\s+/g, "");
      if (digitsInSegment.length >= 6) candidates.push(digitsInSegment);
    }
  }

  // Then any continuous run anywhere in the text.
  for (const run of String(text || "").match(/\d{6,}/g) || []) {
    candidates.push(run);
  }

  if (candidates.length === 0) return "";

  let best = candidates[0];
  for (const candidate of candidates) {
    // Longer is better; on a tie prefer the one seen later.
    if (candidate.length >= best.length) best = candidate;
  }

  return best.length > maxDigits ? best.slice(-maxDigits) : best;
};
