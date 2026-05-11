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

messaging.onBackgroundMessage(payload => {
  const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'Lilianfeld';
  const body  = (payload.notification && payload.notification.body)  || (payload.data && payload.data.body)  || '';
  const iconUrl = new URL('icon-192.png', self.registration.scope).href;
  self.registration.showNotification(title, {
    body,
    icon: iconUrl,
    badge: iconUrl,
    data: { url: self.registration.scope, ...(payload.data || {}) },
    tag: payload.data && payload.data.taskKey ? `task-${payload.data.taskKey}` : undefined
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.startsWith(url) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
