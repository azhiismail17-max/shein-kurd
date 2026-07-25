export const normalizeImageSource = (value: unknown): string => {
  if (Array.isArray(value)) {
    return normalizeImageSource(value.find(Boolean));
  }

  const raw = String(value || "").trim();
  if (!raw) return "";

  const imageFormulaMatch = raw.match(/=\s*IMAGE\s*\(\s*"([^"]+)"/i);
  if (imageFormulaMatch?.[1]) return imageFormulaMatch[1];

  const quotedUrlMatch = raw.match(/"(https?:\/\/[^"]+)"/i);
  if (quotedUrlMatch?.[1]) return quotedUrlMatch[1];

  const urlMatch = raw.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch?.[0]) return urlMatch[0];

  if (raw.startsWith("data:")) return raw;
  if (raw.length > 100) return `data:image/jpeg;base64,${raw}`;

  return raw;
};

export const getWarningImageSource = (order: Record<string, unknown>, fallback?: unknown): string =>
  normalizeImageSource(order.warningImageUrl) ||
  normalizeImageSource(order.warningBase64) ||
  normalizeImageSource(order.warning_url) ||
  normalizeImageSource(order.warning_image_url) ||
  normalizeImageSource(order.warningImageURL) ||
  normalizeImageSource(order.warningImage) ||
  normalizeImageSource(order.warning_image) ||
  normalizeImageSource(order.warning_picture) ||
  normalizeImageSource(order.warning_picture_url) ||
  normalizeImageSource(order.missing_image) ||
  normalizeImageSource(order.missing_image_url) ||
  normalizeImageSource(order.missingImage) ||
  normalizeImageSource(order.missingImageUrl) ||
  normalizeImageSource(order.warning) ||
  normalizeImageSource(order.y) ||
  normalizeImageSource(order.column_y) ||
  normalizeImageSource(order.image_y) ||
  normalizeImageSource(fallback);
