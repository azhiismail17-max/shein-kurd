import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Link2,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  WalletCards,
  X,
} from "lucide-react";
import { GiftCard, Order, SCRIPT_URL } from "@/types";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface GiftCardsViewProps {
  role: string;
  giftCards: GiftCard[];
  onRefresh: () => void;
  orders?: Order[];
  viewingMonth?: string;
}

const CARD_PRICES = [100, 300, 500, 800, 1000];
const PAYMENT_OPTIONS = ["Zaincash", "Qi card", "Other"];
const LOCAL_GIFT_CARDS_KEY = "kurdistani_gift_cards_cache";
const LOCAL_GIFT_CARD_TS_KEY = "kurdistani_gift_cards_cache_ts";
const LOCAL_GIFT_CARD_RATES_KEY = "kurdistani_gift_card_iqd_rates";
const LOCAL_GIFT_CARD_BOX_PRICES_KEY = "kurdistani_gift_card_box_prices";
const LOCAL_GIFT_CARD_BOX_LOSSES_KEY = "kurdistani_gift_card_box_losses";
const DEFAULT_IQD_RATES = { Zaincash: 401865, "Qi card": 419250 };
// A local write is only trusted over the server's own copy of a card for this
// long. After that, the server (shared across every device) wins, so a card
// edited/spent on one device can't stay permanently stuck showing a stale
// snapshot on another device once the background sync has had time to land.
const RECENT_OPTIMISTIC_MS = 15000;

const money = (value: number) => `$${Number(value || 0).toLocaleString()}`;
const iqdMoney = (value: number) => `${Math.round(Number(value || 0)).toLocaleString()} IQD`;
const parseAmount = (value: string) => Number(String(value || "").replace(/[^0-9.-]+/g, "")) || 0;
const hasGiftCardBalance = (card: GiftCard) => Number(card.remaining || 0) > 0;
const sortGiftCardsByBalance = (cards: GiftCard[]) =>
  cards
    .map((card, index) => ({ card, index }))
    .sort(
      (a, b) =>
        Number(hasGiftCardBalance(b.card)) - Number(hasGiftCardBalance(a.card)) ||
        a.index - b.index,
    )
    .map(({ card }) => card);
const normalizeRateInput = (value: string) => String(value || "").replace(/[^0-9]/g, "");
const readLocalRates = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_GIFT_CARD_RATES_KEY) || "{}");
    return {
      Zaincash: Number(saved?.Zaincash || DEFAULT_IQD_RATES.Zaincash),
      "Qi card": Number(saved?.["Qi card"] || DEFAULT_IQD_RATES["Qi card"]),
    };
  } catch {
    return DEFAULT_IQD_RATES;
  }
};
const saveLocalRates = (rates: typeof DEFAULT_IQD_RATES) => {
  localStorage.setItem(LOCAL_GIFT_CARD_RATES_KEY, JSON.stringify(rates));
};
const getCardRate = (paymentMethod: string, rates: typeof DEFAULT_IQD_RATES) => {
  if (paymentMethod === "Qi card") return rates["Qi card"];
  if (paymentMethod === "Zaincash") return rates.Zaincash;
  return 0;
};
const usdToIqd = (usd: number, paymentMethod: string, rates: typeof DEFAULT_IQD_RATES) => {
  const rate = getCardRate(paymentMethod, rates);
  return rate > 0 ? (Number(usd || 0) / 300) * rate : 0;
};
const readLocalGiftCards = (): GiftCard[] => {
  try {
    const cards = JSON.parse(localStorage.getItem(LOCAL_GIFT_CARDS_KEY) || "[]");
    return Array.isArray(cards) ? cards : [];
  } catch {
    return [];
  }
};
const readLocalTimestamps = (): Record<string, number> => {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_GIFT_CARD_TS_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};
const touchLocalTimestamp = (id: string) => {
  const timestamps = readLocalTimestamps();
  timestamps[id] = Date.now();
  localStorage.setItem(LOCAL_GIFT_CARD_TS_KEY, JSON.stringify(timestamps));
};
const writeLocalGiftCard = (card: GiftCard) => {
  const cards = readLocalGiftCards();
  const next = [
    card,
    ...cards.filter(
      (saved) =>
        saved.id !== card.id &&
        !(saved.card_number === card.card_number && saved.card_pin === card.card_pin),
    ),
  ];
  localStorage.setItem(LOCAL_GIFT_CARDS_KEY, JSON.stringify(next));
  touchLocalTimestamp(card.id);
};
const updateLocalGiftCard = (id: string, updater: (card: GiftCard) => GiftCard) => {
  const cards = readLocalGiftCards();
  localStorage.setItem(
    LOCAL_GIFT_CARDS_KEY,
    JSON.stringify(cards.map((card) => (card.id === id ? updater(card) : card))),
  );
  touchLocalTimestamp(id);
};
const saveLocalGiftCardUpdate = (card: GiftCard, updater: (card: GiftCard) => GiftCard) => {
  const cards = readLocalGiftCards();
  const exists = cards.some((saved) => saved.id === card.id);
  const next = exists
    ? cards.map((saved) => (saved.id === card.id ? updater(saved) : saved))
    : [updater(card), ...cards];
  localStorage.setItem(LOCAL_GIFT_CARDS_KEY, JSON.stringify(next));
  touchLocalTimestamp(card.id);
};
const readBoxPrices = (): Record<string, number> => {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_GIFT_CARD_BOX_PRICES_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};
const writeBoxPrice = (cardId: string, boxKey: string, amount: number) => {
  const prices = readBoxPrices();
  prices[`${cardId}|${boxKey}`] = amount;
  localStorage.setItem(LOCAL_GIFT_CARD_BOX_PRICES_KEY, JSON.stringify(prices));
};
const readBoxLosses = (): Record<string, number> => {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_GIFT_CARD_BOX_LOSSES_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};
const writeBoxLoss = (boxKey: string, amount: number) => {
  const losses = readBoxLosses();
  losses[boxKey] = amount;
  localStorage.setItem(LOCAL_GIFT_CARD_BOX_LOSSES_KEY, JSON.stringify(losses));
};
const readScriptResponse = async (response: Response) => {
  const text = await response.text();
  let result: any = {};
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text || "Google Sheet returned an unreadable response.");
  }
  if (result?.status !== "success" && result?.result !== "success") {
    throw new Error(result?.message || "Google Sheet did not save the gift card.");
  }
  return result;
};

