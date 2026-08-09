import React, { useState, useRef, useEffect } from "react";
import type { Worker } from "tesseract.js";
import {
  Calculator,
  Image as ImageIcon,
  Loader2,
  Upload,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const EXCHANGE_RATE = 1180; // 1 USD = 1180 IQD (based on user's 100 -> 118,000)
const PROMO_MULTIPLIER = 0.6;

// Pre-initialize Tesseract worker to speed up subsequent scans
let workerPromise: Promise<Worker> | null = null;
const getWorker = () => {
  if (!workerPromise) {
    workerPromise = import("tesseract.js").then(({ default: Tesseract }) =>
      Tesseract.createWorker("eng"),
    );
  }
  return workerPromise;
};

export default function CalculatorView() {
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("auto");

  // Preload worker on component mount
  useEffect(() => {
    getWorker().catch(console.error);
  }, []);

  // Manual State
  const [manualRetail, setManualRetail] = useState<string>("");
  const [manualPromo, setManualPromo] = useState<string>("");
  const [manualItems, setManualItems] = useState<string>("");

  // Auto State
  const [autoImage, setAutoImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoRetail, setAutoRetail] = useState<number | null>(null);
  const [autoPromo, setAutoPromo] = useState<number | null>(null);
  const [autoItems, setAutoItems] = useState<number | null>(null);
  const [autoError, setAutoError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateResults = (retail: number, promo: number) => {
    const adjustedPromo = promo * PROMO_MULTIPLIER;
    const totalUsd = retail - adjustedPromo;
    const totalIqd = totalUsd * EXCHANGE_RATE;

    return {
      adjustedPromo,
      totalUsd: Math.max(0, totalUsd),
      totalIqd: Math.max(0, totalIqd),
    };
  };

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setAutoError(null);

      // 1. Resize Image and Enhance Orange/Dark text
      const imgObj = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = URL.createObjectURL(file);
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");

      // Scale to max width of 800px to speed up OCR while maintaining readability
      const scale = Math.min(1, 800 / imgObj.width);
      canvas.width = imgObj.width * scale;
      canvas.height = imgObj.height * scale;
      ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

      // Binarize image: Make Orange/Red text & Dark text Pitch Black for better OCR
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        // Dark text OR Orange/Red text (High Red, lower Blue)
        const isText = lum < 160 || (r > 150 && g < 140 && b < 100);
        const val = isText ? 0 : 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 1.0);

      // 2. Perform OCR
      const worker = await getWorker();
      const result = await worker.recognize(dataUrl);
      const text = result.data.text;

      // 3. Extract Data Smartly
      let extractedRetail = 0;
      let extractedPromo = 0;
      let extractedEstimated = 0;
      let extractedItems = 0;

      // Extract Items count
      const itemsMatch1 = text.match(/(?:Cart|Checkout)\s*\(\s*(\d+)\s*\)/i);
      const itemsMatch2 = text.match(/(\d+)\s*item(?:s|\(s\))/i);
      if (itemsMatch1) {
        extractedItems = parseInt(itemsMatch1[1], 10);
      } else if (itemsMatch2) {
        extractedItems = parseInt(itemsMatch2[1], 10);
      }

      // Clean text into single line without massive gaps
      const normalizedText = text.replace(/\n/g, " ").replace(/\s+/g, " ");

      const parsePrice = (str: string) => {
        const cleaned = str.replace(/\s/g, "");
        const standardized = cleaned.replace(/[,.](?=\d{2}$)/, ".").replace(/,(?=\d{3})/g, "");
        return parseFloat(standardized) || 0;
      };

      // Find Retail Price
      const retailMatch = normalizedText.match(/Retail[^\d]*?([\d,]+[.,]\s?[\d]{2})/i);
      if (retailMatch) extractedRetail = parsePrice(retailMatch[1]);

      // Find Promotion
      const promoMatch = normalizedText.match(
        /Promotions?[^\d]*?(?:-)?\s*(?:\$)?\s*([\d,]+[.,]\s?[\d]{2})/i,
      );
      if (promoMatch) extractedPromo = parsePrice(promoMatch[1]);

      // If Promo missing, find 'Saved'
      if (!extractedPromo) {
        const savedMatch = normalizedText.match(/Saved[^\d]*?([\d,]+[.,]\s?[\d]{2})/i);
        if (savedMatch) extractedPromo = parsePrice(savedMatch[1]);
      }

      // If Promo missing, find Negative Number
      if (!extractedPromo) {
        const minusMatch = normalizedText.match(/-\s*\$?\s*([\d,]+[.,]\s?[\d]{2})/);
        if (minusMatch) extractedPromo = parsePrice(minusMatch[1]);
      }

      // Find Estimated Price
      const estMatch = normalizedText.match(/(?:Estimated|Total)[^\d]*?([\d,]+[.,]\s?[\d]{2})/i);
      if (estMatch) extractedEstimated = parsePrice(estMatch[1]);

      // Fallback inference cleanly (safeguards against putting estimated into promo)
      if (
        !extractedPromo &&
        extractedRetail &&
        extractedEstimated &&
        extractedRetail > extractedEstimated
      ) {
        extractedPromo = extractedRetail - extractedEstimated;
      }

      // Fix floating point precision
      extractedRetail = parseFloat(extractedRetail.toFixed(2));
      extractedPromo = parseFloat(extractedPromo.toFixed(2));

      if (!extractedRetail && !extractedPromo) {
        setAutoError("Could not clearly read the prices. Please use Manual Mode.");
        return;
      }

      setAutoRetail(extractedRetail);
      setAutoPromo(extractedPromo);
      setAutoItems(extractedItems || 0);
    } catch (err) {
      console.error(err);
      setAutoError("Failed to process image. Please try again or use manual mode.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setAutoImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    processImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAutoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      processImage(file);
    }
  };

  return (
    <div className="min-h-full bg-gray-100 flex sm:items-start justify-center sm:p-4 font-sans text-gray-900 rounded-xl overflow-y-auto">
      <div className="w-full max-w-md bg-white sm:rounded-3xl sm:shadow-lg overflow-hidden flex flex-col relative sm:border-[8px] sm:border-gray-800">
        {/* Header */}
        <div className="bg-gray-800 text-white pt-8 pb-6 px-6 relative overflow-hidden shrink-0">
          <div className="relative z-10 flex justify-between items-center">
            <h1 className="text-lg font-bold tracking-tight">Price Calc</h1>
            <Calculator className="w-5 h-5 text-gray-400" />
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Segmented Control */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex p-1 bg-gray-100/80 rounded-xl">
            <button
              onClick={() => setActiveTab("auto")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "auto"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Scan
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "manual"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Calculator className="w-4 h-4" />
              Manual
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          {/* Automatic Tab */}
          {activeTab === "auto" && (
            <div className="space-y-6">
              {!autoImage ? (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 text-center hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[220px]"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Upload Cart Image</h3>
                  <p className="text-gray-500 max-w-xs mx-auto text-xs">
                    Auto-detects retail price and promos
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Preview & Reset */}
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-[200px] flex items-center justify-center">
                    <img
                      src={autoImage}
                      alt="Uploaded cart"
                      className="w-full h-auto object-cover max-h-[200px]"
                    />
                    <button
                      onClick={() => {
                        setAutoImage(null);
                        setAutoRetail(null);
                        setAutoPromo(null);
                        setAutoItems(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur text-white shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-900 transition-colors"
                    >
                      Use Different Image
                    </button>
                  </div>

                  {/* Results or Processing */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-5">
                    <AnimatePresence mode="wait">
                      {isProcessing ? (
                        <motion.div
                          key="processing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center py-6"
                        >
                          <Loader2 className="w-8 h-8 text-gray-900 animate-spin mb-3" />
                          <p className="text-gray-500 font-medium text-xs">Scanning image...</p>
                        </motion.div>
                      ) : autoError ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center py-6 text-red-500"
                        >
                          <AlertCircle className="w-8 h-8 mb-3" />
                          <p className="font-medium text-center text-xs">{autoError}</p>
                        </motion.div>
                      ) : autoRetail !== null && autoPromo !== null ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-5"
                        >
                          <div className="flex gap-4 items-center pb-4 border-b border-gray-100">
                            <div className="flex-1">
                              <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold block">
                                Retail
                              </label>
                              <div className="relative flex items-center">
                                <span className="absolute left-0 text-gray-400 font-medium">$</span>
                                <input
                                  type="number"
                                  value={autoRetail || ""}
                                  onChange={(e) => setAutoRetail(parseFloat(e.target.value) || 0)}
                                  className="w-full pl-3 py-1 text-base font-bold bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-gray-900 outline-none text-gray-900 transition-colors"
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold block">
                                Promo
                              </label>
                              <div className="relative flex items-center">
                                <span className="absolute left-0 text-red-400 font-medium">$</span>
                                <input
                                  type="number"
                                  value={autoPromo || ""}
                                  onChange={(e) => setAutoPromo(parseFloat(e.target.value) || 0)}
                                  className="w-full pl-3 py-1 text-base font-bold bg-transparent border-b-2 border-transparent hover:border-red-200 focus:border-red-500 outline-none text-red-500 transition-colors"
                                />
                              </div>
                            </div>
                          </div>

                          <ResultDisplay
                            retail={autoRetail}
                            promo={autoPromo}
                            items={autoItems || 0}
                            setItems={(v) => setAutoItems(v)}
                            calcResult={calculateResults(autoRetail, autoPromo)}
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === "manual" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Retail Price
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-0 text-gray-400 font-medium text-lg">$</span>
                    <input
                      type="number"
                      value={manualRetail}
                      onChange={(e) => setManualRetail(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-5 pr-4 py-2 text-xl font-bold bg-transparent border-none focus:ring-0 outline-none text-gray-900 placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Promotion Value
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-0 text-gray-400 font-medium text-lg">$</span>
                    <input
                      type="number"
                      value={manualPromo}
                      onChange={(e) => setManualPromo(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-5 pr-4 py-2 text-xl font-bold bg-transparent border-none focus:ring-0 outline-none text-gray-900 placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>

              {manualRetail && manualPromo ? (
                <div className="pt-2">
                  <ResultDisplay
                    retail={parseFloat(manualRetail) || 0}
                    promo={parseFloat(manualPromo) || 0}
                    items={parseInt(manualItems) || 0}
                    setItems={(v) => setManualItems(v.toString())}
                    calcResult={calculateResults(
                      parseFloat(manualRetail) || 0,
                      parseFloat(manualPromo) || 0,
                    )}
                  />
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Enter both values to calculate
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultDisplay({
  retail,
  promo,
  items,
  setItems,
  calcResult,
}: {
  retail: number;
  promo: number;
  items: number;
  setItems: (val: number) => void;
  calcResult: { adjustedPromo: number; totalUsd: number; totalIqd: number };
}) {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"ku" | "ar">("ku");

  const generateMessage = () => {
    const iqd = calcResult.totalIqd.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const freeShip = calcResult.totalIqd > 118000;

    if (lang === "ar") {
      // The total in dinars only. It used to lead with the dollar figure and repeat it
      // in dinars underneath — dinars are what the customer actually pays.
      let msg = `حضرتك القطع التي أرسلتها سعرها الإجمالي ${iqd} دينار عراقي\n\n`;
      msg += `عدد القطع ${items || 0}\n\n`;
      msg += `بدون أي إضافات والدولار محسوب على 118 لحضرتك`;
      if (freeShip) {
        msg += `\nكما أن التوصيل سيكون مجاناً لحضرتك`;
      }
      return msg;
    }

    let msg = `بەرێزم ئەو پارچانەی ناردووتانە نرخی هەمووەی ${iqd} IQD\n\n`;
    msg += `ژمارەی پارچەکان ${items || 0}\n\n`;
    msg += `بەبێ ئەوەی هیچ زیادەیەکی بچیتە سەر و دۆلاریش بە 118 هەژمار کراوە بۆتان`;
    if (freeShip) {
      msg += `\nهەروەها گەیاندنەکەش دەبیتە خۆرایی لەبۆتان`;
    }
    return msg;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Calculation Breakdown */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-[10px] text-gray-500 font-medium">
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
            Cart Items
          </label>
          <input
            type="number"
            value={items || ""}
            onChange={(e) => setItems(parseInt(e.target.value) || 0)}
            className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-right font-semibold text-gray-900 outline-none focus:border-gray-900 transition-colors"
            placeholder="0"
          />
        </div>
        <div className="flex justify-between">
          <span>
            Actual Promo ({promo} &times; {PROMO_MULTIPLIER})
          </span>
          <span className="text-gray-900">-${calcResult.adjustedPromo.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Formula</span>
          <span className="font-mono text-gray-400">
            {retail} - {calcResult.adjustedPromo.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-900 text-white rounded-2xl p-3 shadow-lg shadow-gray-900/20">
          <h4 className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-1">
            USD Total
          </h4>
          <div className="text-xl font-bold tracking-tight">${calcResult.totalUsd.toFixed(2)}</div>
        </div>
        <div className="bg-[#12B76A] text-white rounded-2xl p-3 shadow-lg shadow-[#12B76A]/20">
          <h4 className="text-[#D1FADF] text-[10px] uppercase tracking-wider font-semibold mb-1">
            IQD Total
          </h4>
          <div className="text-lg font-bold tracking-tight truncate">
            {calcResult.totalIqd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Copy Message Support */}
      <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900">Customer Message</h4>
          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-gray-100 rounded-lg">
              <button
                onClick={() => setLang("ku")}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${lang === "ku" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
              >
                کوردی
              </button>
              <button
                onClick={() => setLang("ar")}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${lang === "ar" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
              >
                عربي
              </button>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div
          className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-medium leading-relaxed font-sans cursor-pointer hover:bg-gray-100 transition-colors whitespace-pre-wrap border border-gray-100 text-right"
          onClick={handleCopy}
          dir="rtl"
        >
          {generateMessage()}
        </div>
      </div>
    </div>
  );
}
