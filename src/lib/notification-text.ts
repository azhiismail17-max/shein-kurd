/**
 * What a notification says, in Kurdish.
 *
 * Kept in one file so a wording change happens once rather than in eight call sites, and so
 * the phone notification and the in-app list can never drift apart.
 *
 * Who sent a notification is not written into these messages. It is added once, in
 * sendNotification, which is the only place that knows who is signed in — so every
 * notification names its sender in the same way and none of them says it twice.
 *
 * Written in Sorani. The warning wording — پارچەی نەقس, a missing piece — is the shop's own
 * phrase, so it is used exactly as given rather than translated from the English.
 */

/** Titles shown as the heading of a phone notification. */
export const NOTIFICATION_TITLES_KU: Record<string, string> = {
  warning: "پارچەی نەقس",
  link: "بەستنەوەی ئۆردەر",
  delete: "ئۆردەر سڕایەوە",
  edit: "ئۆردەر دەستکاری کرا",
  approve: "ئۆردەر کڕدرا",
  deliver: "ئۆردەر گەیشت",
  cancel: "ئۆردەر هەڵوەشێنرایەوە",
  custom: "زانیاری نوێ",
};

/** A customer's handle or name, whichever is there. */
const who = (order?: { name?: string | null; insta?: string | null }) =>
  String(order?.name || order?.insta || "").trim() || "ئۆردەر";

/** پارچەی نەقس — the missing-piece warning, with the customer it belongs to. */
export const warningAdded = (order?: { name?: string | null; insta?: string | null }) =>
  `پارچەی نەقس — ${who(order)}`;

export const warningPicturesAdded = (count: number, boxName: string) =>
  `${count} وێنەی پارچەی نەقس بۆ ${boxName} زیادکرا`;

export const orderDeleted = (order?: { name?: string | null; insta?: string | null }) =>
  `ئۆردەر سڕایەوە — ${who(order)}`;

export const orderEdited = (order?: { name?: string | null; insta?: string | null }) =>
  `ئۆردەر دەستکاری کرا — ${who(order)}`;

export const orderPurchased = (order?: { name?: string | null; insta?: string | null }) =>
  `ئۆردەر کڕدرا — ${who(order)}`;

export const orderDelivered = (order?: { name?: string | null; insta?: string | null }) =>
  `ئۆردەر گەیشت — ${who(order)}`;

export const ordersLinked = (count: number, names: string, more: boolean) =>
  `${count} ئۆردەر بەستراوە بەیەکەوە: ${names}${more ? " ..." : ""}`;

export const orderUnlinked = (order?: { name?: string | null; insta?: string | null }) =>
  `ئۆردەر لە گرووپ دەرکرا — ${who(order)}`;

export const totalLinkAdded = (boxName: string) => `لینکی کۆی گشتی بۆ ${boxName} زیادکرا`;

export const boxOrdersUpdated = (count: number, verb: string, boxName: string) =>
  `${count} ئۆردەر لە ${boxName} ${verb}`;
