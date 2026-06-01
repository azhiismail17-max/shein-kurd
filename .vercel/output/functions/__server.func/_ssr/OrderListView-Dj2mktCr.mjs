import { r as reactExports, j as jsxRuntimeExports, a as React__default } from "../_libs/react.mjs";
import { getVerifiedSet, getMissingSet, getMissingImages, getOrderStatus, STATUS_ROW_COLORS, STATUS_COLORS, SCRIPT_URL, saveVerifiedSet, saveMissingImages, saveMissingSet } from "./index-CHMLBzfP.mjs";
import { M as MonthSelector } from "./MonthSelector-DbDMc4fl.mjs";
import { S as SkuSearch } from "./SkuSearch-4jSJaUHG.mjs";
import { getBoxName, getCustomerTotalPrice, isOrderFree, cleanOrderNo } from "./order-utils-BT6DDCZZ.mjs";
import { a as fetchWithRetry, s as sendNotification } from "./notifications-DZXkXpOb.mjs";
import { Q as Plus, F as FileText, P as Package, s as Link2, S as Scan, I as Image, a3 as TriangleAlert, H as Heart, E as ExternalLink, N as Pen, t as LoaderCircle, a9 as X } from "../_libs/lucide-react.mjs";
const QRScannerModal = React__default.lazy(() => import("./QRScannerModal-Byu3wrlm.mjs").then((mod) => ({ default: mod.QRScannerModal })));
const getPrimaryImg = (order) => {
  const urls = String(order.primary_urls || "").split(",").filter(Boolean);
  if (urls.length > 0) {
    if (urls[0].startsWith("http") || urls[0].startsWith("data:")) return urls[0];
    if (urls[0].length > 100) return `data:image/jpeg;base64,${urls[0]}`;
  }
  return null;
};
const OrderListView = ({ orders, onEdit, onDelete, onOrderClick, allOrders, viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths, onStatusChange, role, onNewOrder, isDeliveryTab, onUpdateOrder }) => {
  const [viewMode, setViewMode] = reactExports.useState("table");
  const [generatingPdf, setGeneratingPdf] = reactExports.useState(null);
  const [verifiedOrders, setVerifiedOrders] = reactExports.useState(getVerifiedSet);
  const [missingOrders, setMissingOrders] = reactExports.useState(getMissingSet);
  const [expandedGroups, setExpandedGroups] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isSelectMode, setIsSelectMode] = reactExports.useState(false);
  const [selectedOrders, setSelectedOrders] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isLinking, setIsLinking] = reactExports.useState(false);
  const [missingImages, setMissingImages] = reactExports.useState(getMissingImages);
  const fileRef = reactExports.useRef(null);
  const [pendingMissingKey, setPendingMissingKey] = reactExports.useState(null);
  const [pendingMissingOrder, setPendingMissingOrder] = reactExports.useState(null);
  const [isUploadingMissing, setIsUploadingMissing] = reactExports.useState(false);
  const [viewImageModal, setViewImageModal] = reactExports.useState(null);
  const [showQRScanner, setShowQRScanner] = reactExports.useState(false);
  const [isProcessingQR, setIsProcessingQR] = reactExports.useState(false);
  const handleManualDelivery = async () => {
    const input = window.prompt("Enter Order ID, Shein Order No, Phone, or Instagram handle to mark as delivered:");
    if (!input || !input.trim()) return;
    const match = input.trim().toLowerCase();
    const foundOrder = allOrders.find(
      (o) => String(o.orderNo).toLowerCase() === match || String(o.id) === match || String(o.phone) === match || String(o.insta).toLowerCase() === match
    );
    if (!foundOrder) {
      alert(`Order not found for entry: ${input}`);
      return;
    }
    if (role === "owner") {
      const confirmOrange = window.confirm(`Confirm delivery for ${foundOrder.name || foundOrder.insta || "Order"}? This will turn row orange.`);
      if (confirmOrange) {
        ({
          sheet: foundOrder.sheet_name,
          row_id: foundOrder.id,
          extra: `[DELIVERY_SCANNED] ${foundOrder.extra || ""}`.trim()
        });
        onStatusChange(foundOrder, "DELIVERY_SCANNED");
        alert("Delivery Confirmed and cell highlighted!");
      }
    } else {
      const confirmScan = window.confirm(`Scan order ${foundOrder.name || match} for delivery?`);
      if (confirmScan) {
        const payload = {
          sheet: foundOrder.sheet_name,
          row_id: foundOrder.id,
          note: `[DELIVERY_SCANNED] ${foundOrder.note || ""}`.trim()
        };
        onStatusChange({ ...foundOrder, note: payload.note }, "arrived");
        alert("Marked as Delivery Scanned, waiting for owner confirmation.");
      }
    }
  };
  const handleQRScan = async (scannedText) => {
    setShowQRScanner(false);
    setIsProcessingQR(true);
    try {
      const match = scannedText.trim();
      let parsedOrderId = null;
      let parsedSheetName = null;
      let isDetailedQR = false;
      try {
        const obj = JSON.parse(match);
        if (obj.orderNo) parsedOrderId = String(obj.orderNo);
        if (obj.id) parsedOrderId = String(obj.id);
        if (obj.sheet_name) {
          parsedSheetName = String(obj.sheet_name);
          isDetailedQR = true;
        }
      } catch (e) {
      }
      const foundOrder = allOrders.find((o) => {
        if (parsedOrderId && parsedSheetName) {
          return String(o.id) === parsedOrderId && String(o.sheet_name) === parsedSheetName;
        }
        return String(o.orderNo) === match || String(o.id) === match || String(o.phone) === match || `${o.id}-${o.sheet_name}` === match || parsedOrderId && (String(o.orderNo) === parsedOrderId || String(o.id) === parsedOrderId);
      });
      if (!foundOrder) {
        alert(`Order not found for QR code: ${match.substring(0, 50)}${match.length > 50 ? "..." : ""}`);
        return;
      }
      if (role === "owner") {
        const confirmOrange = isDetailedQR || window.confirm(`Confirm delivery for ${foundOrder.name || "Order"}? This will turn row orange.`);
        if (confirmOrange) {
          const payload = {
            action: "update",
            row_id: foundOrder.id,
            sheet: foundOrder.sheet_name,
            color_orange: true,
            note: ((foundOrder.note || "").replace(/\[DELIVERY_SCANNED\]/g, "") + " [DELIVERY_CONFIRMED]").trim()
          };
          await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
          alert("Delivery Confirmed and cell highlighted!");
        }
      } else {
        const confirmScan = isDetailedQR || window.confirm(`Scan order ${foundOrder.name || match} for delivery?`);
        if (confirmScan) {
          const payload = {
            action: "update",
            row_id: foundOrder.id,
            sheet: foundOrder.sheet_name,
            note: ((foundOrder.note || "") + " [DELIVERY_SCANNED]").trim()
          };
          await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
          alert("Order scanned for delivery!");
        }
      }
    } catch (e) {
      alert("Error updating order");
    } finally {
      setIsProcessingQR(false);
    }
  };
  const handleOwnerConfirmDelivery = async (order, e) => {
    e.stopPropagation();
    const confirmOrange = window.confirm(`Confirm delivery for ${order.name || "Order"}? This will turn row orange.`);
    if (confirmOrange) {
      try {
        const payload = {
          action: "update",
          row_id: order.id,
          sheet: order.sheet_name,
          color_orange: true,
          note: ((order.note || "").replace(/\[DELIVERY_SCANNED\]/g, "") + " [DELIVERY_CONFIRMED]").trim()
        };
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
        alert("Delivery Confirmed and cell highlighted! Refresh manually to see changes.");
      } catch (err) {
        alert("Error updating order");
      }
    }
  };
  const handleBoxNameChange = async (order, e) => {
    e.stopPropagation();
    const currentBox = getBoxName(order);
    const newBox = window.prompt(`Change Box Name for ${order.name || order.insta || "this order"}:`, currentBox);
    if (newBox !== null && newBox.trim() !== currentBox) {
      const trimmed = newBox.trim();
      try {
        await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "update_box_name",
            row_id: order.id,
            sheet: order.sheet_name,
            box_name: trimmed
          })
        });
        order.box_name = trimmed;
      } catch (err) {
        alert("Failed to update box name");
      }
    }
  };
  const groupedOrders = reactExports.useMemo(() => {
    return orders.map((order) => {
      const key = `${order.id}-${order.sheet_name}`;
      return {
        baseOrder: order,
        linkedOrders: [],
        // No visual grouping from now on
        key,
        isGroup: false
      };
    });
  }, [orders]);
  const handleVerify = (order, e) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    const next = new Set(verifiedOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVerifiedOrders(next);
    saveVerifiedSet(next);
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "verifyOrder", row_id: order.id, sheet_name: order.sheet_name, matchStatus: next.has(key) ? "match" : "mismatch" }) }).catch(() => {
    });
  };
  const toggleSelect = (order, e) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const handleLinkOrders = async () => {
    if (selectedOrders.size < 2) return;
    setIsLinking(true);
    const selectedObjArray = orders.filter((o) => selectedOrders.has(`${o.id}-${o.sheet_name}`));
    if (selectedObjArray.length === 0) {
      setIsLinking(false);
      return;
    }
    const sheetName = selectedObjArray[0].sheet_name;
    const rowIds = selectedObjArray.map((o) => o.id);
    try {
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "merge_buying_price",
          sheet_name: sheetName,
          row_ids: rowIds
        })
      });
      setSelectedOrders(/* @__PURE__ */ new Set());
      setIsSelectMode(false);
      alert("Orders linked successfully. The system will sync the latest data automatically.");
    } catch (e) {
      alert("Failed to link orders.");
    } finally {
      setIsLinking(false);
    }
  };
  const handleMissingClick = (order, e) => {
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
  const toggleMissing = (order, key, isMissing, warningImageUrl) => {
    const next = new Set(missingOrders);
    if (isMissing) next.add(key);
    else next.delete(key);
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
        onUpdateOrder(order.id, order.sheet_name, { warningBase64: void 0, warningImageUrl: void 0 });
      }
      fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_warning_picture",
          row_id: order.id,
          sheet_name: order.sheet_name,
          image_url: ""
        })
      }).catch(() => {
      });
      fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "remove_warning_notification", row_id: order.id, sheet_name: order.sheet_name })
      }).catch(() => {
      });
    }
    if (isMissing && warningImageUrl) {
      sendNotification("warning", `WARNING added to order: ${order.name || order.insta}. Please check!`, role ?? null, order, true);
      fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_warning_picture",
          row_id: order.id,
          sheet_name: order.sheet_name,
          image_url: warningImageUrl
        })
      }).catch(() => {
      });
    }
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "markMissing",
        row_id: order.id,
        sheet_name: order.sheet_name,
        missing: isMissing
      })
    }).catch(() => {
    });
  };
  const handleMissingImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingMissingKey || !pendingMissingOrder) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setIsUploadingMissing(true);
    try {
      const { uploadToImgBB: uploadToImgBB2 } = await import("./order-utils-BT6DDCZZ.mjs");
      const url = await uploadToImgBB2(file);
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
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  if (orders.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      !isDeliveryTab && /* @__PURE__ */ jsxRuntimeExports.jsx(MonthSelector, { viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-20 text-center animate-fade-in space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl opacity-30", children: "📦" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium", children: "No orders found" }),
        !isDeliveryTab && onNewOrder && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onNewOrder, className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
          "Add First Order"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-slide-up space-y-2 sm:space-y-3", children: [
    !isDeliveryTab && /* @__PURE__ */ jsxRuntimeExports.jsx(MonthSelector, { viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMode("table"), className: `p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 16 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMode("gallery"), className: `p-2 rounded-lg transition-all ${viewMode === "gallery" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16 }) }),
        !isDeliveryTab && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setIsSelectMode(!isSelectMode);
          setSelectedOrders(/* @__PURE__ */ new Set());
        }, className: `p-2 rounded-lg transition-all ml-1 border ${isSelectMode ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:bg-secondary"}`, title: "Select mode for linking orders", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] sm:text-xs font-medium text-muted-foreground sm:mr-2", children: [
          orders.length,
          " orders"
        ] }),
        isDeliveryTab && (role === "owner" || role === "admin") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowQRScanner(true), className: "flex items-center justify-center p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-all border border-orange-200", title: "Scan QR Code", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scan, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleManualDelivery, className: "flex items-center gap-1.5 bg-orange-600 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-700 transition-all shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Add Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Add" })
          ] })
        ] }),
        !isDeliveryTab && /* @__PURE__ */ jsxRuntimeExports.jsx(SkuSearch, { orders: allOrders, onFound: onOrderClick }),
        !isDeliveryTab && onNewOrder && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onNewOrder, className: "flex items-center gap-1.5 bg-primary text-primary-foreground px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 transition-all shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "New Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "New" })
        ] })
      ] })
    ] }),
    viewMode === "gallery" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3", children: groupedOrders.map((group) => {
      const order = group.baseOrder;
      const boxName = getBoxName(order);
      const key = group.key;
      const isVerified = verifiedOrders.has(key);
      const isMissing = missingOrders.has(key) || !!order.warningBase64 || !!order.warningImageUrl;
      const status = getOrderStatus(order);
      const individualPrice = getCustomerTotalPrice(order);
      const isFree = isOrderFree(order);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(React__default.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: (e) => {
            if (isSelectMode) {
              toggleSelect(order, e);
              return;
            }
            onOrderClick(order);
          },
          className: `bg-card border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group/card ${selectedOrders.has(key) ? "border-primary ring-2 ring-primary/50" : isVerified ? "border-primary/30 ring-1 ring-primary/20" : isMissing ? "border-amber-400/30 ring-1 ring-amber-400/20" : "border-border"} ${STATUS_ROW_COLORS[status]}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
              getPrimaryImg(order) ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: getPrimaryImg(order), alt: "", referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500", onError: (e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add("bg-green-500/20");
              } }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full bg-green-500/20 flex flex-col items-center justify-center text-green-700/50 group-hover/card:bg-green-500/30 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 24, className: "mb-1 opacity-50" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold opacity-70", children: "No Image" })
              ] }),
              isSelectMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center", children: selectedOrders.has(key) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 rounded-full bg-primary" }) }),
              !isSelectMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: (e) => handleMissingClick(order, e), className: `absolute top-1 left-1 p-1 rounded-full cursor-pointer hover:scale-110 transition-transform ${isMissing ? "bg-amber-400 text-white shadow-md" : "bg-background/80 backdrop-blur-sm text-amber-500/70 hover:bg-amber-400 hover:text-white"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }) }),
              !isSelectMode && isVerified && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1 p-1 bg-primary rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 10, className: "text-primary-foreground", fill: "currentColor" }) }),
              !isDeliveryTab && order.linkedOrderIds && order.linkedOrderIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1 right-1 bg-background/80 backdrop-blur rounded p-1 flex items-center gap-1 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12, className: "text-primary" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-1 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm truncate", children: order.name || order.insta }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-bold text-sm whitespace-nowrap", children: [
                    individualPrice.toLocaleString(),
                    " IQD"
                  ] }),
                  isFree && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded font-bold uppercase mt-0.5", children: "Free Ship" })
                ] })
              ] }),
              order.link && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: String(order.link).startsWith("http") ? order.link : `https://${order.link}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium transition-colors", onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 10 }),
                " Product Link"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: order.place || "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1 py-0.5 rounded text-[10px] font-semibold border ${STATUS_COLORS[status]}`, children: status })
              ] }),
              order.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded truncate", title: order.note, children: [
                "Note: ",
                order.note
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => handleBoxNameChange(order, e), className: "mt-1 text-xs text-primary font-medium truncate cursor-pointer hover:underline flex items-center group", children: [
                "📦 ",
                boxName ? `Box ${boxName}` : "Add Box Name",
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 10, className: "ml-1 opacity-0 group-hover:opacity-100 transition-opacity" })
              ] }),
              role === "owner" && String(order.note || "").includes("[DELIVERY_SCANNED]") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOwnerConfirmDelivery(order, e), className: "mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 rounded-lg text-xs transition-colors shadow-sm", children: "Confirm Delivery" })
            ] })
          ]
        }
      ) }, key);
    }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card rounded-lg sm:rounded-xl border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: groupedOrders.map((group) => {
      const order = group.baseOrder;
      const status = getOrderStatus(order);
      const individualPrice = getCustomerTotalPrice(order);
      const isFree = isOrderFree(order);
      const initial = parseFloat(String(order.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;
      const remaining = individualPrice - initial;
      const boxName = getBoxName(order);
      const key = group.key;
      const isVerified = verifiedOrders.has(key);
      const isMissing = missingOrders.has(key) || !!order.warningBase64 || !!order.warningImageUrl;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(React__default.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `p-1.5 sm:p-2.5 flex items-center gap-2 transition-colors cursor-pointer active:scale-[0.98] ${selectedOrders.has(key) ? "bg-primary/10" : isVerified ? "bg-primary/5" : isMissing ? "bg-amber-50 dark:bg-amber-500/5" : ""} ${STATUS_ROW_COLORS[status]}`,
          onClick: (e) => {
            if (isSelectMode) {
              toggleSelect(order, e);
              return;
            }
            onOrderClick(order);
          },
          children: [
            isSelectMode ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 w-4 h-4 rounded-full border border-primary flex items-center justify-center bg-background", children: selectedOrders.has(key) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleMissingClick(order, e), className: `shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all ${isMissing ? "bg-amber-400 text-white" : "bg-secondary text-muted-foreground hover:text-amber-500"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border relative", children: [
              getPrimaryImg(order) ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: getPrimaryImg(order), alt: "", referrerPolicy: "no-referrer", className: "w-full h-full object-cover", onError: (e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add("bg-green-500/20");
              } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-green-500/20 flex items-center justify-center text-green-700/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 16, className: "opacity-70" }) }),
              !isDeliveryTab && order.linkedOrderIds && order.linkedOrderIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1 bg-background rounded-tl p-0.5 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 10, className: "text-primary" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pr-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-[13px] sm:text-[15px] leading-tight mb-0.5 truncate", children: [
                "@",
                order.insta || "Unknown"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-wrap mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0 rounded text-[9px] font-semibold border ${STATUS_COLORS[status]}`, children: status }),
                boxName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { onClick: (e) => handleBoxNameChange(order, e), className: "px-1.5 py-0 rounded text-[9px] font-semibold border bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors", children: [
                  "📦 Box ",
                  boxName
                ] }),
                isFree && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0 rounded text-[9px] font-bold text-green-600 bg-green-500/20 uppercase", children: "Free" }),
                order.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] sm:text-[10px] font-medium text-muted-foreground bg-secondary/50 px-1 py-0 rounded truncate max-w-[100px]", children: [
                  "Notes: ",
                  order.note
                ] }),
                !isDeliveryTab && order.sku && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] bg-secondary/50 px-1 py-0 rounded font-mono text-muted-foreground", children: [
                  "SKU: ",
                  order.sku
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] sm:text-[11px] text-muted-foreground leading-tight truncate", children: [
                order.date ? order.date : order.orderNo ? `#${cleanOrderNo(order.orderNo)}` : "#Pending",
                " · ",
                order.sheet_name
              ] }),
              role === "owner" && String(order.note || "").includes("[DELIVERY_SCANNED]") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleOwnerConfirmDelivery(order, e), className: "mt-1 w-full max-w-[120px] bg-orange-500 hover:bg-orange-600 text-white font-bold py-0.5 px-2 rounded-lg text-[9px] text-center transition-colors shadow-sm", children: "Confirm Delivery" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-1.5", children: [
                order.link && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: String(order.link).startsWith("http") ? order.link : `https://${order.link}`, target: "_blank", rel: "noopener noreferrer", className: "text-muted-foreground hover:text-primary transition-colors flex items-center justify-center", onClick: (e) => e.stopPropagation(), title: "Product Link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 12 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: status, onChange: (e) => {
                  e.stopPropagation();
                  onStatusChange(order, e.target.value);
                }, className: "bg-transparent text-[11px] border-none focus:outline-none text-muted-foreground cursor-pointer w-4 appearance-none text-center p-0 m-0 leading-none", onClick: (e) => e.stopPropagation(), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "⏳" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "approved", children: "✅" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "arrived", children: "📦" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelled", children: "❌" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleVerify(order, e), className: `transition-all flex items-center justify-center ${isVerified ? "text-primary" : "text-muted-foreground hover:text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 12, fill: isVerified ? "currentColor" : "none" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end justify-center min-w-[50px] sm:min-w-[55px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-[13px] sm:text-[15px] leading-none tracking-tight", children: individualPrice.toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] font-bold mt-1 tracking-tight ${remaining > 0 ? "text-amber-500" : "text-primary"}`, children: remaining > 0 ? `${remaining.toLocaleString()} due` : "✅ Paid" })
              ] })
            ] })
          ]
        }
      ) }, `${key}-m`);
    }) }) }),
    isSelectMode && selectedOrders.size > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-6 left-1/2 -translate-x-1/2 pr-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-xl flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium whitespace-nowrap", children: [
        selectedOrders.size,
        " orders selected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          disabled: isLinking,
          onClick: handleLinkOrders,
          className: "bg-background text-primary px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap",
          children: isLinking ? "Linking..." : "Link Orders"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setIsSelectMode(false);
        setSelectedOrders(/* @__PURE__ */ new Set());
      }, className: "p-1 hover:bg-background/20 rounded-full transition-colors ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 20, className: "rotate-45" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileRef, accept: "image/*", className: "hidden", onChange: handleMissingImageChange }),
    isUploadingMissing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-6 rounded-2xl shadow-xl border border-border flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-amber-500", size: 32 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm", children: "Uploading Warning Image..." })
    ] }) }),
    viewImageModal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[150] flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm", onClick: () => setViewImageModal(null) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 p-4 max-h-screen flex flex-col items-center max-w-2xl w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewImageModal(null), className: "absolute -top-12 right-0 p-2 text-white hover:text-amber-400 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 28 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-secondary/50 p-2 rounded-xl border border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: orders.find((o) => `${o.id}-${o.sheet_name}` === viewImageModal)?.warningBase64 || orders.find((o) => `${o.id}-${o.sheet_name}` === viewImageModal)?.warningImageUrl || missingImages[viewImageModal], alt: "Warning", referrerPolicy: "no-referrer", className: "max-w-full max-h-[70vh] object-contain rounded-lg" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex gap-4 w-full justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          const keyToDel = viewImageModal;
          setViewImageModal(null);
          const orderO = orders.find((o) => `${o.id}-${o.sheet_name}` === keyToDel);
          if (orderO) {
            toggleMissing(orderO, keyToDel, false);
            if (onUpdateOrder) {
              onUpdateOrder(orderO.id, orderO.sheet_name, { warningBase64: void 0, warningImageUrl: void 0 });
            }
          }
        }, className: "px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
          "Unmark Warning"
        ] }) })
      ] })
    ] }),
    showQRScanner && /* @__PURE__ */ jsxRuntimeExports.jsx(React__default.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRScannerModal, { onScan: handleQRScan, onClose: () => setShowQRScanner(false) }) })
  ] });
};
export {
  OrderListView as default
};
