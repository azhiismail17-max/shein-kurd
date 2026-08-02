import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ShoppingCart,
  Package,
  Truck,
  Search,
  Menu,
  X,
  Calculator,
  ChevronLeft,
  Camera,
  LogOut,
  Bell,
  MessageCircle,
  Plus,
  Wallet,
  CreditCard,
  Ticket,
  KeyRound,
} from "lucide-react";
import { YEARS_CONFIG } from "@/types";

import NotificationsDropdown from "./NotificationsDropdown";
import PushNotificationOnboarding from "./PushNotificationOnboarding";
import { SystemKey, SystemSwitcher } from "./SystemSwitcher";
import ThemeColorPicker from "./ThemeColorPicker";
import { recordPresence } from "@/lib/teamActivity";
import { GlobalCalculatorButton } from "@/components/GlobalCalculator";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  isSearchingAll?: boolean;
  onSearchAll?: () => void;
  onCameraSearch?: () => void;
  viewingMonth?: string;
  setViewingMonth?: (m: string) => void;
  activeYear?: string;
  setActiveYear?: (y: string) => void;
  availableMonths?: string[];
  monthlyStats?: Record<string, { count?: number }>;
  activeMonth?: string;
  onSetActiveMonth?: (month: string) => void;
  role: string;
  onLogout: () => void;
  onNotificationClick?: (orderId: string, sheetName: string) => void;
  currentSystem?: SystemKey;
  onSystemChange?: (system: SystemKey) => void;
}

