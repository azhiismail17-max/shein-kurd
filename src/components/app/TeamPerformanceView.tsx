import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ACTIVITY_LABELS,
  ACTIVITY_VIEWS,
  ActivityView,
  buildActivity,
  monthSortKey,
  wallClock,
} from "@/lib/order-activity";
import { Loader2, Users, ChevronRight, TrendingUp, RefreshCw } from "lucide-react";
import { supabase, ORDERS_TABLE } from "@/lib/supabase";

/**
 * Who submitted which orders, by month and week.
 *
 * Read-only by construction: the only database call is a `select`, and no row is ever
 * written back from this screen.
 *
 * Counting is deliberately strict. Only orders carrying a `staff_name` are attributed
 * to anyone — historical rows have none, and guessing at them would inflate somebody's
 * total with orders they did not take. Those rows are reported separately instead of
 * being hidden or spread around.
 */

interface StaffOrder {
  sheet_row: number | null;
  unique_order_id: string | null;
  staff_name: string | null;
  staff_role: string | null;
  admin_name: string | null;
  admin_role: string | null;
  order_month: string | null;
  order_year: number | null;
  date: string | null;
  /** Present only once the column has been added; the code works without it. */
  created_at?: string | null;
  name: string | null;
  insta: string | null;
  price: number | null;
}

/**
 * When the order was submitted.
 *
 * `date` is preferred over `created_at`. The created_at column was added with a
 * `default now()`, which stamped every pre-existing row with the moment of the change —
 * all 2,010 of them share one day — so trusting it first would file the entire history
 * under that single date. `date` holds the real submission time, to the minute, for
 * orders created through the app; created_at is only a fallback for a row that somehow
 * has no date at all.
 */
function submittedAt(order: StaffOrder): string | null {
  return order.date ?? order.created_at ?? null;
}

/** Who took it. staff_name going forward, admin_name for orders that predate it. */
function staffOf(order: StaffOrder): string {
  return String(order.staff_name || order.admin_name || "").trim();
}

function staffRoleOf(order: StaffOrder): string {
  return String(order.staff_role || order.admin_role || "").trim();
}

interface DayGroup {
  key: string;
  label: string;
  orders: StaffOrder[];
}
interface WeekGroup {
  week: number;
  orders: StaffOrder[];
  days: DayGroup[];
}
interface MonthGroup {
  key: string;
  month: string;
  year: number;
  orders: StaffOrder[];
  weeks: WeekGroup[];
}
interface StaffGroup {
  name: string;
  role: string;
  total: number;
  revenue: number;
  months: MonthGroup[];
}

const BASE_COLUMNS =
  "sheet_row,unique_order_id,staff_name,staff_role,admin_name,admin_role," +
  "order_month,order_year,date,name,insta,price";
// Asked for first; the query is retried without it if the column has not been added.
const COLUMNS_WITH_CREATED = `${BASE_COLUMNS},created_at`;

/**
 * A parsed date only tells the time if one was actually recorded. Orders imported from
 * the sheet came from text like "13/08" with no clock time, so they land on midnight —
 * showing that as 00:00 would read as a real submission time.
 */
/**
 * The time as it was recorded, in Baghdad hours.
 *
 * Goes through `wallClock` rather than `new Date(iso).getHours()`. The stored timestamps
 * carry a `+00:00` offset but hold local wall-clock readings, so the local getters add
 * the offset a second time and report every order three hours late.
 */
function clockOf(iso: string | null): string | null {
  const clock = wallClock({ date: iso });
  if (!clock) return null;
  // Midnight means the source had a day but no clock time, not that it was 00:00.
  if (clock.hour === 0 && clock.minute === 0) return null;
  return `${String(clock.hour).padStart(2, "0")}:${String(clock.minute).padStart(2, "0")}`;
}

const sameDay = (a: string | null, b: string | null) =>
  !!a && !!b && String(a).slice(0, 10) === String(b).slice(0, 10);

/**
 * The submission time shown against an order.
 *
 * The order's own date is used first, since that is what carries the real time for
 * anything created in the app. created_at is consulted only when the date has no clock
 * time and created_at falls on the same day — the column was added with a
 * `default now()`, so on older rows it holds the moment of that change and would
 * otherwise print a convincing but invented time.
 */
