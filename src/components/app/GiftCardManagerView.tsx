/**
 * Gift cards. One screen, read from Supabase.
 *
 * Lists every card, adds a card, and saves what is left on one. That is the whole screen.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Loader2, Plus, RefreshCw, Shuffle, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  GiftCard,
  createGiftCard,
  generateGiftCardCode,
  listGiftCards,
  normalizeCode,
  updateIqdPrice,
  updateRemaining,
} from "@/lib/gift-cards";

/** The brand red. */
const BRAND = "#6b0f14";

/**
 * The card amounts are dollars, which is how the old screen showed them — a 300 card is
 * $300, not 300 IQD. Kept identical so the figures read the same as they always did.
 */
const money = (value: number | null) => `$${Number(value || 0).toLocaleString()}`;

const iqdMoney = (value: number) => `${Math.round(Number(value || 0)).toLocaleString()} IQD`;

/** What the shop pays in IQD for a $300 card, by payment method. Same rates as before. */
const IQD_RATES: Record<string, number> = { Zaincash: 401865, "Qi card": 419250 };

const usdToIqd = (usd: number, paymentMethod: string | null) => {
  const rate = IQD_RATES[String(paymentMethod ?? "").trim()] ?? 0;
  return rate > 0 ? (Number(usd || 0) / 300) * rate : 0;
};

/**
 * What is left on a card, in IQD.
 *
 * The price actually paid, when it has been written down, scaled by how much of the card
 * remains. Otherwise the old rate estimate. An estimate beats a blank, as long as the
 * screen is honest that it is one.
 */
const iqdOf = (card: GiftCard) => {
  const recorded = Number(card.iqd_price) || 0;
  if (recorded > 0) {
    const amount = Number(card.amount) || 0;
    const remaining = Number(card.remaining) || 0;
    return amount > 0 ? (recorded * remaining) / amount : recorded;
  }
  return usdToIqd(Number(card.remaining) || 0, card.payment_method);
};

