import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, lazy, Suspense } from "react";

const Index = lazy(() => import("@/pages/Index"));

function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={<div className="min-h-screen professional-surface" />}>
      <Index />
    </Suspense>
  );
}

export const Route = createFileRoute("/")({
  component: ClientApp,
});
