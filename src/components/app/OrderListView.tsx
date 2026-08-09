import React, { useState, useMemo, useRef, useEffect } from "react";
import { orderLinkHref } from "@/lib/order-link";
import { ordersLinked, warningAdded } from "@/lib/notification-text";
import { updateOrderEverywhere } from "@/lib/submitOrder";
import {
  Order,
  SCRIPT_URL,
  getOrderStatus,
  STATUS_ICONS,
  STATUS_OPTIONS,
  STATUS_ROW_COLORS,
  getVerifiedSet,
  saveVerifiedSet,
  getMissingSet,
  saveMissingSet,
  getMissingImages,
  saveMissingImages,
} from "@/types";
import {
  Trash2,
  ExternalLink,
  FileText,
  Package,
  Share2,
  Phone,
  MapPin,
  Heart,
  AlertTriangle,
  ChevronLeft,
  Link2,
  ChevronDown,
  ChevronRight,
  Layers,
  Plus,
  Loader2,
  X,
  Image as ImageIcon,
  Scan,
} from "lucide-react";
import { toast } from "sonner";
import MonthSelector from "./MonthSelector";
import { SkuSearch } from "./SkuSearch";
import {
  getLinkedOrdersInfo,
  getCustomerTotalPrice,
  isOrderFree,
  cleanOrderNo,
  uploadToImgBB,
  getBoxName,
  getLinkedGroup,
  getOtherLinkedOrder,
  isSameCustomer,
} from "@/lib/order-utils";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { sendNotification } from "@/lib/notifications";
import { getWarningImageSource } from "@/lib/warning-image";

const QRScannerModal = React.lazy(() =>
  import("./QRScannerModal").then((mod) => ({ default: mod.QRScannerModal })),
);

const getPrimaryImgs = (order: Order) =>
  String(order.primary_urls || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => {
      if (url.startsWith("http") || url.startsWith("data:")) return url;
      if (url.length > 100) return `data:image/jpeg;base64,${url}`;
      return url;
    });

const getOrderSenderLabel = (order: Order) => {
  // staff_name is the field going forward; admin_name is read as a fallback so
  // orders created before the change still show who took them.
  const senderName = String(order.staff_name || order.admin_name || "").trim();
  if (!senderName) return "";
  const senderRole = String(order.staff_role || order.admin_role || "").trim();
  return senderRole ? `${senderName} (${senderRole})` : senderName;
};