const GiftCardManagerView: React.FC = () => {
  const [cards, setCards] = useState<GiftCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /** Whether the new-card panel is open. */
  const [adding, setAdding] = useState(false);

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");

  /** Which card and which of its two numbers is being edited, and the value typed. */
  const [editing, setEditing] = useState<{ id: number; field: "remaining" | "iqd" } | null>(null);
  const [editValue, setEditValue] = useState("");

  const load = useCallback(async () => {
    const result = await listGiftCards();
    setError(result.error);
    setCards(result.cards);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Escape closes the panel. A panel that can only be dismissed by finding its button is
  // a trap on a phone, where the button can end up under the keyboard.
  useEffect(() => {
    if (!adding) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAdding(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adding]);

  const totals = useMemo(() => {
    const list = cards ?? [];
    const spentOf = (card: GiftCard) =>
      Math.max((Number(card.amount) || 0) - (Number(card.remaining) || 0), 0);
    return {
      count: list.length,
      remaining: list.reduce((sum, card) => sum + (Number(card.remaining) || 0), 0),
      // The recorded price wins wherever there is one; the rate only stands in for cards
      // bought before the price was being written down.
      remainingIqd: list.reduce((sum, card) => sum + iqdOf(card), 0),
      pricedCount: list.filter((card) => Number(card.iqd_price) > 0).length,
      // Nothing records what was spent, so it is the difference between what a card was
      // worth and what is left on it — which is the same number, worked out from the two
      // figures that are actually kept.
      spent: list.reduce((sum, card) => sum + spentOf(card), 0),
      spentIqd: list.reduce((sum, card) => sum + usdToIqd(spentOf(card), card.payment_method), 0),
      spentCount: list.filter((card) => spentOf(card) > 0).length,
      active: list.filter((card) => (Number(card.remaining) || 0) > 0).length,
    };
  }, [cards]);

  /** Only the owner and admins may add a card; the database refuses anyone else anyway. */
  const canCreate = useMemo(() => {
    const role = typeof window === "undefined" ? "" : localStorage.getItem("auth_role") || "";
    return role === "owner" || role === "admin";
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!normalizeCode(code)) return toast.error("Enter a card code");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return toast.error("Enter an amount");

    setBusy(true);
    try {
      const result = await createGiftCard({ code, amount: value, pin });
      if (!result.ok) return toast.error(result.error);
      setCards((previous) => [result.value, ...(previous ?? [])]);
      setCode("");
      setAmount("");
      setPin("");
      setAdding(false);
      toast.success(`Card ${result.value.code} saved`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveEdit(card: GiftCard) {
    const value = Number(editValue);
    if (!Number.isFinite(value) || value < 0) return toast.error("Enter a number");

    setBusy(true);
    try {
      const result =
        editing?.field === "iqd"
          ? await updateIqdPrice(card.id, value)
          : await updateRemaining(card.id, value);
      if (!result.ok) return toast.error(result.error);
      setCards((previous) =>
        (previous ?? []).map((item) => (item.id === card.id ? result.value : item)),
      );
      setEditing(null);
      setEditValue("");
      toast.success("Saved");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
  const label =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 pb-24">
      <Toaster position="top-center" richColors />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: BRAND }}
          >
            <CreditCard size={17} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight sm:text-lg">Gift Cards</h1>
            <p className="text-[11px] font-bold text-muted-foreground">
              {totals.active} cards with balance left
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            title="Read again from Supabase"
          >
            <RefreshCw size={15} />
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-black text-white shadow-lg active:scale-[.97] sm:px-4"
              style={{ backgroundColor: BRAND }}
            >
              <Plus size={15} />
              New card
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-primary p-4 text-left text-white shadow-xl shadow-slate-950/15 sm:col-span-2 sm:p-6">
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
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          <div className="rounded-xl border border-border bg-card p-3 text-left shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Used
              </span>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-black text-destructive">
                {totals.spentCount}
              </span>
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
              Cards
            </div>
            <div className="mt-1 text-xl font-black tabular-nums">{totals.count}</div>
          </div>
        </div>
      </div>

      {canCreate && adding && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          // Only a click on the backdrop itself closes it, never one that started on the
          // form — otherwise releasing a drag inside the panel would throw the entry away.
          onClick={(event) => {
            if (event.target === event.currentTarget) setAdding(false);
          }}
        >
          <form
            onSubmit={handleCreate}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-black">New card</h2>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="gc-code" className={label}>
                  Card number
                </label>
                <div className="flex gap-2">
                  <input
                    id="gc-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Card number or code"
                    autoComplete="off"
                    className={`${field} font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setCode(generateGiftCardCode())}
                    className="shrink-0 rounded-xl border border-border bg-secondary px-3 text-muted-foreground hover:text-foreground"
                    title="Generate a code"
                  >
                    <Shuffle size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="gc-amount" className={label}>
                  Amount
                </label>
                <input
                  id="gc-amount"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  className={`${field} tabular-nums`}
                />
              </div>
              <div>
                <label htmlFor="gc-pin" className={label}>
                  PIN <span className="font-normal normal-case">(optional)</span>
                </label>
                <input
                  id="gc-pin"
                  inputMode="numeric"
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="0000"
                  className={`${field} font-mono`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={busy || !code || !amount}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: BRAND }}
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
              Save to Supabase
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          {error}
        </div>
      )}

      {cards === null ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center text-sm font-bold text-muted-foreground shadow-sm">
          No cards yet
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <div
              key={card.id ?? card.code}
              className="rounded-xl border border-border bg-card p-3.5 shadow-sm sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-sm font-bold">{card.code || "—"}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                    PIN {card.card_pin ?? "—"} · worth {money(card.amount)}
                    {card.payment_method ? ` · ${card.payment_method}` : ""}
                  </p>
                </div>

                {editing?.id === card.id ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      autoFocus
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      className="w-24 rounded-lg border border-primary bg-background px-2 py-1.5 text-right text-sm font-bold tabular-nums outline-none"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleSaveEdit(card)}
                      className="rounded-lg p-1.5 text-white disabled:opacity-50"
                      style={{ backgroundColor: BRAND }}
                      aria-label="Save"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                      aria-label="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-stretch gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing({ id: card.id, field: "remaining" });
                        setEditValue(String(Number(card.remaining) || 0));
                      }}
                      className="rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-right hover:bg-secondary"
                      title="Change what is left and save it"
                    >
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Remaining
                      </span>
                      <span
                        className="block text-sm font-black tabular-nums"
                        style={{ color: Number(card.remaining) > 0 ? BRAND : undefined }}
                      >
                        {money(card.remaining)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditing({ id: card.id, field: "iqd" });
                        setEditValue(
                          String(
                            Number(card.iqd_price) ||
                              Math.round(usdToIqd(Number(card.amount) || 0, card.payment_method)),
                          ),
                        );
                      }}
                      className="rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-right hover:bg-secondary"
                      title="Set what this card cost in IQD"
                    >
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        IQD price
                      </span>
                      <span className="block text-sm font-black tabular-nums">
                        {Number(card.iqd_price) > 0
                          ? Number(card.iqd_price).toLocaleString()
                          : Math.round(
                              usdToIqd(Number(card.amount) || 0, card.payment_method),
                            ).toLocaleString()}
                      </span>
                      <span className="block text-[9px] font-bold uppercase text-muted-foreground">
                        {Number(card.iqd_price) > 0 ? "saved" : "estimate"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GiftCardManagerView;
