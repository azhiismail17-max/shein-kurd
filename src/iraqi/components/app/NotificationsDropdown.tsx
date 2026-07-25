import React, { useState, useEffect } from "react";
import { Check, ShieldAlert, X } from "lucide-react";
import {
  AppNotification,
  fetchNotifications,
  markNotificationRead,
  markNotificationFixed,
} from "@/iraqi/lib/notifications";
import { toast } from "sonner";
import { showBrowserNotification } from "@/lib/browserNotifications";
import { canRoleUsePush, enableWarningPushNotifications } from "@/lib/pushNotifications";

interface NotificationsDropdownProps {
  role?: string | null;
  onNotificationClick?: (orderId: string, sheetName: string) => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  role,
  onNotificationClick,
}) => {
  const systemLabel = "Iraqi";
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushStatus, setPushStatus] = useState<"idle" | "saving" | "enabled" | "unsupported">(
    localStorage.getItem("phone_push_v3_enabled") === "true" ? "enabled" : "idle",
  );

  // Get the base role prefix to match 'moderator 1' -> 'moderator'
  const rolePrefix = role ? role.split(" ")[0] : "";

  useEffect(() => {
    const handleEnabled = () => setPushStatus("enabled");
    window.addEventListener("phone-push:enabled", handleEnabled);
    return () => window.removeEventListener("phone-push:enabled", handleEnabled);
  }, []);

  const currentReadKey = localStorage.getItem("iraqi_auth_username") || role || "";
  const isNotificationRead = (n: AppNotification) =>
    n.readBy.includes(role || "") || (!!currentReadKey && n.readBy.includes(currentReadKey));

  useEffect(() => {
    if (!role) return;
    const fetchNots = async () => {
      const data = await fetchNotifications();
      const currentUsername = localStorage.getItem("iraqi_auth_username") || "";
      // Filter notifications targeting this role, role prefix, or exact username
      // Also, exclude if the user themselves sent the notification
      const filtered = data.filter((n) => {
        if (!n.isWarning && n.type !== "warning" && n.type !== "link") return false;
        if (n.senderUsername === currentUsername || (!n.isWarning && n.senderRole === role)) {
          // Hide only the exact sender. For warning alerts, keep same-role users included.
          if (n.senderUsername === currentUsername) return false;
          if (!n.senderUsername && n.senderRole === role) return false;
        }
        return (
          n.targetRoles.includes(role) ||
          n.targetRoles.includes(rolePrefix) ||
          (currentUsername && n.targetRoles.includes(currentUsername)) ||
          n.targetRoles.includes("all")
        );
      });

      setNotifications((prev) => {
        // Compare new IDs with prev IDs to triggers toasts
        const prevIds = new Set(prev.map((p) => p.id));
        const newNots = filtered.filter((f) => !prevIds.has(f.id));

        // Only toast if this is not the first load (prev > 0) OR if we want to toast on load (we generally don't, but let's do it if the alert was just generated)
        // Let's filter newly generated alerts within the last 15 seconds
        const now = Date.now();
        // A "link" notification means a box's Total Link/pictures changed on
        // some other device - tell any open BatchesView to refresh its box
        // links so the box icon turns green there too, without the viewer
        // having to reload the page.
        if (newNots.some((n) => n.type === "link")) {
          window.dispatchEvent(new CustomEvent("box-link:refresh"));
        }
        newNots.forEach((n) => {
          const isRecent = now - new Date(n.timestamp).getTime() < 15000;
          // If it's a recent notification and we aren't the sender
          const isSender =
            n.senderUsername === currentUsername || (!n.senderUsername && n.senderRole === role);
          if (isRecent && !isSender) {
            showBrowserNotification(
              n.isWarning ? `${systemLabel} Warning Alert` : `${systemLabel} Notification`,
              {
                body: n.message,
                tag: `iraqi-notification-${n.id}`,
              },
            );
            if (n.isWarning) {
              toast.error(`${systemLabel} Warning Alert`, {
                description: n.message,
                duration: 8000,
              });
            } else {
              toast(`${systemLabel} Notification`, { description: n.message });
            }
          }
        });
        return filtered;
      });
    };
    fetchNots();
    window.addEventListener("notifications:refresh", fetchNots);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchNots();
    }, 3000);
    return () => {
      window.removeEventListener("notifications:refresh", fetchNots);
      clearInterval(interval);
    };
  }, [role, rolePrefix]);

  const unreadCount = notifications.filter((n) => !isNotificationRead(n)).length;
  const canEnablePush = canRoleUsePush(role);

  const handleEnablePush = async () => {
    if (!role || !canEnablePush) return;
    setPushStatus("saving");
    const result = await enableWarningPushNotifications({
      role,
      username: localStorage.getItem("iraqi_auth_username") || role,
      system: "iraqi",
    });

    if (result.ok) {
      setPushStatus("enabled");
      toast.success("Phone push enabled for both systems");
    } else {
      setPushStatus("unsupported");
      toast.error("Could not enable push notifications", { description: result.reason });
    }
  };

  const handleRead = (id: string) => {
    if (!role) return;
    const readKey = currentReadKey || role;
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, readBy: Array.from(new Set([...n.readBy, role, readKey].filter(Boolean))) }
          : n,
      ),
    );
    markNotificationRead(id, readKey);
  };

  const handleFix = (id: string) => {
    if (!role) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, fixedBy: role } : n)));
    markNotificationFixed(id, role);
  };

  if (!role) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors relative"
        title="Notifications"
      >
        <ShieldAlert
          size={18}
          className={unreadCount > 0 ? "text-red-500 animate-pulse" : "text-muted-foreground"}
        />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-sm animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 p-0 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                <ShieldAlert size={18} className="text-red-500" />
                Iraqi Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-md transition-colors sm:hidden"
              >
                <X size={16} />
              </button>
            </div>

            {canEnablePush && (
              <div className="border-b border-border p-3 bg-card">
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={pushStatus === "saving" || pushStatus === "enabled"}
                  className="w-full rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-500/15 disabled:cursor-default disabled:opacity-70"
                >
                  {pushStatus === "enabled"
                    ? "Phone push notifications enabled"
                    : pushStatus === "saving"
                      ? "Enabling warning push..."
                      : "Enable phone push notifications"}
                </button>
                {pushStatus === "unsupported" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    On iPhone, add this site to Home Screen first, then open it from the new app
                    icon.
                  </p>
                )}
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto w-full p-2">
              {notifications.length === 0 ? (
                <div className="py-20 text-center text-sm text-muted-foreground">
                  <ShieldAlert size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-base text-foreground mb-1">All caught up</p>
                  No warnings yet
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => {
                    const isRead = isNotificationRead(n);
                    return (
                      <div
                        key={n.id}
                        className={`p-4 rounded-xl border transition-colors ${!isRead ? "bg-red-50 border-red-300 shadow-sm relative overflow-hidden dark:bg-red-950/20 dark:border-red-900/60" : "bg-transparent border-transparent"}`}
                      >
                        {!isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                        )}
                        <div className="flex gap-4">
                          <div
                            className={`mt-1 shrink-0 ${!isRead || n.isWarning ? "text-red-500 animate-pulse" : "text-primary"}`}
                          >
                            <ShieldAlert size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-base ${!isRead ? "font-medium text-foreground" : "text-muted-foreground"}`}
                            >
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
                              <span>
                                {new Date(n.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="opacity-50">•</span>
                              <span className="capitalize font-semibold text-primary/70">
                                {n.senderRole}
                              </span>
                              {n.targetRoles.length === 1 && (
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm">
                                  to @{n.targetRoles[0]}
                                </span>
                              )}
                            </div>

                            {!isRead && (
                              <button
                                onClick={() => handleRead(n.id)}
                                className="text-xs text-red-600 font-bold hover:underline mt-3 inline-block"
                              >
                                Mark as Read
                              </button>
                            )}

                            {n.isWarning && !n.fixedBy && rolePrefix && (
                              <button
                                onClick={() => handleFix(n.id)}
                                className="w-full mt-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                              >
                                <Check size={16} /> Acknowledge / Fixed
                              </button>
                            )}

                            {n.isWarning && n.fixedBy && (
                              <div className="mt-3 px-3 py-1.5 bg-red-900/10 rounded-lg text-xs font-bold text-red-900 inline-flex items-center gap-1.5">
                                <Check size={14} /> Fixed by {n.fixedBy}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsDropdown;
