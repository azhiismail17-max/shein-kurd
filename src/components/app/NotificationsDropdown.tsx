import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ShieldAlert, X } from 'lucide-react';
import { AppNotification, fetchNotifications, markNotificationRead, markNotificationFixed, sendNotification } from '@/lib/notifications';
import { fetchWithRetry } from '@/lib/fetchWithRetry';
import { SCRIPT_URL } from '@/types';
import { toast } from 'sonner';
import { ensureBrowserNotificationPermission, showBrowserNotification } from '@/lib/browserNotifications';

interface NotificationsDropdownProps {
  role?: string | null;
  onNotificationClick?: (orderId: string, sheetName: string) => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ role, onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [customMsg, setCustomMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Mention logic state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [authUsers, setAuthUsers] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  // Get the base role prefix to match 'moderator 1' -> 'moderator'
  const rolePrefix = role ? role.split(' ')[0] : '';

  useEffect(() => {
    ensureBrowserNotificationPermission();
  }, []);

  useEffect(() => {
    // Fetch auth users from backend
    const fetchUsers = async () => {
      try {
        const res = await fetchWithRetry(`${SCRIPT_URL}?action=get_auth_users`);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn("Invalid JSON from Apps Script:", text.substring(0, 50));
          data = { status: 'error' };
        }
        if (data.status === 'success' && data.users) {
          const users = data.users
            .map((u: string | { username?: string }) => typeof u === 'string' ? u : String(u.username || ''))
            .map((u: string) => u.trim())
            .filter(Boolean);
          setAuthUsers(users);
        } else {
          setAuthUsers([]);
        }
      } catch (e) {
        setAuthUsers([]);
      }
    };
    if (role) fetchUsers();
  }, [role]);

  useEffect(() => {
    if (!role) return;
    const fetchNots = async () => {
      const data = await fetchNotifications();
      const currentUsername = localStorage.getItem('auth_username') || '';
      // Filter notifications targeting this role, role prefix, or exact username
      // Also, exclude if the user themselves sent the notification
      const filtered = data.filter(n => {
        if (n.senderUsername === currentUsername || n.senderRole === role) {
          // If senderUsername matches precisely, hide it. 
          // If we only have senderRole (legacy), hide it if it matches our role.
          if (n.senderUsername === currentUsername) return false;
          if (!n.senderUsername && n.senderRole === role) return false;
        }
        return n.targetRoles.includes(role) || 
               n.targetRoles.includes(rolePrefix) || 
               (currentUsername && n.targetRoles.includes(currentUsername)) ||
               n.targetRoles.includes('all');
      });
      
      setNotifications(prev => {
        // Compare new IDs with prev IDs to triggers toasts
        const prevIds = new Set(prev.map(p => p.id));
        const newNots = filtered.filter(f => !prevIds.has(f.id));
        
        // Only toast if this is not the first load (prev > 0) OR if we want to toast on load (we generally don't, but let's do it if the alert was just generated)
        // Let's filter newly generated alerts within the last 15 seconds
        const now = Date.now();
        newNots.forEach(n => {
           const isRecent = (now - new Date(n.timestamp).getTime()) < 15000;
           // If it's a recent notification and we aren't the sender
           const isSender = n.senderUsername === currentUsername || (!n.senderUsername && n.senderRole === role);
           if (isRecent && !isSender) {
             showBrowserNotification(n.isWarning ? 'Warning Alert' : 'New Notification', {
               body: n.message,
               tag: `notification-${n.id}`,
             });
             if (n.isWarning) {
               toast.error('🚨 Warning Alert', { description: n.message, duration: 8000 });
             } else {
               toast('🔔 New Notification', { description: n.message });
             }
           }
        });
        return filtered;
      });
    };
    fetchNots();
    const interval = setInterval(fetchNots, 1000);
    return () => clearInterval(interval);
  }, [role, rolePrefix]);

  const currentReadKey = localStorage.getItem('auth_username') || role || '';
  const isNotificationRead = (n: AppNotification) => n.readBy.includes(role || '') || (!!currentReadKey && n.readBy.includes(currentReadKey));
  const unreadCount = notifications.filter(n => !isNotificationRead(n)).length;

