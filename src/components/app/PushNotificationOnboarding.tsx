import React, { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  canRoleUsePush,
  enableWarningPushNotifications,
  refreshPushRegistration,
} from "@/lib/pushNotifications";

interface PushNotificationOnboardingProps {
  role?: string | null;
  system: "kurdistani" | "iraqi";
}

const ENABLED_KEY = "phone_push_v3_enabled";

const PushNotificationOnboarding: React.FC<PushNotificationOnboardingProps> = ({
  role,
  system,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState("");

  const deviceState = useMemo(() => {
    if (typeof window === "undefined") {
      return { supported: false, needsIosInstall: false, blocked: false };
    }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    return {
      supported:
        "Notification" in window && "PushManager" in window && "serviceWorker" in navigator,
      needsIosInstall: isIos && !isStandalone,
      blocked: "Notification" in window && Notification.permission === "denied",
    };
  }, []);

  // Owner and admin cannot use the system without granting real push
  // permission - there is no dismiss path here by design, only the iPhone
  // install instructions for the one case where the browser can't even ask.
  useEffect(() => {
    if (!canRoleUsePush(role)) return;
    if (localStorage.getItem(ENABLED_KEY) === "true") return;

    const timer = window.setTimeout(() => setIsOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, [role]);

  useEffect(() => {
    const handleEnabled = () => setIsOpen(false);
    window.addEventListener("phone-push:enabled", handleEnabled);
    return () => window.removeEventListener("phone-push:enabled", handleEnabled);
  }, []);

  // Keep an already-enabled device registered under its current subscription,
  // so a rotated endpoint cannot leave this phone silently unreachable.
  useEffect(() => {
    if (!role || !canRoleUsePush(role)) return;
    const usernameKey = system === "iraqi" ? "iraqi_auth_username" : "auth_username";
    refreshPushRegistration({
      role,
      username: localStorage.getItem(usernameKey) || role,
    });
  }, [role, system]);

  const enablePush = async () => {
    if (!role || isEnabling) return;
    setError("");

    if (deviceState.needsIosInstall) {
      setError(
        "On iPhone, tap Share, choose Add to Home Screen, then open the new app icon and enable notifications there.",
      );
      return;
    }
    if (!deviceState.supported) {
      setError(
        "This browser does not support real phone notifications. Try the installed app in Safari or Chrome.",
      );
      return;
    }
    if (deviceState.blocked) {
      setError(
        "Notifications are blocked. Open this site’s browser settings, change Notifications to Allow, then reopen the system.",
      );
      return;
    }

    setIsEnabling(true);
    const usernameKey = system === "iraqi" ? "iraqi_auth_username" : "auth_username";
    const result = await enableWarningPushNotifications({
      role,
      username: localStorage.getItem(usernameKey) || role,
      system,
    });
    setIsEnabling(false);

    if (result.ok) {
      setIsOpen(false);
      toast.success("Real phone notifications are enabled", {
        description: "Kurdistani and Iraqi alerts are connected to this device.",
      });
      return;
    }

    setError(result.reason);
  };

  if (!isOpen || !canRoleUsePush(role)) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="push-setup-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl">
        <div className="relative bg-gradient-to-br from-red-700 via-red-800 to-slate-950 px-6 pb-7 pt-8 text-white">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <BellRing size={28} />
          </div>
          <h2 id="push-setup-title" className="text-2xl font-black tracking-tight">
            Allow real phone notifications
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Receive important alerts even when the system is closed or your phone screen is locked.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={18} />
              <span>Warnings and total links from Kurdistani and Iraqi</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={18} />
              <span>Deleted, edited, purchased and delivered orders</span>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="mt-0.5 shrink-0 text-primary" size={18} />
              <span>One setup enables both systems on this device</span>
            </div>
          </div>

          {deviceState.needsIosInstall && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-800 dark:text-amber-200">
              iPhone setup: tap Safari’s Share button, select <strong>Add to Home Screen</strong>,
              then open the new app icon.
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={enablePush}
            disabled={isEnabling}
            className="w-full rounded-2xl bg-red-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-800 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
          >
            {isEnabling
              ? "Connecting this phone..."
              : deviceState.needsIosInstall
                ? "Show iPhone setup"
                : "Enable real notifications"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationOnboarding;