function timeOf(order: StaffOrder): string {
  const fromDate = clockOf(order.date ?? null);
  if (fromDate) return fromDate;
  if (sameDay(order.date ?? null, order.created_at ?? null)) {
    const fromCreated = clockOf(order.created_at ?? null);
    if (fromCreated) return fromCreated;
  }
  return "no time";
}

function dayOf(iso: string | null): string {
  const clock = wallClock({ date: iso });
  if (!clock) return "—";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][clock.weekday];
  return `${weekday} ${String(clock.day).padStart(2, "0")}/${String(clock.month + 1).padStart(2, "0")}`;
}

/** Week within the month, matching how the activity chart already splits weeks. */
/** Minutes into the day an order was recorded, for ordering a day's rows. */
function minuteOf(iso: string | null): number {
  const clock = wallClock({ date: iso });
  return clock ? clock.hour * 60 + clock.minute : 0;
}

function weekOf(iso: string | null): number {
  const clock = wallClock({ date: iso });
  return clock ? Math.ceil(clock.day / 7) : 0;
}

const TeamPerformanceView: React.FC = () => {
  const [rows, setRows] = useState<StaffOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openStaff, setOpenStaff] = useState<string | null>(null);
  const [activityView, setActivityView] = useState<ActivityView>("weekday");
  /** Whose orders the activity chart shows; null means the whole team. */
  const [activityPerson, setActivityPerson] = useState<string | null>(null);
  // Shown so it is obvious whether a report covers the whole team or just one person.
  const viewerRole = typeof window !== "undefined" ? localStorage.getItem("auth_role") || "" : "";
  const seesEveryone = viewerRole === "owner" || viewerRole === "admin";

  const [refreshing, setRefreshing] = useState(false);
  /** Bumped to re-run the load; deleting an order elsewhere has to show up here. */
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const page = 1000;
      // created_at is asked for first. If the column has not been added the request is
      // repeated without it, so the dashboard works either way and switches over on its
      // own once the column exists.
      const readAll = async (columns: string) => {
        const all: StaffOrder[] = [];
        for (let from = 0; ; from += page) {
          const { data, error: readError } = await supabase
            .from(ORDERS_TABLE.kurdistani)
            .select(columns)
            .order("id", { ascending: false })
            .range(from, from + page - 1);
          if (readError) throw readError;
          all.push(...((data ?? []) as unknown as StaffOrder[]));
          if (!data || data.length < page) break;
        }
        return all;
      };

      try {
        let all: StaffOrder[];
        try {
          all = await readAll(COLUMNS_WITH_CREATED);
        } catch (first) {
          const message = first instanceof Error ? first.message : String(first);
          if (!/created_at/.test(message)) throw first;
          console.info("[team] created_at column not present — using the order date");
          all = await readAll(BASE_COLUMNS);
        }
        if (!cancelled) {
          setRows(all);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load orders");
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  /**
   * Reads the orders again.
   *
   * A deleted order is gone from Supabase, but this screen had already loaded its rows
   * and would keep showing it — and keep counting it towards whoever created it — until
   * the page was reloaded. Coming back to the tab or pressing refresh re-reads, so a
   * deletion made anywhere in the app disappears from the report as well.
   */
  const reload = useCallback(() => {
    setRefreshing(true);
    setReloadTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [reload]);

  /**
   * The activity chart's series.
   *
   * Built from the rows already fetched, so it always agrees with the totals below and
   * costs no extra request. Filtering by person is done here rather than in the query for
   * the same reason.
   */
  const activity = useMemo(() => {
    const list = (rows ?? []).filter((row) => !activityPerson || staffOf(row) === activityPerson);
    return buildActivity(list, activityView);
  }, [rows, activityPerson, activityView]);

  const { staff, unattributed, totalOrders } = useMemo(() => {
    const list = rows ?? [];
    const named = list.filter((row) => staffOf(row));
    const byStaff = new Map<string, StaffOrder[]>();
    for (const row of named) {
      const key = staffOf(row);
      const bucket = byStaff.get(key);
      if (bucket) bucket.push(row);
      else byStaff.set(key, [row]);
    }

    const groups: StaffGroup[] = [...byStaff.entries()].map(([name, orders]) => {
      const byMonth = new Map<string, StaffOrder[]>();
      for (const order of orders) {
        const key = `${order.order_month ?? "—"} ${order.order_year ?? ""}`.trim();
        const bucket = byMonth.get(key);
        if (bucket) bucket.push(order);
        else byMonth.set(key, [order]);
      }

      const months: MonthGroup[] = [...byMonth.entries()]
        .map(([key, monthOrders]) => {
          const byWeek = new Map<number, StaffOrder[]>();
          for (const order of monthOrders) {
            const week = weekOf(submittedAt(order));
            const bucket = byWeek.get(week);
            if (bucket) bucket.push(order);
            else byWeek.set(week, [order]);
          }
          const weeks: WeekGroup[] = [...byWeek.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([week, weekOrders]) => {
              // Keyed on the day itself, not on its label. Sorting the labels put
              // "Fri" before "Mon" before "Sat" — alphabetical by weekday name — so the
              // days of a week came out shuffled.
              const byDay = new Map<number, StaffOrder[]>();
              for (const order of weekOrders) {
                const clock = wallClock({ date: submittedAt(order) });
                const key = clock ? Date.UTC(clock.year, clock.month, clock.day) : 0;
                const bucket = byDay.get(key);
                if (bucket) bucket.push(order);
                else byDay.set(key, [order]);
              }
              const days: DayGroup[] = [...byDay.entries()]
                .sort((a, b) => a[0] - b[0])
                .map(([stamp, dayOrders]) => ({
                  key: `${week}-${stamp}`,
                  label: dayOf(submittedAt(dayOrders[0])),
                  // Earliest first, so a day reads in the order the orders came in.
                  orders: [...dayOrders].sort(
                    (a, b) => minuteOf(submittedAt(a)) - minuteOf(submittedAt(b)),
                  ),
                }));
              return { week, orders: weekOrders, days };
            });
          return {
            key,
            month: monthOrders[0]?.order_month ?? "—",
            year: monthOrders[0]?.order_year ?? 0,
            orders: monthOrders,
            weeks,
          };
        })
        // Newest month first. This used to fall back to the order count within a year,
        // which listed Feb ahead of July ahead of June.
        .sort((a, b) => monthSortKey(b.month, b.year) - monthSortKey(a.month, a.year));

      return {
        name,
        role: staffRoleOf(orders[0] ?? ({} as StaffOrder)),
        total: orders.length,
        revenue: orders.reduce((sum, order) => sum + (order.price ?? 0), 0),
        months,
      };
    });

    groups.sort((a, b) => b.total - a.total);
    return { staff: groups, unattributed: list.length - named.length, totalOrders: list.length };
  }, [rows]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-border/80 bg-card p-6 text-center">
          <h2 className="text-lg font-extrabold tracking-tight">Could not load team data</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }
  if (!rows) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-5">
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/10">
            <Users size={18} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Team Performance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kurdistani orders, by person, month, week and day. This screen only reads.
            </p>
          </div>
          <button
            onClick={reload}
            disabled={refreshing}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground transition-all hover:bg-secondary disabled:opacity-50"
            title="Read the orders again, so deleted orders drop out"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <span>
            <span className="font-mono font-bold">{totalOrders.toLocaleString()}</span>{" "}
            <span className="text-muted-foreground">orders visible to you</span>
          </span>
          <span>
            <span className="font-mono font-bold">{staff.length}</span>{" "}
            <span className="text-muted-foreground">people with attributed orders</span>
          </span>
          <span className="text-muted-foreground">
            {seesEveryone
              ? "You see the whole team."
              : "You see only your own orders, as the database rules allow."}
          </span>
          <span className="text-muted-foreground">
            Times are the order&apos;s own timestamp in local hours, exact to the minute for orders
            created in the app.
          </span>
          <span className="text-muted-foreground">
            Kurdistani orders only — the Iraqi branch has its own table and is never mixed in here.
          </span>
          {unattributed > 0 && (
            <span className="text-muted-foreground">
              <span className="font-mono font-bold text-amber-500">
                {unattributed.toLocaleString()}
              </span>{" "}
              older orders record no name, so they count towards nobody
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Order Activity</h3>
              <p className="text-[11px] text-muted-foreground">
                When orders get submitted, and on which day of the week
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {ACTIVITY_VIEWS.map((view) => (
              <button
                key={view}
                onClick={() => setActivityView(view)}
                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase transition-all ${activityView === view ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {ACTIVITY_LABELS[view]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          <button
            onClick={() => setActivityPerson(null)}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-all ${activityPerson === null ? "bg-primary/15 text-primary ring-1 ring-primary/25" : "text-muted-foreground hover:bg-secondary"}`}
          >
            Whole team
          </button>
          {staff.map((person) => (
            <button
              key={person.name}
              onClick={() => setActivityPerson(person.name)}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-all ${activityPerson === person.name ? "bg-primary/15 text-primary ring-1 ring-primary/25" : "text-muted-foreground hover:bg-secondary"}`}
            >
              {person.name}
            </button>
          ))}
        </div>

        <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {activity.counted.toLocaleString()} orders
          {activity.undated > 0 &&
            ` · ${activity.undated.toLocaleString()} have no date, so they only appear under Monthly`}
        </div>

        {activity.points.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            No dated orders to chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activity.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {!staff.length && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 text-center text-sm text-muted-foreground">
          No orders carry a staff name yet. New orders record one from now on.
        </div>
      )}

      {staff.map((person) => {
        const open = openStaff === person.name;
        return (
          <div key={person.name} className="rounded-2xl border border-border/80 bg-card">
            <button
              onClick={() => setOpenStaff(open ? null : person.name)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
              aria-expanded={open}
            >
              <span className="flex min-w-0 items-center gap-3">
                <ChevronRight
                  size={16}
                  className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
                />
                <span className="min-w-0">
                  <span className="block truncate font-bold">{person.name}</span>
                  {person.role && (
                    <span className="block text-[11px] text-muted-foreground">{person.role}</span>
                  )}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-4 text-right">
                <span>
                  <span className="block font-mono text-lg font-extrabold tabular-nums">
                    {person.total.toLocaleString()}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                    orders
                  </span>
                </span>
                <span className="hidden sm:block">
                  <span className="block font-mono text-sm font-bold tabular-nums">
                    {person.revenue.toLocaleString()}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                    IQD
                  </span>
                </span>
              </span>
            </button>

            {open && (
              <div className="space-y-4 border-t border-border/80 p-4">
                {person.months.map((month) => (
                  <div key={month.key} className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-sm font-bold">
                        {month.month} {month.year || ""}
                      </h3>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {month.orders.length} orders
                      </span>
                    </div>

                    {month.weeks.map((week) => (
                      <div key={week.week} className="rounded-xl border border-border/60">
                        <div className="flex items-center justify-between border-b border-border/60 bg-secondary/40 px-3 py-1.5">
                          <span className="text-[11px] font-semibold">
                            {week.week ? `Week ${week.week}` : "No date recorded"}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                            {week.orders.length}
                          </span>
                        </div>
                        {week.days.map((day) => (
                          <div key={day.key}>
                            <div className="flex items-center justify-between border-b border-border/40 px-3 py-1">
                              <span className="font-mono text-[10px] font-bold tabular-nums text-primary">
                                {day.label}
                              </span>
                              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                                {day.orders.length} order{day.orders.length === 1 ? "" : "s"}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[28rem] text-xs">
                                <thead>
                                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    <th className="px-3 py-1 text-left font-semibold">Time</th>
                                    <th className="px-3 py-1 text-left font-semibold">Customer</th>
                                    <th className="px-3 py-1 text-right font-semibold">Price</th>
                                    <th className="px-3 py-1 text-right font-semibold">Row</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {day.orders
                                    .slice()
                                    .sort((a, b) =>
                                      String(submittedAt(a) ?? "").localeCompare(
                                        String(submittedAt(b) ?? ""),
                                      ),
                                    )
                                    .map((order) => (
                                      <tr
                                        key={
                                          order.unique_order_id ?? `${day.key}-${order.sheet_row}`
                                        }
                                        className="border-t border-border/40"
                                      >
                                        <td className="px-3 py-1 font-mono tabular-nums">
                                          {timeOf(order)}
                                        </td>
                                        <td className="max-w-[13rem] truncate px-3 py-1">
                                          {order.name || order.insta || "—"}
                                        </td>
                                        <td className="px-3 py-1 text-right font-mono tabular-nums">
                                          {order.price?.toLocaleString() ?? "—"}
                                        </td>
                                        <td className="px-3 py-1 text-right font-mono tabular-nums text-muted-foreground">
                                          {order.sheet_row ?? "—"}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamPerformanceView;
