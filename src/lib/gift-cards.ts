/**
 * Gift cards, straight from Supabase.
 *
 * Three things only: list them, add one, change what is left on one. No Google Sheets and
 * no Apps Script — the table is the only place a card lives.
 */

import { supabase } from "@/lib/supabase";

export interface GiftCard {
  id: number;
  code: string | null;
  /** What the card was worth when it was made. */
  amount: number | null;
  /** What is still on it. This is the figure that changes as it gets spent. */
  remaining: number | null;
  card_pin: number | null;
  payment_method: string | null;
  /**
   * What the card cost in IQD.
   *
   * Null means it was never recorded — the screen then shows an estimate worked out from
   * the payment method's rate, and says so, rather than passing a guess off as the price.
   */
  iqd_price: number | null;
  created_at: string | null;
}

const TABLE = "gift_cards";

const COLUMNS = "id,code,amount,remaining,card_pin,payment_method,iqd_price,created_at";

/** Codes are stored and compared trimmed and upper case, matching the unique index. */
export function normalizeCode(code: string): string {
  return String(code ?? "")
    .trim()
    .toUpperCase();
}

/**
 * A code that survives being read out over the phone.
 *
 * Leaves out 0/O, 1/I/L and 5/S — the characters people mishear and mistype.
 */
export function generateGiftCardCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRTUVWXYZ2346789";
  const pick = (count: number) => {
    const values = new Uint32Array(count);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(values);
    else for (let i = 0; i < count; i++) values[i] = Math.floor(Math.random() * 0xffffffff);
    return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  };
  return `${pick(4)}-${pick(4)}`;
}

/** Every card, newest first. */
export async function listGiftCards(): Promise<{ cards: GiftCard[]; error: string | null }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order("created_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  if (error) return { cards: [], error: error.message };
  return { cards: (data ?? []) as unknown as GiftCard[], error: null };
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Adds a card.
 *
 * A new card starts with all of its value still on it, so remaining is set to the amount
 * rather than left empty — an empty remaining would read as a card already spent.
 */
export async function createGiftCard(input: {
  code: string;
  amount: number;
  pin?: string;
  paymentMethod?: string;
  iqdPrice?: number;
}): Promise<Result<GiftCard>> {
  const code = normalizeCode(input.code);
  if (!code) return { ok: false, error: "Enter a card code." };
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter an amount greater than zero." };
  }

  const { data: session } = await supabase.auth.getUser();
  const staffId = session.user?.id ?? null;
  if (!staffId) return { ok: false, error: "Your sign-in has expired. Sign in again." };

  const pin = String(input.pin ?? "").replace(/[^0-9]/g, "");

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      code,
      amount: input.amount,
      remaining: input.amount,
      card_price: input.amount,
      card_pin: pin ? Number(pin) : null,
      payment_method: input.paymentMethod?.trim() || null,
      iqd_price:
        Number.isFinite(input.iqdPrice) && (input.iqdPrice as number) > 0
          ? input.iqdPrice
          : null,
      status: "active",
      created_by_staff_id: staffId,
    })
    .select(COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: `Card ${code} already exists.` };
    if (error.code === "42501") {
      return { ok: false, error: "Only the owner and admins can add a gift card." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, value: data as unknown as GiftCard };
}

/**
 * Saves what is left on a card.
 *
 * Only that one column is written. The card's code and its original amount are left alone
 * on purpose — a trigger in the database refuses to change either, so a card's identity and
 * its face value stay put whatever happens on this screen.
 */
export async function updateRemaining(id: number, remaining: number): Promise<Result<GiftCard>> {
  return updateOne(id, "remaining", remaining);
}

/** Saves what the card cost in IQD. */
export async function updateIqdPrice(id: number, iqdPrice: number): Promise<Result<GiftCard>> {
  return updateOne(id, "iqd_price", iqdPrice);
}

/**
 * Writes one number to one column.
 *
 * Deliberately narrow. The card's code and its original amount are never among the columns
 * this can reach, so nothing on the screen can rewrite a card's identity or its face value —
 * and a trigger in the database refuses those two anyway.
 */
async function updateOne(
  id: number,
  column: "remaining" | "iqd_price",
  value: number,
): Promise<Result<GiftCard>> {
  if (!Number.isFinite(value) || value < 0) {
    return { ok: false, error: "Enter a number of zero or more." };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({ [column]: value })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) {
    if (error.code === "42501") return { ok: false, error: "You are not allowed to change this." };
    if (error.code === "42703") {
      return {
        ok: false,
        error: "The iqd_price column is missing — run gift-cards-iqd-price.sql.",
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, value: data as unknown as GiftCard };
}
