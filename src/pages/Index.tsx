import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Order, ApiResponse, MonthlyStats, YEARS_CONFIG, SCRIPT_URL, ACTIVE_ORDER_SHEET, getOrderStatus } from '@/types';
import { getDisplayPrice } from '@/lib/order-utils';
import { sendNotification } from '@/lib/notifications';
import { fetchWithRetry } from '@/lib/fetchWithRetry';
import { broadcastOrderChange, subscribeOrderChanges } from '@/lib/realtime';
import { toast } from 'sonner';
import AppLayout from '@/components/app/AppLayout';
import DashboardView from '@/components/app/DashboardView';
import OrderFormView from '@/components/app/OrderFormView';
import OrderListView from '@/components/app/OrderListView';
import OrderDetailModal from '@/components/app/OrderDetailModal';
import BatchesView from '@/components/app/BatchesView';
import ExpensesView from '@/components/app/ExpensesView';
import CalculatorView from '@/components/app/CalculatorView';
import CalculatorModal from '@/components/app/CalculatorModal';
import CameraSearchModal from '@/components/app/CameraSearchModal';
import MessagesView from '@/components/app/MessagesView';
import TeamView from '@/components/app/TeamView';
import { LoginView } from '@/components/app/LoginView';
import { SystemKey } from '@/components/app/SystemSwitcher';
import { recordOrderDeleted } from '@/lib/teamActivity';
import { GlobalCalculatorButton } from '@/components/GlobalCalculator';

const DEFAULT_YEAR = Object.keys(YEARS_CONFIG).sort().pop() || '2026';
const DEFAULT_MONTH = ACTIVE_ORDER_SHEET;
const ALL_MONTHS = Object.values(YEARS_CONFIG).flat();

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

