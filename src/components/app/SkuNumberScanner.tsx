import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CameraOff,
  Check,
  ExternalLink,
  Flashlight,
  ImageUp,
  Loader2,
  ScanText,
  User,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { getSkuOcrWorker, preloadSkuLabelReader, readProductNumber } from "./skuOcrWorker";
import { GUIDE, buildOcrCanvas } from "@/lib/ocr-frame";
import { lookupSku, primeSkuIndex, type SkuLookupResult } from "@/lib/sku-lookup";

interface SkuNumberScannerProps {
  /** Called when the user picks a code to search with in the main screen. */
  onScan: (digits: string) => void;
  onClose: () => void;
  maxDigits?: number;
  /** Boxes to choose from, so scanning can be scoped to the one being packed. */
  boxOptions?: string[];
  selectedBox?: string;
  onSelectedBoxChange?: (box: string) => void;
  /** Which box(es) a found owner's product actually sits in, already scoped to
   * whatever box is selected - empty means "not in the selected box". */
  matchOwnerBoxes?: (owner: SkuLookupResult, code: string) => string[];
}

// Gap between reads. The read itself takes longer than this, so it only controls
// how soon the next one starts after a miss.
const SCAN_INTERVAL_MS = 90;
// Above this confidence a single read is trusted. Below it, the same number has
// to show up twice before it is accepted - a wrong number costs the user far
// more time than one extra frame does.
const TRUSTED_CONFIDENCE = 70;

interface OwnerHit {
  owner: SkuLookupResult;
  /** Raw box label(s) this owner's product was found in, already scoped to
   * whatever box is selected. Empty means it exists but not in that box. */
  boxes: string[];
}

interface ScanHit {
  code: string;
  owners: OwnerHit[];
  /** How many owners this code had before the selected box narrowed them down,
   * so "found, but not here" can be told apart from "not found at all". */
  totalOwners: number;
}

const formatBoxLabel = (box: string) => `Box ${String(box).replace(/^box[\s-]*/i, "")}`;

