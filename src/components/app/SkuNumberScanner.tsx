import React, { useCallback, useEffect, useRef, useState } from "react";
import { CameraOff, Check, Flashlight, ImageUp, Loader2, ScanText, X } from "lucide-react";
import { extractNumberFromOcrText, getSkuOcrWorker, preloadSkuLabelReader } from "./skuOcrWorker";

interface SkuNumberScannerProps {
  /** Receives the digits that were read. */
  onScan: (digits: string) => void;
  onClose: () => void;
  maxDigits?: number;
}

// The frame handed to OCR. Recognition time scales with pixel count, so the crop
// is deliberately small - large enough for printed digits to stay legible, small
// enough to come back quickly on a phone.
const OCR_TARGET_WIDTH = 620;
// Gap between reads. The read itself takes longer than this, so it only controls
// how soon the next one starts after a miss.
const SCAN_INTERVAL_MS = 90;
// Above this confidence a single read is trusted. Below it, the same number has
// to show up twice before it is accepted - a wrong number costs the user far
// more time than one extra frame does.
const TRUSTED_CONFIDENCE = 70;

// The guide box, as a fraction of the video. Everything outside it is discarded
// before OCR, which is both faster and stops prices and dates elsewhere on the
// label from being read instead of the product number.
const GUIDE = { x: 0.06, y: 0.3, width: 0.88, height: 0.4 };

const buildOcrCanvas = (
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  cropToGuide: boolean,
) => {
  const sx = cropToGuide ? sourceWidth * GUIDE.x : 0;
  const sy = cropToGuide ? sourceHeight * GUIDE.y : 0;
  const sw = cropToGuide ? sourceWidth * GUIDE.width : sourceWidth;
  const sh = cropToGuide ? sourceHeight * GUIDE.height : sourceHeight;

  const scale = Math.min(2, OCR_TARGET_WIDTH / Math.max(1, sw));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This device cannot read camera frames.");
  context.filter = "grayscale(1) contrast(1.6) brightness(1.05)";
  context.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  // Hard black-and-white. Printed digits under warehouse lighting recognise far
  // more reliably once the grey in between is gone.
  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = frame.data;
  let total = 0;
  for (let i = 0; i < pixels.length; i += 4) total += pixels[i];
  const average = total / (pixels.length / 4);
  const threshold = Math.max(70, Math.min(190, average * 0.88));
  for (let i = 0; i < pixels.length; i += 4) {
    const value = pixels[i] > threshold ? 255 : 0;
    pixels[i] = value;
    pixels[i + 1] = value;
    pixels[i + 2] = value;
  }
  context.putImageData(frame, 0, 0);

  return canvas;
};

