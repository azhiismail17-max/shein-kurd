import React, { useState, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, CameraOff, Upload } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerModalProps {
  onScan: (scannedText: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
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
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
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
    return () => { mounted = false; };
  }, []);

  const [manualInput, setManualInput] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
          const tryDecode = (scale: number) => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext("2d");
            if (!ctx) return null;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth",
            });
          };

          let code = tryDecode(1);
          if (!code && img.width > 800) code = tryDecode(0.5);
          if (!code && img.width > 1600) code = tryDecode(0.25);
          if (!code) code = tryDecode(2); // Try scaling up if it's too small

          if (code) {
            onScan(code.data);
          } else {
            setError("No QR code found in the image. Please try again or use a clearer image.");
          }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden relative">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
          <h3 className="font-semibold text-lg text-foreground">Scan Order QR</h3>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="bg-black relative aspect-square flex items-center justify-center">
          {error ? (
            <div className="text-white flex flex-col items-center gap-3 p-6 text-center">
              <CameraOff size={48} className="text-red-400" />
              <p className="text-sm font-medium">{error}</p>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => { setError(null); setHasCamera(true); }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  Retry Camera
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 flex items-center gap-2"
                >
                  <Upload size={16} /> Upload Image
                </button>
              </div>
            </div>
          ) : hasCamera === null ? (
            <div className="text-white flex flex-col items-center gap-3 p-6 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Checking camera...</p>
            </div>
          ) : hasCamera ? (
            <>
              <Scanner 
                onScan={(result) => {
                  if (result && result.length > 0) {
                    onScan(result[0].rawValue);
                  }
                }} 
                onError={(err) => {
                  const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : String(err);
                  if (msg.includes('NotAllowedError') || msg.includes('Permission denied')) {
                    setError("Camera permission denied. Please allow camera access.");
                  } else if (msg.includes('NotFoundError') || msg.includes('Requested device not found') || msg.includes('device not found')) {
                    setError("No camera found. Please ensure your device has a camera.");
                  } else if (msg.includes('NotReadableError') || msg.includes('Could not start video source')) {
                     setError("Camera is in use by another application or could not be started.");
                  } else {
                    setError(`Camera access error: ${msg}`);
                  }
                  setHasCamera(false);
                }}
              />
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40" />
            </>
          ) : null}
        </div>
        <div className="p-4 text-center text-sm text-muted-foreground bg-secondary/30 flex flex-col gap-3">
          <span>{error ? "Scanner unavailable." : "Position the QR code within the frame"}</span>
          
          {!error && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 flex items-center justify-center gap-2 mx-auto"
            >
              <Upload size={16} /> Upload Image Instead
            </button>
          )}

          <div className="flex gap-2 w-full mt-2">
            <input 
              type="text" 
              value={manualInput} 
              onChange={e => setManualInput(e.target.value)}
              placeholder="Paste QR data or type exact ID..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualInput.trim()) {
                  onScan(manualInput);
                }
              }}
            />
            <button 
              onClick={() => { if(manualInput.trim()) onScan(manualInput); }}
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Scan
            </button>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
        </div>
      </div>
    </div>
  );
};
