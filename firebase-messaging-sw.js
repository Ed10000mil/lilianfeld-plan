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

// Initialize Firebase Messaging. FCM's built-in service worker handler
// auto-displays incoming notifications using the `notification` payload
// of the message (icon/badge/click URL come from the `webpush` block).
//
// We intentionally do NOT register a custom onBackgroundMessage handler,
// because that would call showNotification() again and produce a duplicate
// notification on top of FCM's default one.
firebase.messaging();
