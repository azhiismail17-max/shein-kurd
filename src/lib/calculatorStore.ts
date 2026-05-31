// Global calculator state management for persistent use across both systems

export interface CalculatorState {
  manualRetail: string;
  manualPromo: string;
  manualItems: string;
  autoImage: string | null;
  autoRetail: number | null;
  autoPromo: number | null;
  autoItems: number | null;
  activeTab: 'manual' | 'auto';
}

const STORAGE_KEY = 'shein_calculator_state';

export const calculatorStore = {
  getState: (): CalculatorState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : getDefaultState();
    } catch {
      return getDefaultState();
    }
  },

  setState: (state: CalculatorState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Dispatch event so all tabs/systems can listen
      window.dispatchEvent(new CustomEvent('calculator-state-changed', { detail: state }));
    } catch {
      console.error('Failed to save calculator state');
    }
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('calculator-state-changed', { detail: getDefaultState() }));
  }
};

function getDefaultState(): CalculatorState {
  return {
    manualRetail: '',
    manualPromo: '',
    manualItems: '',
    autoImage: null,
    autoRetail: null,
    autoPromo: null,
    autoItems: null,
    activeTab: 'auto'
  };
}
