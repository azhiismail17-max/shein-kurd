import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const GlobalCalculatorPanel = React.lazy(() => import('@/components/GlobalCalculatorPanel'));

export function GlobalCalculatorButton({ variant = 'floating' }: { variant?: 'floating' | 'inline' }) {
  const [isOpen, setIsOpen] = useState(false);
  const isFloating = variant === 'floating';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={isFloating
          ? "fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          : "p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
        }
        title="Global Calculator"
      >
        <Calculator size={isFloating ? 24 : 18} />
      </button>

      {isOpen && (
        <React.Suspense fallback={null}>
          <GlobalCalculatorPanel onClose={() => setIsOpen(false)} />
        </React.Suspense>
      )}
    </>
  );
}
