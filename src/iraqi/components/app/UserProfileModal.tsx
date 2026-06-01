import React, { useState, useEffect } from 'react';
import { X, User, MessageCircle, Activity, Package, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/iraqi/types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserStatsForProfile, parseOrderPrice, SOURCE_STYLES } from '@/lib/combinedProfile';

interface UserProfileModalProps {
  userTarget: { username: string; role: string };
  onClose: () => void;
  onMessage: () => void;
  allOrders: Order[];
  canDelete?: boolean;
  canViewOrders?: boolean;
  profileMode?: 'all' | 'kurdistani' | 'iraqi';
  onOrderClick?: (order: Order) => void;
}

export default function UserProfileModal({ userTarget, onClose, onMessage, allOrders, canDelete, canViewOrders = true, profileMode = 'iraqi', onOrderClick }: UserProfileModalProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalValue: 0,
    isActiveToday: false,
    isOnline: false,
    recentOrders: [] as ReturnType<typeof getUserStatsForProfile>['recentOrders'],
    bySource: [] as ReturnType<typeof getUserStatsForProfile>['bySource'],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: any = () => {};
    try {
      unsubscribe = onSnapshot(collection(db, 'user_stats'), (snapshot) => {
        const rawStats: Record<string, any> = {};
        snapshot.forEach((docSnap) => {
          rawStats[docSnap.id] = docSnap.data();
        });
        setStats(getUserStatsForProfile(rawStats, userTarget.username, profileMode));
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } catch(err) {
      setLoading(false);
    }
    return () => unsubscribe();
  }, [userTarget.username, profileMode]);

  const { isActiveToday, isOnline, bySource } = stats;
  const recentOrders = canViewOrders
    ? stats.recentOrders.filter((order) => allOrders.some(o => String(o.id) === String(order.id) && o.sheet_name === order.sheet))
    : [];
  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
  const totalOrders = recentOrders.length;
  const todayOrders = recentOrders.filter((order) => order.createdAt && new Date(order.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' }) === todayKey).length;
  const totalValue = recentOrders.reduce((sum, order) => sum + parseOrderPrice(order.price), 0);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl border overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        
        <div className="h-24 bg-gradient-to-r from-primary/80 to-primary flex items-center justify-between px-4">
          <div />
          <button onClick={onClose} className="p-1.5 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 rounded-full transition-colors self-start mt-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 pb-6 relative overflow-y-auto">
          <div className="w-20 h-20 bg-background rounded-full p-1.5 absolute -top-10 left-6">
            <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="pt-12">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {userTarget.username}
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-wider">
                {userTarget.role}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-600 dark:text-green-500 font-medium">Online Now</span>
                </>
              ) : isActiveToday ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-blue-600 dark:text-blue-500 font-medium">Active Today</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  <span>Inactive Today</span>
                </>
              )}
            </p>
          </div>
          
          {canViewOrders && <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                <Package className="h-4 w-4" /> Total Orders
              </div>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                <Activity className="h-4 w-4" /> Today
              </div>
              <div className="text-2xl font-bold">{todayOrders}</div>
            </div>

            <div className="bg-muted/50 p-3 rounded-xl border border-border/50 col-span-2">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                <Banknote className="h-4 w-4" /> {profileMode === 'all' ? 'Combined Value' : 'Total Value'}
              </div>
              <div className="text-2xl font-bold">{totalValue.toLocaleString()} IQD</div>
            </div>
          </div>}

          {canViewOrders && profileMode === 'all' && <div className="grid grid-cols-2 gap-3 mt-3">
            {bySource.map((entry) => (
              <div key={entry.source} className={`rounded-xl border p-3 ${SOURCE_STYLES[entry.source].badge}`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <span className={`h-2.5 w-2.5 rounded-full ${SOURCE_STYLES[entry.source].dot}`} />
                  {SOURCE_STYLES[entry.source].label}
                </div>
                <div className="mt-2 text-sm font-semibold">{entry.totalOrders} orders</div>
              </div>
            ))}
          </div>}

          {canViewOrders && <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" /> {profileMode === 'all' ? 'Combined Orders' : 'Orders'}
              </h4>
              <span className="text-xs text-muted-foreground">{recentOrders.length} tracked</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {loading ? (
                <div className="text-sm text-muted-foreground py-4">Loading profile...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">No tracked orders yet.</div>
              ) : (
                recentOrders.map((order) => (
                  <button
                    key={`${order.source}-${order.sheet}-${order.id}-${order.createdAt}`}
                    type="button"
                    onClick={() => {
                      const match = allOrders.find(o => String(o.id) === String(order.id) && o.sheet_name === order.sheet);
                      if (match) {
                        onClose();
                        onOrderClick?.(match);
                      }
                    }}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-accent ${profileMode === 'all' ? `border-l-4 ${SOURCE_STYLES[order.source].row}` : 'bg-card'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">@{order.insta}</div>
                        <div className="text-xs text-muted-foreground truncate">#{order.id} &middot; {order.sheet}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold">{parseOrderPrice(order.price).toLocaleString()} IQD</div>
                        {profileMode === 'all' && (
                          <div className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${SOURCE_STYLES[order.source].badge}`}>
                            {SOURCE_STYLES[order.source].label}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>}
          
          <div className="mt-6 flex space-x-3">
            <Button className="flex-1 rounded-xl" onClick={onMessage}>
              <MessageCircle className="h-4 w-4 mr-2" /> Message
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
