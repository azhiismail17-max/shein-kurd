import React, { useState, useEffect, useCallback, useMemo, useRef, useDeferredValue } from "react";
import { canonicalPhone, looksLikePhoneQuery, orderPhoneKeys } from "@/lib/phone-search";
import { orderDeleted, orderDelivered, orderEdited, orderPurchased } from "@/lib/notification-text";
import {
  Order,
  ApiResponse,
  MonthlyStats,
  GiftCard,
  YEARS_CONFIG,
  SCRIPT_URL,
  ACTIVE_ORDER_SHEET,
  STATUS_OPTIONS,
  getOrderStatus,
} from "@/types";
import { sendNotification } from "@/lib/notifications";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { broadcastOrderChange, subscribeOrderChanges } from "@/lib/realtime";
import { getWarningImageSource } from "@/lib/warning-image";
import { buildStatusExtra, shouldAutoMovePurchasedToTransit } from "@/lib/statusAutomation";
import { toast } from "sonner";
import AppLayout from "@/components/app/AppLayout";
import { LoginView } from "@/components/app/LoginView";
import { SystemKey } from "@/components/app/SystemSwitcher";
import { recordOrderDeleted } from "@/lib/teamActivity";
import { clearCachedOrders, readCachedOrders } from "@/lib/orders-cache";
import { loadOrders, flattenOrders, isLiveMonth, OrdersLoadError } from "@/lib/orders-source";
import { orderMoment } from "@/lib/order-activity";
import { supabase } from "@/lib/supabase";
import { deleteOrderEverywhere, updateOrderEverywhere } from "@/lib/submitOrder";
import { registerYearMonths, getYearMonths, getAllMonths, getMonthIndex } from "@/lib/year-months";

const DashboardView = React.lazy(() => import("@/components/app/DashboardView"));
const OrderFormView = React.lazy(() => import("@/components/app/OrderFormView"));
const OrderListView = React.lazy(() => import("@/components/app/OrderListView"));
const OrderDetailModal = React.lazy(() => import("@/components/app/OrderDetailModal"));
const BatchesView = React.lazy(() => import("@/components/app/BatchesView"));
const ExpensesView = React.lazy(() => import("@/components/app/ExpensesView"));

const LOCAL_GIFT_CARDS_KEY = "kurdistani_gift_cards_cache";

const readLocalGiftCards = (): GiftCard[] => {
  try {
    const cards = JSON.parse(localStorage.getItem(LOCAL_GIFT_CARDS_KEY) || "[]");
    return Array.isArray(cards) ? cards : [];
  } catch {
    return [];
  }
};

const mergeGiftCards = (serverCards: GiftCard[]) => {
  const merged = [...serverCards];
  for (const localCard of readLocalGiftCards()) {
    const exists = merged.some(
      (card) =>
        card.id === localCard.id ||
        (card.card_number === localCard.card_number && card.card_pin === localCard.card_pin),
    );
    if (!exists) merged.push(localCard);
  }
  return merged;
};

// The dedicated Gift Card sheet keeps Spent, Remaining and Linked Boxes. The
// legacy layout below stores a card as a plain order row, which has no columns
// for any of that - so reading it can only recover the card's identity and
// price. Filling the missing figures in as zero would report every already-used
// card as untouched, so the last known values are carried over instead.
const hydrateLegacyGiftCard = (card: GiftCard, known?: GiftCard): GiftCard => {
  const price = Number(card.card_price || 0);
  const spent = Math.min(Math.max(Number(known?.spent || 0), 0), price);
  return {
    ...card,
    payment_method: card.payment_method || known?.payment_method || "",
    payment_other: card.payment_other || known?.payment_other || "",
    notes: card.notes || known?.notes || "",
    spent,
    remaining: Math.max(price - spent, 0),
    linked_boxes: known?.linked_boxes || [],
  };
};
const CalculatorView = React.lazy(() => import("@/components/app/CalculatorView"));
const CameraSearchModal = React.lazy(() => import("@/components/app/CameraSearchModal"));
const MessagesView = React.lazy(() => import("@/components/app/MessagesView"));
const TeamView = React.lazy(() => import("@/components/app/TeamView"));
const TeamPerformanceView = React.lazy(() => import("@/components/app/TeamPerformanceView"));
const GiftCardManagerView = React.lazy(() => import("@/components/app/GiftCardManagerView"));

const DEFAULT_YEAR = Object.keys(YEARS_CONFIG).sort().pop() || "2026";
const DEFAULT_MONTH = ACTIVE_ORDER_SHEET;

/** How long a remembered month is still the month you were looking at. */
const RESUME_WINDOW_MS = 4 * 60 * 60 * 1000;

/**
 * The month to open on.
 *
 * There are two different situations here and one answer cannot serve both. Stepping away to
 * answer a message and coming back is the same sitting — the phone may have thrown the page
 * out of memory, but you were looking at July and expect July. Opening the app the next
 * morning is not the same sitting, and inheriting a month from days ago is what hid a whole
 * month of new orders behind a stale list.
 *
 * So the month is remembered with the time it was chosen, and only resumed while it is
 * recent. After that it starts on the month it actually is.
 */
const RESUMED_MONTH = (() => {
  if (typeof window === "undefined") return ACTIVE_ORDER_SHEET;
  try {
    const saved = localStorage.getItem("app_viewingMonth");
    const savedAt = Number(localStorage.getItem("app_viewingMonthAt") || 0);
    const fresh = savedAt > 0 && Date.now() - savedAt < RESUME_WINDOW_MS;
    if (saved && fresh && getAllMonths().includes(saved)) return saved;
  } catch {
    // A blocked or full localStorage is not a reason to fail to start.
  }
  return ACTIVE_ORDER_SHEET;
})();
const ALL_MONTHS = Object.values(YEARS_CONFIG).flat();
const CACHE_VERSION = "full-sheet-data-v7-valid-phone-auto-links";
const RECENT_OPTIMISTIC_MS = 15000;

const sheetIndex: Record<string, number> = {};
let globalIdx = 0;
for (const year of Object.keys(YEARS_CONFIG).sort()) {
  for (const month of YEARS_CONFIG[year]) {
    sheetIndex[month] = globalIdx++;
  }
}
/**
 * How recent an order is, as one number, worked out once per order.
 *
 * Deliberately not computed inside a comparator. A sort of two thousand orders calls its
 * comparator tens of thousands of times, and parsing a date on every call is what turned an
 * earlier version of this sort into 36ms of work per keystroke.
 *
 * The date is used rather than the row number. Row number was standing in for recency, and
 * mostly agreed with it, but it stopped being reliable once orders could exist without a
 * sheet row: their id is a uuid, `Number()` of it is NaN, and a comparator returning NaN
 * leaves those rows wherever they happened to be — including nowhere near the top.
 */
const recencyOf = (order: Order) => {
  const at = orderMoment(order);
  if (at) return at.getTime();
  // No date at all: fall back to the row number, which at least orders within a month.
  const row = Number(order.id);
  return Number.isFinite(row) ? row : 0;
};

interface Ranked {
  order: Order;
  month: number;
  recency: number;
}

/**
 * Newest first, everywhere.
 *
 * Latest month at the top, and inside a month the most recent order first, so an order just
 * saved is the first thing on the screen.
 */
const sortByNewest = (orders: Order[]): Order[] => {
  const ranked: Ranked[] = orders.map((order) => ({
    order,
    month: getMonthIndex(order.sheet_name),
    recency: recencyOf(order),
  }));
  ranked.sort((a, b) => b.month - a.month || b.recency - a.recency);
  return ranked.map((r) => r.order);
};

