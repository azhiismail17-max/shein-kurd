/** Newline for the multi-line upload report. */
const BREAK = String.fromCharCode(10);

import type { ImageKind } from "@/lib/image-store";
import { uploadOrderImages } from "@/lib/image-store";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Order, SCRIPT_URL, getOrderStatus, STATUS_COLORS } from "@/types";
import { findAutoBoxName } from "@/lib/autoBox";
import {
  getDisplayPrice,
  getSheetPriceForSave,
  carriesFreeShippingMark,
  isOrderFree,
  isSameCustomer,
  fileToBase64,
} from "@/lib/order-utils";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { queueOrderForSkuExtraction } from "@/lib/sku-queue";
import { recordOrderCreated, resolveTeamUsername } from "@/lib/teamActivity";
import { ChevronLeft, Upload, X, Sparkles, Link2, Eye } from "lucide-react";
import { submitKurdistaniOrder, updateOrderEverywhere } from "@/lib/submitOrder";
import { toast } from "sonner";

interface OrderFormViewProps {
  activeSheet: string;
  editingOrder: Order | null;
  onCancel: () => void;
  onSuccess: (payload?: any, rowIdStr?: string) => void;
  allOrders: Order[];
}

type Region =
  | "erbil"
  | "outside_erbil"
  | "outside_kurdistan"
  | "sulaymani"
  | "duhok"
  | "kirkuk"
  | "zaxo"
  | "no_location"
  | "";

const deriveRegionFromPlace = (placeValue: string | undefined | null): Region => {
  const place = String(placeValue || "").toLowerCase();
  if (place.includes("no location")) return "no_location";
  if (place.includes("outside erbil")) return "outside_erbil";
  if (place.includes("iraq")) return "outside_kurdistan";
  if (place.includes("sulaymani")) return "sulaymani";
  if (place.includes("duhok")) return "duhok";
  if (place.includes("kirkuk")) return "kirkuk";
  if (place.includes("zaxo") || place.includes("zakho")) return "zaxo";
  if (place.includes("erbil") || place.includes("hawler") || place.includes("هەولێر"))
    return "erbil";
  if (
    place.includes("halabja") ||
    place.includes("koya") ||
    place.includes("ranya") ||
    place.includes("soran")
  )
    return "outside_erbil";
  if (place) return "outside_erbil";
  return "";
};

const normalizePhoneDigits = (value: unknown) =>
  String(value || "")
    .split("/")
    .map((part) => {
      let digits = part.replace(/\D/g, "");
      if (digits.startsWith("00964")) digits = `0${digits.slice(5)}`;
      else if (digits.startsWith("964")) digits = `0${digits.slice(3)}`;
      else if (digits.startsWith("7")) digits = `0${digits}`;
      return digits.replace(/^0+/, "");
    })
    .filter(Boolean);

/**
 * The money columns are `bigint`, so a value that is not a whole number is sent as
 * null rather than being reduced to its digits — that would store an amount nobody
 * typed.
 */
function toWholeNumber(raw: unknown): number | null {
  if (raw === "" || raw === null || raw === undefined) return null;
  const cleaned = String(raw).trim().replace(/[,\s]/g, "");
  if (!/^-?\d+(\.0+)?$/.test(cleaned)) return null;
  const value = Math.trunc(Number(cleaned));
  return Number.isSafeInteger(value) ? value : null;
}

