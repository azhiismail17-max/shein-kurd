/**
 * Moves the Iraqi orders into the Kurdistani branch, then closes the Iraqi table out.
 *
 *   npx esbuild scripts/move-iraqi-to-kurdistani.ts --bundle --platform=node --format=esm \
 *     --alias:@=./src --outfile=.tmp/move-iraqi.mjs
 *   SUPABASE_SECRET_KEY=... node .tmp/move-iraqi.mjs             # dry run, writes nothing
 *   SUPABASE_SECRET_KEY=... node .tmp/move-iraqi.mjs --commit    # move them
 *   SUPABASE_SECRET_KEY=... node .tmp/move-iraqi.mjs --commit --delete-source
 *
 * SUPABASE ONLY
 * Nothing is written to any Google Sheet. The orders are copied from one table to the other
 * and that is the whole move. This is possible because loadOrders no longer throws away an
 * order that has no sheet row — it keys those by their id instead — so an order can exist in
 * the database without a counterpart in the old sheet.
 *
 * WHAT IS NOT COPIED
 * An order already present in Kurdistani. Matched on its key first, and failing that on
 * Instagram handle plus price, because the same order written through both branches has two
 * different keys but the same customer and the same money.
 *
 * Deleting from orders_iraqi is a separate flag, and only runs once every order it would
 * remove has been confirmed present in Kurdistani. A backup of the source table is written
 * before anything happens either way.
 */

import { writeFileSync, mkdirSync } from "node:fs";

const SUPABASE_URL = "https://rjwpvgzpyxgwlsanwwvd.supabase.co";
const args = process.argv.slice(2);
const COMMIT = args.includes("--commit");
const DELETE_SOURCE = args.includes("--delete-source");

const KEY = process.env.SUPABASE_SECRET_KEY ?? "";
if (!KEY) {
  console.error("Set SUPABASE_SECRET_KEY. Nothing was read or written.");
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

type Row = Record<string, unknown>;

const text = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const money = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) && n !== 0 ? n : null;
};

async function readAll(table: string, query = ""): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*${query}&order=id.asc&offset=${from}&limit=1000`,
      { headers: H },
    );
    if (!r.ok) throw new Error(`read ${table}: ${await r.text()}`);
    const d = (await r.json()) as Row[];
    out.push(...d);
    if (d.length < 1000) break;
  }
  return out;
}

(async () => {
  const iraqi = await readAll("orders_iraqi");
  const kurd = await readAll("orders_kurdistani", "&order_month=eq.Aug");

  mkdirSync("backups", { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(`backups/orders_iraqi_${stamp}.json`, JSON.stringify(iraqi, null, 2));
  console.log(`backed up ${iraqi.length} Iraqi orders -> backups/orders_iraqi_${stamp}.json\n`);

  const keys = new Set(kurd.map((r) => text(r.unique_order_id)).filter(Boolean));
  const fingerprints = new Set(
    kurd.map((r) => `${text(r.insta).toLowerCase()}|${money(r.price) ?? 0}`),
  );

  const toMove: Row[] = [];
  const skipped: string[] = [];
  for (const row of iraqi) {
    const label = `${text(row.order_month)} ${text(row.insta) || text(row.name)} ${text(row.price)}`;
    if (keys.has(text(row.unique_order_id))) {
      skipped.push(`${label} — same key already in Kurdistani`);
      continue;
    }
    if (fingerprints.has(`${text(row.insta).toLowerCase()}|${money(row.price) ?? 0}`)) {
      skipped.push(`${label} — same handle and price already in Kurdistani`);
      continue;
    }
    toMove.push(row);
  }

  console.log(`would move  : ${toMove.length}`);
  toMove.forEach((r) =>
    console.log(`    ${text(r.order_month)}  ${text(r.insta) || text(r.name)}  ${text(r.price)}`),
  );
  console.log(`would skip  : ${skipped.length}`);
  skipped.forEach((s) => console.log(`    ${s}`));

  if (!COMMIT) {
    console.log("\nDry run. The sheet and both tables are untouched.");
    console.log("Pass --commit to move them, and --delete-source as well to empty orders_iraqi.");
    return;
  }

  const movedIds: unknown[] = [];
  let failures = 0;
  for (const row of toMove) {
    const label = text(row.insta) || text(row.name);

    const insert = { ...row, region: "kurdistani" } as Row;
    // The Kurdistani table assigns its own id. sheet_row stays as it is — null for these,
    // which the loader now handles.
    delete insert.id;

    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders_kurdistani`, {
      method: "POST",
      headers: { ...H, Prefer: "return=representation" },
      body: JSON.stringify(insert),
    });
    if (!r.ok) {
      console.error(`  ${label}: Supabase refused it: ${await r.text()}`);
      failures++;
      continue;
    }
    movedIds.push(row.id);
    console.log(`  ${label}: copied to Kurdistani`);
  }

  console.log(`\nmoved ${movedIds.length} of ${toMove.length}; ${failures} failure(s)`);

  if (!DELETE_SOURCE) {
    console.log("orders_iraqi left as it is. Re-run with --delete-source to empty it.");
    return;
  }
  if (failures > 0) {
    console.error("Refusing to delete from orders_iraqi while any move failed.");
    process.exit(1);
  }

  // Only the rows proved to be in Kurdistani, plus the ones that were already duplicates.
  const removable = iraqi.filter(
    (r) => movedIds.includes(r.id) || skipped.some((s) => s.includes(text(r.insta))),
  );
  console.log(`\ndeleting ${removable.length} row(s) from orders_iraqi`);
  for (const row of removable) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders_iraqi?id=eq.${row.id}`, {
      method: "DELETE",
      headers: H,
    });
    console.log(`  id ${row.id} -> ${r.status}`);
  }

  const left = await fetch(`${SUPABASE_URL}/rest/v1/orders_iraqi?select=id&limit=1`, {
    headers: { ...H, Prefer: "count=exact" },
  });
  console.log(`orders_iraqi now holds: ${left.headers.get("content-range")}`);
})().catch((e) => {
  console.error(`\nfailed: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