export const SkuNumberScanner: React.FC<SkuNumberScannerProps> = ({
  onScan,
  onClose,
  maxDigits = 7,
}) => {
  const [cameraError, setCameraError] = useState("");
  const [status, setStatus] = useState("Starting camera...");
  const [preview, setPreview] = useState("");
  const [isReadingPhoto, setIsReadingPhoto] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const stoppedRef = useRef(false);
  const busyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenRef = useRef(new Map<string, number>());
  const finishedRef = useRef(false);

  const stopCamera = useCallback(() => {
    stoppedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    // Releasing the track matters on a phone: the camera light stays on and
    // other apps cannot use it until every track is stopped.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const finish = useCallback(
    (digits: string) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setPreview(digits);
      stopCamera();
      onScan(digits);
    },
    [onScan, stopCamera],
  );

  // ---- live reading loop -------------------------------------------------
  const readOnce = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return false;

    const canvas = buildOcrCanvas(video, video.videoWidth, video.videoHeight, true);
    const worker = await getSkuOcrWorker();
    const { data } = await worker.recognize(canvas);
    const digits = extractNumberFromOcrText(data.text, maxDigits);
    if (!digits) return false;

    setPreview(digits);
    const confidence = Number(data.confidence) || 0;
    const seenCount = (seenRef.current.get(digits) || 0) + 1;
    seenRef.current.set(digits, seenCount);

    if (confidence >= TRUSTED_CONFIDENCE || seenCount >= 2) {
      finish(digits);
      return true;
    }
    setStatus(`Checking ${digits}...`);
    return false;
  }, [finish, maxDigits]);

  useEffect(() => {
    stoppedRef.current = false;
    finishedRef.current = false;
    preloadSkuLabelReader();

    const tick = async () => {
      if (stoppedRef.current || finishedRef.current) return;
      if (!busyRef.current) {
        busyRef.current = true;
        try {
          const done = await readOnce();
          if (done) return;
        } catch (error) {
          console.warn("Number read failed", error);
        } finally {
          busyRef.current = false;
        }
      }
      if (!stoppedRef.current && !finishedRef.current) {
        timerRef.current = setTimeout(tick, SCAN_INTERVAL_MS);
      }
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("This browser cannot open the camera. Use the photo button instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (stoppedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          // iOS refuses to play an inline video stream without both of these,
          // and silently shows nothing at all instead of reporting an error.
          video.setAttribute("playsinline", "true");
          video.setAttribute("webkit-playsinline", "true");
          video.muted = true;
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }

        const [track] = stream.getVideoTracks();
        const capabilities = track?.getCapabilities?.() as { torch?: boolean } | undefined;
        setTorchAvailable(Boolean(capabilities?.torch));

        setStatus("Point at the number");
        void tick();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/notallowed|permission/i.test(message)) {
          setCameraError(
            "Camera permission is blocked. Allow it in your browser settings, or use the photo button.",
          );
        } else if (/notfound|nodevices|device not found/i.test(message)) {
          setCameraError("No camera was found on this device.");
        } else if (/notreadable|trackstart/i.test(message)) {
          setCameraError("The camera is busy in another app. Close it and try again.");
        } else {
          setCameraError("The camera could not start. You can still take a photo of the label.");
        }
      }
    };

    void start();
    return stopCamera;
  }, [readOnce, stopCamera]);

  const toggleTorch = async () => {
    const [track] = streamRef.current?.getVideoTracks() || [];
    if (!track) return;
    try {
      const next = !torchOn;
      // `torch` is real on Android Chrome but missing from the DOM typings.
      await track.applyConstraints({
        advanced: [{ torch: next }],
      } as unknown as MediaTrackConstraints);
      setTorchOn(next);
    } catch {
      setTorchAvailable(false);
    }
  };

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsReadingPhoto(true);
    setStatus("Reading the photo...");
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = buildOcrCanvas(bitmap, bitmap.width, bitmap.height, false);
      bitmap.close();
      const worker = await getSkuOcrWorker();
      const { data } = await worker.recognize(canvas);
      const digits = extractNumberFromOcrText(data.text, maxDigits);
      if (digits) {
        finish(digits);
        return;
      }
      setStatus("No number found in that photo. Fill the frame with the number and try again.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not read that photo.");
    } finally {
      setIsReadingPhoto(false);
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
            <ScanText size={18} className="text-primary" />
            Read the number
          </h3>
          <div className="flex items-center gap-1">
            {torchAvailable && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`rounded-lg p-1.5 transition-colors ${torchOn ? "bg-amber-400/20 text-amber-500" : "text-muted-foreground hover:bg-secondary"}`}
                aria-label="Toggle flashlight"
              >
                <Flashlight size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
              aria-label="Close scanner"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-cover ${cameraError ? "hidden" : ""}`}
          />

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
              <CameraOff size={42} className="text-red-400" />
              <p className="text-sm font-medium">{cameraError}</p>
            </div>
          )}

          {!cameraError && (
            <>
              {/* Only what is inside this box is read. */}
              <div
                className="pointer-events-none absolute rounded-xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]"
                style={{
                  left: `${GUIDE.x * 100}%`,
                  top: `${GUIDE.y * 100}%`,
                  width: `${GUIDE.width * 100}%`,
                  height: `${GUIDE.height * 100}%`,
                }}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-white">
                {preview ? (
                  <span className="font-mono text-2xl font-black tabular-nums tracking-[0.3em]">
                    {preview}
                  </span>
                ) : (
                  <span className="text-sm font-semibold">{status}</span>
                )}
                {preview && <span className="text-[11px] font-semibold opacity-80">{status}</span>}
              </div>
            </>
          )}

          {isReadingPhoto && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 text-white">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm font-semibold">Reading the photo...</p>
            </div>
          )}

          {finishedRef.current && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-600/85 text-white">
              <Check size={40} />
              <p className="font-mono text-2xl font-black tracking-[0.3em]">{preview}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <p className="text-center text-sm text-muted-foreground">
            Hold the printed number inside the box. It is read automatically - no button needed.
          </p>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isReadingPhoto}
            className="mx-auto flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 disabled:opacity-50"
          >
            <ImageUp size={15} /> Take a photo instead
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>
      </div>
    </div>
  );
};
