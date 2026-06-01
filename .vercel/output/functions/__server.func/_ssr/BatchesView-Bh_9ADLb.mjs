import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { m as getVerifiedSet, i as getMissingSet, S as SCRIPT_URL, a as STATUS_COLORS, j as getOrderStatus, t as saveMissingSet, u as saveVerifiedSet } from "./use-toast-CUyDYyz5.mjs";
import { d as getLinkedGroup, f as fetchWithRetry, s as sendNotification } from "./iraqi-BGJ5eM-r.mjs";
import { S as SkuSearch } from "./SkuSearch-9Fe2NnsY.mjs";
import "../_libs/firebase__firestore.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__storage.mjs";
import "../_libs/sonner.mjs";
import { d as Calendar, h as ChevronDown, Q as Plus, z as PackagePlus, T as Search, a3 as TriangleAlert, a9 as X, g as Check, s as Link2, P as Package, O as Pencil, p as Copy, n as CircleCheck, k as ChevronUp, q as Download, I as Image, E as ExternalLink, H as Heart, N as Pen } from "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__component.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/idb.mjs";
import "../_libs/firebase__webchannel-wrapper.mjs";
import "../_libs/@grpc/grpc-js.mjs";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "http2";
import "dns";
import "../_libs/@grpc/proto-loader.mjs";
import "path";
import "../_libs/lodash.camelcase.mjs";
import "../_libs/protobufjs.mjs";
import "../_libs/protobufjs__aspromise.mjs";
import "../_libs/protobufjs__base64.mjs";
import "../_libs/protobufjs__eventemitter.mjs";
import "../_libs/protobufjs__float.mjs";
import "../_libs/@protobufjs/inquire.mjs";
import "../_libs/protobufjs__utf8.mjs";
import "../_libs/protobufjs__pool.mjs";
import "../_libs/long.mjs";
import "../_libs/protobufjs__codegen.mjs";
import "../_libs/protobufjs__fetch.mjs";
import "../_libs/protobufjs__path.mjs";
import "http";
import "url";
import "zlib";
const BatchesView = ({ orders, allOrders, onOrderClick, onRefresh, onStatusChange, viewingMonth, setViewingMonth, availableMonths, activeYear, setActiveYear, role }) => {
  const [expandedBox, setExpandedBox] = reactExports.useState(null);
  const [editingField, setEditingField] = reactExports.useState(null);
  const [fieldInput, setFieldInput] = reactExports.useState("");
  const [boxFieldOverrides, setBoxFieldOverrides] = reactExports.useState({});
  const [finishedBoxOverrides, setFinishedBoxOverrides] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isSyncing, setIsSyncing] = reactExports.useState(false);
  const [copiedBox, setCopiedBox] = reactExports.useState(null);
  const [isDownloading, setIsDownloading] = reactExports.useState(null);
  const [verifiedOrders, setVerifiedOrders] = reactExports.useState(getVerifiedSet);
  const [missingOrders, setMissingOrders] = reactExports.useState(getMissingSet);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [creatingBox, setCreatingBox] = reactExports.useState(false);
  const [selectedForBox, setSelectedForBox] = reactExports.useState(/* @__PURE__ */ new Set());
  const [newBoxName, setNewBoxName] = reactExports.useState("");
  const [createSearch, setCreateSearch] = reactExports.useState("");
  const [showMonthPicker, setShowMonthPicker] = reactExports.useState(false);
  const monthPickerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handle = (e) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) setShowMonthPicker(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
  const [editingBoxPrice, setEditingBoxPrice] = reactExports.useState(null);
  const [priceInput, setPriceInput] = reactExports.useState("");
  const [renamingBox, setRenamingBox] = reactExports.useState(null);
  const [renameInput, setRenameInput] = reactExports.useState("");
  const autoBoxCounter = reactExports.useMemo(() => {
    const nums = orders.filter((o) => String(o.box_name || "").trim().match(/^Box \d+$/)).map((o) => parseInt(String(o.box_name).replace("Box ", "")) || 0);
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
  }, [orders]);
  const boxes = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    const inheritedBoxNames = /* @__PURE__ */ new Map();
    orders.forEach((o) => {
      const boxName = String(o.box_name || "").trim();
      if (boxName) {
        const group = getLinkedGroup(o, allOrders);
        group.forEach((lo) => {
          const inCurrentMonth = orders.some((m) => m.id === lo.id && m.sheet_name === lo.sheet_name);
          if (inCurrentMonth && !String(lo.box_name || "").trim()) {
            const key = `${lo.id}-${lo.sheet_name}`;
            inheritedBoxNames.set(key, boxName);
          }
        });
      }
    });
    orders.forEach((o) => {
      const key = `${o.id}-${o.sheet_name}`;
      const boxName = String(o.box_name || "").trim() || inheritedBoxNames.get(key) || "";
      if (boxName) {
        map.set(boxName, [...map.get(boxName) || [], o]);
      }
    });
    const result = [];
    map.forEach((boxOrders, box_name) => {
      const totalPieces = boxOrders.reduce((s, o) => s + (Number(o.pics_text) || 0), 0);
      const totalPrice = boxOrders.reduce((s, o) => s + (parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0), 0);
      const orderWithBoxCost = boxOrders.find((o) => Number(String(o.box_cost || "").replace(/[^0-9.-]+/g, "")) > 0) || boxOrders[0];
      const boxCost = Number(String(orderWithBoxCost?.box_cost || "").replace(/[^0-9.-]+/g, "")) || 0;
      const orderWithShippingCost = boxOrders.find((o) => Number(String(o.shipping_cost || "").replace(/[^0-9.-]+/g, "")) > 0) || boxOrders[0];
      const shippingCost = Number(String(orderWithShippingCost?.shipping_cost || "").replace(/[^0-9.-]+/g, "")) || 0;
      const lostLevelOrder = boxOrders.find((o) => Number(String(o.lost || "").replace(/[^0-9.-]+/g, "")) > 0) || boxOrders[0];
      const profitLevelOrder = boxOrders.find((o) => Number(String(o.profit || "").replace(/[^0-9.-]+/g, "")) > 0) || boxOrders[0];
      const lost = Number(String(lostLevelOrder?.lost || "").replace(/[^0-9.-]+/g, "")) || 0;
      const profit = Number(String(profitLevelOrder?.profit || "").replace(/[^0-9.-]+/g, "")) || 0;
      const isAutoGenerated = /^Box[ -]\d+$/.test(box_name);
      const allHavePrice = boxOrders.every((o) => {
        const p = parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0;
        return p > 0;
      });
      let status = "pending";
      const extra = String(boxOrders[0]?.extra || "").trim();
      const match = extra.match(/\[(PENDING|APPROVED|ARRIVED|CANCELLED)\]/i);
      if (match) {
        const parsed = match[1].toLowerCase();
        if (!allHavePrice && (parsed === "approved" || parsed === "arrived")) {
          status = "pending";
        } else {
          status = parsed;
        }
      }
      const isFinished = boxOrders.some((o) => o.is_finished === true) || finishedBoxOverrides.has(box_name);
      result.push({ box_name, orders: boxOrders, totalPieces, totalPrice, boxCost, shippingCost, lost, profit, isAutoGenerated, isBought: boxCost > 0, status, isFinished });
    });
    return result.sort((a, b) => {
      if (a.isBought !== b.isBought) return a.isBought ? 1 : -1;
      const matchA = a.box_name.match(/\d+/);
      const matchB = b.box_name.match(/\d+/);
      const numA = matchA ? parseInt(matchA[0], 10) : NaN;
      const numB = matchB ? parseInt(matchB[0], 10) : NaN;
      const isNumA = !isNaN(numA);
      const isNumB = !isNaN(numB);
      if (isNumA && isNumB) {
        return numB - numA;
      }
      return b.box_name.localeCompare(a.box_name);
    });
  }, [orders, allOrders, finishedBoxOverrides]);
  const filteredBoxes = reactExports.useMemo(() => {
    if (!searchTerm) return boxes;
    const q = searchTerm.toLowerCase();
    return boxes.filter((b) => b.box_name.toLowerCase().includes(q) || b.orders.some((o) => [o.name, o.insta, o.phone].some((f) => String(f || "").toLowerCase().includes(q))));
  }, [boxes, searchTerm]);
  const unbatchedOrders = reactExports.useMemo(() => {
    const unbatched = [];
    const seenGroups = /* @__PURE__ */ new Set();
    for (const o of orders) {
      if (String(o.box_name || "").trim()) continue;
      const group = getLinkedGroup(o, allOrders);
      if (group.some((lo) => String(lo.box_name || "").trim())) continue;
      group.sort((a, b) => {
        const idA = typeof a.id === "string" ? parseInt(a.id) : Number(a.id);
        const idB = typeof b.id === "string" ? parseInt(b.id) : Number(b.id);
        return idA - idB;
      });
      const parent = group[0];
      const parentKey = `${parent.id}-${parent.sheet_name}`;
      if (!seenGroups.has(parentKey)) {
        seenGroups.add(parentKey);
        if (parent.id === o.id && parent.sheet_name === o.sheet_name) {
          unbatched.push(o);
        }
      }
    }
    return unbatched;
  }, [orders, allOrders]);
  const filteredUnbatched = reactExports.useMemo(() => {
    if (!createSearch) return unbatchedOrders;
    const q = createSearch.toLowerCase();
    return unbatchedOrders.filter((o) => [o.name, o.insta, o.phone, o.place].some((f) => String(f || "").toLowerCase().includes(q)));
  }, [unbatchedOrders, createSearch]);
  const toggleSelectOrder = (order) => {
    const key = `${order.id}-${order.sheet_name}`;
    setSelectedForBox((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const handleAutoBox = reactExports.useCallback(async () => {
    if (unbatchedOrders.length === 0) return;
    setIsSyncing(true);
    try {
      let boxNum = autoBoxCounter;
      let currentBoxPieces = 0;
      const existingBox = orders.filter((o) => String(o.box_name || "").trim() === `Box ${boxNum - 1}`);
      if (existingBox.length > 0) {
        const existingPieces = existingBox.reduce((s, o) => s + (Number(o.pics_text) || 0), 0);
        if (existingPieces < 90) {
          boxNum = boxNum - 1;
          currentBoxPieces = existingPieces;
        }
      }
      const assignments = [];
      for (const order of unbatchedOrders) {
        const pieces = Number(order.pics_text) || 1;
        if (currentBoxPieces + pieces > 110 && currentBoxPieces >= 90) {
          boxNum++;
          currentBoxPieces = 0;
        }
        if (currentBoxPieces >= 90 && currentBoxPieces <= 110) {
          boxNum++;
          currentBoxPieces = 0;
        }
        assignments.push({ order, boxName: `Box ${boxNum}` });
        currentBoxPieces += pieces;
      }
      const bySheetBoxName = /* @__PURE__ */ new Map();
      for (const { order, boxName } of assignments) {
        const key = `${order.sheet_name}|${boxName}`;
        bySheetBoxName.set(key, [...bySheetBoxName.get(key) || [], order.id]);
      }
      for (const [key, row_ids] of bySheetBoxName.entries()) {
        const [sheet, box_name] = key.split("|");
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "update_box_name", row_ids, sheet, box_name }) });
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }, [unbatchedOrders, autoBoxCounter, orders, onRefresh]);
  const handleCreateBox = reactExports.useCallback(async () => {
    if (!newBoxName.trim() || selectedForBox.size === 0) return;
    setIsSyncing(true);
    try {
      const sel = unbatchedOrders.filter((o) => selectedForBox.has(`${o.id}-${o.sheet_name}`));
      const bySheet = /* @__PURE__ */ new Map();
      sel.forEach((order) => {
        const sheet = order.sheet_name;
        bySheet.set(sheet, [...bySheet.get(sheet) || [], order.id]);
      });
      for (const [sheet, row_ids] of bySheet.entries()) {
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "update_box_name", row_ids, sheet, box_name: newBoxName.trim() }) });
      }
      setCreatingBox(false);
      setSelectedForBox(/* @__PURE__ */ new Set());
      setNewBoxName("");
      setCreateSearch("");
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }, [newBoxName, selectedForBox, unbatchedOrders, onRefresh]);
  const handleRenameBox = reactExports.useCallback(async (box) => {
    if (box.isFinished) return;
    if (!renameInput.trim() || renameInput.trim() === box.box_name) {
      setRenamingBox(null);
      return;
    }
    setIsSyncing(true);
    try {
      const bySheet = /* @__PURE__ */ new Map();
      box.orders.forEach((order) => {
        const sheet = order.sheet_name;
        bySheet.set(sheet, [...bySheet.get(sheet) || [], order.id]);
      });
      for (const [sheet, row_ids] of bySheet.entries()) {
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "update_box_name", row_ids, sheet, box_name: renameInput.trim() }) });
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      setRenamingBox(null);
    }
  }, [renameInput, onRefresh]);
  const handleBoxStatusChange = reactExports.useCallback(async (box, newStatus) => {
    if (box.isFinished) return;
    if (newStatus === "approved" || newStatus === "arrived") {
      const allHavePrice = box.orders.every((o) => {
        const p = parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0;
        return p > 0;
      });
      if (!allHavePrice) {
        alert("Cannot set box to " + newStatus + ". All orders must have a price (cell E) first.");
        return;
      }
    }
    setIsSyncing(true);
    try {
      for (const order of box.orders) {
        await onStatusChange(order, newStatus);
      }
      if (newStatus === "approved") {
        const role2 = localStorage.getItem("iraqi_auth_role") || "unknown";
        const instas = Array.from(new Set(box.orders.map((o) => o.insta || "Unknown"))).filter((i) => i !== "Unknown");
        const boxName = box.box_name || "Unnamed Box";
        sendNotification("approve", `Box approved: ${boxName}
Users: ${instas.join(", ")}`, role2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }, [onStatusChange]);
  const handleSaveField = reactExports.useCallback(async (box, field) => {
    if (box.isFinished) return;
    const value = Number(fieldInput.replace(/[^0-9.-]+/g, "")) || 0;
    setBoxFieldOverrides((prev) => ({ ...prev, [`${box.box_name}|${field}`]: value }));
    setEditingField(null);
    setFieldInput("");
    const idsBySheet = /* @__PURE__ */ new Map();
    box.orders.forEach((order, index) => {
      const sheet = order.sheet_name;
      order[field] = index === 0 ? value || "" : "";
      idsBySheet.set(sheet, [...idsBySheet.get(sheet) || [], order.id]);
    });
    Promise.all(Array.from(idsBySheet.entries()).map(
      ([sheet, row_ids]) => fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update_box_field_once", field, row_ids, sheet, value: value || "" })
      })
    )).then(onRefresh).catch((e) => console.error(e));
  }, [fieldInput, onRefresh]);
  const handleSaveOrderPrice = reactExports.useCallback(async (order) => {
    if (order.is_finished) return;
    const newPrice = Number(priceInput.replace(/[^0-9.-]+/g, "")) || 0;
    setIsSyncing(true);
    try {
      order.price = newPrice;
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update_price", sheet: order.sheet_name, row_id: order.id, value: newPrice || "" })
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      setEditingBoxPrice(null);
    }
  }, [priceInput, onRefresh]);
  const handleFinishBox = reactExports.useCallback(async (box) => {
    if (role !== "owner") return;
    setFinishedBoxOverrides((prev) => new Set(prev).add(box.box_name));
    setIsSyncing(true);
    try {
      const bySheet = /* @__PURE__ */ new Map();
      box.orders.forEach((order) => {
        order.is_finished = true;
        bySheet.set(order.sheet_name, [...bySheet.get(order.sheet_name) || [], order.id]);
      });
      for (const [sheet, row_ids] of bySheet.entries()) {
        await fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ action: "mark_box_finished", sheet, row_ids, finished: true })
        });
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  }, [role, onRefresh]);
  const handleVerify = (order) => {
    if (order.is_finished) return;
    const key = `${order.id}-${order.sheet_name}`;
    const next = new Set(verifiedOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVerifiedOrders(next);
    saveVerifiedSet(next);
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "verifyOrder", row_id: order.id, sheet_name: order.sheet_name, matchStatus: next.has(key) ? "match" : "mismatch" }) }).catch(() => {
    });
  };
  const handleMissing = (order) => {
    if (order.is_finished) return;
    const key = `${order.id}-${order.sheet_name}`;
    const next = new Set(missingOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setMissingOrders(next);
    saveMissingSet(next);
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "markMissing", row_id: order.id, sheet_name: order.sheet_name, missing: next.has(key) }) }).catch(() => {
    });
  };
  const copyBox = (box) => {
    const text = box.orders.map((o, i) => {
      const rawPrice = parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0;
      return `${i + 1}. ${o.name || o.insta} - ${o.place || "-"} - ${rawPrice.toLocaleString()} IQD`;
    }).join("\n");
    navigator.clipboard.writeText(`📦 ${box.box_name}
Pieces: ${box.totalPieces}
${text}

Total: ${box.totalPrice.toLocaleString()} IQD`);
    setCopiedBox(box.box_name);
    setTimeout(() => setCopiedBox(null), 2e3);
  };
  const handleDownloadAllPdfs = async (box) => {
    if (isDownloading) return;
    setIsDownloading(box.box_name);
    try {
      const { generateBatchPdf } = await import("./pdf-D_sfiTgU.mjs");
      generateBatchPdf(box.box_name, box.orders, allOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(null);
    }
  };
  const stats = reactExports.useMemo(() => ({
    total: boxes.length,
    pending: boxes.filter((b) => !b.isBought).length,
    bought: boxes.filter((b) => b.isBought).length,
    totalPieces: boxes.reduce((s, b) => s + b.totalPieces, 0),
    totalValue: boxes.reduce((s, b) => s + b.totalPrice, 0),
    unbatched: unbatchedOrders.length
  }), [boxes, unbatchedOrders]);
  const EditableField = ({ box, field, label, value, colorClass }) => {
    const displayValue = boxFieldOverrides[`${box.box_name}|${field}`] ?? value;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-card p-2.5 rounded-lg border border-border ${colorClass || ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold uppercase mb-1", children: label }),
      editingField?.box === box.box_name && editingField?.field === field ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: fieldInput, onChange: (e) => setFieldInput(e.target.value), className: "w-full bg-secondary border border-border rounded px-2 py-1.5 text-base sm:text-xs", inputMode: "decimal", autoFocus: true, onFocus: (e) => e.currentTarget.select(), onKeyDown: (e) => {
          if (e.key === "Enter") handleSaveField(box, field);
          if (e.key === "Escape") setEditingField(null);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleSaveField(box, field), className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditingField(null), className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: box.isFinished, onClick: () => {
        setEditingField({ box: box.box_name, field });
        setFieldInput(String(displayValue || ""));
      }, className: `text-sm font-bold hover:opacity-80 transition-colors flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-70 ${field === "lost" ? "text-destructive" : field === "profit" ? "text-primary" : ""}`, children: [
        displayValue > 0 ? `${displayValue.toLocaleString()} IQD` : "Set",
        " ",
        !box.isFinished && /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 10 })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-slide-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Boxes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          stats.total,
          " active boxes • ",
          stats.totalPieces,
          " items • ",
          (stats.totalValue / 1e3).toFixed(0),
          "K IQD"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: monthPickerRef, className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowMonthPicker((p) => !p), className: "flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-semibold hover:bg-secondary/80 transition-all border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 14 }),
            " ",
            activeYear === "2026" && viewingMonth ? viewingMonth : "2026",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 12, className: `transition-transform ${showMonthPicker ? "rotate-180" : ""}` })
          ] }),
          showMonthPicker && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-2 min-w-[140px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1", children: "2026" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0.5", children: availableMonths.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setActiveYear("2026");
              setViewingMonth(m);
              setShowMonthPicker(false);
            }, className: `text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${viewingMonth === m && activeYear === "2026" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`, children: m }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SkuSearch, { orders: allOrders, onFound: onOrderClick }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCreatingBox(true), className: "flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all glow-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
          " New Box"
        ] }),
        unbatchedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleAutoBox, disabled: isSyncing, className: "flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-2 rounded-full text-sm font-semibold hover:bg-accent/90 transition-all disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PackagePlus, { size: 14 }),
          " Auto (",
          unbatchedOrders.length,
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 14 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search boxes...", className: "w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50" })
    ] }),
    unbatchedOrders.length > 0 && !creatingBox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, className: "text-amber-500 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-amber-700 dark:text-amber-400", children: [
          unbatchedOrders.length,
          " orders without a box"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 dark:text-amber-500", children: 'Click "Auto Box" to automatically assign each order its own box' })
      ] })
    ] }),
    creatingBox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-primary/20 rounded-xl p-4 space-y-3 animate-slide-up", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Create New Box" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setCreatingBox(false);
          setSelectedForBox(/* @__PURE__ */ new Set());
        }, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newBoxName, onChange: (e) => setNewBoxName(e.target.value), placeholder: "Box name (e.g. Box 5)", className: "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: createSearch, onChange: (e) => setCreateSearch(e.target.value), placeholder: "Search unbatched orders...", className: "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-y-auto space-y-1 custom-scrollbar", children: filteredUnbatched.map((o) => {
        const key = `${o.id}-${o.sheet_name}`;
        const linkedOrders = getLinkedGroup(o, allOrders).filter((lo) => lo.id !== o.id || lo.sheet_name !== o.sheet_name);
        const rawCombinedPrice = [o, ...linkedOrders].reduce((sum, lo) => sum + (parseFloat(String(lo.price).replace(/[^0-9.-]+/g, "")) || 0), 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleSelectOrder(o), className: `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${selectedForBox.has(key) ? "bg-primary/10 border border-primary/30" : "bg-secondary hover:bg-secondary/80 border border-transparent"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-4 h-4 rounded border flex items-center justify-center ${selectedForBox.has(key) ? "bg-primary border-primary" : "border-border"}`, children: selectedForBox.has(key) && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 10, className: "text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: o.name || o.insta }),
          linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12, className: "text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs ml-auto", children: [
            rawCombinedPrice.toLocaleString(),
            " IQD"
          ] })
        ] }, key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCreateBox, disabled: !newBoxName.trim() || selectedForBox.size === 0 || isSyncing, className: "w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 transition-all", children: isSyncing ? "Creating..." : `Create Box (${selectedForBox.size} orders)` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredBoxes.map((box) => {
      const isExpanded = expandedBox === box.box_name;
      const numMatch = box.box_name.match(/(\d+)/);
      const displayName = numMatch ? numMatch[1] : box.box_name;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-xl overflow-hidden transition-all ${box.isFinished ? "bg-orange-100 border-orange-400 shadow-sm ring-1 ring-orange-300 dark:bg-orange-500/15 dark:border-orange-400/60 dark:ring-orange-500/30" : box.isBought ? "bg-card border-primary/20" : "bg-card border-border"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-4 pb-2 cursor-pointer select-none",
            onClick: (e) => {
              const target = e.target;
              if (!target.closest("button") && !target.closest("input")) {
                setExpandedBox(isExpanded ? null : box.box_name);
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center ${box.isFinished ? "bg-orange-500 text-white shadow-sm dark:bg-orange-500 dark:text-white" : box.isBought ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-500 dark:bg-amber-500/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 20 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    renamingBox === box.box_name ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: renameInput, onChange: (e) => setRenameInput(e.target.value), className: "bg-secondary border border-border rounded px-2 py-1 text-sm font-bold w-32", autoFocus: true, onKeyDown: (e) => {
                        if (e.key === "Enter") handleRenameBox(box);
                        if (e.key === "Escape") setRenamingBox(null);
                      } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRenameBox(box), className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRenamingBox(null), className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-xl", children: displayName }),
                      box.isFinished && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-orange-200 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-800 dark:bg-orange-500/20 dark:text-orange-300", children: "Finished" }),
                      !box.isFinished && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                        e.stopPropagation();
                        setRenamingBox(box.box_name);
                        setRenameInput(box.box_name);
                      }, className: "p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 mt-1", children: ["pending", "approved", "arrived", "cancelled"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: box.isFinished, onClick: () => handleBoxStatusChange(box, s), className: `px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all disabled:cursor-not-allowed disabled:opacity-70 ${box.status === s ? STATUS_COLORS[s] : "bg-secondary text-muted-foreground border-transparent hover:border-border"}`, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    copyBox(box);
                  }, className: "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all", children: copiedBox === box.box_name ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 }) }),
                  role === "owner" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleFinishBox(box);
                  }, disabled: isSyncing || box.isFinished, className: `p-1.5 rounded-lg transition-all disabled:cursor-not-allowed ${box.isFinished ? "bg-orange-500 text-white opacity-100 shadow-sm" : "text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-500/10 disabled:opacity-50"}`, title: "Mark box finished", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    setExpandedBox(isExpanded ? null : box.box_name);
                  }, className: "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all", children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 20 }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${box.isFinished ? "bg-orange-200/70 dark:bg-orange-500/15" : "bg-secondary"} rounded-xl py-3 text-center`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: box.orders.length }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Orders" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${box.isFinished ? "bg-orange-200/70 dark:bg-orange-500/15" : "bg-secondary"} rounded-xl py-3 text-center`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: box.totalPieces }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "Items" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${box.isFinished ? "bg-orange-200/70 dark:bg-orange-500/15" : "bg-secondary"} rounded-xl py-3 text-center`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold tabular-nums", children: box.totalPrice.toLocaleString() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-medium", children: "IQD Total" })
                ] })
              ] })
            ]
          }
        ),
        (box.lost > 0 || box.profit > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-3 flex gap-3", children: [
          box.lost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-destructive font-medium", children: [
            "Lost: ",
            box.lost.toLocaleString()
          ] }),
          box.profit > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary font-medium", children: [
            "Profit: ",
            box.profit.toLocaleString()
          ] })
        ] }),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 ${box.isFinished ? "bg-orange-100/80 dark:bg-orange-500/10" : "bg-secondary/30"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditableField, { box, field: "box_cost", label: "Box Cost (F)", value: box.boxCost }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditableField, { box, field: "shipping_cost", label: "Shipping (H)", value: box.shippingCost }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditableField, { box, field: "lost", label: "Lost 60% (K)", value: box.lost, colorClass: "bg-red-50/50 dark:bg-red-500/5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditableField, { box, field: "profit", label: "Profit 40% (L)", value: box.profit, colorClass: "bg-red-50/50 dark:bg-red-500/5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex items-center gap-2 p-3 border-t border-border ${box.isFinished ? "bg-orange-100/70 dark:bg-orange-500/10" : "bg-secondary/20"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDownloadAllPdfs(box), disabled: !!isDownloading, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-all", children: [
            isDownloading === box.box_name ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
            "Download All PDFs"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: box.orders.map((order) => {
            const key = `${order.id}-${order.sheet_name}`;
            const isVerified = verifiedOrders.has(key);
            const isMissing = missingOrders.has(key);
            const orderStatus = getOrderStatus(order);
            const linkedOrders = getLinkedGroup(order, allOrders).filter((o) => o.id !== order.id || o.sheet_name !== order.sheet_name);
            const rawCombinedPrice = [order, ...linkedOrders].reduce((sum, o) => sum + (parseFloat(String(o.price).replace(/[^0-9.-]+/g, "")) || 0), 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3 flex items-center gap-2 transition-colors ${box.isFinished ? "bg-orange-50/80 hover:bg-orange-100 dark:bg-orange-500/5 dark:hover:bg-orange-500/10" : "hover:bg-secondary/30"} ${isMissing ? "bg-amber-50/50 dark:bg-amber-500/5" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: order.is_finished, onClick: () => handleMissing(order), className: `shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50 ${isMissing ? "bg-amber-400 text-white" : "bg-secondary text-muted-foreground hover:text-amber-500"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 cursor-pointer", onClick: () => onOrderClick(order), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-[14px] truncate", children: [
                    "@",
                    order.insta || order.name || "Unknown",
                    " ",
                    linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 10, className: "inline text-primary ml-1" })
                  ] }),
                  String(order.primary_urls || "").trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Has primary picture", className: "shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary border border-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 11 }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground flex items-center mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  order.pics_text || 1,
                  " pcs"
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 sm:gap-4 shrink-0 pr-1", children: [
                order.link && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: String(order.link).startsWith("http") ? order.link : `https://${order.link}`, target: "_blank", rel: "noopener noreferrer", className: "w-8 h-8 rounded-full bg-[#0cbaba] text-white hover:bg-[#0aa3a3] transition-colors flex items-center justify-center shadow-sm", onClick: (e) => e.stopPropagation(), title: "Product Link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 16 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { disabled: order.is_finished, value: orderStatus, onChange: (e) => {
                    e.stopPropagation();
                    onStatusChange(order, e.target.value);
                  }, className: "bg-transparent text-[16px] border-none focus:outline-none text-muted-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 w-6 appearance-none text-center p-0 m-0 leading-none", onClick: (e) => e.stopPropagation(), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "⏳" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "approved", children: "✅" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "arrived", children: "📦" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelled", children: "❌" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: order.is_finished, onClick: () => handleVerify(order), className: `p-1 transition-all flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 ${isVerified ? "text-primary" : "text-muted-foreground hover:text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 16, fill: isVerified ? "currentColor" : "none" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-end justify-center min-w-[55px]", children: editingBoxPrice?.box === box.box_name && editingBoxPrice?.orderId === order.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: priceInput, onChange: (e) => setPriceInput(e.target.value), className: "w-24 bg-secondary border border-border rounded px-2 py-1.5 text-base sm:text-xs text-right", inputMode: "decimal", autoFocus: true, onFocus: (e) => e.currentTarget.select(), onKeyDown: (e) => {
                    if (e.key === "Enter") handleSaveOrderPrice(order);
                    if (e.key === "Escape") setEditingBoxPrice(null);
                  }, onClick: (e) => e.stopPropagation() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleSaveOrderPrice(order);
                  }, className: "text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    setEditingBoxPrice(null);
                  }, className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-bold text-[14px] leading-none tracking-tight ${order.is_finished ? "cursor-default opacity-80" : "cursor-pointer hover:opacity-80"}`, onClick: (e) => {
                  e.stopPropagation();
                  if (!order.is_finished) {
                    setEditingBoxPrice({ box: box.box_name, orderId: order.id });
                    setPriceInput(String(rawCombinedPrice));
                  }
                }, children: rawCombinedPrice > 0 ? rawCombinedPrice.toLocaleString() : "Set" }) })
              ] })
            ] }, key);
          }) })
        ] })
      ] }, box.box_name);
    }) }),
    filteredBoxes.length === 0 && !creatingBox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 40, className: "mx-auto text-muted-foreground/30 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium text-sm", children: "No boxes found" })
    ] })
  ] });
};
export {
  BatchesView as default
};
