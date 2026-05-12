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

const messaging = firebase.messaging();

// Cloud Function sends data-only messages, so onBackgroundMessage fires
// and we show our own notification with full control — no iOS-injected
// "from [PWA name]" subtitle, no duplicate display.
messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  const title = data.title || 'Lilianfeld';
  const iconUrl = new URL('icon-192.png', self.registration.scope).href;

  return self.registration.showNotification(title, {
    body: data.body || '',
    icon: iconUrl,
    badge: iconUrl,
    tag: data.taskKey ? `task-${data.taskKey}` : undefined,
    renotify: true,
    data: data
  });
});

// Notification tap → focus existing PWA window and deep-link to the task,
// or open a new window directly at the task URL.
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const data = event.notification.data || {};
  const taskKey = data.taskKey || '';
  const dayNum  = data.dayNum  || '';
  const link    = data.link    || self.registration.scope;
  const isOther = (typeof taskKey === 'string' && taskKey.startsWith('other-')) || /[?&]other=1/.test(link);

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of allClients) {
      if (c.url.startsWith(self.registration.scope)) {
        await c.focus();
        if (isOther) {
          c.postMessage({ type: 'deep-link', other: 1, taskKey: taskKey || null });
        } else if (dayNum || taskKey) {
          c.postMessage({
            type: 'deep-link',
            day: parseInt(dayNum, 10) || null,
            taskKey: taskKey || null
          });
        }
        return;
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(link);
    }
  })());
});
