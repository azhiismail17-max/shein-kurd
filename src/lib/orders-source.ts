import { Order, MonthlyStats } from "@/types";
import { supabase, ORDERS_TABLE } from "@/lib/supabase";

/**
 * Where order history comes from: Supabase, and nothing else.
 *
 * This replaces the snapshot file and the "frozen month" machinery. Those existed to
 * work around a 15-second Apps Script backend and to hide misaligned rows in the
 * Google Sheet, and between them they were suppressing whole months of good data.
 * Supabase now holds the corrected history, so there is one source and no fallback
 * that can quietly serve something stale.
 */

/**
 * Months still fetched from the Google Sheet on every view.
 *
 * July is edited by hand in the sheet and those edits never reach Supabase, so
 * reading it from Supabase would hide them. Remove it from here once July is only
 * edited through the app.
 */
export const SHEET_LIVE_MONTHS = new Set<string>(["July"]);

export function isLiveMonth(month: string | null | undefined): boolean {
  return !!month && SHEET_LIVE_MONTHS.has(month);
}

export interface OrdersData {
  months: Record<string, Order[]>;
  stats: Record<string, MonthlyStats>;
}

/** Why a load produced nothing, so the app can react rather than show a blank page. */
export type OrdersFailure = "no-session" | "denied" | "unreachable" | "empty";

export class OrdersLoadError extends Error {
  constructor(
    readonly reason: OrdersFailure,
    message: string,
  ) {
    super(message);
    this.name = "OrdersLoadError";
  }
}

/**
 * Columns read for every order.
 *
 * `date` and `linked_order_ids` were both missing, and their absence was silent but
 * severe. Without `date` no order had a timestamp, so the week window that decides
 * whether two orders belong on one receipt always failed and linked orders never grouped
 * at all; the activity charts had nothing to place on a day either. Without
 * `linked_order_ids` every link and unlink made by hand was invisible after a reload, so
 * unlinked orders quietly re-linked themselves.
 */
const COLUMNS =
  "sheet_row,unique_order_id,order_month,order_year,date,insta,name,place,phone,fib," +
  "price,box_cost,pics_text,shipping_cost,box_name,lost,profit,track_no," +
  "initial_payment,link,note,extra,status,primary_urls,proof_urls,warning_url," +
  "linked_order_ids,admin_name,admin_role,staff_id,staff_name,staff_role,is_finished,region";

const amount = (value: unknown) => Number(String(value ?? "").replace(/[^0-9.-]/g, "")) || 0;

function statsFor(orders: Order[]): MonthlyStats {
  let revenue = 0;
  let paid = 0;
  let buy = 0;
  let wgt = 0;
  let lost = 0;
  for (const order of orders) {
    revenue += amount(order.price);
    paid += amount(order.initial_payment);
    buy += amount(order.box_cost);
    wgt += amount(order.shipping_cost);
    lost += amount(order.lost);
  }
  return { count: orders.length, revenue, balance: revenue - paid, buy, wgt, etc: 0, lost };
}

let inflight: Promise<OrdersData> | null = null;

/**
 * Reads every order from Supabase.
 *
 * `sheet_row` becomes the order's `id`, never Supabase's own `id`: edits, status
 * changes and deletes all reach the Google sheet by row number, so the wrong one
 * would rewrite an unrelated row. A row without `sheet_row` is therefore left out
 * rather than shown as if it were editable.
 *
 * This function only reads. Nothing here removes or alters a Supabase row.
 */
export function loadOrders(): Promise<OrdersData> {
  // Several views ask during the first render; they all wait on one request.
  if (!inflight) {
    inflight = (async () => {
      // Row Level Security answers as the signed-in user, so without a Supabase
      // session every read is refused. The app used to be able to fall back to a
      // static file; now this is the only source, so a stale login has to be
      // reported rather than silently producing an empty screen.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("[orders] no Supabase session — sign in again");
        throw new OrdersLoadError("no-session", "Your sign-in has expired. Please log in again.");
      }

      const rows: Record<string, unknown>[] = [];
      const page = 1000;
      const started = Date.now();

      try {
        for (let from = 0; ; from += page) {
          const { data, error } = await supabase
            .from(ORDERS_TABLE.kurdistani)
            .select(COLUMNS)
            .order("id", { ascending: true })
            .range(from, from + page - 1);

          if (error) {
            console.error(`[orders] Supabase read failed: ${error.message} (${error.code})`);
            throw new OrdersLoadError(
              error.code === "42501" ? "denied" : "unreachable",
              error.code === "42501"
                ? "This account is not allowed to read orders. Check its profile row."
                : `Could not read orders: ${error.message}`,
            );
          }
          rows.push(...((data ?? []) as unknown as Record<string, unknown>[]));
          if (!data || data.length < page) break;
        }
      } catch (error) {
        if (error instanceof OrdersLoadError) throw error;
        console.error("[orders] Supabase unreachable", error);
        throw new OrdersLoadError("unreachable", "Could not reach the database.");
      }

      const months: Record<string, Order[]> = {};
      let skippedNoRow = 0;

      for (const row of rows) {
        const month = String(row.order_month || "");
        if (!month) continue;
        if (row.sheet_row === null || row.sheet_row === undefined) {
          skippedNoRow += 1;
          continue;
        }
        // The database column is snake_case; the app reads camelCase everywhere.
        const links = row.linked_order_ids;
        (months[month] ??= []).push({
          ...(row as unknown as Order),
          id: row.sheet_row as number,
          sheet_name: month,
          linkedOrderIds: Array.isArray(links)
            ? (links as (string | number)[])
            : typeof links === "string" && links.trim()
              ? links.split(",").map((part) => part.trim()).filter(Boolean)
              : undefined,
          _fromSheet: true,
        });
      }

      const stats: Record<string, MonthlyStats> = {};
      for (const [month, list] of Object.entries(months)) stats[month] = statsFor(list);

      if (skippedNoRow) {
        console.warn(`[orders] ${skippedNoRow} row(s) skipped: no sheet_row, not safely editable`);
      }
      console.info(
        `[orders] ${rows.length} orders from Supabase in ${Date.now() - started}ms — ` +
          Object.entries(months)
            .map(([month, list]) => `${month}:${list.length}`)
            .join(" "),
      );
      return { months, stats };
    })();
  }
  return inflight.catch((error) => {
    inflight = null;
    throw error;
  });
}

/** Forces the next loadOrders() to hit Supabase again. */
export function resetOrdersCache() {
  inflight = null;
}

/** Flattens the months into the single list the order views work with. */
export function flattenOrders(data: OrdersData): { orders: Order[]; months: string[] } {
  const months = Object.keys(data.months);
  const orders: Order[] = [];
  for (const month of months) orders.push(...data.months[month]);
  return { orders, months };
}
