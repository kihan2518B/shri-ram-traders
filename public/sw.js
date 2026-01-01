self.addEventListener("push", (event) => {
  let data = {
    title: "Shri Ram Traders",
    body: "You have a new notification",
    url: "https://shri-ram-traders.vercel.app",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error("Invalid push payload", e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/android-launchericon-192-192.png",
    badge: "/icons/android-launchericon-192-192.png",
    vibrate: [100, 50, 100],
    tag: "shri-ram-traders-notification",
    renotify: true,
    data: {
      url: data.url,
      timestamp: Date.now(),
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || "https://shri-ram-traders.vercel.app";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
