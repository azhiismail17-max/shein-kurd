import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Order, ApiResponse, MonthlyStats, YEARS_CONFIG, SCRIPT_URL, ACTIVE_ORDER_SHEET, getOrderStatus } from '@/iraqi/types';
import { getDisplayPrice } from '@/iraqi/lib/order-utils';
import { sendNotification } from '@/iraqi/lib/notifications';
import { fetchWithRetry } from '@/iraqi/lib/fetchWithRetry';
import { toast } from 'sonner';
import AppLayout from '@/iraqi/components/app/AppLayout';
import { LoginView } from '@/iraqi/components/app/LoginView';
import { recordOrderDeleted } from '@/lib/teamActivity';

const DashboardView = React.lazy(() => import('@/iraqi/components/app/DashboardView'));
const OrderFormView = React.lazy(() => import('@/iraqi/components/app/OrderFormView'));
const OrderListView = React.lazy(() => import('@/iraqi/components/app/OrderListView'));
const OrderDetailModal = React.lazy(() => import('@/iraqi/components/app/OrderDetailModal'));
const BatchesView = React.lazy(() => import('@/iraqi/components/app/BatchesView'));
const ExpensesView = React.lazy(() => import('@/iraqi/components/app/ExpensesView'));
const CalculatorView = React.lazy(() => import('@/iraqi/components/app/CalculatorView'));
const CameraSearchModal = React.lazy(() => import('@/iraqi/components/app/CameraSearchModal'));
const MessagesView = React.lazy(() => import('@/iraqi/components/app/MessagesView'));
const TeamView = React.lazy(() => import('@/iraqi/components/app/TeamView'));

const DEFAULT_YEAR = Object.keys(YEARS_CONFIG).sort().pop() || '2026';
const DEFAULT_MONTH = ACTIVE_ORDER_SHEET;
const ALL_MONTHS = Object.values(YEARS_CONFIG).flat();
const CACHE_VERSION = 'full-sheet-data-v2';

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

const getSearchFields = (o: Order) => [o.insta, o.name, o.phone, o.phone2, o.place, o.orderNo, o.extra, o.link, (o as any).sku, o.sheet_name];
const buildSearchText = (o: Order) => getSearchFields(o).map(f => String(f || '').toLowerCase()).join(' ');

