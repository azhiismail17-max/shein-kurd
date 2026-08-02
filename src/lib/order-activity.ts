/**
 * Turns a list of orders into the series behind the Order Activity charts.
 *
 * This lives on its own because the dashboard and the team report both need it, and
 * because the parsing is the part that quietly broke: the chart used to read `order.date`
 * as the sheet's `"DD/MM HH:MM"`, splitting on a space and expecting exactly two pieces.
 * Orders now come from Supabase as ISO timestamps, so every row failed that test and the
 * chart rendered an empty box. Both shapes are accepted here.
 */

import { YEARS_CONFIG } from "@/types";

/**
 * The little an order has to have to be charted.
 *
 * Structural on purpose: the dashboard passes full orders while the team report passes
 * the narrow row it selects from Supabase, and both need to reach this code without one
 * being converted into the other.
 */
export interface DatedOrder {
  date?: string | null;
  order_month?: string | null;
  order_year?: number | null;
  sheet_name?: string | null;
}

/** How the orders are bucketed along the x-axis. */
export type ActivityView = "monthly" | "daily" | "weekday" | "weekly" | "hourly";

export const ACTIVITY_VIEWS: ActivityView[] = ["monthly", "weekly", "daily", "weekday", "hourly"];

export const ACTIVITY_LABELS: Record<ActivityView, string> = {
  monthly: "Monthly",
  weekly: "Weekly",
  daily: "Daily",
  weekday: "Day of week",
  hourly: "Hourly",
};

export interface ActivityPoint {
  name: string;
  orders: number;
}

export interface ActivitySeries {
  points: ActivityPoint[];
  /** Orders placed on the chart. */
  counted: number;
  /**
   * Orders left off because they carry no usable date.
   *
   * Worth surfacing: 872 of the imported 2025 rows have no date at all. They can still
   * be counted monthly, from the month and year columns, but they cannot be put on a
   * day or an hour — so a daily chart that silently ignored them would understate the
   * totals with no hint as to why.
   */
  undated: number;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * The moment an order was placed, or null if it has none.
 *
 * Accepts the ISO timestamps Supabase returns and the `"D/M HH:MM"` and `"D/M/YYYY HH:MM"`
 * text the sheet used to produce. A sheet date with no year takes the year from the
 * order's own column, since guessing the current one would move old orders into today.
 *
 * Read the result with the getUTC* methods, never the local ones. The stored times are
 * Baghdad wall-clock readings that carry a `+00:00` offset — the sheet only ever recorded
 * what the clock on the wall said, and the import kept those digits. Reading them as
 * local time adds the timezone offset on top and reports every order three hours late,
 * which showed up as a 157-order spike at "03:00" and a dead afternoon. `wallClock`
 * below is the accessor to use.
 */
export function orderMoment(order: DatedOrder): Date | null {
  const raw = String(order.date ?? "").trim();
  if (!raw || raw === "Unknown Date") return null;

  // ISO, which is everything coming from Supabase.
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const at = new Date(raw);
    return Number.isNaN(at.getTime()) ? null : at;
  }

  // "7/8 19:35", "7/8/2026 19:35", or either without a time.
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!match) return null;

  const [, day, month, year, hour, minute] = match;
  const resolvedYear = year
    ? Number(year.length === 2 ? `20${year}` : year)
    : Number(order.order_year) || new Date().getFullYear();

  // Date.UTC, so the digits typed into the sheet stay in the UTC fields and the two
  // date shapes can be read exactly the same way.
  const at = new Date(
    Date.UTC(resolvedYear, Number(month) - 1, Number(day), Number(hour ?? 0), Number(minute ?? 0)),
  );
  return Number.isNaN(at.getTime()) ? null : at;
}

/** The recorded wall-clock parts of an order's date. */
export interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 0 = Sunday, matching Date.getUTCDay. */
  weekday: number;
}

