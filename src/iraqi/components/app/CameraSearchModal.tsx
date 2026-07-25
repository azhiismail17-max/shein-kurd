import React, { useState, useRef, useMemo, useEffect } from "react";
import { Order } from "@/iraqi/types";
import { X, Camera, Upload, ArrowLeft, Search, Loader2 } from "lucide-react";
import { getWarningImageSource } from "@/lib/warning-image";

const getImageHash = async (src: string): Promise<string> => {
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

const hammingDistance = (hash1: string, hash2: string): number => {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 999;
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
};

interface Props {
  allOrders: Order[];
  onOrderClick: (order: Order) => void;
  onClose: () => void;
}

const CameraSearchModal: React.FC<Props> = ({ allOrders, onOrderClick, onClose }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [targetHash, setTargetHash] = useState<string | null>(null);
  const [hashedOrders, setHashedOrders] = useState<Map<string, string[]>>(new Map()); // map of order key -> [hash1, hash2, ...]

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
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

  // Get all orders that have images (proof or warning)
  const baseOrdersWithImages = useMemo(() => {
    const list = allOrders.filter(
      (o) =>
        o.imageBase64 ||
        o.image_url ||
        getWarningImageSource(o as any) ||
        (o.secondaryImages && o.secondaryImages.length > 0) ||
        o.proof_urls ||
        o.primary_urls,
    );
    return list.sort((a, b) => Number(b.id) - Number(a.id));
  }, [allOrders]);

  const ordersWithImages = useMemo(() => {
    let list = baseOrdersWithImages;
    if (filterText) {
      const q = filterText.toLowerCase();
      list = list.filter((o) =>
        [o.insta, o.name, o.phone, o.place, o.box_name, o.sheet_name].some((f) =>
          String(f || "")
            .toLowerCase()
            .includes(q),
        ),
      );
    }
    return list;
  }, [baseOrdersWithImages, filterText]);

  // Background hashing
  useEffect(() => {
    if (!targetHash) return; // Only pre-hash or hash if needed. Actually we can do on the fly or just pre-hash

    let isActive = true;

    const hashImages = async () => {
      setIsComparing(true);
      const newHashes = new Map(hashedOrders);

      for (const order of baseOrdersWithImages) {
        if (!isActive) break;
        const key = `${order.id}-${order.sheet_name}`;
        if (newHashes.has(key)) continue;

        const srcs: string[] = [];

        if (order.imageBase64)
          srcs.push(
            order.imageBase64.startsWith("data:")
              ? order.imageBase64
              : `data:image/jpeg;base64,${order.imageBase64}`,
          );
        if (order.image_url) srcs.push(order.image_url);
        if (order.secondaryImages) {
          order.secondaryImages.forEach((img) =>
            srcs.push(img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`),
          );
        }
        if (order.proof_urls) {
          String(order.proof_urls)
            .split(",")
            .filter(Boolean)
            .forEach((url) => srcs.push(url));
        }
        if (order.primary_urls) {
          String(order.primary_urls)
            .split(",")
            .filter(Boolean)
            .forEach((url) => srcs.push(url));
        }

        const hashes = [];
        for (const src of srcs) {
          try {
            const h = await getImageHash(src);
            hashes.push(h);
          } catch (e) {
            // ignore
          }
        }
        newHashes.set(key, hashes);
        // Maybe yield slightly to not block ui
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

  const displayedOrders = useMemo(() => {
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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card w-full h-full flex flex-col max-w-4xl mx-auto lg:my-4 lg:rounded-2xl lg:max-h-[calc(100vh-2rem)] lg:border lg:border-border lg:shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/50 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="font-bold text-lg">📷 Image Search</h2>
              <p className="text-muted-foreground text-xs">
                Find orders by comparing proof & warning images
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Capture area */}
        <div className="p-4 border-b border-border bg-card shrink-0 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <Camera size={18} /> Take Photo
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 rounded-xl transition-colors text-sm border border-border"
            >
              <Upload size={18} /> Upload
            </button>
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />

          {capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full max-h-48 object-contain rounded-xl border border-border bg-secondary"
              />
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setTargetHash(null);
                  setFilterText("");
                }}
                className="absolute top-2 right-2 p-1 bg-foreground/70 text-background rounded-full hover:bg-foreground transition-colors"
              >
                <X size={14} />
              </button>
              {isComparing ? (
                <p className="text-[10px] text-primary flex items-center justify-center gap-1 mt-1 font-medium">
                  <Loader2 size={12} className="animate-spin" /> Scanning images for match...
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-1 text-center">
                  Showing best matches below
                </p>
              )}
            </div>
          )}

          <div className="relative border-t border-border pt-3">
            <Search
              className="absolute left-3 top-[calc(50%+6px)] -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by name, phone, box..."
              className="w-full bg-secondary border border-border text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 font-medium"
            />
          </div>
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-end mb-3">
            <p className="text-xs text-muted-foreground font-medium">
              {displayedOrders.length} {targetHash && !isComparing ? "matching " : ""}orders found
            </p>
            {isComparing && (
              <span className="text-xs text-primary flex items-center gap-1 font-medium">
                <Loader2 size={12} className="animate-spin" /> Processing
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedOrders.map((order) => {
              const key = `${order.id}-${order.sheet_name}`;
              const formatImg = (img: string) => {
                if (!img) return null;
                if (img.startsWith("http") || img.startsWith("data:")) return img;
                if (img.length > 100) return `data:image/jpeg;base64,${img}`;
                return img;
              };

              const imgB64 = typeof order.imageBase64 === "string" ? order.imageBase64 : "";
              const warnB64 = getWarningImageSource(order as any);

              const primaryUrls = order.primary_urls
                ? String(order.primary_urls)
                    .split(",")
                    .map((url) => url.trim())
                    .filter(Boolean)
                : [];
              const proofUrl1 = order.proof_urls
                ? String(order.proof_urls).split(",").filter(Boolean)[0]
                : "";

              const proofSrc =
                formatImg(proofUrl1) || (imgB64 ? formatImg(imgB64) : order.image_url || null);
              const primarySrcs = primaryUrls.map(formatImg).filter(Boolean) as string[];
              const warningSrc = formatImg(warnB64);

              return (
                <div
                  key={key}
                  onClick={() => onOrderClick(order)}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="grid grid-cols-1 gap-0.5">
                    {proofSrc && (
                      <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden relative">
                        <img
                          src={proofSrc}
                          alt="Proof"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                          PROOF
                        </span>
                      </div>
                    )}
                    {primarySrcs.map((primarySrc, i) => (
                      <div
                        key={`primary-${i}`}
                        className="aspect-square bg-secondary flex items-center justify-center overflow-hidden relative"
                      >
                        <img
                          src={primarySrc}
                          alt={`Primary ${i + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-1 left-1 bg-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                          PRIMARY {primarySrcs.length > 1 ? i + 1 : ""}
                        </span>
                      </div>
                    ))}
                    {warningSrc && (
                      <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden relative">
                        <img
                          src={warningSrc}
                          alt="Warning"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-1 left-1 bg-amber-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          WARNING
                        </span>
                      </div>
                    )}
                    {order.secondaryImages?.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-secondary flex items-center justify-center overflow-hidden relative"
                      >
                        <img
                          src={img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`}
                          alt={`Proof ${i + 2}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-1 left-1 bg-primary/60 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                          +{i + 1}
                        </span>
                      </div>
                    ))}
                    {!proofSrc &&
                      primarySrcs.length === 0 &&
                      !warningSrc &&
                      !order.secondaryImages?.length && (
                        <div className="aspect-square bg-secondary flex items-center justify-center">
                          <span className="text-2xl opacity-20">👕</span>
                        </div>
                      )}
                  </div>
                  <div className="p-2.5">
                    <div className="flex justify-between items-start gap-1 mb-0.5">
                      <span className="font-semibold text-xs truncate flex-1">
                        {order.name || order.insta || "-"}
                      </span>
                      <span className="text-primary font-bold text-xs whitespace-nowrap">
                        {Number(String(order.price).replace(/[^0-9.-]+/g, "")).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex justify-between">
                      <span>
                        #{order.id} · {order.sheet_name}
                      </span>
                      {order.box_name && <span className="text-primary">📦 {order.box_name}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {displayedOrders.length === 0 && (
            <div className="py-16 text-center">
              {isComparing ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
                  <p className="text-muted-foreground text-sm">Scanning images...</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-3 opacity-30">📷</div>
                  <p className="text-muted-foreground text-sm">
                    {targetHash ? "No exact matches found" : "No orders with images found"}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraSearchModal;
