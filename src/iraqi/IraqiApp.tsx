import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { deleteOrderEverywhere } from "@/lib/submitOrder";
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
} from "@/iraqi/types";
import { sendNotification } from "@/iraqi/lib/notifications";
import { fetchWithRetry } from "@/iraqi/lib/fetchWithRetry";
import { getWarningImageSource } from "@/lib/warning-image";
import { buildStatusExtra, shouldAutoMovePurchasedToTransit } from "@/lib/statusAutomation";
import { toast } from "sonner";
import AppLayout from "@/iraqi/components/app/AppLayout";
import { LoginView } from "@/iraqi/components/app/LoginView";
import { recordOrderDeleted } from "@/lib/teamActivity";

const DashboardView = React.lazy(() => import("@/iraqi/components/app/DashboardView"));
const OrderFormView = React.lazy(() => import("@/iraqi/components/app/OrderFormView"));
const OrderListView = React.lazy(() => import("@/iraqi/components/app/OrderListView"));
const OrderDetailModal = React.lazy(() => import("@/iraqi/components/app/OrderDetailModal"));
const BatchesView = React.lazy(() => import("@/iraqi/components/app/BatchesView"));
const ExpensesView = React.lazy(() => import("@/iraqi/components/app/ExpensesView"));
const GiftCardsView = React.lazy(() => import("@/iraqi/components/app/GiftCardsView"));
const CalculatorView = React.lazy(() => import("@/iraqi/components/app/CalculatorView"));
const CameraSearchModal = React.lazy(() => import("@/iraqi/components/app/CameraSearchModal"));
const MessagesView = React.lazy(() => import("@/iraqi/components/app/MessagesView"));
const TeamView = React.lazy(() => import("@/iraqi/components/app/TeamView"));

const DEFAULT_YEAR = Object.keys(YEARS_CONFIG).sort().pop() || "2026";
const DEFAULT_MONTH = ACTIVE_ORDER_SHEET;
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
const globalSort = (a: Order, b: Order) => {
  const diff = (sheetIndex[b.sheet_name] ?? 0) - (sheetIndex[a.sheet_name] ?? 0);
  if (diff !== 0) return diff;
  return Number(b.id) - Number(a.id);
};

