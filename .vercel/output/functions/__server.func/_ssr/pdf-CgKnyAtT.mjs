import { j as jspdf_node_minExports } from "../_libs/jspdf.mjs";
import { Q as QRCode } from "../_libs/qrcode.mjs";
import { getLinkedOrdersInfo, getDisplayPrice, isOrderFree } from "./order-utils-fqXvoRHs.mjs";
import "../_libs/react.mjs";
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "fs";
import "path";
import "../_libs/html2canvas.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
import "../_libs/dijkstrajs.mjs";
import "../_libs/pngjs.mjs";
import "assert";
import "buffer";
import "util";
import "stream";
import "zlib";
const generateOrderPdfPage = async (doc, order, allOrders) => {
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
    isFree
  } = getLinkedOrdersInfo(order, allOrders);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, margin, w - margin * 2, h - margin * 2, 4, 4, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SHEIN KURDISTANI", w / 2, y, { align: "center" });
  y += 6;
  doc.setTextColor(113, 113, 122);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateStr = order.date?.split(" ")[0] || (/* @__PURE__ */ new Date()).toLocaleDateString();
  const orderIndex = allOrders.findIndex((o) => o.id === order.id && o.sheet_name === order.sheet_name) + 1;
  const orderNoStr = orderIndex > 0 ? String(orderIndex) : String(order.orderNo || order.id);
  doc.text(`${dateStr}   •   #${orderNoStr}`, w / 2, y, { align: "center" });
  y += 7;
  doc.setDrawColor(212, 212, 216);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(margin + 5, y, w - margin - 5, y);
  doc.setLineDashPattern([], 0);
  y += 7;
  const rows = [
    { label: "Customer", value: order.name || "-" },
    { label: "Instagram", value: `@${order.insta || "-"}`, accent: true },
    { label: "Phone", value: order.phone || "-" },
    { label: "Location", value: order.place || "-" },
    { label: "SKU Qty", value: String(order.pics_text || "1") }
  ];
  if (linkedOrders.length === 0) {
    rows.push({ label: "Item Price", value: `${basePrice.toLocaleString()} IQD` });
  } else {
    rows.push({ label: "Item Price", value: `${basePrice.toLocaleString()} IQD` });
    linkedOrders.forEach((lo) => {
      rows.push({
        label: `Linked: ${lo.name || lo.insta}`,
        value: `${getDisplayPrice(lo).toLocaleString()} IQD`
      });
    });
    rows.push({ label: "All Items Total", value: `${combinedPrice.toLocaleString()} IQD`, accent: true });
  }
  rows.push({ label: "Shipping", value: isFree ? "Free Ship (0 IQD)" : `${shipping.toLocaleString()} IQD` });
  rows.push({ label: "Advance Paid", value: `${combinedInitial.toLocaleString()} IQD`, accent: true });
  rows.forEach((row, index) => {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(113, 113, 122);
    doc.text(row.label, margin + 5, y);
    doc.setFont("helvetica", "bold");
    if (row.accent) {
      doc.setTextColor(15, 118, 110);
    } else {
      doc.setTextColor(24, 24, 27);
    }
    doc.text(row.value, w - margin - 5, y, { align: "right" });
    y += 6.5;
    if (index < rows.length - 1) {
      doc.setDrawColor(228, 228, 231);
      doc.line(margin + 5, y - 3.25, w - margin - 5, y - 3.25);
    }
  });
  y += 1;
  doc.setDrawColor(212, 212, 216);
  doc.setLineWidth(0.5);
  doc.line(margin + 5, y, w - margin - 5, y);
  doc.setLineWidth(0.2);
  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 24, 27);
  doc.text("Remaining", margin + 5, y);
  doc.setFontSize(15);
  if (remaining > 0) {
    doc.setTextColor(217, 119, 6);
  } else {
    doc.setTextColor(15, 118, 110);
  }
  doc.text(`${remaining.toLocaleString()} IQD`, w - margin - 5, y, { align: "right" });
  y += 5;
  if (isOrderFree(order) || linkedOrders.some((lo) => isOrderFree(lo))) {
    doc.setFontSize(8);
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.text("FREE DELIVERY", w - margin - 5, y, { align: "right" });
  }
  y += 5;
  try {
    const qrText = `Order: ${orderNoStr}
Location: ${order.place || "-"}
Insta: ${order.insta || "-"}
Phone: ${order.phone || "-"}
Total: ${remaining.toLocaleString()} IQD`;
    const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 0, width: 60 });
    const qrSize = 15;
    doc.addImage(qrDataUrl, "PNG", (w - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize + 5;
  } catch (e) {
    console.warn("QR Code generation failed", e);
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(113, 113, 122);
  doc.text("shein_.kurdistani", w / 2, y, { align: "center" });
  y += 4;
  doc.text("07519388485", w / 2, y, { align: "center" });
};
const generateSingleOrderPdf = async (order, allOrders) => {
  const doc = new jspdf_node_minExports.jsPDF({ unit: "mm", format: [80, 130] });
  await generateOrderPdfPage(doc, order, allOrders);
  doc.save(`${order.insta || order.name || "Receipt"}_${order.id}.pdf`);
};
const generateBatchPdf = async (boxName, orders, allOrders) => {
  const doc = new jspdf_node_minExports.jsPDF({ unit: "mm", format: [80, 130] });
  for (let i = 0; i < orders.length; i++) {
    if (i > 0) doc.addPage();
    await generateOrderPdfPage(doc, orders[i], allOrders);
  }
  doc.save(`${boxName}_All.pdf`);
};
export {
  generateBatchPdf,
  generateOrderPdfPage,
  generateSingleOrderPdf
};