const Index: React.FC = () => {
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('auth_role'));
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('app_activeTab') || 'orders'); // default to 'orders' since it's the most common denominator
  const [currentSystem, setCurrentSystem] = useState<SystemKey>(() => {
    const saved = localStorage.getItem('app_currentSystem') as SystemKey | null;
    return saved === 'all' || saved === 'kurdistani' ? saved : 'kurdistani';
  });
  
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
    const saved = localStorage.getItem('app_activeYear');
    return saved && YEARS_CONFIG[saved] ? saved : DEFAULT_YEAR;
  });
  const [activeMonth, setActiveMonth] = useState(() => {
    const saved = localStorage.getItem('app_activeMonth');
    return saved && ALL_MONTHS.includes(saved) ? saved : DEFAULT_MONTH;
  });
  const [viewingMonth, setViewingMonth] = useState(() => {
    const saved = localStorage.getItem('app_viewingMonth');
    return saved && ALL_MONTHS.includes(saved) ? saved : DEFAULT_MONTH;
  });

  useEffect(() => {
    localStorage.setItem('app_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('app_currentSystem', currentSystem);
  }, [currentSystem]);

  useEffect(() => {
    localStorage.setItem('app_activeYear', activeYear);
  }, [activeYear]);

  useEffect(() => {
    localStorage.setItem('app_activeMonth', activeMonth);
  }, [activeMonth]);

  useEffect(() => {
    localStorage.setItem('app_viewingMonth', viewingMonth);
  }, [viewingMonth]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<Record<string, MonthlyStats>>({});
  const [loading, setLoading] = useState(true);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('app_searchQuery') || '');
  const [isSearchingAll, setIsSearchingAll] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCameraSearch, setShowCameraSearch] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('app_scrollY', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading) {
      const scrollY = sessionStorage.getItem('app_scrollY');
      if (scrollY) {
        setTimeout(() => window.scrollTo({ top: parseInt(scrollY), behavior: 'instant' }), 0);
      }
    }
  }, [loading]);

  const loadedMonthsRef = useRef(loadedMonths);
  loadedMonthsRef.current = loadedMonths;

  // Initialize correct tab based on role
  useEffect(() => {
    if (!localStorage.getItem('app_activeTab')) {
      if (role === 'owner') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('orders');
      }
    }
  }, [role]);

  // Helper to merge orders without duplicates
  const mergeOrders = useCallback((prev: Order[], newData: Order[], sheetToReplace: string) => {
    const filtered = prev.filter(o => o.sheet_name !== sheetToReplace);
    return [...filtered, ...newData];
  }, []);

  const applyApiResponse = useCallback((json: ApiResponse, isBackground: boolean) => {
    if (json.status !== 'success') return;
    setMonthlyStats(json.meta.monthly_stats || {});
    const scriptActiveSheet = json.meta.active_sheet || DEFAULT_MONTH;
    setActiveMonth(scriptActiveSheet);
    if (!isBackground) {
      if (!localStorage.getItem('app_viewingMonth') || !ALL_MONTHS.includes(localStorage.getItem('app_viewingMonth') || '')) {
        setViewingMonth(scriptActiveSheet);
      }
      if (!localStorage.getItem('app_activeYear') || !YEARS_CONFIG[localStorage.getItem('app_activeYear') || '']) setActiveYear(DEFAULT_YEAR);
    }
    if (json.data?.length) {
      const sheet = json.data[0].sheet_name;
      setAllOrders(prev => mergeOrders(prev, json.data, sheet));
      setLoadedMonths(prev => new Set(prev).add(sheet));
    }
  }, [mergeOrders]);

  const fetchInitialData = useCallback(async () => {
    if (!role) return; // Don't fetch if not logged in
    const cached = localStorage.getItem('app_initial_data');
    let hasCached = false;
    if (cached) {
      try {
        const json: ApiResponse = JSON.parse(cached);
        applyApiResponse(json, false);
        hasCached = true;
        setLoading(false);
      } catch (e) { console.warn('Cache error', e); }
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
        localStorage.setItem('app_initial_data', JSON.stringify(json));
        applyApiResponse(json, hasCached);
      }
    } catch (err) { console.error('Fetch error', err); }
    finally { setLoading(false); }
  }, [applyApiResponse, role]);

  const fetchMonthData = useCallback(async (month: string, force = false) => {
    if (!role) return;
    if (!force && loadedMonthsRef.current.has(month)) return;
    const cacheKey = `app_month_data_${month}`;
    const cached = localStorage.getItem(cacheKey);
    let hasCached = false;
    if (cached) {
      try {
        const json: ApiResponse = JSON.parse(cached);
        if (json.status === 'success') {
          setAllOrders(prev => mergeOrders(prev, json.data, month));
          setLoadedMonths(prev => new Set(prev).add(month));
          hasCached = true;
        }
      } catch (e) { /* ignore */ }
    }
    // Only show loading if no cached data AND no orders at all
    if (!hasCached && allOrders.length === 0) setLoading(true);

    try {
      const res = await fetchWithRetry(`${SCRIPT_URL}?month=${month}&t=${Date.now()}`);
      const text = await res.text();
      let json: ApiResponse | null = null;
      try { json = JSON.parse(text); } catch (e) { console.warn("Invalid DB JSON"); }
      if (json && json.status === 'success') {
        localStorage.setItem(cacheKey, JSON.stringify(json));
        setAllOrders(prev => mergeOrders(prev, json.data, month));
        setLoadedMonths(prev => new Set(prev).add(month));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [allOrders.length, mergeOrders, role]);

  const loadAllHistory = useCallback(async () => {
    setIsSearchingAll(true);
    // Parallelize with a small concurrency window — much faster than 1.5s/month serial
    const pending = Object.values(YEARS_CONFIG).flat().filter(
      m => !loadedMonthsRef.current.has(m) && monthlyStats[m]?.count > 0
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
  }, [monthlyStats, fetchMonthData]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);
  useEffect(() => { if (viewingMonth && !loadedMonths.has(viewingMonth)) fetchMonthData(viewingMonth); }, [viewingMonth, loadedMonths, fetchMonthData]);
  // Auto-load ALL months on startup so customer search has full data across all sheets
  useEffect(() => { if (!loading && Object.keys(monthlyStats).length > 0) loadAllHistory(); }, [loading, monthlyStats, loadAllHistory]);

  // Force refresh a specific month — clears cache and re-fetches immediately
  const forceRefreshMonth = useCallback(async (month: string) => {
    if (!role) return;
    // Clear stale cache
    localStorage.removeItem(`app_month_data_${month}`);
    localStorage.removeItem('app_initial_data');
    try {
      // Fetch active sheet stats first
      const resMain = await fetchWithRetry(`${SCRIPT_URL}?t=${Date.now()}`);
      const textMain = await resMain.text();
      let jsonMain: ApiResponse | null = null;
      try { jsonMain = JSON.parse(textMain); } catch (e) {}
      
      if (jsonMain && jsonMain.status === 'success') {
        localStorage.setItem('app_initial_data', JSON.stringify(jsonMain));
        setMonthlyStats(jsonMain.meta.monthly_stats || {});
        if (jsonMain.data?.length) {
          const sheet = jsonMain.data[0].sheet_name;
          setAllOrders(prev => mergeOrders(prev, jsonMain.data, sheet));
          setLoadedMonths(prev => new Set(prev).add(sheet));
        }
      }

      // Then fetch the specific month
      const resMonth = await fetchWithRetry(`${SCRIPT_URL}?month=${month}&t=${Date.now()}`);
      const textMonth = await resMonth.text();
      let jsonMonth: ApiResponse | null = null;
      try { jsonMonth = JSON.parse(textMonth); } catch (e) {}

      if (jsonMonth && jsonMonth.status === 'success') {
        localStorage.setItem(`app_month_data_${month}`, JSON.stringify(jsonMonth));
        setAllOrders(prev => mergeOrders(prev, jsonMonth.data, month));
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
      try {
        const ctrl = new AbortController();
        ((silentRefresh as any)._ctrls ||= {})[target] = ctrl;
        const res = await fetch(`${SCRIPT_URL}?month=${target}&skip_stats=true&t=${Date.now()}`, { credentials: 'omit', signal: ctrl.signal });
        const text = await res.text();
        let json: ApiResponse | null = null;
        try { json = JSON.parse(text); } catch(e) {}
        if (json && json.status === 'success') {
          localStorage.setItem(`app_month_data_${target}`, JSON.stringify(json));
          setMonthlyStats(prev => ({ ...prev, ...json.meta.monthly_stats }));
          if (json.data?.length) {
            setAllOrders(prev => mergeOrders(prev, json.data, target));
            setLoadedMonths(prev => new Set(prev).add(target));
          }
        }
      } catch (_) { /* silent */ }
      finally {
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
      broadcastOrderChange({}, sheetName, id, 'delete');
      recordOrderDeleted('kurdistani', sheetName, id).catch(err => console.warn('Failed to update team delete stats', err));
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

    // Broadcast to other clients for sub-second sync (bypasses ~10s GAS read)
    if (payload) {
      const idToFind = payload.row_id || (rowIdStr ? parseInt(rowIdStr.replace(/\D/g, '')) : Date.now());
      broadcastOrderChange(payload, payload.sheet || viewingMonth, idToFind, 'upsert');
    }
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
      const displayPrice = getDisplayPrice(order, allOrders);
      const proofStr = Array.isArray(order.proof_urls)
        ? order.proof_urls.filter(Boolean).join(',')
        : (order.proof_urls || '');
      await fetchWithRetry(SCRIPT_URL, { method: 'POST', body: JSON.stringify({
        ...order,
        price: displayPrice,
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
      broadcastOrderChange({ ...order, extra: newExtra }, order.sheet_name, order.id, 'upsert');
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
    }, 900);
    return () => clearInterval(interval);
  }, [silentRefresh, role]);

  // Realtime: subscribe to Firestore broadcast for sub-second cross-client sync.
  // Bypasses the ~10s GAS sheet read by merging the change payload directly.
  useEffect(() => {
    if (!role) return;
    const unsub = subscribeOrderChanges(({ payload, sheet, row_id, action }) => {
      if (!sheet) return;
      const id = typeof row_id === 'string' ? parseInt(row_id) || row_id : row_id;
      setAllOrders(prev => {
        if (action === 'delete') {
          return prev.filter(o => !(o.id === id && o.sheet_name === sheet));
        }
        const exists = prev.some(o => o.id === id && o.sheet_name === sheet);
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

  // Refresh when tab becomes visible again
  useEffect(() => {
    if (!role) return;
    const onVisible = () => { if (document.visibilityState === 'visible') silentRefresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [silentRefresh, role]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list: Order[];
    if (q === 'pending') list = allOrders.filter(o => o.sheet_name === viewingMonth && getOrderStatus(o) === 'pending');
    else if (q === 'pic') list = allOrders.filter(o => o.imageBase64 || o.image_url || o.primary_urls || o.warningBase64 || o.proof_urls?.length || o.secondaryImages?.length);
    else if (q) {
      const qDigits = q.replace(/\D/g, '');
      const qStripped = qDigits.replace(/^0+/, '');
      list = allOrders.filter(o => [o.insta, o.name, o.phone, o.phone2, o.place, o.orderNo, o.extra, o.link, (o as any).sku, o.sheet_name].some(f => {
        const s = String(f || '').toLowerCase();
        if (s.includes(q)) return true;
        if (qStripped) {
          const sDigits = s.replace(/\D/g, '').replace(/^0+/, '');
          if (sDigits && sDigits.includes(qStripped)) return true;
        }
        return false;
      }));
    }
    else list = allOrders.filter(o => o.sheet_name === viewingMonth);
    return list.sort(globalSort);
  }, [allOrders, viewingMonth, searchQuery]);

  const deliveryOrders = useMemo(() => {
    const allArrived = allOrders.filter(o => getOrderStatus(o) === 'arrived' || String(o.note || '').includes('[DELIVERY_SCANNED]') || String(o.extra || '').includes('[DELIVERY_SCANNED]'));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allArrived.sort(globalSort);
    const qDigits = q.replace(/\D/g, '');
    const qStripped = qDigits.replace(/^0+/, '');
    return allArrived.filter(o => [o.insta, o.name, o.phone, o.phone2, o.place, o.orderNo, o.extra, o.link, (o as any).sku, o.sheet_name].some(f => {
      const s = String(f || '').toLowerCase();
      if (s.includes(q)) return true;
      if (qStripped) {
        const sDigits = s.replace(/\D/g, '').replace(/^0+/, '');
        if (sDigits && sDigits.includes(qStripped)) return true;
      }
      return false;
    })).sort(globalSort);
  }, [allOrders, searchQuery]);

  const availableMonths = useMemo(() => (YEARS_CONFIG[activeYear] || []).filter(m => monthlyStats[m]?.count > 0), [activeYear, monthlyStats]);

  useEffect(() => {
    const yearMonths = YEARS_CONFIG[activeYear] || [];
    if (yearMonths.length > 0 && !yearMonths.includes(viewingMonth)) {
      setViewingMonth(availableMonths[0] || yearMonths[0]);
    }
  }, [activeYear, availableMonths, viewingMonth]);

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
        return <MessagesView role={role!} allOrders={allOrders} profileMode={currentSystem} />;
      case 'team':
        return <TeamView role={role!} allOrders={allOrders} currentUser={localStorage.getItem('auth_username') || role!} profileMode={currentSystem} onOrderClick={setSelectedOrder} />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_role');
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
      <AppLayout role={role} onLogout={handleLogout} onNotificationClick={handleNotificationClick} activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isSearchingAll={isSearchingAll} onSearchAll={() => setShowCalculator(true)} onCameraSearch={() => setShowCameraSearch(true)} viewingMonth={viewingMonth} setViewingMonth={setViewingMonth} activeYear={activeYear} setActiveYear={setActiveYear} availableMonths={availableMonths} currentSystem={currentSystem} onSystemChange={setCurrentSystem}>
        {renderContent()}
      </AppLayout>
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
      {showCalculator && <CalculatorModal monthlyStats={monthlyStats} onClose={() => setShowCalculator(false)} />}
      {showCameraSearch && <CameraSearchModal allOrders={allOrders} onOrderClick={o => { setShowCameraSearch(false); setSelectedOrder(o); }} onClose={() => setShowCameraSearch(false)} />}
      <GlobalCalculatorButton />
    </>
  );
};

export default Index;