const Index: React.FC = () => {
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('iraqi_auth_role'));
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('iraqi_app_activeTab') || 'orders'); // default to 'orders' since it's the most common denominator
  
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#messages:')) {
        setActiveTab('messages');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [activeYear, setActiveYear] = useState(() => {
    const saved = localStorage.getItem('iraqi_app_activeYear');
    return saved && YEARS_CONFIG[saved] ? saved : DEFAULT_YEAR;
  });
  const [activeMonth, setActiveMonth] = useState(DEFAULT_MONTH);
  const [viewingMonth, setViewingMonth] = useState(() => {
    const saved = localStorage.getItem('iraqi_app_viewingMonth');
    return saved && ALL_MONTHS.includes(saved) ? saved : DEFAULT_MONTH;
  });

  useEffect(() => {
    localStorage.setItem('iraqi_app_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('iraqi_app_activeYear', activeYear);
  }, [activeYear]);

  useEffect(() => {
    localStorage.setItem('iraqi_app_activeMonth', activeMonth);
  }, [activeMonth]);

  useEffect(() => {
    localStorage.setItem('iraqi_app_viewingMonth', viewingMonth);
  }, [viewingMonth]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<Record<string, MonthlyStats>>({});
  const [loading, setLoading] = useState(true);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('iraqi_app_searchQuery') || '');
  const [isSearchingAll, setIsSearchingAll] = useState(false);
  const [showCameraSearch, setShowCameraSearch] = useState(false);

  useEffect(() => {
    const versionKey = 'iraqi_app_cache_version';
    if (localStorage.getItem(versionKey) === CACHE_VERSION) return;

    Object.keys(localStorage).forEach(key => {
      if (key === 'iraqi_app_initial_data' || key.startsWith('iraqi_app_month_data_')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(versionKey, CACHE_VERSION);
  }, []);

  useEffect(() => {
    localStorage.setItem('iraqi_app_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('iraqi_app_scrollY', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading) {
      const scrollY = sessionStorage.getItem('iraqi_app_scrollY');
      if (scrollY) {
        setTimeout(() => window.scrollTo({ top: parseInt(scrollY), behavior: 'instant' }), 0);
      }
    }
  }, [loading]);

  const loadedMonthsRef = useRef(loadedMonths);
  loadedMonthsRef.current = loadedMonths;
  const historyLoadStartedRef = useRef(false);

  // Initialize correct tab based on role
  useEffect(() => {
    if (!localStorage.getItem('iraqi_app_activeTab')) {
      if (role === 'owner') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('orders');
      }
    }
  }, [role]);

  // Helper to merge orders without duplicates
  const mergeOrders = useCallback((prev: Order[], newData: Order[], sheetsToReplace: string | string[]) => {
    const replaceSet = new Set(Array.isArray(sheetsToReplace) ? sheetsToReplace : [sheetsToReplace]);
    const filtered = prev.filter(o => !replaceSet.has(o.sheet_name));
    return [...filtered, ...newData];
  }, []);

  const applyApiResponse = useCallback((json: ApiResponse, isBackground: boolean) => {
    if (json.status !== 'success') return;
    const meta = json.meta || ({} as ApiResponse['meta']);
    setMonthlyStats(meta.monthly_stats || {});
    const scriptActiveSheet = meta.active_sheet || DEFAULT_MONTH;
    const data = (Array.isArray(json.data) ? json.data : []).map(o => ({
      ...o,
      sheet_name: o.sheet_name || scriptActiveSheet,
    }));
    setActiveMonth(scriptActiveSheet);
    if (!isBackground) {
      // Only set to default if we don't have a saved one
      if (!localStorage.getItem('iraqi_app_viewingMonth') || !ALL_MONTHS.includes(localStorage.getItem('iraqi_app_viewingMonth') || '')) setViewingMonth(scriptActiveSheet);
      if (!localStorage.getItem('iraqi_app_activeYear') || !YEARS_CONFIG[localStorage.getItem('iraqi_app_activeYear') || '']) setActiveYear(DEFAULT_YEAR);
    }
    const sheets = data.length
      ? [...new Set(data.map(o => o.sheet_name).filter(Boolean))]
      : [scriptActiveSheet];
    setAllOrders(prev => mergeOrders(prev, data, sheets));
    setLoadedMonths(prev => {
      const next = new Set(prev);
      sheets.forEach(sheet => next.add(sheet));
      return next;
    });
  }, [mergeOrders]);

  const fetchInitialData = useCallback(async () => {
    if (!role) return; // Don't fetch if not logged in
    const cached = localStorage.getItem('iraqi_app_initial_data');
    let hasCached = false;
    if (cached) {
      try {
        const json: ApiResponse = JSON.parse(cached);
        applyApiResponse(json, false);
        hasCached = true;
        setLoading(false);
      } catch (e) { console.warn('Iraqi cache error', e); }
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
      if (json && json.status === 'success') {
        localStorage.setItem('iraqi_app_initial_data', JSON.stringify(json));
        applyApiResponse(json, hasCached);
      }
    } catch (err) { console.error('Fetch error', err); }
    finally { setLoading(false); }
  }, [applyApiResponse, role]);

  const fetchMonthData = useCallback(async (month: string, force = false) => {
    if (!role) return;
    if (!force && loadedMonthsRef.current.has(month)) return;
    const cacheKey = `iraqi_app_month_data_${month}`;
    const cached = localStorage.getItem(cacheKey);
    let hasCached = false;
    if (cached) {
      try {
        const json: ApiResponse = JSON.parse(cached);
        if (json.status === 'success') {
          const data = (Array.isArray(json.data) ? json.data : []).map(o => ({ ...o, sheet_name: o.sheet_name || month }));
          setAllOrders(prev => mergeOrders(prev, data, month));
          setLoadedMonths(prev => new Set(prev).add(month));
          hasCached = true;
        }
      } catch (e) { /* ignore */ }
    }
    if (!hasCached && allOrders.length === 0) setLoading(true);

    try {
      const res = await fetchWithRetry(`${SCRIPT_URL}?month=${month}&t=${Date.now()}`);
      const text = await res.text();
      let json: ApiResponse | null = null;
      try { json = JSON.parse(text); } catch (e) { console.warn("Invalid DB JSON"); }
      if (json && json.status === 'success') {
        const data = (Array.isArray(json.data) ? json.data : []).map(o => ({ ...o, sheet_name: o.sheet_name || month }));
        localStorage.setItem(cacheKey, JSON.stringify(json));
        setAllOrders(prev => mergeOrders(prev, data, month));
        setLoadedMonths(prev => new Set(prev).add(month));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [allOrders.length, mergeOrders, role]);

  const loadAllHistory = useCallback(async () => {
    setIsSearchingAll(true);
    // Parallelize with a small concurrency window — much faster than 1.5s/month serial
    const pending = ALL_MONTHS.filter(
      m => !loadedMonthsRef.current.has(m) && (monthlyStats[m]?.count || 0) > 0
    );
    const CONCURRENCY = 4;
    let i = 0;
    const workers = Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
      while (i < pending.length) {
        const m = pending[i++];
        await fetchMonthData(m);
      }
    });
    await Promise.all(workers);
    setIsSearchingAll(false);
  }, [fetchMonthData, monthlyStats]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
  useEffect(() => { if (viewingMonth && !loadedMonths.has(viewingMonth)) fetchMonthData(viewingMonth); }, [viewingMonth, loadedMonths, fetchMonthData]);
  // Warm old months quietly after the current screen is usable.
  useEffect(() => {
    if (loading || historyLoadStartedRef.current || Object.keys(monthlyStats).length === 0) return;
    historyLoadStartedRef.current = true;
    const run = () => loadAllHistory();
    const idleId = 'requestIdleCallback' in window
      ? (window as any).requestIdleCallback(run, { timeout: 2500 })
      : window.setTimeout(run, 1500);
    return () => {
      if (typeof idleId === 'number') window.clearTimeout(idleId);
      else if ('cancelIdleCallback' in window) (window as any).cancelIdleCallback(idleId);
    };
  }, [loading, monthlyStats, loadAllHistory]);

  // Force refresh a specific month — clears cache and re-fetches immediately
  const forceRefreshMonth = useCallback(async (month: string) => {
    if (!role) return;
    localStorage.removeItem(`iraqi_app_month_data_${month}`);
    localStorage.removeItem('iraqi_app_initial_data');
    try {
      // Fetch active sheet stats first
      const resMain = await fetchWithRetry(`${SCRIPT_URL}?t=${Date.now()}`);
      const textMain = await resMain.text();
      let jsonMain: ApiResponse | null = null;
      try { jsonMain = JSON.parse(textMain); } catch (e) {}
      
      if (jsonMain && jsonMain.status === 'success') {
        localStorage.setItem('iraqi_app_initial_data', JSON.stringify(jsonMain));
        const meta = jsonMain.meta || ({} as ApiResponse['meta']);
        const scriptActiveSheet = meta.active_sheet || DEFAULT_MONTH;
        const data = (Array.isArray(jsonMain.data) ? jsonMain.data : []).map(o => ({ ...o, sheet_name: o.sheet_name || scriptActiveSheet }));
        setMonthlyStats(meta.monthly_stats || {});
        if (meta.active_sheet) setActiveMonth(meta.active_sheet);
        if (data.length) {
          const sheets = [...new Set(data.map(o => o.sheet_name).filter(Boolean))];
          setAllOrders(prev => mergeOrders(prev, data, sheets));
          setLoadedMonths(prev => {
            const next = new Set(prev);
            sheets.forEach(sheet => next.add(sheet));
            return next;
          });
        }
      }

      // Then fetch the specific month
      const resMonth = await fetchWithRetry(`${SCRIPT_URL}?month=${month}&t=${Date.now()}`);
      const textMonth = await resMonth.text();
      let jsonMonth: ApiResponse | null = null;
      try { jsonMonth = JSON.parse(textMonth); } catch (e) {}

      if (jsonMonth && jsonMonth.status === 'success') {
        const data = (Array.isArray(jsonMonth.data) ? jsonMonth.data : []).map(o => ({ ...o, sheet_name: o.sheet_name || month }));
        localStorage.setItem(`iraqi_app_month_data_${month}`, JSON.stringify(jsonMonth));
        setAllOrders(prev => mergeOrders(prev, data, month));
        setLoadedMonths(prev => new Set(prev).add(month));
      }
    } catch (err) { console.warn('Force refresh issue (network/timeout):', err instanceof Error ? err.message : err); }
  }, [mergeOrders, role]);

  const refreshTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const refreshInFlightRef = useRef<Record<string, boolean>>({});
  const refreshQueuedRef = useRef<Record<string, boolean>>({});

  // Lightweight silent refresh — only fetches the current month, no loading spinner
  const silentRefresh = useCallback((month?: string) => {
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
        const res = await fetch(`${SCRIPT_URL}?month=${target}&skip_stats=true&t=${Date.now()}`, { credentials: 'omit', signal: ctrl.signal });
        const text = await res.text();
        let json: ApiResponse | null = null;
        try { json = JSON.parse(text); } catch(e) {}
        if (json && json.status === 'success') {
          localStorage.setItem(`iraqi_app_month_data_${target}`, JSON.stringify(json));
          const meta = json.meta || ({} as ApiResponse['meta']);
          const data = (Array.isArray(json.data) ? json.data : []).map(o => ({ ...o, sheet_name: o.sheet_name || target }));
          setMonthlyStats(prev => ({ ...prev, ...(meta.monthly_stats || {}) }));
          if (meta.active_sheet) setActiveMonth(meta.active_sheet);
          if (data.length) {
            setAllOrders(prev => mergeOrders(prev, data, target));
            setLoadedMonths(prev => new Set(prev).add(target));
          }
        }
      } catch (_) { /* silent */ }
      finally {
        if (timeout) window.clearTimeout(timeout);
        refreshInFlightRef.current[target] = false;
        if (refreshQueuedRef.current[target]) {
          refreshQueuedRef.current[target] = false;
          silentRefresh(target);
        }
      }
    }, 0);
  }, [viewingMonth, mergeOrders, role]);

  const handleDelete = useCallback(async (id: string | number, sheetName: string) => {
    const orderToDelete = allOrders.find(o => o.id === id && o.sheet_name === sheetName);
    // Optimistic: remove immediately
    setAllOrders(prev => prev.filter(o => !(o.id === id && o.sheet_name === sheetName)));
    
    if (orderToDelete) {
      sendNotification('delete', `Order deleted: ${orderToDelete.name || orderToDelete.insta}`, role, orderToDelete);
    }

    try {
      await fetchWithRetry(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({
          action: 'delete',
          row_id: id,
          sheet: sheetName
        })
      });
      recordOrderDeleted('iraqi', sheetName, id).catch(err => console.warn('Failed to update Iraqi team delete stats', err));
    } catch (err) { console.error(err); }
    // Quick silent refresh after action
    setTimeout(() => silentRefresh(sheetName), 250);
  }, [silentRefresh]);

  const handleFormSuccess = useCallback((payload?: any, rowIdStr?: string) => {
    setEditingOrder(null);
    setActiveTab('orders');
    
    // LIVE / Optimistic update without delay!
    if (payload) {
      setAllOrders(prev => {
        const idToFind = payload.row_id || (rowIdStr ? parseInt(rowIdStr.replace(/\D/g, '')) : Date.now());
        const tempId = payload._tempId;
        const exists = prev.some(o => o.id === idToFind && o.sheet_name === payload.sheet);

        // Reconcile: when the real row id arrives after an optimistic insert,
        // upgrade the temp record in place instead of creating a duplicate.
        if (tempId && tempId !== idToFind) {
          const hasTemp = prev.some(o => o.id === tempId && o.sheet_name === payload.sheet);
          if (hasTemp) {
            return prev.map(o =>
              o.id === tempId && o.sheet_name === payload.sheet
                ? { ...o, ...payload, id: idToFind }
                : o
            );
          }
        }

        // Build the optimistic linked-id set for the edited/created order.
        const newLinkedIds: (string | number)[] = Array.isArray(payload.linkedOrderIds) ? payload.linkedOrderIds : [];

        // Also optimistically update every linked order so the link shows on both sides
        // immediately, without waiting for the next sheet refresh.
        const patchLinkedSides = (orders: Order[]): Order[] => {
          if (newLinkedIds.length === 0) return orders;
          const sourceKey = `${idToFind}:${payload.sheet}`;
          return orders.map(o => {
            const oKey = `${o.id}:${o.sheet_name}`;
            if (!newLinkedIds.includes(oKey) && !newLinkedIds.includes(o.id)) return o;
            const existing = Array.isArray(o.linkedOrderIds) ? o.linkedOrderIds : [];
            if (existing.includes(sourceKey) || existing.includes(idToFind)) return o;
            return { ...o, linkedOrderIds: [...existing, sourceKey] };
          });
        };

        if (exists) {
          // Editing existing
          sendNotification('edit', `Order ${payload.insta || 'edited'} was modified`, role, { id: idToFind, sheet_name: payload.sheet });
          const updated = prev.map(o => o.id === idToFind && o.sheet_name === payload.sheet ? { ...o, ...payload } : o);
          return patchLinkedSides(updated);
        } else {
          // New order
          const newOrder: Order = {
            id: idToFind,
            sheet_name: payload.sheet || viewingMonth,
            ...payload
          };
          return patchLinkedSides([newOrder, ...prev]);
        }
      });
    }

    // Rapid refresh after submission to sync cleanly
    silentRefresh(viewingMonth);
    setTimeout(() => silentRefresh(viewingMonth), 900);
  }, [silentRefresh, viewingMonth]);

  const handleStatusChange = useCallback(async (order: Order, newStatus: string) => {
    if (order.is_finished) return;
    const currentExtra = order.extra || '';
    const cleanExtra = currentExtra.replace(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/gi, '').replace(/\s*\|\s*/g, ' ').replace(/\s+/g, ' ').trim();
    const newExtra = newStatus === 'none' ? cleanExtra : `[${newStatus.toUpperCase()}] ${cleanExtra}`.trim();
    // Optimistic update
    setAllOrders(prev => prev.map(o => o.id === order.id && o.sheet_name === order.sheet_name ? { ...o, extra: newExtra } : o));
    
    if (newStatus === 'DELIVERY_SCANNED' || newStatus === 'arrived') {
      sendNotification('deliver', `Order arrived/delivered: ${order.name || order.insta}`, role, order);
    } else if (newStatus === 'cancelled') {
      sendNotification('cancel', `Order cancelled: ${order.name || order.insta}`, role, order);
    }

    // Fire request then refresh
    try {
      const proofStr = Array.isArray(order.proof_urls)
        ? order.proof_urls.filter(Boolean).join(',')
        : (order.proof_urls || '');
      const { price: _price, sheet_price: _sheetPrice, customer_price: _customerPrice, ...orderWithoutPrice } = order as any;
      await fetchWithRetry(SCRIPT_URL, { method: 'POST', body: JSON.stringify({
        ...orderWithoutPrice,
        sheet: order.sheet_name,
        row_id: order.id,
        extra: newExtra,
        force_update: true,
        status_color: newStatus,
        // Preserve proof images across status updates (Apps Script overwrites empty fields)
        proof_urls: proofStr,
        image_url: order.image_url || proofStr || '',
        primary_urls: order.primary_urls || '',
      }) });
    } catch (e) { console.error(e); }
    silentRefresh(order.sheet_name);
    setTimeout(() => silentRefresh(order.sheet_name), 250);
  }, [silentRefresh]);

  const handleBatchRefresh = useCallback(() => {
    silentRefresh(viewingMonth);
  }, [silentRefresh, viewingMonth]);

  // Auto-poll: faster when tab is focused, slower in background
  useEffect(() => {
    if (!role) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') silentRefresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [silentRefresh, role]);

  // Refresh when tab becomes visible again
  useEffect(() => {
    if (!role) return;
    const onVisible = () => { if (document.visibilityState === 'visible') silentRefresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [silentRefresh, role]);

  const sortedOrders = useMemo(() => [...allOrders].sort(globalSort), [allOrders]);
  const searchEntries = useMemo(() => sortedOrders.map(order => {
    const text = buildSearchText(order);
    return { order, text, digits: text.replace(/\D/g, '').replace(/^0+/, '') };
  }), [sortedOrders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list: Order[];
    if (q === 'pending') list = sortedOrders.filter(o => o.sheet_name === viewingMonth && getOrderStatus(o) === 'pending');
    else if (q === 'pic') list = sortedOrders.filter(o => o.imageBase64 || o.image_url || o.primary_urls || o.warningBase64 || o.proof_urls?.length || o.secondaryImages?.length);
    else if (q) {
      const qDigits = q.replace(/\D/g, '');
      const qStripped = qDigits.replace(/^0+/, '');
      list = searchEntries
        .filter(e => e.text.includes(q) || (qStripped && e.digits.includes(qStripped)))
        .map(e => e.order);
    }
    else list = sortedOrders.filter(o => o.sheet_name === viewingMonth);
    return list;
  }, [sortedOrders, searchEntries, viewingMonth, searchQuery]);

  const deliveryOrders = useMemo(() => {
    const allArrived = sortedOrders.filter(o => getOrderStatus(o) === 'arrived' || String(o.note || '').includes('[DELIVERY_SCANNED]') || String(o.extra || '').includes('[DELIVERY_SCANNED]'));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allArrived;
    const qDigits = q.replace(/\D/g, '');
    const qStripped = qDigits.replace(/^0+/, '');
    return searchEntries
      .filter(e =>
        (getOrderStatus(e.order) === 'arrived' || String(e.order.note || '').includes('[DELIVERY_SCANNED]') || String(e.order.extra || '').includes('[DELIVERY_SCANNED]')) &&
        (e.text.includes(q) || (qStripped && e.digits.includes(qStripped)))
      )
      .map(e => e.order);
  }, [sortedOrders, searchEntries, searchQuery]);

  const availableMonths = useMemo(() => {
    return (YEARS_CONFIG[activeYear] || []).filter(m =>
      m === activeMonth ||
      m === ACTIVE_ORDER_SHEET ||
      (monthlyStats[m]?.count || 0) > 0 ||
      allOrders.some(o => o.sheet_name === m)
    );
  }, [activeYear, activeMonth, monthlyStats, allOrders]);

  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(viewingMonth)) {
      setViewingMonth(availableMonths[0]);
    }
  }, [availableMonths, viewingMonth]);

  const handleUpdateOrder = useCallback((id: string | number, sheet: string, updates: Partial<Order>) => {
    const existing = allOrders.find(o => o.id === id && o.sheet_name === sheet);
    if (existing?.is_finished) return;
    setAllOrders(prev => prev.map(o => o.id === id && o.sheet_name === sheet ? { ...o, ...updates } : o));
  }, [allOrders]);

  const renderContent = () => {
    if (loading && allOrders.length === 0) {
      return (
        <div className="flex items-center justify-center py-20 min-h-[60vh]">
          <div className="text-center flex flex-col items-center justify-center space-y-4">
            <img 
              src="/logo.jpg" 
              alt="Shein Kurdistani Logo" 
              className="w-24 h-36 object-cover rounded-xl shadow-lg border-2 border-primary/20 animate-pulse"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/200x300/400/FFF?text=Loading...';
              }}
            />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm font-bold tracking-widest uppercase">Loading...</p>
            </div>
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView stats={monthlyStats[viewingMonth]} orders={filteredOrders} viewingMonth={viewingMonth} availableMonths={availableMonths} setViewingMonth={setViewingMonth} setActiveTab={setActiveTab} setSearchQuery={setSearchQuery} onNewOrder={() => setActiveTab('new-order')} activeYear={activeYear} setActiveYear={setActiveYear} />;
      case 'new-order':
        return <OrderFormView activeSheet={activeMonth} editingOrder={editingOrder} onCancel={() => { setEditingOrder(null); setActiveTab('orders'); }} onSuccess={handleFormSuccess} allOrders={allOrders} />;
      case 'orders':
      case 'customers':
        return <OrderListView role={role} isDeliveryTab={false} orders={filteredOrders} onEdit={o => { setEditingOrder(o); setActiveTab('new-order'); }} onDelete={handleDelete} onOrderClick={setSelectedOrder} allOrders={allOrders} viewingMonth={viewingMonth} setViewingMonth={setViewingMonth} activeYear={activeYear} setActiveYear={setActiveYear} availableMonths={availableMonths} onStatusChange={handleStatusChange} onNewOrder={() => setActiveTab('new-order')} onUpdateOrder={handleUpdateOrder} />;
      case 'delivery':
        return <OrderListView role={role} isDeliveryTab={true} orders={deliveryOrders} onEdit={o => { setEditingOrder(o); setActiveTab('new-order'); }} onDelete={handleDelete} onOrderClick={setSelectedOrder} allOrders={allOrders} viewingMonth={viewingMonth} setViewingMonth={setViewingMonth} activeYear={activeYear} setActiveYear={setActiveYear} availableMonths={availableMonths} onStatusChange={handleStatusChange} onNewOrder={() => setActiveTab('new-order')} onUpdateOrder={handleUpdateOrder} />;
      case 'batches':
        return <BatchesView role={role!} orders={allOrders.filter(o => o.sheet_name === viewingMonth)} allOrders={allOrders} onOrderClick={setSelectedOrder} viewingMonth={viewingMonth} setViewingMonth={setViewingMonth} availableMonths={availableMonths} activeYear={activeYear} setActiveYear={setActiveYear} onRefresh={handleBatchRefresh} onStatusChange={handleStatusChange} />;
      case 'expenses':
        return <ExpensesView />;
      case 'calculator':
        return <CalculatorView />;
      case 'messages':
        return <MessagesView role={role!} allOrders={allOrders} profileMode="iraqi" />;
      case 'team':
        return <TeamView role={role!} allOrders={allOrders} currentUser={localStorage.getItem('iraqi_auth_username') || role!} profileMode="iraqi" onOrderClick={setSelectedOrder} />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('iraqi_auth_role');
    setRole(null);
  };

  const handleNotificationClick = (orderId: string, sheetName: string) => {
    // Attempt to find the order in allOrders
    const order = allOrders.find(o => String(o.id) === orderId && o.sheet_name === sheetName);
    if (order) {
      setSelectedOrder(order);
    } else {
      toast.error('Order not found in currently loaded data. It might be in an older month.');
    }
  };

  if (!role) {
    return <LoginView onLogin={setRole} />;
  }

  return (
    <>
      <AppLayout role={role} onLogout={handleLogout} onNotificationClick={handleNotificationClick} activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isSearchingAll={isSearchingAll} onSearchAll={() => setActiveTab('calculator')} onCameraSearch={() => setShowCameraSearch(true)} viewingMonth={viewingMonth} setViewingMonth={setViewingMonth} activeYear={activeYear} setActiveYear={setActiveYear} availableMonths={availableMonths}>
        <React.Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading...</div>}>
          {renderContent()}
        </React.Suspense>
      </AppLayout>
      <React.Suspense fallback={null}>
        {selectedOrder && (
          <OrderDetailModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            onEdit={o => { setEditingOrder(o); setSelectedOrder(null); setActiveTab('new-order'); }} 
            onDelete={() => { 
              setAllOrders(prev => prev.filter(o => {
                const isMain = o.id === selectedOrder.id && o.sheet_name === selectedOrder.sheet_name;
                const isLinked = selectedOrder.linkedOrderIds && selectedOrder.linkedOrderIds.includes(`${o.id}:${o.sheet_name}`);
                const isLinkedLegacy = selectedOrder.linkedOrderIds && selectedOrder.linkedOrderIds.includes(o.id);
                return !(isMain || isLinked || isLinkedLegacy);
              })); 
              setSelectedOrder(null); 
              setTimeout(() => forceRefreshMonth(viewingMonth), 1000); 
            }} 
            allOrders={allOrders} 
            onSuccess={(payload) => { setSelectedOrder(null); if(payload) handleFormSuccess(payload); else forceRefreshMonth(viewingMonth); }} 
            onStatusChange={handleStatusChange} 
            onUpdateOrder={handleUpdateOrder}
          />
        )}
        {showCameraSearch && <CameraSearchModal allOrders={allOrders} onOrderClick={o => { setShowCameraSearch(false); setSelectedOrder(o); }} onClose={() => setShowCameraSearch(false)} />}
      </React.Suspense>
    </>
  );
};

export default Index;
