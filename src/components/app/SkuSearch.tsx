import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ScanBarcode, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Order } from '@/types';
import { fetchWithRetry } from '@/lib/fetchWithRetry';

interface SkuSearchProps {
  orders: Order[];
  onFound: (order: Order) => void;
}

const SKU_API_URL = 'https://script.google.com/macros/s/AKfycbxUmtYopoO9HznjbfiAP8heZTZlk0RvxtuInPzlEuneNXs4RGAlDvY_FjUAqK8yyT8/exec';

export const SkuSearch: React.FC<SkuSearchProps> = ({ orders, onFound }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [skuQuery, setSkuQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState<any[]>([]); // store API match

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!skuQuery.trim() || !isOpen) {
      setApiResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      const q = skuQuery.trim().toLowerCase();
      
      setIsSearching(true);
      setApiResults([]);
      try {
        const url = `${SKU_API_URL}?query=${encodeURIComponent(q)}`;
        const res = await fetchWithRetry(url, { method: 'GET' });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn("Invalid JSON:", text.substring(0, 50));
          data = null;
        }
        
        if (data && data.status === 'success' && data.results && data.results.length > 0) {
          setApiResults(data.results);
        }
      } catch (err) {
        console.error("SKU Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 50);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [skuQuery, isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg transition-all border bg-transparent border-transparent hover:bg-secondary text-muted-foreground"
        title="Fast SKU Search"
      >
        <ScanBarcode size={16} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              <ScanBarcode size={18} className="text-primary" />
              SKU Search
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="relative flex items-center mb-4">
            <Search size={16} className="absolute left-3 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search SKU or Link..."
              value={skuQuery}
              onChange={e => setSkuQuery(e.target.value)}
              className="w-full bg-secondary border border-border text-foreground rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-primary/50 transition-colors"
              autoComplete="off"
            />
            <div className="absolute right-3 flex items-center">
              {isSearching ? (
                 <Loader2 size={16} className="animate-spin text-primary" />
              ) : skuQuery ? (
                <button 
                  onClick={() => {
                    setSkuQuery('');
                    setApiResults([]);
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 hover:bg-muted text-muted-foreground rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-3">
          {apiResults.length > 0 && apiResults.map((result, idx) => (
            <div key={idx} className="p-4 bg-secondary/50 border border-border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-base">{result.name || 'Unknown Customer'}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{result.quantity || result.pcs || 0} pieces</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-600 px-2 py-1 rounded font-bold uppercase tracking-wider">
                    <CheckCircle2 size={12} />
                    Match Found
                  </span>
                </div>
              </div>
              
              {result.link && (
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-3 flex justify-center items-center gap-1.5 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold rounded-lg transition-colors"
                >
                  <ExternalLink size={16} /> View Product
                </a>
              )}
            </div>
          ))}
          
          {apiResults.length === 0 && !isSearching && skuQuery.trim() && (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">
              No matching SKU or Link found.
            </div>
          )}
          {!skuQuery.trim() && (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground opacity-70">
              Type the SKU or Link to search the external database.
            </div>
          )}
          </div>
          </div>
        </>
      )}
    </div>
  );
};



