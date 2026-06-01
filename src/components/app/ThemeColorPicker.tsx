import { useEffect, useMemo, useState } from 'react';
import { Check, Moon, Palette, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STORAGE_KEY = 'shein_theme_color';

type ThemeColor = {
  key: string;
  label: string;
  hsl: string;
  foreground: string;
  swatch: string;
};

const COLORS: ThemeColor[] = [
  { key: 'default', label: 'Profile Default', hsl: '', foreground: '', swatch: 'linear-gradient(135deg, #10b981, #6b0f14)' },
  { key: 'pink', label: 'Pink', hsl: '330 81% 60%', foreground: '0 0% 100%', swatch: '#ec4899' },
  { key: 'purple', label: 'Purple', hsl: '262 83% 58%', foreground: '0 0% 100%', swatch: '#7c3aed' },
  { key: 'light-blue', label: 'Light Blue', hsl: '199 89% 48%', foreground: '0 0% 100%', swatch: '#0ea5e9' },
  { key: 'red', label: 'Red', hsl: '357 75% 24%', foreground: '0 0% 100%', swatch: '#6b0f14' },
  { key: 'blue', label: 'Blue', hsl: '221 83% 53%', foreground: '0 0% 100%', swatch: '#2563eb' },
  { key: 'teal', label: 'Teal', hsl: '173 80% 40%', foreground: '0 0% 100%', swatch: '#14b8a6' },
  { key: 'amber', label: 'Amber', hsl: '38 92% 50%', foreground: '222 47% 6%', swatch: '#f59e0b' },
  { key: 'black', label: 'Black', hsl: '220 15% 12%', foreground: '0 0% 100%', swatch: '#111827' },
];

function applyThemeColor(color: ThemeColor) {
  const root = document.documentElement;
  const enabled = color.key !== 'default';
  root.classList.toggle('user-accent-theme', enabled);

  if (!enabled) {
    root.style.removeProperty('--user-primary');
    root.style.removeProperty('--user-primary-foreground');
    return;
  }

  root.style.setProperty('--user-primary', color.hsl);
  root.style.setProperty('--user-primary-foreground', color.foreground);
}

interface ThemeColorPickerProps {
  compact?: boolean;
}

export default function ThemeColorPicker({ compact = false }: ThemeColorPickerProps) {
  const [selectedKey, setSelectedKey] = useState(() => localStorage.getItem(STORAGE_KEY) || 'default');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const selected = useMemo(() => COLORS.find(color => color.key === selectedKey) || COLORS[0], [selectedKey]);

  useEffect(() => {
    applyThemeColor(selected);
  }, [selected]);

  const handleSelect = (color: ThemeColor) => {
    setSelectedKey(color.key);
    localStorage.setItem(STORAGE_KEY, color.key);
    applyThemeColor(color);
  };

  const toggleDarkMode = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={
            compact
              ? 'p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors'
              : 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all'
          }
          title="Theme Color"
        >
          <Palette size={18} />
          {!compact && <span>Theme Color</span>}
          {!compact && (
            <span className="ml-auto h-4 w-4 rounded-full border border-border" style={{ background: selected.swatch }} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Theme Color
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={toggleDarkMode}
          className="flex items-center justify-between gap-3 py-2.5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 rounded-full border border-border bg-secondary flex items-center justify-center">
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </span>
            <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {COLORS.map(color => (
          <DropdownMenuItem
            key={color.key}
            onClick={() => handleSelect(color)}
            className="flex items-center justify-between gap-3 py-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 rounded-full border border-border shadow-sm" style={{ background: color.swatch }} />
              <span className="text-sm font-medium">{color.label}</span>
            </div>
            {selectedKey === color.key && <Check size={16} className="text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
