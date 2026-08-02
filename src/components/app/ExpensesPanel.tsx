import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { Toaster, toast } from "sonner";

/**
 * The only place a Masrufat entry is ever sent.
 *
 * Deliberately its own endpoint, not the main SCRIPT_URL and not Supabase: expenses go to
 * the Masrufat sheet and nowhere else. Both branches share this panel, so this constant is
 * the single destination for all of them — do not add a second write here.
 */
export const MASRUFAT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxH9QSkC7roqWQ-rkKXvdqXVeDywrMJYDzdvJtbYNAD_sNJykxSpCt2JiEyJ267rlyv/exec";

interface ExpenseRecord {
  id: string;
  amount: string;
  date: string;
  /** Which branch entered it, when the sheet records one. */
  system?: string;
  /**
   * The month column the amount sits in, e.g. "Aug".
   *
   * The grid holds amounts and nothing else — no dates anywhere — so this is what an
   * entry is labelled with. `date` stays empty for anything read back from the sheet.
   */
  month?: string;
  /**
   * False while an entry exists only on this device.
   *
   * The panel used to record every entry locally whether or not the sheet accepted it,
   * which is how it came to show a list of expenses that the sheet had never received.
   */
  inSheet?: boolean;
}

interface ExpensesPanelProps {
  historyStorageKey: string;
  systemName: string;
}

const formatAmount = (value: string | number) => {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat("en-US").format(number) : String(value);
};

