import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Order } from "@/iraqi/types";
import { getLinkedOrdersInfo, getDisplayPrice, isOrderFree } from "./order-utils";

export const generateOrderPdfPage = async (doc: jsPDF, order: Order, allOrders: Order[]) => {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const margin = 4;
  let y = margin + 8;

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

  // Draw background card (light gray)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, margin, w - margin * 2, h - margin * 2, 4, 4, "F");

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SHEIN KURDISTANI", w / 2, y, { align: "center" });
  y += 6;

  // Date and Order No
  doc.setTextColor(113, 113, 122); // zinc-500
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateStr = order.date?.split(" ")[0] || new Date().toLocaleDateString();

  const orderNoStr = String(order.id || order.orderNo || "Pending");

  doc.text(`${dateStr}   •   #${orderNoStr}`, w / 2, y, { align: "center" });
  y += 7;

  // Dashed line
  doc.setDrawColor(212, 212, 216); // zinc-300
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(margin + 5, y, w - margin - 5, y);
  doc.setLineDashPattern([], 0);
  y += 7;

  // Details
  const rows: { label: string; value: string; accent?: boolean }[] = [
    { label: "Order ID", value: orderNoStr, accent: true },
    { label: "Customer", value: order.name || "-" },
    { label: "Instagram", value: `@${order.insta || "-"}`, accent: true },
    { label: "Phone", value: order.phone || "-" },
    { label: "Location", value: order.place || "-" },
    { label: "SKU Qty", value: String(order.pics_text || "1") },
  ];

  if (linkedOrders.length === 0) {
    rows.push({ label: "Item Price", value: `${basePrice.toLocaleString()} IQD` });
  } else {
    // Show base order item price
    rows.push({ label: "Item Price", value: `${basePrice.toLocaleString()} IQD` });
    // Show linked order item prices
    linkedOrders.forEach((lo) => {
      rows.push({
        label: `Linked: ${lo.name || lo.insta}`,
        value: `${getDisplayPrice(lo, linkedOrders).toLocaleString()} IQD`,
      });
    });
    // Show a subtotal line for all items
    rows.push({
      label: "All Items Total",
      value: `${combinedPrice.toLocaleString()} IQD`,
      accent: true,
    });
  }

  rows.push({
    label: "Shipping",
    value: isFree ? "Free Ship (0 IQD)" : `${shipping.toLocaleString()} IQD`,
  });
  rows.push({
    label: "Advance Paid",
    value: `${combinedInitial.toLocaleString()} IQD`,
    accent: true,
  });

  const compactScale = Math.max(0.78, Math.min(1, 8 / rows.length));
  const rowFontSize = 9.5 * compactScale;
  const rowGap = 6.5 * compactScale;
  const dividerOffset = rowGap / 2;
  const labelMaxWidth = w * 0.46;
  const truncateToWidth = (text: string, maxWidth: number) => {
    if (doc.getTextWidth(text) <= maxWidth) return text;
    let trimmed = text;
    while (trimmed.length > 1 && doc.getTextWidth(`${trimmed}...`) > maxWidth) {
      trimmed = trimmed.slice(0, -1);
    }
    return `${trimmed}...`;
  };

  rows.forEach((row, index) => {
    doc.setFontSize(rowFontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text(truncateToWidth(row.label, labelMaxWidth), margin + 5, y);

    doc.setFont("helvetica", "bold");
    if (row.accent) {
      doc.setTextColor(107, 15, 20); // Iraqi primary
    } else {
      doc.setTextColor(24, 24, 27); // zinc-900
    }
    doc.text(truncateToWidth(row.value, labelMaxWidth), w - margin - 5, y, { align: "right" });
    y += rowGap;

    // Light line between rows (skip after the last row to avoid double line)
    if (index < rows.length - 1) {
      doc.setDrawColor(228, 228, 231); // zinc-200
      doc.line(margin + 5, y - dividerOffset, w - margin - 5, y - dividerOffset);
    }
  });

  // Thick line
  y += 1;
  doc.setDrawColor(212, 212, 216); // zinc-300
  doc.setLineWidth(0.5);
  doc.line(margin + 5, y, w - margin - 5, y);
  doc.setLineWidth(0.2); // reset
  y += 8 * compactScale;

  // Remaining
  doc.setFontSize(12 * compactScale);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 24, 27); // zinc-900
  doc.text("Remaining", margin + 5, y);

  doc.setFontSize(15 * compactScale);
  if (remaining > 0) {
    doc.setTextColor(217, 119, 6); // amber-600
  } else {
    doc.setTextColor(107, 15, 20); // Iraqi primary
  }
  doc.text(`${remaining.toLocaleString()} IQD`, w - margin - 5, y, { align: "right" });
  y += 5;

  if (isOrderFree(order) || linkedOrders.some((lo) => isOrderFree(lo))) {
    doc.setFontSize(8 * compactScale);
    doc.setTextColor(107, 15, 20); // Iraqi primary
    doc.setFont("helvetica", "bold");
    doc.text("FREE DELIVERY", w - margin - 5, y, { align: "right" });
  }

  y += 5;

  // QR Code
  try {
    const qrText = `Order: ${orderNoStr}\nLocation: ${order.place || "-"}\nInsta: ${order.insta || "-"}\nPhone: ${order.phone || "-"}\nTotal: ${remaining.toLocaleString()} IQD`;
    const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 0, width: 60 });
    const qrSize = 15 * compactScale;
    doc.addImage(qrDataUrl, "PNG", (w - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize + 5;
  } catch (e) {
    console.warn("QR Code generation failed", e);
  }

  // Footer
  doc.setFontSize(8 * compactScale);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(113, 113, 122); // zinc-500
  doc.text("shein_.kurdistani", w / 2, y, { align: "center" });
  y += 4;
  doc.text("07519388485", w / 2, y, { align: "center" });
};

export const generateSingleOrderPdf = async (order: Order, allOrders: Order[]) => {
  const doc = new jsPDF({ unit: "mm", format: [80, 130] });
  await generateOrderPdfPage(doc, order, allOrders);
  doc.save(`${order.insta || order.name || "Receipt"}_${order.id}.pdf`);
};

export const generateBatchPdf = async (boxName: string, orders: Order[], allOrders: Order[]) => {
  const doc = new jsPDF({ unit: "mm", format: [80, 130] });
  for (let i = 0; i < orders.length; i++) {
    if (i > 0) doc.addPage();
    await generateOrderPdfPage(doc, orders[i], allOrders);
  }
  doc.save(`${boxName}_All.pdf`);
};
