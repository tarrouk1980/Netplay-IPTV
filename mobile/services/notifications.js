import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  try {
    await api.post('/api/users/me/fcm-token', { token, platform: 'expo' });
  } catch {}

  return token;
}

export function useNotificationListener(onNotification) {
  // Returns cleanup function
  const sub = Notifications.addNotificationReceivedListener(onNotification);
  const subResp = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotification(response.notification);
  });
  return () => { sub.remove(); subResp.remove(); };
}
