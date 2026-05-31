import React, { useState, useEffect } from 'react';
import { Users, User, Shield, Search, Package, Activity } from 'lucide-react';
import { fetchWithRetry } from '@/iraqi/lib/fetchWithRetry';
import { Order } from '@/iraqi/types';
import { normalizeTeamUsername } from '@/lib/teamActivity';
import { fetchCombinedAuthUsers, getUserStatsForProfile, SOURCE_STYLES } from '@/lib/combinedProfile';
import UserProfileModal from './UserProfileModal';

interface AuthUser {
  username: string;
  role: string;
}

type ProfileMode = 'all' | 'kurdistani' | 'iraqi';

export default function TeamView({ role, allOrders = [], currentUser, profileMode = 'iraqi', onOrderClick }: { role: string, allOrders?: Order[], currentUser: string, profileMode?: ProfileMode, onOrderClick?: (order: Order) => void }) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [profileTarget, setProfileTarget] = useState<{username: string, role: string} | null>(null);
  const [stats, setStats] = useState<Record<string, any>>({});
  const canViewLiveStats = role === 'owner' || role === 'admin';

  useEffect(() => {
    if (!canViewLiveStats) return;
    let unsubscribe: () => void = () => {};
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
      import('@/lib/firebase').then(({ db }) => {
        unsubscribe = onSnapshot(collection(db, 'user_stats'), (snapshot) => {
          const newStats: Record<string, any> = {};
          snapshot.forEach(doc => {
            const data = doc.data();
            newStats[doc.id] = data;
            if (data.username && data.profile) newStats[`${data.profile}_${normalizeTeamUsername(data.username)}`] = data;
          });
          setStats(newStats);
        }, (err) => {
          console.error("Failed to fetch user stats", err);
        });
      });
    });
    return () => unsubscribe();
  }, [canViewLiveStats]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers(await fetchCombinedAuthUsers(fetchWithRetry, profileMode));
      } catch (e) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [profileMode]);

  const filtered = users.filter(u => {
    return String(u?.username || '').toLowerCase().includes(search.toLowerCase()) || String(u?.role || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Team Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">View profiles, access, and send messages.</p>
        </div>
        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <input 
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="w-full pl-9 pr-4 py-2 bg-card border rounded-lg text-sm"
             placeholder="Search team..."
           />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-card animate-pulse rounded-xl border" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u, i) => {
            const profileStats = getUserStatsForProfile(stats, u.username, profileMode);
            const visibleOrders = profileStats.recentOrders.filter((order: any) => allOrders.some(o => String(o.id) === String(order.id) && o.sheet_name === order.sheet));
            const recentOrders = visibleOrders.slice(0, 3);
            const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
            const visibleTodayOrders = visibleOrders.filter((order: any) => order.createdAt && new Date(order.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' }) === todayKey).length;
            
            return (
              <div key={i} onClick={() => setProfileTarget(u)} className="bg-card hover:bg-accent/50 transition-colors border rounded-xl p-4 cursor-pointer flex flex-col gap-3 group relative shadow-sm">
                {canViewLiveStats && profileStats.isOnline && (
                  <div title="Online Now" className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-red-900 animate-pulse shadow-sm" />
                )}
                
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                     <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                       <h3 className="font-semibold text-lg truncate">{u.username}</h3>
                       {u.username === currentUser && <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">You</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                       <Shield className="h-3 w-3" />
                       <span className="uppercase">{u.role}</span>
                    </div>
                  </div>
                </div>
                
                {canViewLiveStats && (
                  <>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1 mb-1">
                          <Activity className="h-3 w-3" /> Today
                        </span>
                        <span className="font-bold text-lg leading-none">{visibleTodayOrders}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1 mb-1">
                          <Package className="h-3 w-3" /> Total
                        </span>
                        <span className="font-bold text-lg leading-none">{visibleOrders.length}</span>
                      </div>
                    </div>
                    {recentOrders.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t">
                        {recentOrders.map((order: any) => (
                          <button
                            key={`${order.id}-${order.createdAt}`}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              const match = allOrders.find(o => String(o.id) === String(order.id) && o.sheet_name === order.sheet);
                              if (match) onOrderClick?.(match);
                            }}
                            className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-0.5 text-left text-xs hover:bg-accent"
                          >
                            <span className="truncate text-muted-foreground">@{order.insta}</span>
                            <span className={`shrink-0 rounded-full border px-1.5 py-0.5 font-semibold ${profileMode === 'all' ? SOURCE_STYLES[order.source].badge : 'bg-muted text-muted-foreground border-border'}`}>{order.sheet}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {profileTarget && (
        <UserProfileModal 
          userTarget={profileTarget} 
          allOrders={allOrders}
          profileMode={profileMode}
          onOrderClick={onOrderClick}
          onClose={() => setProfileTarget(null)} 
          onMessage={() => {
            const dmTopic = `dm_${[currentUser.toLowerCase(), profileTarget.username.toLowerCase()].sort().join('_')}`;
            window.location.hash = `messages:${dmTopic}`;
          }}
        />
      )}
    </div>
  );
}
