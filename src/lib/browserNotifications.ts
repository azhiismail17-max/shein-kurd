type NotifyOptions = {
  body?: string;
  icon?: string;
  tag?: string;
};

export async function ensureBrowserNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "default") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function showBrowserNotification(title: string, options: NotifyOptions = {}) {
  if (!("Notification" in window)) return;
  // Permission prompts must come from a clear user action. The first-open setup
  // handles that; background polling should never open a surprise browser prompt.
  if (Notification.permission !== "granted") return;

  const payload = {
    body: options.body,
    icon: options.icon || "/logo-1080.png",
    badge: "/logo-1080.png",
    tag: options.tag,
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.showNotification) {
      await registration.showNotification(title, payload);
      return;
    }
  }

  new Notification(title, payload);
}
