import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Users, ShoppingCart, Package, Truck, Search,
  Menu, X, Calculator, ChevronLeft, Camera, LogOut, Bell, MessageCircle, Plus, Wallet
} from 'lucide-react';
import { YEARS_CONFIG } from '@/types';

import NotificationsDropdown from './NotificationsDropdown';
import { SystemKey, SystemSwitcher } from './SystemSwitcher';
import ThemeColorPicker from './ThemeColorPicker';
import { recordPresence } from '@/lib/teamActivity';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  isSearchingAll?: boolean;
  onSearchAll?: () => void;
  onCameraSearch?: () => void;
  viewingMonth?: string;
  setViewingMonth?: (m: string) => void;
  activeYear?: string;
  setActiveYear?: (y: string) => void;
  availableMonths?: string[];
  role: string;
  onLogout: () => void;
  onNotificationClick?: (orderId: string, sheetName: string) => void;
  currentSystem?: SystemKey;
  onSystemChange?: (system: SystemKey) => void;
}

const ALL_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'calculator', label: 'Calculator', icon: Calculator },
  { id: 'expenses', label: 'Masrufat', icon: Wallet },
  { id: 'batches', label: 'Boxes', icon: Package },
  { id: 'new-order', label: 'New Order', icon: Plus },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'team', label: 'Team', icon: Users },
];

const AppLayout: React.FC<AppLayoutProps> = ({
  children, activeTab, setActiveTab, searchQuery = '', setSearchQuery, isSearchingAll, onSearchAll, onCameraSearch,
  viewingMonth, setViewingMonth, activeYear, setActiveYear, availableMonths = [], role, onLogout, onNotificationClick,
  currentSystem = 'kurdistani', onSystemChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    try {
      const lastReadMap = JSON.parse(localStorage.getItem('messages_last_read') || '{}');
      const allLastReads = Object.values(lastReadMap) as number[];
      // Minimal fetch to check topics if any topic.lastMessageAt > lastRead[topic.id]
      // Because we don't have direct access to db here easily without importing it, let's just import fb:
      let isMounted = true;
      import('@/lib/firebase').then(({ db }) => {
        import('firebase/firestore').then(({ collection, query, onSnapshot }) => {
          const q = query(collection(db, 'topics'));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!isMounted) return;
            let unread = false;
            const updatedLastReads = JSON.parse(localStorage.getItem('messages_last_read') || '{}');
            snapshot.docs.forEach(doc => {
              const data = doc.data();
              if (data.lastMessageAt && data.lastMessageAt.toMillis && data.lastMessageAt.toMillis() > (updatedLastReads[doc.id] || 0)) {
                
                // if it's a DM, make sure it belongs to us
                if (doc.id.startsWith('dm_')) {
                   const currentUser = localStorage.getItem('auth_username') || role;
                   if (!doc.id.includes(currentUser.toLowerCase())) return;
                }
                
                unread = true;
              }
            });
            setHasUnreadMessages(unread && activeTab !== 'messages');
          });
          return () => unsubscribe();
        });
      });
      return () => { isMounted = false; };
    } catch { /* ignore */ }
  }, [activeTab, role]);

  useEffect(() => {
    let interval: any;
    const currentUser = localStorage.getItem('auth_username') || role;
    const pingPresence = () => recordPresence('kurdistani', currentUser, role, true).catch(() => {});
    const setOffline = () => recordPresence('kurdistani', currentUser, role, false).catch(() => {});

    pingPresence();
    interval = setInterval(pingPresence, 30000);
    window.addEventListener('beforeunload', setOffline);
    
    return () => { 
      if (interval) clearInterval(interval);
      window.removeEventListener('beforeunload', setOffline);
      setOffline();
    };
  }, [role]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (setSearchQuery && localSearch !== searchQuery) {
        setSearchQuery(localSearch);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [localSearch, setSearchQuery, searchQuery]);

  const showBack = activeTab === 'new-order';

  const menuItems = ALL_MENU_ITEMS.filter(item => {
    if (role === 'owner') return true;
    if (role === 'admin') {
      return item.id !== 'dashboard';
    }
    if (role === 'moderator') {
      return item.id === 'calculator' || item.id === 'orders' || item.id === 'new-order' || item.id === 'messages' || item.id === 'team';
    }
    if (role === 'delivery') {
      return item.id === 'calculator' || item.id === 'delivery' || item.id === 'messages' || item.id === 'team';
    }
    return item.id === 'calculator';
  });

  return (
    <div className="h-[100dvh] w-full bg-background text-foreground font-sans flex overflow-hidden transition-colors duration-300">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[82vw] max-w-72 lg:w-64 bg-card border-r border-border transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center glow-primary">
                <span className="font-bold text-primary-foreground text-sm">S</span>
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight">Shein <span className="text-primary">Kurd</span></h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">{role} Hub</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                    ${active
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent'
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.id === 'messages' && hasUnreadMessages && (
                    <div className="ml-2 w-2 h-2 rounded-full bg-red-500 glow-red animate-pulse" />
                  )}
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary glow-primary" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-3">
            <ThemeColorPicker />
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all font-medium">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 shrink-0">
          <div className="px-2 sm:px-4 py-1.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden relative p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
                <Menu size={20} />
                {hasUnreadMessages && <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 glow-red ring-2 ring-card" />}
              </button>
              {showBack ? (
                <button onClick={() => setActiveTab('orders')} className="hidden md:flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <h2 className="hidden md:block text-lg font-bold capitalize whitespace-nowrap">{activeTab === 'new-order' ? 'New Order' : activeTab}</h2>
              )}
            </div>

            <div className="flex-1 min-w-0 w-full max-w-none sm:max-w-2xl">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={localSearch}
                  onChange={e => {
                    setLocalSearch(e.target.value);
                    if (e.target.value && activeTab !== 'orders') setActiveTab('orders');
                  }}
                  className="w-full bg-secondary border border-border text-foreground text-base sm:text-sm rounded-lg pl-9 pr-8 py-1.5 sm:py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
                {localSearch && (
                  <button onClick={() => { setLocalSearch(''); setSearchQuery?.(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              {isSearchingAll && (
                <div className="hidden sm:flex flex items-center gap-2 text-xs text-primary font-medium mr-2">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              )}
              <NotificationsDropdown role={role} onNotificationClick={onNotificationClick} />
              {role === 'owner' && <SystemSwitcher role={role} current={currentSystem} onChange={onSystemChange} />}
              <button onClick={onCameraSearch} className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors" title="Image Search">
                <Camera size={18} />
              </button>
              {role === 'owner' && (
                <button onClick={onSearchAll} className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors" title="Price Calc">
                  <Calculator size={18} />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className={`flex-1 min-h-0 ${activeTab === 'messages' ? 'overflow-hidden p-0' : 'overflow-y-auto p-2 sm:p-4 lg:p-6 custom-scrollbar'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
