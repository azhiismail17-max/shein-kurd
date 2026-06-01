import { r as reactExports, a as React__default, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { getVerifiedSet, getMissingSet, getOrderStatus, STATUS_COLORS, SCRIPT_URL, getMissingImages, saveMissingImages, saveMissingSet, saveVerifiedSet } from "./index-CHMLBzfP.mjs";
import { t as toPng } from "../_libs/html-to-image.mjs";
import { getLinkedOrdersInfo, getBoxName, cleanOrderNo, isOrderFree, getDisplayPrice } from "./order-utils-CgGk-Sl2.mjs";
import { a as fetchWithRetry } from "./notifications-BuSzwt0M.mjs";
import OrderFormView from "./OrderFormView-B_50ElEu.mjs";
import "../_libs/firebase__firestore.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__storage.mjs";
import { a as ArrowLeft, r as Eye, I as Image, H as Heart, a9 as X, P as Package, N as Pen, e as Camera, s as Link2, E as ExternalLink, a1 as Trash2, F as FileText, W as Share2, a3 as TriangleAlert, i as ChevronLeft, j as ChevronRight } from "../_libs/lucide-react.mjs";
import "./use-toast-CUyDYyz5.mjs";
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
const OrderDetailModal = ({ order, onClose, onEdit, onDelete, allOrders, onSuccess, onStatusChange, onMissingClick, onUpdateOrder }) => {
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [generatingPdf, setGeneratingPdf] = reactExports.useState(false);
  const [savingImage, setSavingImage] = reactExports.useState(false);
  const [verifiedOrders, setVerifiedOrders] = reactExports.useState(getVerifiedSet);
  const [missingOrders, setMissingOrders] = reactExports.useState(getMissingSet);
  const receiptRef = reactExports.useRef(null);
  const proofFileRef = reactExports.useRef(null);
  const warningUploadRef = reactExports.useRef(null);
  const primaryFileRef = reactExports.useRef(null);
  const [isUploadingProof, setIsUploadingProof] = reactExports.useState(false);
  const [isUploadingWarning, setIsUploadingWarning] = reactExports.useState(false);
  const [isUploadingPrimary, setIsUploadingPrimary] = reactExports.useState(false);
  const [viewImageModal, setViewImageModal] = reactExports.useState(null);
  const [viewingGallery, setViewingGallery] = reactExports.useState(null);
  const [currentGalleryIdx, setCurrentGalleryIdx] = reactExports.useState(0);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [isSharing, setIsSharing] = reactExports.useState(false);
  const [isUnlinking, setIsUnlinking] = reactExports.useState(null);
  const [updateTrigger, setUpdateTrigger] = reactExports.useState(0);
  React__default.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (linkedOrders.length > 0) {
        try {
          const remainingIds = linkedOrders.map((o) => o.id);
          await fetchWithRetry(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "merge_buying_price", sheet: order.sheet_name, row_ids: [order.id] })
          });
          if (remainingIds.length > 0) {
            await fetchWithRetry(SCRIPT_URL, {
              method: "POST",
              body: JSON.stringify({ action: "merge_buying_price", sheet: order.sheet_name, row_ids: remainingIds })
            });
          }
        } catch (e) {
          console.error("Failed unlink before delete", e);
        }
      }
      const res = await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          row_id: order.id,
          sheet: order.sheet_name,
          linkedOrderIds: []
        })
      });
      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.warn("Invalid JSON:", text.substring(0, 50));
        throw new Error("Invalid response from server.");
      }
      if (result.status === "success") {
        if (onDelete) onDelete();
        else {
          onSuccess();
          onClose();
        }
      } else {
        alert("Failed to delete: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while deleting the order.");
    } finally {
      setIsDeleting(false);
    }
  };
  const {
    linkedOrders,
    combinedPrice,
    combinedInitial,
    shipping,
    total,
    remaining,
    basePrice,
    isFree
  } = getLinkedOrdersInfo(order, allOrders);
  const status = getOrderStatus(order);
  const key = `${order.id}-${order.sheet_name}`;
  const isVerified = verifiedOrders.has(key);
  const isMissing = missingOrders.has(key) || !!order.warningImageUrl;
  const handleWarningImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (warningUploadRef.current) warningUploadRef.current.value = "";
      return;
    }
    setIsUploadingWarning(true);
    try {
      const { uploadToImgBB } = await import("./order-utils-CgGk-Sl2.mjs");
      const url = await uploadToImgBB(file);
      const newImages = { ...getMissingImages(), [key]: url };
      saveMissingImages(newImages);
      const next = new Set(missingOrders);
      next.add(key);
      setMissingOrders(next);
      saveMissingSet(next);
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update_warning_picture", sheet_name: order.sheet_name, row_id: order.id, image_url: url })
      });
      order.warningImageUrl = url;
      const role = localStorage.getItem("auth_role") || "unknown";
      const { sendNotification } = await import("./notifications-BuSzwt0M.mjs").then((n) => n.n);
      sendNotification("warning", `WARNING added to order: ${order.name || order.insta}. Please check!`, role, order, true);
    } catch (err) {
      alert("Failed to upload warning image");
    } finally {
      setIsUploadingWarning(false);
    }
  };
  const handlePrimaryImageChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      if (primaryFileRef.current) primaryFileRef.current.value = "";
      return;
    }
    setIsUploadingPrimary(true);
    try {
      const { uploadToImgBB } = await import("./order-utils-CgGk-Sl2.mjs");
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadToImgBB(f)));
      const existing = order.primary_urls ? String(order.primary_urls).split(",").filter(Boolean) : [];
      const merged = [...existing, ...uploaded].join(",");
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update_primary_picture", sheet_name: order.sheet_name, row_id: order.id, primary_urls: merged })
      });
      order.primary_urls = merged;
      if (onUpdateOrder) onUpdateOrder(order.id, order.sheet_name, { primary_urls: merged });
    } catch (err) {
      alert("Failed to upload primary image");
    } finally {
      setIsUploadingPrimary(false);
      if (primaryFileRef.current) primaryFileRef.current.value = "";
    }
  };
  const handleProofImageChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      if (proofFileRef.current) proofFileRef.current.value = "";
      return;
    }
    setIsUploadingProof(true);
    try {
      const { uploadToImgBB } = await import("./order-utils-CgGk-Sl2.mjs");
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadToImgBB(f)));
      const lastUrl = uploaded[uploaded.length - 1];
      const exist = order.proof_urls ? Array.isArray(order.proof_urls) ? order.proof_urls : String(order.proof_urls).split(",").filter(Boolean) : order.image_url ? [String(order.image_url)] : [];
      const newUrls = [...exist, ...uploaded];
      const merged = newUrls.join(",");
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_proof_picture",
          sheet_name: order.sheet_name,
          row_id: order.id,
          image_url: lastUrl,
          proof_url: lastUrl,
          proof_urls: merged,
          secondary_images: merged
        })
      });
      order.image_url = lastUrl;
      order.proof_urls = newUrls;
      if (onUpdateOrder) {
        onUpdateOrder(order.id, order.sheet_name, { image_url: lastUrl, proof_urls: newUrls });
      }
    } catch (err) {
      alert("Failed to upload proof image");
    } finally {
      setIsUploadingProof(false);
      if (proofFileRef.current) proofFileRef.current.value = "";
    }
  };
  const handleUnmarkMissing = () => {
    setViewImageModal(null);
    const next = new Set(missingOrders);
    next.delete(key);
    setMissingOrders(next);
    saveMissingSet(next);
    const nextImages = { ...getMissingImages() };
    delete nextImages[key];
    import("./index-CHMLBzfP.mjs").then((m) => m.saveMissingImages(nextImages));
    if (onUpdateOrder) {
      onUpdateOrder(order.id, order.sheet_name, { warningBase64: void 0, warningImageUrl: void 0 });
    }
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "update_warning_picture", row_id: order.id, sheet_name: order.sheet_name, image_url: "" })
    }).catch(() => {
    });
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "markMissing", row_id: order.id, sheet_name: order.sheet_name, missing: false }) }).catch(() => {
    });
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "remove_warning_notification", row_id: order.id, sheet_name: order.sheet_name })
    }).catch(() => {
    });
  };
  const handleRemoveLink = async (targetIo) => {
    setIsUnlinking(targetIo.id);
    try {
      const allCluster = [order, ...linkedOrders];
      const remainingIds = allCluster.filter((o) => o.id !== targetIo.id).map((o) => o.id);
      const updates = [];
      updates.push(fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "merge_buying_price", sheet: targetIo.sheet_name, row_ids: [targetIo.id] })
      }));
      if (remainingIds.length > 0) {
        updates.push(fetchWithRetry(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ action: "merge_buying_price", sheet: order.sheet_name, row_ids: remainingIds })
        }));
      }
      await Promise.all(updates);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to remove link");
    } finally {
      setIsUnlinking(null);
    }
  };
  const handlePdf = async () => {
    if (generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const { generateSingleOrderPdf } = await import("./pdf-CLpaOcWP.mjs");
      generateSingleOrderPdf(order, allOrders);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed");
    } finally {
      setGeneratingPdf(false);
    }
  };
  const handleSaveReceiptImage = reactExports.useCallback(async () => {
    if (!receiptRef.current || savingImage) return;
    setSavingImage(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff"
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Receipt_${order.insta || order.name || order.id}.png`;
      link.click();
    } catch (err) {
      console.error("Image save error", err);
    } finally {
      setSavingImage(false);
    }
  }, [order, savingImage]);
  const handleShare = async () => {
    const text = `📦 Order Details
👤 Name: ${order.name || "-"}
📸 Instagram: ${order.insta || "-"}
📱 Phone: ${order.phone || "-"}
📍 Location: ${order.place || "-"}
💰 Total: ${total.toLocaleString()} IQD
🚚 Shipping: ${shipping.toLocaleString()} IQD
💳 Advance: ${combinedInitial.toLocaleString()} IQD
📉 Remaining: ${remaining.toLocaleString()} IQD
🆔 Order No: ${cleanOrderNo(order.orderNo) || "Pending"}`;
    if (!navigator.share) {
      navigator.clipboard.writeText(text).then(() => alert("Copied text to clipboard!"));
      return;
    }
    try {
      setIsSharing(true);
      let fileToShare = null;
      if (receiptRef.current) {
        const dataUrl = await toPng(receiptRef.current, { quality: 1, pixelRatio: 2, backgroundColor: "#ffffff" });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        fileToShare = new File([blob], `Order_${cleanOrderNo(order.orderNo) || "Pending"}.png`, { type: "image/png" });
      }
      if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          title: "Order Details",
          text,
          files: [fileToShare]
        });
      } else {
        await navigator.share({ title: "Order Details", text });
      }
    } catch (err) {
      console.error("Share error", err);
    } finally {
      setIsSharing(false);
    }
  };
  const handleVerify = () => {
    const next = new Set(verifiedOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVerifiedOrders(next);
    saveVerifiedSet(next);
    fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "verifyOrder", row_id: order.id, sheet_name: order.sheet_name, matchStatus: next.has(key) ? "match" : "mismatch" }) }).catch(() => {
    });
  };
  const DetailRow = ({ label, value, accent }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end py-1.5 border-b border-border/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold ${accent ? "text-primary" : ""}`, children: value })
  ] });
  const formatImg = (img) => {
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    if (img.length > 100) return `data:image/jpeg;base64,${img}`;
    return img;
  };
  const primaryImages = [];
  if (order.primary_urls) {
    primaryImages.push(...String(order.primary_urls).split(",").filter(Boolean).map(formatImg));
  }
  const proofImages = [];
  if (order.proof_urls && order.proof_urls.length > 0) {
    if (Array.isArray(order.proof_urls)) {
      proofImages.push(...order.proof_urls.map(formatImg));
    } else {
      proofImages.push(...String(order.proof_urls).split(",").filter(Boolean).map(formatImg));
    }
  } else if (order.image_url) {
    proofImages.push(formatImg(order.image_url));
  }
  if (order.secondaryImages) {
    proofImages.push(...order.secondaryImages.map(formatImg));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/30 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-card border w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-slide-up ${isVerified ? "border-primary/30" : isMissing ? "border-amber-400/30" : "border-border"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex justify-between items-center bg-secondary/50 rounded-t-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsEditing(false), className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: isEditing ? "Edit Order" : "Order Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
                "ID: ",
                order.id,
                " · ",
                order.sheet_name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-semibold border ${STATUS_COLORS[status]}`, children: status })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: primaryFileRef, className: "hidden", accept: "image/*", multiple: true, onChange: handlePrimaryImageChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: warningUploadRef, className: "hidden", accept: "image/*", onChange: handleWarningImageChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: proofFileRef, className: "hidden", accept: "image/*", multiple: true, onChange: handleProofImageChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex bg-secondary rounded-lg overflow-hidden border border-amber-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
            const key2 = `${order.id}-${order.sheet_name}`;
            if (missingOrders.has(key2) || !!order.warningImageUrl) {
              setViewImageModal(key2);
            } else {
              warningUploadRef.current?.click();
            }
          }, className: `p-1.5 transition-all outline-none ${isMissing ? "bg-amber-400 text-white" : "text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`, title: isMissing ? "View Warning Picture" : "Upload Warning Picture", children: isUploadingWarning ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" }) : isMissing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 14 }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleVerify, className: `p-1.5 rounded-lg transition-all ${isVerified ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-primary"} ml-1`, title: "Verify", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 16, fill: isVerified ? "currentColor" : "none" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors ml-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-5 custom-scrollbar", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx(OrderFormView, { activeSheet: order.sheet_name, editingOrder: order, onCancel: () => setIsEditing(false), onSuccess: (payload) => {
        setIsEditing(false);
        onSuccess(payload);
      }, allOrders }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-muted-foreground mr-2", children: "Status:" }),
          ["pending", "approved", "arrived", "cancelled"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onStatusChange(order, s), className: `px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${status === s ? STATUS_COLORS[s] : "bg-secondary text-muted-foreground border-transparent hover:border-border"}`, children: s }, s))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border border-border/60 rounded-xl p-3 bg-card shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-muted-foreground", children: "Box:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: getBoxName(order) ? `Box ${getBoxName(order)}` : "None" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                const currentBox = getBoxName(order);
                const newBox = window.prompt(`Change Box Name for ${order.name || order.insta || "this order"}:`, currentBox);
                if (newBox !== null && newBox.trim() !== currentBox) {
                  const trimmed = newBox.trim();
                  fetchWithRetry(SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({
                      action: "update_box_name",
                      row_id: order.id,
                      sheet: order.sheet_name,
                      box_name: trimmed
                    })
                  }).then(() => {
                    order.box_name = trimmed;
                    onSuccess();
                  }).catch(() => alert("Failed to update box name"));
                }
              },
              className: "px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5 text-xs font-bold border border-primary/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 12 }),
                "Change box"
              ]
            }
          )
        ] }),
        proofImages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setCurrentGalleryIdx(0);
              setViewingGallery({ title: "Proof Pictures", images: proofImages, initialIndex: 0 });
            },
            className: "w-full py-1.5 flex items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary rounded-xl border border-border border-dashed transition-all",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: proofImages[0], referrerPolicy: "no-referrer", className: "w-full h-full object-cover", alt: "Proof Thumbnail" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold", children: [
                "View Proof Picture ",
                proofImages.length > 1 ? `(${proofImages.length})` : ""
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4 mt-2 flex-col sm:flex-row flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => primaryFileRef.current?.click(), disabled: isUploadingPrimary, className: "flex-[1_1_100%] sm:flex-[1_1_48%] py-2 flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-xl transition-all text-[11px] font-bold disabled:opacity-50 border border-blue-500/20", children: [
            isUploadingPrimary ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 14 }),
            "Upload Primary Picture"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => proofFileRef.current?.click(), disabled: isUploadingProof, className: "flex-[1_1_100%] sm:flex-[1_1_48%] py-2 flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all text-[11px] font-bold disabled:opacity-50 border border-primary/20", children: [
            isUploadingProof ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 14 }),
            "Upload Proof Picture"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-[1_1_100%] gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => warningUploadRef.current?.click(), disabled: isUploadingWarning, className: "flex-[1_1_100%] py-2 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-xl transition-all text-[11px] font-bold disabled:opacity-50 border border-amber-500/20", children: [
            isUploadingWarning ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 14 }),
            "Upload Warning Picture"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: receiptRef, className: "bg-card border border-border rounded-2xl overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 text-center space-y-2 bg-secondary/30 border-b border-dashed border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block bg-foreground text-background px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest", children: "Receipt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight uppercase", children: "SHEIN KURDISTANI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.date?.split(" ")[0] || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-1 rounded-full bg-border" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "#",
                cleanOrderNo(order.orderNo) || "PENDING"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Customer", value: order.name || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Instagram", value: `@${order.insta || "-"}`, accent: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Phone", value: order.phone || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Location", value: order.place || "-" }),
            order.sku && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "SKU", value: order.sku }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "SKU Qty", value: String(order.pics_text || "1") }),
            linkedOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              DetailRow,
              {
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Item Price ",
                  isOrderFree(order) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1", children: "Free Ship" })
                ] }),
                value: `${basePrice.toLocaleString()} IQD`
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DetailRow,
                {
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Item Price ",
                    isOrderFree(order) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1", children: "Free Ship" })
                  ] }),
                  value: `${basePrice.toLocaleString()} IQD`
                }
              ),
              linkedOrders.map((lo) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                DetailRow,
                {
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "🔗 ",
                    lo.name || lo.insta,
                    " ",
                    isOrderFree(lo) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1", children: "Free Ship" })
                  ] }),
                  value: `${getDisplayPrice(lo).toLocaleString()} IQD`
                },
                `${lo.id}-${lo.sheet_name}`
              )),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "All Items Total", value: `${combinedPrice.toLocaleString()} IQD`, accent: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Shipping", value: isFree ? "Free Ship (0 IQD)" : `${shipping.toLocaleString()} IQD` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Advance Paid", value: `${combinedInitial.toLocaleString()} IQD`, accent: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 mt-3 border-t-2 border-border flex justify-between items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: "Remaining" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xl font-bold font-mono ${remaining > 0 ? "text-amber-500" : "text-primary"}`, children: [
                remaining.toLocaleString(),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "IQD" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSaveReceiptImage, disabled: savingImage, className: "w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-50", children: [
          savingImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 14 }),
          "Save Receipt as Image"
        ] }),
        linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/50 p-3 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 14, className: "text-primary" }),
            " Linked Orders (",
            linkedOrders.length,
            ")"
          ] }),
          linkedOrders.map((lo) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-1.5 text-xs group transition-all", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              lo.name || lo.insta,
              " · #",
              lo.id,
              " · ",
              lo.sheet_name,
              " ",
              isOrderFree(lo) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1", children: "Free Ship" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold", children: [
                getDisplayPrice(lo).toLocaleString(),
                " IQD"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    handleRemoveLink(lo);
                  },
                  disabled: isUnlinking === lo.id,
                  className: "p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-100",
                  title: "Remove linked order",
                  children: isUnlinking === lo.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
                }
              )
            ] })
          ] }, `${lo.id}-${lo.sheet_name}`))
        ] }),
        order.link && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: order.link, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-primary text-sm hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 14 }),
          " View Product Link"
        ] }),
        order.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary p-3 rounded-lg mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-muted-foreground", children: "Notes:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: order.note })
        ] }),
        primaryImages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setCurrentGalleryIdx(0);
              setViewingGallery({ title: "Primary Pictures", images: primaryImages, initialIndex: 0 });
            },
            className: "w-full py-1.5 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 border-dashed transition-all",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded overflow-hidden shadow-sm border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: primaryImages[0], referrerPolicy: "no-referrer", className: "w-full h-full object-cover", alt: "Primary Thumbnail" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold", children: [
                "View Primary Picture ",
                primaryImages.length > 1 ? `(${primaryImages.length})` : ""
              ] })
            ]
          }
        ) })
      ] }) }),
      !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 sm:p-3 border-t border-border flex justify-between gap-1 sm:gap-2 bg-secondary/30 rounded-b-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground font-medium p-2 rounded-lg transition-all shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleDelete, disabled: isDeleting, className: "flex-1 flex items-center justify-center gap-1 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0", children: [
          isDeleting ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14, className: "shrink-0" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Del" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handlePdf, disabled: generatingPdf, className: "flex-1 flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0", children: [
          generatingPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14, className: "shrink-0" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "PDF" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleShare, disabled: isSharing, className: "flex-1 flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0", children: [
          isSharing ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 14, className: "shrink-0" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Share" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsEditing(true), className: "flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all glow-primary min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 14, className: "shrink-0" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: "Edit" })
        ] })
      ] })
    ] }),
    viewImageModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[200] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewImageModal(null), className: "absolute -top-4 -right-4 bg-background border border-border text-foreground rounded-full p-2 hover:bg-secondary transition-colors shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 28 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-secondary/50 p-2 rounded-xl border border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: order.warningImageUrl || getMissingImages()[viewImageModal], alt: "Warning", referrerPolicy: "no-referrer", className: "max-w-full max-h-[70vh] object-contain rounded-lg" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex gap-4 w-full justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleUnmarkMissing, className: "px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
        "Unmark Warning"
      ] }) })
    ] }) }),
    viewingGallery && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[300] bg-black/95 flex flex-col animate-in fade-in duration-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex justify-between items-center text-white border-b border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-sm", children: [
          viewingGallery.title,
          " - ",
          currentGalleryIdx + 1,
          " / ",
          viewingGallery.images.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setViewingGallery(null);
            setIsEditing(true);
          }, className: "flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 14 }),
            " Edit / Delete Pictures"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewingGallery(null), className: "text-white/60 hover:text-white transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center justify-center relative overflow-hidden p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: viewingGallery.images[currentGalleryIdx],
            referrerPolicy: "no-referrer",
            className: "max-w-full max-h-full object-contain select-none",
            alt: "Gallery Preview"
          }
        ),
        currentGalleryIdx > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setCurrentGalleryIdx((idx) => idx - 1);
            },
            className: "absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all active:scale-90",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 24 })
          }
        ),
        currentGalleryIdx < viewingGallery.images.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              setCurrentGalleryIdx((idx) => idx + 1);
            },
            className: "absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all active:scale-90",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 24 })
          }
        )
      ] })
    ] })
  ] });
};
export {
  OrderDetailModal as default
};
