import {
  compact,
  extractIdentifiers,
  getProductSignals,
  normalize,
  normalizeBoxName,
  normalizeLink,
  scoreOrderAgainstProduct,
} from "@/lib/sku-match";
import { lookupSku, lookupSkuInIndex, primeSkuIndex, toPinCode } from "@/lib/sku-lookup";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ExternalLink,
  Keyboard,
  Loader2,
  ScanBarcode,
  Search,
  X,
} from "lucide-react";
import { SkuNumberScanner } from "./SkuNumberScanner";
import { preloadSkuLabelReader } from "./skuOcrWorker";

// Codes are stored as a 6-7 digit tail, so the field behaves like a PIN pad.
// Searching starts at four digits because the downloaded index answers that
// for free; a full six or seven is what narrows it to one product.
const PIN_MIN_DIGITS = 4;
const PIN_FULL_DIGITS = 6;
const PIN_MAX_DIGITS = 7;
const skuSearchCache = new Map<string, ApiResult[]>();

export interface SkuSearchOrder {
  id: string | number;
  sheet_name: string;
  insta: string;
  name?: string;
  link?: string;
  box_name?: string;
  sku?: string;
}

interface FastSkuSearchProps<T extends SkuSearchOrder> {
  orders: T[];
  onFound: (order: T) => void;
  getOrderBoxName: (order: T) => string;
  boxOptions?: string[];
  initialBoxName?: string;
}

interface ApiResult {
  name?: string;
  customer?: string;
  insta?: string;
  username?: string;
  link?: string;
  url?: string;
  productLink?: string;
  quantity?: string | number;
  pcs?: string | number;
  sku?: string;
  SKU?: string;
  code?: string;
  product_code?: string;
  box?: string;
  box_name?: string;
  boxName?: string;
  [key: string]: unknown;
}

interface PreparedOrder<T extends SkuSearchOrder> {
  order: T;
  box: string;
  searchText: string;
  compactText: string;
  link: string;
  productKey: string;
}

