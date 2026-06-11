import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  let token;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('price-alerts', {
      name: 'Alertes prix',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }

  return token;
}

export async function scheduleLocalAlert({ title, body, data = {} }) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null, // immediate
  });
}

// Called when a price alert is triggered
export async function notifyPriceAlert({ origin, dest, price, currency, targetPrice }) {
  const saving = Math.round(targetPrice - price);
  await scheduleLocalAlert({
    title: `🎉 Prix objectif atteint ! ${origin} → ${dest}`,
    body: `Vol disponible à ${price}${currency} (économisez ${saving}${currency})`,
    data: { type: 'PRICE_ALERT', origin, dest, price },
  });
}