  const handleRead = (id: string) => {
    if (!role) return;
    const readKey = currentReadKey || role;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readBy: Array.from(new Set([...n.readBy, role, readKey].filter(Boolean))) } : n));
    markNotificationRead(id, readKey);
  };

  const handleFix = (id: string) => {
    if (!role) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, fixedBy: role } : n));
    markNotificationFixed(id, role);
  };

  const handleSendCustom = async () => {
    if (!customMsg.trim() || !role) return;
    setIsSending(true);
    // Explicit target if the message starts with @ followed by a specific user name
    let finalTarget = undefined;
    
    // Check if message contains explicit mention anywhere
    const mentionMatch = customMsg.match(/@([\w\s]+?)(?=\s|$)/);
    if (mentionMatch) {
       const possibleUser = mentionMatch[1].trim();
       if (authUsers.some(u => u.toLowerCase() === possibleUser.toLowerCase())) {
          const matchedUser = authUsers.find(u => u.toLowerCase() === possibleUser.toLowerCase());
          finalTarget = matchedUser;
       }
    }

    // Fallback to selected target if we picked from dropdown and it's in the message
    if (!finalTarget && selectedTarget && customMsg.includes(`@${selectedTarget}`)) {
      finalTarget = selectedTarget;
    }
    
    await sendNotification('custom', customMsg, role, undefined, false, finalTarget);
    setCustomMsg('');
    setSelectedTarget(null);
    setShowMentions(false);
    setIsSending(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomMsg(val);
    
    if (val.includes('@')) {
      const lastAt = val.lastIndexOf('@');
      const textAfterAt = val.substring(lastAt + 1).toLowerCase();
      // If we are actively typing a mention
      if (!val.includes(' ', lastAt)) { // No space after @ yet
        setShowMentions(true);
        setMentionFilter(textAfterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
      setSelectedTarget(null);
    }
  };

  const selectMention = (user: string) => {
    const lastAt = customMsg.lastIndexOf('@');
    const newMsg = customMsg.substring(0, lastAt) + `@${user} `;
    setCustomMsg(newMsg);
    setSelectedTarget(user);
    setShowMentions(false);
  };

  if (!role) return null;

  const filteredUsers = authUsers.filter(u => u.toLowerCase().includes(mentionFilter));

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors relative" title="Notifications">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-sm animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 p-0 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                <Bell size={18} className="text-primary" />
                Notifications
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-md transition-colors sm:hidden"><X size={16} /></button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto w-full p-2">
              {notifications.length === 0 ? (
                <div className="py-20 text-center text-sm text-muted-foreground">
                  <Bell size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-base text-foreground mb-1">All caught up</p>
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => {
                    const isRead = isNotificationRead(n);
                    return (
                      <div key={n.id} className={`p-4 rounded-xl border transition-colors ${!isRead ? 'bg-red-50 border-red-300 shadow-sm relative overflow-hidden dark:bg-red-950/20 dark:border-red-900/60' : 'bg-transparent border-transparent'}`}>
                        {!isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                        <div className="flex gap-4">
                          <div className={`mt-1 shrink-0 ${!isRead || n.isWarning ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                            {n.isWarning ? <ShieldAlert size={20} /> : <Bell size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-base ${!isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              {n.message}
                            </p>
                            
                            {n.orderId && n.orderSheet && (
                              <button
                                onClick={() => {
                                  if (onNotificationClick) {
                                    onNotificationClick(String(n.orderId!), n.orderSheet!);
                                    setIsOpen(false);
                                  }
                                }}
                                className="mt-2 text-primary font-medium hover:underline text-sm block"
                              >
                                View Order
                              </button>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground font-mono">
                              <span>{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className="opacity-50">•</span>
                              <span className="capitalize font-semibold text-primary/70">{n.senderRole}</span>
                              {n.targetRoles.length === 1 && <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm">to @{n.targetRoles[0]}</span>}
                            </div>
                            
                            {!isRead && (
                              <button onClick={() => handleRead(n.id)} className="text-xs text-red-600 font-bold hover:underline mt-3 inline-block">
                                Mark as Read
                              </button>
                            )}

                            {n.isWarning && !n.fixedBy && (rolePrefix === 'admin' || rolePrefix === 'moderator') && (
                              <button onClick={() => handleFix(n.id)} className="w-full mt-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                                <Check size={16} /> Acknowledge / Fixed
                              </button>
                            )}

                            {n.isWarning && n.fixedBy && (
                              <div className="mt-3 px-3 py-1.5 bg-green-500/10 rounded-lg text-xs font-bold text-green-600 inline-flex items-center gap-1.5">
                                <Check size={14} /> Fixed by {n.fixedBy}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {rolePrefix && (
              <div className="p-4 border-t border-border bg-card relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                {showMentions && filteredUsers.length > 0 && (
                  <div className="absolute bottom-full left-4 mr-4 mb-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-48 w-64 animate-in slide-in-from-bottom-2">
                    <div className="px-3 py-1.5 bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border">Select User</div>
                    {filteredUsers.map(u => (
                      <button key={u} onClick={() => selectMention(u)} className="w-full text-left px-4 py-2.5 hover:bg-secondary text-sm font-medium transition-colors border-b border-border/50 last:border-0">
                        @{u}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    placeholder="Type @ to notify specific user..."
                    value={customMsg}
                    onChange={handleInputChange}
                    className="flex-1 bg-secondary/50 border border-border text-foreground text-sm rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                  />
                  <button 
                    disabled={isSending || !customMsg.trim()}
                    onClick={handleSendCustom}
                    className="px-6 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 active:scale-95 transition-all shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsDropdown;
