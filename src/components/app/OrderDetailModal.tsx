import React, { useState, useRef, useCallback } from "react";
import {
  Order,
  SCRIPT_URL,
  getOrderStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  getVerifiedSet,
  saveVerifiedSet,
  getMissingSet,
  saveMissingSet,
  getMissingImages,
  saveMissingImages,
} from "@/types";
import {
  X,
  FileText,
  Share2,
  Edit2,
  ArrowLeft,
  ExternalLink,
  Link2,
  Heart,
  AlertTriangle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  Plus,
  Package,
  Eye,
  Upload,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  getLinkedOrdersInfo,
  getDisplayPrice,
  isOrderFree,
  cleanOrderNo,
  getBoxName,
  getOtherLinkedOrder,
} from "@/lib/order-utils";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { getWarningImageSource } from "@/lib/warning-image";
import OrderFormView from "./OrderFormView";

interface Props {
  order: Order;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onDelete?: () => void;
  allOrders: Order[];
  onSuccess: (payload?: any) => void;
  onStatusChange: (order: Order, status: string) => void;
  onMissingClick?: (order: Order, e: React.MouseEvent) => void;
  onUpdateOrder?: (id: string | number, sheet: string, updates: Partial<Order>) => void;
}

const getOrderSenderLabel = (order: Order) => {
  const senderName = String(order.admin_name || "").trim();
  if (!senderName) return "";
  const senderRole = String(order.admin_role || "").trim();
  return senderRole ? `${senderName} (${senderRole})` : senderName;
};

