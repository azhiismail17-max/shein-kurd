import React, { useMemo, useState } from "react";
import { ChevronDown, CreditCard, Link2, Minus, Plus, RefreshCw, Save } from "lucide-react";
import { GiftCard, Order, SCRIPT_URL } from "@/iraqi/types";
import { fetchWithRetry } from "@/iraqi/lib/fetchWithRetry";

interface GiftCardsViewProps {
  role: string;
  giftCards: GiftCard[];
  onRefresh: () => void;
  orders?: Order[];
  viewingMonth?: string;
}

const CARD_PRICES = [100, 300, 500, 800, 1000];
const PAYMENT_OPTIONS = ["Zaincash", "Qi card", "Other"];
const LOCAL_GIFT_CARD_BOX_BUYS_KEY = "iraqi_gift_card_box_buys";
const LOCAL_GIFT_CARD_BOX_LOSSES_KEY = "iraqi_gift_card_box_losses";

const money = (value: number) => `$${Number(value || 0).toLocaleString()}`;
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
const readLocalAmounts = (key: string): Record<string, number> => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};
const writeLocalAmount = (key: string, amountKey: string, amount: number) => {
  const amounts = readLocalAmounts(key);
  amounts[amountKey] = amount;
  localStorage.setItem(key, JSON.stringify(amounts));
};

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
  const [boxBuyInputs, setBoxBuyInputs] = useState<Record<string, string>>({});
  const [boxLossInputs, setBoxLossInputs] = useState<Record<string, string>>({});
  const [boxBuys, setBoxBuys] = useState<Record<string, number>>(() =>
    readLocalAmounts(LOCAL_GIFT_CARD_BOX_BUYS_KEY),
  );
  const [boxLosses, setBoxLosses] = useState<Record<string, number>>(() =>
    readLocalAmounts(LOCAL_GIFT_CARD_BOX_LOSSES_KEY),
  );
  const [saving, setSaving] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const sortedGiftCards = useMemo(() => sortGiftCardsByBalance(giftCards), [giftCards]);

  const totals = useMemo(
    () => ({
      value: giftCards.reduce((sum, card) => sum + Number(card.card_price || 0), 0),
      remaining: giftCards.reduce((sum, card) => sum + Number(card.remaining || 0), 0),
    }),
    [giftCards],
  );

  const boxInfo = useMemo(() => {
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
    return map;
  }, [orders, viewingMonth]);

  const resetForm = () => {
    setCardNumber("");
    setCardPin("");
    setPaymentMethod("Zaincash");
    setPaymentOther("");
    setCardPrice("300");
    setNotes("");
  };

  const saveCard = async () => {
    if (role !== "owner" || saving) return;
    if (!cardNumber.trim() || !cardPin.trim()) return;
    if (paymentMethod === "Other" && !paymentOther.trim()) return;
    setSaving(true);
    try {
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "save_gift_card",
          role,
          card_number: cardNumber.trim(),
          card_pin: cardPin.trim(),
          payment_method: paymentMethod,
          payment_other: paymentMethod === "Other" ? paymentOther.trim() : "",
          card_price: Number(cardPrice) || 300,
          notes: notes.trim(),
        }),
      });
      resetForm();
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const spendFromCard = async (card: GiftCard) => {
    if (role !== "owner" || saving) return;
    const currentRemaining = Number(card.remaining || 0);
    const nextRemaining = Math.max(parseAmount(spendInputs[card.id] || ""), 0);
    const amount = currentRemaining - nextRemaining;
    if (amount <= 0) return;
    setSaving(true);
    try {
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "spend_gift_card", role, id: card.id, amount }),
      });
      setSpendInputs((prev) => ({ ...prev, [card.id]: "" }));
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const saveBoxBuy = async (card: GiftCard, boxKey: string) => {
    if (role !== "owner" || saving) return;
    const amountKey = `${card.id}|${boxKey}`;
    const nextAmount = parseAmount(boxBuyInputs[amountKey]);
    const previousAmount = Number(boxBuys[amountKey] || 0);
    writeLocalAmount(LOCAL_GIFT_CARD_BOX_BUYS_KEY, amountKey, nextAmount);
    setBoxBuys(readLocalAmounts(LOCAL_GIFT_CARD_BOX_BUYS_KEY));
    setBoxBuyInputs((prev) => ({ ...prev, [amountKey]: String(nextAmount || "") }));

    const extraSpend = nextAmount - previousAmount;
    if (extraSpend <= 0) return;
    setSaving(true);
    try {
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "spend_gift_card", role, id: card.id, amount: extraSpend }),
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const saveBoxLoss = async (boxKey: string) => {
    if (role !== "owner" || saving) return;
    const info = boxInfo.get(boxKey);
    if (!info) return;
    const amount = parseAmount(boxLossInputs[boxKey]);
    writeLocalAmount(LOCAL_GIFT_CARD_BOX_LOSSES_KEY, boxKey, amount);
    setBoxLosses(readLocalAmounts(LOCAL_GIFT_CARD_BOX_LOSSES_KEY));
    setBoxLossInputs((prev) => ({ ...prev, [boxKey]: String(amount || "") }));
    setSaving(true);
    try {
      await fetchWithRetry(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "update_box_field_once",
          field: "lost",
          row_ids: info.rowIds,
          sheet: info.sheetName || viewingMonth,
          value: amount || "",
        }),
      });
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  if (role !== "owner") {
    return <div className="text-sm font-semibold text-muted-foreground">Owner only.</div>;
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gift Cards</h1>
          <p className="text-sm text-muted-foreground">
            {giftCards.length} cards - {money(totals.remaining)} available
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold hover:bg-secondary/80"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold">
          <CreditCard size={17} className="text-primary" /> Add Gift Card
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Card number"
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold outline-none focus:border-primary/50"
          />
          <input
            value={cardPin}
            onChange={(e) => setCardPin(e.target.value)}
            placeholder="Card pin"
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold outline-none focus:border-primary/50"
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold outline-none focus:border-primary/50"
          >
            {PAYMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {paymentMethod === "Other" ? (
            <input
              value={paymentOther}
              onChange={(e) => setPaymentOther(e.target.value)}
              placeholder="Other payment"
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold outline-none focus:border-primary/50"
            />
          ) : (
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note"
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold outline-none focus:border-primary/50"
            />
          )}
          <select
            value={cardPrice}
            onChange={(e) => setCardPrice(e.target.value)}
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold outline-none focus:border-primary/50"
          >
            {CARD_PRICES.map((price) => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
          </select>
          <button
            onClick={saveCard}
            disabled={
              saving ||
              !cardNumber.trim() ||
              !cardPin.trim() ||
              (paymentMethod === "Other" && !paymentOther.trim())
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {sortedGiftCards.map((card) => {
          const isOpen = expandedCardId === card.id;
          const targetRemaining = Math.max(parseAmount(spendInputs[card.id] || ""), 0);
          const spendAmount = Math.max(Number(card.remaining || 0) - targetRemaining, 0);
          return (
            <div
              key={card.id}
              className={`overflow-hidden rounded-xl border bg-card shadow-sm transition-all ${isOpen ? "border-primary/50 ring-2 ring-primary/10" : "border-border"}`}
            >
              <button
                type="button"
                onClick={() => setExpandedCardId(isOpen ? null : card.id)}
                className="block w-full bg-gradient-to-br from-slate-950 via-slate-900 to-primary p-4 text-left text-white transition-all hover:brightness-110"
                aria-expanded={isOpen}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Card Number
                    </div>
                    <div className="truncate font-black tracking-[0.08em]">{card.card_number}</div>
                    <div className="mt-1 inline-flex rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs font-black text-white/75">
                      PIN {card.card_pin}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold">
                      <span className="rounded-full bg-white/10 px-2 py-1">
                        Price {money(card.card_price)}
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
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black tabular-nums text-white">
                      {money(card.remaining)}
                    </div>
                    <div className="text-[11px] text-white/60">remaining</div>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-black">
                      {isOpen ? "Close" : "Open"}
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && (
                <>
                  {card.linked_boxes.length > 0 && (
                    <div className="space-y-2 border-t border-border bg-primary/[0.03] p-3">
                      {card.linked_boxes.map((box) => {
                        const amountKey = `${card.id}|${box}`;
                        const info = boxInfo.get(box);
                        const buyValue =
                          boxBuyInputs[amountKey] ?? String(boxBuys[amountKey] || "");
                        const lossValue =
                          boxLossInputs[box] ?? String(boxLosses[box] ?? info?.loss ?? "");
                        return (
                          <div
                            key={box}
                            className="rounded-lg border border-primary/10 bg-primary/5 p-2"
                          >
                            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-primary">
                              <Link2 size={11} /> {info?.label || box.replace(":", " - ")}
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
                                placeholder="Box buy"
                                inputMode="decimal"
                                className="min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold outline-none focus:border-primary/50"
                              />
                              <button
                                onClick={() => saveBoxBuy(card, box)}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
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
                                className="min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold outline-none focus:border-primary/50"
                              />
                              <button
                                onClick={() => saveBoxLoss(box)}
                                disabled={saving || !info}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-bold text-destructive-foreground disabled:opacity-50"
                              >
                                <Save size={13} /> Loss
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => spendFromCard(card)}
                      disabled={saving || spendAmount <= 0}
                      className="inline-flex min-h-16 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-bold text-destructive-foreground disabled:opacity-50 sm:min-w-28"
                    >
                      <Minus size={15} /> Use
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {giftCards.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm font-semibold text-muted-foreground">
          <Plus size={28} className="mx-auto mb-2 opacity-40" /> No gift cards yet
        </div>
      )}
    </div>
  );
};

export default GiftCardsView;