const getRecentSearchMonths = (month: string) => {
  const months = getAllMonths();
  const index = months.indexOf(month);
  if (index < 0) return [month];
  return months.slice(Math.max(0, index - 2), index + 1);
};

const getSearchFields = (o: Order) => [
  o.insta,
  o.name,
  o.phone,
  o.phone2,
  o.place,
  o.orderNo,
  o.extra,
  o.link,
  (o as any).sku,
  o.sheet_name,
];
const buildSearchText = (o: Order) =>
  getSearchFields(o)
    .map((f) => String(f || "").toLowerCase())
    .join(" ");
const tokenizeSearchText = (text: string) => text.split(/[^a-z0-9\u0600-\u06ff]+/i).filter(Boolean);
const strongTextMatch = (tokens: string[], terms: string[]) =>
  terms.every((term) => tokens.some((token) => token.startsWith(term)));
const looseTextMatch = (text: string, terms: string[]) =>
  terms.every((term) => text.includes(term));
const getOrderIdentity = (order: Partial<Order> & Record<string, any>) => {
  const sheet = String(order.sheet_name || order.sheet || "");
  const clientRequestId = String(order.client_request_id || "");
  if (clientRequestId) return `request:${sheet}:${clientRequestId}`;
  const tempId = String(order._tempId || "");
  if (tempId) return `temp:${sheet}:${tempId}`;
  return "";
};
const getLocalOrderKey = (id: string | number, sheet: string) => `${sheet}:${id}`;