export const SkuNumberScanner: React.FC<SkuNumberScannerProps> = ({
  onScan,
  onClose,
  maxDigits = 7,
  boxOptions = [],
  selectedBox = "",
  onSelectedBoxChange,
  matchOwnerBoxes,
}) => {
  const [cameraError, setCameraError] = useState("");
  const [status, setStatus] = useState("Starting camera...");
  const [preview, setPreview] = useState("");
  const [isReadingPhoto, setIsReadingPhoto] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  // Getting close enough to fill a small guide box by moving the phone runs
  // straight into the lens's minimum focus distance and comes back blurred.
  // Zooming instead keeps the phone at a distance it can actually focus at.
  const [zoomAvailable, setZoomAvailable] = useState(false);
  const [zoom, setZoom] = useState(1);
  const zoomRangeRef = useRef<{ min: number; max: number; step: number } | null>(null);
  // The result being shown over the camera, and everything scanned so far.
  const [hit, setHit] = useState<ScanHit | null>(null);
  const [history, setHistory] = useState<ScanHit[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const stoppedRef = useRef(false);
  const busyRef = useRef(false);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenRef = useRef(new Map<string, number>());
  const fruitlessRef = useRef(new Set<string>());
  const biasCycleRef = useRef(0);
  // Read fresh on every scan without being a dependency of handleFound/readOnce -
  // those feed the camera-lifecycle effect, and a new function identity on every
  // parent render (matchOwnerBoxes is recreated each render of FastSkuSearch)
  // would restart the camera stream on every keystroke elsewhere in that screen.
  const matchOwnerBoxesRef = useRef(matchOwnerBoxes);
  const selectedBoxRef = useRef(selectedBox);
  useEffect(() => {
    matchOwnerBoxesRef.current = matchOwnerBoxes;
    selectedBoxRef.current = selectedBox;
  }, [matchOwnerBoxes, selectedBox]);

  const stopCamera = useCallback(() => {
    stoppedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    // Releasing the track matters on a phone: the camera light stays on and
    // other apps cannot use it until every track is stopped.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  /**
   * A number was read. The camera keeps running and the owner is shown over it,
   * so a whole box can be worked through without leaving this screen.
   */
  const handleFound = useCallback(async (digits: string) => {
    pausedRef.current = true;
    setPreview(digits);
    setStatus("Looking up...");
    const { results } = await lookupSku(digits);
    const matchBoxes = matchOwnerBoxesRef.current;
    const boxScope = selectedBoxRef.current;
    const withBoxes: OwnerHit[] = results.map((owner) => ({
      owner,
      boxes: matchBoxes ? matchBoxes(owner, digits) : [],
    }));
    // A box is selected: only an owner actually tied to that box belongs on
    // screen, otherwise scanning inside Box 120 would keep surfacing every
    // other box's customers for the same product.
    const owners = boxScope ? withBoxes.filter((entry) => entry.boxes.length > 0) : withBoxes;
    const found: ScanHit = { code: digits, owners, totalOwners: results.length };
    setHit(found);
    setHistory((previous) =>
      [found, ...previous.filter((item) => item.code !== digits)].slice(0, 8),
    );
    setStatus(
      owners.length > 0
        ? "Found"
        : boxScope && results.length > 0
          ? `Not in ${formatBoxLabel(boxScope)}`
          : "Not in the list",
    );
  }, []);

  const scanNext = useCallback(() => {
    setHit(null);
    setPreview("");
    setStatus("Point at the number");
    seenRef.current.clear();
    fruitlessRef.current.clear();
    pausedRef.current = false;
  }, []);

  // ---- live reading loop -------------------------------------------------
  const readOnce = useCallback(async () => {
    if (pausedRef.current) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return;

    // Vary the threshold slightly from frame to frame. Glare wants a darker cut,
    // dim light a lighter one, and alternating covers both without the cost of
    // recognising the same frame twice.
    const bias = biasCycleRef.current % 2 === 0 ? 0.88 : 0.76;
    biasCycleRef.current += 1;

    const frame = buildOcrCanvas(video, video.videoWidth, video.videoHeight, true, bias);

    // Nothing text-like in view - skip the expensive part entirely.
    if (!frame.readable) return;

    // Do not recognise a view that has already been recognised fruitlessly. The
    // threshold is part of the key, because the same scene at a different
    // threshold is a genuinely different image and worth one attempt of its own.
    const key = `${bias}|${frame.signature}`;
    if (fruitlessRef.current.has(key)) return;

    const worker = await getSkuOcrWorker();
    const { data } = await worker.recognize(frame.canvas);
    const { digits, viaPrefix } = readProductNumber(data.text, maxDigits);

    if (!digits) {
      // Bounded, so a slowly drifting view cannot grow this without limit.
      if (fruitlessRef.current.size > 12) fruitlessRef.current.clear();
      fruitlessRef.current.add(key);
      return;
    }
    fruitlessRef.current.clear();

    setPreview(digits);
    const confidence = Number(data.confidence) || 0;
    const seenCount = (seenRef.current.get(digits) || 0) + 1;
    seenRef.current.set(digits, seenCount);

    // Matching the "sr" prefix means the label itself said which line this is,
    // which is worth more than a confidence score, so that is taken at once.
    if (viaPrefix || confidence >= TRUSTED_CONFIDENCE || seenCount >= 2) {
      await handleFound(digits);
      return;
    }
    setStatus(`Checking ${digits}...`);
  }, [handleFound, maxDigits]);

  useEffect(() => {
    stoppedRef.current = false;
    pausedRef.current = false;
    preloadSkuLabelReader();
    // Have the codes in memory before the first read finishes, so the owner
    // appears in the same moment the number does.
    void primeSkuIndex();

    const tick = async () => {
      if (stoppedRef.current) return;
      if (!busyRef.current) {
        busyRef.current = true;
        try {
          await readOnce();
        } catch (error) {
          console.warn("Number read failed", error);
        } finally {
          busyRef.current = false;
        }
      }
      if (!stoppedRef.current) timerRef.current = setTimeout(tick, SCAN_INTERVAL_MS);
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
            // Small print survives downscaling much better when the frame it
            // came from was sharp to begin with.
            width: { ideal: 1920 },
            height: { ideal: 1080 },
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
        const capabilities = track?.getCapabilities?.() as
          | { torch?: boolean; zoom?: { min: number; max: number; step: number } }
          | undefined;
        setTorchAvailable(Boolean(capabilities?.torch));

        if (capabilities?.zoom && capabilities.zoom.max > capabilities.zoom.min) {
          zoomRangeRef.current = capabilities.zoom;
          setZoomAvailable(true);
          const settings = track?.getSettings?.() as { zoom?: number } | undefined;
          setZoom(settings?.zoom || capabilities.zoom.min);
        }

        // Keep hunting for focus. A phone that locks focus on the bag behind the
        // label never resolves the print, however many frames are read.
        try {
          await track?.applyConstraints({
            advanced: [{ focusMode: "continuous" }],
          } as unknown as MediaTrackConstraints);
        } catch {
          // Not offered on this device; the default focus behaviour will do.
        }

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

  const changeZoom = async (delta: number) => {
    const range = zoomRangeRef.current;
    const [track] = streamRef.current?.getVideoTracks() || [];
    if (!track || !range) return;
    const next = Math.max(range.min, Math.min(range.max, zoom + delta));
    if (next === zoom) return;
    try {
      await track.applyConstraints({
        advanced: [{ zoom: next }],
      } as unknown as MediaTrackConstraints);
      setZoom(next);
    } catch {
      setZoomAvailable(false);
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
      const frame = buildOcrCanvas(bitmap, bitmap.width, bitmap.height, false);
      bitmap.close();
      const worker = await getSkuOcrWorker();
      const { data } = await worker.recognize(frame.canvas);
      const { digits } = readProductNumber(data.text, maxDigits);
      if (digits) {
        await handleFound(digits);
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
            {history.length > 0 && (
              <span className="mr-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {history.length} scanned
              </span>
            )}
            {zoomAvailable && (
              <div className="flex items-center gap-0.5 rounded-lg bg-secondary px-0.5 py-0.5">
                <button
                  type="button"
                  onClick={() => changeZoom(-(zoomRangeRef.current?.step || 0.5))}
                  className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="w-8 text-center text-[10px] font-bold tabular-nums text-muted-foreground">
                  {zoom.toFixed(1)}x
                </span>
                <button
                  type="button"
                  onClick={() => changeZoom(zoomRangeRef.current?.step || 0.5)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={15} />
                </button>
              </div>
            )}
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

        {boxOptions.length > 0 && (
          <div className="border-b border-border px-4 py-2">
            <select
              value={selectedBox}
              onChange={(event) => onSelectedBoxChange?.(event.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-semibold text-foreground focus:border-primary/50 focus:outline-none"
              aria-label="Scan only for this box"
            >
              <option value="">Scanning: all boxes</option>
              {boxOptions.map((box) => (
                <option key={box} value={box}>
                  Scanning: {formatBoxLabel(box)} only
                </option>
              ))}
            </select>
          </div>
        )}

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

          {!cameraError && !hit && (
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

          {/* The result, over the live camera, with the next scan one tap away. */}
          {hit && (
            <div className="absolute inset-0 flex flex-col bg-slate-950/85 p-3 text-white backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${hit.owners.length > 0 ? "bg-emerald-500" : "bg-amber-500"}`}
                >
                  {hit.owners.length > 0 ? <Check size={18} /> : <ScanText size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-lg font-black tabular-nums tracking-[0.2em]">
                    {hit.code}
                  </div>
                  <div className="text-[11px] font-semibold opacity-75">
                    {hit.owners.length > 0
                      ? `${hit.owners.length} customer${hit.owners.length === 1 ? "" : "s"}`
                      : selectedBox && hit.totalOwners > 0
                        ? `Found, but not in ${formatBoxLabel(selectedBox)}`
                        : "No customer has this code"}
                  </div>
                </div>
              </div>

              <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                {hit.owners.map((entry, index) => (
                  <div
                    key={`${entry.owner.name}-${index}`}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-2"
                  >
                    <User size={15} className="shrink-0 opacity-70" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        @{String(entry.owner.name || "Unknown")}
                      </span>
                      <span className="block text-[11px] opacity-70">
                        {entry.owner.pcs ? `${entry.owner.pcs} pieces` : "quantity unknown"}
                        {entry.boxes.length > 0
                          ? ` · 📦 ${entry.boxes.map(formatBoxLabel).join(", ")}`
                          : ""}
                      </span>
                    </span>
                    {entry.owner.link ? (
                      <a
                        href={String(entry.owner.link)}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-md bg-white/15 p-1.5 hover:bg-white/25"
                        aria-label="Open the product"
                      >
                        <ExternalLink size={14} />
                      </a>
                    ) : null}
                  </div>
                ))}
                {hit.owners.length === 0 && (
                  <p className="rounded-lg bg-white/10 px-2.5 py-2 text-xs leading-5 opacity-80">
                    {selectedBox && hit.totalOwners > 0
                      ? `This code belongs to ${hit.totalOwners} customer${hit.totalOwners === 1 ? "" : "s"}, but none in ${formatBoxLabel(selectedBox)}.`
                      : "This code is not in the list yet. It arrives once the extractor bot has read that order."}
                  </p>
                )}
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={scanNext}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-sm font-bold text-white active:scale-[0.99]"
                >
                  <ScanText size={16} /> Scan next item
                </button>
                <button
                  type="button"
                  onClick={() => onScan(hit.code)}
                  className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-white/15 px-4 text-sm font-bold text-white hover:bg-white/25"
                >
                  Open
                </button>
              </div>
            </div>
          )}

          {isReadingPhoto && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/65 text-white">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm font-semibold">Reading the photo...</p>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          {history.length > 1 && (
            <div className="max-h-24 overflow-y-auto rounded-lg border border-border bg-secondary/40 p-2">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                This session
              </div>
              {history.map((item, index) => (
                <div
                  key={`${item.code}-${index}`}
                  className="flex items-center justify-between gap-2 py-0.5 text-xs"
                >
                  <span className="font-mono font-bold tabular-nums">{item.code}</span>
                  <span className="min-w-0 flex-1 truncate text-right font-semibold text-muted-foreground">
                    {item.owners.length > 0
                      ? item.owners.map((entry) => `@${entry.owner.name}`).join(", ")
                      : "not found"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!hit && (
            <p className="text-center text-sm text-muted-foreground">
              Hold the printed number inside the box. It is read automatically - no button needed.
            </p>
          )}

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
