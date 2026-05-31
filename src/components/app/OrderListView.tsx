import React, { useState, useMemo, useRef } from 'react';
import { Order, SCRIPT_URL, getOrderStatus, STATUS_COLORS, STATUS_ROW_COLORS, getVerifiedSet, saveVerifiedSet, getMissingSet, saveMissingSet, getMissingImages, saveMissingImages } from '@/types';
import { Edit2, Trash2, ExternalLink, FileText, Package, Share2, Phone, MapPin, Heart, AlertTriangle, ChevronLeft, Link2, ChevronDown, ChevronRight, Layers, Plus, Loader2, X, Image as ImageIcon, Scan } from 'lucide-react';
import MonthSelector from './MonthSelector';
import { SkuSearch } from './SkuSearch';
import { getLinkedOrdersInfo, getCustomerTotalPrice, isOrderFree, cleanOrderNo, uploadToImgBB, getBoxName } from '@/lib/order-utils';
import { fetchWithRetry } from '@/lib/fetchWithRetry';
import { QRScannerModal } from './QRScannerModal';
import { sendNotification } from '@/lib/notifications';

const getPrimaryImg = (order: Order) => {
  const urls = String(order.primary_urls || '').split(',').filter(Boolean);
  if (urls.length > 0) {
    if (urls[0].startsWith('http') || urls[0].startsWith('data:')) return urls[0];
    // If it's a raw base64 string without data prefix, try adding it
    if (urls[0].length > 100) return `data:image/jpeg;base64,${urls[0]}`;
  }
  return null;
};

interface OrderListViewProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string | number, sheetName: string) => void;
  onOrderClick: (order: Order) => void;
  allOrders: Order[];
  viewingMonth: string;
  setViewingMonth: (m: string) => void;
  activeYear: string;
  setActiveYear: (y: string) => void;
  availableMonths: string[];
  onStatusChange: (order: Order, status: string) => void;
  role?: string | null;
  onNewOrder?: () => void;
  isDeliveryTab?: boolean;
  onUpdateOrder?: (id: string | number, sheet: string, updates: Partial<Order>) => void;
}