const Index: React.FC = () => {
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("auth_role"));
  /*
   * The orders from last time, used for the first paint only.
   *
   * A phone drops a backgrounded page, so switching back is a cold start and the screen sat
   * empty for two or three seconds while Supabase was read again. Starting from what was on
   * screen a moment ago means the orders are there immediately; the real read runs behind it
   * and replaces them, so nothing stale survives longer than that.
   */
  const cachedStart = useMemo(() => readCachedOrders(), []);

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("app_activeTab") || "orders",
  ); // default to 'orders' since it's the most common denominator
  const editReturnTabRef = useRef(localStorage.getItem("app_editReturnTab") || "orders");
  /**
   * The tab currently on screen.
   *
   * Kept in a ref so beginEditingOrder can read it without being rebuilt on every tab
   * change, which would make every screen holding it re-render for nothing.
   */
  const activeTabRef = useRef(localStorage.getItem("app_activeTab") || "orders");
  const [currentSystem, setCurrentSystem] = useState<SystemKey>(() => {
    const saved = localStorage.getItem("app_currentSystem") as SystemKey | null;
    return saved === "all" || saved === "kurdistani" ? saved : "kurdistani";
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith("#messages:")) {
        setActiveTab("messages");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [activeYear, setActiveYear] = useState(() => {
    const saved = localStorage.getItem("app_activeYear");
    return saved && YEARS_CONFIG[saved] ? saved : DEFAULT_YEAR;
  });
  const [activeMonth, setActiveMonth] = useState(DEFAULT_MONTH);
  /*
   * Opening the app starts on the month it actually is.
   *
   * This used to restore whichever month was last looked at, which meant a browser last
   * used in July opened on July — and the order list only ever shows one month, so every
   * August order was filtered out of it. The Boxes screen reads every order rather than one
   * month, so the same orders were plainly visible there, which made it look as though the
   * list had lost them.
   *
   * Switching month still works and still sticks for the rest of the session; it is only the
   * cold start that no longer inherits a month from days ago.
   */
  const [viewingMonth, setViewingMonth] = useState(RESUMED_MONTH);
  /**
   * Months the order list and search are limited to. More than one can be picked, so
   * a search can be narrowed to one month or widened across several. `viewingMonth`
   * stays in step with the most recent pick, because the delivery, boxes and new-order
   * screens still work from a single month.
   */
  const [selectedMonths, setSelectedMonths] = useState<string[]>(() => [RESUMED_MONTH]);

  /**
   * True once a month has been tapped for the current search.
   *
   * A search starts by looking across every month, because the point of typing a name
   * is to find that customer wherever they are. Tapping a month is what narrows it,
   * and that first tap means "just this one" rather than "add to the month I happened
   * to be viewing".
   */
  const [monthFilterTick, setMonthFilterTick] = useState(0);
  const monthPickedForSearch = useRef(false);
  const searchingRef = useRef(false);

  const toggleMonth = useCallback((month: string) => {
    const narrowingASearch = searchingRef.current && !monthPickedForSearch.current;
    monthPickedForSearch.current = true;
    setMonthFilterTick((n) => n + 1);

    setSelectedMonths((prev) => {
      // The first month tapped during a search replaces the selection, so results show
      // that month alone. Tapping more adds them.
      if (narrowingASearch) {
        setViewingMonth(month);
        return [month];
      }
      // Removing the last one would leave nothing to show, so a single selected month
      // stays selected when tapped again.
      if (prev.includes(month)) {
        const next = prev.filter((m) => m !== month);
        if (!next.length) return prev;
        setViewingMonth(next[next.length - 1]);
        return next;
      }
      setViewingMonth(month);
      return [...prev, month];
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("app_activeTab", activeTab);
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("app_currentSystem", currentSystem);
  }, [currentSystem]);

  useEffect(() => {
    localStorage.setItem("app_activeYear", activeYear);
  }, [activeYear]);

  useEffect(() => {
    localStorage.setItem("app_activeMonth", activeMonth);
  }, [activeMonth]);

  useEffect(() => {
    localStorage.setItem("app_viewingMonth", viewingMonth);
    // Stamped so the next start can tell "a moment ago" from "last week".
    localStorage.setItem("app_viewingMonthAt", String(Date.now()));
    // Keeps a month chosen somewhere else — a notification, or the month falling out
    // of the available list — from leaving a stale multi-selection behind.
    setSelectedMonths((prev) => (prev.includes(viewingMonth) ? prev : [viewingMonth]));
  }, [viewingMonth]);
  const [allOrders, setAllOrders] = useState<Order[]>(() =>
    cachedStart ? Object.values(cachedStart.months).flat() : [],
  );
  // Surfaced on screen, so a failed load is never a silently blank page.
  const [loadError, setLoadError] = useState<string | null>(null);
  // Held in state as well as the module registry so the month picker re-renders
  // once a snapshot declares custom month names.
  const [extraYearMonths, setExtraYearMonths] = useState<Record<string, string[]>>({});
  const autoTransitInFlightRef = useRef<Set<string>>(new Set());
  const [monthlyStats, setMonthlyStats] = useState<Record<string, MonthlyStats>>(
    () => cachedStart?.stats ?? {},
  );
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [giftCardsBackendIsLegacy, setGiftCardsBackendIsLegacy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [editingOrder, setEditingOrder] = useState<Order | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("app_editingOrder") || "null");
    } catch {
      return null;
    }
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const recentOrderPatchesRef = useRef<Record<string, { updates: Partial<Order>; at: number }>>({});
  // The input is driven by searchQuery so every character appears immediately, while
  // the lists read the deferred copy. React can then keep typing responsive and
  // rebuild the results at a lower priority instead of blocking on each keystroke.
  const [searchQuery, setSearchQuery] = useState(
    () => localStorage.getItem("app_searchQuery") || "",
  );
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Typing, changing or clearing a search starts it wide again, so a month narrowed
  // for a previous search cannot silently hide the next one's results.
  useEffect(() => {
    const q = searchQuery.trim();
    searchingRef.current = q.length > 0;
    monthPickedForSearch.current = false;
    setMonthFilterTick((n) => n + 1);
  }, [searchQuery]);

  const [isSearchingAll, setIsSearchingAll] = useState(false);
  const [showCameraSearch, setShowCameraSearch] = useState(false);

  useEffect(() => {
    const versionKey = "app_cache_version";
    if (localStorage.getItem(versionKey) === CACHE_VERSION) return;

    Object.keys(localStorage).forEach((key) => {
      if (key === "app_initial_data" || key.startsWith("app_month_data_")) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(versionKey, CACHE_VERSION);
  }, []);

  // localStorage writes are synchronous, so saving on every keystroke put a disk
  // write in the middle of typing. The query only needs to survive a reload, so it
  // is written once the typing stops.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem("app_searchQuery", searchQuery);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem("app_scrollY", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!loading) {
      const scrollY = sessionStorage.getItem("app_scrollY");
      if (scrollY) {
        setTimeout(() => window.scrollTo({ top: parseInt(scrollY), behavior: "instant" }), 0);
      }
    }
  }, [loading]);

  const loadedMonthsRef = useRef(loadedMonths);
  loadedMonthsRef.current = loadedMonths;
  const historyLoadInFlightRef = useRef(false);

  // Initialize correct tab based on role
  useEffect(() => {
    if (!localStorage.getItem("app_activeTab")) {
      if (role === "owner") {
        setActiveTab("dashboard");
      } else {
        setActiveTab("orders");
      }
    }
  }, [role]);

  // Helper to merge orders without duplicates
  const mergeOrders = useCallback(
    (prev: Order[], newData: Order[], sheetsToReplace: string | string[]) => {
      const replaceSet = new Set(
        Array.isArray(sheetsToReplace) ? sheetsToReplace : [sheetsToReplace],
      );
      const filtered = prev.filter((o) => !replaceSet.has(o.sheet_name));
      const now = Date.now();
      const getFreshPatch = (order: Pick<Order, "id" | "sheet_name">) => {
        const key = getLocalOrderKey(order.id, order.sheet_name);
        const entry = recentOrderPatchesRef.current[key];
        if (!entry) return null;
        if (now - entry.at > RECENT_OPTIMISTIC_MS) {
          delete recentOrderPatchesRef.current[key];
          return null;
        }
        return entry.updates;
      };
      const patchedNewData = newData.map((order) => {
        const patch = getFreshPatch(order);
        return patch ? { ...order, ...patch, id: order.id, sheet_name: order.sheet_name } : order;
      });
      const incomingKeys = new Set(
        patchedNewData.map((order) => getLocalOrderKey(order.id, order.sheet_name)),
      );
      const recentMissing = prev
        .filter(
          (order) =>
            replaceSet.has(order.sheet_name) &&
            !incomingKeys.has(getLocalOrderKey(order.id, order.sheet_name)) &&
            getFreshPatch(order),
        )
        .map((order) => ({ ...order, ...getFreshPatch(order) }));
      const seen = new Set<string>();
      return [...filtered, ...recentMissing, ...patchedNewData].filter((order) => {
        const identity = getOrderIdentity(order as any) || `row:${order.sheet_name}:${order.id}`;
        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
      });
    },
    [],
  );

  const applyOptimisticOrderUpdate = useCallback(
    (id: string | number, sheet: string, updates: Partial<Order>) => {
      const key = getLocalOrderKey(id, sheet);
      recentOrderPatchesRef.current[key] = {
        updates: { ...(recentOrderPatchesRef.current[key]?.updates || {}), ...updates },
        at: Date.now(),
      };
      setAllOrders((prev) =>
        prev.map((o) => (o.id === id && o.sheet_name === sheet ? { ...o, ...updates } : o)),
      );
      setSelectedOrder((prev) =>
        prev && prev.id === id && prev.sheet_name === sheet ? { ...prev, ...updates } : prev,
      );
    },
    [],
  );

  const normalizeOrderFromSheet = useCallback((order: Order, sheetName: string): Order => {
    const withSheet = { ...order, sheet_name: order.sheet_name || sheetName, _fromSheet: true };
    const warningImage = getWarningImageSource(withSheet as any);
    return warningImage
      ? { ...withSheet, warningBase64: warningImage, warningImageUrl: warningImage, missing: true }
      : withSheet;
  }, []);

  const applyApiResponse = useCallback(
    (json: ApiResponse, isBackground: boolean) => {
      if (json.status !== "success") return;
      const meta = json.meta || ({} as ApiResponse["meta"]);
      // The sheet reports figures for every month it can see, but Supabase is the
      // record for all of them except the live one. Only that month's totals are
      // taken from the sheet; the rest keep the figures Supabase supplied.
      setMonthlyStats((prev) => {
        const merged = { ...prev };
        for (const [month, stats] of Object.entries(meta.monthly_stats || {})) {
          if (isLiveMonth(month)) merged[month] = stats;
        }
        return merged;
      });
      const scriptActiveSheet = meta.active_sheet || DEFAULT_MONTH;
      const data = (Array.isArray(json.data) ? json.data : []).map((o) =>
        normalizeOrderFromSheet(o, scriptActiveSheet),
      );
      if (!isBackground) {
        if (
          !localStorage.getItem("app_viewingMonth") ||
          !getAllMonths().includes(localStorage.getItem("app_viewingMonth") || "")
        ) {
          setViewingMonth(scriptActiveSheet);
        }
        if (
          !localStorage.getItem("app_activeYear") ||
          !YEARS_CONFIG[localStorage.getItem("app_activeYear") || ""]
        )
          setActiveYear(DEFAULT_YEAR);
      }
      const sheets = data.length
        ? [...new Set(data.map((o) => o.sheet_name).filter(Boolean))]
        : [scriptActiveSheet];
      setAllOrders((prev) => mergeOrders(prev, data, sheets));
      setLoadedMonths((prev) => {
        const next = new Set(prev);
        sheets.forEach((sheet) => next.add(sheet));
        return next;
      });
    },
    [mergeOrders, normalizeOrderFromSheet],
  );

  const fetchInitialData = useCallback(async () => {
    if (!role) return; // Don't fetch if not logged in

    // Supabase is the only source for history, and it answers in well under a
    // second, so this is the one thing the first paint waits for.
    try {
      const data = await loadOrders();
      const { orders, months } = flattenOrders(data);

      // Proof of what actually crosses into React state.
      console.log(
        `[state] setAllOrders <- ${orders.length} orders, ${months.length} months:`,
        months.join(", "),
      );

      setMonthlyStats((prev) => ({ ...prev, ...data.stats }));
      setAllOrders((prev) => {
        const next = mergeOrders(prev, orders, months);
        console.log(`[state] allOrders is now ${next.length}`);
        return next;
      });
      setLoadedMonths((prev) => {
        const next = new Set(prev);
        // Only months Supabase owns are marked loaded; a live month stays unmarked so
        // it is still fetched from the sheet.
        months.filter((month) => !isLiveMonth(month)).forEach((month) => next.add(month));
        return next;
      });
      setLoadError(null);
      setLoading(false);
    } catch (error) {
      const reason = error instanceof OrdersLoadError ? error.reason : "unreachable";
      const message = error instanceof Error ? error.message : "Could not load orders.";
      console.error(`[state] no orders reached the screen — ${reason}`);
      setLoadError(message);
      setLoading(false);

      // A stale sign-in is the one failure the user can fix, so send them to the
      // login screen instead of leaving an empty page with a toast.
      if (reason === "no-session") {
        localStorage.removeItem("auth_role");
        setRole(null);
        toast.error("Please sign in again.");
        return;
      }
      toast.error(message);
    }

    // The live month comes from Apps Script, which takes around fifteen seconds.
    // Deliberately not awaited: the app is already usable, and this fills July in
    // when it arrives rather than holding the screen until it does.
    void (async () => {
      try {
        const res = await fetchWithRetry(`${SCRIPT_URL}?t=${Date.now()}`);
        const text = await res.text();
        let json: ApiResponse | null = null;
        try {
          json = JSON.parse(text);
        } catch {
          console.warn("Invalid JSON from the sheet:", text.substring(0, 50));
        }
        if (json && json.status === "success") applyApiResponse(json, true);
      } catch (err) {
        console.warn("Live month fetch failed; Supabase data still stands", err);
      }
    })();
  }, [applyApiResponse, mergeOrders, role]);

  const fetchMonthData = useCallback(
    async (month: string, force = false) => {
      if (!role) return;
      // Supabase is the record for every month except the live one, so the sheet is
      // not consulted for the rest.
      if (!isLiveMonth(month)) return;
      if (!force && loadedMonthsRef.current.has(month) && month !== viewingMonth) return;
      const cacheKey = `app_month_data_${month}`;
      const cached = localStorage.getItem(cacheKey);
      let hasCached = false;
      if (cached) {
        try {
          const json: ApiResponse = JSON.parse(cached);
          if (json.status === "success") {
            const data = (Array.isArray(json.data) ? json.data : []).map((o) =>
              normalizeOrderFromSheet(o, month),
            );
            setAllOrders((prev) => mergeOrders(prev, data, month));
            setLoadedMonths((prev) => new Set(prev).add(month));
            hasCached = true;
          }
        } catch (e) {
          /* ignore */
        }
      }
      if (hasCached && !force && month !== viewingMonth) return;
      // Only show loading if no cached data AND no orders at all
      if (!hasCached && allOrders.length === 0) setLoading(true);

      try {
        const res = await fetchWithRetry(`${SCRIPT_URL}?month=${month}&t=${Date.now()}`);
        const text = await res.text();
        let json: ApiResponse | null = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.warn("Invalid DB JSON");
        }
        if (json && json.status === "success") {
          const data = (Array.isArray(json.data) ? json.data : []).map((o) =>
            normalizeOrderFromSheet(o, month),
          );
          localStorage.setItem(cacheKey, JSON.stringify(json));
          setAllOrders((prev) => mergeOrders(prev, data, month));
          setLoadedMonths((prev) => new Set(prev).add(month));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [allOrders.length, mergeOrders, normalizeOrderFromSheet, role, viewingMonth],
  );

  const loadAllHistory = useCallback(async () => {
    if (historyLoadInFlightRef.current) return;
    historyLoadInFlightRef.current = true;
    setIsSearchingAll(true);
    try {
      // Parallelize with a small concurrency window — much faster than 1.5s/month serial
      const pending = ALL_MONTHS.filter(
        (m) => !loadedMonthsRef.current.has(m) && (monthlyStats[m]?.count || 0) > 0,
      );
      const CONCURRENCY = 6;
      let i = 0;
      const workers = Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
        while (i < pending.length) {
          const m = pending[i++];
          await fetchMonthData(m);
        }
      });
      await Promise.all(workers);
    } finally {
      historyLoadInFlightRef.current = false;
      setIsSearchingAll(false);
    }
  }, [fetchMonthData, monthlyStats]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchGiftCards = useCallback(async () => {
    if (role !== "owner") return;
    try {
      const res = await fetchWithRetry(`${SCRIPT_URL}?action=get_gift_cards&t=${Date.now()}`);
      const text = await res.text();
      const json = JSON.parse(text);
      if (json?.status === "success" && Array.isArray(json.gift_cards)) {
        setGiftCardsBackendIsLegacy(false);
        setGiftCards(mergeGiftCards(json.gift_cards));
      } else if (json?.status === "success" && Array.isArray(json.data)) {
        // No `gift_cards` key means the Apps Script deployment predates the
        // dedicated Gift Card sheet, so only the legacy order rows are readable.
        setGiftCardsBackendIsLegacy(true);
        const known = new Map(readLocalGiftCards().map((card) => [card.id, card]));
        setGiftCards(
          mergeGiftCards(
            json.data
              .filter((order: Order) => order.sheet_name === "Gift Card")
              .map((order: Order) => {
                const price = Number(order.price || 300) || 300;
                const id = String(order.id);
                return hydrateLegacyGiftCard(
                  {
                    id,
                    date: String(order.date || ""),
                    card_number: String(order.insta || ""),
                    card_pin: String(order.name || "").replace(/^PIN\s+/i, ""),
                    payment_method: String(order.pics_text || ""),
                    payment_other: "",
                    card_price: price,
                    spent: 0,
                    remaining: price,
                    linked_boxes: [],
                    notes: String(order.note || ""),
                  },
                  known.get(id),
                );
              })
              .filter((card: GiftCard) => card.card_number),
          ),
        );
      } else {
        setGiftCards(mergeGiftCards([]));
      }
    } catch (e) {
      console.warn("Gift cards fetch failed", e);
      setGiftCards(mergeGiftCards([]));
    }
  }, [role]);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);
  useEffect(() => {
    if (viewingMonth && !loadedMonths.has(viewingMonth)) fetchMonthData(viewingMonth);
  }, [viewingMonth, loadedMonths, fetchMonthData]);
  useEffect(() => {
    if (!viewingMonth || !role) return;
    getRecentSearchMonths(viewingMonth).forEach((month) => {
      if (!loadedMonths.has(month)) fetchMonthData(month);
    });
  }, [viewingMonth, loadedMonths, fetchMonthData, role]);

  // Force refresh a specific month — clears cache and re-fetches immediately
  const forceRefreshMonth = useCallback(
    async (month: string) => {
      if (!role) return;
      if (!isLiveMonth(month)) return;
      // Clear stale cache
      localStorage.removeItem(`app_month_data_${month}`);
      localStorage.removeItem("app_initial_data");
      try {
        // Fetch active sheet stats first
        const resMain = await fetchWithRetry(`${SCRIPT_URL}?t=${Date.now()}`);
        const textMain = await resMain.text();
        let jsonMain: ApiResponse | null = null;
        try {
          jsonMain = JSON.parse(textMain);
        } catch (e) {
          // ignore malformed response
        }

        if (jsonMain && jsonMain.status === "success") {
          localStorage.setItem("app_initial_data", JSON.stringify(jsonMain));
          const meta = jsonMain.meta || ({} as ApiResponse["meta"]);
          const scriptActiveSheet = meta.active_sheet || DEFAULT_MONTH;
          const data = (Array.isArray(jsonMain.data) ? jsonMain.data : []).map((o) =>
            normalizeOrderFromSheet(o, scriptActiveSheet),
          );
          setMonthlyStats(meta.monthly_stats || {});
          if (data.length) {
            const sheets = [...new Set(data.map((o) => o.sheet_name).filter(Boolean))];
            setAllOrders((prev) => mergeOrders(prev, data, sheets));
            setLoadedMonths((prev) => {
              const next = new Set(prev);
              sheets.forEach((sheet) => next.add(sheet));
              return next;
            });
          }
        }

        // Then fetch the specific month
        const resMonth = await fetchWithRetry(`${SCRIPT_URL}?month=${month}&t=${Date.now()}`);
        const textMonth = await resMonth.text();
        let jsonMonth: ApiResponse | null = null;
        try {
          jsonMonth = JSON.parse(textMonth);
        } catch (e) {
          // ignore malformed response
        }

        if (jsonMonth && jsonMonth.status === "success") {
          const data = (Array.isArray(jsonMonth.data) ? jsonMonth.data : []).map((o) =>
            normalizeOrderFromSheet(o, month),
          );
          localStorage.setItem(`app_month_data_${month}`, JSON.stringify(jsonMonth));
          setAllOrders((prev) => mergeOrders(prev, data, month));
          setLoadedMonths((prev) => new Set(prev).add(month));
        }
      } catch (err) {
        console.warn(
          "Force refresh issue (network/timeout):",
          err instanceof Error ? err.message : err,
        );
      }
    },
    [mergeOrders, normalizeOrderFromSheet, role],
  );

  const handleSetActiveMonth = useCallback(
    async (month: string) => {
      if (role !== "owner") return;
      const previousMonth = activeMonth;
      setActiveMonth(month);
      setViewingMonth(month);
      localStorage.removeItem("app_initial_data");

      try {
        const res = await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "set_active_sheet",
            sheet_name: month,
            role,
          }),
        });
        const text = await res.text();
        let json: any = null;
        try {
          json = JSON.parse(text);
        } catch (_) {
          // ignore malformed response
        }
        if (!json || json.status !== "success") {
          throw new Error(json?.message || "Could not change active month");
        }
        toast.success(`New orders will go to ${month}`);
        forceRefreshMonth(month);
      } catch (err) {
        setActiveMonth(previousMonth);
        toast.error(err instanceof Error ? err.message : "Could not change active month");
      }
    },
    [activeMonth, forceRefreshMonth, role],
  );

  const refreshTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const refreshInFlightRef = useRef<Record<string, boolean>>({});
  const refreshQueuedRef = useRef<Record<string, boolean>>({});

  // Lightweight silent refresh — only fetches the current month, no loading spinner
  const silentRefresh = useCallback(
    (month?: string) => {
      if (!role) return;
      const target = month || viewingMonth;
      // Owned months are served from the snapshot, so refreshing them would pull
      // the sheet's rows back in behind the scenes.
      if (!isLiveMonth(target)) return;

      if (refreshTimeoutRef.current[target]) {
        clearTimeout(refreshTimeoutRef.current[target]);
      }

      refreshTimeoutRef.current[target] = setTimeout(async () => {
        if (refreshInFlightRef.current[target]) {
          refreshQueuedRef.current[target] = true;
          return;
        }
        refreshInFlightRef.current[target] = true;
        let timeout: number | undefined;
        try {
          const ctrl = new AbortController();
          ((silentRefresh as any)._ctrls ||= {})[target] = ctrl;
          timeout = window.setTimeout(() => ctrl.abort(), 30000);
          const res = await fetch(`${SCRIPT_URL}?month=${target}&skip_stats=true&t=${Date.now()}`, {
            credentials: "omit",
            signal: ctrl.signal,
          });
          const text = await res.text();
          let json: ApiResponse | null = null;
          try {
            json = JSON.parse(text);
          } catch (e) {
            // ignore malformed response
          }
          if (json && json.status === "success") {
            localStorage.setItem(`app_month_data_${target}`, JSON.stringify(json));
            const meta = json.meta || ({} as ApiResponse["meta"]);
            const data = (Array.isArray(json.data) ? json.data : []).map((o) =>
              normalizeOrderFromSheet(o, target),
            );
            setMonthlyStats((prev) => ({ ...prev, ...(meta.monthly_stats || {}) }));
            if (data.length) {
              setAllOrders((prev) => mergeOrders(prev, data, target));
              setLoadedMonths((prev) => new Set(prev).add(target));
            }
          }
        } catch (_) {
          /* silent */
        } finally {
          if (timeout) window.clearTimeout(timeout);
          refreshInFlightRef.current[target] = false;
          if (refreshQueuedRef.current[target]) {
            refreshQueuedRef.current[target] = false;
            silentRefresh(target);
          }
        }
      }, 0);
    },
    [viewingMonth, mergeOrders, normalizeOrderFromSheet, role],
  );

  const handleDelete = useCallback(
    async (id: string | number, sheetName: string) => {
      const orderToDelete = allOrders.find((o) => o.id === id && o.sheet_name === sheetName);
      // Optimistic: remove immediately
      setAllOrders((prev) => prev.filter((o) => !(o.id === id && o.sheet_name === sheetName)));

      if (orderToDelete) {
        sendNotification("delete", orderDeleted(orderToDelete), role, orderToDelete);
      }

      try {
        // Supabase first: if it refuses, the sheet is left alone and the order still
        // exists in both places, so the delete can simply be retried. Deleting the
        // sheet copy first is what left an unreachable row behind in Supabase.
        const removed = await deleteOrderEverywhere("kurdistani", {
          unique_order_id: orderToDelete?.unique_order_id,
          sheet_name: sheetName,
          id,
        });
        if (!removed.ok) {
          toast.error(removed.error || "Could not delete from the database");
          return;
        }
        if (removed.supabaseDeleted === 0) {
          // Orders created before the linking key existed have no matching row, so
          // say so rather than implying both copies are gone.
          toast.warning("Removed from the sheet — no matching database row was found.");
        }

        await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "delete",
            row_id: id,
            sheet: sheetName,
          }),
        });
        broadcastOrderChange({}, sheetName, id, "delete");
        recordOrderDeleted("kurdistani", sheetName, id).catch((err) =>
          console.warn("Failed to update team delete stats", err),
        );
      } catch (err) {
        console.error(err);
      }
      // Quick silent refresh after action
      setTimeout(() => silentRefresh(sheetName), 250);
    },
    [silentRefresh],
  );

  const handleFormSuccess = useCallback(
    (payload?: any, rowIdStr?: string) => {
      const wasEditing = Boolean(editingOrder);
      setEditingOrder(null);
      localStorage.removeItem("app_editingOrder");
      setActiveTab(wasEditing ? editReturnTabRef.current : "orders");
      localStorage.removeItem("app_editReturnTab");

      /*
       * Show the month the order actually went into.
       *
       * A new order always goes to the current month, but the list shows whichever month is
       * being viewed. Saving an order while looking at an earlier month dropped you back on
       * a list that could not contain it — the order was saved, and invisible.
       */
      const savedInto = String(payload?.sheet || payload?.sheet_name || "").trim();
      if (savedInto && !wasEditing) {
        setViewingMonth(savedInto);
        setSelectedMonths([savedInto]);
      }

      // LIVE / Optimistic update without delay!
      if (payload) {
        setAllOrders((prev) => {
          const idToFind =
            payload.row_id || (rowIdStr ? parseInt(rowIdStr.replace(/\D/g, "")) : Date.now());
          const tempId = payload._tempId;
          const payloadIdentity = getOrderIdentity(payload);
          const exists = prev.some(
            (o) =>
              (o.id === idToFind && o.sheet_name === payload.sheet) ||
              (!!payloadIdentity && getOrderIdentity(o as any) === payloadIdentity),
          );

          // Reconcile: when the real row id arrives after an optimistic insert,
          // upgrade the temp record in place instead of creating a duplicate.
          if (tempId && tempId !== idToFind) {
            const hasTemp = prev.some((o) => o.id === tempId && o.sheet_name === payload.sheet);
            if (hasTemp) {
              return prev.map((o) =>
                o.id === tempId && o.sheet_name === payload.sheet
                  ? { ...o, ...payload, id: idToFind }
                  : o,
              );
            }
          }

          // Build the optimistic linked-id set for the edited/created order.
          const hasLinkedOrderPatch = Object.prototype.hasOwnProperty.call(
            payload,
            "linkedOrderIds",
          );
          const newLinkedIds: (string | number)[] = Array.isArray(payload.linkedOrderIds)
            ? payload.linkedOrderIds
            : [];

          // Also optimistically update every linked order so add/remove shows on both sides
          // immediately, without waiting for the next sheet refresh.
          const patchLinkedSides = (orders: Order[]): Order[] => {
            const sourceKey = `${idToFind}:${payload.sheet}`;
            const normalizeKey = (id: string | number, fallbackSheet: string) => {
              const text = String(id);
              return text.includes(":") ? text : `${text}:${fallbackSheet}`;
            };
            const nextLinkedKeys = new Set(
              newLinkedIds.map((id) => {
                return normalizeKey(id, payload.sheet);
              }),
            );
            return orders.map((o) => {
              const oKey = `${o.id}:${o.sheet_name}`;
              const existing = Array.isArray(o.linkedOrderIds) ? o.linkedOrderIds : [];
              const isSelectedLinked = nextLinkedKeys.has(oKey);
              const alreadyLinkedToSource = existing.some(
                (id) => normalizeKey(id, o.sheet_name) === sourceKey,
              );
              if (!isSelectedLinked && !alreadyLinkedToSource) return o;
              const cleaned = existing.filter((id) => normalizeKey(id, o.sheet_name) !== sourceKey);
              return { ...o, linkedOrderIds: isSelectedLinked ? [...cleaned, sourceKey] : cleaned };
            });
          };

          if (exists) {
            // Editing existing
            sendNotification("edit", orderEdited({ insta: payload.insta }), role, {
              id: idToFind,
              sheet_name: payload.sheet,
            });
            const updated = prev.map((o) =>
              (o.id === idToFind && o.sheet_name === payload.sheet) ||
              (!!payloadIdentity && getOrderIdentity(o as any) === payloadIdentity)
                ? { ...o, ...payload, id: idToFind, sheet_name: payload.sheet || o.sheet_name }
                : o,
            );
            return hasLinkedOrderPatch ? patchLinkedSides(updated) : updated;
          } else {
            // New order
            const newOrder: Order = {
              id: idToFind,
              sheet_name: payload.sheet || viewingMonth,
              ...payload,
            };
            const updated = [newOrder, ...prev];
            return hasLinkedOrderPatch ? patchLinkedSides(updated) : updated;
          }
        });
      }

      const changedSheet = payload?.sheet || payload?.sheet_name || viewingMonth;

      // Rapid refresh after submission to sync cleanly
      silentRefresh(changedSheet);
      setTimeout(() => silentRefresh(changedSheet), 900);

      // Broadcast to other clients for sub-second sync (bypasses ~10s GAS read)
      if (payload && (!payload._tempId || payload.row_id !== payload._tempId)) {
        const idToFind =
          payload.row_id || (rowIdStr ? parseInt(rowIdStr.replace(/\D/g, "")) : Date.now());
        broadcastOrderChange(payload, changedSheet, idToFind, "upsert");
      }
    },
    [editingOrder, silentRefresh, viewingMonth],
  );

  /**
   * Opens an order for editing, remembering where to come back to.
   *
   * The tab defaults to the one on screen rather than being named by the caller. Editing an
   * order from the Boxes screen used to hand back "orders", so finishing the edit dropped
   * you on the total order list instead of the box you were working through — the caller was
   * naming a destination instead of the place you actually came from.
   */
  /*
   * The local copy belongs to whoever was signed in when it was written. Clearing it on the
   * way out means the next person to sign in on this device cannot be shown the previous
   * one's orders for the moment before the real read lands.
   */
  useEffect(() => {
    const onSignOut = () => clearCachedOrders();
    window.addEventListener("app-signed-out", onSignOut);
    return () => window.removeEventListener("app-signed-out", onSignOut);
  }, []);

  const beginEditingOrder = useCallback((order: Order, returnTab?: string) => {
    const back = returnTab || activeTabRef.current || "orders";
    editReturnTabRef.current = back;
    localStorage.setItem("app_editReturnTab", back);
    localStorage.setItem("app_editingOrder", JSON.stringify(order));
    setEditingOrder(order);
    setActiveTab("new-order");
  }, []);

  const handleStatusChange = useCallback(
    async (order: Order, newStatus: string, options?: { silent?: boolean }) => {
      if (order.is_finished) return;
      const newExtra = buildStatusExtra(order.extra, newStatus);
      // Optimistic update
      applyOptimisticOrderUpdate(order.id, order.sheet_name, {
        extra: newExtra,
        status: newStatus as Order["status"],
      });

      // Silent when a whole box is being updated at once - the caller sends one
      // box-level notification instead of one per order.
      if (!options?.silent) {
        if (newStatus === "DELIVERY_SCANNED" || newStatus === "arrived") {
          sendNotification("deliver", orderDelivered(order), role, order);
        } else if (newStatus === "purchased") {
          sendNotification("approve", orderPurchased(order), role, order);
        }
      }

      // Fire request then refresh
      try {
        const proofStr = Array.isArray(order.proof_urls)
          ? order.proof_urls.filter(Boolean).join(",")
          : order.proof_urls || "";
        const {
          customer_price: _customerPrice,
          linkedOrderIds: _linkedOrderIds,
          ...orderForStatus
        } = order as any;
        const currentSheetPrice = order.price ?? "";

        // Supabase first, so the two copies cannot drift. A status lives in the
        // `extra` tag as well as the status column, so both are sent.
        const synced = await updateOrderEverywhere("kurdistani", order, {
          extra: newExtra,
          status: newStatus,
        });
        if (!synced.ok) {
          toast.error(synced.error || "Could not save the status to the database");
          return;
        }
        if (synced.supabaseUpdated === 0) {
          // Not in Supabase yet — the sheet is still the working copy, so the change
          // goes ahead rather than being blocked.
          console.warn("Status saved to the sheet only; this order is not in Supabase yet");
        }

        await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            ...orderForStatus,
            sheet: order.sheet_name,
            row_id: order.id,
            price: currentSheetPrice,
            sheet_price: currentSheetPrice,
            extra: newExtra,
            force_update: true,
            status_color: newStatus,
            // Preserve proof images across status updates (Apps Script overwrites empty fields)
            proof_urls: proofStr,
            image_url: order.image_url || proofStr || "",
            primary_urls: order.primary_urls || "",
          }),
        });
        broadcastOrderChange({ ...order, extra: newExtra }, order.sheet_name, order.id, "upsert");
      } catch (e) {
        console.error(e);
      }
      silentRefresh(order.sheet_name);
      setTimeout(() => silentRefresh(order.sheet_name), 250);
      setTimeout(() => silentRefresh(order.sheet_name), 6000);
    },
    [applyOptimisticOrderUpdate, silentRefresh],
  );

  useEffect(() => {
    const readyOrders = allOrders.filter((order) =>
      shouldAutoMovePurchasedToTransit(order, getOrderStatus(order)),
    );

    readyOrders.forEach((order) => {
      const key = `${order.sheet_name}:${order.id}`;
      if (autoTransitInFlightRef.current.has(key)) return;

      autoTransitInFlightRef.current.add(key);
      handleStatusChange(order, "in_transit").finally(() => {
        autoTransitInFlightRef.current.delete(key);
      });
    });
  }, [allOrders, handleStatusChange]);

  const handleBatchRefresh = useCallback(() => {
    silentRefresh(viewingMonth);
  }, [silentRefresh, viewingMonth]);

  // Realtime: subscribe to Firestore broadcast for sub-second cross-client sync.
  // Bypasses the ~10s GAS sheet read by merging the change payload directly.
  useEffect(() => {
    if (!role) return;
    const unsub = subscribeOrderChanges(({ payload, sheet, row_id, action }) => {
      if (!sheet) return;
      // The snapshot is the record for these months, so a live edit broadcast by
      // another device must not add rows back into one.
      // A realtime edit from another device only applies to the live month; every
      // other month is read from Supabase.
      if (!isLiveMonth(sheet)) return;
      const id = typeof row_id === "string" ? parseInt(row_id) || row_id : row_id;
      setAllOrders((prev) => {
        if (action === "delete") {
          return prev.filter((o) => !(o.id === id && o.sheet_name === sheet));
        }
        const exists = prev.some((o) => o.id === id && o.sheet_name === sheet);
        const payloadIdentity = getOrderIdentity({ ...payload, sheet_name: sheet });
        const existingIdentityIndex = payloadIdentity
          ? prev.findIndex((o) => getOrderIdentity(o as any) === payloadIdentity)
          : -1;
        if (existingIdentityIndex >= 0) {
          return prev.map((o, index) =>
            index === existingIdentityIndex ? { ...o, ...payload, id, sheet_name: sheet } : o,
          );
        }
        if (exists) {
          // Do NOT overwrite existing orders from realtime broadcasts.
          // Broadcast payloads can be partial/stale and have been observed
          // changing data on other clients without intent. The authoritative
          // sheet poll will sync any real updates.
          return prev;
        }
        return [{ id, sheet_name: sheet, ...payload } as Order, ...prev];
      });
    });
    return () => unsub();
  }, [role]);

  const sortedOrders = useMemo(() => sortByNewest(allOrders), [allOrders]);
  const searchEntries = useMemo(
    () =>
      sortedOrders.map((order) => {
        const text = buildSearchText(order);
        const orderNoText = `${order.orderNo || ""} ${order.id || ""}`.toLowerCase();
        return {
          order,
          text,
          tokens: tokenizeSearchText(text),
          digits: text.replace(/\D/g, "").replace(/^0+/, ""),
          // The order's numbers with the country code and trunk zero taken off, so any way
          // of writing a number finds it.
          phones: orderPhoneKeys(order),
          orderNoText,
          orderNoDigits: orderNoText.replace(/\D/g, "").replace(/^0+/, ""),
        };
      }),
    [sortedOrders],
  );

  const filteredOrders = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();

    // A search looks across every month until a month is tapped: typing a name is for
    // finding that customer wherever they are, and limiting it to the month on screen
    // would hide the rest. Once a month is tapped it narrows to that month, and
    // filtering before the text match keeps the matcher off the months being ignored.
    const narrowed = !q || monthPickedForSearch.current;
    const monthSet = new Set(selectedMonths);
    const inChosenMonths = (order: Order) => !narrowed || monthSet.has(order.sheet_name);
    const recentSearchEntries = narrowed
      ? searchEntries.filter((e) => inChosenMonths(e.order))
      : searchEntries;

    let list: Order[];
    if (STATUS_OPTIONS.includes(q as any)) {
      list = sortedOrders.filter((o) => inChosenMonths(o) && getOrderStatus(o) === q);
    } else if (q === "pic")
      list = sortedOrders.filter(
        (o) =>
          inChosenMonths(o) &&
          (o.imageBase64 ||
            o.image_url ||
            o.primary_urls ||
            getWarningImageSource(o as any) ||
            o.proof_urls?.length ||
            o.secondaryImages?.length),
      );
    else if (q) {
      const orderNoMatch = q.match(/^order:\s*(.+)$/);
      if (orderNoMatch) {
        const orderNeedle = orderNoMatch[1].trim().toLowerCase();
        const orderDigits = orderNeedle.replace(/\D/g, "").replace(/^0+/, "");
        list = recentSearchEntries
          .filter(
            (e) =>
              e.orderNoText.includes(orderNeedle) ||
              (!!orderDigits && e.orderNoDigits.includes(orderDigits)),
          )
          .map((e) => e.order);
        return list;
      }
      const qDigits = q.replace(/\D/g, "");
      const qStripped = qDigits.replace(/^0+/, "");
      // A phone number typed in any shape, reduced to the same form the entries carry.
      const qPhone = looksLikePhoneQuery(q) ? canonicalPhone(q) : "";
      if (qPhone) {
        const byPhone = recentSearchEntries.filter((e) => e.phones.includes(qPhone));
        if (byPhone.length) return byPhone.map((e) => e.order);
      }
      const terms = tokenizeSearchText(q);
      const strongMatches = terms.length
        ? recentSearchEntries.filter((e) => strongTextMatch(e.tokens, terms))
        : [];
      list = (
        strongMatches.length
          ? strongMatches
          : recentSearchEntries.filter(
              (e) => looseTextMatch(e.text, terms) || (qStripped && e.digits.includes(qStripped)),
            )
      ).map((e) => e.order);
    } else list = sortedOrders.filter(inChosenMonths);
    return list;
  }, [sortedOrders, searchEntries, selectedMonths, deferredSearchQuery, monthFilterTick]);

  const viewingMonthOrders = useMemo(
    () => sortedOrders.filter((o) => o.sheet_name === viewingMonth),
    [sortedOrders, viewingMonth],
  );

  const deliveryOrders = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();
    const isDeliveryOrder = (order: Order) =>
      order.sheet_name === viewingMonth &&
      (getOrderStatus(order) === "arrived" ||
        String(order.note || "").includes("[DELIVERY_SCANNED]") ||
        String(order.extra || "").includes("[DELIVERY_SCANNED]"));
    const allArrived = sortedOrders.filter(isDeliveryOrder);
    if (!q) return allArrived;
    const qDigits = q.replace(/\D/g, "");
    const qStripped = qDigits.replace(/^0+/, "");
    const qPhone = looksLikePhoneQuery(q) ? canonicalPhone(q) : "";
    if (qPhone) {
      const byPhone = allArrived.filter((o) => orderPhoneKeys(o).includes(qPhone));
      if (byPhone.length) return byPhone;
    }
    return searchEntries
      .filter(
        (e) =>
          isDeliveryOrder(e.order) &&
          (e.text.includes(q) || (qStripped && e.digits.includes(qStripped))),
      )
      .map((e) => e.order);
  }, [sortedOrders, searchEntries, deferredSearchQuery, viewingMonth]);

  const availableMonths = useMemo(() => {
    // extraYearMonths is not read directly — it is a dependency so the list
    // recomputes when a snapshot introduces custom month names.
    void extraYearMonths;
    return getYearMonths(activeYear).filter(
      (m) =>
        m === activeMonth ||
        m === ACTIVE_ORDER_SHEET ||
        (monthlyStats[m]?.count || 0) > 0 ||
        allOrders.some((o) => o.sheet_name === m),
    );
  }, [activeYear, activeMonth, monthlyStats, allOrders, extraYearMonths]);

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(viewingMonth)) {
      setViewingMonth(availableMonths[0]);
    }
  }, [activeYear, availableMonths, viewingMonth]);

  const handleUpdateOrder = useCallback(
    (id: string | number, sheet: string, updates: Partial<Order>) => {
      applyOptimisticOrderUpdate(id, sheet, updates);
    },
    [applyOptimisticOrderUpdate],
  );

  const renderContent = () => {
    // An empty screen used to be the only symptom of a failed load. Showing why, with
    // a way to retry, means a database or sign-in problem is never mistaken for
    // "there is no data".
    if (loadError && allOrders.length === 0) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center py-20">
          <div className="max-w-md space-y-4 rounded-2xl border border-border/80 bg-card p-6 text-center">
            <h2 className="text-lg font-extrabold tracking-tight">Orders could not be loaded</h2>
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    if (loading && allOrders.length === 0) {
      return (
        <div className="flex items-center justify-center py-20 min-h-[60vh]">
          <div className="text-center flex flex-col items-center justify-center space-y-4">
            <img
              src="/logo-512.png"
              alt="Shein Kurdistani Logo"
              className="w-24 h-36 object-cover rounded-xl shadow-lg border-2 border-primary/20 animate-pulse"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/200x300/400/FFF?text=Loading...";
              }}
            />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm font-bold tracking-widest uppercase">
                Loading...
              </p>
            </div>
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            stats={monthlyStats[viewingMonth]}
            orders={viewingMonthOrders}
            allOrders={allOrders}
            viewingMonth={viewingMonth}
            availableMonths={availableMonths}
            setViewingMonth={setViewingMonth}
            setActiveTab={setActiveTab}
            setSearchQuery={setSearchQuery}
            onNewOrder={() => setActiveTab("new-order")}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
          />
        );
      case "new-order":
        return (
          <OrderFormView
            activeSheet={editingOrder?.sheet_name || activeMonth}
            editingOrder={editingOrder}
            onCancel={() => {
              const returnTab = editingOrder ? editReturnTabRef.current : "orders";
              setEditingOrder(null);
              localStorage.removeItem("app_editingOrder");
              setActiveTab(returnTab);
            }}
            onSuccess={handleFormSuccess}
            allOrders={allOrders}
          />
        );
      case "orders":
      case "customers":
        return (
          <OrderListView
            role={role}
            isDeliveryTab={false}
            orders={filteredOrders}
            onEdit={(o) => beginEditingOrder(o)}
            onDelete={handleDelete}
            onOrderClick={setSelectedOrder}
            allOrders={allOrders}
            viewingMonth={viewingMonth}
            setViewingMonth={setViewingMonth}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            availableMonths={availableMonths}
            selectedMonths={selectedMonths}
            onToggleMonth={toggleMonth}
            onStatusChange={handleStatusChange}
            onNewOrder={() => setActiveTab("new-order")}
            onUpdateOrder={handleUpdateOrder}
          />
        );
      case "delivery":
        return (
          <OrderListView
            role={role}
            isDeliveryTab={true}
            orders={deliveryOrders}
            onEdit={(o) => beginEditingOrder(o)}
            onDelete={handleDelete}
            onOrderClick={setSelectedOrder}
            allOrders={allOrders}
            viewingMonth={viewingMonth}
            setViewingMonth={setViewingMonth}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            availableMonths={availableMonths}
            onStatusChange={handleStatusChange}
            onNewOrder={() => setActiveTab("new-order")}
            onUpdateOrder={handleUpdateOrder}
          />
        );
      case "batches":
        return (
          <BatchesView
            role={role!}
            orders={allOrders.filter((o) => o.sheet_name === viewingMonth)}
            allOrders={allOrders}
            giftCards={giftCards}
            onGiftCardsRefresh={fetchGiftCards}
            onOrderClick={setSelectedOrder}
            viewingMonth={viewingMonth}
            setViewingMonth={setViewingMonth}
            availableMonths={availableMonths}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            onRefresh={handleBatchRefresh}
            onStatusChange={handleStatusChange}
            onUpdateOrder={handleUpdateOrder}
          />
        );
      case "expenses":
        return <ExpensesView />;
      case "gift-cards":
        // The Supabase screen. The old one read gift cards through Apps Script, which has
        // no handler for them, so it showed a balance of zero and a warning about the
        // deployment being out of date. Cards live in the database now.
        return <GiftCardManagerView />;
      case "calculator":
        return <CalculatorView />;
      case "messages":
        return <MessagesView role={role!} allOrders={allOrders} profileMode={currentSystem} />;
      case "team-performance":
        return <TeamPerformanceView />;
      case "team":
        return (
          <TeamView
            role={role!}
            allOrders={allOrders}
            currentUser={localStorage.getItem("auth_username") || role!}
            profileMode={currentSystem}
            viewingMonth={viewingMonth}
            setViewingMonth={setViewingMonth}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            availableMonths={availableMonths}
            onOrderClick={setSelectedOrder}
            onOpenPerformance={() => setActiveTab("team-performance")}
          />
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_role");
    // The Supabase session outlives a reload by design, so it has to be ended here
    // too — otherwise the next person on this device is still signed in to the
    // database even though the app looks logged out.
    supabase.auth.signOut().catch((error) => console.warn("Sign out failed", error));
    setRole(null);
  };

  const handleNotificationClick = (orderId: string, sheetName: string) => {
    // Attempt to find the order in allOrders
    const order = allOrders.find((o) => String(o.id) === orderId && o.sheet_name === sheetName);
    if (order) {
      setSelectedOrder(order);
    } else {
      toast.error("Order not found in currently loaded data. It might be in an older month.");
    }
  };

  if (!role) {
    return <LoginView onLogin={setRole} />;
  }

  return (
    <>
      <AppLayout
        role={role}
        onLogout={handleLogout}
        onNotificationClick={handleNotificationClick}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchingAll={isSearchingAll}
        onSearchAll={loadAllHistory}
        onCameraSearch={() => setShowCameraSearch(true)}
        viewingMonth={viewingMonth}
        setViewingMonth={setViewingMonth}
        activeYear={activeYear}
        setActiveYear={setActiveYear}
        availableMonths={availableMonths}
        monthlyStats={monthlyStats}
        activeMonth={activeMonth}
        onSetActiveMonth={handleSetActiveMonth}
        currentSystem={currentSystem}
        onSystemChange={setCurrentSystem}
      >
        <React.Suspense
          fallback={<div className="p-4 text-sm text-muted-foreground">Loading...</div>}
        >
          {renderContent()}
        </React.Suspense>
      </AppLayout>
      <React.Suspense fallback={null}>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onEdit={(o) => {
              setSelectedOrder(null);
              beginEditingOrder(o, activeTab);
            }}
            onDelete={() => {
              setAllOrders((prev) =>
                prev.filter(
                  (o) => !(o.id === selectedOrder.id && o.sheet_name === selectedOrder.sheet_name),
                ),
              );
              setSelectedOrder(null);
              setTimeout(() => forceRefreshMonth(viewingMonth), 1000);
            }}
            allOrders={allOrders}
            onSuccess={(payload) => {
              setSelectedOrder(null);
              if (payload) handleFormSuccess(payload);
              else forceRefreshMonth(viewingMonth);
            }}
            onStatusChange={handleStatusChange}
            onUpdateOrder={handleUpdateOrder}
          />
        )}
        {showCameraSearch && (
          <CameraSearchModal
            allOrders={allOrders}
            onOrderClick={(o) => {
              setShowCameraSearch(false);
              setSelectedOrder(o);
            }}
            onClose={() => setShowCameraSearch(false)}
          />
        )}
      </React.Suspense>
    </>
  );
};

export default Index;
