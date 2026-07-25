import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator, CheckCircle2, Circle, Layers3, RotateCcw, X } from "lucide-react";

type MonthlyCount = {
  count?: number;
};

interface GlobalCalculatorProps {
  onClose: () => void;
  monthlyStats?: Record<string, MonthlyCount>;
  monthOptions?: string[];
  yearLabel?: string;
}

const uniqueMonths = (months: string[]) => [...new Set(months.filter(Boolean))];

export function GlobalCalculator({
  onClose,
  monthlyStats = {},
  monthOptions = [],
  yearLabel,
}: GlobalCalculatorProps) {
  const months = useMemo(() => {
    const statMonths = Object.keys(monthlyStats);
    const scopedMonths = monthOptions.length > 0 ? monthOptions : statMonths;
    return uniqueMonths(scopedMonths).filter(
      (month) => monthOptions.length > 0 || (monthlyStats[month]?.count || 0) > 0,
    );
  }, [monthOptions, monthlyStats]);

  const defaultSelected = useMemo(
    () => months.filter((month) => (monthlyStats[month]?.count || 0) > 0),
    [months, monthlyStats],
  );
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const selectedSet = new Set(selected);
  const totalOrders = selected.reduce((sum, month) => sum + (monthlyStats[month]?.count || 0), 0);
  const allSelected = months.length > 0 && selected.length === months.length;
  const hasMonths = months.length > 0;

  useEffect(() => {
    setSelected(defaultSelected);
  }, [defaultSelected]);

  const toggleMonth = (month: string) => {
    setSelected((prev) =>
      prev.includes(month) ? prev.filter((item) => item !== month) : [...prev, month],
    );
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-stretch justify-center bg-background sm:items-center sm:bg-black/55 sm:p-3"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[100dvh] w-full min-h-0 flex-col overflow-hidden bg-background sm:h-[min(680px,calc(100dvh-24px))] sm:max-w-lg sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:shadow-2xl"
      >
        <div className="shrink-0 border-b border-border bg-card/95 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur flex items-center justify-between sm:py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Calculator size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black tracking-tight">Order total</h2>
              <p className="text-xs text-muted-foreground">
                Choose {yearLabel ? `${yearLabel} ` : ""}months to count
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors"
            aria-label="Close calculator"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-4">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/8 to-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase text-primary tracking-[0.14em]">
                  Total orders
                </div>
                <div className="mt-1 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                  {totalOrders.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-background/70 px-3 py-2 text-right">
                <div className="text-lg font-black leading-none">{selected.length}</div>
                <div className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">
                  Months
                </div>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/70">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: hasMonths
                    ? `${Math.round((selected.length / months.length) * 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelected(allSelected ? [] : months)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 text-xs font-black hover:bg-secondary/80 transition-colors"
            >
              <Layers3 size={15} />
              {allSelected ? "Unselect all" : "Select all"}
            </button>
            <button
              type="button"
              onClick={() => setSelected(defaultSelected)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-black hover:bg-secondary transition-colors"
            >
              <RotateCcw size={15} />
              Active months
            </button>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden bg-background">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Months
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {selected.length} / {months.length}
              </span>
            </div>

            {!hasMonths ? (
              <div className="p-5 text-center text-sm text-muted-foreground">
                No month data found.
              </div>
            ) : (
              months.map((month) => {
                const checked = selectedSet.has(month);
                const count = monthlyStats[month]?.count || 0;
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => toggleMonth(month)}
                    className={`flex w-full items-center justify-between border-b border-border px-3 py-3 text-left last:border-b-0 transition-colors ${
                      checked ? "bg-primary/10" : "bg-background hover:bg-secondary/70"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {checked ? (
                        <CheckCircle2 size={18} className="shrink-0 text-primary" />
                      ) : (
                        <Circle size={18} className="shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate text-sm font-black">{month}</span>
                    </span>
                    <span
                      className={`ml-3 rounded-full px-2.5 py-1 text-xs font-black ${
                        checked
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-card/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default GlobalCalculator;