const getInstagramHandle = (value: unknown) =>
  String(value || "")
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\//i, "")
    .replace(/^@+/, "")
    .split(/[/?#]/)[0]
    .trim();

const InstagramGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const WhatsAppGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
    aria-hidden="true"
  >
    <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 20.5 11.8Z" />
    <path d="M8.1 7.8c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.4 0 .6.7 1.2 1.7 2.1 3 2.7.2.1.4.1.6-.1l.8-1c.2-.2.4-.3.7-.2l1.8.9c.3.1.4.3.4.5 0 .4-.2 1.4-.8 1.9-.6.5-1.4.7-2.2.5-1.2-.3-2.8-1-4.3-2.4-1.2-1.1-2.2-2.5-2.6-3.7-.4-1.1 0-2.1.7-2.9Z" />
  </svg>
);

const isWhatsAppText = (value: unknown) => {
  const source = String(value || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return source.includes("whatsapp") || source.includes("whatapp");
};

const isWhatsAppSource = (order: Order) => {
  return isWhatsAppText(order.insta) || isWhatsAppText(order.name);
};

const getWhatsAppNumber = (value: unknown) => {
  let digits = String(value || "")
    .split(/[/,;]/)[0]
    .replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("9640")) digits = `964${digits.slice(4)}`;
  else if (digits.startsWith("0")) digits = `964${digits.slice(1)}`;
  else if (digits.startsWith("7") && digits.length === 10) digits = `964${digits}`;
  return digits;
};

const CustomerContactLink: React.FC<{ order: Order; className: string }> = ({
  order,
  className,
}) => {
  if (isWhatsAppSource(order)) {
    const firstPhone = String(order.phone || "")
      .split(/[/,;]/)[0]
      .trim();
    const whatsappNumber = getWhatsAppNumber(firstPhone);
    const customerName =
      [order.name, order.insta]
        .map((value) => String(value || "").trim())
        .find((value) => value && !isWhatsAppText(value)) || "WhatsApp";

    if (!whatsappNumber) {
      return (
        <span
          className={`inline-flex min-w-0 max-w-full items-center gap-1 text-green-600 ${className}`}
        >
          <WhatsAppGlyph />
          <span className="truncate">{customerName}</span>
        </span>
      );
    }

    return (
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex min-w-0 max-w-full items-center gap-1 text-green-600 hover:text-green-700 hover:underline ${className}`}
        onClick={(event) => event.stopPropagation()}
        title={`Open WhatsApp chat with ${customerName}`}
      >
        <WhatsAppGlyph />
        <span className="truncate">{customerName}</span>
      </a>
    );
  }

  const handle = getInstagramHandle(order.insta);
  if (!handle) return <span className={className}>{order.name || "Unknown"}</span>;

  return (
    <a
      href={`https://www.instagram.com/${encodeURIComponent(handle)}/`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-w-0 max-w-full items-center gap-1 text-pink-600 hover:text-pink-700 hover:underline ${className}`}
      onClick={(event) => event.stopPropagation()}
      title={`Open @${handle} on Instagram`}
    >
      <InstagramGlyph />
      <span className="truncate">@{handle}</span>
    </a>
  );
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
  /** Months the list is limited to; more than one may be picked. */
  selectedMonths?: string[];
  onToggleMonth?: (month: string) => void;
  onStatusChange: (order: Order, status: string) => void;
  role?: string | null;
  onNewOrder?: () => void;
  isDeliveryTab?: boolean;
  onUpdateOrder?: (id: string | number, sheet: string, updates: Partial<Order>) => void;
}

const OrderListView: React.FC<OrderListViewProps> = ({
  orders,
  onEdit,
  onDelete,
  onOrderClick,
  allOrders,
  viewingMonth,
  setViewingMonth,
  activeYear,
  setActiveYear,
  availableMonths,
  selectedMonths,
  onToggleMonth,
  onStatusChange,
  role,
  onNewOrder,
  isDeliveryTab,
  onUpdateOrder,
}) => {
  // Everyone sees who created an order. It was owner/admin only, which meant the
  // staff who take the orders could not see their own name on them.
  const canViewSubmittedBy = true;
  const [viewMode, setViewMode] = useState<"table" | "gallery">("table");
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
  const skuBoxOptions = useMemo(() => {
    const names = new Set<string>();
    allOrders.forEach((order) => {
      const boxName = getBoxName(order) || String(order.box_name || "").trim();
      if (boxName) names.add(boxName);
    });
    return Array.from(names).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numB - numA;
      return b.localeCompare(a);
    });
  }, [allOrders]);

  const handleManualDelivery = async () => {
    const input = window.prompt(
      "Enter Order ID, Shein Order No, Phone, or Instagram handle to mark as delivered:",
    );
    if (!input || !input.trim()) return;

    // Attempt match
    const match = input.trim().toLowerCase();
    const searchScope = isDeliveryTab
      ? allOrders.filter((o) => o.sheet_name === viewingMonth)
      : allOrders;
    const foundOrder = searchScope.find(
      (o) =>
        String(o.orderNo).toLowerCase() === match ||
        String(o.id) === match ||
        String(o.phone) === match ||
        String(o.insta).toLowerCase() === match,
    );

    if (!foundOrder) {
      alert(`Order not found for entry: ${input}`);
      return;
    }

    if (role === "owner") {
      const confirmOrange = window.confirm(
        `Confirm delivery for ${foundOrder.name || foundOrder.insta || "Order"}? This will turn row orange.`,
      );
      if (confirmOrange) {
        const payload = {
          action: "update",
          sheet: foundOrder.sheet_name,
          row_id: foundOrder.id,
          extra: `[DELIVERY_SCANNED] ${foundOrder.extra || ""}`.trim(),
        };
        onStatusChange(foundOrder, "DELIVERY_SCANNED");
        alert("Delivery Confirmed and cell highlighted!");
      }
    } else {
      const confirmScan = window.confirm(`Scan order ${foundOrder.name || match} for delivery?`);
      if (confirmScan) {
        const payload = {
          action: "update",
          sheet: foundOrder.sheet_name,
          row_id: foundOrder.id,
          note: `[DELIVERY_SCANNED] ${foundOrder.note || ""}`.trim(),
        };
        onStatusChange({ ...foundOrder, note: payload.note }, "arrived");
        alert("Marked as Delivery Scanned, waiting for owner confirmation.");
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
      } catch (e) {
        // ignore non-JSON QR payload
      }

      const searchScope = isDeliveryTab
        ? allOrders.filter((o) => o.sheet_name === viewingMonth)
        : allOrders;
      const foundOrder = searchScope.find((o) => {
        if (parsedOrderId && parsedSheetName) {
          return String(o.id) === parsedOrderId && String(o.sheet_name) === parsedSheetName;
        }
        return (
          String(o.orderNo) === match ||
          String(o.id) === match ||
          String(o.phone) === match ||
          `${o.id}-${o.sheet_name}` === match ||
          (parsedOrderId && (String(o.orderNo) === parsedOrderId || String(o.id) === parsedOrderId))
        );
      });

      if (!foundOrder) {
        alert(
          `Order not found for QR code: ${match.substring(0, 50)}${match.length > 50 ? "..." : ""}`,
        );
        return;
      }

      if (role === "owner") {
        const confirmOrange =
          isDetailedQR ||
          window.confirm(
            `Confirm delivery for ${foundOrder.name || "Order"}? This will turn row orange.`,
          );
        if (confirmOrange) {
          const payload = {
            action: "update",
            row_id: foundOrder.id,
            sheet: foundOrder.sheet_name,
            color_orange: true,
            note: (
              (foundOrder.note || "").replace(/\[DELIVERY_SCANNED\]/g, "") + " [DELIVERY_CONFIRMED]"
            ).trim(),
          };
          await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
          alert("Delivery Confirmed and cell highlighted!");
        }
      } else {
        const confirmScan =
          isDetailedQR || window.confirm(`Scan order ${foundOrder.name || match} for delivery?`);
        if (confirmScan) {
          const payload = {
            action: "update",
            row_id: foundOrder.id,
            sheet: foundOrder.sheet_name,
            note: ((foundOrder.note || "") + " [DELIVERY_SCANNED]").trim(),
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

  const handleOwnerConfirmDelivery = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmOrange = window.confirm(
      `Confirm delivery for ${order.name || "Order"}? This will turn row orange.`,
    );
    if (confirmOrange) {
      try {
        const payload = {
          action: "update",
          row_id: order.id,
          sheet: order.sheet_name,
          color_orange: true,
          note: (
            (order.note || "").replace(/\[DELIVERY_SCANNED\]/g, "") + " [DELIVERY_CONFIRMED]"
          ).trim(),
        };
        await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
        alert("Delivery Confirmed and cell highlighted! Refresh manually to see changes.");
      } catch (err) {
        alert("Error updating order");
      }
    }
  };

  // Nothing here is virtualised, so every row a search matches becomes real DOM —
  // a broad query across every month can match a thousand orders and stall the
  // page. Rows are handed out a screenful at a time instead; filtering itself is
  // about a millisecond, so the cost being avoided is purely rendering.
  const ROWS_PER_PAGE = 60;
  const [visibleCount, setVisibleCount] = useState(ROWS_PER_PAGE);

  const allGroupedOrders = useMemo(() => {
    return orders.map((order) => {
      const key = `${order.id}-${order.sheet_name}`;
      return {
        baseOrder: order,
        linkedOrders: [], // No visual grouping from now on
        key,
        isGroup: false,
      };
    });
  }, [orders]);

  // A new search or month starts again from the first page.
  useEffect(() => {
    setVisibleCount(ROWS_PER_PAGE);
  }, [orders]);

  const groupedOrders = useMemo(
    () => allGroupedOrders.slice(0, visibleCount),
    [allGroupedOrders, visibleCount],
  );
  const hiddenCount = allGroupedOrders.length - groupedOrders.length;

  const toggleGroup = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // No longer grouping
  };

  const handleGetPdf = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (generatingPdf) return;
    setGeneratingPdf(String(order.id));
    try {
      const { generateSingleOrderPdf } = await import("@/lib/pdf");
      generateSingleOrderPdf(order, allOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleShare = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const { combinedPrice, combinedInitial, shipping, total, remaining } = getLinkedOrdersInfo(
      order,
      allOrders,
    );

    const text = `📦 Order Details\n👤 Name: ${order.name || "-"}\n📸 Instagram: ${order.insta || "-"}\n📱 Phone: ${order.phone || "-"}\n📍 Location: ${order.place || "-"}\n💰 Total: ${combinedPrice.toLocaleString()} IQD\n💳 Advance: ${combinedInitial.toLocaleString()} IQD\n📉 Remaining: ${remaining.toLocaleString()} IQD\n🆔 Order No: ${cleanOrderNo(order.orderNo) || "Pending"}`;
    if (navigator.share) navigator.share({ title: "Order Details", text }).catch(() => {});
    else navigator.clipboard.writeText(text).then(() => alert("Copied!"));
  };

  const handleVerify = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    const next = new Set(verifiedOrders);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVerifiedOrders(next);
    saveVerifiedSet(next);
    // Fire and forget to GAS
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

  const toggleSelect = (order: Order, e: React.MouseEvent) => {
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

    // Group selected into an array of IDs from the current sheet
    // Actually our merge script only supports one sheet at a time right now based on how it's written `var sheet = ss.getSheetByName(sheetName)`
    const selectedObjArray = orders
      .filter((o) => selectedOrders.has(`${o.id}-${o.sheet_name}`))
      .sort((a, b) => Number(a.id) - Number(b.id));
    if (selectedObjArray.length === 0) {
      setIsLinking(false);
      return;
    }
    // Orders may only be linked when they are provably the same customer: the
    // same phone number, or the same Instagram handle. Nothing else counts - a
    // shared display name is not proof, since two customers can share a name.
    // A group that fails this is refused outright, by hand as much as
    // automatically, so unrelated orders can never be merged.
    const reference = selectedObjArray[0];
    const mismatched = selectedObjArray.find((o) => !isSameCustomer(reference, o));
    if (mismatched) {
      alert(
        "These orders can't be linked. Orders may only be linked when they share " +
          "the same phone number or the same Instagram handle.",
      );
      setIsLinking(false);
      return;
    }
    const sheetName = selectedObjArray[0].sheet_name;
    const rowIds = selectedObjArray.map((o) => `${o.id}:${o.sheet_name}`);

    try {
      const res = await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "merge_buying_price",
          sheet: sheetName,
          sheet_name: sheetName,
          row_ids: rowIds,
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
        throw new Error(result?.message || "Failed to link orders.");
      if (onUpdateOrder) {
        const selectedKeys = new Set(selectedObjArray.map((o) => `${o.id}:${o.sheet_name}`));
        const affected = new Map<string, Order>();
        selectedObjArray.forEach((order) => {
          getLinkedGroup(order, allOrders).forEach((o) =>
            affected.set(`${o.id}:${o.sheet_name}`, o),
          );
        });
        selectedObjArray.forEach((order) => {
          onUpdateOrder(order.id, order.sheet_name, {
            linkedOrderIds: selectedObjArray
              .filter((o) => !(o.id === order.id && o.sheet_name === order.sheet_name))
              .map((o) => `${o.id}:${o.sheet_name}`),
          });
        });
        affected.forEach((order, key) => {
          if (selectedKeys.has(key)) return;
          onUpdateOrder(order.id, order.sheet_name, {
            linkedOrderIds: (order.linkedOrderIds || []).filter(
              (id) =>
                !selectedKeys.has(String(id).includes(":") ? String(id) : `${id}:${sheetName}`),
            ),
          });
        });
      }
      const names = selectedObjArray
        .map((o) => o.name || o.insta || `#${o.id}`)
        .slice(0, 4)
        .join(", ");
      sendNotification(
        "link",
        ordersLinked(selectedObjArray.length, names, selectedObjArray.length > 4),
        role ?? null,
        selectedObjArray[0],
      );

      setSelectedOrders(new Set());
      setIsSelectMode(false);
      alert("Orders linked successfully. The system will sync the latest data automatically.");
    } catch (e) {
      alert("Failed to link orders.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleMissingClick = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${order.id}-${order.sheet_name}`;
    if (getWarningImageSource(order as any, missingImages[key])) {
      setViewImageModal(key);
    } else {
      setPendingMissingOrder(order);
      setPendingMissingKey(key);
      fileRef.current?.click();
    }
  };

  // The picture only exists for other admins/moderators once the sheet
  // actually has it - the local optimistic update and the missingImages
  // cache only make it feel saved on this device. Apps Script answering
  // {status:"success"} used to be trusted blindly, but a since-fixed bug
  // there could return success while writing nothing; verifying the sheet
  // actually echoes the URL back means a silent failure surfaces here
  // instead of looking saved forever on just the uploader's phone.
  const saveWarningPicture = async (order: Order, imageUrl: string): Promise<boolean> => {
    /*
     * Supabase first, because Supabase is what everyone reads.
     *
     * This used to write the picture to the Google Sheet and cache it in this device's
     * localStorage, and nothing else. Orders are loaded from Supabase, whose warning_url
     * stayed empty — so the person who took the photo saw it (from their own cache) and no
     * other admin or moderator ever did. Writing the column is what makes it the same
     * picture for the whole team.
     *
     * The sheet is still written afterwards, but success is decided here: an order the
     * database does not have the picture for is not saved, whatever the sheet says.
     */
    const stored = await updateOrderEverywhere(
      "kurdistani",
      { unique_order_id: order.unique_order_id, sheet_name: order.sheet_name, id: order.id },
      { warning_url: imageUrl || null },
    );
    if (!stored.ok) {
      console.error("[warning] Supabase refused the picture:", stored.error);
      return false;
    }
    if (stored.supabaseUpdated === 0) {
      console.error("[warning] no Supabase row matched this order — picture not saved");
      return false;
    }

    try {
      const res = await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_warning_picture",
          row_id: order.id,
          sheet_name: order.sheet_name,
          image_url: imageUrl,
        }),
      });
      const result = JSON.parse(await res.text());
      if (result?.status !== "success") {
        // The picture is already in Supabase, so the team can see it. The sheet copy
        // failing is worth knowing about but is no longer a reason to call this a failure.
        console.warn("[warning] saved to Supabase; the sheet copy failed:", result?.message);
      }
      return true;
    } catch {
      return false;
    }
  };

  const toggleMissing = async (
    order: Order,
    key: string,
    isMissing: boolean,
    warningImageUrl?: string,
  ) => {
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
        onUpdateOrder(order.id, order.sheet_name, {
          warningBase64: undefined,
          warningImageUrl: undefined,
        });
      }

      saveWarningPicture(order, "").then((ok) => {
        if (!ok) toast.error("Could not clear the warning picture. Please try again.");
      });

      // Remove the original warning notification globally
      fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "remove_warning_notification",
          row_id: order.id,
          sheet_name: order.sheet_name,
        }),
      }).catch(() => {});
    }

    if (isMissing && warningImageUrl) {
      if (onUpdateOrder) {
        onUpdateOrder(order.id, order.sheet_name, {
          warningImageUrl,
          warningBase64: warningImageUrl,
        });
      }

      const saved = await saveWarningPicture(order, warningImageUrl);
      if (!saved) {
        // Roll back the optimistic state - showing it as saved here while the
        // sheet never got it is exactly the bug this is fixing.
        const rolledBack = new Set(missingOrders);
        rolledBack.delete(key);
        setMissingOrders(rolledBack);
        saveMissingSet(rolledBack);
        const rolledBackImages = { ...missingImages };
        delete rolledBackImages[key];
        setMissingImages(rolledBackImages);
        saveMissingImages(rolledBackImages);
        if (onUpdateOrder) {
          onUpdateOrder(order.id, order.sheet_name, {
            warningImageUrl: undefined,
            warningBase64: undefined,
          });
        }
        toast.error("Warning picture was not saved", {
          description: "The sheet didn't confirm it - other admins would never see it. Try again.",
        });
        return;
      }

      sendNotification("warning", warningAdded(order), role ?? null, order, true);
    }

    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "markMissing",
        row_id: order.id,
        sheet_name: order.sheet_name,
        missing: isMissing,
      }),
    }).catch(() => {});
  };

  const handleMissingImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingMissingKey || !pendingMissingOrder) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setIsUploadingMissing(true);
    try {
      const { uploadToImgBB } = await import("@/lib/order-utils");
      const url = await uploadToImgBB(file);
      const newImages = { ...missingImages, [pendingMissingKey]: url };
      setMissingImages(newImages);
      saveMissingImages(newImages);
      await toggleMissing(pendingMissingOrder, pendingMissingKey, true, url);
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
    return (
      <div className="space-y-4">
        <MonthSelector
          viewingMonth={viewingMonth}
          setViewingMonth={setViewingMonth}
          activeYear={activeYear}
          setActiveYear={setActiveYear}
          availableMonths={availableMonths}
        />
        <div className="py-20 text-center animate-fade-in space-y-4">
          <div className="text-4xl opacity-30">📦</div>
          <p className="text-muted-foreground font-medium">No orders found</p>
          {!isDeliveryTab && onNewOrder && (
            <button
              onClick={onNewOrder}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Add First Order
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-3 sm:space-y-4">
      <div className="flex flex-wrap items-start gap-2 sm:flex-col sm:gap-4">
        <div className="max-w-full shrink-0">
          <MonthSelector
            viewingMonth={viewingMonth}
            setViewingMonth={setViewingMonth}
            activeYear={activeYear}
            setActiveYear={setActiveYear}
            availableMonths={availableMonths}
            selectedMonths={selectedMonths}
            onToggleMonth={onToggleMonth}
          />
        </div>

        <div className="flex w-fit max-w-full shrink-0 items-center justify-start gap-1 rounded-xl border border-border/80 bg-card/90 p-1 shadow-sm sm:w-full sm:justify-between sm:gap-3 sm:rounded-2xl sm:p-3">
          <div className="flex shrink-0 gap-0.5 rounded-lg bg-secondary/70 p-0.5 sm:gap-2 sm:rounded-xl sm:p-1.5">
            <button
              onClick={() => setViewMode("table")}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-all sm:h-11 sm:w-11 sm:rounded-lg ${viewMode === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-card"}`}
            >
              <FileText size={16} className="sm:h-[18px] sm:w-[18px]" />
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-all sm:h-11 sm:w-11 sm:rounded-lg ${viewMode === "gallery" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-card"}`}
            >
              <Package size={16} className="sm:h-[18px] sm:w-[18px]" />
            </button>
            {!isDeliveryTab && (
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  setSelectedOrders(new Set());
                }}
                className={`ml-0.5 flex h-8 w-8 items-center justify-center rounded-md border transition-all sm:ml-1 sm:h-11 sm:w-11 sm:rounded-lg ${isSelectMode ? "bg-primary text-primary-foreground border-primary shadow-sm" : "text-muted-foreground border-border/70 hover:bg-card"}`}
                title="Select mode for linking orders"
              >
                <Link2 size={16} className="sm:h-[18px] sm:w-[18px]" />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-0.5 sm:flex-wrap sm:gap-1.5">
            <span className="hidden rounded-lg bg-secondary/80 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground sm:mr-2 sm:inline-flex sm:text-xs">
              {orders.length} orders
            </span>
            {isDeliveryTab && (role === "owner" || role === "admin") && (
              <>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="flex items-center justify-center p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-all border border-orange-200"
                  title="Scan QR Code"
                >
                  <Scan size={18} />
                </button>
                <button
                  onClick={handleManualDelivery}
                  className="flex items-center gap-1.5 bg-orange-600 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-700 transition-all shadow-sm"
                >
                  <Plus size={14} /> <span className="hidden sm:inline">Add Delivery</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </>
            )}
            {!isDeliveryTab && (
              <SkuSearch orders={allOrders} onFound={onOrderClick} boxOptions={skuBoxOptions} />
            )}
            {!isDeliveryTab && onNewOrder && (
              <button
                onClick={onNewOrder}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1.5 sm:gap-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-sm"
              >
                <Plus size={14} /> <span className="hidden sm:inline">New Order</span>
                <span className="sm:hidden">New</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {viewMode === "gallery" ? (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
          {groupedOrders.map((group) => {
            const order = group.baseOrder;
            const otherLinkedOrder = getOtherLinkedOrder(order, allOrders);
            const key = group.key;
            const isVerified = verifiedOrders.has(key);
            const warningImageSource = getWarningImageSource(order as any);
            const hasWarningImage = !!warningImageSource;
            const isMissing = missingOrders.has(key) || hasWarningImage;
            const status = getOrderStatus(order);
            const individualPrice = getCustomerTotalPrice(order, allOrders);
            const isFree = isOrderFree(order);
            const senderLabel = canViewSubmittedBy ? getOrderSenderLabel(order) : "";
            const primaryImgs = getPrimaryImgs(order);

            return (
              <React.Fragment key={key}>
                <div
                  onClick={(e) => {
                    if (isSelectMode) {
                      toggleSelect(order, e);
                      return;
                    }
                    onOrderClick(order);
                  }}
                  className={`bg-card border rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary/35 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group/card ${selectedOrders.has(key) ? "border-primary ring-2 ring-primary/50" : isVerified ? "border-primary/30 ring-1 ring-primary/20" : isMissing ? "border-amber-400/30 ring-1 ring-amber-400/20" : "border-border/80"} ${STATUS_ROW_COLORS[status]}`}
                >
                  <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden relative">
                    {primaryImgs.length > 0 ? (
                      <img
                        src={primaryImgs[0]}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement?.classList.add("bg-green-500/20");
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-green-500/20 flex flex-col items-center justify-center text-green-700/50 group-hover/card:bg-green-500/30 transition-colors">
                        <ImageIcon size={24} className="mb-1 opacity-50" />
                        <span className="text-[10px] font-semibold opacity-70">No Image</span>
                      </div>
                    )}
                    {isSelectMode && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                        {selectedOrders.has(key) && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    )}
                    {!isSelectMode && (
                      <div
                        onClick={(e) => handleMissingClick(order, e)}
                        className={`absolute top-1 left-1 p-1 rounded-full cursor-pointer hover:scale-110 transition-transform ${isMissing ? "bg-amber-400 text-white shadow-md" : "bg-background/80 backdrop-blur-sm text-amber-500/70 hover:bg-amber-400 hover:text-white"}`}
                      >
                        <AlertTriangle size={10} />
                      </div>
                    )}
                    {!isSelectMode && isVerified && (
                      <div className="absolute top-1 right-1 p-1 bg-primary rounded-full">
                        <Heart size={10} className="text-primary-foreground" fill="currentColor" />
                      </div>
                    )}
                    {!isSelectMode && primaryImgs.length > 1 && (
                      <div className="absolute bottom-1 left-1 bg-background/85 backdrop-blur rounded px-1.5 py-0.5 text-[10px] font-bold text-primary shadow-sm">
                        +{primaryImgs.length - 1}
                      </div>
                    )}
                    {!isDeliveryTab && otherLinkedOrder && (
                      <div className="absolute bottom-1 right-1 bg-background/80 backdrop-blur rounded p-1 flex items-center gap-1 shadow-sm">
                        <Link2 size={12} className="text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 sm:p-2.5">
                    <div className="mb-1 flex flex-col items-start gap-0.5 sm:flex-row sm:justify-between sm:gap-1">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <CustomerContactLink
                          order={order}
                          className="truncate text-[10px] font-semibold sm:text-sm"
                        />
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        {isFree && (
                          <span className="mb-0.5 rounded bg-green-500/20 px-1 text-[7px] font-bold uppercase text-green-600 sm:text-[9px]">
                            Free
                          </span>
                        )}
                        <span className="whitespace-nowrap text-[10px] font-bold text-primary sm:text-sm">
                          {individualPrice.toLocaleString()} IQD
                        </span>
                      </div>
                    </div>
                    {(order.link || otherLinkedOrder) && (
                      <div className="mb-1.5 hidden gap-1 sm:flex sm:flex-wrap">
                        {order.link && (
                          <a
                            href={orderLinkHref(order.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={10} /> Product Link
                          </a>
                        )}
                        {otherLinkedOrder && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOrderClick(otherLinkedOrder);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] bg-secondary hover:bg-secondary/80 text-foreground px-2 py-0.5 rounded-full font-medium transition-colors"
                          >
                            <Link2 size={10} /> Other Receipt
                          </button>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col items-start gap-0.5 text-[8px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-xs">
                      <span className="truncate">{order.place || "-"}</span>
                      {senderLabel && (
                        <span
                          title={`Taken by ${senderLabel}`}
                          className="max-w-full truncate rounded bg-primary/10 px-1 py-0.5 text-[7px] font-semibold text-primary ring-1 ring-primary/15 sm:shrink-0 sm:px-1.5 sm:text-[9px]"
                        >
                          By {senderLabel}
                        </span>
                      )}
                    </div>
                    {order.note && (
                      <div
                        className="mt-1 hidden truncate rounded bg-secondary/50 px-1.5 py-0.5 text-xs text-muted-foreground sm:block"
                        title={order.note}
                      >
                        Note: {order.note}
                      </div>
                    )}
                    {role === "owner" &&
                      String(order.note || "").includes("[DELIVERY_SCANNED]") && (
                        <button
                          onClick={(e) => handleOwnerConfirmDelivery(order, e)}
                          className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
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
        <div className="bg-card rounded-2xl border border-border/80 overflow-hidden">
          {/* Mobile List */}
          <div className="divide-y divide-border">
            {groupedOrders.map((group) => {
              const order = group.baseOrder;
              const status = getOrderStatus(order);
              const otherLinkedOrder = getOtherLinkedOrder(order, allOrders);
              const individualPrice = getCustomerTotalPrice(order, allOrders);
              const isFree = isOrderFree(order);
              const initial =
                parseFloat(String(order.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;
              const remaining = individualPrice - initial;

              const key = group.key;
              const isVerified = verifiedOrders.has(key);
              const warningImageSource = getWarningImageSource(order as any);
              const hasWarningImage = !!warningImageSource;
              const isMissing = missingOrders.has(key) || hasWarningImage;
              const senderLabel = canViewSubmittedBy ? getOrderSenderLabel(order) : "";
              const primaryImgs = getPrimaryImgs(order);

              return (
                <React.Fragment key={`${key}-m`}>
                  <div
                    className={`p-1.5 sm:p-2 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98] ${selectedOrders.has(key) ? "bg-primary/10" : isVerified ? "bg-primary/5" : isMissing ? "bg-amber-50 dark:bg-amber-500/5" : ""} ${STATUS_ROW_COLORS[status]}`}
                    onClick={(e) => {
                      if (isSelectMode) {
                        toggleSelect(order, e);
                        return;
                      }
                      onOrderClick(order);
                    }}
                  >
                    {/* Select indicator or Missing indicator */}
                    {isSelectMode ? (
                      <div className="shrink-0 w-6 h-6 rounded-full border border-primary flex items-center justify-center bg-background">
                        {selectedOrders.has(key) && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleMissingClick(order, e)}
                        className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all ${isMissing ? "bg-amber-400 text-white" : "bg-secondary text-muted-foreground hover:text-amber-500"}`}
                      >
                        <AlertTriangle size={11} />
                      </button>
                    )}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border relative">
                      {primaryImgs.length > 0 ? (
                        <img
                          src={primaryImgs[0]}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement?.classList.add("bg-green-500/20");
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-green-500/20 flex items-center justify-center text-green-700/50">
                          <ImageIcon size={15} className="opacity-70" />
                        </div>
                      )}
                      {primaryImgs.length > 1 && (
                        <div className="absolute bottom-0 left-0 bg-background/85 px-1 text-[8px] font-bold text-primary">
                          +{primaryImgs.length - 1}
                        </div>
                      )}
                      {!isDeliveryTab && otherLinkedOrder && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-tl p-0.5 shadow-sm">
                          <Link2 size={10} className="text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="mb-0.5 flex min-w-0 items-center gap-1">
                        <CustomerContactLink
                          order={order}
                          className="truncate text-[13px] font-bold leading-tight sm:text-[14px]"
                        />
                      </div>

                      <div className="flex items-center gap-0.5 flex-wrap mb-0.5">
                        {senderLabel && (
                          <span
                            title={`Taken by ${senderLabel}`}
                            className="max-w-[130px] truncate rounded bg-primary/10 px-1 py-0.5 text-[8px] font-semibold text-primary ring-1 ring-primary/15"
                          >
                            By {senderLabel}
                          </span>
                        )}
                        {order.note && (
                          <span className="max-w-[120px] truncate rounded bg-secondary/50 px-1 py-0.5 text-[9px] font-medium text-muted-foreground">
                            Notes: {order.note}
                          </span>
                        )}
                        {!isDeliveryTab && order.sku && (
                          <span className="whitespace-nowrap rounded bg-secondary/50 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
                            SKU: {order.sku}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-muted-foreground leading-tight truncate">
                        {order.date
                          ? order.date
                          : order.orderNo
                            ? `#${cleanOrderNo(order.orderNo)}`
                            : "#Pending"}{" "}
                        · {order.sheet_name}
                      </div>

                      {role === "owner" &&
                        String(order.note || "").includes("[DELIVERY_SCANNED]") && (
                          <button
                            onClick={(e) => handleOwnerConfirmDelivery(order, e)}
                            className="mt-2 h-10 w-full max-w-[160px] bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 rounded-lg text-xs text-center transition-colors shadow-sm"
                          >
                            Confirm Delivery
                          </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="flex flex-col items-center justify-center gap-0">
                        {order.link && (
                          <a
                            href={orderLinkHref(order.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-5 w-5 rounded text-muted-foreground hover:bg-secondary hover:text-primary transition-colors flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                            title="Product Link"
                          >
                            <ExternalLink size={11} />
                          </a>
                        )}
                        {otherLinkedOrder && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOrderClick(otherLinkedOrder);
                            }}
                            className="h-5 w-5 rounded text-muted-foreground hover:bg-secondary hover:text-primary transition-colors flex items-center justify-center"
                            title="Open linked receipt"
                          >
                            <Link2 size={11} />
                          </button>
                        )}
                        <label
                          className="relative flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                          title="Change order status"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px] leading-none" aria-hidden="true">
                            {STATUS_ICONS[status]}
                          </span>
                          <select
                            aria-label="Change order status"
                            value={status}
                            onChange={(e) => {
                              e.stopPropagation();
                              onStatusChange(order, e.target.value);
                            }}
                            className="absolute inset-0 !m-0 !h-5 !min-h-0 !w-5 cursor-pointer appearance-none !border-0 !bg-transparent !p-0 opacity-0 !shadow-none focus:!ring-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_ICONS[s]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          onClick={(e) => handleVerify(order, e)}
                          className={`h-5 w-5 rounded transition-all flex items-center justify-center hover:bg-secondary ${isVerified ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                        >
                          <Heart size={11} fill={isVerified ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="flex min-w-[66px] flex-col items-end justify-center sm:min-w-[76px]">
                        {isFree && (
                          <div className="mb-0.5 rounded bg-green-500/20 px-1 text-[8px] font-bold uppercase leading-tight text-green-600">
                            Free
                          </div>
                        )}
                        <div className="whitespace-nowrap font-bold text-[13px] sm:text-[14px] leading-none tracking-tight">
                          {individualPrice.toLocaleString()}
                        </div>
                        <div
                          className={`mt-0.5 whitespace-nowrap text-[9px] font-bold tracking-tight ${remaining > 0 ? "text-amber-500" : "text-primary"}`}
                        >
                          {remaining > 0 ? `${remaining.toLocaleString()} due` : "✅ Paid"}
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

      {hiddenCount > 0 && (
        <div className="flex flex-col items-center gap-2 py-4">
          <span className="text-xs text-muted-foreground">
            Showing {groupedOrders.length} of {allGroupedOrders.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setVisibleCount((n) => n + ROWS_PER_PAGE)}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Show {Math.min(hiddenCount, ROWS_PER_PAGE)} more
            </button>
            {hiddenCount > ROWS_PER_PAGE && (
              <button
                onClick={() => setVisibleCount(allGroupedOrders.length)}
                className="rounded-xl border border-border/80 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Show all {allGroupedOrders.length}
              </button>
            )}
          </div>
        </div>
      )}

      {isSelectMode && selectedOrders.size > 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 pr-4 z-50">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-xl flex items-center gap-4">
            <span className="font-medium whitespace-nowrap">
              {selectedOrders.size} orders selected
            </span>
            <button
              disabled={isLinking}
              onClick={handleLinkOrders}
              className="bg-background text-primary px-4 py-1.5 rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
            >
              {isLinking ? "Linking..." : "Link Orders"}
            </button>
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedOrders(new Set());
              }}
              className="p-1 hover:bg-background/20 rounded-full transition-colors ml-2"
            >
              <Plus size={20} className="rotate-45" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Missing File Hidden Input */}
      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        className="hidden"
        onChange={handleMissingImageChange}
      />

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
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setViewImageModal(null)}
          />
          <div className="relative z-10 p-4 max-h-screen flex flex-col items-center max-w-2xl w-full">
            <button
              onClick={() => setViewImageModal(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-amber-400 transition-colors"
            >
              <X size={28} />
            </button>
            <div className="bg-secondary/50 p-2 rounded-xl border border-border/50">
              <img
                src={getWarningImageSource(
                  (orders.find((o) => `${o.id}-${o.sheet_name}` === viewImageModal) || {}) as any,
                  missingImages[viewImageModal],
                )}
                alt="Warning"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="mt-8 flex gap-4 w-full justify-center">
              <button
                onClick={() => {
                  const keyToDel = viewImageModal;
                  setViewImageModal(null);
                  const orderO = orders.find((o) => `${o.id}-${o.sheet_name}` === keyToDel);
                  if (orderO) {
                    toggleMissing(orderO, keyToDel, false);
                    if (onUpdateOrder) {
                      onUpdateOrder(orderO.id, orderO.sheet_name, {
                        warningBase64: undefined,
                        warningImageUrl: undefined,
                      });
                    }
                  }
                }}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <AlertTriangle size={18} />
                Unmark Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {showQRScanner && (
        <React.Suspense fallback={null}>
          <QRScannerModal onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />
        </React.Suspense>
      )}
    </div>
  );
};

export default OrderListView;