/** The clock reading an order was recorded with, free of the viewer's timezone. */
export function wallClock(order: DatedOrder): WallClock | null {
  const at = orderMoment(order);
  if (!at) return null;
  return {
    year: at.getUTCFullYear(),
    month: at.getUTCMonth(),
    day: at.getUTCDate(),
    hour: at.getUTCHours(),
    minute: at.getUTCMinutes(),
    weekday: at.getUTCDay(),
  };
}

/**
 * Position of a month within its year, using the app's own month names.
 *
 * 2025 and 2026 name their months differently — "Julyi" and "Augi" against "July" and
 * "Aug" — so the order has to come from the configured lists rather than from parsing.
 */
function monthRank(month: string, year: number): number {
  const names = YEARS_CONFIG[String(year)];
  const index = names ? names.indexOf(month) : -1;
  return index >= 0 ? index : SHORT_MONTHS.findIndex((m) => month.startsWith(m));
}

/**
 * A number that sorts months chronologically across years.
 *
 * Needed wherever months are listed: sorting them by how many orders they hold puts
 * February before July before June, which reads as scrambled.
 */
export function monthSortKey(month: string, year: number): number {
  return year * 100 + monthRank(month, year);
}

/** Monday of the week a date falls in, so weekly buckets line up across months. */
function weekStart(clock: WallClock): Date {
  const start = new Date(Date.UTC(clock.year, clock.month, clock.day));
  // getUTCDay is Sunday-based; shift so the week begins on Monday.
  start.setUTCDate(start.getUTCDate() - ((clock.weekday + 6) % 7));
  return start;
}

interface Bucket {
  name: string;
  sort: number;
  orders: number;
}

/**
 * Groups orders for one of the activity views.
 *
 * The monthly view reads the month and year columns, so it covers every order the app
 * holds — including the imported rows that never had a date. The other views need a real
 * timestamp and report how many orders they had to leave out.
 */
export function buildActivity(orders: DatedOrder[], view: ActivityView): ActivitySeries {
  const buckets = new Map<string, Bucket>();
  let counted = 0;
  let undated = 0;

  const add = (key: string, name: string, sort: number) => {
    const existing = buckets.get(key);
    if (existing) existing.orders += 1;
    else buckets.set(key, { name, sort, orders: 1 });
    counted += 1;
  };

  orders.forEach((order) => {
    if (view === "monthly") {
      // Falls back to the month and year columns, which every order has, so nothing is
      // dropped from the one view that is meant to show the whole history.
      const clock = wallClock(order);
      const month = String(order.order_month || order.sheet_name || "").trim();
      const year = Number(order.order_year) || clock?.year || 0;

      if (clock && !month) {
        add(
          `${clock.year}-${clock.month}`,
          `${SHORT_MONTHS[clock.month]} ${clock.year}`,
          clock.year * 100 + clock.month,
        );
      } else if (month) {
        add(
          `${year}-${month}`,
          year ? `${month} ${year}` : month,
          year * 100 + monthRank(month, year),
        );
      } else {
        undated += 1;
      }
      return;
    }

    const clock = wallClock(order);
    if (!clock) {
      undated += 1;
      return;
    }

    if (view === "hourly") {
      add(String(clock.hour), `${String(clock.hour).padStart(2, "0")}:00`, clock.hour);
    } else if (view === "weekday") {
      // Monday first, matching the weekly buckets and how the team reads a week.
      add(String(clock.weekday), WEEKDAY_NAMES[clock.weekday], (clock.weekday + 6) % 7);
    } else if (view === "weekly") {
      const start = weekStart(clock);
      add(
        start.toISOString().slice(0, 10),
        `${start.getUTCDate()} ${SHORT_MONTHS[start.getUTCMonth()]}`,
        start.getTime(),
      );
    } else {
      const day = Date.UTC(clock.year, clock.month, clock.day);
      add(String(day), `${clock.day} ${SHORT_MONTHS[clock.month]}`, day);
    }
  });

  // Sorted on the numeric key, never on the label: a string sort puts "10 Aug" before
  // "2 Aug" and "10:00" before "9:00".
  const points = Array.from(buckets.values())
    .sort((a, b) => a.sort - b.sort)
    .map(({ name, orders: total }) => ({ name, orders: total }));

  return { points, counted, undated };
}
