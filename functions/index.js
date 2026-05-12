const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const APP_URL = 'https://ed10000mil.github.io/lilianfeld-plan/';

exports.sendPing = onDocumentCreated('pings/{pingId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const ping = snap.data();
  if (!ping) return;

  const {
    syncCode,
    taskKey,
    dayNum,
    taskText,
    dayTitle,
    targetPersons,
    senderPerson,
    isOther,
  } = ping;

  if (!syncCode || !Array.isArray(targetPersons) || targetPersons.length === 0) {
    console.log('Skipping invalid ping', event.params.pingId);
    return;
  }

  const devicesSnap = await db
    .collection('devices')
    .where('syncCode', '==', syncCode)
    .where('person', 'in', targetPersons)
    .get();

  if (devicesSnap.empty) {
    console.log('No devices for ping', event.params.pingId);
    await snap.ref.update({
      sent: false,
      error: 'no_devices_registered',
      deliveredAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  const tokens = devicesSnap.docs.map((d) => d.id);

  const senderName =
    senderPerson === 'e'
      ? 'Edward'
      : senderPerson === 'c'
      ? 'Clarissa'
      : 'Someone';
  const isOtherTask = !!isOther || (typeof taskKey === 'string' && taskKey.startsWith('other-'));

  const title = `${senderName} pinged you`;
  const body = isOtherTask
    ? `${taskText || 'a task'} · ${dayTitle || 'Other Tasks'}`
    : `${taskText || 'a task'} · Day ${dayNum || '?'}${dayTitle ? ': ' + dayTitle : ''}`;
  const deepLink = isOtherTask
    ? `${APP_URL}?other=1&task=${encodeURIComponent(taskKey || '')}`
    : `${APP_URL}?day=${encodeURIComponent(dayNum || '')}&task=${encodeURIComponent(taskKey || '')}`;

  // DATA-ONLY message: no `notification` field, no `webpush.notification`.
  // The service worker's onBackgroundMessage will display the notification
  // with full control over appearance — no iOS auto-added "from [PWA name]".
  const message = {
    data: {
      title,
      body,
      taskKey: taskKey || '',
      dayNum: String(dayNum || ''),
      link: deepLink,
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      fcmOptions: {
        link: deepLink,
      },
    },
    tokens,
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    console.log(
      `Ping ${event.params.pingId}: delivered ${response.successCount}/${tokens.length}`
    );

    const stale = [];
    response.responses.forEach((r, i) => {
      if (!r.success && r.error) {
        const code = r.error.code || '';
        console.log(`Failure for token ${tokens[i].slice(0, 12)}…: ${code}`);
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/invalid-argument'
        ) {
          stale.push(tokens[i]);
        }
      }
    });

    for (const t of stale) {
      try {
        await db.collection('devices').doc(t).delete();
      } catch (e) {}
    }

    await snap.ref.update({
      sent: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      deliveredAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('FCM send error:', err);
    await snap.ref.update({
      sent: false,
      error: err.message || 'unknown',
      deliveredAt: FieldValue.serverTimestamp(),
    });
  }
});
