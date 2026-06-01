import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster, t as toast } from "../_libs/sonner.mjs";
import { d as cn } from "./use-toast-CUyDYyz5.mjs";
import "../_libs/firebase__firestore.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__storage.mjs";
import { B as Banknote, V as Settings, Q as Plus, b as ArrowRight, n as CircleCheck, p as Copy, m as CircleAlert } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__component.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/idb.mjs";
import "../_libs/firebase__webchannel-wrapper.mjs";
import "../_libs/@grpc/grpc-js.mjs";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "http2";
import "dns";
import "../_libs/@grpc/proto-loader.mjs";
import "path";
import "../_libs/lodash.camelcase.mjs";
import "../_libs/protobufjs.mjs";
import "../_libs/protobufjs__aspromise.mjs";
import "../_libs/protobufjs__base64.mjs";
import "../_libs/protobufjs__eventemitter.mjs";
import "../_libs/protobufjs__float.mjs";
import "../_libs/@protobufjs/inquire.mjs";
import "../_libs/protobufjs__utf8.mjs";
import "../_libs/protobufjs__pool.mjs";
import "../_libs/long.mjs";
import "../_libs/protobufjs__codegen.mjs";
import "../_libs/protobufjs__fetch.mjs";
import "../_libs/protobufjs__path.mjs";
import "http";
import "url";
import "zlib";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const SCRIPT_CODE = `// Configuration: Change these variables each month!
var TARGET_COLUMN = "H"; // e.g. "H" for this month, "I" for next month
var START_ROW = 5;
var END_ROW = 25;

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var amount = e.parameter.amount;
  
  if (!amount) {
    return ContentService.createTextOutput("Error: No amount");
  }
  
  // Look for the first empty cell in the target range
  for (var row = START_ROW; row <= END_ROW; row++) {
    var cell = sheet.getRange(TARGET_COLUMN + row);
    if (cell.isBlank() || cell.getValue() === "") {
      cell.setValue(amount);
      return ContentService.createTextOutput("Success");
    }
  }
  
  return ContentService.createTextOutput("Error: Range is full");
}`;
function ExpensesView() {
  const [view, setView] = reactExports.useState("input");
  const [webhookUrl, setWebhookUrl] = reactExports.useState("https://script.google.com/macros/s/AKfycbxH9QSkC7roqWQ-rkKXvdqXVeDywrMJYDzdvJtbYNAD_sNJykxSpCt2JiEyJ267rlyv/exec");
  const [history, setHistory] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const savedUrl = localStorage.getItem("sheet-webhook-url");
    if (savedUrl) setWebhookUrl(savedUrl);
    const savedHistory = localStorage.getItem("expense-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
      }
    }
  }, []);
  reactExports.useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("expense-history", JSON.stringify(history.slice(0, 50)));
    }
  }, [history]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full min-h-[calc(100vh-120px)] flex flex-col max-w-md mx-auto bg-[#FAF9F6] text-[#3D3D3D] font-sans sm:shadow-sm sm:border-x border-[#EFEBE0] rounded-2xl overflow-hidden mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-6 py-6 flex items-center justify-between z-10 sticky top-0 bg-[#FAF9F6] sm:bg-transparent border-b border-[#EFEBE0]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-[#8FA998] w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight text-[#2C3639]", children: "Expenses (Masrufat)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8FA998] font-medium hidden sm:block", children: "Connected to Google Sheets" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setView(view === "input" ? "settings" : "input"),
          className: "p-2 -mr-2 rounded-full hover:bg-[#EFEBE0] text-[#7B8B6F] transition-colors",
          children: view === "input" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 22 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 24 })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-y-auto px-6 pb-6 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: view === "input" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.2 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ExpenseForm,
            {
              webhookUrl,
              onRequireSettings: () => setView("settings"),
              onSave: (record) => setHistory((prev) => [record, ...prev])
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecentHistory, { history })
        ] })
      },
      "input"
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.2 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SettingsPage,
          {
            webhookUrl,
            onSaveUrl: (url) => {
              setWebhookUrl(url);
              localStorage.setItem("sheet-webhook-url", url);
              toast.success("Webhook URL saved");
            }
          }
        ) })
      },
      "settings"
    ) }) })
  ] });
}
function ExpenseForm({
  webhookUrl,
  onRequireSettings,
  onSave
}) {
  const [amount, setAmount] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!webhookUrl) {
      toast("Almost there!", {
        description: "You need to connect your Google Sheet first.",
        action: { label: "Setup", onClick: onRequireSettings }
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append("amount", amount);
      await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      toast.success("Saved to Google Sheet!");
      onSave({
        id: Math.random().toString(36).substring(7),
        amount,
        date: (/* @__PURE__ */ new Date()).toISOString()
      });
      setAmount("");
    } catch (err) {
      toast.error("Failed to save. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col space-y-8 bg-white rounded-[32px] shadow-sm border border-[#EFEBE0] p-8 mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-[#A5A58D] uppercase tracking-widest mb-3", children: "Transaction Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-[#A5A58D]", children: "IQD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            step: "1",
            inputMode: "decimal",
            autoFocus: true,
            value: amount,
            onChange: (e) => setAmount(e.target.value),
            placeholder: "0",
            className: "w-full pl-16 py-2 text-6xl font-light border-b-2 border-[#E9EED9] focus:outline-none focus:border-[#8FA998] transition-colors placeholder:text-gray-200 bg-transparent text-[#3D3D3D]"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "submit",
        disabled: isSubmitting || !amount,
        className: cn(
          "w-full py-6 rounded-2xl flex items-center justify-center space-x-3 text-white text-xl font-bold transition-all active:scale-[0.98]",
          isSubmitting || !amount ? "bg-[#A5A58D] cursor-not-allowed opacity-70" : "bg-[#8FA998] hover:bg-[#7D9686] shadow-lg shadow-[#8FA99833]"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isSubmitting ? "Syncing..." : "Sync to Sheet" }),
          !isSubmitting && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 24 })
        ]
      }
    )
  ] });
}
function RecentHistory({ history }) {
  if (history.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex-1 bg-white rounded-[32px] p-6 border border-[#EFEBE0] flex flex-col shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-[#A5A58D] uppercase tracking-widest mb-4", children: "Last 5 Syncs (Local)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: history.slice(0, 5).map((record) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm text-[#3D3D3D]", children: [
        new Date(record.date).toLocaleDateString(),
        " ",
        new Date(record.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#6B8E23] font-bold", children: [
        record.amount,
        " IQD"
      ] })
    ] }, record.id)) })
  ] });
}
function SettingsPage({
  webhookUrl,
  onSaveUrl
}) {
  const [urlInput, setUrlInput] = reactExports.useState(webhookUrl);
  const [copied, setCopied] = reactExports.useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(SCRIPT_CODE);
    setCopied(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(false), 2e3);
  }
  function handleSave(e) {
    e.preventDefault();
    if (urlInput && !urlInput.startsWith("https://script.google.com/macros/s/")) {
      toast.error("URL should start with https://script.google.com...");
      return;
    }
    onSaveUrl(urlInput);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 pb-12 bg-white rounded-[32px] shadow-sm border border-[#EFEBE0] p-8 mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight text-[#2C3639] mb-2", children: "Setup Guide" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#A5A58D] text-sm leading-relaxed font-medium", children: "Link this app to any Google Sheet. You only need to do this once. Follow the steps below to generate a connection URL." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-[#F8F9F3] p-5 rounded-2xl border border-[#E9EED9]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#8FA998] text-white font-bold mr-4 shadow-sm", children: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-[#3D3D3D] mb-1", children: "Create a Sheet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#7B8B6F]", children: "Go to your Google Sheet. Identify the column you want to fill this month (e.g., column H)." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-[#F8F9F3] p-5 rounded-2xl border border-[#E9EED9]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#8FA998] text-white font-bold mr-4 shadow-sm", children: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-[#3D3D3D] mb-1", children: "Add Google Apps Script" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[#7B8B6F] mb-3", children: [
            "In your sheet menu, click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Extensions > Apps Script" }),
            ". Delete any existing code and paste this:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-[#2C3639] text-[#EFEBE0] p-4 rounded-xl text-xs overflow-x-auto shadow-inner", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: SCRIPT_CODE }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleCopy,
                className: "absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors",
                title: "Copy script",
                children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-[#8FA998]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-[#F8F9F3] p-5 rounded-2xl border border-[#E9EED9]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#8FA998] text-white font-bold mr-4 shadow-sm", children: "3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-[#3D3D3D] mb-1", children: "Deploy as Web App" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[#7B8B6F]", children: [
            "Click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Deploy > New deployment" }),
            " (top right of Apps Script).",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Select type ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Web app" }),
            ".",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            'Set "Who has access" to ',
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Anyone" }),
            ".",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Deploy" }),
            " and copy the resulting Web app URL."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-start space-x-2 text-[#7B8B6F] bg-white p-3 rounded-xl border border-[#E9EED9] text-sm shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 16, className: "mt-0.5 flex-shrink-0 text-[#A5A58D]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'Google will ask you to review permissions. It will warn you that the app is unverified. Click "Advanced" > "Go to app (unsafe)" to allow it to edit your sheet.' })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "flex flex-col bg-white p-5 rounded-2xl border-2 border-[#8FA998] shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#8FA998] text-white font-bold mr-4 shadow-sm", children: "4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-[#3D3D3D]", children: "Paste your Web app URL" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: urlInput,
              onChange: (e) => setUrlInput(e.target.value),
              placeholder: "https://script.google.com/macros/s/...",
              className: "w-full px-4 py-3 bg-[#F8F9F3] border border-[#E9EED9] rounded-xl text-sm focus:outline-none focus:border-[#8FA998] text-[#3D3D3D] transition-colors mb-3"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "bg-[#8FA998] hover:bg-[#7D9686] text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-sm",
              children: "Save URL & Connection"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  ExpensesView as default
};
