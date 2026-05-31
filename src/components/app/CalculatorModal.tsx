import React, { useState, useMemo } from 'react';
import { MonthlyStats, YEARS_CONFIG } from '@/types';
import { Calculator, X } from 'lucide-react';

interface Props {
  monthlyStats: Record<string, MonthlyStats>;
  onClose: () => void;
}

const CalculatorModal: React.FC<Props> = ({ monthlyStats, onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [openYear, setOpenYear] = useState<string | null>(null);

  const toggle = (m: string) => setSelected(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
  const selectAll = () => setSelected(Object.keys(monthlyStats).filter(m => monthlyStats[m].count > 0));
  const clearAll = () => setSelected([]);

  const totals = useMemo(() => {
    let rev = 0, bal = 0, count = 0, buy = 0, wgt = 0, etc = 0, lost = 0;
    selected.forEach(m => {
      if (monthlyStats[m]) {
        rev += monthlyStats[m].revenue || 0;
        bal += monthlyStats[m].balance || 0;
        count += monthlyStats[m].count || 0;
        buy += monthlyStats[m].buy || 0;
        wgt += monthlyStats[m].wgt || 0;
        etc += monthlyStats[m].etc || 0;
        lost += monthlyStats[m].lost || 0;
      }
    });
    const totalCost = buy + wgt + etc;
    const profit = rev - totalCost - lost;
    return { rev, bal, count, buy, wgt, etc, totalCost, lost, profit };
  }, [selected, monthlyStats]);

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calculator size={18} /></div>
            <h3 className="font-bold text-lg">Global Ledger</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={selectAll} className="text-[10px] font-semibold text-primary hover:underline">Select All</button>
          <button onClick={clearAll} className="text-[10px] font-semibold text-muted-foreground hover:underline">Clear</button>
        </div>
        <div className="max-h-48 overflow-y-auto mb-5 space-y-2 custom-scrollbar">
          {Object.entries(YEARS_CONFIG).map(([year, months]) => {
            const active = months.filter(m => monthlyStats[m]?.count > 0);
            if (!active.length) return null;
            return (
              <div key={year}>
                <button onClick={() => setOpenYear(openYear === year ? null : year)} className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${openYear === year ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{year}</button>
                {openYear === year && (
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {active.map(m => (
                      <button key={m} onClick={() => toggle(m)} className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${selected.includes(m) ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary border-border text-muted-foreground'}`}>{m}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-secondary p-4 rounded-xl space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card p-3 rounded-lg border border-border"><div className="text-[10px] text-muted-foreground font-medium mb-0.5">Total Orders</div><div className="text-lg font-bold">{totals.count.toLocaleString()}</div></div>
            <div className="bg-card p-3 rounded-lg border border-border"><div className="text-[10px] text-muted-foreground font-medium mb-0.5">Revenue</div><div className="text-lg font-bold">{totals.rev.toLocaleString()}</div></div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-card p-3 rounded-lg border border-border space-y-2">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Buying Cost</span><span className="text-destructive font-mono font-semibold">{totals.buy.toLocaleString()}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Weight/Ship</span><span className="text-destructive font-mono font-semibold">{totals.wgt.toLocaleString()}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Other</span><span className="text-destructive font-mono font-semibold">{totals.etc.toLocaleString()}</span></div>
            <div className="border-t border-border pt-2 flex justify-between text-xs font-bold"><span>Total Cost</span><span className="font-mono">{totals.totalCost.toLocaleString()}</span></div>
            {totals.lost > 0 && (
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Lost (K3)</span><span className="text-destructive font-mono font-semibold">{totals.lost.toLocaleString()}</span></div>
            )}
          </div>

          {/* Profit */}
          <div className="text-center pt-2">
            <div className="text-xs text-muted-foreground font-medium mb-0.5">Net Profit</div>
            <div className={`text-2xl font-bold font-mono ${totals.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>{totals.profit.toLocaleString()} <span className="text-xs text-muted-foreground">IQD</span></div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground font-medium mb-0.5">Combined Balance</div>
            <div className="text-3xl font-bold text-primary font-mono">{totals.bal.toLocaleString()} <span className="text-xs text-muted-foreground">IQD</span></div>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold py-3 rounded-lg transition-all text-sm">Close</button>
      </div>
    </div>
  );
};

export default CalculatorModal;
