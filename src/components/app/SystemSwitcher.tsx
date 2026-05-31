import { useEffect, useState } from 'react';
import { ChevronDown, Globe, Check, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export type SystemKey = 'all' | 'kurdistani' | 'iraqi';

interface SystemSwitcherProps {
  role: string;
  current?: SystemKey;
  onChange?: (system: SystemKey) => void;
}

const OPTIONS: { key: SystemKey; label: string; sub: string }[] = [
  { key: 'all', label: 'ALL', sub: 'Unified view' },
  { key: 'kurdistani', label: 'Kurdistani', sub: 'Shein Kurdistani' },
  { key: 'iraqi', label: 'Iraqi', sub: 'Shein Iraqi' },
];

const SWITCH_LABELS: Record<SystemKey, string> = {
  all: 'ALL',
  kurdistani: 'Kurdistani',
  iraqi: 'Iraqi',
};

export const SystemSwitcher = ({ role, current = 'kurdistani', onChange }: SystemSwitcherProps) => {
  const [active, setActive] = useState<SystemKey>(current);
  const [switching, setSwitching] = useState<SystemKey | null>(null);

  useEffect(() => {
    setActive(current);
  }, [current]);

  const handleSelect = (key: SystemKey) => {
    if (key === active && key !== 'all') return;

    if (key === 'iraqi') {
      setSwitching('iraqi');
      setTimeout(() => {
        const username = localStorage.getItem('auth_username') || 'owner';
        localStorage.setItem('iraqi_auth_role', role);
        localStorage.setItem('iraqi_auth_username', username);
        setActive('iraqi');
        setSwitching(null);
        onChange?.('iraqi');
        window.location.href = '/iraqi';
      }, 450);
      return;
    }

    if (key === 'all') {
      setSwitching('all');
      const username = localStorage.getItem('iraqi_auth_username') || localStorage.getItem('auth_username') || role;
      localStorage.setItem('app_currentSystem', 'all');
      localStorage.setItem('auth_role', role);
      localStorage.setItem('auth_username', username);
      setTimeout(() => {
        setActive('all');
        setSwitching(null);
        onChange?.('all');
        if (window.location.pathname.startsWith('/iraqi')) {
          window.location.href = '/';
        }
      }, 900);
      return;
    }

    setActive(key);
    onChange?.(key);
    if (key === 'kurdistani') {
      const username = localStorage.getItem('iraqi_auth_username') || localStorage.getItem('auth_username') || role;
      localStorage.setItem('auth_role', role);
      localStorage.setItem('auth_username', username);
      localStorage.setItem('app_currentSystem', 'kurdistani');
      window.location.href = '/';
    }
  };

  const activeOpt = OPTIONS.find(o => o.key === active)!;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs sm:text-sm font-medium hover:border-primary/50 hover:bg-secondary/80 transition-all">
            <Globe size={14} className="text-primary" />
            <span className="hidden sm:inline">{activeOpt.label}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Switch System
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {OPTIONS.map(opt => (
            <DropdownMenuItem
              key={opt.key}
              onClick={() => handleSelect(opt.key)}
              className="flex items-center justify-between gap-2 py-2.5 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground">{opt.sub}</span>
              </div>
              {active === opt.key && <Check size={16} className="text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {switching && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-6 px-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <Globe size={36} className="text-primary" />
              </div>
              <Loader2 size={88} className="absolute -inset-1 text-primary animate-spin" strokeWidth={1.2} />
            </div>
            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-bold tracking-tight">
                Switching to {SWITCH_LABELS[switching]} System
              </h2>
              <p className="text-sm text-muted-foreground">Refreshing latest data...</p>
            </div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

