import { SCRIPT_URL, Order } from "@/iraqi/types";
import { fetchWithRetry } from "./fetchWithRetry";

export interface AppNotification {
  id: string;
  type: "delete" | "edit" | "warning" | "approve" | "deliver" | "cancel" | "link" | "custom";
  message: string;
  senderRole: string;
  senderUsername?: string;
  targetRoles: string[];
  orderId?: string | number;
  orderSheet?: string;
  timestamp: string;
  readBy: string[];
  fixedBy?: string;
  isWarning?: boolean;
}

export const getTargetRoles = (type: string, senderRole: string): string[] => {
  const rolePrefix = senderRole.split(" ")[0]; // 'moderator', 'admin', 'owner'

  if (type === "delete") {
    if (rolePrefix === "moderator") return ["owner", "admin"];
    if (rolePrefix === "admin") return ["owner", "moderator"];
    if (rolePrefix === "owner") return ["admin", "moderator"];
  }
  if (type === "edit" || type === "link" || type === "cancel") {
    if (rolePrefix === "admin" || rolePrefix === "moderator") return ["owner"];
    if (rolePrefix === "owner") return ["admin", "moderator"];
  }
  if (type === "warning") {
    return ["all"];
  }
  if (type === "approve") {
    return ["all"];
  }
  if (type === "deliver") {
    return ["owner"];
  }
  if (type === "custom") {
    if (rolePrefix === "owner") return ["admin", "moderator"];
    if (rolePrefix === "admin") return ["owner", "moderator"];
    if (rolePrefix === "moderator") return ["owner", "admin"];
  }
  return ["owner", "admin"]; // default safe fallback
};

export const sendNotification = async (
  type: AppNotification["type"],
  message: string,
  senderRole: string | null,
  order?: { id: string | number; sheet_name: string },
  isWarning: boolean = false,
  explicitTarget?: string | string[],
) => {
  if (!senderRole) return;

  if (type !== "warning" && type !== "link" && !isWarning) return;

  let targetRoles = getTargetRoles(type, senderRole);
  if (explicitTarget) {
    targetRoles = Array.isArray(explicitTarget) ? explicitTarget : [explicitTarget];
  }

  if (targetRoles.length === 0) return;

  const notification: AppNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    type,
    message,
    senderRole,
    senderUsername: localStorage.getItem("iraqi_auth_username") || undefined,
    targetRoles,
    orderId: order?.id,
    orderSheet: order?.sheet_name,
    timestamp: new Date().toISOString(),
    readBy: [],
    isWarning,
  };

  try {
    const payload = {
      action: "add_notification",
      notification,
    };

    await fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const targetRolePrefixes = targetRoles.map(
      (target) => target.trim().toLowerCase().split(/\s+/)[0],
    );
    const hasPhoneTarget =
      targetRolePrefixes.includes("all") ||
      targetRolePrefixes.some((target) => target === "owner" || target === "admin");
    if (hasPhoneTarget) {
      try {
        const pushResponse = await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system: "iraqi", notificationId: notification.id }),
        });
        if (!pushResponse.ok) {
          console.error(
            "Phone push request failed",
            pushResponse.status,
            await pushResponse.text(),
          );
        }
      } catch (error) {
        console.error("Phone push request failed", error);
      }
    }
    window.dispatchEvent(new CustomEvent("notifications:refresh"));
    return notification;
  } catch (err) {
    console.error("Failed to send notification", err);
  }
};

export const markNotificationFixed = async (notificationId: string, role: string) => {
  try {
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "fix_notification", id: notificationId, fixedBy: role }),
    }).catch(console.error);
  } catch (err) {
    console.error(err);
  }
};

export const markNotificationRead = async (notificationId: string, role: string) => {
  try {
    fetchWithRetry(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "read_notification", id: notificationId, readBy: role }),
    }).catch(console.error);
  } catch (err) {
    console.error(err);
  }
};

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  try {
    const res = await fetchWithRetry(`${SCRIPT_URL}?action=get_notifications`);
    if (!res.ok) return [];

    const text = await res.text();
    // Some basic failure resistance if html is returned
    if (text.startsWith("<")) return [];

    const data = JSON.parse(text);
    if (data.status === "success" && data.notifications) {
      return data.notifications;
    }
    return [];
  } catch (err) {
    // silently fail instead of looping
    return [];
  }
};
