const uploadToImgBB = async (file) => {
  const compressedFile = await compressImage(file);
  const apiKey = "3c43400a3770b8fc733935ff82e816fc";
  const formData = new FormData();
  formData.append("image", compressedFile, file.name || "image.jpg");
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData
  });
  const data = await response.json();
  if (data.data?.url) return data.data.url;
  throw new Error("Failed to upload image");
};
const fileToBase64 = async (file) => {
  const compressedFile = await compressImage(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
};
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;
        if (width > height && width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.6
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};
function cleanOrderNo(orderNo) {
  if (!orderNo) return "";
  return String(orderNo).replace(/\[(?:PENDING|APPROVED|ARRIVED|CANCELLED)\]/gi, "").replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
}
function getBoxName(order) {
  let raw = "";
  if (order.box_name) raw = String(order.box_name).trim();
  else {
    const text = `${order.note || ""} ${order.extra || ""}`;
    const match = text.match(/box\s*(\d+)/i);
    if (match) raw = match[1];
  }
  if (raw.toLowerCase().startsWith("box ")) return raw.substring(4).trim();
  if (raw.toLowerCase().startsWith("box")) return raw.substring(3).trim();
  return raw;
}
function isOrderFree(order) {
  const checkFree = (str) => str.toLowerCase().includes("free") || str.toLowerCase().includes("[zero_ship]");
  return checkFree(String(order.extra || "")) || checkFree(String(order.note || ""));
}
function getRegionShipping(place) {
  const p = String(place || "").toLowerCase();
  if (!p || p.includes("no location")) return 0;
  const isErbil = (p.includes("erbil") || p.includes("hawler") || p.includes("hewler") || p.includes("هەولێر")) && !p.includes("outside erbil");
  if (isErbil) return 3e3;
  if (p.includes("iraq") || p.includes("baghdad") || p.includes("basra") || p.includes("outside kurdistan")) return 6e3;
  return 5e3;
}
function hasZeroShipMarker(order) {
  return /\[zero_ship\]/i.test(String(order.note || "") + " " + String(order.extra || ""));
}
function getLinkedGroup(order, allOrders) {
  const clusterIds = /* @__PURE__ */ new Set();
  clusterIds.add(String(order.id));
  if (order.linkedOrderIds) {
    order.linkedOrderIds.forEach((id) => clusterIds.add(String(id).split(":")[0]));
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const o of allOrders) {
      if (o.sheet_name !== order.sheet_name) continue;
      const idStr = String(o.id);
      const oHasMatch = clusterIds.has(idStr) || o.linkedOrderIds?.some((l) => clusterIds.has(String(l).split(":")[0]));
      if (oHasMatch) {
        if (!clusterIds.has(idStr)) {
          clusterIds.add(idStr);
          changed = true;
        }
        if (o.linkedOrderIds) {
          for (const lId of o.linkedOrderIds) {
            const rawId = String(lId).split(":")[0];
            if (!clusterIds.has(rawId)) {
              clusterIds.add(rawId);
              changed = true;
            }
          }
        }
      }
    }
  }
  const result = allOrders.filter((o) => o.sheet_name === order.sheet_name && clusterIds.has(String(o.id)));
  return result.sort((a, b) => Number(a.id) - Number(b.id));
}
function getDisplayPrice(order, allOrders) {
  const rawPrice = parseFloat(String(order.price).replace(/[^0-9.-]+/g, "")) || 0;
  if (isOrderFree(order)) {
    return rawPrice + getShippingAmount(order.shipping_cost, order.place);
  }
  return rawPrice;
}
function getShippingAmount(shippingCost, place) {
  const savedShipping = Math.abs(parseFloat(String(shippingCost || "").replace(/[^0-9.-]+/g, "")) || 0);
  return savedShipping || getRegionShipping(place);
}
function getSheetPriceForSave(price, place, freeShipping, shippingCost) {
  const customerPrice = parseFloat(String(price || "").replace(/[^0-9.-]+/g, "")) || 0;
  if (!freeShipping) return customerPrice;
  return customerPrice - getShippingAmount(shippingCost, place);
}
function getOrderShipping(order) {
  const placeLower = String(order.place || "").toLowerCase();
  if (placeLower.includes("no location")) return 0;
  return getRegionShipping(order.place);
}
function getCustomerTotalPrice(order, allOrders) {
  return isOrderFree(order) ? getDisplayPrice(order) : getDisplayPrice(order) + getOrderShipping(order);
}
function getLinkedOrdersInfo(order, allOrders) {
  const linkedOrders = getLinkedGroup(order, allOrders).filter((o) => o.id !== order.id || o.sheet_name !== order.sheet_name);
  const basePrice = getDisplayPrice(order);
  const baseInitial = parseFloat(String(order.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;
  let combinedPrice = basePrice;
  let combinedInitial = baseInitial;
  linkedOrders.forEach((lo) => {
    combinedPrice += getDisplayPrice(lo);
    combinedInitial += parseFloat(String(lo.initial_payment).replace(/[^0-9.-]+/g, "")) || 0;
  });
  const isFree = isOrderFree(order) || linkedOrders.some((lo) => isOrderFree(lo));
  const shipping = getOrderShipping(order);
  const total = combinedPrice + (isFree ? 0 : shipping);
  const remaining = total - combinedInitial;
  return { linkedOrders, combinedPrice, combinedInitial, shipping, total, remaining, basePrice, baseInitial, isFree };
}
export {
  cleanOrderNo,
  fileToBase64,
  getBoxName,
  getCustomerTotalPrice,
  getDisplayPrice,
  getLinkedGroup,
  getLinkedOrdersInfo,
  getOrderShipping,
  getRegionShipping,
  getSheetPriceForSave,
  getShippingAmount,
  hasZeroShipMarker,
  isOrderFree,
  uploadToImgBB
};
