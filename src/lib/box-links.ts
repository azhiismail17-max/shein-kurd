/**
 * A box's total link, pictures and warning pictures — read from and written to Supabase.
 *
 * They used to live in localStorage and in an Apps Script action the deployed script does not
 * answer, which meant whoever saved a link was the only person who could see it. Every owner
 * and admin reads the same row now, so a link saved once can be opened, copied and edited by
 * all of them, and the pictures come with it.
 */

import { supabase } from "@/lib/supabase";

export interface BoxLinkRow {
  box_name: string;
  sheet_name: string;
  total_link: string | null;
  pictures: string[];
  warnings: string[];
  updated_at: string | null;
  updated_by_name: string | null;
}

const TABLE = "box_links";
const COLUMNS = "box_name,sheet_name,total_link,pictures,warnings,updated_at,updated_by_name";

/** Arrays come back from Postgres as arrays; anything else is treated as empty. */
const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : [];

const shape = (row: Record<string, unknown>): BoxLinkRow => ({
  box_name: String(row.box_name ?? ""),
  sheet_name: String(row.sheet_name ?? ""),
  total_link: (row.total_link as string) ?? null,
  pictures: list(row.pictures),
  warnings: list(row.warnings),
  updated_at: (row.updated_at as string) ?? null,
  updated_by_name: (row.updated_by_name as string) ?? null,
});

/**
 * Every box link for a month.
 *
 * A missing table is reported as an empty list rather than an error: the boxes screen has to
 * keep working before box-links-schema.sql has been run, just without the links.
 */
export async function loadBoxLinks(
  sheetName: string,
): Promise<{ links: BoxLinkRow[]; error: string | null }> {
  const { data, error } = await supabase.from(TABLE).select(COLUMNS).eq("sheet_name", sheetName);

  if (error) {
    if (error.code === "42P01") {
      console.info("[box links] the box_links table does not exist yet — run box-links-schema.sql");
      return { links: [], error: null };
    }
    console.error("[box links] could not read:", error.message);
    return { links: [], error: error.message };
  }
  return { links: (data ?? []).map((row) => shape(row as Record<string, unknown>)), error: null };
}

export type SaveResult = { ok: true; row: BoxLinkRow } | { ok: false; error: string };

/**
 * Saves a box's link and media, replacing whatever was there for that box and month.
 *
 * One row per box per month, so this is an upsert on that pair rather than an insert — saving
 * twice edits the row instead of leaving two rows that disagree about the same box.
 */
export async function saveBoxLink(input: {
  boxName: string;
  sheetName: string;
  totalLink: string;
  pictures: string[];
  warnings: string[];
}): Promise<SaveResult> {
  const boxName = input.boxName.trim();
  const sheetName = input.sheetName.trim();
  if (!boxName || !sheetName) return { ok: false, error: "The box has no name or month." };

  const { data: session } = await supabase.auth.getUser();
  const staffId = session.user?.id ?? null;
  const staffName =
    (typeof window === "undefined" ? "" : localStorage.getItem("auth_username") || "").trim() ||
    null;

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        box_name: boxName,
        sheet_name: sheetName,
        total_link: input.totalLink.trim() || null,
        pictures: input.pictures,
        warnings: input.warnings,
        updated_at: new Date().toISOString(),
        updated_by: staffId,
        updated_by_name: staffName,
      },
      { onConflict: "sheet_name,box_name" },
    )
    .select(COLUMNS)
    .single();

  if (error) {
    if (error.code === "42P01") {
      return { ok: false, error: "The box_links table is missing — run box-links-schema.sql." };
    }
    if (error.code === "42501") {
      return { ok: false, error: "Only the owner and admins can save a box link." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, row: shape(data as Record<string, unknown>) };
}