const dedupeApiResults = (results: ApiResult[]) => {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = [
      result.link || result.url || result.productLink,
      result.sku || result.SKU || result.code,
      result.name || result.customer,
    ]
      .map(compact)
      .join("|");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getOrderSearchValues = (order: SkuSearchOrder) => {
  const data = order as unknown as Record<string, unknown>;
  return [
    data.sku,
    data.product_sku,
    data.code,
    data.product_code,
    data.barcode,
    data.barcode_no,
    data.link,
    data.name,
    data.insta,
    data.note,
    data.extra,
    data.pics_text,
    data.trackNo,
    data.orderNo,
    data.unique_order_id,
  ].filter((value) => value !== undefined && value !== null && value !== "");
};

const scorePreparedOrder = <T extends SkuSearchOrder>(
  prepared: PreparedOrder<T>,
  query: string,
) => {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return 0;

  const identifiers = extractIdentifiers(query);
  let score = 0;

  for (const identifier of identifiers) {
    if (prepared.compactText.includes(identifier)) score = Math.max(score, 140);
  }

  if (prepared.searchText.includes(normalizedQuery)) score = Math.max(score, 90);

  const compactQuery = compact(query);
  if (compactQuery.length >= 4 && prepared.compactText.includes(compactQuery))
    score = Math.max(score, 75);

  const words = normalizedQuery.match(/[a-z0-9]{2,}/g) || [];
  const matchingWords = words.filter(
    (word) => prepared.searchText.includes(word) || prepared.compactText.includes(word),
  );
  if (matchingWords.length > 0) score = Math.max(score, 20 + matchingWords.length * 8);

  return score;
};

const matchOrders = <T extends SkuSearchOrder>(
  preparedOrders: PreparedOrder<T>[],
  query: string,
  limit = 20,
) =>
  preparedOrders
    .map((prepared) => ({ prepared, score: scorePreparedOrder(prepared, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.prepared.order);

export function FastSkuSearch<T extends SkuSearchOrder>({
  orders,
  onFound,
  getOrderBoxName,
  boxOptions = [],
  initialBoxName = "",
}: FastSkuSearchProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [skuQuery, setSkuQuery] = useState("");
  const [selectedBox, setSelectedBox] = useState(initialBoxName);
  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);
  const [lastHardwareScan, setLastHardwareScan] = useState("");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestNumberRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const hardwareBufferRef = useRef("");
  const hardwareFirstKeyRef = useRef(0);
  const hardwareLastKeyRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const preparedOrders = useMemo<PreparedOrder<T>[]>(
    () =>
      orders.map((order) => {
        const values = getOrderSearchValues(order);
        const link = normalizeLink(order.link);
        return {
          order,
          box: normalizeBoxName(getOrderBoxName(order) || order.box_name),
          searchText: normalize(values.join(" ")),
          compactText: compact(values.join(" ")),
          link,
          productKey: compact(link),
        };
      }),
    [orders, getOrderBoxName],
  );

  const scopedOrders = useMemo(() => {
    const wantedBox = normalizeBoxName(selectedBox);
    return wantedBox ? preparedOrders.filter((order) => order.box === wantedBox) : preparedOrders;
  }, [preparedOrders, selectedBox]);

  const localMatches = useMemo(() => matchOrders(scopedOrders, skuQuery), [scopedOrders, skuQuery]);

  const findOrdersForApiResult = (result: ApiResult) => {
    // Only the code that was scanned and the product's own codes and link may
    // identify an order. The customer name and product title are left out on
    // purpose - they are prose, and matching on prose is what pulled in other
    // people's boxes.
    const signals = getProductSignals({
      identifierSources: [skuQuery, result.sku, result.SKU, result.code, result.product_code],
      link: result.link || result.url || result.productLink,
    });

    const ranked = scopedOrders
      .map((prepared) => ({ prepared, score: scoreOrderAgainstProduct(prepared, signals) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // The same customer can have several rows in one box. Showing "Box 48 -
    // @lx.dimen" twice tells the packer nothing, so one chip per box+customer.
    const seen = new Set<string>();
    const unique = [];
    for (const { prepared } of ranked) {
      const order = prepared.order;
      const key = `${normalizeBoxName(getOrderBoxName(order) || order.box_name)}|${compact(
        order.insta || order.name,
      )}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(order);
    }
    return unique;
  };

  // Same cross-reference the API-result cards use, but for a code read straight
  // off a label by the camera: which box(es) actually hold this product. Scoped
  // to scopedOrders, so a box already selected here also narrows what the live
  // scanner shows - selecting Box 120 first means only Box 120's matches count.
  const matchOwnerBoxes = (owner: { sku?: string; link?: string }, code: string): string[] => {
    const signals = getProductSignals({
      identifierSources: [code, owner.sku],
      link: owner.link,
    });
    const boxes = new Set<string>();
    for (const prepared of scopedOrders) {
      if (scoreOrderAgainstProduct(prepared, signals) > 0) {
        const box = getOrderBoxName(prepared.order) || prepared.order.box_name;
        if (box) boxes.add(String(box));
      }
    }
    return [...boxes];
  };

  const visibleApiResults = apiResults
    .map((result) => ({
      result,
      localMatches: findOrdersForApiResult(result),
    }))
    .filter((item) => !selectedBox || item.localMatches.length > 0);

  const closeSearch = () => {
    requestNumberRef.current += 1;
    abortRef.current?.abort();
    setIsScannerOpen(false);
    setIsOpen(false);
    setIsSearching(false);
  };

  const openSearch = () => {
    preloadSkuLabelReader();
    // Pull the codes down while the user is still reaching for the scanner, so
    // the first scan is answered from memory rather than over the network.
    void primeSkuIndex();
    setSelectedBox(initialBoxName);
    setSkuQuery("");
    setApiResults([]);
    setLastHardwareScan("");
    hardwareBufferRef.current = "";
    setIsScannerOpen(false);
    setIsOpen(true);
  };

  const chooseOrder = (order: T) => {
    closeSearch();
    onFound(order);
  };

  useEffect(() => {
    if (!isOpen) return;
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isScannerOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        closeSearch();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isScannerOpen]);

  useEffect(() => {
    if (!isOpen || isScannerOpen) return;

    const handleHardwareScanner = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const now = performance.now();

      if (event.key === "Enter" || event.key === "Tab") {
        const scannedValue = hardwareBufferRef.current.trim();
        const scanDuration = now - hardwareFirstKeyRef.current;
        hardwareBufferRef.current = "";

        // HID scanners type a fast burst and finish with Enter or Tab. Capture it
        // even when the search input is not focused.
        if (scannedValue.length >= 6 && scanDuration <= 2500) {
          event.preventDefault();
          setLastHardwareScan(scannedValue);
          setSkuQuery(toPinCode(scannedValue, PIN_MAX_DIGITS));
          setApiResults([]);
          window.requestAnimationFrame(() => inputRef.current?.focus());
        }
        return;
      }

      if (event.key.length !== 1) return;
      if (now - hardwareLastKeyRef.current > 120) {
        hardwareBufferRef.current = "";
        hardwareFirstKeyRef.current = now;
      }
      hardwareBufferRef.current += event.key;
      hardwareLastKeyRef.current = now;
    };

    window.addEventListener("keydown", handleHardwareScanner, true);
    return () => window.removeEventListener("keydown", handleHardwareScanner, true);
  }, [isOpen, isScannerOpen]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    abortRef.current?.abort();
    const requestNumber = ++requestNumberRef.current;

    // Nothing to look up until there are at least a few digits. Four is enough
    // for the local index; the lookup itself only goes to the network once the
    // full code is there, so typing towards it costs no requests.
    if (!isOpen || skuQuery.length < PIN_MIN_DIGITS) {
      setApiResults([]);
      setIsSearching(false);
      return;
    }

    const cached = skuSearchCache.get(skuQuery);
    if (cached) {
      // Re-typing or backspacing to a code already looked up is instant.
      setApiResults(dedupeApiResults(cached));
      setIsSearching(false);
      return;
    }

    // The downloaded index answers in the same frame - no request, no debounce
    // and no spinner, which is the only way this can feel immediate.
    const fromIndex = lookupSkuInIndex(skuQuery);
    if (fromIndex) {
      skuSearchCache.set(skuQuery, fromIndex);
      setApiResults(dedupeApiResults(fromIndex));
      setIsSearching(false);
      return;
    }

    setApiResults([]);
    timeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      const abortTimer = window.setTimeout(() => controller.abort(), 15000);
      setIsSearching(true);

      try {
        const { results } = await lookupSku(skuQuery, controller.signal);
        skuSearchCache.set(skuQuery, results);
        if (skuSearchCache.size > 100) {
          const firstKey = skuSearchCache.keys().next().value;
          if (firstKey) skuSearchCache.delete(firstKey);
        }
        if (requestNumber === requestNumberRef.current) {
          setApiResults(dedupeApiResults(results));
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error("SKU Search error", error);
      } finally {
        window.clearTimeout(abortTimer);
        if (requestNumber === requestNumberRef.current) setIsSearching(false);
      }
    }, 60);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [skuQuery, isOpen]);

  const handleScannedText = (value: string) => {
    setSkuQuery(toPinCode(value, PIN_MAX_DIGITS));
    setIsScannerOpen(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="relative min-w-0" ref={containerRef}>
      <button
        type="button"
        onClick={openSearch}
        className="flex w-full items-center justify-center rounded-lg border border-transparent bg-transparent p-2 text-muted-foreground transition-all hover:bg-secondary sm:w-auto"
        title="Fast SKU Search"
      >
        <ScanBarcode size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
            onClick={closeSearch}
          />
          <div className="fixed left-3 right-3 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[26rem]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <ScanBarcode size={18} className="text-primary" />
                Fast SKU Search
              </h3>
              <button
                type="button"
                onClick={closeSearch}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                aria-label="Close SKU search"
              >
                <X size={18} />
              </button>
            </div>

            {boxOptions.length > 0 && (
              <div className="mb-3">
                <select
                  value={selectedBox}
                  onChange={(event) => {
                    setSelectedBox(event.target.value);
                    window.requestAnimationFrame(() => inputRef.current?.focus());
                  }}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                >
                  <option value="">All boxes</option>
                  {boxOptions.map((box) => (
                    <option key={box} value={box}>
                      Box {String(box).replace(/^box[\s-]*/i, "")}
                    </option>
                  ))}
                </select>
                {selectedBox && (
                  <p className="mt-1.5 text-[11px] font-medium text-primary">
                    Box {selectedBox.replace(/^box[\s-]*/i, "")} stays selected while you type or
                    scan.
                  </p>
                )}
              </div>
            )}

            <div className="relative mb-2 flex items-center">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 text-muted-foreground"
              />
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={PIN_MAX_DIGITS}
                placeholder="000000"
                value={skuQuery}
                // Digits only, never longer than the stored code. Pasting or
                // scanning a full label keeps its last 7 digits, which is the
                // exact form the codes are saved in.
                onChange={(event) => setSkuQuery(toPinCode(event.target.value, PIN_MAX_DIGITS))}
                className="w-full rounded-lg border border-border bg-secondary py-2.5 pl-10 pr-20 text-center font-mono text-lg font-bold tracking-[0.35em] text-foreground transition-colors placeholder:font-normal placeholder:tracking-[0.35em] placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Product code, 6 or 7 digits"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {isSearching && <Loader2 size={15} className="animate-spin text-primary" />}
                {skuQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSkuQuery("");
                      setApiResults([]);
                      inputRef.current?.focus();
                    }}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90"
                  title="Scan product barcode with camera"
                  aria-label="Scan product barcode with camera"
                >
                  <Camera size={15} />
                </button>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-primary/5 px-2.5 py-1.5 text-[10px] font-semibold text-primary">
              <span className="flex min-w-0 items-center gap-1.5">
                <Keyboard size={13} className="shrink-0" />
                <span className="truncate">Bluetooth / USB laser ready</span>
              </span>
              {/* Nothing is sent until the code is complete, so say how far along it is. */}
              <span className="shrink-0 tabular-nums">
                {lastHardwareScan
                  ? "Scan received"
                  : skuQuery.length === 0
                    ? `${PIN_FULL_DIGITS}-${PIN_MAX_DIGITS} digits`
                    : skuQuery.length < PIN_MIN_DIGITS
                      ? `${PIN_MIN_DIGITS - skuQuery.length} more digit${
                          PIN_MIN_DIGITS - skuQuery.length === 1 ? "" : "s"
                        }`
                      : `${skuQuery.length} digits`}
              </span>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-0.5">
              {localMatches.length > 0 && (
                <div className="rounded-lg border border-primary/25 bg-primary/5 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary">
                    <CheckCircle2 size={14} /> Found instantly
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {localMatches.map((order) => {
                      const boxName = getOrderBoxName(order);
                      return (
                        <button
                          type="button"
                          key={`${order.sheet_name}-${order.id}`}
                          onClick={() => chooseOrder(order)}
                          className="min-w-0 rounded-md bg-card px-2.5 py-2 text-left text-xs font-semibold text-foreground shadow-sm ring-1 ring-border hover:bg-secondary"
                        >
                          <span className="block truncate">
                            @{order.insta || order.name || "Unknown"}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-primary">
                            {boxName ? `Box ${boxName}` : "No Box"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {visibleApiResults.map(({ result, localMatches: resultOrders }, index) => {
                const fallbackBox = selectedBox
                  ? ""
                  : result.box || result.box_name || result.boxName || "";
                return (
                  <div
                    key={`${compact(result.link || result.sku || result.name)}-${index}`}
                    className="space-y-3 rounded-lg border border-border bg-secondary/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold">
                          {result.name || result.customer || "Unknown Customer"}
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {result.quantity || result.pcs || 0} pieces
                        </p>
                        {resultOrders.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {resultOrders.slice(0, 12).map((order) => {
                              const boxName = getOrderBoxName(order);
                              return (
                                <button
                                  type="button"
                                  key={`${order.sheet_name}-${order.id}`}
                                  onClick={() => chooseOrder(order)}
                                  className="inline-flex items-center rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                                >
                                  {boxName ? `Box ${boxName}` : "No Box"} - @
                                  {order.insta || order.name || "Unknown"}
                                </button>
                              );
                            })}
                            {resultOrders.length > 12 && (
                              <span className="inline-flex items-center rounded bg-secondary px-2 py-1 text-xs font-semibold text-muted-foreground">
                                +{resultOrders.length - 12} more
                              </span>
                            )}
                          </div>
                        ) : fallbackBox ? (
                          <p className="mt-1 inline-flex rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            Box {String(fallbackBox).replace(/^box[\s-]*/i, "")}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 rounded bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-green-600">
                        Match
                      </span>
                    </div>

                    {result.link && (
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        <ExternalLink size={14} /> View Product
                      </a>
                    )}
                  </div>
                );
              })}

              {skuQuery.length >= PIN_MIN_DIGITS &&
                localMatches.length === 0 &&
                visibleApiResults.length === 0 &&
                !isSearching && (
                  <div className="px-2 py-7 text-center text-sm text-muted-foreground">
                    No product found for {skuQuery}.
                  </div>
                )}

              {skuQuery.length > 0 && skuQuery.length < PIN_MIN_DIGITS && (
                <div className="px-2 py-7 text-center text-sm text-muted-foreground opacity-75">
                  Keep typing - searching starts at {PIN_MIN_DIGITS} digits.
                </div>
              )}

              {skuQuery.length === 0 && (
                <div className="px-2 py-7 text-center text-sm text-muted-foreground opacity-75">
                  Type the {PIN_FULL_DIGITS}-{PIN_MAX_DIGITS} digit code, scan with the laser, or
                  tap the camera.
                </div>
              )}
            </div>
          </div>

          {isScannerOpen && (
            <SkuNumberScanner
              onScan={handleScannedText}
              onClose={() => setIsScannerOpen(false)}
              maxDigits={PIN_MAX_DIGITS}
              boxOptions={boxOptions}
              selectedBox={selectedBox}
              onSelectedBoxChange={setSelectedBox}
              matchOwnerBoxes={matchOwnerBoxes}
            />
          )}
        </>
      )}
    </div>
  );
}
