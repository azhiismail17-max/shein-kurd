/**
 * Fills in `sheet_row` on the Supabase order tables.
 *
 *   npm run backfill-rows                 # dry run, writes nothing
 *   npm run backfill-rows -- --commit
 *
 * Why this is needed: Supabase's `id` is its own identity column, not the row number
 * the Google sheet assigned. Every edit, status change and delete still reaches the
 * sheet by row number, so reading orders out of Supabase without it would send edits
 * to the wrong row.
 *
 * The row number is recovered two ways, both exact:
 *   - from a key shaped "kurdistani:Dece:4", which encodes it directly
 *   - for the older uuid keys, from the snapshot, which holds both the uuid and the
 *     sheet id for exactly those orders
 *
 * Nothing is guessed. A row whose number cannot be established is reported and left
 * alone, because a wrong row number is worse than a missing one.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { Order } from "../src/types";

const SNAPSHOT_PATH = resolve(process.cwd(), "data/orders-snapshot.json");
const SUPABASE_URL = process.env.SUPABASE_URL || "https://rjwpvgzpyxgwlsanwwvd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

const TABLES = ["orders_kurdistani", "orders_iraqi"] as const;
const commit = process.argv.includes("--commit");

if (!SUPABASE_KEY) {
  console.error("Set SUPABASE_SECRET_KEY so the update can pass Row Level Security.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** uuid -> sheet row, taken from the snapshot for the orders that carry a uuid. */
function buildUuidMap(): Map<string, number> {
  const map = new Map<string, number>();
  try {
    const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as {
      months: Record<string, Order[]>;
    };
    for (const orders of Object.values(snapshot.months)) {
      for (const order of orders) {
        const uuid = String(order.unique_order_id || "").trim();
        const row = Number(order.id);
        if (uuid && Number.isFinite(row)) map.set(uuid, row);
      }
    }
  } catch {
    console.warn("  ! snapshot not readable — uuid-keyed rows cannot be resolved");
  }
  return map;
}

const uuidMap = buildUuidMap();
console.log(`Snapshot supplies ${uuidMap.size} uuid -> sheet row pairs\n`);

for (const table of TABLES) {
  console.log(`=== ${table} ===`);

  const rows: { id: number; unique_order_id: string | null; sheet_row: number | null }[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from(table)
      .select("id, unique_order_id, sheet_row")
      .order("id", { ascending: true })
      .range(from, from + page - 1);
    if (error) {
      console.error(`  could not read: ${error.message}`);
      if (/sheet_row/.test(error.message)) {
        console.error("  add the column first:");
        console.error(`    alter table ${table} add column sheet_row bigint;`);
      }
      process.exit(1);
    }
    rows.push(...(data ?? []));
    if (!data || data.length < page) break;
  }
  console.log(`  ${rows.length} rows`);

  const updates: { id: number; sheet_row: number }[] = [];
  const unresolved: string[] = [];
  let already = 0;

  for (const row of rows) {
    if (row.sheet_row !== null && row.sheet_row !== undefined) {
      already += 1;
      continue;
    }
    const key = String(row.unique_order_id || "").trim();
    const encoded = key.match(/^[a-z]+:[^:]+:(\d+)$/i);
    if (encoded) {
      updates.push({ id: row.id, sheet_row: Number(encoded[1]) });
      continue;
    }
    const mapped = uuidMap.get(key);
    if (mapped !== undefined) {
      updates.push({ id: row.id, sheet_row: mapped });
      continue;
    }
    unresolved.push(key || `(no key, supabase id ${row.id})`);
  }

  console.log(`  already set        : ${already}`);
  console.log(`  to write           : ${updates.length}`);
  console.log(`  cannot determine   : ${unresolved.length}`);
  if (unresolved.length) {
    console.log(`    e.g. ${JSON.stringify(unresolved.slice(0, 4))}`);
  }

  if (!commit) {
    console.log("  DRY RUN — nothing written\n");
    continue;
  }
  if (!updates.length) {
    console.log("  nothing to write\n");
    continue;
  }

  // One row at a time by primary key: each sheet_row belongs to exactly one order, so
  // there is no bulk shortcut that could mix them up.
  let written = 0;
  const failures: string[] = [];
  for (const update of updates) {
    const { error } = await supabase
      .from(table)
      .update({ sheet_row: update.sheet_row })
      .eq("id", update.id);
    if (error) failures.push(`id ${update.id}: ${error.message}`);
    else written += 1;
    if (written % 250 === 0) console.log(`  written ${written}/${updates.length}`);
  }
  console.log(`  written ${written}/${updates.length}`);
  if (failures.length) {
    console.error(`  ${failures.length} failed, first few:`);
    for (const f of failures.slice(0, 3)) console.error(`    ${f}`);
  }
  console.log("");
}
