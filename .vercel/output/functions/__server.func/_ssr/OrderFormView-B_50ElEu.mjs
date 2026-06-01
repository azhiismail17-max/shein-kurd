import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { SCRIPT_URL, getOrderStatus } from "./index-CHMLBzfP.mjs";
import { getDisplayPrice, isOrderFree, getSheetPriceForSave, uploadToImgBB } from "./order-utils-CgGk-Sl2.mjs";
import { a as fetchWithRetry } from "./notifications-BuSzwt0M.mjs";
import { q as resolveTeamUsername, r as recordOrderCreated } from "./use-toast-CUyDYyz5.mjs";
import "../_libs/firebase__firestore.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__storage.mjs";
import { _ as Sparkles, a9 as X, r as Eye, a5 as Upload, s as Link2 } from "../_libs/lucide-react.mjs";
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
function findAutoBoxName(orders, newPieces) {
  const minBoxNum = 73;
  const boxMap = /* @__PURE__ */ new Map();
  const closedBoxes = /* @__PURE__ */ new Set();
  orders.forEach((o) => {
    const match = String(o.box_name || "").trim().match(/^Box (\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      const pieces = Number(o.pics_text) || 0;
      boxMap.set(num, (boxMap.get(num) || 0) + pieces);
      if (getOrderStatus(o) !== "pending") {
        closedBoxes.add(num);
      }
    }
  });
  if (boxMap.size === 0) {
    return `Box ${minBoxNum}`;
  }
  const maxBoxNum = Math.max(minBoxNum - 1, ...boxMap.keys());
  const currentBoxPieces = boxMap.get(maxBoxNum) || 0;
  if (closedBoxes.has(maxBoxNum)) {
    return `Box ${maxBoxNum + 1}`;
  }
  if (currentBoxPieces >= 90 || currentBoxPieces + newPieces > 110) {
    return `Box ${maxBoxNum + 1}`;
  }
  return `Box ${maxBoxNum}`;
}
const deriveRegionFromPlace = (placeValue) => {
  const place = String(placeValue || "").toLowerCase();
  if (place.includes("no location")) return "no_location";
  if (place.includes("outside erbil")) return "outside_erbil";
  if (place.includes("iraq")) return "outside_kurdistan";
  if (place.includes("sulaymani")) return "sulaymani";
  if (place.includes("duhok")) return "duhok";
  if (place.includes("kirkuk")) return "kirkuk";
  if (place.includes("zaxo") || place.includes("zakho")) return "zaxo";
  if (place.includes("erbil") || place.includes("hawler") || place.includes("هەولێر")) return "erbil";
  if (place.includes("halabja") || place.includes("koya") || place.includes("ranya") || place.includes("soran")) return "outside_erbil";
  if (place) return "outside_erbil";
  return "";
};
const OrderFormView = ({ activeSheet, editingOrder, onCancel, onSuccess, allOrders }) => {
  const [step, setStep] = reactExports.useState(1);
  const [primaryFiles, setPrimaryFiles] = reactExports.useState([]);
  const [existingPrimaryUrls, setExistingPrimaryUrls] = reactExports.useState([]);
  const [previewPrimaryUrls, setPreviewPrimaryUrls] = reactExports.useState([]);
  const [proofFiles, setProofFiles] = reactExports.useState([]);
  const [existingProofUrls, setExistingProofUrls] = reactExports.useState([]);
  const [previewProofUrls, setPreviewProofUrls] = reactExports.useState([]);
  const [viewingImage, setViewingImage] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
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
    box_cost: ""
  });
  const [region, setRegion] = reactExports.useState("");
  const isEditing = !!editingOrder;
  reactExports.useEffect(() => {
    const saved = localStorage.getItem("last_region");
    if (saved && !isEditing) {
      setRegion(saved);
    }
  }, [isEditing]);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [loyaltyCount, setLoyaltyCount] = reactExports.useState(0);
  const [showSuggestions, setShowSuggestions] = reactExports.useState(false);
  const [suggestions, setSuggestions] = reactExports.useState([]);
  const [freeShipping, setFreeShipping] = reactExports.useState(false);
  const [showLinkModal, setShowLinkModal] = reactExports.useState(false);
  const [linkSearch, setLinkSearch] = reactExports.useState("");
  const [linkedIds, setLinkedIds] = reactExports.useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = reactExports.useState("insta");
  const fileRef = reactExports.useRef(null);
  const proofFileRef = reactExports.useRef(null);
  const suggestionContainerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionContainerRef.current && !suggestionContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const customerDb = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    allOrders.forEach((o) => {
      const insta = String(o.insta || "").trim().toLowerCase();
      const name = String(o.name || "").trim().toLowerCase();
      const phone = String(o.phone || "").trim();
      const key = insta || phone || name;
      if (key && !map.has(key)) {
        map.set(key, {
          insta: String(o.insta || ""),
          name: String(o.name || ""),
          phone: String(o.phone || "").split("/")[0].trim(),
          phone2: String(o.phone2 || ""),
          place: String(o.place || ""),
          pics_text: String(o.pics_text || "1")
        });
      }
    });
    return Array.from(map.values());
  }, [allOrders]);
  reactExports.useEffect(() => {
    if (editingOrder) {
      setFormData({
        ...editingOrder,
        price: getDisplayPrice(editingOrder).toString()
      });
      setRegion(deriveRegionFromPlace(editingOrder.place));
      setFreeShipping(isOrderFree(editingOrder));
      const formatImg = (img) => {
        if (img.startsWith("http") || img.startsWith("data:")) return img;
        if (img.length > 100) return `data:image/jpeg;base64,${img}`;
        return img;
      };
      let primaryUrlArray = editingOrder.primary_urls ? String(editingOrder.primary_urls).split(",").filter(Boolean) : [];
      primaryUrlArray = primaryUrlArray.map(formatImg);
      setExistingPrimaryUrls(primaryUrlArray);
      let proofUrlArray = [];
      if (editingOrder.proof_urls) {
        proofUrlArray = (Array.isArray(editingOrder.proof_urls) ? editingOrder.proof_urls : String(editingOrder.proof_urls).split(",")).map((s) => String(s).trim()).filter(Boolean);
      }
      if (proofUrlArray.length === 0 && editingOrder.image_url) {
        proofUrlArray = String(editingOrder.image_url).split(",").map((s) => s.trim()).filter(Boolean);
      }
      proofUrlArray = proofUrlArray.map(formatImg);
      setExistingProofUrls(proofUrlArray);
      setLinkedIds((editingOrder.linkedOrderIds || []).filter((id) => typeof id === "string" && String(id).includes(":")));
    } else setFormData((prev) => ({ ...prev, sheet_name: activeSheet }));
  }, [editingOrder, activeSheet]);
  const searchCustomers = (value, field) => {
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
    const seen = /* @__PURE__ */ new Set();
    const unique = matches.filter((c) => {
      const id = `${c.insta}-${c.name}-${c.phone}`.toLowerCase();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 8);
    setSuggestions(unique.map((c) => ({ insta: c.insta, name: c.name, phone: c.phone, phone2: c.phone2, place: c.place, pics_text: c.pics_text })));
    setActiveSuggestionField(field);
    setShowSuggestions(unique.length > 0);
    setLoyaltyCount(allOrders.filter((o) => {
      if (field === "phone") return String(o.phone || "").includes(val);
      return String(o.insta || "").toLowerCase().includes(val) || String(o.name || "").toLowerCase().includes(val);
    }).length);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "region") {
      const r = value;
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
        currentPlace = currentPlace.replace(/^(Erbil|Sulaymani|Duhok|Kirkuk|Zaxo|Iraq|Outside Erbil|No Location)\s*-\s*/i, "");
        return {
          ...prev,
          place: placePrefix + currentPlace
        };
      });
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "insta" || name === "name" || name === "phone") {
      searchCustomers(value, name);
    }
  };
  const selectSuggestion = (s) => {
    const place = String(s.place || "").toLowerCase();
    let derivedRegion = "";
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
    } else if (place.includes("halabja") || place.includes("koya") || place.includes("ranya") || place.includes("soran")) {
      derivedRegion = "outside_erbil";
    } else if (place && !place.includes("erbil")) {
      derivedRegion = "outside_erbil";
    }
    setFormData((prev) => ({
      ...prev,
      insta: s.insta || prev.insta,
      name: s.name || prev.name,
      place: s.place || prev.place,
      phone: String(s.phone || "").split("/")[0].trim() || prev.phone,
      phone2: s.phone2 || prev.phone2,
      pics_text: s.pics_text || prev.pics_text
    }));
    if (derivedRegion) setRegion(derivedRegion);
    setShowSuggestions(false);
    setLoyaltyCount(allOrders.filter((o) => String(o.insta || "").toLowerCase().trim() === String(s.insta || "").toLowerCase().trim()).length);
  };
  const [isUploadingImgs, setIsUploadingImgs] = reactExports.useState(false);
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files) {
      const arrayFiles = Array.from(files);
      const newPreviews = arrayFiles.map((f) => URL.createObjectURL(f));
      setPreviewPrimaryUrls((prev) => [...prev, ...newPreviews]);
      setIsUploadingImgs(true);
      try {
        const uploadedUrls = await Promise.all(arrayFiles.map((f) => uploadToImgBB(f)));
        setExistingPrimaryUrls((prev) => [...prev, ...uploadedUrls]);
        setPreviewPrimaryUrls((prev) => prev.filter((p) => !newPreviews.includes(p)));
      } catch (err) {
        console.error("Image processing failed", err);
      } finally {
        setIsUploadingImgs(false);
      }
    }
  };
  const handleProofFileChange = async (e) => {
    const files = e.target.files;
    if (files) {
      const arrayFiles = Array.from(files);
      const newPreviews = arrayFiles.map((f) => URL.createObjectURL(f));
      setPreviewProofUrls((prev) => [...prev, ...newPreviews]);
      setIsUploadingImgs(true);
      try {
        const uploadedUrls = await Promise.all(arrayFiles.map((f) => uploadToImgBB(f)));
        setExistingProofUrls((prev) => [...prev, ...uploadedUrls]);
        setPreviewProofUrls((prev) => prev.filter((p) => !newPreviews.includes(p)));
      } catch (err) {
        console.error("Image processing failed", err);
      } finally {
        setIsUploadingImgs(false);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingImgs) {
      alert("Pictures are still uploading. Please wait a moment...");
      return;
    }
    if (existingProofUrls.length === 0 && previewProofUrls.length === 0) {
      alert("Proof Picture is required. Please upload at least one proof image.");
      return;
    }
    existingPrimaryUrls.length;
    setIsSubmitting(true);
    try {
      const priceVal = parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
      const linkedTotal = linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o, allOrders), 0);
      const isAutoFree = priceVal + linkedTotal >= 118e3;
      const shouldApplyFree = freeShipping || isAutoFree;
      const originalDisplayPrice = isEditing ? getDisplayPrice(editingOrder, allOrders) : 0;
      const priceWasChanged = !isEditing || priceVal !== originalDisplayPrice;
      const sheetPrice = priceWasChanged ? getSheetPriceForSave(priceVal, formData.place, shouldApplyFree, formData.shipping_cost) : Number(String(editingOrder.price).replace(/[^0-9.-]+/g, "")) || 0;
      let cleanExtra = String(formData.extra || "").replace(/\bFree\b/i, "").trim();
      const extraWithFree = shouldApplyFree ? (cleanExtra + (cleanExtra ? " " : "") + "Free").trim() : cleanExtra;
      const cleanNote = String(formData.note || "").replace(/\[ZERO_SHIP\]/gi, "").trim();
      let newBoxNameAttr = formData.box_name || "";
      const pieces = Number(formData.pics_text) || 1;
      const currentMonthOrders = allOrders.filter((o) => o.sheet_name === activeSheet);
      if (!isEditing) {
        newBoxNameAttr = findAutoBoxName(currentMonthOrders, pieces);
      }
      const tempId = isEditing ? void 0 : Date.now();
      const payload = {
        ...formData,
        price: sheetPrice,
        sheet_price: sheetPrice,
        customer_price: priceWasChanged ? priceVal : originalDisplayPrice,
        box_name: newBoxNameAttr,
        primary_urls: existingPrimaryUrls.join(","),
        proof_urls: existingProofUrls.join(","),
        extra: extraWithFree,
        note: cleanNote,
        linkedOrderIds: linkedIds,
        sheet: isEditing ? formData.sheet_name : activeSheet,
        row_id: isEditing ? editingOrder.id : "",
        client_request_id: tempId ? `kurdistani-${activeSheet}-${tempId}` : void 0
      };
      if (isEditing) {
        onSuccess(payload);
        fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) }).then(() => {
          if (existingPrimaryUrls.length > 0) {
            return fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({
              action: "update_primary_picture",
              sheet_name: payload.sheet,
              row_id: payload.row_id,
              primary_urls: existingPrimaryUrls.join(",")
            }) });
          }
        }).catch((err) => {
          console.error("Background save failed", err);
        });
        setIsSubmitting(false);
        return;
      }
      const optimisticPayload = { ...payload, row_id: tempId, _tempId: tempId };
      onSuccess(optimisticPayload);
      setIsSubmitting(false);
      if (payload.pics_text || payload.link) {
        try {
          fetch("https://script.google.com/macros/s/AKfycbxUmtYopoO9HznjbfiAP8heZTZlk0RvxtuInPzlEuneNXs4RGAlDvY_FjUAqK8yyT8/exec", {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              action: "save_order",
              name: String(payload.insta || "Unknown"),
              link: String(payload.link || ""),
              quantity: String(payload.pics_text || "1")
            })
          }).catch(() => {
          });
        } catch (err) {
        }
      }
      (async () => {
        try {
          const res = await fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
          const text = await res.text();
          let result;
          try {
            result = JSON.parse(text);
          } catch {
            return;
          }
          if (result?.status === "success") {
            const rowMatch = String(result.message || "").match(/Row (\d+)/);
            const realRowId = rowMatch ? Number(rowMatch[1]) : void 0;
            try {
              const currentRole = localStorage.getItem("auth_role") || "unknown";
              const currentUser = resolveTeamUsername("kurdistani", currentRole);
              await recordOrderCreated("kurdistani", currentUser, currentRole, { ...payload, row_id: realRowId || tempId });
            } catch (e2) {
              console.error("Failed to update user stats", e2);
            }
            if (rowMatch) {
              onSuccess({ ...payload, row_id: realRowId, _tempId: tempId }, result.message);
              if (existingPrimaryUrls.length > 0) {
                fetchWithRetry(SCRIPT_URL, { method: "POST", body: JSON.stringify({
                  action: "update_primary_picture",
                  sheet_name: payload.sheet,
                  row_id: realRowId,
                  primary_urls: existingPrimaryUrls.join(",")
                }) }).catch((err) => console.error("Primary urls save failed", err));
              }
            }
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
  const linkableOrders = allOrders.filter((o) => {
    if (editingOrder && o.id === editingOrder.id && o.sheet_name === editingOrder.sheet_name) return false;
    const key = `${o.id}:${o.sheet_name}`;
    if (linkedIds.includes(key) || linkedIds.includes(o.id)) return false;
    const q = linkSearch.toLowerCase();
    if (!q) return true;
    return [o.insta, o.name, o.phone, o.orderNo].some((f) => String(f || "").toLowerCase().includes(q));
  }).slice(0, 15);
  const linkedOrders = allOrders.filter((o) => {
    const key = `${o.id}:${o.sheet_name}`;
    return linkedIds.includes(key) || linkedIds.includes(o.id);
  });
  const inputClass = "w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-base sm:text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50";
  const labelClass = "text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider";
  const renderField = (label, fieldName, type = "text", placeholder = "", required = false) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: labelClass, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        name: fieldName,
        value: String(formData[fieldName] || ""),
        onChange: handleInputChange,
        placeholder,
        required,
        onFocus: () => {
          if (["insta", "name", "phone"].includes(fieldName)) {
            const val = String(formData[fieldName] || "");
            if (val) searchCustomers(val, fieldName);
          } else {
            setShowSuggestions(false);
          }
        },
        className: inputClass
      }
    )
  ] });
  const SuggestionsDropdown = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center px-3 py-1.5 bg-secondary border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Suggestions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowSuggestions(false), className: "p-1 hover:bg-muted text-muted-foreground rounded-full transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-y-auto", children: suggestions.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => selectSuggestion(s), className: "w-full text-left px-3 py-2.5 hover:bg-secondary transition-colors text-sm border-b border-border/50 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
              "@",
              s.insta || "-"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              " — ",
              s.name || "-"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: s.place })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: [
          "📱 ",
          s.phone || "-"
        ] })
      ] }, i)) })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "w-full max-w-md sm:max-w-lg mx-auto bg-card p-3 sm:p-6 rounded-lg sm:rounded-xl border border-border animate-slide-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 sm:mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: isEditing ? "Edit Order" : "New Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
          "Sheet: ",
          activeSheet
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        loyaltyCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 bg-primary/10 text-primary px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14 }),
          " ",
          loyaltyCount,
          " orders"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onCancel, className: "p-2 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 sm:space-y-4", ref: suggestionContainerRef, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        renderField("Instagram", "insta", "text", "@username", true),
        activeSuggestionField === "insta" && /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestionsDropdown, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 min-[390px]:grid-cols-2 gap-3 sm:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          renderField("Name", "name", "text", "Customer name"),
          activeSuggestionField === "name" && /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestionsDropdown, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          renderField("Phone", "phone", "tel", "07xx..."),
          activeSuggestionField === "phone" && /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestionsDropdown, {})
        ] })
      ] }),
      renderField("Link", "link", "text", "Product URL"),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 min-[390px]:grid-cols-2 gap-3 sm:gap-4", children: [
        renderField("Price (IQD)", "price", "number", "0", true),
        renderField("Initial Payment", "initial_payment", "number", "0")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 min-[390px]:grid-cols-2 gap-3 sm:gap-4", children: [
        renderField("SKU Qty", "pics_text", "number", "1"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: labelClass, children: "Region" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { name: "region", value: region, onChange: handleInputChange, className: inputClass, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select region" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "no_location", children: "No Location (0)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "erbil", children: "Erbil (3,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sulaymani", children: "Sulaymani (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "duhok", children: "Duhok (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "kirkuk", children: "Kirkuk (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "zaxo", children: "Zaxo (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "outside_erbil", children: "Other Outside Erbil (5,000)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "outside_kurdistan", children: "Outside Kurdistan (6,000)" })
          ] })
        ] })
      ] }),
      renderField("Place", "place", "text", "City / Address"),
      renderField("Phone 2", "phone2", "tel", "Secondary phone"),
      renderField("Notes / Box", "note", "text", "Batch name, notes..."),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border p-3 sm:p-4 rounded-xl bg-secondary/10 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-3 flex items-center justify-between", children: [
          "Primary Image ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "Optional" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileRef, onChange: handleFileChange, accept: "image/*", multiple: true, className: "hidden" }),
          [...existingPrimaryUrls, ...previewPrimaryUrls].map((img, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square rounded-lg overflow-hidden border border-border group cursor-pointer", onClick: () => setViewingImage(img), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img, alt: "Primary", referrerPolicy: "no-referrer", className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10", children: "PRIMARY" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "text-white", size: 24 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => {
              e.stopPropagation();
              if (i < existingPrimaryUrls.length) {
                setExistingPrimaryUrls((p) => p.filter((_, idx) => idx !== i));
              } else {
                const localIdx = i - existingPrimaryUrls.length;
                setPreviewPrimaryUrls((p) => p.filter((_, idx) => idx !== localIdx));
                setPrimaryFiles((p) => p.filter((_, idx) => idx !== localIdx));
              }
            }, className: "absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md z-10 hover:bg-red-600 active:scale-95", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] }, `prim-${i}`)),
          existingPrimaryUrls.length === 0 && previewPrimaryUrls.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => fileRef.current?.click(), className: "relative aspect-square rounded-lg border-2 border-dashed border-primary/40 flex flex-col justify-center items-center cursor-pointer hover:border-primary transition-all group bg-primary/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18, className: "text-primary/70 group-hover:text-primary transition-colors mb-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-primary/70 group-hover:text-primary leading-tight text-center px-1", children: "Add Primary Images" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border p-3 sm:p-4 rounded-xl bg-secondary/10 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-3 flex items-center justify-between text-primary", children: [
          "Proof Picture ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded uppercase font-bold", children: "Required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: proofFileRef, onChange: handleProofFileChange, accept: "image/*", multiple: true, className: "hidden" }),
          [...existingProofUrls, ...previewProofUrls].map((img, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square rounded-lg overflow-hidden border border-border group cursor-pointer", onClick: () => setViewingImage(img), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img, alt: "Proof", referrerPolicy: "no-referrer", className: "w-full h-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10", children: "PROOF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "text-white", size: 24 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => {
              e.stopPropagation();
              if (i < existingProofUrls.length) {
                setExistingProofUrls((p) => p.filter((_, idx) => idx !== i));
              } else {
                const localIdx = i - existingProofUrls.length;
                setPreviewProofUrls((p) => p.filter((_, idx) => idx !== localIdx));
                setProofFiles((p) => p.filter((_, idx) => idx !== localIdx));
              }
            }, className: "absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md z-10 hover:bg-red-600 active:scale-95", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] }, `proof-${i}`)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => proofFileRef.current?.click(), className: "relative aspect-square rounded-lg border-2 border-dashed border-primary/40 flex flex-col justify-center items-center cursor-pointer hover:border-primary transition-all group bg-primary/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18, className: "text-primary/70 group-hover:text-primary transition-colors mb-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-primary/70 group-hover:text-primary leading-tight text-center px-1", children: "Add Proof Image" })
          ] })
        ] })
      ] }),
      region && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-secondary/50 border border-border rounded-lg px-3 sm:px-4 py-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Free Shipping" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mark this order as having free shipping." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setFreeShipping((prev) => !prev),
            className: `relative w-11 h-6 rounded-full transition-colors ${freeShipping ? "bg-primary" : "bg-muted"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${freeShipping ? "translate-x-5" : ""}` })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Linked Orders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowLinkModal(true), className: "flex items-center gap-1 text-xs text-primary font-medium hover:underline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12 }),
            " Connect Order"
          ] })
        ] }),
        linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: linkedOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-secondary px-3 py-2 rounded-lg text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            o.name || o.insta,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs", children: [
              "#",
              o.id,
              " · ",
              o.sheet_name
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setLinkedIds((p) => p.filter((id) => id !== `${o.id}:${o.sheet_name}` && id !== o.id)), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
        ] }, `${o.id}-${o.sheet_name}`)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary/30 border border-primary/20 p-3 sm:p-4 rounded-xl space-y-2 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold border-b border-border pb-2 mb-2", children: "Cart Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Item Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            (parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0).toLocaleString(),
            " IQD"
          ] })
        ] }),
        linkedOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Linked Items (",
            linkedOrders.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o), 0).toLocaleString(),
            " IQD"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-medium pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delivery" }),
          (() => {
            const currentPrice = parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
            const linkedTotal = linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o), 0);
            const cartTotal = currentPrice + linkedTotal;
            const isAutoFree = cartTotal >= 118e3;
            let baseDelivery = 0;
            if (region === "erbil") baseDelivery = 3e3;
            else if (region === "outside_kurdistan") baseDelivery = 6e3;
            else if (region === "no_location") baseDelivery = 0;
            else if (region) baseDelivery = 5e3;
            if (isAutoFree || freeShipping) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-bold flex items-center gap-1", children: [
                "0 IQD ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-primary/20 px-1.5 py-0.5 rounded text-[10px] uppercase", children: "Free Delivery Activated" })
              ] });
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              baseDelivery.toLocaleString(),
              " IQD"
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-base font-bold pt-2 border-t border-border mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Grand Total" }),
          (() => {
            const currentPrice = parseFloat(String(formData.price).replace(/[^0-9.-]+/g, "")) || 0;
            const linkedTotal = linkedOrders.reduce((sum, o) => sum + getDisplayPrice(o), 0);
            const cartTotal = currentPrice + linkedTotal;
            const isAutoFree = cartTotal >= 118e3;
            let baseDelivery = 0;
            if (region === "erbil") baseDelivery = 3e3;
            else if (region === "outside_kurdistan") baseDelivery = 6e3;
            else if (region === "no_location") baseDelivery = 0;
            else if (region) baseDelivery = 5e3;
            const finalDelivery = isAutoFree || freeShipping ? 0 : baseDelivery;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              (cartTotal + finalDelivery).toLocaleString(),
              " IQD"
            ] });
          })()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky -bottom-3 sm:static bg-card/95 backdrop-blur flex gap-2 sm:gap-3 pt-3 sm:pt-4 pb-1 sm:pb-0 border-t border-border mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onCancel, disabled: isSubmitting, className: "flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-lg transition-all disabled:opacity-50", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: isSubmitting || isUploadingImgs, className: "flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all glow-primary disabled:opacity-50 flex items-center justify-center gap-2", children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" }),
          " Saving..."
        ] }) : isUploadingImgs ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" }),
          " Uploading Imgs..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
          " ",
          isEditing ? "Update" : "Submit"
        ] }) })
      ] })
    ] }),
    viewingImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewingImage(null), className: "absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: viewingImage, alt: "Expanded view", referrerPolicy: "no-referrer", className: "max-w-full max-h-full object-contain rounded-lg" })
    ] }),
    showLinkModal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/30 backdrop-blur-sm", onClick: () => setShowLinkModal(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl relative z-10 animate-slide-up", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: "Connect Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowLinkModal(false), className: "p-1.5 bg-secondary rounded-lg text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: linkSearch, onChange: (e) => setLinkSearch(e.target.value), placeholder: "Search by name, insta, phone...", className: "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-60 overflow-y-auto space-y-1 custom-scrollbar", children: [
            linkableOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
              setLinkedIds((p) => [...p, `${o.id}:${o.sheet_name}`]);
              setShowLinkModal(false);
            }, className: "w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: o.name || o.insta }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-2", children: [
                  "#",
                  o.id,
                  " · ",
                  o.sheet_name
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-mono", children: Number(String(o.price).replace(/[^0-9.-]+/g, "")).toLocaleString() })
            ] }, `${o.id}-${o.sheet_name}`)),
            linkableOrders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground text-sm py-4", children: "No orders found" })
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  OrderFormView as default
};