const isToday = (dateValue: string) => {
  const date = new Date(dateValue);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export function ExpensesPanel({ historyStorageKey, systemName }: ExpensesPanelProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<ExpenseRecord[]>([]);
  /** Which entry is being edited, and the amount being typed for it. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [sheetState, setSheetState] = useState<"checking" | "ok" | "unreachable">("checking");

  useEffect(() => {
    const savedHistory = localStorage.getItem(historyStorageKey);
    if (!savedHistory) return;
    try {
      const parsed = JSON.parse(savedHistory);
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {
      // Ignore an old or malformed local history value.
    }
  }, [historyStorageKey]);

  // Every entry is kept, not the newest 50. Trimming the list threw away expenses the
  // owner still wanted to look back at.
  useEffect(() => {
    localStorage.setItem(historyStorageKey, JSON.stringify(history));
  }, [history, historyStorageKey]);

  /**
   * Reads the sheet and shows what it actually holds.
   *
   * The list is the sheet's, not this device's, so an expense entered on a phone shows up
   * on the desk computer too. The local copy is only a fallback for when the sheet cannot
   * be reached.
   */
  const loadFromSheet = useCallback(async () => {
    try {
      const response = await fetch(`${MASRUFAT_WEBHOOK_URL}?t=${Date.now()}`, {
        redirect: "follow",
      });
      const text = await response.text();
      let payload: { status?: string; expenses?: unknown[] } | null = null;
      try {
        payload = JSON.parse(text);
      } catch {
        // Apps Script answers with an HTML error page when the deployment has no doGet.
        payload = null;
      }
      if (!payload || payload.status !== "success" || !Array.isArray(payload.expenses)) {
        setSheetState("unreachable");
        return;
      }
      const fromSheet: ExpenseRecord[] = (payload.expenses as Record<string, unknown>[])
        .filter((row) => String(row.system || "") === "" || String(row.system) === systemName)
        .map((row) => ({
          id: String(row.id ?? ""),
          amount: String(row.amount ?? "0"),
          // Left empty on purpose. Stamping today on an entry from the sheet made every
          // expense ever recorded look as though it had been entered today, and the
          // "Today" total then added all of them up.
          date: String(row.date || ""),
          month: String(row.month || ""),
          system: String(row.system || ""),
          inSheet: true,
        }));
      setHistory(fromSheet);
      setSheetState("ok");
    } catch {
      setSheetState("unreachable");
    }
  }, [systemName]);

  useEffect(() => {
    void loadFromSheet();
  }, [loadFromSheet]);

  /**
   * The month's running total.
   *
   * The sheet is read one month at a time — its own column — so everything loaded belongs
   * to the month in progress. Totalling that is both accurate and what the grid shows in
   * row 30; totalling "today" is impossible, since the grid records no dates.
   */
  const monthTotal = useMemo(
    () => history.reduce((total, record) => total + (Number(record.amount) || 0), 0),
    [history],
  );

  const monthLabel = useMemo(
    () => history.find((record) => record.month)?.month || "This month",
    [history],
  );

  /**
   * Sends one expense and reports what the sheet actually said.
   *
   * Not `mode: "no-cors"` any more. That mode hides the reply, and the reply was the whole
   * story: the deployment behind this URL had no doPost, so every POST came back 404 and
   * the panel cheerfully reported success while the sheet received nothing. A readable
   * reply is the only way this can tell the truth.
   *
   * A failure is never retried automatically. A request that reaches the sheet but fails
   * on the way back would be recorded twice.
   */
  async function postToSheet(
    fields: Record<string, string>,
  ): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
    const body = new URLSearchParams(fields);
    let response: Response;
    try {
      response = await fetch(MASRUFAT_WEBHOOK_URL, { method: "POST", body, redirect: "follow" });
    } catch {
      return { ok: false, error: "Could not reach the sheet. Check your internet connection." };
    }

    const text = await response.text();
    let payload: { status?: string; message?: string; id?: string } | null = null;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }

    if (!payload) {
      // Not JSON. Three cases worth telling apart, because each needs a different fix.
      const looksLikeHtml = /^\s*<(!doctype|html)/i.test(text);
      const missingHandler = /doPost|Script function not found|خطأ/i.test(text);

      if (response.status === 404 || (looksLikeHtml && missingHandler)) {
        return {
          ok: false,
          error:
            "The Masrufat script has no doPost. Paste 'masrufat script.txt' into the Apps Script " +
            "project and redeploy with a new version.",
        };
      }
      if (!looksLikeHtml && text.trim()) {
        // The script answered in plain text, which for Apps Script means it threw. Show
        // exactly what it said — "Error: Sheet 'x' not found" names the problem outright,
        // where a generic message would send someone hunting through the app instead.
        return { ok: false, error: `The sheet said: ${text.trim().slice(0, 160)}` };
      }
      return { ok: false, error: `The sheet replied with ${response.status} and no result.` };
    }
    if (payload.status !== "success") {
      return { ok: false, error: payload.message || "The sheet refused the entry." };
    }
    return { ok: true, id: String(payload.id || fields.id || "") };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid expense amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const id =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      const result = await postToSheet({
        action: "add",
        id,
        amount: String(numericAmount),
        system: systemName,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      // Only recorded here once the sheet has confirmed it.
      setHistory((previous) => [
        {
          id: result.id || id,
          amount: String(numericAmount),
          date: new Date().toISOString(),
          system: systemName,
          inSheet: true,
        },
        ...previous,
      ]);
      setAmount("");
      setSheetState("ok");
      toast.success(`${formatAmount(numericAmount)} IQD written to the Masrufat sheet`);
    } finally {
      setIsSubmitting(false);
    }
  }

  /** Rewrites one expense in the sheet, found by the id it was saved with. */
  async function handleSaveEdit(record: ExpenseRecord) {
    const numericAmount = Number(editAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid expense amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postToSheet({
        action: "update",
        id: record.id,
        amount: String(numericAmount),
        system: record.system || systemName,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setHistory((previous) =>
        previous.map((item) =>
          item.id === record.id ? { ...item, amount: String(numericAmount) } : item,
        ),
      );
      setEditingId(null);
      setEditAmount("");
      toast.success("Expense updated in the sheet");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
      <Toaster position="top-center" richColors />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="border-b border-border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Banknote size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-foreground">Masrufat</h1>
                <p className="truncate text-xs text-muted-foreground">{systemName} expenses</p>
              </div>
            </div>
            {sheetState === "ok" ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} /> Sheet connected
              </span>
            ) : sheetState === "unreachable" ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <AlertTriangle size={12} /> Sheet not answering
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                <Loader2 size={12} className="animate-spin" /> Checking
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <div className="rounded-xl border border-border/80 bg-background/75 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {monthLabel}
              </p>
              <p className="mt-0.5 truncate text-xl font-extrabold tabular-nums text-foreground">
                {formatAmount(monthTotal)}{" "}
                <span className="text-xs font-semibold text-muted-foreground">IQD</span>
              </p>
            </div>
            <div className="min-w-[74px] rounded-xl border border-border/80 bg-background/75 px-3 py-2.5 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Entries
              </p>
              <p className="mt-0.5 text-xl font-extrabold tabular-nums text-foreground">
                {history.length}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5">
          <label
            htmlFor={`${historyStorageKey}-amount`}
            className="mb-2 block text-xs font-bold text-foreground"
          >
            Expense amount
          </label>
          <div className="flex items-center rounded-xl border border-border bg-secondary/50 px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <input
              id={`${historyStorageKey}-amount`}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent py-3 text-3xl font-extrabold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/30"
            />
            {amount && (
              <button
                type="button"
                onClick={() => setAmount("")}
                className="mr-1 rounded-md p-1 text-muted-foreground hover:bg-background"
                aria-label="Clear amount"
              >
                <X size={14} />
              </button>
            )}
            <span className="text-xs font-bold text-muted-foreground">IQD</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !amount}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
            {isSubmitting ? "Saving..." : "Save expense"}
          </button>

          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Written straight to the Masrufat Google Sheet
          </p>
        </form>
      </motion.section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ReceiptText size={17} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              All expenses{history.length > 0 && ` (${history.length})`}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void loadFromSheet()}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary"
          >
            <RefreshCw size={11} />
            {sheetState === "ok" ? "From the sheet" : "Retry"}
          </button>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/25 px-4 py-8 text-center">
            <ReceiptText size={28} className="mb-2 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">No expenses saved yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((record) => {
              const date = record.date ? new Date(record.date) : null;
              const hasDate = !!date && !Number.isNaN(date.getTime());
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock3 size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {hasDate
                          ? date.toLocaleDateString([], { month: "short", day: "numeric" })
                          : record.month || "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {hasDate
                          ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : `cell ${record.id}`}
                      </p>
                    </div>
                  </div>
                  {editingId === record.id ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        autoFocus
                        value={editAmount}
                        onChange={(event) => setEditAmount(event.target.value)}
                        className="w-24 rounded-lg border border-primary bg-background px-2 py-1.5 text-right text-sm font-extrabold tabular-nums outline-none"
                      />
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void handleSaveEdit(record)}
                        className="rounded-lg bg-primary p-1.5 text-primary-foreground disabled:opacity-50"
                        aria-label="Save change"
                      >
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditAmount("");
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                        aria-label="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <p className="text-sm font-extrabold tabular-nums text-foreground">
                        {formatAmount(record.amount)}{" "}
                        <span className="text-[10px] font-semibold text-muted-foreground">IQD</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(record.id);
                          setEditAmount(String(Number(record.amount) || ""));
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                        aria-label={`Edit expense of ${formatAmount(record.amount)}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
