import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Plus, 
  ArrowRight, 
  Copy, 
  CheckCircle2, 
  Banknote,
  AlertCircle,
  Clock
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/iraqi/lib/utils";

type ViewMode = "input" | "settings";

interface ExpenseRecord {
  id: string;
  amount: string;
  date: string;
}

const WEBHOOK_URL_KEY = "iraqi-sheet-webhook-url";
const EXPENSE_HISTORY_KEY = "iraqi-expense-history";

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

export default function ExpensesView() {
  const [view, setView] = useState<ViewMode>("input");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [history, setHistory] = useState<ExpenseRecord[]>([]);
  
  // Load initial state
  useEffect(() => {
    const savedUrl = localStorage.getItem(WEBHOOK_URL_KEY);
    if (savedUrl) setWebhookUrl(savedUrl);
    
    const savedHistory = localStorage.getItem(EXPENSE_HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        // ignore format errors
      }
    }
  }, []);

  // Save history change
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(EXPENSE_HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Keep last 50
    }
  }, [history]);

  return (
    <div className="h-full min-h-[calc(100vh-120px)] flex flex-col max-w-md mx-auto bg-[#FAF9F6] text-[#3D3D3D] font-sans sm:shadow-sm sm:border-x border-[#ead6d8] rounded-2xl overflow-hidden mt-4">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between z-10 sticky top-0 bg-[#FAF9F6] sm:bg-transparent border-b border-[#ead6d8]">
        <div className="flex items-center space-x-3">
          <div className="bg-[#6b0f14] w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-sm">
            <Banknote size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-[#2C3639]">
              Expenses (Masrufat)
            </h1>
            <p className="text-xs text-[#6b0f14] font-medium hidden sm:block">Connected to Google Sheets</p>
          </div>
        </div>
        <button 
          onClick={() => setView(view === "input" ? "settings" : "input")}
          className="p-2 -mr-2 rounded-full hover:bg-[#ead6d8] text-[#7f1d1d] transition-colors"
        >
          {view === "input" ? <Settings size={22} /> : <Plus size={24} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <AnimatePresence mode="wait">
          {view === "input" ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-full flex flex-col">
                <ExpenseForm 
                  webhookUrl={webhookUrl} 
                  onRequireSettings={() => setView("settings")}
                  onSave={(record) => setHistory((prev) => [record, ...prev])}
                />
                
                <RecentHistory history={history} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="">
                <SettingsPage 
                  webhookUrl={webhookUrl} 
                  onSaveUrl={(url) => {
                    setWebhookUrl(url);
                    localStorage.setItem(WEBHOOK_URL_KEY, url);
                    toast.success("Webhook URL saved");
                  }} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ExpenseForm({ 
  webhookUrl, 
  onRequireSettings,
  onSave
}: { 
  webhookUrl: string; 
  onRequireSettings: () => void;
  onSave: (val: ExpenseRecord) => void;
}) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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

      // Using mode NO-CORS prevents browser from blocking the Google redirect
      // It executes perfectly but gives an opaque response.
      await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      // Since the response is opaque, we just assume success if fetch didn't throw
      toast.success("Saved to Google Sheet!");
      
      onSave({
        id: Math.random().toString(36).substring(7),
        amount,
        date: new Date().toISOString()
      });

      // Only reset amount for faster multiple entries
      setAmount("");
    } catch (err) {
      toast.error("Failed to save. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-8 bg-white rounded-[32px] shadow-sm border border-[#ead6d8] p-8 mt-2">
      {/* Amount Input */}
      <div>
        <label className="block text-xs font-bold text-[#9f6b6e] uppercase tracking-widest mb-3">Transaction Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-[#9f6b6e]">IQD</span>
          <input
            type="number"
            step="1"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-16 py-2 text-6xl font-light border-b-2 border-[#ead6d8] focus:outline-none focus:border-[#6b0f14] transition-colors placeholder:text-gray-200 bg-transparent text-[#3D3D3D]"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !amount}
        className={cn(
          "w-full py-6 rounded-2xl flex items-center justify-center space-x-3 text-white text-xl font-bold transition-all active:scale-[0.98]",
          isSubmitting || !amount
            ? "bg-[#9f6b6e] cursor-not-allowed opacity-70"
            : "bg-[#6b0f14] hover:bg-[#5c0d11] shadow-lg shadow-[#6b0f1433]"
        )}
      >
        <span>{isSubmitting ? "Syncing..." : "Sync to Sheet"}</span>
        {!isSubmitting && <ArrowRight size={24} />}
      </button>
    </form>
  );
}

function RecentHistory({ history }: { history: ExpenseRecord[] }) {
  if (history.length === 0) return null;
  
  return (
    <div className="mt-8 flex-1 bg-white rounded-[32px] p-6 border border-[#ead6d8] flex flex-col shadow-sm">
      <h3 className="text-sm font-bold text-[#9f6b6e] uppercase tracking-widest mb-4">Last 5 Syncs (Local)</h3>
      <div className="space-y-2">
        {history.slice(0, 5).map(record => (
          <div key={record.id} className="flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-0">
            <div>
              <p className="font-semibold text-sm text-[#3D3D3D]">
                {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
            <span className="text-[#6b0f14] font-bold">{record.amount} IQD</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPage({ 
  webhookUrl, 
  onSaveUrl 
}: { 
  webhookUrl: string; 
  onSaveUrl: (url: string) => void;
}) {
  const [urlInput, setUrlInput] = useState(webhookUrl);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(SCRIPT_CODE);
    setCopied(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (urlInput && !urlInput.startsWith("https://script.google.com/macros/s/")) {
      toast.error("URL should start with https://script.google.com...");
      return;
    }
    onSaveUrl(urlInput);
  }

  return (
    <div className="space-y-8 pb-12 bg-white rounded-[32px] shadow-sm border border-[#ead6d8] p-8 mt-2">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#2C3639] mb-2">Setup Guide</h2>
        <p className="text-[#9f6b6e] text-sm leading-relaxed font-medium">
          Link this app to any Google Sheet. You only need to do this once. Follow the steps below to generate a connection URL.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="flex bg-[#fbf5f5] p-5 rounded-2xl border border-[#ead6d8]">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#6b0f14] text-white font-bold mr-4 shadow-sm">
            1
          </div>
          <div>
            <h3 className="font-bold text-[#3D3D3D] mb-1">Create a Sheet</h3>
            <p className="text-sm text-[#7f1d1d]">Go to your Google Sheet. Identify the column you want to fill this month (e.g., column H).</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex bg-[#fbf5f5] p-5 rounded-2xl border border-[#ead6d8]">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#6b0f14] text-white font-bold mr-4 shadow-sm">
            2
          </div>
          <div className="w-full">
            <h3 className="font-bold text-[#3D3D3D] mb-1">Add Google Apps Script</h3>
            <p className="text-sm text-[#7f1d1d] mb-3">
              In your sheet menu, click <b>Extensions &gt; Apps Script</b>. Delete any existing code and paste this:
            </p>
            <div className="relative group">
              <pre className="bg-[#2C3639] text-[#ead6d8] p-4 rounded-xl text-xs overflow-x-auto shadow-inner">
                <code>{SCRIPT_CODE}</code>
              </pre>
              <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Copy script"
              >
                {copied ? <CheckCircle2 size={16} className="text-[#6b0f14]" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex bg-[#fbf5f5] p-5 rounded-2xl border border-[#ead6d8]">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#6b0f14] text-white font-bold mr-4 shadow-sm">
            3
          </div>
          <div>
            <h3 className="font-bold text-[#3D3D3D] mb-1">Deploy as Web App</h3>
            <p className="text-sm text-[#7f1d1d]">
              Click <b>Deploy &gt; New deployment</b> (top right of Apps Script).<br/>
              Select type <b>Web app</b>.<br/>
              Set "Who has access" to <b>Anyone</b>.<br/>
              Click <b>Deploy</b> and copy the resulting Web app URL.
            </p>
            <div className="mt-3 flex items-start space-x-2 text-[#7f1d1d] bg-white p-3 rounded-xl border border-[#ead6d8] text-sm shadow-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-[#9f6b6e]" />
              <p>Google will ask you to review permissions. It will warn you that the app is unverified. Click "Advanced" &gt; "Go to app (unsafe)" to allow it to edit your sheet.</p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <form onSubmit={handleSave} className="flex flex-col bg-white p-5 rounded-2xl border-2 border-[#6b0f14] shadow-sm">
          <div className="flex items-center mb-3">
             <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#6b0f14] text-white font-bold mr-4 shadow-sm">
              4
            </div>
            <h3 className="font-bold text-[#3D3D3D]">Paste your Web app URL</h3>
          </div>
          <div className="pl-12">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full px-4 py-3 bg-[#fbf5f5] border border-[#ead6d8] rounded-xl text-sm focus:outline-none focus:border-[#6b0f14] text-[#3D3D3D] transition-colors mb-3"
            />
            <button
              type="submit"
              className="bg-[#6b0f14] hover:bg-[#5c0d11] text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-sm"
            >
              Save URL & Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