const getRecentSearchMonths = (month: string) => {
  const index = ALL_MONTHS.indexOf(month);
  if (index < 0) return [month];
  return ALL_MONTHS.slice(Math.max(0, index - 2), index + 1);
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
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("iraqi_auth_role"));
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("iraqi_app_activeTab") || "orders",
  ); // default to 'orders' since it's the most common denominator
  const editReturnTabRef = useRef(localStorage.getItem("iraqi_app_editReturnTab") || "orders");

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
    const saved = localStorage.getItem("iraqi_app_activeYear");
    return saved && YEARS_CONFIG[saved] ? saved : DEFAULT_YEAR;
  });
  const [activeMonth, setActiveMonth] = useState(DEFAULT_MONTH);
  const [viewingMonth, setViewingMonth] = useState(() => {
    const saved = localStorage.getItem("iraqi_app_viewingMonth");
    return saved && ALL_MONTHS.includes(saved) ? saved : DEFAULT_MONTH;
  });

  useEffect(() => {
    localStorage.setItem("iraqi_app_activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("iraqi_app_activeYear", activeYear);
  }, [activeYear]);

  useEffect(() => {
    localStorage.setItem("iraqi_app_activeMonth", activeMonth);
  }, [activeMonth]);

  useEffect(() => {
    localStorage.setItem("iraqi_app_viewingMonth", viewingMonth);
  }, [viewingMonth]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const autoTransitInFlightRef = useRef<Set<string>>(new Set());
  const [monthlyStats, setMonthlyStats] = useState<Record<string, MonthlyStats>>({});
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [editingOrder, setEditingOrder] = useState<Order | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("iraqi_app_editingOrder") || "null");
    } catch {
      return null;
    }
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const recentOrderPatchesRef = useRef<Record<string, { updates: Partial<Order>; at: number }>>({});
  const [searchQuery, setSearchQuery] = useState(
    () => localStorage.getItem("iraqi_app_searchQuery") || "",
  );
  const [isSearchingAll, setIsSearchingAll] = useState(false);
  const [showCameraSearch, setShowCameraSearch] = useState(false);

  useEffect(() => {
    const versionKey = "iraqi_app_cache_version";
    if (localStorage.getItem(versionKey) === CACHE_VERSION) return;

    Object.keys(localStorage).forEach((key) => {
      if (key === "iraqi_app_initial_data" || key.startsWith("iraqi_app_month_data_")) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(versionKey, CACHE_VERSION);
  }, []);

  useEffect(() => {
    localStorage.setItem("iraqi_app_searchQuery", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem("iraqi_app_scrollY", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!loading) {
      const scrollY = sessionStorage.getItem("iraqi_app_scrollY");
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
    if (!localStorage.getItem("iraqi_app_activeTab")) {
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
      setMonthlyStats(meta.monthly_stats || {});
      const scriptActiveSheet = meta.active_sheet || DEFAULT_MONTH;
      setActiveMonth(scriptActiveSheet);
      const data = (Array.isArray(json.data) ? json.data : []).map((o) =>
        normalizeOrderFromSheet(o, scriptActiveSheet),
      );
      if (!isBackground) {
        // Only set to default if we don't have a saved one
        if (
          !localStorage.getItem("iraqi_app_viewingMonth") ||
          !ALL_MONTHS.includes(localStorage.getItem("iraqi_app_viewingMonth") || "")
        )
          setViewingMonth(scriptActiveSheet);
        if (
          !localStorage.getItem("iraqi_app_activeYear") ||
          !YEARS_CONFIG[localStorage.getItem("iraqi_app_activeYear") || ""]
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
    const cached = localStorage.getItem("iraqi_app_initial_data");
    let hasCached = false;
    if (cached) {
      try {
        const json: ApiResponse = JSON.parse(cached);
        applyApiResponse(json, false);
        hasCached = true;
        setLoading(false);
      } catch (e) {
        console.warn("Iraqi cache error", e);
      }
    }
    if (!hasCached) setLoading(true);

    try {
      const res = await fetchWithRetry(`${SCRIPT_URL}?t=${Date.now()}`);
      const text = await res.text();
      let json: ApiResponse | null = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.warn("Invalid JSON:", text.substring(0, 50));
      }
      if (json && json.status === "success") {
        localStorage.setItem("iraqi_app_initial_data", JSON.stringify(json));
        applyApiResponse(json, hasCached);
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [applyApiResponse, role]);

  const fetchMonthData = useCallback(
    async (month: string, force = false) => {
      if (!role) return;
      if (!force && loadedMonthsRef.current.has(month) && month !== viewingMonth) return;
      const cacheKey = `iraqi_app_month_data_${month}`;
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
        setGiftCards(json.gift_cards);
      }
    } catch (e) {
      console.warn("Gift cards fetch failed", e);
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
      localStorage.removeItem(`iraqi_app_month_data_${month}`);
      localStorage.removeItem("iraqi_app_initial_data");
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
          localStorage.setItem("iraqi_app_initial_data", JSON.stringify(jsonMain));
          const meta = jsonMain.meta || ({} as ApiResponse["meta"]);
          const scriptActiveSheet = meta.active_sheet || DEFAULT_MONTH;
          setActiveMonth(scriptActiveSheet);
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
          localStorage.setItem(`iraqi_app_month_data_${month}`, JSON.stringify(jsonMonth));
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
      localStorage.removeItem("iraqi_app_initial_data");

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
            localStorage.setItem(`iraqi_app_month_data_${target}`, JSON.stringify(json));
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
        sendNotification(
          "delete",
          `Order deleted: ${orderToDelete.name || orderToDelete.insta}`,
          role,
          orderToDelete,
        );
      }

      try {
        // Supabase first. Without this the row survived every delete made from the list,
        // so a removed order still counted towards whoever created it.
        const removed = await deleteOrderEverywhere("iraqi", {
          unique_order_id: orderToDelete?.unique_order_id,
          sheet_name: sheetName,
          id,
        });
        if (!removed.ok) {
          // Put the order back rather than leave the screen disagreeing with the database.
          if (orderToDelete) setAllOrders((prev) => [...prev, orderToDelete]);
          alert(removed.error || "Could not delete from the database. Nothing was removed.");
          return;
        }
        if (removed.supabaseDeleted === 0) {
          console.warn("[delete] no matching Supabase row; removing from the sheet only");
        }

        await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "delete",
            row_id: id,
            sheet: sheetName,
          }),
        });
        recordOrderDeleted("iraqi", sheetName, id).catch((err) =>
          console.warn("Failed to update Iraqi team delete stats", err),
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
      localStorage.removeItem("iraqi_app_editingOrder");
      setActiveTab(wasEditing ? editReturnTabRef.current : "orders");
      localStorage.removeItem("iraqi_app_editReturnTab");

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
            sendNotification("edit", `Order ${payload.insta || "edited"} was modified`, role, {
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
    },
    [editingOrder, silentRefresh, viewingMonth],
  );

  const beginEditingOrder = useCallback((order: Order, returnTab: string) => {
    editReturnTabRef.current = returnTab;
    localStorage.setItem("iraqi_app_editReturnTab", returnTab);
    localStorage.setItem("iraqi_app_editingOrder", JSON.stringify(order));
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
          sendNotification(
            "deliver",
            `Order arrived/delivered: ${order.name || order.insta}`,
            role,
            order,
          );
        } else if (newStatus === "purchased") {
          sendNotification("approve", `Order purchased: ${order.name || order.insta}`, role, order);
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

  const sortedOrders = useMemo(() => [...allOrders].sort(globalSort), [allOrders]);
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
          orderNoText,
          orderNoDigits: orderNoText.replace(/\D/g, "").replace(/^0+/, ""),
        };
      }),
    [sortedOrders],
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const recentSearchMonths = new Set(getRecentSearchMonths(viewingMonth));
    const recentSearchEntries = searchEntries.filter((e) =>
      recentSearchMonths.has(e.order.sheet_name),
    );
    let list: Order[];
    if (STATUS_OPTIONS.includes(q as any)) {
      list = sortedOrders.filter((o) => o.sheet_name === viewingMonth && getOrderStatus(o) === q);
    } else if (q === "pic")
      list = sortedOrders.filter(
        (o) =>
          o.imageBase64 ||
          o.image_url ||
          o.primary_urls ||
          getWarningImageSource(o as any) ||
          o.proof_urls?.length ||
          o.secondaryImages?.length,
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
    } else list = sortedOrders.filter((o) => o.sheet_name === viewingMonth);
    return list;
  }, [sortedOrders, searchEntries, viewingMonth, searchQuery]);

  const viewingMonthOrders = useMemo(
    () => sortedOrders.filter((o) => o.sheet_name === viewingMonth),
    [sortedOrders, viewingMonth],
  );

  const deliveryOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const isDeliveryOrder = (order: Order) =>
      order.sheet_name === viewingMonth &&
      (getOrderStatus(order) === "arrived" ||
        String(order.note || "").includes("[DELIVERY_SCANNED]") ||
        String(order.extra || "").includes("[DELIVERY_SCANNED]"));
    const allArrived = sortedOrders.filter(isDeliveryOrder);
    if (!q) return allArrived;
    const qDigits = q.replace(/\D/g, "");
    const qStripped = qDigits.replace(/^0+/, "");
    return searchEntries
      .filter(
        (e) =>
          isDeliveryOrder(e.order) &&
          (e.text.includes(q) || (qStripped && e.digits.includes(qStripped))),
      )
      .map((e) => e.order);
  }, [sortedOrders, searchEntries, searchQuery, viewingMonth]);

  const availableMonths = useMemo(() => {
    return (YEARS_CONFIG[activeYear] || []).filter(
      (m) =>
        m === activeMonth ||
        m === ACTIVE_ORDER_SHEET ||
        (monthlyStats[m]?.count || 0) > 0 ||
        allOrders.some((o) => o.sheet_name === m),
    );
  }, [activeYear, activeMonth, monthlyStats, allOrders]);

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(viewingMonth)) {
      setViewingMonth(availableMonths[0]);
    }
  }, [availableMonths, viewingMonth]);

  const handleUpdateOrder = useCallback(
    (id: string | number, sheet: string, updates: Partial<Order>) => {
      applyOptimisticOrderUpdate(id, sheet, updates);
    },
    [applyOptimisticOrderUpdate],
  );

  const renderContent = () => {
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
              localStorage.removeItem("iraqi_app_editingOrder");
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
            onEdit={(o) => beginEditingOrder(o, "orders")}
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
      case "delivery":
        return (
          <OrderListView
            role={role}
            isDeliveryTab={true}
            orders={deliveryOrders}
            onEdit={(o) => beginEditingOrder(o, "delivery")}
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
        return (
          <GiftCardsView
            role={role!}
            giftCards={giftCards}
            onRefresh={fetchGiftCards}
            orders={allOrders.filter((o) => o.sheet_name === viewingMonth)}
            viewingMonth={viewingMonth}
          />
        );
      case "calculator":
        return <CalculatorView />;
      case "messages":
        return <MessagesView role={role!} allOrders={allOrders} profileMode="iraqi" />;
      case "team":
        return (
          <TeamView
            role={role!}
            allOrders={allOrders}
            currentUser={localStorage.getItem("iraqi_auth_username") || role!}
            profileMode="iraqi"
            viewingMonth={viewingMonth}
            setViewingMonth={setViewingMonth}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            availableMonths={availableMonths}
            onOrderClick={setSelectedOrder}
          />
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iraqi_auth_role");
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
