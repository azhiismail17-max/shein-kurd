import type { Worker } from "tesseract.js";

let skuOcrWorkerPromise: Promise<Worker> | null = null;

export const getSkuOcrWorker = () => {
  if (!skuOcrWorkerPromise) {
    skuOcrWorkerPromise = import("tesseract.js").then(async ({ default: Tesseract }) => {
      const worker = await Tesseract.createWorker("eng");
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        preserve_interword_spaces: "1",
      });
      return worker;
    });
  }
  return skuOcrWorkerPromise;
};

export const preloadSkuLabelReader = () => {
  void getSkuOcrWorker().catch(() => undefined);
};
