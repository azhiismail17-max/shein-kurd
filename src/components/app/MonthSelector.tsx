import React, { useState } from 'react';
import { YEARS_CONFIG } from '@/types';

interface Props {
  viewingMonth: string;
  setViewingMonth: (m: string) => void;
  activeYear: string;
  setActiveYear: (y: string) => void;
  availableMonths: string[];
}

const MonthSelector: React.FC<Props> = React.memo(({ viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths }) => {
  const [openYear, setOpenYear] = useState<string | null>(null);
  const visibleMonths = openYear === activeYear ? availableMonths : [];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1">
        {Object.keys(YEARS_CONFIG).sort((a, b) => b.localeCompare(a)).map(y => {
          const handleYearClick = () => {
            setActiveYear(y);
            setOpenYear(prev => prev === y ? null : y);
          };
          return (
            <button key={y} onClick={handleYearClick} className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${activeYear === y ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{y}</button>
          );
        })}
      </div>
      {visibleMonths.length > 0 && (
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {visibleMonths.map(m => (
            <button key={m} onClick={() => setViewingMonth(m)} className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${viewingMonth === m ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{m}</button>
          ))}
        </div>
      )}
    </div>
  );
});

MonthSelector.displayName = 'MonthSelector';

export default MonthSelector;
