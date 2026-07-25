import React, { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, CameraOff, ImageUp, Loader2, ScanBarcode, X } from "lucide-react";
import { getSkuOcrWorker, preloadSkuLabelReader } from "./skuOcrWorker";

interface SkuBarcodeScannerProps {
  onScan: (scannedText: string) => void;
  onClose: () => void;
}

const cleanCode = (value: string) => value.replace(/[^a-z0-9]/gi, "");

interface LabelCode {
  raw: string;
  digits: string;
  query: string;
  isProductSku: boolean;
  isPackageBarcode: boolean;
}

const extractLabelCodes = (text: string): LabelCode[] => {
  const compactLines = text.split(/\r?\n/).map(cleanCode).filter(Boolean);
  const fullyCompacted = cleanCode(text);
  const matches = [...compactLines, fullyCompacted]
    .flatMap((line) => line.match(/(?:pb|[a-z]{1,3})?\d{7,}/gi) || [])
    .map(cleanCode)
    .map((raw) => {
      const digits = raw.replace(/\D/g, "");
      return {
        raw,
        digits,
        // Eight continuous digits are normally unique in the SKU sheet. If OCR
        // only catches seven, the sheet can still use those seven to find people.
        query: digits.slice(0, Math.min(8, digits.length)),
        isProductSku: /^s[a-z]\d/i.test(raw),
        isPackageBarcode: /^pb\d/i.test(raw),
      };
    })
    .filter((code) => code.query.length >= 7);

  const uniqueCodes = [...new Map(matches.map((code) => [code.raw.toLowerCase(), code])).values()];
  return uniqueCodes.sort((a, b) => {
    if (a.isProductSku !== b.isProductSku) return a.isProductSku ? -1 : 1;
    if (a.isPackageBarcode !== b.isPackageBarcode) return a.isPackageBarcode ? 1 : -1;
    return b.query.length - a.query.length;
  });
};

