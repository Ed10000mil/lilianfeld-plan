importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDRm2RQIm0lZbOwKmZIJfdYZng3HIAlyCc",
  authDomain: "lilianfeld-plan.firebaseapp.com",
  projectId: "lilianfeld-plan",
  storageBucket: "lilianfeld-plan.firebasestorage.app",
  messagingSenderId: "1098965869642",
  appId: "1:1098965869642:web:c42ba903109c8a4b5a32b3"
});

// FCM's built-in handler auto-displays the `notification` payload.
// We do NOT register a custom onBackgroundMessage handler (that would
// cause a duplicate notification).
firebase.messaging();

// Notification click → focus existing PWA window if open, deep-link to task,
// or open a fresh window with the task URL.
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const data = event.notification.data || {};
  const fcmData = (data.FCM_MSG && data.FCM_MSG.data) || {};

  const taskKey = fcmData.taskKey || data.taskKey || '';
  const dayNum  = fcmData.dayNum  || data.dayNum  || '';

  const baseUrl = self.registration.scope; // e.g. https://.../lilianfeld-plan/
  const deepLink = (dayNum || taskKey)
    ? `${baseUrl}?day=${encodeURIComponent(dayNum)}&task=${encodeURIComponent(taskKey)}`
    : baseUrl;

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    // If the app already has a window, focus it and tell it where to go.
    for (const c of allClients) {
      if (c.url.startsWith(baseUrl)) {
        await c.focus();
        if (dayNum || taskKey) {
          c.postMessage({
            type: 'deep-link',
            day: parseInt(dayNum, 10) || null,
            taskKey: taskKey || null
          });
        }
        return;
      }
    }

    // Otherwise open a new window directly at the deep link.
    if (clients.openWindow) {
      return clients.openWindow(deepLink);
    }
  })());
});