const OrderFormView: React.FC<OrderFormViewProps> = ({
  activeSheet,
  editingOrder,
  onCancel,
  onSuccess,
  allOrders,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [primaryFiles, setPrimaryFiles] = useState<File[]>([]);
  const [existingPrimaryUrls, setExistingPrimaryUrls] = useState<string[]>([]);
  const [previewPrimaryUrls, setPreviewPrimaryUrls] = useState<string[]>([]);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [existingProofUrls, setExistingProofUrls] = useState<string[]>([]);
  const [previewProofUrls, setPreviewProofUrls] = useState<string[]>([]);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Order>>({
    sheet_name: activeSheet,
    insta: "",
    name: "",
    link: "",
    place: "",
    price: "",
    initial_payment: "0",
    phone: "",
    phone2: "",
    pics_text: "1",
    note: "",
    box_cost: "",
  });
  const [region, setRegion] = useState<Region>("");

  const isEditing = !!editingOrder;

  useEffect(() => {
    const saved = localStorage.getItem("last_region") as Region;
    if (saved && !isEditing) {
      setRegion(saved);
    }
  }, [isEditing]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loyaltyCount, setLoyaltyCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Order[]>([]);
  const [freeShipping, setFreeShipping] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const [linkedIds, setLinkedIds] = useState<(string | number)[]>([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState<"insta" | "name" | "phone">(
    "insta",
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const proofFileRef = useRef<HTMLInputElement>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);
  const initialLinkedIdsRef = useRef<(string | number)[]>([]);
  const linkSelectionTouchedRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionContainerRef.current &&
        !suggestionContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Build a unique customer database from all orders across all sheets
  const customerDb = useMemo(() => {
    const map = new Map<
      string,
      {
        insta: string;
        name: string;
        phone: string;
        phone2: string;
        place: string;
        pics_text: string;
      }
    >();
    allOrders.forEach((o) => {
      const insta = String(o.insta || "")
        .trim()
        .toLowerCase();
      const name = String(o.name || "")
        .trim()
        .toLowerCase();
      const phone = String(o.phone || "").trim();
      const key = insta || phone || name;
      if (key && !map.has(key)) {
        map.set(key, {
          insta: String(o.insta || ""),
          name: String(o.name || ""),
          phone: String(o.phone || "")
            .split("/")[0]
            .trim(),
          phone2: String(o.phone2 || ""),
          place: String(o.place || ""),
          pics_text: String(o.pics_text || "1"),
        });
      }
    });
    return Array.from(map.values());
  }, [allOrders]);

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        ...editingOrder,
        price: getDisplayPrice(editingOrder, allOrders).toString(),
      });
      setRegion(deriveRegionFromPlace(editingOrder.place));
      setFreeShipping(isOrderFree(editingOrder));

      const formatImg = (img: string) => {
        if (img.startsWith("http") || img.startsWith("data:")) return img;
        if (img.length > 100) return `data:image/jpeg;base64,${img}`;
        return img;
      };

      // Support new primary_urls
      let primaryUrlArray = editingOrder.primary_urls
        ? String(editingOrder.primary_urls).split(",").filter(Boolean)
        : [];
      primaryUrlArray = primaryUrlArray.map(formatImg);

      setExistingPrimaryUrls(primaryUrlArray);

      // Load proof images from BOTH proof_urls (X col) and image_url fallback (W formula),
      // so editing an order never accidentally wipes the proof picture on save.
      let proofUrlArray: string[] = [];
      if (editingOrder.proof_urls) {
        proofUrlArray = (
          Array.isArray(editingOrder.proof_urls)
            ? editingOrder.proof_urls
            : String(editingOrder.proof_urls).split(",")
        )
          .map((s) => String(s).trim())
          .filter(Boolean);
      }
      if (proofUrlArray.length === 0 && editingOrder.image_url) {
        proofUrlArray = String(editingOrder.image_url)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      proofUrlArray = proofUrlArray.map(formatImg);
      setExistingProofUrls(proofUrlArray);

      const nextLinkedIds = (editingOrder.linkedOrderIds || []).map((id) => {
        const text = String(id);
        return text.includes(":") ? text : `${text}:${editingOrder.sheet_name}`;
      });
      setLinkedIds(nextLinkedIds);
      initialLinkedIdsRef.current = nextLinkedIds;
      linkSelectionTouchedRef.current = false;
    } else {
      initialLinkedIdsRef.current = [];
      setLinkedIds([]);
      linkSelectionTouchedRef.current = false;
      setFormData((prev) => ({ ...prev, sheet_name: activeSheet }));
    }
  }, [editingOrder, activeSheet]);

  const searchCustomers = (value: string, field: "insta" | "name" | "phone") => {
    const val = value.toLowerCase().trim();
    if (val.length === 0) {
      setShowSuggestions(false);
      return;
    }

    const matches = customerDb.filter((c) => {
      if (field === "insta") return c.insta.toLowerCase().includes(val);
      if (field === "name") return c.name.toLowerCase().includes(val);
      if (field === "phone") return c.phone.includes(val);
      return false;
    });

    // Deduplicate
    const seen = new Set<string>();
    const unique = matches
      .filter((c) => {
        const id = `${c.insta}-${c.name}-${c.phone}`.toLowerCase();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .slice(0, 8);

    setSuggestions(
      unique.map(
        (c) =>
          ({
            insta: c.insta,
            name: c.name,
            phone: c.phone,
            phone2: c.phone2,
            place: c.place,
            pics_text: c.pics_text,
          }) as Order,
      ),
    );
    setActiveSuggestionField(field);
    setShowSuggestions(unique.length > 0);

    // Count loyalty
    setLoyaltyCount(
      allOrders.filter((o) => {
        if (field === "phone") return String(o.phone || "").includes(val);
        return (
          String(o.insta || "")
            .toLowerCase()
            .includes(val) ||
          String(o.name || "")
            .toLowerCase()
            .includes(val)
        );
      }).length,
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "region") {
      const r = value as Region;
      setRegion(r);
      localStorage.setItem("last_region", r);

      let placePrefix = "";
      if (r === "erbil") placePrefix = "Erbil - ";
      else if (r === "sulaymani") placePrefix = "Sulaymani - ";
      else if (r === "duhok") placePrefix = "Duhok - ";
      else if (r === "kirkuk") placePrefix = "Kirkuk - ";
      else if (r === "zaxo") placePrefix = "Zaxo - ";
      else if (r === "outside_kurdistan") placePrefix = "Iraq - ";
      else if (r === "outside_erbil") placePrefix = "Outside Erbil - ";
      else if (r === "no_location") placePrefix = "No Location - ";

      setFormData((prev) => {
        let currentPlace = String(prev.place || "");
        currentPlace = currentPlace.replace(
          /^(Erbil|Sulaymani|Duhok|Kirkuk|Zaxo|Iraq|Outside Erbil|No Location)\s*-\s*/i,
          "",
        );
        return {
          ...prev,
          place: placePrefix + currentPlace,
        };
      });
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "insta" || name === "name" || name === "phone") {
      searchCustomers(value, name as "insta" | "name" | "phone");
    }
  };

  const selectSuggestion = (s: Order) => {
    // Derive region from place
    const place = String(s.place || "").toLowerCase();
    let derivedRegion: Region = "";

    if (place.includes("no location")) {
      derivedRegion = "no_location";
    } else if (place.includes("erbil") || place.includes("hawler") || place.includes("هەولێر")) {
      derivedRegion = "erbil";
    } else if (place.includes("sulaymani")) {
      derivedRegion = "sulaymani";
    } else if (place.includes("duhok")) {
      derivedRegion = "duhok";
    } else if (place.includes("kirkuk")) {
      derivedRegion = "kirkuk";
    } else if (place.includes("zaxo") || place.includes("zakho")) {
      derivedRegion = "zaxo";
    } else if (
      place.includes("halabja") ||
      place.includes("koya") ||
      place.includes("ranya") ||
      place.includes("soran")
    ) {
      derivedRegion = "outside_erbil";
    } else if (place && !place.includes("erbil")) {
      derivedRegion = "outside_erbil";
    }

    setFormData((prev) => ({
      ...prev,
      insta: s.insta || prev.insta,
      name: s.name || prev.name,
      place: s.place || prev.place,
      phone:
        String(s.phone || "")
          .split("/")[0]
          .trim() || prev.phone,
      phone2: s.phone2 || prev.phone2,
      // The piece count is deliberately not carried over. It belongs to that order, not
      // to the customer, and copying it silently priced the new order for the wrong
      // number of items.
    }));
    if (derivedRegion) setRegion(derivedRegion);
    setShowSuggestions(false);
    setLoyaltyCount(
      allOrders.filter(
        (o) =>
          String(o.insta || "")
            .toLowerCase()
            .trim() ===
          String(s.insta || "")
            .toLowerCase()
            .trim(),
      ).length,
    );
  };

  const [isUploadingImgs, setIsUploadingImgs] = useState(false);

  /**
   * Adds a batch of pictures to the order.
   *
   * There is no limit on how many can be attached. Each file is uploaded on its own, so
   * one photo the browser cannot read no longer throws away the others that uploaded
   * fine — which is what used to happen when a batch was sent with `Promise.all`.
   */
  const addImages = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: ImageKind,
    setSaved: React.Dispatch<React.SetStateAction<string[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    // Cleared so picking the same photo again after removing it still fires a change.
    e.target.value = "";
    if (!files.length) return;

    const previews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...previews]);
    setIsUploadingImgs(true);
    try {
      const { urls, failed, errors } = await uploadOrderImages(files, kind);
      if (urls.length) setSaved((prev) => [...prev, ...urls]);
      if (failed) {
        console.error("[images] some uploads failed", errors);
        alert(
          [
            `${urls.length} of ${files.length} pictures were saved.`,
            "",
            "These could not be uploaded:",
            ...errors,
          ].join(BREAK),
        );
      }
    } finally {
      setPreviews((prev) => prev.filter((p) => !previews.includes(p)));
      previews.forEach((url) => URL.revokeObjectURL(url));
      setIsUploadingImgs(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    addImages(e, "primary", setExistingPrimaryUrls, setPreviewPrimaryUrls);

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    addImages(e, "proof", setExistingProofUrls, setPreviewProofUrls);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploadingImgs) {
      alert("Pictures are still uploading. Please wait a moment...");
      return;
    }

    if (existingProofUrls.length === 0 && previewProofUrls.length === 0) {
      alert("Proof Picture is required. Please upload at least one proof image.");
      return;
    }

    // Total Primaries = Existing + New Files
    const totalPrimaries = existingPrimaryUrls.length;

    setIsSubmitting(true);
    try {
      const priceVal = parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
      const linkedTotal = linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o, allOrders), 0);
      const hasFreeShippingNote = /free\s*shipping/i.test(
        `${formData.note || ""} ${formData.extra || ""}`,
      );
      const isAutoFree = priceVal + linkedTotal > 118000 || hasFreeShippingNote;

      // Free shipping is one discount for one delivery, so it comes off one order only.
      // Every linked order used to take it again: saving the second one saw the combined
      // total pass the threshold, subtracted the shipping from its price too, and the
      // group lost the charge twice over. The mark and the deduction have to travel
      // together, because the display adds the shipping back wherever it finds the mark.
      const groupAlreadyCarriesFree = linkedOrders.some(carriesFreeShippingMark);
      // An order that already holds the mark keeps it. Stripping it while leaving the
      // price reduced would hide a deduction that had already happened.
      const selfAlreadyCarriesFree = carriesFreeShippingMark(formData);
      const shouldApplyFree =
        (freeShipping || isAutoFree) && (selfAlreadyCarriesFree || !groupAlreadyCarriesFree);
      const originalDisplayPrice = isEditing ? getDisplayPrice(editingOrder!, allOrders) : 0;
      const priceWasChanged = !isEditing || priceVal !== originalDisplayPrice;
      const sheetPrice = priceWasChanged
        ? getSheetPriceForSave(priceVal, formData.place, shouldApplyFree)
        : Number(String(editingOrder!.price).replace(/[^0-9.-]+/g, "")) || 0;

      const cleanExtra = String(formData.extra || "")
        .replace(/\bFree\b/i, "")
        .trim();
      const extraWithFree = shouldApplyFree
        ? (cleanExtra + (cleanExtra ? " " : "") + "Free").trim()
        : cleanExtra;

      const cleanNote = String(formData.note || "")
        .replace(/\[ZERO_SHIP\]/gi, "")
        .trim();

      const targetSheet = isEditing ? String(formData.sheet_name || activeSheet) : activeSheet;
      let newBoxNameAttr = formData.box_name || "";
      const pieces = Number(formData.pics_text) || 1;
      const currentMonthOrders = allOrders.filter((o) => o.sheet_name === targetSheet);

      if (!isEditing) {
        // allOrders supplies the global numbering; currentMonthOrders decides which
        // box in this month may still be added to.
        newBoxNameAttr = findAutoBoxName(currentMonthOrders, pieces, { allOrders });
      }

      const tempId = isEditing ? undefined : Date.now();
      const normalizeLinked = (ids: (string | number)[]) =>
        ids
          .map((id) => String(id))
          .map((id) => (id.includes(":") ? id : `${id}:${targetSheet}`))
          .sort();
      const linksChanged =
        JSON.stringify(normalizeLinked(linkedIds)) !==
        JSON.stringify(normalizeLinked(initialLinkedIdsRef.current));
      const currentRole = localStorage.getItem("auth_role") || "unknown";
      const currentUser =
        localStorage.getItem("auth_username") ||
        resolveTeamUsername("kurdistani", currentRole) ||
        currentRole;

      const payload: any = {
        ...formData,
        price: sheetPrice,
        sheet_price: sheetPrice,
        customer_price: priceVal,
        box_name: newBoxNameAttr,
        primary_urls: existingPrimaryUrls.join(","),
        proof_urls: existingProofUrls.join(","),
        extra: extraWithFree,
        note: cleanNote,
        sheet: targetSheet,
        row_id: isEditing ? editingOrder!.id : "",
        admin_name: isEditing ? editingOrder?.admin_name || currentUser : currentUser,
        admin_role: isEditing ? editingOrder?.admin_role || currentRole : currentRole,
        client_request_id: tempId ? `kurdistani-${targetSheet}-${tempId}` : undefined,
      };
      if (isEditing) {
        if (linksChanged) payload.linkedOrderIds = linkedIds;
      } else if (linkSelectionTouchedRef.current && linkedIds.length > 0) {
        payload.linkedOrderIds = linkedIds;
      }

      // EDIT path: optimistic — close form instantly, sync to sheet in background.
      // This makes linking orders feel instant instead of waiting on Apps Script.
      if (isEditing) {
        onSuccess(payload);
        // Supabase is updated alongside the sheet so an edit does not leave the two
        // copies disagreeing. Only the details change — never the month or region.
        updateOrderEverywhere(
          "kurdistani",
          {
            unique_order_id: editingOrder?.unique_order_id,
            sheet_name: editingOrder?.sheet_name,
            id: editingOrder?.id,
          },
          {
            insta: formData.insta?.trim() || null,
            name: formData.name?.trim() || null,
            place: formData.place?.trim() || null,
            phone: formData.phone?.trim() || null,
            fib: formData.fib?.trim() || null,
            price: toWholeNumber(sheetPrice),
            box_cost: toWholeNumber(formData.box_cost),
            pics_text: formData.pics_text ? String(formData.pics_text) : null,
            box_name: newBoxNameAttr || null,
            track_no: formData.trackNo?.trim() || null,
            initial_payment: toWholeNumber(formData.initial_payment),
            link: formData.link?.trim() || null,
            note: cleanNote || null,
            extra: extraWithFree || null,
            primary_urls: existingPrimaryUrls.join(",") || null,
            proof_urls: existingProofUrls.join(",") || null,
          },
        ).catch((err) => console.error("Supabase edit sync failed", err));

        fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) })
          .then(() => {
            // Persist ALL primary pictures via the dedicated action,
            // since the main save handler only stores a single image column.
            if (existingPrimaryUrls.length > 0) {
              return fetchWithRetry(SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify({
                  action: "update_primary_picture",
                  sheet_name: payload.sheet,
                  row_id: payload.row_id,
                  primary_urls: existingPrimaryUrls.join(","),
                }),
              });
            }
          })
          .catch((err) => {
            console.error("Background save failed", err);
          });
        setIsSubmitting(false);
        return;
      }

      // NEW order: optimistic — show it on the list NOW with a temp id, then reconcile
      // with the real row id once Apps Script responds. This kills the 10–15s wait.
      const optimisticPayload = { ...payload, row_id: tempId, _tempId: tempId };
      onSuccess(optimisticPayload);
      setIsSubmitting(false);

      // Send SKU data to secondary script for new orders
      if (payload.pics_text || payload.link) {
        try {
          fetch(
            "https://script.google.com/macros/s/AKfycbxUmtYopoO9HznjbfiAP8heZTZlk0RvxtuInPzlEuneNXs4RGAlDvY_FjUAqK8yyT8/exec",
            {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "text/plain" },
              body: JSON.stringify({
                action: "save_order",
                name: String(payload.insta || "Unknown"),
                link: String(payload.link || ""),
                quantity: String(payload.pics_text || "1"),
              }),
            },
          ).catch(() => {
            /* silently ignore secondary script errors */
          });
        } catch (err) {
          // silently ignore
        }
      }

      // New orders are recorded in Supabase, not the sheet. The pictures travel in
      // the same insert, so there is no follow-up write to reconcile.
      (async () => {
        try {
          const result = await submitKurdistaniOrder(
            {
              name: formData.name,
              insta: formData.insta,
              phone: formData.phone,
              price: sheetPrice,
              place: formData.place,
              link: formData.link,
              pics_text: formData.pics_text,
              initial_payment: formData.initial_payment,
              box_cost: formData.box_cost,
              fib: formData.fib,
              box_name: newBoxNameAttr,
              trackNo: formData.trackNo,
              primary_urls: existingPrimaryUrls.join(","),
              proof_urls: existingProofUrls.join(","),
              extra: extraWithFree,
              note: cleanNote,
            },
            { adminName: currentUser, adminRole: currentRole },
            // The sheet keeps a copy so the order stays visible and editable until
            // reads and edits have moved to Supabase.
            { sheetPayload: payload, primaryUrls: existingPrimaryUrls },
          );

          if (!result.ok) {
            toast.error(result.error || "Could not save the order");
            return;
          }

          if (result.sheetError) {
            // The order is saved — Supabase is written first now, and a failure there
            // returns ok: false and never reaches here. So this only ever means the Google
            // Sheet copy did not happen, and the order still has to appear in the list:
            // leaving it out would look like the save had failed when it had not.
            toast.warning(result.sheetError, { duration: 10000 });
            console.error("[order] saved, sheet copy failed:", result.sheetError);
            onSuccess({ ...payload, row_id: result.sheetRowId ?? undefined, _tempId: tempId });
          } else if (result.sheetRowId) {
            // Swap the temporary id for the sheet's real row number so the order can
            // be opened and edited straight away.
            onSuccess({ ...payload, row_id: result.sheetRowId, _tempId: tempId });
          }

          // Hand the link to the SKU extractor bot as a pending row. The order is
          // already saved; this only fills in the product code, and is never
          // allowed to throw.
          queueOrderForSkuExtraction({
            name: String(payload.insta || payload.name || "").trim(),
            link: String(payload.link || ""),
            pcs: payload.pics_text,
            requestId: payload.client_request_id,
          }).catch((error) => console.warn("SKU queue failed", error));

          try {
            await recordOrderCreated("kurdistani", currentUser, currentRole, {
              ...payload,
              row_id: result.sheetRowId || tempId,
            });
          } catch (e) {
            console.error("Failed to update user stats", e);
          }
        } catch (err) {
          console.error("Background save failed", err);
        }
      })();
      return;
    } catch (err) {
      console.error("API error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPhoneDigits = normalizePhoneDigits(formData.phone);
  // An informational badge only, shown next to a manually-found search result -
  // not a basis for pre-selecting or pre-sorting anything.
  const isSamePhoneOrder = (order: Order) => {
    if (currentPhoneDigits.length === 0) return false;
    const orderPhones = normalizePhoneDigits(order.phone);
    return orderPhones.some((phone) => currentPhoneDigits.includes(phone));
  };
  const linkSheet = String(isEditing ? formData.sheet_name : activeSheet);
  const linkedKeySet = new Set(
    linkedIds.map((id) => {
      const text = String(id);
      return text.includes(":") ? text : `${text}:${linkSheet}`;
    }),
  );

  // No default list, no auto-suggested match, no pre-sorting by phone or date -
  // this used to show up to 15 orders (any orders, unrelated ones included, once
  // the phone field was blank) before a single character was typed, which is how
  // orders that shared nothing ended up linked together. A link can now only be
  // made by actively typing a search and picking the exact result.
  const linkableOrders = allOrders
    .filter((o) => {
      if (editingOrder && o.id === editingOrder.id && o.sheet_name === editingOrder.sheet_name)
        return false;
      const key = `${o.id}:${o.sheet_name}`;
      if (linkedKeySet.has(key)) return false;
      const q = linkSearch.toLowerCase().trim();
      if (!q) return false;
      return [o.insta, o.name, o.phone, o.orderNo].some((f) =>
        String(f || "")
          .toLowerCase()
          .includes(q),
      );
    })
    .slice(0, 15);

  const linkedOrders = allOrders.filter((o) => {
    const key = `${o.id}:${o.sheet_name}`;
    return linkedKeySet.has(key);
  });

  const inputClass =
    "w-full bg-card border border-border rounded-xl px-3 py-3 text-base sm:text-sm font-medium shadow-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60";
  const labelClass =
    "text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  const renderField = (
    label: string,
    fieldName: string,
    type = "text",
    placeholder = "",
    required = false,
  ) => (
    <div className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        name={fieldName}
        value={String((formData as any)[fieldName] || "")}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        onFocus={() => {
          if (["insta", "name", "phone"].includes(fieldName)) {
            const val = String((formData as any)[fieldName] || "");
            if (val) searchCustomers(val, fieldName as any);
          } else {
            setShowSuggestions(false);
          }
        }}
        className={inputClass}
      />
    </div>
  );

  const SuggestionsDropdown = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    return (
      <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-card border border-border/80 rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-3 py-2 bg-secondary/80 border-b border-border">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Suggestions
          </span>
          <button
            type="button"
            onClick={() => setShowSuggestions(false)}
            className="p-1 hover:bg-muted text-muted-foreground rounded-full transition-colors"
          >
            <X size={12} />
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="w-full text-left px-3 py-2.5 hover:bg-secondary transition-colors text-sm border-b border-border/50 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-primary">@{s.insta || "-"}</span>
                  <span className="text-muted-foreground"> — {s.name || "-"}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{s.place}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">📱 {s.phone || "-"}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md sm:max-w-lg mx-auto bg-card p-4 sm:p-6 rounded-2xl border border-border/80 animate-slide-up"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="font-extrabold text-xl tracking-tight">
            {isEditing ? "Edit Order" : "New Order"}
          </h2>
          <p className="text-muted-foreground text-xs">Sheet: {activeSheet}</p>
        </div>
        <div className="flex items-center gap-2">
          {loyaltyCount > 0 && (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold">
              <Sparkles size={14} /> {loyaltyCount} orders
            </div>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-secondary hover:bg-secondary/80 rounded-xl text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4" ref={suggestionContainerRef}>
        {/* Linked Orders first: the customer is chosen by linking, and picking an
            order fills in their details, so this belongs before the fields it fills. */}
        {/* Link Orders */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Linked Orders
            </label>
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              <Link2 size={12} /> Connect Order
            </button>
          </div>
          {linkedOrders.length > 0 && (
            <div className="space-y-1">
              {linkedOrders.map((o) => (
                <div
                  key={`${o.id}-${o.sheet_name}`}
                  className="flex items-center justify-between bg-secondary px-3 py-2 rounded-lg text-sm"
                >
                  <span className="font-medium">
                    {o.name || o.insta}{" "}
                    <span className="text-muted-foreground text-xs">
                      #{o.id} · {o.sheet_name}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      linkSelectionTouchedRef.current = true;
                      setLinkedIds((p) =>
                        p.filter((id) => id !== `${o.id}:${o.sheet_name}` && id !== o.id),
                      );
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instagram with suggestions */}
        <div className="relative">
          {renderField("Instagram", "insta", "text", "@username", true)}
          {activeSuggestionField === "insta" && <SuggestionsDropdown />}
        </div>

        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            {renderField("Name", "name", "text", "Customer name")}
            {activeSuggestionField === "name" && <SuggestionsDropdown />}
          </div>
          <div className="relative">
            {renderField("Phone", "phone", "tel", "07xx...")}
            {activeSuggestionField === "phone" && <SuggestionsDropdown />}
          </div>
        </div>

        {renderField("Link", "link", "text", "Product URL")}
        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3 sm:gap-4">
          {renderField("Price (IQD)", "price", "number", "0", true)}
          {renderField("Initial Payment", "initial_payment", "number", "0")}
        </div>
        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3 sm:gap-4">
          {renderField("SKU Qty", "pics_text", "number", "1")}
          <div className="space-y-1.5">
            <label className={labelClass}>Region</label>
            <select
              name="region"
              value={region}
              onChange={handleInputChange}
              className={inputClass}
            >
              <option value="">Select region</option>
              <option value="no_location">No Location (0)</option>
              <option value="erbil">Erbil (3,000)</option>
              <option value="sulaymani">Sulaymani (5,000)</option>
              <option value="duhok">Duhok (5,000)</option>
              <option value="kirkuk">Kirkuk (5,000)</option>
              <option value="zaxo">Zaxo (5,000)</option>
              <option value="outside_erbil">Other Outside Erbil (5,000)</option>
              <option value="outside_kurdistan">Outside Kurdistan (6,000)</option>
            </select>
          </div>
        </div>
        {renderField("Place", "place", "text", "City / Address")}
        {renderField("Phone 2", "phone2", "tel", "Secondary phone")}
        {renderField("Notes / Box", "note", "text", "Batch name, notes...")}

        <div className="border border-border/80 p-3 sm:p-4 rounded-2xl bg-secondary/20 mt-2">
          <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
            Primary Images{" "}
            <span className="text-xs text-muted-foreground font-normal">
              {existingPrimaryUrls.length > 0
                ? `${existingPrimaryUrls.length} added`
                : "Optional — add 5 or more"}
            </span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="file"
              ref={fileRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            {[...existingPrimaryUrls, ...previewPrimaryUrls].map((img, i) => (
              <div
                key={`prim-${i}`}
                className="relative aspect-square rounded-xl overflow-hidden border border-border group cursor-pointer"
                onClick={() => setViewingImage(img)}
              >
                <img
                  src={img}
                  alt="Primary"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10">
                  PRIMARY
                </span>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Eye className="text-white" size={24} />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (i < existingPrimaryUrls.length) {
                      setExistingPrimaryUrls((p) => p.filter((_, idx) => idx !== i));
                    } else {
                      const localIdx = i - existingPrimaryUrls.length;
                      setPreviewPrimaryUrls((p) => p.filter((_, idx) => idx !== localIdx));
                      setPrimaryFiles((p) => p.filter((_, idx) => idx !== localIdx));
                    }
                  }}
                  className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md z-10 hover:bg-red-600 active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div
              onClick={() => fileRef.current?.click()}
              className="relative aspect-square rounded-xl border-2 border-dashed border-primary/40 flex flex-col justify-center items-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all group bg-primary/5"
            >
              <Upload
                size={18}
                className="text-primary/70 group-hover:text-primary transition-colors mb-1"
              />
              <span className="text-[10px] font-bold text-primary/70 group-hover:text-primary leading-tight text-center px-1">
                Add Primary Images
              </span>
            </div>
          </div>
        </div>

        <div className="border border-border/80 p-3 sm:p-4 rounded-2xl bg-secondary/20 mt-2">
          <h3 className="text-sm font-semibold mb-3 flex items-center justify-between text-primary">
            Proof Pictures{" "}
            {existingProofUrls.length > 0 ? (
              <span className="text-xs text-muted-foreground font-normal">
                {existingProofUrls.length} added — 3 or more is fine
              </span>
            ) : (
              <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded uppercase font-bold">
                Required
              </span>
            )}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="file"
              ref={proofFileRef}
              onChange={handleProofFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            {[...existingProofUrls, ...previewProofUrls].map((img, i) => (
              <div
                key={`proof-${i}`}
                className="relative aspect-square rounded-xl overflow-hidden border border-border group cursor-pointer"
                onClick={() => setViewingImage(img)}
              >
                <img
                  src={img}
                  alt="Proof"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10">
                  PROOF
                </span>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Eye className="text-white" size={24} />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (i < existingProofUrls.length) {
                      setExistingProofUrls((p) => p.filter((_, idx) => idx !== i));
                    } else {
                      const localIdx = i - existingProofUrls.length;
                      setPreviewProofUrls((p) => p.filter((_, idx) => idx !== localIdx));
                      setProofFiles((p) => p.filter((_, idx) => idx !== localIdx));
                    }
                  }}
                  className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md z-10 hover:bg-red-600 active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <div
              onClick={() => proofFileRef.current?.click()}
              className="relative aspect-square rounded-xl border-2 border-dashed border-primary/40 flex flex-col justify-center items-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all group bg-primary/5"
            >
              <Upload
                size={18}
                className="text-primary/70 group-hover:text-primary transition-colors mb-1"
              />
              <span className="text-[10px] font-bold text-primary/70 group-hover:text-primary leading-tight text-center px-1">
                Add Proof Image
              </span>
            </div>
          </div>
        </div>

        {/* Free Shipping Toggle */}
        {region && (
          <div className="flex items-center justify-between bg-secondary/60 border border-border/80 rounded-2xl px-3 sm:px-4 py-3 gap-3">
            <div>
              <p className="text-sm font-semibold">Free Shipping</p>
              <p className="text-xs text-muted-foreground">
                Mark this order as having free shipping.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFreeShipping((prev) => !prev)}
              className={`relative w-11 h-6 rounded-full transition-colors ${freeShipping ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${freeShipping ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
        )}

        {/* Checkout Summary */}
        <div className="bg-primary/5 border border-primary/20 p-3 sm:p-4 rounded-2xl space-y-2 mt-4">
          <h3 className="text-sm font-bold border-b border-border pb-2 mb-2">Cart Summary</h3>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Item Price</span>
            <span>
              {(parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0).toLocaleString()}{" "}
              IQD
            </span>
          </div>
          {linkedOrders.length > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Linked Items ({linkedOrders.length})</span>
              <span>
                {linkedOrders
                  .reduce((sum, o) => sum + getDisplayPrice(o, allOrders), 0)
                  .toLocaleString()}{" "}
                IQD
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm font-medium pt-1">
            <span>Delivery</span>
            {(() => {
              const currentPrice =
                parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
              const linkedTotal = linkedOrders.reduce(
                (sum, o) => sum + getDisplayPrice(o, allOrders),
                0,
              );
              const cartTotal = currentPrice + linkedTotal;
              const isAutoFree =
                cartTotal > 118000 ||
                /free\s*shipping/i.test(`${formData.note || ""} ${formData.extra || ""}`);

              let baseDelivery = 0;
              if (region === "erbil") baseDelivery = 3000;
              else if (region === "outside_kurdistan") baseDelivery = 6000;
              else if (region === "no_location") baseDelivery = 0;
              else if (region) baseDelivery = 5000;

              if (isAutoFree || freeShipping) {
                return (
                  <span className="text-primary font-bold flex items-center gap-1">
                    0 IQD{" "}
                    <span className="bg-primary/20 px-1.5 py-0.5 rounded text-[10px] uppercase">
                      Free Delivery Activated
                    </span>
                  </span>
                );
              }
              return <span>{baseDelivery.toLocaleString()} IQD</span>;
            })()}
          </div>

          <div className="flex justify-between text-base font-bold pt-2 border-t border-border mt-1">
            <span>Grand Total</span>
            {(() => {
              const currentPrice =
                parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
              const linkedTotal = linkedOrders.reduce(
                (sum, o) => sum + getDisplayPrice(o, allOrders),
                0,
              );
              const cartTotal = currentPrice + linkedTotal;
              const isAutoFree =
                cartTotal > 118000 ||
                /free\s*shipping/i.test(`${formData.note || ""} ${formData.extra || ""}`);

              let baseDelivery = 0;
              if (region === "erbil") baseDelivery = 3000;
              else if (region === "outside_kurdistan") baseDelivery = 6000;
              else if (region === "no_location") baseDelivery = 0;
              else if (region) baseDelivery = 5000;

              const finalDelivery = isAutoFree || freeShipping ? 0 : baseDelivery;
              return <span>{(cartTotal + finalDelivery).toLocaleString()} IQD</span>;
            })()}
          </div>
        </div>

        <div className="sticky -bottom-4 sm:static bg-card/95 backdrop-blur flex gap-2 sm:gap-3 pt-3 sm:pt-4 pb-1 sm:pb-0 border-t border-border/80 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImgs}
            className="flex-1 bg-primary hover:bg-primary/90 hover:-translate-y-0.5 text-primary-foreground font-semibold py-3 rounded-xl transition-all glow-primary disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />{" "}
                Saving...
              </>
            ) : isUploadingImgs ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />{" "}
                Uploading Imgs...
              </>
            ) : (
              <>
                <Sparkles size={16} /> {isEditing ? "Update" : "Submit"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={viewingImage}
            alt="Expanded view"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* Link Order Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setShowLinkModal(false)}
          />
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl relative z-10 animate-slide-up">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold">Connect Order</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 bg-secondary rounded-lg text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={linkSearch}
                onChange={(e) => setLinkSearch(e.target.value)}
                placeholder="Search by name, insta, phone..."
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
              <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {linkableOrders.map((o) => (
                  <button
                    key={`${o.id}-${o.sheet_name}`}
                    type="button"
                    onClick={() => {
                      // The same guard OrderListView's bulk-link action already
                      // enforces: same phone or Instagram, within 7 days. This
                      // picker had no check of its own at all - typing a search
                      // and picking any result could link two orders that share
                      // nothing, which is how mismatched groups kept forming.
                      const currentOrderContext = {
                        ...formData,
                        date: isEditing ? editingOrder?.date || "" : new Date().toISOString(),
                      } as Order;

                      // A blank form has no phone yet, so the same-customer check could
                      // never pass and a new order could not be linked to anything at
                      // all. Picking the order is how you say who the customer is: the
                      // details are adopted from it. The check still applies once the
                      // form names a customer of its own, so an order already filled in
                      // cannot be attached to a different person.
                      const namesACustomer = Boolean(
                        String(formData.phone || "").trim() || String(formData.insta || "").trim(),
                      );
                      if (namesACustomer && !isSameCustomer(currentOrderContext, o)) {
                        alert(
                          "This order can't be linked: it needs to share the same phone number, " +
                            "and be within 7 days.",
                        );
                        return;
                      }

                      setFormData((prev) => ({
                        ...prev,
                        insta: prev.insta || o.insta || "",
                        name: prev.name || o.name || "",
                        phone:
                          prev.phone ||
                          String(o.phone || "")
                            .split("/")[0]
                            .trim(),
                        phone2: prev.phone2 || o.phone2 || "",
                        // Forced, not filled: linked orders are one delivery, so they
                        // have to go to one place or the shipping charge is meaningless.
                        place: o.place || prev.place,
                        // pics_text is left alone on purpose — the piece count is this
                        // order's own.
                      }));

                      linkSelectionTouchedRef.current = true;
                      setLinkedIds((p) => [...p, `${o.id}:${o.sheet_name}`]);
                      setShowLinkModal(false);
                    }}
                    className="w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left text-sm"
                  >
                    <div>
                      <span className="font-medium">{o.name || o.insta}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        #{o.id} · {o.sheet_name}
                      </span>
                      {isSamePhoneOrder(o) && (
                        <span className="ml-2 text-[10px] font-semibold text-primary uppercase">
                          Same phone
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {Number(String(o.price).replace(/[^0-9.-]+/g, "")).toLocaleString()}
                    </span>
                  </button>
                ))}
                {linkableOrders.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">No orders found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default OrderFormView;
