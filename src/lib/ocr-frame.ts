// Turning a camera frame into something the recogniser can read quickly.
//
// Kept free of React and of the OCR library so it can be exercised on its own in
// a browser, which is where canvas and getImageData actually exist.

// Recognition time scales with pixel count, but the product line is over twenty
// digits of small print, and squeezing that into a narrow canvas turns the digits
// to mush. A wide, short band keeps the total pixel count low while leaving each
// digit big enough to recognise.
export const OCR_TARGET_WIDTH = 980;

// The guide box, as a fraction of the video. Everything outside it is discarded
// before OCR, which is both faster and keeps the barcode, the Chinese text and
// the "Made in China" line from being read instead of the code. Shaped as a wide
// band so the two printed code lines fill it when the label is squared up.
export const GUIDE = { x: 0.04, y: 0.34, width: 0.92, height: 0.32 };

export interface PreparedFrame {
  canvas: HTMLCanvasElement;
  /** Whether this frame looks like it contains printed text at all. */
  readable: boolean;
  /** Cheap fingerprint, so an unchanged view is not recognised twice. */
  signature: string;
}

// One canvas, reused for every frame. Allocating a fresh one ten times a second
// is pure garbage for the collector to clean up in the middle of a scan.
let sharedCanvas: HTMLCanvasElement | null = null;
const getCanvas = (width: number, height: number) => {
  if (!sharedCanvas) sharedCanvas = document.createElement("canvas");
  if (sharedCanvas.width !== width) sharedCanvas.width = width;
  if (sharedCanvas.height !== height) sharedCanvas.height = height;
  return sharedCanvas;
};

export const buildOcrCanvas = (
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  cropToGuide: boolean,
  thresholdBias = 0.88,
): PreparedFrame => {
  const sx = cropToGuide ? sourceWidth * GUIDE.x : 0;
  const sy = cropToGuide ? sourceHeight * GUIDE.y : 0;
  const sw = cropToGuide ? sourceWidth * GUIDE.width : sourceWidth;
  const sh = cropToGuide ? sourceHeight * GUIDE.height : sourceHeight;

  const scale = Math.min(2, OCR_TARGET_WIDTH / Math.max(1, sw));
  const canvas = getCanvas(
    Math.max(1, Math.round(sw * scale)),
    Math.max(1, Math.round(sh * scale)),
  );

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This device cannot read camera frames.");
  context.filter = "grayscale(1) contrast(1.6) brightness(1.05)";
  context.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = frame.data;
  const pixelCount = pixels.length / 4;

  // Mean and spread in one pass, then a hard black-and-white threshold. Printed
  // digits under warehouse lighting recognise far better with the grey removed.
  let total = 0;
  let totalSquares = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const value = pixels[i];
    total += value;
    totalSquares += value * value;
  }
  const average = total / pixelCount;
  const spread = Math.sqrt(Math.max(0, totalSquares / pixelCount - average * average));
  const threshold = Math.max(70, Math.min(190, average * thresholdBias));

  let dark = 0;
  let signature = "";
  for (let i = 0; i < pixels.length; i += 4) {
    const value = pixels[i] > threshold ? 255 : 0;
    if (value === 0) dark += 1;
    pixels[i] = value;
    pixels[i + 1] = value;
    pixels[i + 2] = value;
    // Sample sparsely for the fingerprint - every 997th pixel, a prime, so the
    // samples cannot line up with the print's own regular spacing.
    if ((i >> 2) % 997 === 0) signature += value === 0 ? "1" : "0";
  }
  context.putImageData(frame, 0, 0);

  // Recognition costs a few hundred milliseconds; this check costs a fraction of
  // one. A view of a white bag or a blurred smear has almost no dark pixels and
  // almost no contrast, so reading it can only waste a whole cycle.
  const darkShare = dark / pixelCount;
  const readable = spread > 22 && darkShare > 0.004 && darkShare < 0.55;

  return { canvas, readable, signature };
};
