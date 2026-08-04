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

      /** Turns a Supabase error into the right kind of OrdersLoadError. */
      const readFailed = (message: string, code?: string) => {
        console.error(`[orders] Supabase read failed: ${message} (${code})`);
        return new OrdersLoadError(
          code === "42501" ? "denied" : "unreachable",
          code === "42501"
            ? "This account is not allowed to read orders. Check its profile row."
            : `Could not read orders: ${message}`,
        );
      };

      const readPage = async (from: number) => {
        const { data, error } = await supabase
          .from(ORDERS_TABLE.kurdistani)
          .select(COLUMNS)
          .order("id", { ascending: true })
          .range(from, from + page - 1);
        if (error) throw readFailed(error.message, error.code);
        return (data ?? []) as unknown as Record<string, unknown>[];
      };

      try {
        /*
         * The pages are fetched at the same time, not one after another.
         *
         * Supabase caps a read at 1,000 rows, so 2,042 orders take three requests. Asking
         * for them in a loop meant each one waited for the one before it — three round
         * trips to another continent, about 2.5 seconds before the app had any orders at
         * all. The first request also asks for the exact count, which is what makes it
         * possible to work out the remaining ranges and ask for them together, so the cost
         * is roughly one round trip instead of three.
         */
        const first = await supabase
          .from(ORDERS_TABLE.kurdistani)
          .select(COLUMNS, { count: "exact" })
          .order("id", { ascending: true })
          .range(0, page - 1);

        if (first.error) throw readFailed(first.error.message, first.error.code);
        rows.push(...((first.data ?? []) as unknown as Record<string, unknown>[]));

        const total = first.count ?? rows.length;
        const offsets: number[] = [];
        for (let from = page; from < total; from += page) offsets.push(from);

        if (offsets.length) {
          // Promise.all keeps the results in the order the promises were given, so
          // concatenating them rebuilds exact id order without sorting. Sorting here would
          // have been wrong as well as unnecessary: sheet_row is not the id, and ordering by
          // it would interleave the months differently from how the rows were read.
          const rest = await Promise.all(offsets.map(readPage));
          for (const chunk of rest) rows.push(...chunk);
        }
      } catch (error) {
        if (error instanceof OrdersLoadError) throw error;
        console.error("[orders] Supabase unreachable", error);
        throw new OrdersLoadError("unreachable", "Could not reach the database.");
      }

      const months: Record<string, Order[]> = {};
      let withoutSheetRow = 0;

      for (const row of rows) {
        const month = String(row.order_month || "");
        if (!month) continue;

        /*
         * An order with no sheet row is kept.
         *
         * It used to be thrown away, on the reasoning that every edit and delete finds an
         * order in the sheet by row number, so a row without one was not safely editable.
         * The effect was worse than the problem: orders that existed in Supabase simply did
         * not appear, and nothing on screen said why. Supabase is where the orders live now,
         * so the database is what decides whether an order exists.
         *
         * The key stands in for the row number when there is none. Deletes already match on
         * unique_order_id first, and edits write to Supabase, so an order without a sheet
         * row is still fully usable — it just has no counterpart in the old sheet.
         */
        const sheetRow = row.sheet_row;
        const hasSheetRow = sheetRow !== null && sheetRow !== undefined;
        if (!hasSheetRow) withoutSheetRow += 1;
        const id = hasSheetRow
          ? (sheetRow as number)
          : String(row.unique_order_id || `${month}-${row.insta ?? ""}-${row.price ?? ""}`);
        // The database column is snake_case; the app reads camelCase everywhere.
        const links = row.linked_order_ids;
        (months[month] ??= []).push({
          ...(row as unknown as Order),
          id,
          sheet_name: month,
          linkedOrderIds: Array.isArray(links)
            ? (links as (string | number)[])
            : typeof links === "string" && links.trim()
              ? links
                  .split(",")
                  .map((part) => part.trim())
                  .filter(Boolean)
              : undefined,
          _fromSheet: true,
        });
      }

      const stats: Record<string, MonthlyStats> = {};
      for (const [month, list] of Object.entries(months)) stats[month] = statsFor(list);

      if (withoutSheetRow) {
        console.info(
          `[orders] ${withoutSheetRow} order(s) have no sheet row and are keyed by their id — ` +
            "shown as normal, but they have no row in the old Google Sheet",
        );
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
