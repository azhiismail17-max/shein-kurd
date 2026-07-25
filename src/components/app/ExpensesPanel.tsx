import React, { useEffect, useMemo, useState } from "react";
import { Banknote, CheckCircle2, Clock3, Loader2, Plus, ReceiptText, X } from "lucide-react";
import { motion } from "motion/react";
import { Toaster, toast } from "sonner";

export const MASRUFAT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxH9QSkC7roqWQ-rkKXvdqXVeDywrMJYDzdvJtbYNAD_sNJykxSpCt2JiEyJ267rlyv/exec";

interface ExpenseRecord {
  id: string;
  amount: string;
  date: string;
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

  useEffect(() => {
    localStorage.setItem(historyStorageKey, JSON.stringify(history.slice(0, 50)));
  }, [history, historyStorageKey]);

  const todayTotal = useMemo(
    () =>
      history
        .filter((record) => isToday(record.date))
        .reduce((total, record) => total + (Number(record.amount) || 0), 0),
    [history],
  );

  const todayCount = useMemo(
    () => history.filter((record) => isToday(record.date)).length,
    [history],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid expense amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.set("amount", String(numericAmount));

      await fetch(MASRUFAT_WEBHOOK_URL, {
        method: "POST",
        body: formData,
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const record: ExpenseRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        amount: String(numericAmount),
        date: new Date().toISOString(),
      };
      setHistory((previous) => [record, ...previous].slice(0, 50));
      setAmount("");
      toast.success("Expense saved to Google Sheet");
    } catch {
      toast.error("Could not save. Check your internet connection.");
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
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={12} /> Connected
            </span>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <div className="rounded-xl border border-border/80 bg-background/75 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Today
              </p>
              <p className="mt-0.5 truncate text-xl font-extrabold tabular-nums text-foreground">
                {formatAmount(todayTotal)}{" "}
                <span className="text-xs font-semibold text-muted-foreground">IQD</span>
              </p>
            </div>
            <div className="min-w-[74px] rounded-xl border border-border/80 bg-background/75 px-3 py-2.5 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Entries
              </p>
              <p className="mt-0.5 text-xl font-extrabold tabular-nums text-foreground">
                {todayCount}
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
            Saved directly to the connected Google Sheet
          </p>
        </form>
      </motion.section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ReceiptText size={17} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Recent expenses</h2>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">This phone</span>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/25 px-4 py-8 text-center">
            <ReceiptText size={28} className="mb-2 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">No expenses saved yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.slice(0, 7).map((record) => {
              const date = new Date(record.date);
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
                        {date.toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-extrabold tabular-nums text-foreground">
                    {formatAmount(record.amount)}{" "}
                    <span className="text-[10px] font-semibold text-muted-foreground">IQD</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
