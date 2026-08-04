import { createFileRoute, Link } from "@tanstack/react-router";

/**
 * /iraqi — closed.
 *
 * The Iraqi branch no longer takes orders. Its orders were moved into the Kurdistani table
 * and orders_iraqi is empty, so serving the Iraqi app here would let someone fill in a form
 * that the database is going to refuse.
 *
 * The route is kept rather than deleted so an old bookmark or a switcher left open in
 * another tab lands on an explanation instead of a blank page. To reopen the branch, render
 * IraqiApp here again — the app itself is untouched — and put the Iraq entry back in
 * SystemSwitcher.
 */
export const Route = createFileRoute("/iraqi")({
  component: IraqiClosed,
});

function IraqiClosed() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-black tracking-tight">The Iraqi branch is closed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every order goes to Kurdistani now. The orders that were here have been moved across, so
          nothing has been lost.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
        >
          Go to Kurdistani
        </Link>
      </div>
    </div>
  );
}
