export interface BoxLinkMedia {
  pictures: string[];
  warnings: string[];
}

const BOX_LINK_MEDIA_PREFIX = "BOX_MEDIA_V1:";

const cleanUrls = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
};

export const parseBoxLinkMedia = (value?: string | null): BoxLinkMedia => {
  const raw = String(value || "").trim();
  if (!raw) return { pictures: [], warnings: [] };

  if (raw.startsWith(BOX_LINK_MEDIA_PREFIX)) {
    try {
      const parsed = JSON.parse(raw.slice(BOX_LINK_MEDIA_PREFIX.length));
      return {
        pictures: cleanUrls(parsed?.pictures),
        warnings: cleanUrls(parsed?.warnings),
      };
    } catch {
      return { pictures: [], warnings: [] };
    }
  }

  // Backward compatibility for boxes that already have one saved picture URL.
  return { pictures: [raw], warnings: [] };
};

export const serializeBoxLinkMedia = ({ pictures, warnings }: BoxLinkMedia): string => {
  const cleanPictures = cleanUrls(pictures);
  const cleanWarnings = cleanUrls(warnings);

  if (cleanWarnings.length === 0 && cleanPictures.length <= 1) {
    return cleanPictures[0] || "";
  }

  return `${BOX_LINK_MEDIA_PREFIX}${JSON.stringify({ pictures: cleanPictures, warnings: cleanWarnings })}`;
};
