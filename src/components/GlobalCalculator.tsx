import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const GlobalCalculatorPanel = React.lazy(() => import('@/components/GlobalCalculatorPanel'));

export function GlobalCalculatorButton({ onOpenPriceCalc }: { onOpenPriceCalc?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    if (onOpenPriceCalc) {
      onOpenPriceCalc();
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        title="Price Calc"
      >
        <Calculator size={24} />
      </button>

      {isOpen && (
        <React.Suspense fallback={null}>
          <GlobalCalculatorPanel onClose={() => setIsOpen(false)} />
        </React.Suspense>
      )}
    </>
  );
}
