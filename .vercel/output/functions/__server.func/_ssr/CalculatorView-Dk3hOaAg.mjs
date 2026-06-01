import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Calculator, I as Image$1, a5 as Upload, t as LoaderCircle, m as CircleAlert, g as Check, p as Copy } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const EXCHANGE_RATE = 1180;
const PROMO_MULTIPLIER = 0.6;
let workerPromise = null;
const getWorker = () => {
  if (!workerPromise) {
    workerPromise = import("../_libs/tesseract.js.mjs").then(function(n) {
      return n.i;
    }).then(
      ({ default: Tesseract }) => Tesseract.createWorker("eng")
    );
  }
  return workerPromise;
};
function CalculatorView() {
  const [activeTab, setActiveTab] = reactExports.useState("auto");
  reactExports.useEffect(() => {
    getWorker().catch(console.error);
  }, []);
  const [manualRetail, setManualRetail] = reactExports.useState("");
  const [manualPromo, setManualPromo] = reactExports.useState("");
  const [manualItems, setManualItems] = reactExports.useState("");
  const [autoImage, setAutoImage] = reactExports.useState(null);
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [autoRetail, setAutoRetail] = reactExports.useState(null);
  const [autoPromo, setAutoPromo] = reactExports.useState(null);
  const [autoItems, setAutoItems] = reactExports.useState(null);
  const [autoError, setAutoError] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const calculateResults = (retail, promo) => {
    const adjustedPromo = promo * PROMO_MULTIPLIER;
    const totalUsd = retail - adjustedPromo;
    const totalIqd = totalUsd * EXCHANGE_RATE;
    return {
      adjustedPromo,
      totalUsd: Math.max(0, totalUsd),
      totalIqd: Math.max(0, totalIqd)
    };
  };
  const processImage = async (file) => {
    try {
      setIsProcessing(true);
      setAutoError(null);
      const imgObj = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = URL.createObjectURL(file);
      });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      const scale = Math.min(1, 800 / imgObj.width);
      canvas.width = imgObj.width * scale;
      canvas.height = imgObj.height * scale;
      ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const isText = lum < 160 || r > 150 && g < 140 && b < 100;
        const val = isText ? 0 : 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 1);
      const worker = await getWorker();
      const result = await worker.recognize(dataUrl);
      const text = result.data.text;
      let extractedRetail = 0;
      let extractedPromo = 0;
      let extractedEstimated = 0;
      let extractedItems = 0;
      const itemsMatch1 = text.match(/(?:Cart|Checkout)\s*\(\s*(\d+)\s*\)/i);
      const itemsMatch2 = text.match(/(\d+)\s*item(?:s|\(s\))/i);
      if (itemsMatch1) {
        extractedItems = parseInt(itemsMatch1[1], 10);
      } else if (itemsMatch2) {
        extractedItems = parseInt(itemsMatch2[1], 10);
      }
      const normalizedText = text.replace(/\n/g, " ").replace(/\s+/g, " ");
      const parsePrice = (str) => {
        const cleaned = str.replace(/\s/g, "");
        const standardized = cleaned.replace(/[,.](?=\d{2}$)/, ".").replace(/,(?=\d{3})/g, "");
        return parseFloat(standardized) || 0;
      };
      const retailMatch = normalizedText.match(/Retail[^\d]*?([\d,]+[\.,]\s?[\d]{2})/i);
      if (retailMatch) extractedRetail = parsePrice(retailMatch[1]);
      const promoMatch = normalizedText.match(/Promotions?[^\d]*?(?:-)?\s*(?:\$)?\s*([\d,]+[\.,]\s?[\d]{2})/i);
      if (promoMatch) extractedPromo = parsePrice(promoMatch[1]);
      if (!extractedPromo) {
        const savedMatch = normalizedText.match(/Saved[^\d]*?([\d,]+[\.,]\s?[\d]{2})/i);
        if (savedMatch) extractedPromo = parsePrice(savedMatch[1]);
      }
      if (!extractedPromo) {
        const minusMatch = normalizedText.match(/-\s*\$?\s*([\d,]+[\.,]\s?[\d]{2})/);
        if (minusMatch) extractedPromo = parsePrice(minusMatch[1]);
      }
      const estMatch = normalizedText.match(/(?:Estimated|Total)[^\d]*?([\d,]+[\.,]\s?[\d]{2})/i);
      if (estMatch) extractedEstimated = parsePrice(estMatch[1]);
      if (!extractedPromo && extractedRetail && extractedEstimated && extractedRetail > extractedEstimated) {
        extractedPromo = extractedRetail - extractedEstimated;
      }
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
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e2) => {
      setAutoImage(e2.target?.result);
    };
    reader.readAsDataURL(file);
    processImage(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAutoImage(event.target?.result);
      };
      reader.readAsDataURL(file);
      processImage(file);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-full bg-gray-100 flex sm:items-start justify-center sm:p-4 font-sans text-gray-900 rounded-xl overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-white sm:rounded-3xl sm:shadow-lg overflow-hidden flex flex-col relative sm:border-[8px] sm:border-gray-800", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-800 text-white pt-8 pb-6 px-6 relative overflow-hidden shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold tracking-tight", children: "Price Calc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "w-5 h-5 text-gray-400" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pt-6 pb-4 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex p-1 bg-gray-100/80 rounded-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("auto"),
          className: `flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "auto" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "w-4 h-4" }),
            "Scan"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("manual"),
          className: `flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "manual" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "w-4 h-4" }),
            "Manual"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-6 pb-24", children: [
      activeTab === "auto" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: !autoImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 text-center hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[220px]",
          onClick: () => fileInputRef.current?.click(),
          onDragOver: (e) => e.preventDefault(),
          onDrop: handleDrop,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-1", children: "Upload Cart Image" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 max-w-xs mx-auto text-xs", children: "Auto-detects retail price and promos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                className: "hidden",
                ref: fileInputRef,
                accept: "image/*",
                onChange: handleImageUpload
              }
            )
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-[200px] flex items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: autoImage,
              alt: "Uploaded cart",
              className: "w-full h-auto object-cover max-h-[200px]"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setAutoImage(null);
                setAutoRetail(null);
                setAutoPromo(null);
                setAutoItems(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              },
              className: "absolute top-3 right-3 bg-gray-900/80 backdrop-blur text-white shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-900 transition-colors",
              children: "Use Different Image"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: isProcessing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "flex flex-col items-center justify-center py-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-gray-900 animate-spin mb-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 font-medium text-xs", children: "Scanning image..." })
            ]
          },
          "processing"
        ) : autoError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "flex flex-col items-center justify-center py-6 text-red-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-8 h-8 mb-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-center text-xs", children: autoError })
            ]
          },
          "error"
        ) : autoRetail !== null && autoPromo !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            className: "space-y-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 items-center pb-4 border-b border-gray-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold block", children: "Retail" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 text-gray-400 font-medium", children: "$" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        value: autoRetail || "",
                        onChange: (e) => setAutoRetail(parseFloat(e.target.value) || 0),
                        className: "w-full pl-3 py-1 text-base font-bold bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-gray-900 outline-none text-gray-900 transition-colors"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold block", children: "Promo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 text-red-400 font-medium", children: "$" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        value: autoPromo || "",
                        onChange: (e) => setAutoPromo(parseFloat(e.target.value) || 0),
                        className: "w-full pl-3 py-1 text-base font-bold bg-transparent border-b-2 border-transparent hover:border-red-200 focus:border-red-500 outline-none text-red-500 transition-colors"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ResultDisplay,
                {
                  retail: autoRetail,
                  promo: autoPromo,
                  items: autoItems || 0,
                  setItems: (v) => setAutoItems(v),
                  calcResult: calculateResults(autoRetail, autoPromo)
                }
              )
            ]
          },
          "results"
        ) : null }) })
      ] }) }),
      activeTab === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Retail Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 text-gray-400 font-medium text-lg", children: "$" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  value: manualRetail,
                  onChange: (e) => setManualRetail(e.target.value),
                  placeholder: "0.00",
                  className: "w-full pl-5 pr-4 py-2 text-xl font-bold bg-transparent border-none focus:ring-0 outline-none text-gray-900 placeholder:text-gray-300"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Promotion Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 text-gray-400 font-medium text-lg", children: "$" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  value: manualPromo,
                  onChange: (e) => setManualPromo(e.target.value),
                  placeholder: "0.00",
                  className: "w-full pl-5 pr-4 py-2 text-xl font-bold bg-transparent border-none focus:ring-0 outline-none text-gray-900 placeholder:text-gray-300"
                }
              )
            ] })
          ] })
        ] }),
        manualRetail && manualPromo ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ResultDisplay,
          {
            retail: parseFloat(manualRetail) || 0,
            promo: parseFloat(manualPromo) || 0,
            items: parseInt(manualItems) || 0,
            setItems: (v) => setManualItems(v.toString()),
            calcResult: calculateResults(parseFloat(manualRetail) || 0, parseFloat(manualPromo) || 0)
          }
        ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-gray-400 text-sm", children: "Enter both values to calculate" })
      ] })
    ] })
  ] }) });
}
function ResultDisplay({
  retail,
  promo,
  items,
  setItems,
  calcResult
}) {
  const [copied, setCopied] = reactExports.useState(false);
  const [lang, setLang] = reactExports.useState("ku");
  const generateMessage = () => {
    const usd = calcResult.totalUsd.toFixed(2);
    const iqd = calcResult.totalIqd.toLocaleString(void 0, { maximumFractionDigits: 0 });
    const freeShip = calcResult.totalIqd >= 118e3;
    if (lang === "ar") {
      let msg2 = `حضرتك القطع التي أرسلتها سعرها الإجمالي $${usd}
`;
      msg2 += `أي ما يعادل ${iqd} دينار عراقي

`;
      msg2 += `عدد القطع ${items || 0}

`;
      msg2 += `بدون أي إضافات والدولار محسوب على 118 لحضرتك`;
      if (freeShip) {
        msg2 += `
كما أن التوصيل سيكون مجاناً لحضرتك`;
      }
      return msg2;
    }
    let msg = `بەرێزم ئەو پارچانەی ناردووتانە نرخی هەمووەی $${usd}
`;
    msg += `کە دەکاتە ${iqd} IQD

`;
    msg += `ژمارەی پارچەکان ${items || 0}

`;
    msg += `بەبێ ئەوەی هیچ زیادەیەکی بچیتە سەر و دۆلاریش بە 118 هەژمار کراوە بۆتان`;
    if (freeShip) {
      msg += `
هەروەها گەیاندنەکەش دەبیتە خۆرایی لەبۆتان`;
    }
    return msg;
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-[10px] text-gray-500 font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] text-gray-500 font-semibold uppercase tracking-wider block", children: "Cart Items" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            value: items || "",
            onChange: (e) => setItems(parseInt(e.target.value) || 0),
            className: "w-16 bg-white border border-gray-200 rounded px-2 py-1 text-right font-semibold text-gray-900 outline-none focus:border-gray-900 transition-colors",
            placeholder: "0"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Actual Promo (",
          promo,
          " × ",
          PROMO_MULTIPLIER,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-900", children: [
          "-$",
          calcResult.adjustedPromo.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Formula" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-gray-400", children: [
          retail,
          " - ",
          calcResult.adjustedPromo.toFixed(2)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-900 text-white rounded-2xl p-3 shadow-lg shadow-gray-900/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-gray-400 text-[10px] uppercase tracking-wider font-semibold mb-1", children: "USD Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold tracking-tight", children: [
          "$",
          calcResult.totalUsd.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#12B76A] text-white rounded-2xl p-3 shadow-lg shadow-[#12B76A]/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[#D1FADF] text-[10px] uppercase tracking-wider font-semibold mb-1", children: "IQD Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold tracking-tight truncate", children: calcResult.totalIqd.toLocaleString(void 0, { maximumFractionDigits: 0 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 border-t border-gray-100 pt-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-bold text-gray-900", children: "Customer Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex p-0.5 bg-gray-100 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setLang("ku"),
                className: `px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${lang === "ku" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`,
                children: "کوردی"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setLang("ar"),
                className: `px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${lang === "ar" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`,
                children: "عربي"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleCopy,
              className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: [
                copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3 h-3" }),
                copied ? "Copied!" : "Copy"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-medium leading-relaxed font-sans cursor-pointer hover:bg-gray-100 transition-colors whitespace-pre-wrap border border-gray-100 text-right",
          onClick: handleCopy,
          dir: "rtl",
          children: generateMessage()
        }
      )
    ] })
  ] });
}
export {
  CalculatorView as default
};