const ALL_MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "expenses", label: "Masrufat", icon: Wallet },
  { id: "gift-cards", label: "Gift Cards", icon: CreditCard },
  { id: "batches", label: "Boxes", icon: Package },
  { id: "new-order", label: "New Order", icon: Plus },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "team", label: "Team", icon: Users },
  { id: "team-performance", label: "Performance", icon: TrendingUp },
];

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  searchQuery = "",
  setSearchQuery,
  isSearchingAll,
  onSearchAll,
  onCameraSearch,
  viewingMonth,
  setViewingMonth,
  activeYear,
  setActiveYear,
  availableMonths = [],
  monthlyStats = {},
  role,
  onLogout,
  onNotificationClick,
  activeMonth,
  onSetActiveMonth,
  currentSystem = "kurdistani",
  onSystemChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const trimmedSearch = localSearch.trim();
  const searchDigits = trimmedSearch.replace(/\D/g, "");
  const canSearchOrderNumber = /^\d+$/.test(trimmedSearch);

  useEffect(() => {
    try {
      const lastReadMap = JSON.parse(localStorage.getItem("messages_last_read") || "{}");
      const allLastReads = Object.values(lastReadMap) as number[];
      // Minimal fetch to check topics if any topic.lastMessageAt > lastRead[topic.id]
      // Because we don't have direct access to db here easily without importing it, let's just import fb:
      let isMounted = true;
      import("@/lib/firebase").then(({ db }) => {
        import("firebase/firestore").then(({ collection, query, onSnapshot }) => {
          const q = query(collection(db, "topics"));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!isMounted) return;
            let unread = false;
            const updatedLastReads = JSON.parse(localStorage.getItem("messages_last_read") || "{}");
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              if (
                data.lastMessageAt &&
                data.lastMessageAt.toMillis &&
                data.lastMessageAt.toMillis() > (updatedLastReads[doc.id] || 0)
              ) {
                // if it's a DM, make sure it belongs to us
                if (doc.id.startsWith("dm_")) {
                  const currentUser = localStorage.getItem("auth_username") || role;
                  if (!doc.id.includes(currentUser.toLowerCase())) return;
                }

                unread = true;
              }
            });
            setHasUnreadMessages(unread && activeTab !== "messages");
          });
          return () => unsubscribe();
        });
      });
      return () => {
        isMounted = false;
      };
    } catch {
      /* ignore */
    }
  }, [activeTab, role]);

  useEffect(() => {
    const currentUser = localStorage.getItem("auth_username") || role;
    const pingPresence = () =>
      recordPresence("kurdistani", currentUser, role, true).catch(() => {});
    const setOffline = () => recordPresence("kurdistani", currentUser, role, false).catch(() => {});

    pingPresence();
    const interval = setInterval(pingPresence, 30000);
    window.addEventListener("beforeunload", setOffline);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("beforeunload", setOffline);
      setOffline();
    };
  }, [role]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const showBack = activeTab === "new-order";
  const isAdmin = role === "admin";
  const activeMonthOptions =
    activeYear && YEARS_CONFIG[activeYear] ? YEARS_CONFIG[activeYear] : availableMonths;

  const menuItems = ALL_MENU_ITEMS.filter((item) => {
    if (role === "owner") return true;
    if (role === "admin") {
      return item.id !== "dashboard";
    }
    if (role === "moderator") {
      return (
        item.id === "calculator" ||
        item.id === "orders" ||
        item.id === "batches" ||
        item.id === "new-order" ||
        item.id === "messages" ||
        item.id === "team" ||
        item.id === "team-performance" ||
        item.id === "gift-cards"
      );
    }
    if (role === "delivery") {
      return (
        item.id === "calculator" ||
        item.id === "delivery" ||
        item.id === "messages" ||
        item.id === "team"
      );
    }
    return item.id === "calculator";
  });
  // The bottom bar is the only navigation on a phone, so it is kept short. The
  // performance report is reached from inside the Team page rather than taking a slot
  // here.
  const mobileTabIds = ["dashboard", "calculator", "expenses", "gift-cards", "team"];
  const mobileMenuItems = mobileTabIds
    .map((id) => menuItems.find((item) => item.id === id))
    .filter((item): item is (typeof menuItems)[number] => Boolean(item));

  return (
    <div className="h-[100dvh] w-full professional-surface text-foreground font-sans flex overflow-hidden transition-colors duration-300">
      <PushNotificationOnboarding role={role} system="kurdistani" />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 ${isAdmin ? "right-0 border-l" : "left-0 border-r"} z-50 w-[86vw] max-w-80 lg:w-72 bg-sidebar text-sidebar-foreground border-sidebar-border transform transition-transform duration-300 shadow-2xl shadow-slate-950/25 lg:shadow-none ${sidebarOpen ? "translate-x-0" : isAdmin ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-full flex flex-col bg-[radial-gradient(circle_at_top,hsl(var(--sidebar-primary)/0.22),transparent_24rem)]">
          <div className="flex items-center justify-between gap-2 border-b border-sidebar-border/80 p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-sidebar-primary shadow-lg shadow-black/25 ring-1 ring-white/10 sm:h-12 sm:w-12">
                <img
                  src="/logo-512.png"
                  alt="Shein Kurdistani"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <h1 className="min-w-0 truncate whitespace-nowrap text-base font-extrabold tracking-tight text-white sm:text-lg">
                    Shein Kurd
                  </h1>
                  {role === "owner" && (
                    <SystemSwitcher
                      role={role}
                      current={currentSystem}
                      onChange={onSystemChange}
                      variant="brand"
                    />
                  )}
                </div>
                <p className="text-[10px] text-sidebar-foreground uppercase tracking-[0.16em] font-semibold">
                  {role} Hub
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl transition-all text-sm font-semibold ${isAdmin ? "flex-row-reverse text-right" : ""}
                    ${
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/18 ring-1 ring-white/10"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground border border-white/0 hover:border-white/5"
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.id === "messages" && hasUnreadMessages && (
                    <div
                      className={`${isAdmin ? "mr-2" : "ml-2"} w-2 h-2 rounded-full bg-red-500 glow-red animate-pulse`}
                    />
                  )}
                  {active && (
                    <div
                      className={`${isAdmin ? "mr-auto" : "ml-auto"} w-1.5 h-5 rounded-full bg-sidebar-primary-foreground/80`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border/80 space-y-3">
            <ThemeColorPicker />
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl text-sm text-red-200 hover:bg-red-500/15 hover:text-white transition-all font-semibold"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="glass-surface sticky top-0 z-30 shrink-0 shadow-sm">
          <div
            className={`px-3 sm:px-5 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 ${isAdmin ? "flex-row-reverse" : ""}`}
          >
            <div className="relative z-20 flex shrink-0 items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-card text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
              >
                <Menu size={20} />
                {hasUnreadMessages && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 glow-red ring-2 ring-card" />
                )}
              </button>
              {showBack ? (
                <button
                  onClick={() => setActiveTab("orders")}
                  className="hidden md:flex items-center gap-1 rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <h2 className="hidden md:block text-lg font-extrabold capitalize whitespace-nowrap tracking-tight">
                  {activeTab === "new-order" ? "New Order" : activeTab}
                </h2>
              )}
            </div>

            <div className="flex-1 min-w-0 w-full max-w-none sm:max-w-2xl">
              <div className="relative w-full group">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={localSearch}
                  onChange={(e) => {
                    const next = e.target.value;
                    setLocalSearch(next);
                    setSearchQuery?.(next);
                    if (next && activeTab !== "orders") setActiveTab("orders");
                  }}
                  className="w-full bg-card border border-border text-foreground text-base sm:text-sm rounded-2xl pl-10 pr-10 py-3 shadow-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                />
                {localSearch && (
                  <button
                    onClick={() => {
                      setLocalSearch("");
                      setSearchQuery?.("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
                {canSearchOrderNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = `order:${searchDigits}`;
                      setLocalSearch(next);
                      setSearchQuery?.(next);
                      if (activeTab !== "orders") setActiveTab("orders");
                    }}
                    className="absolute left-0 top-full mt-2 rounded-lg border border-primary/20 bg-card px-3 py-1.5 text-[11px] font-semibold text-primary shadow-lg hover:bg-primary/10"
                  >
                    Order number {searchDigits}
                  </button>
                )}
              </div>
            </div>

            <div
              className={`flex items-center gap-0.5 sm:gap-1 shrink-0 ${isAdmin ? "order-first" : ""}`}
            >
              {isSearchingAll && (
                <div className="hidden sm:flex flex items-center gap-2 text-xs text-primary font-medium mr-2">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              )}
              <NotificationsDropdown role={role} onNotificationClick={onNotificationClick} />
              <button
                onClick={onCameraSearch}
                className="p-3 text-muted-foreground hover:text-primary hover:bg-secondary rounded-2xl transition-colors"
                title="Image Search"
              >
                <Camera size={18} />
              </button>
              {role === "owner" && (
                <GlobalCalculatorButton
                  variant="inline"
                  monthlyStats={monthlyStats}
                  monthOptions={activeMonthOptions}
                  yearLabel={activeYear}
                />
              )}
            </div>
          </div>
        </header>

        <main
          className={`flex-1 min-h-0 ${activeTab === "messages" ? "overflow-hidden p-0 pb-24 lg:pb-0" : "overflow-y-auto px-4 pt-4 pb-28 sm:p-5 lg:p-7 custom-scrollbar"}`}
        >
          {children}
        </main>

        <nav className="mobile-tabbar lg:hidden" aria-label="Main navigation">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={active ? "is-active" : ""}
              >
                <span className="mobile-tabbar-icon">
                  <Icon size={16} strokeWidth={active ? 2.4 : 2} />
                </span>
                <span>
                  {item.id === "gift-cards"
                    ? "Gift Card"
                    : item.id === "expenses"
                      ? "Masrufat"
                      : item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
