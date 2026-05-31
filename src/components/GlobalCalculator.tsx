import React, { useState, useEffect } from 'react';
import type { Worker } from 'tesseract.js';
import { Calculator, Image as ImageIcon, Loader2, Upload, AlertCircle, Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculatorStore, CalculatorState } from '@/lib/calculatorStore';

const EXCHANGE_RATE = 1180;
const PROMO_MULTIPLIER = 0.6;

let workerPromise: Promise<Worker> | null = null;
const getWorker = () => {
  if (!workerPromise) {
    workerPromise = import('tesseract.js').then(({ default: Tesseract }) =>
      Tesseract.createWorker('eng')
    );
  }
  return workerPromise;
};

export function GlobalCalculatorButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-xl transition-shadow"
        title="Open Calculator"
      >
        <Calculator size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <GlobalCalculator onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

interface GlobalCalculatorProps {
  onClose: () => void;
}

export function GlobalCalculator({ onClose }: GlobalCalculatorProps) {
  const initialState = calculatorStore.getState();
  const [state, setState] = useState<CalculatorState>({ 
    ...initialState, 
    activeTab: 'auto' // Always start on auto/image upload tab
  });
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleStateChange = (e: CustomEvent) => {
      setState(prev => ({ ...e.detail, activeTab: 'auto' })); // Keep on auto tab
    };
    window.addEventListener('calculator-state-changed', handleStateChange as EventListener);
    getWorker().catch(console.error);
    return () => {
      window.removeEventListener('calculator-state-changed', handleStateChange as EventListener);
    };
  }, []);

  const updateState = (updates: Partial<CalculatorState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    calculatorStore.setState(newState);
  };

  const calculateResults = (retail: number, promo: number) => {
    const adjustedPromo = promo * PROMO_MULTIPLIER;
    const totalUsd = retail - adjustedPromo;
    const totalIqd = totalUsd * EXCHANGE_RATE;
    
    return {
      adjustedPromo,
      totalUsd: Math.max(0, totalUsd),
      totalIqd: Math.max(0, totalIqd)
    };
  };

  const processImage = async (file: File) => {
    try {
      updateState({ autoRetail: null, autoPromo: null, autoItems: null });
      
      const imgObj = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = URL.createObjectURL(file);
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("No canvas context");
      
      const scale = Math.min(1, 800 / imgObj.width);
      canvas.width = imgObj.width * scale;
      canvas.height = imgObj.height * scale;
      ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const isText = lum < 160 || (r > 150 && g < 140 && b < 100);
        const val = isText ? 0 : 255;
        data[i] = val;
        data[i+1] = val;
        data[i+2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

      const worker = await getWorker();
      const result = await worker.recognize(dataUrl);
      const text = result.data.text;
      
      let extractedRetail = 0;
      let extractedPromo = 0;
      let extractedItems = 0;

      const dollarMatches = text.match(/\$[\d.,]+/g) || [];
      if (dollarMatches.length >= 2) {
        extractedRetail = parseFloat(dollarMatches[0].replace(/[$,]/g, ''));
        extractedPromo = parseFloat(dollarMatches[1].replace(/[$,]/g, ''));
      }

      const numberMatches = text.match(/\d+/g) || [];
      if (numberMatches.length > 0) {
        extractedItems = parseInt(numberMatches[numberMatches.length - 1]);
      }

      const dataUrl2 = canvas.toDataURL('image/jpeg', 0.7);
      updateState({
        autoImage: dataUrl2,
        autoRetail: extractedRetail || undefined,
        autoPromo: extractedPromo || undefined,
        autoItems: extractedItems || undefined,
      });
    } catch (error) {
      console.error('Image processing error:', error);
    }
  };

  const handleManualCalculate = () => {
    const retail = parseFloat(state.manualRetail);
    const promo = parseFloat(state.manualPromo);
    if (!isNaN(retail) && !isNaN(promo)) {
      const results = calculateResults(retail, promo);
      updateState({
        autoRetail: results.totalUsd,
        autoPromo: results.adjustedPromo,
        autoItems: parseInt(state.manualItems) || undefined,
        activeTab: 'auto'
      });
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const results = state.autoRetail !== null && state.autoPromo !== null 
    ? calculateResults(state.autoRetail, state.autoPromo)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calculator size={18} /></div>
            <h2 className="text-xl font-bold">Global Calculator</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Price Calculation Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    processImage(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Upload size={16} />
                Upload Receipt Image
              </button>
              <p className="text-sm text-muted-foreground mt-2">Upload a receipt to calculate price</p>
            </div>
          </div>

          {/* Results */}
          {state.autoRetail !== null && results && (
            <div className="space-y-3 p-4 bg-secondary rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total (USD)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">${results.totalUsd.toFixed(2)}</span>
                  <button
                    onClick={() => handleCopy(results.totalUsd.toFixed(2), 'usd')}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copyFeedback === 'usd' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total (IQD)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{results.totalIqd.toLocaleString()}</span>
                  <button
                    onClick={() => handleCopy(results.totalIqd.toLocaleString(), 'iqd')}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copyFeedback === 'iqd' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
