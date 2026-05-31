## Goal

Make `/iraqi` a fully independent profile from `/` (Kurdistani). They already point at different Google Sheets and different Firebase projects, but they currently share the browser session, so logging in / out of one affects the other. After this change:

- Each system uses its own data, its own sheet (its own `SCRIPT_URL`), its own Firebase, its own settings.
- Only the **owner** can move between both systems. Everyone else is locked to whichever one they logged into.

## What changes

### 1. Separate sessions and settings per system

Right now both apps read/write the same `localStorage` keys (`auth_role`, `auth_username`, `app_activeTab`, `app_activeMonth`, etc.), so the second system silently inherits the first one's login.

- Prefix every Iraqi-side key with `iraqi_` (e.g. `iraqi_auth_role`, `iraqi_auth_username`, `iraqi_app_activeTab`, `iraqi_app_activeMonth`, `iraqi_app_viewingMonth`, `iraqi_app_searchQuery`, `iraqi_app_scrollY`, `iraqi_shein_verified_orders`, `iraqi_shein_missing_orders`, `iraqi_shein_missing_images`).
- Files touched: `src/iraqi/IraqiApp.tsx`, `src/iraqi/components/app/LoginView.tsx`, `src/iraqi/components/app/UserProfileModal.tsx`, `src/iraqi/lib/notifications.ts`, `src/iraqi/types/index.ts`, plus anywhere else in `src/iraqi/` that reads `auth_role` / `auth_username` / `app_*` / `shein_*`.
- Kurdistani files are NOT touched — its keys stay exactly as they are today.

Result: each system has its own login, its own selected month/tab, its own scroll position, its own verified/missing caches.

### 2. Owner-only crossover

- `SystemSwitcher` already hides for non-owner — keep as is.
- On `/iraqi`, the floating "Back to Kurdistani" button is shown **only when the Iraqi session role is `owner`** (read from `iraqi_auth_role`). Non-owners on Iraqi never see it.
- Add a guard on `/iraqi`: if the Kurdistani-side role exists and is NOT `owner`, redirect back to `/`. This stops a logged-in Kurdistani moderator/admin/delivery from poking the URL.
- Add the mirror guard on `/`: if a non-owner has only the Iraqi session and lands on `/`, the Kurdistani login screen appears as today (no change needed, since Kurdistani uses its own keys).

### 3. Iraqi backend stays on its own sheet

`src/iraqi/types/index.ts` already exports the Iraqi `SCRIPT_URL` (`AKfycbwYc-fX…23Q/exec`) — different from the Kurdistani one — and Iraqi components import from `@/iraqi/...`. No change needed; this plan just confirms that all Iraqi data calls keep going to the Iraqi sheet.

### 4. Auth credentials

Per your answer, both systems keep the same hardcoded users for now (`owner / mostang2021`, `admin / shein4321`, `modertor / shein1234`, `delvery / sheindelivery`). They're just stored under different localStorage keys, so logging into one no longer auto-logs you into the other. When you're ready to give Iraqi its own users, we swap the Iraqi `LoginView` user list — nothing else has to change.

## Out of scope
- and change the iraqi color to this code color #6b0f14
- No design/visual changes to either system.
- No changes to Kurdistani code paths.
- Not migrating any data — Iraqi keeps its own Google Sheet and Firebase project, Kurdistani keeps its own.

## Technical notes

- `src/routes/iraqi.tsx` keeps `ssr: false` so `localStorage` reads stay client-only. The owner guard runs in a `useEffect` on mount and uses `window.location.href = '/'` to bounce non-owners.
- The Iraqi back-to-Kurdistani button reads `localStorage.getItem('iraqi_auth_role')` and renders only when it equals `'owner'`.
- No new dependencies, no schema, no server functions.