const fieldClass =
  "h-12 rounded-lg border border-border bg-background px-3 text-[15px] font-semibold outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10";
const labelClass = "text-[11px] font-bold uppercase tracking-wide text-muted-foreground";

const GiftCardsView: React.FC<GiftCardsViewProps> = ({
  role,
  giftCards,
  onRefresh,
  orders = [],
  viewingMonth = "",
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardPin, setCardPin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Zaincash");
  const [paymentOther, setPaymentOther] = useState("");
  const [cardPrice, setCardPrice] = useState("300");
  const [notes, setNotes] = useState("");
  const [spendInputs, setSpendInputs] = useState<Record<string, string>>({});
  const [boxInputs, setBoxInputs] = useState<Record<string, { boxKey: string; amount: string }>>(
    {},
  );
  const [boxBuyInputs, setBoxBuyInputs] = useState<Record<string, string>>({});
  const [boxLossInputs, setBoxLossInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [localCards, setLocalCards] = useState<GiftCard[]>(() => readLocalGiftCards());
  const [iqdRates, setIqdRates] = useState(() => readLocalRates());
  const [boxPrices, setBoxPrices] = useState<Record<string, number>>(() => readBoxPrices());
  const [boxLosses, setBoxLosses] = useState<Record<string, number>>(() => readBoxLosses());

  useEffect(() => {
    setLocalCards(readLocalGiftCards());
  }, [giftCards]);

  const displayedCards = useMemo(() => {
    // Server data (shared by every device) always wins once a local edit has
    // had time to sync — otherwise a card touched on one device stays pinned
    // to that device's own stale snapshot forever, even after other devices
    // update it. Local data only fills in (a) brand-new cards the server
    // doesn't know about yet, or (b) an edit still inside its brief
    // optimistic window, so this device's own action still feels instant.
    const timestamps = readLocalTimestamps();
    const now = Date.now();
    const isRecent = (id: string) => now - (timestamps[id] || 0) < RECENT_OPTIMISTIC_MS;
    const findLocalMatch = (serverCard: GiftCard) =>
      localCards.find(
        (card) =>
          card.id === serverCard.id ||
          (card.card_number === serverCard.card_number && card.card_pin === serverCard.card_pin),
      );

    const usedLocalIds = new Set<string>();
    const merged = giftCards.map((serverCard) => {
      const localMatch = findLocalMatch(serverCard);
      if (!localMatch) return serverCard;
      usedLocalIds.add(localMatch.id);
      return isRecent(localMatch.id) ? localMatch : serverCard;
    });
    for (const localCard of localCards) {
      if (!usedLocalIds.has(localCard.id)) merged.push(localCard);
    }
    return sortGiftCardsByBalance(merged);
  }, [giftCards, localCards]);

  const availableCards = useMemo(() => displayedCards.filter(hasGiftCardBalance), [displayedCards]);
  const visibleCards = useMemo(
    () => (filter === "available" ? availableCards : displayedCards),
    [availableCards, displayedCards, filter],
  );
  const boxOptions = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        label: string;
        boxName: string;
        sheetName: string;
        rowIds: (string | number)[];
        loss: number;
      }
    >();
    for (const order of orders) {
      const boxName = String(order.box_name || "").trim();
      if (!boxName) continue;
      const sheetName = String(order.sheet_name || viewingMonth || "").trim();
      const key = `${sheetName}:${boxName}`;
      const current = map.get(key) || {
        key,
        label: sheetName ? `${sheetName} - ${boxName}` : boxName,
        boxName,
        sheetName,
        rowIds: [],
        loss: 0,
      };
      current.rowIds.push(order.id);
      const orderLoss = parseAmount(String(order.lost || ""));
      if (orderLoss > 0) current.loss = orderLoss;
      map.set(key, current);
    }
    return Array.from(map.values()).sort((a, b) =>
      b.label.localeCompare(a.label, undefined, { numeric: true }),
    );
  }, [orders, viewingMonth]);
  const boxInfo = useMemo(() => new Map(boxOptions.map((box) => [box.key, box])), [boxOptions]);

  const totals = useMemo(
    () => ({
      value: displayedCards.reduce((sum, card) => sum + Number(card.card_price || 0), 0),
      spent: displayedCards.reduce((sum, card) => sum + Number(card.spent || 0), 0),
      remaining: displayedCards.reduce((sum, card) => sum + Number(card.remaining || 0), 0),
      spentIqd: displayedCards.reduce(
        (sum, card) => sum + usdToIqd(Number(card.spent || 0), card.payment_method, iqdRates),
        0,
      ),
      remainingIqd: displayedCards.reduce(
        (sum, card) => sum + usdToIqd(Number(card.remaining || 0), card.payment_method, iqdRates),
        0,
      ),
      linked: displayedCards.reduce((sum, card) => sum + (card.linked_boxes?.length || 0), 0),
      active: displayedCards.filter((card) => Number(card.remaining || 0) > 0).length,
    }),
    [displayedCards, iqdRates],
  );

  const updateIqdRate = (method: keyof typeof DEFAULT_IQD_RATES, value: string) => {
    const next = { ...iqdRates, [method]: Number(normalizeRateInput(value)) || 0 };
    setIqdRates(next);
    saveLocalRates(next);
  };

  const resetForm = () => {
    setEditingCardId(null);
    setCardNumber("");
    setCardPin("");
    setPaymentMethod("Zaincash");
    setPaymentOther("");
    setCardPrice("300");
    setNotes("");
    setShowForm(false);
  };

  const editCard = (card: GiftCard) => {
    setFilter("all");
    setShowForm(true);
    setEditingCardId(card.id);
    setCardNumber(card.card_number || "");
    setCardPin(card.card_pin || "");
    setPaymentMethod(card.payment_method || "Zaincash");
    setPaymentOther(card.payment_other || "");
    setCardPrice(String(card.card_price || 300));
    setNotes(card.notes || "");
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCard = async () => {
    if (role !== "owner" || saving) return;
    if (!cardNumber.trim() || !cardPin.trim()) return;
    if (paymentMethod === "Other" && !paymentOther.trim()) return;
    setMessage(null);
    setSaving(true);
    const price = Number(cardPrice) || 300;
    const existing = displayedCards.find((card) => card.id === editingCardId);
    const savedCard: GiftCard = {
      id: editingCardId || `local-${Date.now()}`,
      date: existing?.date || new Date().toLocaleString(),
      card_number: cardNumber.trim(),
      card_pin: cardPin.trim(),
      payment_method: paymentMethod,
      payment_other: paymentMethod === "Other" ? paymentOther.trim() : "",
      card_price: price,
      spent: existing?.spent || 0,
      remaining: Math.max(price - Number(existing?.spent || 0), 0),
      linked_boxes: existing?.linked_boxes || [],
      notes: notes.trim(),
    };
    writeLocalGiftCard(savedCard);
    setLocalCards(readLocalGiftCards());
    resetForm();
    setSaving(false);
    setMessage({
      type: "success",
      text: editingCardId ? "Gift card updated." : "Gift card saved.",
    });

    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "save_gift_card",
        ...(editingCardId && !editingCardId.startsWith("local-")
          ? { action: "update_gift_card", id: editingCardId, row_id: editingCardId }
          : {}),
        role,
        sheet: "Gift Card",
        sheet_name: "Gift Card",
        card_number: savedCard.card_number,
        card_pin: savedCard.card_pin,
        payment_method: paymentMethod,
        payment_other: paymentMethod === "Other" ? paymentOther.trim() : "",
        card_price: price,
        notes: savedCard.notes,
        insta: savedCard.card_number,
        name: `PIN ${savedCard.card_pin}`,
        place: "Gift Card",
        price,
        pics_text: paymentMethod === "Other" ? paymentOther.trim() : paymentMethod,
        phone: "",
        box_name: "Gift Card",
        extra: "Gift Card",
        note: savedCard.notes,
      }),
    })
      .then(readScriptResponse)
      .then(() => onRefresh())
      .catch((error) => {
        console.warn("Gift card background sheet save failed", error);
        setMessage({
          type: "success",
          text: "Gift card saved here. Google Sheet is still syncing.",
        });
      });
  };

  const spendFromCard = (card: GiftCard) => {
    if (role !== "owner" || saving) return;
    const currentRemaining = Number(card.remaining || 0);
    const nextRemaining = Math.max(parseAmount(spendInputs[card.id]), 0);
    const amount = currentRemaining - nextRemaining;
    if (amount <= 0) return;
    setMessage(null);
    updateLocalGiftCard(card.id, (saved) => ({
      ...saved,
      spent: Number(saved.spent || 0) + amount,
      remaining: Math.max(Number(saved.remaining || 0) - amount, 0),
    }));
    if (!readLocalGiftCards().some((saved) => saved.id === card.id)) {
      writeLocalGiftCard({
        ...card,
        spent: Number(card.spent || 0) + amount,
        remaining: Math.max(Number(card.remaining || 0) - amount, 0),
      });
    }
    setLocalCards(readLocalGiftCards());
    setSpendInputs((prev) => ({ ...prev, [card.id]: "" }));
    setMessage({
      type: "success",
      text: `Remaining set to ${money(nextRemaining)}. ${money(amount)} / ${iqdMoney(usdToIqd(amount, card.payment_method, iqdRates))} used from gift card.`,
    });

    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "spend_gift_card",
        role,
        sheet: "Gift Card",
        sheet_name: "Gift Card",
        id: card.id,
        amount,
      }),
    })
      .then(readScriptResponse)
      .then(() => onRefresh())
      .catch((error) => {
        console.warn("Gift card background spend sync failed", error);
        setMessage({
          type: "success",
          text: "Gift card usage saved here. Google Sheet is still syncing.",
        });
      });
  };

  const connectCardToBox = (card: GiftCard) => {
    if (role !== "owner" || saving) return;
    const input = boxInputs[card.id];
    if (!input?.boxKey) return;
    const box = boxOptions.find((option) => option.key === input.boxKey);
    if (!box) return;
    const amount = parseAmount(input.amount);
    saveLocalGiftCardUpdate(card, (saved) => ({
      ...saved,
      linked_boxes: Array.from(new Set([...(saved.linked_boxes || []), box.key])),
      spent: Number(saved.spent || 0) + amount,
      remaining: Math.max(Number(saved.remaining || 0) - amount, 0),
    }));
    if (amount > 0) {
      writeBoxPrice(card.id, box.key, amount);
      setBoxPrices(readBoxPrices());
    }
    setLocalCards(readLocalGiftCards());
    setBoxInputs((prev) => ({ ...prev, [card.id]: { boxKey: "", amount: "" } }));
    setMessage({
      type: "success",
      text:
        amount > 0
          ? `Box connected and ${money(amount)} used from gift card.`
          : "Box connected to gift card.",
    });

    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "link_gift_card_box",
        role,
        id: card.id,
        box_name: box.boxName,
        sheet_name: box.sheetName || viewingMonth,
      }),
    })
      .then(readScriptResponse)
      .then(() =>
        amount > 0
          ? fetchWithRetry(SCRIPT_URL, {
              method: "POST",
              body: JSON.stringify({
                action: "spend_gift_card",
                role,
                sheet: "Gift Card",
                sheet_name: "Gift Card",
                id: card.id,
                amount,
              }),
            }).then(readScriptResponse)
          : undefined,
      )
      .then(() => onRefresh())
      .catch((error) => {
        console.warn("Gift card box sync failed", error);
        setMessage({
          type: "success",
          text: "Box connection saved here. Google Sheet is still syncing.",
        });
      });
  };

  const saveBoxBuy = (card: GiftCard, boxKey: string) => {
    if (role !== "owner" || saving) return;
    const amountKey = `${card.id}|${boxKey}`;
    const nextAmount = parseAmount(boxBuyInputs[amountKey] ?? String(boxPrices[amountKey] || ""));
    const previousAmount = Number(boxPrices[amountKey] || 0);
    const delta = nextAmount - previousAmount;

    writeBoxPrice(card.id, boxKey, nextAmount);
    setBoxPrices(readBoxPrices());
    setBoxBuyInputs((prev) => ({ ...prev, [amountKey]: String(nextAmount || "") }));
    saveLocalGiftCardUpdate(card, (saved) => ({
      ...saved,
      spent: Math.max(Number(saved.spent || 0) + delta, 0),
      remaining: Math.max(Number(saved.remaining || 0) - delta, 0),
    }));
    setLocalCards(readLocalGiftCards());
    setMessage({ type: "success", text: `Box buy saved: ${money(nextAmount)}.` });

    if (delta === 0 || card.id.startsWith("local-")) return;
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "spend_gift_card",
        role,
        sheet: "Gift Card",
        sheet_name: "Gift Card",
        id: card.id,
        amount: delta,
      }),
    })
      .then(readScriptResponse)
      .then(() => onRefresh())
      .catch((error) => {
        console.warn("Gift card box buy sync failed", error);
        setMessage({ type: "success", text: "Box buy saved here. Google Sheet is still syncing." });
      });
  };

  const saveBoxLoss = (boxKey: string) => {
    if (role !== "owner" || saving) return;
    const info = boxInfo.get(boxKey);
    if (!info) return;
    const amount = parseAmount(
      boxLossInputs[boxKey] ?? String(boxLosses[boxKey] ?? info.loss ?? ""),
    );
    writeBoxLoss(boxKey, amount);
    setBoxLosses(readBoxLosses());
    setBoxLossInputs((prev) => ({ ...prev, [boxKey]: String(amount || "") }));
    setMessage({ type: "success", text: `Loss saved: ${amount.toLocaleString()}.` });

    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "update_box_field_once",
        field: "lost",
        row_ids: info.rowIds,
        sheet: info.sheetName || viewingMonth,
        value: amount || "",
      }),
    })
      .then(readScriptResponse)
      .then(() => onRefresh())
      .catch((error) => {
        console.warn("Gift card box loss sync failed", error);
        setMessage({ type: "success", text: "Loss saved here. Google Sheet is still syncing." });
      });
  };

  if (role !== "owner")
    return <div className="text-sm font-semibold text-muted-foreground">Owner only.</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-24 animate-slide-up sm:space-y-5 sm:pb-0">
      <div className="sticky top-0 z-10 -mx-3 border-b border-border/60 bg-background/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        {filter === "available" ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-black tracking-tight sm:text-2xl">Available Cards</h1>
              <p className="text-xs font-semibold text-muted-foreground">
                {totals.active} cards with balance left
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight sm:text-3xl">Gift card wallet</h1>
              <p className="mt-0.5 hidden text-xs font-semibold text-muted-foreground sm:block sm:text-sm">
                Balances, spending and connected boxes in one place.
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingCardId(null);
                }}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-primary px-3 text-xs font-black text-primary-foreground shadow-lg shadow-primary/20 active:scale-[.97] sm:h-11 sm:gap-1.5 sm:rounded-xl sm:px-4"
              >
                <Plus size={16} /> <span className="hidden sm:inline">Add card</span>
                <span className="sm:hidden">Add</span>
              </button>
              <button
                onClick={() => setShowRates((prev) => !prev)}
                className={`inline-flex h-10 items-center justify-center rounded-lg border px-3 text-xs font-black shadow-sm transition-colors ${showRates ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-secondary"}`}
              >
                IQD
              </button>
              <button
                onClick={onRefresh}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-secondary sm:w-auto sm:px-3 sm:text-sm sm:font-semibold"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
            message.type === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/25 bg-destructive/10 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          )}
          <span className="min-w-0 break-words">{message.text}</span>
        </div>
      )}

      {filter === "available" ? (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wide text-primary">
            Available Balance
          </div>
          <div className="mt-1 text-3xl font-black tabular-nums text-primary">
            {money(totals.remaining)}
          </div>
          <div className="text-sm font-bold tabular-nums text-muted-foreground">
            {iqdMoney(totals.remainingIqd)}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            <button
              type="button"
              onClick={() => setFilter("available")}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-primary p-4 text-left text-white shadow-xl shadow-slate-950/15 transition-transform active:scale-[0.99] sm:col-span-2 sm:p-6"
            >
              <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full border-[28px] border-white/[0.06]" />
              <div className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">
                Available balance
              </div>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div className="relative">
                  <div className="text-3xl font-black tracking-tight tabular-nums sm:text-5xl">
                    {money(totals.remaining)}
                  </div>
                  <div className="mt-1 text-xs font-bold tabular-nums text-white/70">
                    {iqdMoney(totals.remainingIqd)}
                  </div>
                </div>
                <div className="relative rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] font-black backdrop-blur sm:px-3 sm:py-2 sm:text-xs">
                  {totals.active} active
                </div>
              </div>
            </button>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
              <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Used
                </div>
                <div className="mt-1 text-xl font-black tabular-nums text-destructive">
                  -{money(totals.spent)}
                </div>
                <div className="text-[11px] font-bold tabular-nums text-destructive">
                  -{iqdMoney(totals.spentIqd)}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Linked
                </div>
                <div className="mt-1 text-xl font-black tabular-nums">{totals.linked}</div>
              </div>
            </div>
          </div>

          {showRates && (
            <div className="grid gap-2 rounded-xl border border-border bg-card p-3 shadow-sm sm:grid-cols-2 sm:p-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Zaincash IQD for $300</label>
                <input
                  value={iqdRates.Zaincash ? iqdRates.Zaincash.toLocaleString() : ""}
                  onChange={(e) => updateIqdRate("Zaincash", e.target.value)}
                  inputMode="numeric"
                  className={`${fieldClass} w-full tabular-nums`}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Qi card IQD for $300</label>
                <input
                  value={iqdRates["Qi card"] ? iqdRates["Qi card"].toLocaleString() : ""}
                  onChange={(e) => updateIqdRate("Qi card", e.target.value)}
                  inputMode="numeric"
                  className={`${fieldClass} w-full tabular-nums`}
                />
              </div>
            </div>
          )}
        </>
      )}

      {showForm && filter === "all" && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-background sm:static sm:overflow-hidden sm:rounded-[24px] sm:border sm:border-border sm:bg-card sm:shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))] backdrop-blur sm:static sm:py-4">
            <div className="flex items-center gap-3 text-base font-black">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <WalletCards size={20} />
              </span>
              <span>
                <span className="block">
                  {editingCardId ? "Edit gift card" : "Add new gift card"}
                </span>
                <span className="block text-[11px] font-semibold text-muted-foreground">
                  Enter the card details below
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground"
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-5 p-4 pb-28 sm:gap-4 sm:p-5 lg:grid-cols-[1.1fr_1.1fr_1.4fr_auto]">
            <div className="space-y-1.5">
              <label className={labelClass}>Card Number</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                className={`${fieldClass} h-14 w-full rounded-xl text-base font-bold tracking-wider`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Card Pin</label>
              <input
                value={cardPin}
                onChange={(e) => setCardPin(e.target.value)}
                placeholder="Card PIN"
                inputMode="numeric"
                className={`${fieldClass} h-14 w-full rounded-xl text-base font-bold tracking-wider`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Payment</label>
              <div className="grid grid-cols-3 gap-1.5">
                {PAYMENT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPaymentMethod(option)}
                    className={`h-12 rounded-xl border px-2 text-xs font-black transition-all ${paymentMethod === option ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20" : "border-border bg-background hover:bg-secondary"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2 lg:flex lg:items-end">
              <button
                onClick={saveCard}
                disabled={
                  saving ||
                  !cardNumber.trim() ||
                  !cardPin.trim() ||
                  (paymentMethod === "Other" && !paymentOther.trim())
                }
                className="mt-auto inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 lg:min-w-28"
              >
                {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}{" "}
                {editingCardId ? "Update" : "Save"}
              </button>
              {editingCardId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-black text-muted-foreground hover:bg-secondary"
                >
                  <X size={15} /> Cancel
                </button>
              )}
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className={labelClass}>
                {paymentMethod === "Other" ? "Other Payment Name" : "Note"}
              </label>
              <input
                value={paymentMethod === "Other" ? paymentOther : notes}
                onChange={(e) =>
                  paymentMethod === "Other"
                    ? setPaymentOther(e.target.value)
                    : setNotes(e.target.value)
                }
                placeholder={
                  paymentMethod === "Other" ? "Write the payment method here" : "Optional note"
                }
                className={`${fieldClass} w-full`}
              />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <label className={labelClass}>Card Price</label>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {CARD_PRICES.map((price) => (
                  <button
                    key={price}
                    type="button"
                    onClick={() => setCardPrice(String(price))}
                    className={`h-11 rounded-lg border text-sm font-black tabular-nums transition-colors ${cardPrice === String(price) ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background hover:bg-secondary"}`}
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-2">
        {visibleCards.map((card) => {
          const remaining = Number(card.remaining || 0);
          const price = Number(card.card_price || 0);
          const spent = Number(card.spent || 0);
          const remainingIqd = usdToIqd(remaining, card.payment_method, iqdRates);
          const spentIqd = usdToIqd(spent, card.payment_method, iqdRates);
          const priceIqd = usdToIqd(price, card.payment_method, iqdRates);
          const progress = price > 0 ? Math.max(0, Math.min(100, (remaining / price) * 100)) : 0;
          const targetRemaining = Math.max(parseAmount(spendInputs[card.id]), 0);
          const spendAmount = Math.max(remaining - targetRemaining, 0);
          const spendAmountIqd = usdToIqd(spendAmount, card.payment_method, iqdRates);
          const isOpen = expandedCardId === card.id;
          return (
            <div
              key={card.id}
              className={`overflow-hidden rounded-xl border bg-card shadow-lg shadow-slate-950/[0.06] transition-all sm:rounded-2xl ${isOpen ? "border-primary/50 ring-2 ring-primary/10" : "border-border/80"}`}
            >
              <button
                type="button"
                onClick={() => setExpandedCardId(isOpen ? null : card.id)}
                className="relative block w-full space-y-3 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-primary p-4 text-left text-white transition-all hover:brightness-110 sm:space-y-4 sm:p-6"
                aria-expanded={isOpen}
              >
                <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full border-[30px] border-white/[0.05]" />
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white backdrop-blur sm:h-11 sm:w-11 sm:rounded-xl">
                        <CreditCard size={18} />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                          Card Number
                        </div>
                        <div className="max-w-[9rem] truncate text-sm font-black tracking-wide sm:max-w-none sm:text-base">
                          {card.card_number}
                        </div>
                        <div className="mt-1 inline-flex rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs font-black text-white/75">
                          PIN {card.card_pin}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xl font-black tabular-nums text-white sm:text-3xl">
                      {money(remaining)}
                    </div>
                    <div className="text-[10px] font-bold text-white/60">
                      remaining of {money(price)}
                    </div>
                    {priceIqd > 0 && (
                      <div className="mt-0.5 text-[10px] font-bold tabular-nums text-white/50">
                        {iqdMoney(remainingIqd)} / {iqdMoney(priceIqd)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-white">
                    Price {money(price)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-white/70">
                    <Calendar size={11} /> {card.date || "No date"}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-white/70">
                    {card.payment_method}
                    {card.payment_other ? `: ${card.payment_other}` : ""}
                  </span>
                  {(card.linked_boxes?.length || 0) > 0 && (
                    <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-100">
                      {card.linked_boxes.length} connected
                    </span>
                  )}
                  {spent > 0 && (
                    <span className="rounded-full bg-red-400/15 px-2 py-1 text-red-100">
                      Used -{money(spent)}
                      {spentIqd > 0 ? ` / -${iqdMoney(spentIqd)}` : ""}
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-white">
                    {isOpen ? "Close" : "Open"}
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </span>
                </div>
              </button>

              {isOpen && (
                <>
                  <div className="grid gap-3 border-t border-border bg-secondary/20 p-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => editCard(card)}
                      className="inline-flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all hover:border-primary/35 hover:bg-primary/5"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Pencil size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black">Edit card</span>
                        <span className="block text-[11px] font-semibold text-muted-foreground">
                          Number, PIN, price
                        </span>
                      </span>
                    </button>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 shadow-sm sm:col-span-2">
                      <div className="mb-2 flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-300">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10">
                          <Link2 size={15} />
                        </span>
                        Connect to box buying cost
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                        <select
                          value={boxInputs[card.id]?.boxKey || ""}
                          onChange={(e) =>
                            setBoxInputs((prev) => ({
                              ...prev,
                              [card.id]: {
                                ...(prev[card.id] || { amount: "" }),
                                boxKey: e.target.value,
                              },
                            }))
                          }
                          disabled={boxOptions.length === 0}
                          className="h-11 min-w-0 rounded-lg border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary/50 disabled:opacity-50"
                        >
                          <option value="">
                            {boxOptions.length ? "Choose box" : "No boxes in this month"}
                          </option>
                          {boxOptions.map((box) => (
                            <option key={box.key} value={box.key}>
                              {box.label}
                            </option>
                          ))}
                        </select>
                        <input
                          value={boxInputs[card.id]?.amount || ""}
                          onChange={(e) =>
                            setBoxInputs((prev) => ({
                              ...prev,
                              [card.id]: {
                                ...(prev[card.id] || { boxKey: "" }),
                                amount: e.target.value,
                              },
                            }))
                          }
                          placeholder="USD used"
                          inputMode="decimal"
                          className="h-11 min-w-0 rounded-lg border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary/50"
                        />
                        <button
                          onClick={() => connectCardToBox(card)}
                          disabled={saving || !boxInputs[card.id]?.boxKey}
                          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-black text-white disabled:opacity-50"
                        >
                          <Link2 size={15} /> Connect
                        </button>
                      </div>
                      {parseAmount(boxInputs[card.id]?.amount || "") > 0 && (
                        <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-black tabular-nums text-emerald-700 dark:text-emerald-300">
                          Adds{" "}
                          {iqdMoney(
                            usdToIqd(
                              parseAmount(boxInputs[card.id]?.amount || ""),
                              card.payment_method,
                              iqdRates,
                            ),
                          )}{" "}
                          to the selected box cost
                        </div>
                      )}
                    </div>
                  </div>

                  {card.linked_boxes.length > 0 && (
                    <div className="space-y-2 border-t border-border bg-emerald-500/[0.03] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          Connected Boxes
                        </div>
                        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                          Adds to box cost
                        </div>
                      </div>
                      <div className="space-y-2">
                        {card.linked_boxes.map((box) => {
                          const amountKey = `${card.id}|${box}`;
                          const info = boxInfo.get(box);
                          const buyValue =
                            boxBuyInputs[amountKey] ?? String(boxPrices[amountKey] || "");
                          const buyAmount = parseAmount(buyValue);
                          const buyAmountIqd = usdToIqd(buyAmount, card.payment_method, iqdRates);
                          const lossValue =
                            boxLossInputs[box] ?? String(boxLosses[box] ?? info?.loss ?? "");
                          return (
                            <div
                              key={box}
                              className="rounded-lg border border-emerald-500/20 bg-card p-3 shadow-sm"
                            >
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                <span className="inline-flex min-w-0 items-center gap-1.5">
                                  <Link2 size={11} />{" "}
                                  <span className="truncate">
                                    {info?.label || box.replace(":", " - ")}
                                  </span>
                                </span>
                                {buyAmount > 0 && (
                                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 tabular-nums">
                                    +{iqdMoney(buyAmountIqd)} cost
                                  </span>
                                )}
                              </div>
                              <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
                                <input
                                  value={buyValue}
                                  onChange={(e) =>
                                    setBoxBuyInputs((prev) => ({
                                      ...prev,
                                      [amountKey]: e.target.value,
                                    }))
                                  }
                                  placeholder="Gift amount USD"
                                  inputMode="decimal"
                                  className="h-10 min-w-0 rounded-lg border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary/50"
                                />
                                <button
                                  onClick={() => saveBoxBuy(card, box)}
                                  disabled={saving}
                                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-black text-primary-foreground disabled:opacity-50"
                                >
                                  <Save size={13} /> Buy
                                </button>
                                <input
                                  value={lossValue}
                                  onChange={(e) =>
                                    setBoxLossInputs((prev) => ({ ...prev, [box]: e.target.value }))
                                  }
                                  placeholder="Loss"
                                  inputMode="decimal"
                                  className="h-10 min-w-0 rounded-lg border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary/50"
                                />
                                <button
                                  onClick={() => saveBoxLoss(box)}
                                  disabled={saving || !info}
                                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 text-xs font-black text-destructive-foreground disabled:opacity-50"
                                >
                                  <Save size={13} /> Loss
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2 border-t border-border bg-secondary/30 p-3 sm:grid-cols-[1fr_auto]">
                    <div className="rounded-xl border border-destructive/15 bg-card p-3 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-sm font-black text-destructive">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-destructive/10">
                          <Minus size={15} />
                        </span>
                        Set remaining balance
                      </div>
                      <input
                        value={spendInputs[card.id] || ""}
                        onChange={(e) =>
                          setSpendInputs((prev) => ({ ...prev, [card.id]: e.target.value }))
                        }
                        placeholder="Remaining USD"
                        inputMode="decimal"
                        className="h-11 w-full min-w-0 rounded-lg border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary/50"
                      />
                      {(spendInputs[card.id] || "") && (
                        <div className="mt-2 text-xs font-black tabular-nums text-destructive">
                          New remaining: {money(targetRemaining)}. Use -{money(spendAmount)}
                          {spendAmountIqd > 0 ? ` / -${iqdMoney(spendAmountIqd)}` : ""}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => spendFromCard(card)}
                      disabled={saving || spendAmount <= 0}
                      className="inline-flex min-h-16 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-black text-destructive-foreground shadow-sm disabled:opacity-50 sm:min-w-28"
                    >
                      <Minus size={16} /> Use
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {visibleCards.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm font-semibold text-muted-foreground">
          <Plus size={28} className="mx-auto mb-2 opacity-40" />{" "}
          {filter === "available" ? "No available gift cards" : "No gift cards yet"}
        </div>
      )}
    </div>
  );
};

export default GiftCardsView;
