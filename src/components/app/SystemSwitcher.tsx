import { useEffect, useState } from "react";
import { Globe, Loader2 } from "lucide-react";

export type SystemKey = "all" | "kurdistani" | "iraqi";

interface SystemSwitcherProps {
  role: string;
  current?: SystemKey;
  onChange?: (system: SystemKey) => void;
  variant?: "header" | "sidebar" | "brand";
}

const OPTIONS: { key: SystemKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "kurdistani", label: "Kurd" },
  { key: "iraqi", label: "Iraq" },
];

const SWITCH_LABELS: Record<SystemKey, string> = {
  all: "ALL",
  kurdistani: "Kurdistani",
  iraqi: "Iraqi",
};

export const SystemSwitcher = ({
  role,
  current = "kurdistani",
  onChange,
  variant = "header",
}: SystemSwitcherProps) => {
  const [active, setActive] = useState<SystemKey>(current);
  const [switching, setSwitching] = useState<SystemKey | null>(null);
  const isBrand = variant === "brand";
  const isSidebarLike = variant === "sidebar" || variant === "brand";

  useEffect(() => {
    setActive(current);
  }, [current]);

  const handleSelect = (key: SystemKey) => {
    if (key === active && key !== "all") return;

    if (key === "iraqi") {
      setSwitching("iraqi");
      setTimeout(() => {
        const username = localStorage.getItem("auth_username") || "owner";
        localStorage.setItem("iraqi_auth_role", role);
        localStorage.setItem("iraqi_auth_username", username);
        setActive("iraqi");
        setSwitching(null);
        onChange?.("iraqi");
        window.location.href = "/iraqi";
      }, 450);
      return;
    }

    if (key === "all") {
      setSwitching("all");
      const username =
        localStorage.getItem("iraqi_auth_username") ||
        localStorage.getItem("auth_username") ||
        role;
      localStorage.setItem("app_currentSystem", "all");
      localStorage.setItem("auth_role", role);
      localStorage.setItem("auth_username", username);
      setTimeout(() => {
        setActive("all");
        setSwitching(null);
        onChange?.("all");
        if (window.location.pathname.startsWith("/iraqi")) {
          window.location.href = "/";
        }
      }, 900);
      return;
    }

    setActive(key);
    onChange?.(key);
    if (key === "kurdistani") {
      const username =
        localStorage.getItem("iraqi_auth_username") ||
        localStorage.getItem("auth_username") ||
        role;
      localStorage.setItem("auth_role", role);
      localStorage.setItem("auth_username", username);
      localStorage.setItem("app_currentSystem", "kurdistani");
      window.location.href = "/";
    }
  };

  return (
    <>
      <div
        className={`flex shrink-0 items-center ${isBrand ? "gap-px rounded p-px" : "rounded-lg p-0.5"} ${
          variant === "sidebar"
            ? "w-full border border-sidebar-border bg-sidebar-accent/40"
            : variant === "brand"
              ? "border border-sidebar-border bg-sidebar-accent/50"
              : "border border-border bg-secondary/60"
        }`}
        title="Profile view"
      >
        <Globe
          size={isBrand ? 8 : 13}
          className={`${isBrand ? "hidden sm:block sm:mx-0.5" : "mx-1"} ${isSidebarLike ? "text-sidebar-foreground/75" : "text-muted-foreground"}`}
        />
        {OPTIONS.map((opt) => {
          const selected = active === opt.key;
          const allSelected = selected && opt.key === "all";
          const sizeClass = isBrand
            ? "h-4 min-w-4 px-0.5 text-[8px] leading-none sm:h-5 sm:px-1 sm:text-[9px]"
            : "px-1.5 py-0.5 text-[10px] sm:px-2 sm:py-1 sm:text-[11px]";
          const activeClass = allSelected
            ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-sm ring-1 ring-white/20"
            : isSidebarLike
              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
              : "bg-background text-primary shadow-sm";
          const idleClass = isSidebarLike
            ? opt.key === "all"
              ? "text-emerald-100 hover:text-white"
              : "text-sidebar-foreground hover:text-white"
            : opt.key === "all"
              ? "text-emerald-600 hover:text-emerald-500"
              : "text-muted-foreground hover:text-foreground";

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSelect(opt.key)}
              className={`rounded ${sizeClass} font-bold transition-all ${selected ? activeClass : idleClass}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {switching && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-6 px-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <Globe size={36} className="text-primary" />
              </div>
              <Loader2
                size={88}
                className="absolute -inset-1 text-primary animate-spin"
                strokeWidth={1.2}
              />
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