const makeReadableCanvas = (
  source: CanvasImageSource,
  width: number,
  height: number,
  cropToGuide = false,
) => {
  const sourceX = cropToGuide ? width * 0.06 : 0;
  const sourceY = cropToGuide ? height * 0.2 : 0;
  const sourceWidth = cropToGuide ? width * 0.88 : width;
  const sourceHeight = cropToGuide ? height * 0.6 : height;
  const canvas = document.createElement("canvas");
  const scale = Math.min(1.25, 1200 / Math.max(1, sourceWidth));
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Unable to read this camera image.");

  context.filter = "grayscale(1) contrast(1.45)";
  context.drawImage(
    source,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas;
};

export const SkuBarcodeScanner: React.FC<SkuBarcodeScannerProps> = ({ onScan, onClose }) => {
  const [cameraError, setCameraError] = useState("");
  const [readError, setReadError] = useState("");
  const [isReadingLabel, setIsReadingLabel] = useState(false);
  const [detectedBarcode, setDetectedBarcode] = useState("");
  const scannerAreaRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const readingRef = useRef(false);
  const attemptedCodesRef = useRef(new Set<string>());

  useEffect(() => {
    // Start loading OCR while the camera opens so PB labels can be resolved to the
    // searchable product SKU printed below the barcode with less waiting.
    preloadSkuLabelReader();
  }, []);

  const finish = (codes: string[]) => {
    const uniqueCodes = [...new Set(codes.map(cleanCode).filter(Boolean))];
    if (uniqueCodes.length > 0) onScan(uniqueCodes.join(" "));
  };

  const readCanvas = async (canvas: HTMLCanvasElement, barcodeCodes: string[] = []) => {
    if (readingRef.current) return;
    readingRef.current = true;
    setIsReadingLabel(true);
    setReadError("");

    try {
      const worker = await getSkuOcrWorker();
      const result = await worker.recognize(canvas);
      const printedCodes = extractLabelCodes(result.data.text);
      const barcodeDigitValues = barcodeCodes.map((code) => code.replace(/\D/g, ""));
      const usableCodes = printedCodes.filter(
        (code) =>
          !barcodeDigitValues.some(
            (barcodeDigits) =>
              barcodeDigits.includes(code.query) || code.digits.includes(barcodeDigits),
          ),
      );
      const productCodes = usableCodes.filter((code) => code.isProductSku);
      const fastQueries = (productCodes.length > 0 ? productCodes : usableCodes)
        .map((code) => code.query)
        .filter((code) => code.length >= 7)
        .slice(0, 3);

      if (fastQueries.length > 0) {
        finish(fastQueries);
        return;
      }

      setReadError(
        "Keep the full label still for a moment. Only 7 or 8 continuous digits are needed.",
      );
    } catch (error) {
      setReadError(
        error instanceof Error ? error.message : "Could not read this label. Please try again.",
      );
    } finally {
      readingRef.current = false;
      setIsReadingLabel(false);
    }
  };

  const readCurrentCameraFrame = async (barcodeCodes: string[]) => {
    const video = scannerAreaRef.current?.querySelector("video");
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setReadError("Camera is not ready yet. Hold the full label still and try again.");
      return;
    }
    const canvas = makeReadableCanvas(video, video.videoWidth, video.videoHeight, true);
    await readCanvas(canvas, barcodeCodes);
  };

  const handleDetectedCodes = (results: Array<{ rawValue: string }>) => {
    if (readingRef.current) return;
    const codes = [...new Set(results.map((item) => cleanCode(item.rawValue)).filter(Boolean))];
    if (codes.length === 0) return;

    const searchableSku = codes.find((code) => /^s[a-z]\d{8,}/i.test(code));
    if (searchableSku) {
      const digits = searchableSku.replace(/\D/g, "");
      finish([digits.slice(0, 8)]);
      return;
    }

    const newCode = codes.find((code) => !attemptedCodesRef.current.has(code));
    if (!newCode) return;
    codes.forEach((code) => attemptedCodesRef.current.add(code));
    setDetectedBarcode(newCode);

    // SHEIN PB barcodes are package identifiers, while the searchable SKU is
    // printed underneath (for example sr2604...). Read the full label as soon as
    // the barcode is detected so the user does not have to type that second code.
    void readCurrentCameraFrame(codes);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setReadError("");
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = makeReadableCanvas(bitmap, bitmap.width, bitmap.height);
      bitmap.close();
      await readCanvas(canvas, detectedBarcode ? [detectedBarcode] : []);
    } catch (error) {
      setReadError(error instanceof Error ? error.message : "Could not open this image.");
    }
  };

  const handleScannerError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    if (/notallowed|permission denied/i.test(message)) {
      setCameraError(
        "Camera permission is blocked. Allow camera access, or use the label photo button.",
      );
    } else if (/notfound|device not found/i.test(message)) {
      setCameraError("No camera was found on this device.");
    } else {
      setCameraError("The camera could not start. You can still take or choose a label photo.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <ScanBarcode size={18} className="text-primary" />
            Scan product label
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Close scanner"
          >
            <X size={18} />
          </button>
        </div>

        <div ref={scannerAreaRef} className="relative aspect-[4/3] overflow-hidden bg-black">
          {!cameraError && (
            <Scanner
              formats={["linear_codes", "qr_code", "data_matrix"]}
              constraints={{
                facingMode: { ideal: "environment" },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }}
              paused={isReadingLabel}
              allowMultiple
              scanDelay={350}
              retryDelay={50}
              sound
              onScan={handleDetectedCodes}
              onError={handleScannerError}
            />
          )}

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
              <CameraOff size={42} className="text-red-400" />
              <p className="text-sm font-medium">{cameraError}</p>
            </div>
          )}

          {!cameraError && (
            <div className="pointer-events-none absolute inset-x-[8%] top-1/2 h-[44%] -translate-y-1/2 rounded-xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
          )}

          {isReadingLabel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 text-white">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm font-semibold">Reading 7-8 digits...</p>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <p className="text-center text-sm text-muted-foreground">
            Keep the white label inside the frame. Only 7-8 continuous digits are needed to find the
            customer.
          </p>

          {detectedBarcode && !isReadingLabel && (
            <p className="text-center text-xs font-semibold text-primary">
              Barcode read: {detectedBarcode}
            </p>
          )}

          {readError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs font-medium text-red-600">
              {readError}
            </p>
          )}

          <div className="flex justify-center gap-2">
            {detectedBarcode && !isReadingLabel && (
              <button
                type="button"
                onClick={() => void readCurrentCameraFrame([detectedBarcode])}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Camera size={15} /> Read full label again
              </button>
            )}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isReadingLabel}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 disabled:opacity-50"
            >
              <ImageUp size={15} /> Take label photo
            </button>
          </div>

          {detectedBarcode && readError && (
            <button
              type="button"
              onClick={() => finish([detectedBarcode])}
              className="mx-auto block text-xs font-medium text-muted-foreground underline underline-offset-2"
            >
              Search using the barcode only
            </button>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImage}
          />
        </div>
      </div>
    </div>
  );
};
