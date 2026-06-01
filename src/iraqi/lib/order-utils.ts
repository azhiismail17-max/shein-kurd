import { Order } from '@/iraqi/types';

export const uploadToImgBB = async (file: File): Promise<string> => {
  // Compress image to max 1200px width/height and 0.7 quality to be lightning fast
  const compressedFile = await compressImage(file);
  
  const apiKey = "3c43400a3770b8fc733935ff82e816fc"; // App's standard API key
  const formData = new FormData();
  formData.append("image", compressedFile, file.name || 'image.jpg');

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (data.data?.url) return data.data.url;
  throw new Error("Failed to upload image");
};

export const fileToBase64 = async (file: File): Promise<string> => {
  const compressedFile = await compressImage(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
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
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // fallback
            }
          },
          'image/jpeg',
          0.6
        );
      };
      img.onerror = () => resolve(file); // fallback
    };
    reader.onerror = () => resolve(file); // fallback
  });
};

export function cleanOrderNo(orderNo: string | number | undefined): string {
  if (!orderNo) return '';
  return String(orderNo)
    .replace(/\[(?:PENDING|APPROVED|ARRIVED|CANCELLED)\]/gi, '')
    .replace(/\s*\|\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getBoxName(order: Order): string {
  let raw = '';
  if (order.box_name) raw = String(order.box_name).trim();
  else {
    const text = `${order.note || ''} ${order.extra || ''}`;
    const match = text.match(/box\s*(\d+)/i);
    if (match) raw = match[1];
  }
  
  if (raw.toLowerCase().startsWith('box ')) return raw.substring(4).trim();
  if (raw.toLowerCase().startsWith('box')) return raw.substring(3).trim();
  return raw;
}

export function isOrderFree(order: Order): boolean {
  const checkFree = (str: string) => str.toLowerCase().includes('free') || str.toLowerCase().includes('[zero_ship]');
  return checkFree(String(order.extra || '')) || checkFree(String(order.note || ''));
}

/**
 * Compute the standard shipping cost for a place string.
 * Mirrors the region pricing used by the order form.
 */
export function getRegionShipping(place: string | undefined | null): number {
  const p = String(place || '').toLowerCase();
  if (!p || p.includes('no location')) return 0;
  const isErbil = (p.includes('erbil') || p.includes('hawler') || p.includes('hewler') || p.includes('هەولێر')) && !p.includes('outside erbil');
  if (isErbil) return 3000;
  if (p.includes('iraq') || p.includes('baghdad') || p.includes('basra') || p.includes('outside kurdistan')) return 6000;
  return 5000;
}

export function getLinkedGroup(order: Order, allOrders: Order[]): Order[] {
  // Connected Components clustering to handle any chain of linkedOrderIds
  const clusterIds = new Set<string>();
  clusterIds.add(String(order.id));
  if (order.linkedOrderIds) {
    order.linkedOrderIds.forEach(id => clusterIds.add(String(id).split(':')[0])); 
  }
  
  let changed = true;
  while (changed) {
    changed = false;
    for (const o of allOrders) {
      if (o.sheet_name !== order.sheet_name) continue; // Linked orders are within the same sheet
      
      const idStr = String(o.id);
      const oHasMatch = clusterIds.has(idStr) || o.linkedOrderIds?.some(l => clusterIds.has(String(l).split(':')[0]));
      
      if (oHasMatch) {
        if (!clusterIds.has(idStr)) {
          clusterIds.add(idStr);
          changed = true;
        }
        if (o.linkedOrderIds) {
          for (const lId of o.linkedOrderIds) {
            const rawId = String(lId).split(':')[0];
            if (!clusterIds.has(rawId)) {
              clusterIds.add(rawId);
              changed = true;
            }
          }
        }
      }
    }
  }

  // Preserve consistent order (often ID ascending)
  const result = allOrders.filter(o => o.sheet_name === order.sheet_name && clusterIds.has(String(o.id)));
  return result.sort((a, b) => Number(a.id) - Number(b.id));
}

export function getDisplayPrice(order: Order, allOrders?: Order[]): number {
  const rawPrice = parseFloat(String(order.price).replace(/[^0-9.-]+/g, '')) || 0;
  if (isOrderFree(order)) {
    return rawPrice + getRegionShipping(order.place);
  }
  return rawPrice;
}

export function getOrderShipping(order: Order): number {
  const placeLower = String(order.place || '').toLowerCase();
  if (placeLower.includes('no location')) return 0;

  const explicitShipping = Number(String(order.shipping_cost || '').replace(/[^0-9.-]+/g, ''));
  if (Number.isFinite(explicitShipping) && explicitShipping !== 0) return Math.abs(explicitShipping);

  return getRegionShipping(order.place);
}

export function getCustomerTotalPrice(order: Order, allOrders?: Order[]): number {
  return isOrderFree(order) ? getDisplayPrice(order, allOrders) : getDisplayPrice(order, allOrders) + getOrderShipping(order);
}

export function getLinkedOrdersInfo(order: Order, allOrders: Order[]) {
  const linkedOrders = getLinkedGroup(order, allOrders).filter(o => o.id !== order.id || o.sheet_name !== order.sheet_name);

  const basePrice = getDisplayPrice(order, allOrders);
  const baseInitial = parseFloat(String(order.initial_payment).replace(/[^0-9.-]+/g, '')) || 0;
  
  let combinedPrice = basePrice;
  let combinedInitial = baseInitial;
  
  linkedOrders.forEach(lo => {
    combinedPrice += getDisplayPrice(lo, allOrders);
    combinedInitial += parseFloat(String(lo.initial_payment).replace(/[^0-9.-]+/g, '')) || 0;
  });

  const isFree = isOrderFree(order) || linkedOrders.some(lo => isOrderFree(lo));
  
  const explicitShippingOrder = [order, ...linkedOrders].find(o => {
    const value = Number(String(o.shipping_cost || '').replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(value) && value !== 0;
  });
  const shipping = explicitShippingOrder ? Math.abs(Number(String(explicitShippingOrder.shipping_cost).replace(/[^0-9.-]+/g, ''))) : getOrderShipping(order);

  const total = combinedPrice + (isFree ? 0 : shipping);
  const remaining = total - combinedInitial;

  return { linkedOrders, combinedPrice, combinedInitial, shipping, total, remaining, basePrice, baseInitial, isFree };
}
