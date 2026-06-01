import { r as reactExports, a as React__default, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as Scanner } from "../_libs/yudiel__react-qr-scanner.mjs";
import { j as jsQR } from "../_libs/jsqr.mjs";
import { a9 as X, f as CameraOff, a5 as Upload } from "../_libs/lucide-react.mjs";
import "../_libs/barcode-detector.mjs";
import "../_libs/webrtc-adapter.mjs";
import "../_libs/sdp.mjs";
const QRScannerModal = ({ onScan, onClose }) => {
  const [error, setError] = reactExports.useState(null);
  const [hasCamera, setHasCamera] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  React__default.useEffect(() => {
    let mounted = true;
    async function checkCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          if (mounted) {
            setError("Your browser does not support camera access or it is blocked.");
            setHasCamera(false);
          }
          return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        if (mounted) {
          if (videoDevices.length > 0) {
            setHasCamera(true);
          } else {
            setError("No camera found. Please ensure your device has a camera.");
            setHasCamera(false);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(`Camera check failed: ${err instanceof Error ? err.message : String(err)}`);
          setHasCamera(false);
        }
      }
    }
    checkCamera();
    return () => {
      mounted = false;
    };
  }, []);
  const [manualInput, setManualInput] = reactExports.useState("");
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const tryDecode = (scale) => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          return jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth"
          });
        };
        let code = tryDecode(1);
        if (!code && img.width > 800) code = tryDecode(0.5);
        if (!code && img.width > 1600) code = tryDecode(0.25);
        if (!code) code = tryDecode(2);
        if (code) {
          onScan(code.data);
        } else {
          setError("No QR code found in the image. Please try again or use a clearer image.");
        }
      };
      img.src = e.target?.result;
    };
    reader.readAsDataURL(file);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex justify-between items-center bg-secondary/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg text-foreground", children: "Scan Order QR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black relative aspect-square flex items-center justify-center", children: error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white flex flex-col items-center gap-3 p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CameraOff, { size: 48, className: "text-red-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setError(null);
              setHasCamera(true);
            },
            className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90",
            children: "Retry Camera"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => fileInputRef.current?.click(),
            className: "px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
              " Upload Image"
            ]
          }
        )
      ] })
    ] }) : hasCamera === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-white flex flex-col items-center gap-3 p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Checking camera..." })
    ] }) : hasCamera ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Scanner,
        {
          onScan: (result) => {
            if (result && result.length > 0) {
              onScan(result[0].rawValue);
            }
          },
          onError: (err) => {
            const msg = typeof err === "string" ? err : err instanceof Error ? err.message : String(err);
            if (msg.includes("NotAllowedError") || msg.includes("Permission denied")) {
              setError("Camera permission denied. Please allow camera access.");
            } else if (msg.includes("NotFoundError") || msg.includes("Requested device not found") || msg.includes("device not found")) {
              setError("No camera found. Please ensure your device has a camera.");
            } else if (msg.includes("NotReadableError") || msg.includes("Could not start video source")) {
              setError("Camera is in use by another application or could not be started.");
            } else {
              setError(`Camera access error: ${msg}`);
            }
            setHasCamera(false);
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none border-[40px] border-black/40" })
    ] }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 text-center text-sm text-muted-foreground bg-secondary/30 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error ? "Scanner unavailable." : "Position the QR code within the frame" }),
      !error && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => fileInputRef.current?.click(),
          className: "px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 flex items-center justify-center gap-2 mx-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 16 }),
            " Upload Image Instead"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: manualInput,
            onChange: (e) => setManualInput(e.target.value),
            placeholder: "Paste QR data or type exact ID...",
            className: "flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
            onKeyDown: (e) => {
              if (e.key === "Enter" && manualInput.trim()) {
                onScan(manualInput);
              }
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              if (manualInput.trim()) onScan(manualInput);
            },
            className: "bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors",
            children: "Scan"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*",
          className: "hidden",
          ref: fileInputRef,
          onChange: handleImageUpload
        }
      )
    ] })
  ] }) });
};
export {
  QRScannerModal
};