const OrderListView: React.FC<OrderListViewProps> = ({ orders, onEdit, onDelete, onOrderClick, allOrders, viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths, onStatusChange, role, onNewOrder, isDeliveryTab, onUpdateOrder }) => {
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [verifiedOrders, setVerifiedOrders] = useState<Set<string>>(getVerifiedSet);
  const [missingOrders, setMissingOrders] = useState<Set<string>>(getMissingSet);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isLinking, setIsLinking] = useState(false);
  const [missingImages, setMissingImages] = useState<Record<string, string>>(getMissingImages);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingMissingKey, setPendingMissingKey] = useState<string | null>(null);
  const [pendingMissingOrder, setPendingMissingOrder] = useState<Order | null>(null);
  const [isUploadingMissing, setIsUploadingMissing] = useState(false);
  const [viewImageModal, setViewImageModal] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isProcessingQR, setIsProcessingQR] = useState(false);

  const handleManualDelivery = async () => {
    const input = window.prompt("Enter Order ID, Shein Order No, Phone, or Instagram handle to mark as delivered:");
    if (!input || !input.trim()) return;
    
    // Attempt match
    const match = input.trim().toLowerCase();
    const foundOrder = allOrders.find(o => 
      String(o.orderNo).toLowerCase() === match || 
      String(o.id) === match || 
      String(o.phone) === match ||
      String(o.insta).toLowerCase() === match
    );

    if (!foundOrder) {
      alert(`Order not found for entry: ${input}`);
      return;
    }

    if (role === 'owner') {
      const confirmOrange = window.confirm(`Confirm delivery for ${foundOrder.name || foundOrder.insta || 'Order'}? This will turn row orange.`);
      if (confirmOrange) {
        const payload = {
          action: 'update',
          sheet: foundOrder.sheet_name,
          row_id: foundOrder.id,
          extra: `[DELIVERY_SCANNED] ${foundOrder.extra || ''}`.trim()
        };
        onStatusChange(foundOrder, 'DELIVERY_SCANNED');
        alert('Delivery Confirmed and cell highlighted!');
      }
    } else {
      const confirmScan = window.confirm(`Scan order ${foundOrder.name || match} for delivery?`);
      if (confirmScan) {
        const payload = {
          action: 'update',
          sheet: foundOrder.sheet_name,
          row_id: foundOrder.id,
          note: `[DELIVERY_SCANNED] ${foundOrder.note || ''}`.trim()
        };
        onStatusChange({ ...foundOrder, note: payload.note }, 'arrived');
        alert('Marked as Delivery Scanned, waiting for owner confirmation.');
      }
    }
  };

  const handleQRScan = async (scannedText: string) => {
    setShowQRScanner(false);
    setIsProcessingQR(true);
    try {
      const match = scannedText.trim();
      let parsedOrderId: string | null = null;
      let parsedSheetName: string | null = null;
      let isDetailedQR = false;
      try {
        const obj = JSON.parse(match);
        if (obj.orderNo) parsedOrderId = String(obj.orderNo);
        if (obj.id) parsedOrderId = String(obj.id);
        if (obj.sheet_name) {
          parsedSheetName = String(obj.sheet_name);
          isDetailedQR = true;
        }
      } catch(e) {}

      const foundOrder = allOrders.find(o => {
        if (parsedOrderId && parsedSheetName) {
          return String(o.id) === parsedOrderId && String(o.sheet_name) === parsedSheetName;
        }
        return String(o.orderNo) === match || 
          String(o.id) === match || 
          String(o.phone) === match ||
          `${o.id}-${o.sheet_name}` === match ||
          (parsedOrderId && (String(o.orderNo) === parsedOrderId || String(o.id) === parsedOrderId));
      });

      if (!foundOrder) {
        alert(`Order not found for QR code: ${match.substring(0, 50)}${match.length > 50 ? '...' : ''}`);
        return;
      }

      if (role === 'owner') {
        const confirmOrange = isDetailedQR || window.confirm(`Confirm delivery for ${foundOrder.name || 'Order'}? This will turn row orange.`);
        if (confirmOrange) {
          const payload = {
            action: 'update',
            row_id: foundOrder.id,
            sheet: foundOrder.sheet_name,
            color_orange: true,
            note: ((foundOrder.note || '').replace(/\[DELIVERY_SCANNED\]/g, '') + ' [DELIVERY_CONFIRMED]').trim()
          };
          await fetchWithRetry(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
          alert('Delivery Confirmed and cell highlighted!');
        }
      } else {
        const confirmScan = isDetailedQR || window.confirm(`Scan order ${foundOrder.name || match} for delivery?`);
        if (confirmScan) {
          const payload = {
            action: 'update',
            row_id: foundOrder.id,
            sheet: foundOrder.sheet_name,
            note: ((foundOrder.note || '') + ' [DELIVERY_SCANNED]').trim()
          };
          await fetchWithRetry(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
          alert('Order scanned for delivery!');
        }
      }
    } catch (e) {
      alert('Error updating order');
    } finally {
      setIsProcessingQR(false);
    }
  };

  const handleOwnerConfirmDelivery = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmOrange = window.confirm(`Confirm delivery for ${order.name || 'Order'}? This will turn row orange.`);
    if (confirmOrange) {
      try {
        const payload = {
          action: 'update',
          row_id: order.id,
          sheet: order.sheet_name,
          color_orange: true,
          note: ((order.note || '').replace(/\[DELIVERY_SCANNED\]/g, '') + ' [DELIVERY_CONFIRMED]').trim()
        };
        await fetchWithRetry(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
        alert('Delivery Confirmed and cell highlighted! Refresh manually to see changes.');
      } catch (err) {
        alert('Error updating order');
      }
    }
  };

  const handleBoxNameChange = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentBox = getBoxName(order);
    const newBox = window.prompt(`Change Box Name for ${order.name || order.insta || 'this order'}:`, currentBox);
    if (newBox !== null && newBox.trim() !== currentBox) {
      const trimmed = newBox.trim();
      try {
        await fetchWithRetry(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'update_box_name',
            row_id: order.id,
            sheet: order.sheet_name,
            box_name: trimmed
          })
        });
        order.box_name = trimmed; // Optimistic update
      } catch (err) {
        alert('Failed to update box name');
      }
    }
  };

  const groupedOrders = useMemo(() => {
    return orders.map(order => {
      const key = `${order.id}-${order.sheet_name}`;
      return { 
        baseOrder: order, 
        linkedOrders: [], // No visual grouping from now on
        key,
        isGroup: false
      };
    });
  }, [orders]);

  const toggleGroup = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // No longer grouping
  };

  const handleGetPdf = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (generatingPdf) return;
    setGeneratingPdf(String(order.id));
    try {
      const { generateSingleOrderPdf } = await import('@/lib/pdf');
      generateSingleOrderPdf(order, allOrders);
    } catch (err) { console.error(err); }
    finally { setGeneratingPdf(null); }
  };

  const handleShare = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const { combinedPrice, combinedInitial, shipping, total, remaining } = getLinkedOrdersInfo(order, allOrders);
    
    const text = `📦 Order Details\n👤 Name: ${order.name || '-'}\n📸 Instagram: ${order.insta || '-'}\n📱 Phone: ${order.phone || '-'}\n📍 Location: ${order.place || '-'}\n💰 Total: ${combinedPrice.toLocaleString()} IQD\n💳 Advance: ${combinedInitial.toLocaleString()} IQD\n📉 Remaining: ${remaining.toLocaleString()} IQD\n🆔 Order No: ${cleanOrderNo(order.orderNo) || 'Pending'}`;
    if (navigator.share) navigator.share({ title: 'Order Details', text }).catch(() => {});
    else navigator.clipboard.writeText(text).then(() => alert('Copied!'));
  };

  const handleVerify = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    const next = new Set(verifiedOrders);
    if (next.has(key)) next.delete(key); else next.add(key);
    setVerifiedOrders(next);
    saveVerifiedSet(next);
    // Fire and forget to GAS
    fetchWithRetry(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'verifyOrder', row_id: order.id, sheet_name: order.sheet_name, matchStatus: next.has(key) ? 'match' : 'mismatch' }) }).catch(() => {});
  };

  const toggleSelect = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleLinkOrders = async () => {
    if (selectedOrders.size < 2) return;
    setIsLinking(true);
    
    // Group selected into an array of IDs from the current sheet
    // Actually our merge script only supports one sheet at a time right now based on how it's written `var sheet = ss.getSheetByName(sheetName)`
    const selectedObjArray = orders.filter(o => selectedOrders.has(`${o.id}-${o.sheet_name}`));
    if (selectedObjArray.length === 0) { setIsLinking(false); return; }
    const sheetName = selectedObjArray[0].sheet_name;
    const rowIds = selectedObjArray.map(o => o.id);

    try {
      await fetchWithRetry(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'merge_buying_price',
          sheet_name: sheetName,
          row_ids: rowIds
        })
      });
      setSelectedOrders(new Set());
      setIsSelectMode(false);
      alert('Orders linked successfully. The system will sync the latest data automatically.');
    } catch (e) {
      alert('Failed to link orders.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleMissingClick = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    if (order.warningBase64 || order.warningImageUrl || missingImages[key]) {
      setViewImageModal(key);
    } else {
      setPendingMissingOrder(order);
      setPendingMissingKey(key);
      fileRef.current?.click();
    }
  };

  const toggleMissing = (order: Order, key: string, isMissing: boolean, warningImageUrl?: string) => {
    const next = new Set(missingOrders);
    if (isMissing) next.add(key); else next.delete(key);
    setMissingOrders(next);
    saveMissingSet(next);
    
    if (!isMissing) {
      if (missingImages[key]) {
        const nextImages = { ...missingImages };
        delete nextImages[key];
        setMissingImages(nextImages);
        saveMissingImages(nextImages);
      }
      
      if (onUpdateOrder) {
        onUpdateOrder(order.id, order.sheet_name, { warningBase64: undefined, warningImageUrl: undefined });
      }

      fetchWithRetry(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ 
          action: 'update_warning_picture', 
          row_id: order.id, 
          sheet_name: order.sheet_name, 
          image_url: ""
        }) 
      }).catch(() => {});
      
      // Remove the original warning notification globally
      fetchWithRetry(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'remove_warning_notification', row_id: order.id, sheet_name: order.sheet_name }) 
      }).catch(() => {});
    }

    if (isMissing && warningImageUrl) {
      sendNotification('warning', `WARNING added to order: ${order.name || order.insta}. Please check!`, role ?? null, order, true);
      
      fetchWithRetry(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ 
          action: 'update_warning_picture', 
          row_id: order.id, 
          sheet_name: order.sheet_name, 
          image_url: warningImageUrl
        }) 
      }).catch(() => {});
    }

    fetchWithRetry(SCRIPT_URL, { 
      method: 'POST', 
      body: JSON.stringify({ 
        action: 'markMissing', 
        row_id: order.id, 
        sheet_name: order.sheet_name, 
        missing: isMissing
      }) 
    }).catch(() => {});
  };

  const handleMissingImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingMissingKey || !pendingMissingOrder) {
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    
    setIsUploadingMissing(true);
    try {
      const { uploadToImgBB } = await import('@/lib/order-utils');
      const url = await uploadToImgBB(file);
      const newImages = { ...missingImages, [pendingMissingKey]: url };
      setMissingImages(newImages);
      saveMissingImages(newImages);
      toggleMissing(pendingMissingOrder, pendingMissingKey, true, url);
    } catch (err) {
      alert("Failed to upload missing image");
    } finally {
      setIsUploadingMissing(false);
      setPendingMissingKey(null);
      setPendingMissingOrder(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        {!isDeliveryTab && <MonthSelector viewingMonth={viewingMonth} setViewingMonth={setViewingMonth} activeYear={activeYear} setActiveYear={setActiveYear} availableMonths={availableMonths} />}
        <div className="py-20 text-center animate-fade-in space-y-4">
          <div className="text-4xl opacity-30">📦</div>
          <p className="text-muted-foreground font-medium">No orders found</p>
          {!isDeliveryTab && onNewOrder && (
            <button onClick={onNewOrder} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
              <Plus size={16} />
              Add First Order
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-3">
      {!isDeliveryTab && <MonthSelector viewingMonth={viewingMonth} setViewingMonth={setViewingMonth} activeYear={activeYear} setActiveYear={setActiveYear} availableMonths={availableMonths} />}

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}><FileText size={16} /></button>
          <button onClick={() => setViewMode('gallery')} className={`p-2 rounded-lg transition-all ${viewMode === 'gallery' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}><Package size={16} /></button>
          {!isDeliveryTab && (
            <button onClick={() => { setIsSelectMode(!isSelectMode); setSelectedOrders(new Set()); }} className={`p-2 rounded-lg transition-all ml-1 border ${isSelectMode ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground border-border hover:bg-secondary'}`} title="Select mode for linking orders">
              <Link2 size={16} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground mr-2">{orders.length} orders</span>
          {isDeliveryTab && (role === 'owner' || role === 'admin') && (
            <>
              <button onClick={() => setShowQRScanner(true)} className="flex items-center justify-center p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-all border border-orange-200" title="Scan QR Code">
                <Scan size={18} />
              </button>
              <button onClick={handleManualDelivery} className="flex items-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-all shadow-sm">
                <Plus size={14} /> <span className="hidden sm:inline">Add Delivery</span><span className="sm:hidden">Add</span>
              </button>
            </>
          )}
          {!isDeliveryTab && <SkuSearch orders={allOrders} onFound={onOrderClick} />}
          {!isDeliveryTab && onNewOrder && (
            <button onClick={onNewOrder} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
              <Plus size={14} /> <span className="hidden sm:inline">New Order</span><span className="sm:hidden">New</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'gallery' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {groupedOrders.map(group => {
            const order = group.baseOrder;
            const boxName = getBoxName(order);
            const key = group.key;
            const isVerified = verifiedOrders.has(key);
            const isMissing = missingOrders.has(key) || !!order.warningBase64 || !!order.warningImageUrl;
            const status = getOrderStatus(order);
            const individualPrice = getCustomerTotalPrice(order);
            const isFree = isOrderFree(order);
            
            return (
              <React.Fragment key={key}>
                <div onClick={(e) => {
                  if (isSelectMode) { toggleSelect(order, e); return; }
                  onOrderClick(order);
                }}
                  className={`bg-card border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group/card ${selectedOrders.has(key) ? 'border-primary ring-2 ring-primary/50' : isVerified ? 'border-primary/30 ring-1 ring-primary/20' : isMissing ? 'border-amber-400/30 ring-1 ring-amber-400/20' : 'border-border'} ${STATUS_ROW_COLORS[status]}`}>
                  <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden relative">
                    {getPrimaryImg(order) ? (
                      <img src={getPrimaryImg(order)!} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('bg-green-500/20'); }} />
                    ) : (
                      <div className="w-full h-full bg-green-500/20 flex flex-col items-center justify-center text-green-700/50 group-hover/card:bg-green-500/30 transition-colors">
                        <ImageIcon size={24} className="mb-1 opacity-50" />
                        <span className="text-[10px] font-semibold opacity-70">No Image</span>
                      </div>
                    )}
                    {isSelectMode && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                        {selectedOrders.has(key) && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                    )}
                    {!isSelectMode && (
                      <div onClick={(e) => handleMissingClick(order, e)} className={`absolute top-1 left-1 p-1 rounded-full cursor-pointer hover:scale-110 transition-transform ${isMissing ? 'bg-amber-400 text-white shadow-md' : 'bg-background/80 backdrop-blur-sm text-amber-500/70 hover:bg-amber-400 hover:text-white'}`}>
                        <AlertTriangle size={10} />
                      </div>
                    )}
                    {!isSelectMode && isVerified && <div className="absolute top-1 right-1 p-1 bg-primary rounded-full"><Heart size={10} className="text-primary-foreground" fill="currentColor" /></div>}
                    {!isDeliveryTab && order.linkedOrderIds && order.linkedOrderIds.length > 0 && (
                      <div className="absolute bottom-1 right-1 bg-background/80 backdrop-blur rounded p-1 flex items-center gap-1 shadow-sm">
                        <Link2 size={12} className="text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <div className="flex justify-between items-start gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="font-semibold text-sm truncate">{order.name || order.insta}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-primary font-bold text-sm whitespace-nowrap">{individualPrice.toLocaleString()} IQD</span>
                        {isFree && <span className="text-[10px] bg-green-500/20 text-green-600 px-1 rounded font-bold uppercase mt-0.5">Free Ship</span>}
                      </div>
                    </div>
                    {order.link && (
                      <div className="mb-1.5">
                        <a href={String(order.link).startsWith('http') ? order.link : `https://${order.link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium transition-colors" onClick={e => e.stopPropagation()}>
                          <ExternalLink size={10} /> Product Link
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{order.place || '-'}</span>
                      <span className={`px-1 py-0.5 rounded text-[10px] font-semibold border ${STATUS_COLORS[status]}`}>{status}</span>
                    </div>
                    {order.note && <div className="mt-1 text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded truncate" title={order.note}>Note: {order.note}</div>}
                    <div onClick={(e) => handleBoxNameChange(order, e)} className="mt-1 text-xs text-primary font-medium truncate cursor-pointer hover:underline flex items-center group">
                      📦 {boxName ? `Box ${boxName}` : 'Add Box Name'}
                      <Edit2 size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {role === 'owner' && String(order.note || '').includes('[DELIVERY_SCANNED]') && (
                      <button onClick={(e) => handleOwnerConfirmDelivery(order, e)} className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 rounded-lg text-xs transition-colors shadow-sm">
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Mobile List */}
          <div className="divide-y divide-border">
            {groupedOrders.map(group => {
              const order = group.baseOrder;
              const status = getOrderStatus(order);
              const individualPrice = getCustomerTotalPrice(order);
              const isFree = isOrderFree(order);
              const initial = parseFloat(String(order.initial_payment).replace(/[^0-9.-]+/g, '')) || 0;
              const remaining = individualPrice - initial;
              
              const boxName = getBoxName(order);
              const key = group.key;
              const isVerified = verifiedOrders.has(key);
              const isMissing = missingOrders.has(key) || !!order.warningBase64 || !!order.warningImageUrl;
              
              return (
                <React.Fragment key={`${key}-m`}>
                  <div className={`p-2 sm:p-2.5 flex items-center gap-2 transition-colors cursor-pointer active:scale-[0.98] ${selectedOrders.has(key) ? 'bg-primary/10' : isVerified ? 'bg-primary/5' : isMissing ? 'bg-amber-50 dark:bg-amber-500/5' : ''} ${STATUS_ROW_COLORS[status]}`}
                    onClick={(e) => {
                      if (isSelectMode) { toggleSelect(order, e); return; }
                      onOrderClick(order);
                    }}>
                    {/* Select indicator or Missing indicator */}
                    {isSelectMode ? (
                      <div className="shrink-0 w-4 h-4 rounded-full border border-primary flex items-center justify-center bg-background">
                        {selectedOrders.has(key) && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    ) : (
                      <button onClick={(e) => handleMissingClick(order, e)} className={`shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all ${isMissing ? 'bg-amber-400 text-white' : 'bg-secondary text-muted-foreground hover:text-amber-500'}`}>
                        <AlertTriangle size={10} />
                      </button>
                    )}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border relative">
                      {getPrimaryImg(order) ? (
                        <img src={getPrimaryImg(order)!} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('bg-green-500/20'); }} />
                      ) : (
                        <div className="w-full h-full bg-green-500/20 flex items-center justify-center text-green-700/50">
                          <ImageIcon size={16} className="opacity-70" />
                        </div>
                      )}
                      {!isDeliveryTab && order.linkedOrderIds && order.linkedOrderIds.length > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-tl p-0.5 shadow-sm">
                          <Link2 size={10} className="text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="font-bold text-[14px] sm:text-[15px] leading-tight mb-0.5 truncate">
                        @{order.insta || 'Unknown'}
                      </div>

                      <div className="flex items-center gap-1 flex-wrap mb-0.5">
                        <span className={`px-1.5 py-0 rounded text-[9px] font-semibold border ${STATUS_COLORS[status]}`}>{status}</span>
                        {boxName && (
                          <span onClick={(e) => handleBoxNameChange(order, e)} className="px-1.5 py-0 rounded text-[9px] font-semibold border bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">
                            📦 Box {boxName}
                          </span>
                        )}
                        {isFree && <span className="px-1.5 py-0 rounded text-[9px] font-bold text-green-600 bg-green-500/20 uppercase">Free</span>}
                        {order.note && <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground bg-secondary/50 px-1 py-0 rounded truncate max-w-[100px]">Notes: {order.note}</span>}
                        {!isDeliveryTab && order.sku && <span className="text-[9px] bg-secondary/50 px-1 py-0 rounded font-mono text-muted-foreground">SKU: {order.sku}</span>}
                      </div>

                      <div className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight truncate">
                        {order.date ? order.date : (order.orderNo ? `#${cleanOrderNo(order.orderNo)}` : '#Pending')} · {order.sheet_name}
                      </div>

                      {role === 'owner' && String(order.note || '').includes('[DELIVERY_SCANNED]') && (
                        <button onClick={(e) => handleOwnerConfirmDelivery(order, e)} className="mt-1 w-full max-w-[120px] bg-orange-500 hover:bg-orange-600 text-white font-bold py-0.5 px-2 rounded-lg text-[9px] text-center transition-colors shadow-sm">
                          Confirm Delivery
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {order.link && (
                          <a href={String(order.link).startsWith('http') ? order.link : `https://${order.link}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center" onClick={e => e.stopPropagation()} title="Product Link">
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <select value={status} onChange={e => { e.stopPropagation(); onStatusChange(order, e.target.value); }} className="bg-transparent text-[11px] border-none focus:outline-none text-muted-foreground cursor-pointer w-4 appearance-none text-center p-0 m-0 leading-none" onClick={e => e.stopPropagation()}>
                          <option value="pending">⏳</option>
                          <option value="approved">✅</option>
                          <option value="arrived">📦</option>
                          <option value="cancelled">❌</option>
                        </select>
                        <button onClick={(e) => handleVerify(order, e)} className={`transition-all flex items-center justify-center ${isVerified ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}><Heart size={12} fill={isVerified ? 'currentColor' : 'none'} /></button>
                      </div>

                      <div className="flex flex-col items-end justify-center min-w-[55px]">
                        <div className="font-bold text-[14px] sm:text-[15px] leading-none tracking-tight">{individualPrice.toLocaleString()}</div>
                        <div className={`text-[10px] font-bold mt-1 tracking-tight ${remaining > 0 ? 'text-amber-500' : 'text-primary'}`}>
                          {remaining > 0 ? `${remaining.toLocaleString()} due` : '✅ Paid'}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
      {isSelectMode && selectedOrders.size > 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 pr-4 z-50">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-xl flex items-center gap-4">
            <span className="font-medium whitespace-nowrap">{selectedOrders.size} orders selected</span>
            <button 
              disabled={isLinking}
              onClick={handleLinkOrders} 
              className="bg-background text-primary px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap">
              {isLinking ? 'Linking...' : 'Link Orders'}
            </button>
            <button onClick={() => { setIsSelectMode(false); setSelectedOrders(new Set()); }} className="p-1 hover:bg-background/20 rounded-full transition-colors ml-2">
              <Plus size={20} className="rotate-45" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Missing File Hidden Input */}
      <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleMissingImageChange} />

      {/* Uploading Status Overlay */}
      {isUploadingMissing && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-6 rounded-2xl shadow-xl border border-border flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-amber-500" size={32} />
            <p className="font-bold text-sm">Uploading Warning Image...</p>
          </div>
        </div>
      )}

      {/* View Missing Image Modal */}
      {viewImageModal && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewImageModal(null)} />
           <div className="relative z-10 p-4 max-h-screen flex flex-col items-center max-w-2xl w-full">
             <button onClick={() => setViewImageModal(null)} className="absolute -top-12 right-0 p-2 text-white hover:text-amber-400 transition-colors">
               <X size={28} />
             </button>
             <div className="bg-secondary/50 p-2 rounded-xl border border-border/50">
               <img src={orders.find(o => `${o.id}-${o.sheet_name}` === viewImageModal)?.warningBase64 || orders.find(o => `${o.id}-${o.sheet_name}` === viewImageModal)?.warningImageUrl || missingImages[viewImageModal]} alt="Warning" referrerPolicy="no-referrer" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
             </div>
             <div className="mt-8 flex gap-4 w-full justify-center">
               <button onClick={() => {
                   const keyToDel = viewImageModal;
                   setViewImageModal(null);
                   const orderO = orders.find(o => `${o.id}-${o.sheet_name}` === keyToDel);
                   if (orderO) {
                     toggleMissing(orderO, keyToDel, false);
                     if (onUpdateOrder) {
                       onUpdateOrder(orderO.id, orderO.sheet_name, { warningBase64: undefined, warningImageUrl: undefined });
                     }
                   }
               }} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95">
                 <AlertTriangle size={18} />
                 Unmark Warning
               </button>
             </div>
           </div>
        </div>
      )}
      
      {showQRScanner && (
        <QRScannerModal onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />
      )}
    </div>
  );
};

export default OrderListView;
