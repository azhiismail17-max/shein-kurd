import React, { useState } from "react";
import { getYears } from "@/lib/year-months";

interface Props {
  viewingMonth: string;
  setViewingMonth: (m: string) => void;
  activeYear: string;
  setActiveYear: (y: string) => void;
  availableMonths: string[];
  /**
   * Months currently included. More than one may be picked, so a search can be
   * narrowed to a single month or widened across several.
   */
  selectedMonths?: string[];
  /** Adds or removes a month from the selection. */
  onToggleMonth?: (month: string) => void;
}

const MonthSelector: React.FC<Props> = React.memo(
  ({
    viewingMonth,
    setViewingMonth,
    activeYear,
    setActiveYear,
    availableMonths,
    selectedMonths,
    onToggleMonth,
  }) => {
    const [openYear, setOpenYear] = useState<string | null>(null);
    const visibleMonths = openYear === activeYear ? availableMonths : [];

    // Falls back to the single viewed month wherever the multi-select props are not
    // supplied, so the older screens keep behaving exactly as before.
    const chosen = selectedMonths?.length ? selectedMonths : [viewingMonth];
    const multi = chosen.length > 1;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 rounded-xl border border-border/80 bg-card/90 p-1 shadow-sm">
          {getYears()
            .sort((a, b) => b.localeCompare(a))
            .map((y) => {
              const handleYearClick = () => {
                setActiveYear(y);
                setOpenYear((prev) => (prev === y ? null : y));
              };
              return (
                <button
                  key={y}
                  onClick={handleYearClick}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeYear === y ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  {y}
                </button>
              );
            })}
        </div>
        {visibleMonths.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl border border-border/80 bg-card/90 p-1 shadow-sm">
            {visibleMonths.map((m) => {
              const isOn = chosen.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => (onToggleMonth ? onToggleMonth(m) : setViewingMonth(m))}
                  aria-pressed={isOn}
                  title={isOn && multi ? `${m} — tap to remove` : `${m} — tap to add`}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${isOn ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  {m}
                </button>
              );
            })}
            {multi && (
              <span className="shrink-0 pl-1 pr-1 text-[10px] font-semibold text-muted-foreground">
                {chosen.length} months
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

MonthSelector.displayName = "MonthSelector";

export default MonthSelector;