const OrderDetailModal: React.FC<Props> = ({
  order: initialOrder,
  onClose,
  onEdit,
  onDelete,
  allOrders,
  onSuccess,
  onStatusChange,
  onMissingClick,
  onUpdateOrder,
}) => {
  const [activeOrder, setActiveOrder] = useState(initialOrder);
  const [isEditing, setIsEditing] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [verifiedOrders, setVerifiedOrders] = useState<Set<string>>(getVerifiedSet);
  const [missingOrders, setMissingOrders] = useState<Set<string>>(getMissingSet);
  const receiptRef = useRef<HTMLDivElement>(null);

  const proofFileRef = useRef<HTMLInputElement>(null);
  const warningUploadRef = useRef<HTMLInputElement>(null);
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isUploadingWarning, setIsUploadingWarning] = useState(false);
  const [isUploadingPrimary, setIsUploadingPrimary] = useState(false);

  const [viewImageModal, setViewImageModal] = useState<string | null>(null);
  const [viewingGallery, setViewingGallery] = useState<{
    title: string;
    images: string[];
    initialIndex: number;
  } | null>(null);
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState<string | number | null>(null);
  const [showImageActions, setShowImageActions] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const order = activeOrder;
  const viewerRole = typeof window !== "undefined" ? localStorage.getItem("auth_role") || "" : "";
  const canChangeStatus = viewerRole !== "moderator";
  const canViewSubmittedBy = viewerRole === "owner" || viewerRole === "admin";
  const senderLabel = canViewSubmittedBy ? getOrderSenderLabel(order) : "";

  React.useEffect(() => {
    setActiveOrder(initialOrder);
    setIsEditing(false);
  }, [initialOrder]);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Safely unlink the target order first so backend auto-delete doesn't delete the whole group
      if (linkedOrders.length > 0) {
        try {
          const remainingIds = linkedOrders.map((o) => `${o.id}:${o.sheet_name}`);
          await fetchWithRetry(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({
              action: "merge_buying_price",
              sheet: order.sheet_name,
              sheet_name: order.sheet_name,
              row_ids: [`${order.id}:${order.sheet_name}`],
            }),
          });
          if (remainingIds.length > 0) {
            await fetchWithRetry(SCRIPT_URL, {
              method: "POST",
              body: JSON.stringify({
                action: "merge_buying_price",
                sheet: order.sheet_name,
                sheet_name: order.sheet_name,
                row_ids: remainingIds,
              }),
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
          linkedOrderIds: [],
        }),
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
          onSuccess(); // fallback
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
    isFree,
  } = getLinkedOrdersInfo(order, allOrders);
  const otherLinkedOrder = getOtherLinkedOrder(order, allOrders);

  const status = getOrderStatus(order);
  const key = `${order.id}-${order.sheet_name}`;
  const isVerified = verifiedOrders.has(key);
  const warningImageSrc = getWarningImageSource(order as any, getMissingImages()[key]);
  const isMissing = missingOrders.has(key) || !!warningImageSrc;
  const receiptOrderId = String(order.id || "").trim() || "Pending";
  const receiptBoxNumber = String(getBoxName(order) || "")
    .replace(/^box[\s-]*/i, "")
    .trim();

  const handleWarningImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (warningUploadRef.current) warningUploadRef.current.value = "";
      return;
    }

    setIsUploadingWarning(true);
    try {
      const { uploadToImgBB } = await import("@/lib/order-utils");
      const url = await uploadToImgBB(file);
      const newImages = { ...getMissingImages(), [key]: url };
      saveMissingImages(newImages);

      const next = new Set(missingOrders);
      next.add(key);
      setMissingOrders(next);
      saveMissingSet(next);

      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_warning_picture",
          sheet_name: order.sheet_name,
          row_id: order.id,
          image_url: url,
        }),
      });
      order.warningImageUrl = url; // eagerly update
      order.warningBase64 = url;
      setActiveOrder((prev) => ({
        ...prev,
        warningImageUrl: url,
        warningBase64: url,
        missing: true,
      }));
      if (onUpdateOrder)
        onUpdateOrder(order.id, order.sheet_name, { warningImageUrl: url, warningBase64: url });

      const role = localStorage.getItem("auth_role") || "unknown";
      const { sendNotification } = await import("@/lib/notifications");
      sendNotification(
        "warning",
        `WARNING added to order: ${order.name || order.insta}. Please check!`,
        role,
        order,
        true,
      );
    } catch (err) {
      alert("Failed to upload warning image");
    } finally {
      setIsUploadingWarning(false);
    }
  };

  const handlePrimaryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      if (primaryFileRef.current) primaryFileRef.current.value = "";
      return;
    }

    setIsUploadingPrimary(true);
    try {
      const { uploadToImgBB } = await import("@/lib/order-utils");
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadToImgBB(f)));
      const existing = order.primary_urls
        ? String(order.primary_urls).split(",").filter(Boolean)
        : [];
      const merged = [...existing, ...uploaded].join(",");

      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_primary_picture",
          sheet_name: order.sheet_name,
          row_id: order.id,
          primary_urls: merged,
        }),
      });
      order.primary_urls = merged; // eagerly update
      if (onUpdateOrder) onUpdateOrder(order.id, order.sheet_name, { primary_urls: merged });
    } catch (err) {
      alert("Failed to upload primary image");
    } finally {
      setIsUploadingPrimary(false);
      if (primaryFileRef.current) primaryFileRef.current.value = "";
    }
  };

  const handleProofImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      if (proofFileRef.current) proofFileRef.current.value = "";
      return;
    }

    setIsUploadingProof(true);
    try {
      const { uploadToImgBB } = await import("@/lib/order-utils");
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadToImgBB(f)));
      const lastUrl = uploaded[uploaded.length - 1];

      const exist = order.proof_urls
        ? Array.isArray(order.proof_urls)
          ? order.proof_urls
          : String(order.proof_urls).split(",").filter(Boolean)
        : order.image_url
          ? [String(order.image_url)]
          : [];
      const newUrls = [...exist, ...uploaded];
      const merged = newUrls.join(",");

      // Send every known param name so the Apps Script writes to the right column
      // regardless of which key it expects.
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_proof_picture",
          sheet_name: order.sheet_name,
          row_id: order.id,
          image_url: lastUrl,
          proof_url: lastUrl,
          proof_urls: merged,
          secondary_images: merged,
        }),
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

  const handleMissingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (getWarningImageSource(order as any, getMissingImages()[key])) {
      setViewImageModal(key);
    } else {
      warningUploadRef.current?.click();
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
    import("@/types").then((m) => m.saveMissingImages(nextImages));

    if (onUpdateOrder) {
      onUpdateOrder(order.id, order.sheet_name, {
        warningBase64: undefined,
        warningImageUrl: undefined,
      });
    }
    setActiveOrder((prev) => ({
      ...prev,
      warningBase64: undefined,
      warningImageUrl: undefined,
      missing: false,
    }));

    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "update_warning_picture",
        row_id: order.id,
        sheet_name: order.sheet_name,
        image_url: "",
      }),
    }).catch(() => {});
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "markMissing",
        row_id: order.id,
        sheet_name: order.sheet_name,
        missing: false,
      }),
    }).catch(() => {});

    // Remove the original warning notification globally
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "remove_warning_notification",
        row_id: order.id,
        sheet_name: order.sheet_name,
      }),
    }).catch(() => {});
  };

  const handleRemoveLink = async (targetIo: Order) => {
    setIsUnlinking(targetIo.id);
    try {
      const allCluster = [order, ...linkedOrders];
      const remainingOrders = allCluster.filter(
        (o) => !(o.id === targetIo.id && o.sheet_name === targetIo.sheet_name),
      );

      const res = await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "unlink_order",
          row_id: targetIo.id,
          sheet: targetIo.sheet_name,
          sheet_name: targetIo.sheet_name,
          target_sheet: targetIo.sheet_name,
          cluster_refs: allCluster.map((o) => `${o.id}:${o.sheet_name}`),
        }),
      });
      const text = await res.text();
      let result: any = null;
      try {
        result = JSON.parse(text);
      } catch {
        // ignore malformed response
      }
      if (result?.result === "error" || result?.status === "error")
        throw new Error(result?.message || "Failed to remove link");

      if (onUpdateOrder) {
        onUpdateOrder(targetIo.id, targetIo.sheet_name, {
          linkedOrderIds: remainingOrders.map((o) => `!${o.id}:${o.sheet_name}`),
        });
        remainingOrders.forEach((ro) => {
          onUpdateOrder(ro.id, ro.sheet_name, {
            linkedOrderIds: [
              ...remainingOrders
                .filter((o) => !(o.id === ro.id && o.sheet_name === ro.sheet_name))
                .map((o) => `${o.id}:${o.sheet_name}`),
              `!${targetIo.id}:${targetIo.sheet_name}`,
            ],
          });
        });
      }

      const role = localStorage.getItem("auth_role") || "unknown";
      const { sendNotification } = await import("@/lib/notifications");
      sendNotification(
        "link",
        `Order unlinked: ${targetIo.name || targetIo.insta || `#${targetIo.id}`} removed from linked group.`,
        role,
        targetIo,
      );

      onSuccess(); // Ensure it fully refreshes from backend
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
      const { generateSingleOrderPdf } = await import("@/lib/pdf");
      generateSingleOrderPdf(order, allOrders);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSaveReceiptImage = useCallback(async () => {
    if (!receiptRef.current || savingImage) return;
    setSavingImage(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
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
    const text = `📦 Order Details\n👤 Name: ${order.name || "-"}\n📸 Instagram: ${order.insta || "-"}\n📱 Phone: ${order.phone || "-"}\n📍 Location: ${order.place || "-"}\n💰 Total: ${total.toLocaleString()} IQD\n🚚 Shipping: ${shipping.toLocaleString()} IQD\n💳 Advance: ${combinedInitial.toLocaleString()} IQD\n📉 Remaining: ${remaining.toLocaleString()} IQD\n🆔 Order No: ${cleanOrderNo(order.orderNo) || "Pending"}`;

    if (!navigator.share) {
      navigator.clipboard.writeText(text).then(() => alert("Copied text to clipboard!"));
      return;
    }

    try {
      setIsSharing(true);
      let fileToShare: File | null = null;
      if (receiptRef.current) {
        // Hide the action button row temporarily. It's technically not in the receiptRef but good measure if it were
        const dataUrl = await toPng(receiptRef.current, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        fileToShare = new File([blob], `Order_${cleanOrderNo(order.orderNo) || "Pending"}.png`, {
          type: "image/png",
        });
      }

      if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          title: "Order Details",
          text,
          files: [fileToShare],
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
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "verifyOrder",
        row_id: order.id,
        sheet_name: order.sheet_name,
        matchStatus: next.has(key) ? "match" : "mismatch",
      }),
    }).catch(() => {});
  };

  const DetailRow = ({
    label,
    value,
    accent,
  }: {
    label: React.ReactNode;
    value: string;
    accent?: boolean;
  }) => (
    <div className="flex justify-between items-end py-1.5 border-b border-border/50">
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      <span className={`text-xs font-semibold ${accent ? "text-primary" : ""}`}>{value}</span>
    </div>
  );

  const handleOpenLinkedOrder = (linkedOrder: Order) => {
    setIsEditing(false);
    setViewingGallery(null);
    setViewImageModal(null);
    setActiveOrder(linkedOrder);
  };

  const formatImg = (img: string) => {
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    if (img.length > 100) return `data:image/jpeg;base64,${img}`;
    return img;
  };

  const primaryImages: string[] = [];
  if (order.primary_urls) {
    primaryImages.push(...String(order.primary_urls).split(",").filter(Boolean).map(formatImg));
  }

  const proofImages: string[] = [];
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`bg-card border w-full max-w-2xl min-w-0 rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-slide-up ${isVerified ? "border-primary/30" : isMissing ? "border-amber-400/30" : "border-border"}`}
      >
        <div className="p-3 sm:p-4 border-b border-border flex justify-between items-center gap-2 bg-secondary/50 rounded-t-2xl">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-bold text-base sm:text-lg">
                {isEditing ? "Edit Order" : "Order Details"}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-muted-foreground text-xs">
                  ID: {order.id} · {order.sheet_name}
                </p>
                <span
                  className={`px-1 py-0.5 rounded text-[9px] font-semibold border ${STATUS_COLORS[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
                {senderLabel && (
                  <span className="rounded bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    By: {senderLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <input
              type="file"
              ref={primaryFileRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handlePrimaryImageChange}
            />
            <input
              type="file"
              ref={warningUploadRef}
              className="hidden"
              accept="image/*"
              onChange={handleWarningImageChange}
            />
            <input
              type="file"
              ref={proofFileRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleProofImageChange}
            />
            <div className="flex bg-secondary rounded-lg overflow-hidden border border-amber-400/30">
              <button
                onClick={(e) => {
                  const key = `${order.id}-${order.sheet_name}`;
                  if (warningImageSrc) {
                    setViewImageModal(key);
                  } else {
                    warningUploadRef.current?.click();
                  }
                }}
                className={`p-1.5 transition-all outline-none ${isMissing ? "bg-amber-400 text-white" : "text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`}
                title={warningImageSrc ? "View Warning Picture" : "Upload Warning Picture"}
              >
                {isUploadingWarning ? (
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : warningImageSrc ? (
                  <Eye size={14} />
                ) : (
                  <ImageIcon size={14} />
                )}
              </button>
            </div>
            <button
              onClick={handleVerify}
              className={`p-1.5 rounded-lg transition-all ${isVerified ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-primary"} ml-1`}
              title="Verify"
            >
              <Heart size={16} fill={isVerified ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 custom-scrollbar">
          {isEditing ? (
            <OrderFormView
              activeSheet={order.sheet_name}
              editingOrder={order}
              onCancel={() => setIsEditing(false)}
              onSuccess={(payload) => {
                setIsEditing(false);
                onSuccess(payload);
              }}
              allOrders={allOrders}
            />
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className="min-w-0">
                <div className="mb-1 text-sm font-semibold text-muted-foreground">Status</div>
                {canChangeStatus ? (
                  <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => onStatusChange(order, s)}
                        className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${status === s ? STATUS_COLORS[s] : "bg-secondary text-muted-foreground border-transparent hover:border-border"}`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${STATUS_COLORS[status]}`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                )}
              </div>

              {/* Box changer */}
              <div className="flex items-center justify-between border border-border/60 rounded-xl p-3 bg-card shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Package size={16} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-muted-foreground">Box:</span>
                    <span className="text-sm font-bold">
                      {getBoxName(order) ? `Box ${getBoxName(order)}` : "None"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const currentBox = getBoxName(order);
                    const newBox = window.prompt(
                      `Change Box Name for ${order.name || order.insta || "this order"}:`,
                      currentBox,
                    );
                    if (newBox !== null && newBox.trim() !== currentBox) {
                      const trimmed = newBox.trim();
                      setActiveOrder((prev) => ({ ...prev, box_name: trimmed }));
                      if (onUpdateOrder)
                        onUpdateOrder(order.id, order.sheet_name, { box_name: trimmed });
                      fetchWithRetry(SCRIPT_URL, {
                        method: "POST",
                        body: JSON.stringify({
                          action: "update_box_name",
                          row_id: order.id,
                          sheet: order.sheet_name,
                          box_name: trimmed,
                        }),
                      }).catch(() => alert("Failed to update box name"));
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5 text-xs font-bold border border-primary/20"
                >
                  <Edit2 size={12} />
                  Change box
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowImageActions((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary/80"
                >
                  <ImageIcon size={15} />
                  Pictures
                  {primaryImages.length + proofImages.length + (warningImageSrc ? 1 : 0) > 0 && (
                    <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {primaryImages.length + proofImages.length + (warningImageSrc ? 1 : 0)}
                    </span>
                  )}
                </button>
                {showImageActions && (
                  <div className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-secondary/30 p-2 sm:grid-cols-2">
                    {proofImages.length > 0 && (
                      <button
                        onClick={() => {
                          setCurrentGalleryIdx(0);
                          setViewingGallery({
                            title: "Proof Pictures",
                            images: proofImages,
                            initialIndex: 0,
                          });
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 py-2 text-[11px] font-bold hover:bg-secondary"
                      >
                        <Eye size={14} /> View Proof{" "}
                        {proofImages.length > 1 ? `(${proofImages.length})` : ""}
                      </button>
                    )}
                    {primaryImages.length > 0 && (
                      <button
                        onClick={() => {
                          setCurrentGalleryIdx(0);
                          setViewingGallery({
                            title: "Primary Pictures",
                            images: primaryImages,
                            initialIndex: 0,
                          });
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 py-2 text-[11px] font-bold hover:bg-secondary"
                      >
                        <Eye size={14} /> View Primary{" "}
                        {primaryImages.length > 1 ? `(${primaryImages.length})` : ""}
                      </button>
                    )}
                    <button
                      onClick={() => primaryFileRef.current?.click()}
                      disabled={isUploadingPrimary}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-2 text-[11px] font-bold text-blue-600 hover:bg-blue-500/20 disabled:opacity-50"
                    >
                      {isUploadingPrimary ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}{" "}
                      Primary
                    </button>
                    <button
                      onClick={() => proofFileRef.current?.click()}
                      disabled={isUploadingProof}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2 py-2 text-[11px] font-bold text-primary hover:bg-primary/20 disabled:opacity-50"
                    >
                      {isUploadingProof ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera size={14} />
                      )}{" "}
                      Proof
                    </button>
                    <button
                      onClick={() => warningUploadRef.current?.click()}
                      disabled={isUploadingWarning}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-2 text-[11px] font-bold text-amber-600 hover:bg-amber-500/20 disabled:opacity-50 sm:col-span-2"
                    >
                      {isUploadingWarning ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <AlertTriangle size={14} />
                      )}{" "}
                      Warning
                    </button>
                  </div>
                )}
              </div>

              {/* Receipt card - used for image capture */}
              <div
                ref={receiptRef}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="p-5 text-center space-y-2 bg-secondary/30 border-b border-dashed border-border">
                  <span className="inline-block bg-foreground text-background px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Receipt
                  </span>
                  <h1 className="text-xl font-bold tracking-tight uppercase">SHEIN KURDISTANI</h1>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                    <span>{order.date?.split(" ")[0] || "-"}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>#{cleanOrderNo(order.orderNo) || "PENDING"}</span>
                    {receiptBoxNumber && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{receiptBoxNumber}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-0.5">
                  <DetailRow label="Order ID" value={receiptOrderId} accent />
                  <DetailRow label="Customer" value={order.name || "-"} />
                  <DetailRow label="Instagram" value={`@${order.insta || "-"}`} accent />
                  <DetailRow label="Phone" value={order.phone || "-"} />
                  <DetailRow label="Location" value={order.place || "-"} />
                  {order.sku && <DetailRow label="SKU" value={order.sku} />}
                  <DetailRow label="SKU Qty" value={String(order.pics_text || "1")} />

                  {linkedOrders.length === 0 ? (
                    <DetailRow
                      label={
                        <span>
                          Item Price{" "}
                          {isOrderFree(order) && (
                            <span className="text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1">
                              Free Ship
                            </span>
                          )}
                        </span>
                      }
                      value={`${basePrice.toLocaleString()} IQD`}
                    />
                  ) : (
                    <>
                      <DetailRow
                        label={
                          <span>
                            Item Price{" "}
                            {isOrderFree(order) && (
                              <span className="text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1">
                                Free Ship
                              </span>
                            )}
                          </span>
                        }
                        value={`${basePrice.toLocaleString()} IQD`}
                      />
                      {linkedOrders.map((lo) => (
                        <DetailRow
                          key={`${lo.id}-${lo.sheet_name}`}
                          label={
                            <span>
                              🔗 {lo.name || lo.insta}{" "}
                              {isOrderFree(lo) && (
                                <span className="text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1">
                                  Free Ship
                                </span>
                              )}
                            </span>
                          }
                          value={`${getDisplayPrice(lo, allOrders).toLocaleString()} IQD`}
                        />
                      ))}
                      <DetailRow
                        label="All Items Total"
                        value={`${combinedPrice.toLocaleString()} IQD`}
                        accent
                      />
                    </>
                  )}

                  <DetailRow
                    label="Shipping"
                    value={isFree ? "Free Ship (0 IQD)" : `${shipping.toLocaleString()} IQD`}
                  />
                  <DetailRow
                    label="Advance Paid"
                    value={`${combinedInitial.toLocaleString()} IQD`}
                    accent
                  />
                  <div className="pt-3 mt-3 border-t-2 border-border flex justify-between items-end">
                    <span className="text-sm font-bold">Remaining</span>
                    <span
                      className={`text-xl font-bold font-mono ${remaining > 0 ? "text-amber-500" : "text-primary"}`}
                    >
                      {remaining.toLocaleString()}{" "}
                      <span className="text-xs text-muted-foreground">IQD</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Receipt as Image button */}
              <button
                onClick={handleSaveReceiptImage}
                disabled={savingImage}
                className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-50"
              >
                {savingImage ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
                Save Receipt as Image
              </button>

              {linkedOrders.length > 0 && (
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold mb-2">
                    <Link2 size={14} className="text-primary" /> Linked Orders (
                    {linkedOrders.length})
                  </div>
                  {linkedOrders.map((lo) => (
                    <div
                      key={`${lo.id}-${lo.sheet_name}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenLinkedOrder(lo)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleOpenLinkedOrder(lo);
                      }}
                      className="flex justify-between items-center py-1.5 text-xs group transition-all cursor-pointer hover:text-primary"
                      title="Open linked order details"
                    >
                      <span>
                        {lo.name || lo.insta} · #{lo.id} · {lo.sheet_name} · PCS{" "}
                        {String(lo.pics_text || "1")}{" "}
                        {isOrderFree(lo) && (
                          <span className="text-[10px] bg-green-500/20 text-green-600 px-1 rounded uppercase font-bold ml-1">
                            Free Ship
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">
                          {getDisplayPrice(lo, allOrders).toLocaleString()} IQD
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveLink(lo);
                          }}
                          disabled={isUnlinking === lo.id}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-100"
                          title="Remove linked order"
                        >
                          {isUnlinking === lo.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {otherLinkedOrder && (
                <button
                  type="button"
                  onClick={() => handleOpenLinkedOrder(otherLinkedOrder)}
                  className="flex items-center gap-2 text-primary text-sm hover:underline"
                >
                  <Link2 size={14} /> Open Other Receipt
                </button>
              )}

              {order.link && (
                <a
                  href={order.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary text-sm hover:underline"
                >
                  <ExternalLink size={14} /> View Product Link
                </a>
              )}

              {order.note && (
                <div className="bg-secondary p-3 rounded-lg mb-2">
                  <span className="text-[10px] font-medium text-muted-foreground">Notes:</span>
                  <p className="text-xs mt-1">{order.note}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="p-2 sm:p-3 border-t border-border flex justify-between gap-1 sm:gap-2 bg-secondary/30 rounded-b-2xl">
            <button
              onClick={onClose}
              className="flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground font-medium p-2 rounded-lg transition-all shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-1 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0"
            >
              {isDeleting ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <Trash2 size={14} className="shrink-0" />
              )}{" "}
              <span className="truncate">Del</span>
            </button>
            <button
              onClick={handlePdf}
              disabled={generatingPdf}
              className="flex-1 flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0"
            >
              {generatingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <FileText size={14} className="shrink-0" />
              )}{" "}
              <span className="truncate">PDF</span>
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all disabled:opacity-50 min-w-0"
            >
              {isSharing ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <Share2 size={14} className="shrink-0" />
              )}{" "}
              <span className="truncate">Share</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-0 text-[10px] sm:text-xs rounded-lg transition-all glow-primary min-w-0"
            >
              <Edit2 size={14} className="shrink-0" /> <span className="truncate">Edit</span>
            </button>
          </div>
        )}
      </div>

      {viewImageModal && (
        <div className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative flex flex-col items-center">
            <button
              onClick={() => setViewImageModal(null)}
              className="absolute -top-4 -right-4 bg-background border border-border text-foreground rounded-full p-2 hover:bg-secondary transition-colors shadow-lg"
            >
              <X size={28} />
            </button>
            <div className="bg-secondary/50 p-2 rounded-xl border border-border/50">
              <img
                src={warningImageSrc}
                alt="Warning"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="mt-8 flex gap-4 w-full justify-center">
              <button
                onClick={handleUnmarkMissing}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <AlertTriangle size={18} />
                Unmark Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingGallery && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col animate-in fade-in duration-200">
          <div className="p-4 flex justify-between items-center text-white border-b border-white/10">
            <span className="font-bold text-sm">
              {viewingGallery.title} - {currentGalleryIdx + 1} / {viewingGallery.images.length}
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setViewingGallery(null);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold"
              >
                <Edit2 size={14} /> Edit / Delete Pictures
              </button>
              <button
                onClick={() => setViewingGallery(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4">
            <img
              src={viewingGallery.images[currentGalleryIdx]}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain select-none"
              alt="Gallery Preview"
            />
            {currentGalleryIdx > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentGalleryIdx((idx) => idx - 1);
                }}
                className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {currentGalleryIdx < viewingGallery.images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentGalleryIdx((idx) => idx + 1);
                }}
                className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;
