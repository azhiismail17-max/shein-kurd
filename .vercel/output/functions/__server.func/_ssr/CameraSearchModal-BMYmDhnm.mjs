import { r as reactExports, a as React__default, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as ArrowLeft, a9 as X, e as Camera, a5 as Upload, t as LoaderCircle, T as Search } from "../_libs/lucide-react.mjs";
const getImageHash = async (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No context");
      ctx.drawImage(img, 0, 0, 8, 8);
      try {
        const imgData = ctx.getImageData(0, 0, 8, 8);
        let sum = 0;
        const grayscale = [];
        for (let i = 0; i < imgData.data.length; i += 4) {
          const val = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
          grayscale.push(val);
          sum += val;
        }
        const avg = sum / grayscale.length;
        let hash = "";
        for (let i = 0; i < grayscale.length; i++) {
          hash += grayscale[i] >= avg ? "1" : "0";
        }
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};
const hammingDistance = (hash1, hash2) => {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 999;
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
};
const CameraSearchModal = ({ allOrders, onOrderClick, onClose }) => {
  const [capturedImage, setCapturedImage] = reactExports.useState(null);
  const [filterText, setFilterText] = reactExports.useState("");
  const [isComparing, setIsComparing] = reactExports.useState(false);
  const [targetHash, setTargetHash] = reactExports.useState(null);
  const [hashedOrders, setHashedOrders] = reactExports.useState(/* @__PURE__ */ new Map());
  const fileRef = reactExports.useRef(null);
  const cameraRef = reactExports.useRef(null);
  React__default.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        setCapturedImage(dataUrl);
        setIsComparing(true);
        try {
          const hash = await getImageHash(dataUrl);
          setTargetHash(hash);
        } catch (err) {
          console.error("Failed to hash uploaded image", err);
          alert("Failed to process uploaded image.");
        } finally {
          setIsComparing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const baseOrdersWithImages = reactExports.useMemo(() => {
    let list = allOrders.filter((o) => o.imageBase64 || o.image_url || o.warningBase64 || o.secondaryImages && o.secondaryImages.length > 0 || o.proof_urls || o.primary_urls);
    return list.sort((a, b) => Number(b.id) - Number(a.id));
  }, [allOrders]);
  const ordersWithImages = reactExports.useMemo(() => {
    let list = baseOrdersWithImages;
    if (filterText) {
      const q = filterText.toLowerCase();
      list = list.filter((o) => [o.insta, o.name, o.phone, o.place, o.box_name, o.sheet_name].some((f) => String(f || "").toLowerCase().includes(q)));
    }
    return list;
  }, [baseOrdersWithImages, filterText]);
  reactExports.useEffect(() => {
    if (!targetHash) return;
    let isActive = true;
    const hashImages = async () => {
      setIsComparing(true);
      const newHashes = new Map(hashedOrders);
      for (const order of baseOrdersWithImages) {
        if (!isActive) break;
        const key = `${order.id}-${order.sheet_name}`;
        if (newHashes.has(key)) continue;
        const srcs = [];
        if (order.imageBase64) srcs.push(order.imageBase64.startsWith("data:") ? order.imageBase64 : `data:image/jpeg;base64,${order.imageBase64}`);
        if (order.image_url) srcs.push(order.image_url);
        if (order.secondaryImages) {
          order.secondaryImages.forEach((img) => srcs.push(img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`));
        }
        if (order.proof_urls) {
          String(order.proof_urls).split(",").filter(Boolean).forEach((url) => srcs.push(url));
        }
        if (order.primary_urls) {
          String(order.primary_urls).split(",").filter(Boolean).forEach((url) => srcs.push(url));
        }
        const hashes = [];
        for (const src of srcs) {
          try {
            const h = await getImageHash(src);
            hashes.push(h);
          } catch (e) {
          }
        }
        newHashes.set(key, hashes);
        await new Promise((r) => setTimeout(r, 10));
      }
      if (isActive) {
        setHashedOrders(newHashes);
        setIsComparing(false);
      }
    };
    hashImages();
    return () => {
      isActive = false;
    };
  }, [baseOrdersWithImages, targetHash]);
  const displayedOrders = reactExports.useMemo(() => {
    let list = ordersWithImages;
    if (targetHash) {
      list = list.filter((order) => {
        const key = `${order.id}-${order.sheet_name}`;
        const hashes = hashedOrders.get(key) || [];
        return hashes.some((h) => hammingDistance(targetHash, h) <= 12);
      });
    }
    return list;
  }, [ordersWithImages, targetHash, hashedOrders]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[100] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/30 backdrop-blur-sm", onClick: onClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 bg-card w-full h-full flex flex-col max-w-4xl mx-auto lg:my-4 lg:rounded-2xl lg:max-h-[calc(100vh-2rem)] lg:border lg:border-border lg:shadow-2xl overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between bg-secondary/50 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: "📷 Image Search" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Find orders by comparing proof & warning images" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border bg-card shrink-0 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => cameraRef.current?.click(), className: "flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 18 }),
            " Take Photo"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileRef.current?.click(), className: "flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-xl transition-colors text-sm border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18 }),
            " Upload"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: cameraRef, type: "file", accept: "image/*", capture: "environment", onChange: handleFile, className: "hidden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", onChange: handleFile, className: "hidden" }),
        capturedImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: capturedImage, alt: "Captured", className: "w-full max-h-48 object-contain rounded-xl border border-border bg-secondary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setCapturedImage(null);
            setTargetHash(null);
            setFilterText("");
          }, className: "absolute top-2 right-2 p-1 bg-foreground/70 text-background rounded-full hover:bg-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) }),
          isComparing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-primary flex items-center justify-center gap-1 mt-1 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }),
            " Scanning images for match..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1 text-center", children: "Showing best matches below" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative border-t border-border pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-[calc(50%+6px)] -translate-y-1/2 text-muted-foreground", size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: filterText,
              onChange: (e) => setFilterText(e.target.value),
              placeholder: "Filter by name, phone, box...",
              className: "w-full bg-secondary border border-border text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 font-medium"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 custom-scrollbar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-medium", children: [
            displayedOrders.length,
            " ",
            targetHash && !isComparing ? "matching " : "",
            "orders found"
          ] }),
          isComparing && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary flex items-center gap-1 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }),
            " Processing"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: displayedOrders.map((order) => {
          const key = `${order.id}-${order.sheet_name}`;
          const formatImg = (img) => {
            if (!img) return null;
            if (img.startsWith("http") || img.startsWith("data:")) return img;
            if (img.length > 100) return `data:image/jpeg;base64,${img}`;
            return img;
          };
          const imgB64 = typeof order.imageBase64 === "string" ? order.imageBase64 : "";
          const warnB64 = typeof order.warningBase64 === "string" ? order.warningBase64 : "";
          const primaryUrl1 = order.primary_urls ? String(order.primary_urls).split(",").filter(Boolean)[0] : "";
          const proofUrl1 = order.proof_urls ? String(order.proof_urls).split(",").filter(Boolean)[0] : "";
          const proofSrc = formatImg(proofUrl1) || (imgB64 ? formatImg(imgB64) : order.image_url || null);
          const primarySrc = formatImg(primaryUrl1);
          const warningSrc = formatImg(warnB64);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => onOrderClick(order), className: "bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-0.5", children: [
              proofSrc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: proofSrc, alt: "Proof", referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded", children: "PROOF" })
              ] }),
              primarySrc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: primarySrc, alt: "Primary", referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded", children: "PRIMARY" })
              ] }),
              warningSrc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: warningSrc, alt: "Warning", referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-1 bg-amber-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded", children: "WARNING" })
              ] }),
              order.secondaryImages?.map((img, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-secondary flex items-center justify-center overflow-hidden relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`, alt: `Proof ${i + 2}`, referrerPolicy: "no-referrer", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute top-1 left-1 bg-primary/60 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded", children: [
                  "+",
                  i + 1
                ] })
              ] }, i)),
              !proofSrc && !primarySrc && !warningSrc && !order.secondaryImages?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl opacity-20", children: "👕" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-1 mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-xs truncate flex-1", children: order.name || order.insta || "-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-bold text-xs whitespace-nowrap", children: Number(String(order.price).replace(/[^0-9.-]+/g, "")).toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "#",
                  order.id,
                  " · ",
                  order.sheet_name
                ] }),
                order.box_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
                  "📦 ",
                  order.box_name
                ] })
              ] })
            ] })
          ] }, key);
        }) }),
        displayedOrders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center", children: isComparing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin mx-auto text-primary mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Scanning images..." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl mb-3 opacity-30", children: "📷" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: targetHash ? "No exact matches found" : "No orders with images found" })
        ] }) })
      ] })
    ] })
  ] });
};
export {
  CameraSearchModal as default
};
