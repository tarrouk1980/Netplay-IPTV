import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './services/api';
import { connectSocket, disconnectSocket } from './services/socket';

import useAuthStore from './store/authStore';
import useNotificationStore from './store/notificationStore';

// Auth Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import OTPScreen from './screens/auth/OTPScreen';

// Main Screens
import HomeScreen from './screens/home/HomeScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import KYCScreen from './screens/profile/KYCScreen';
import NotificationsScreen from './screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0A0F' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Mon profil' }}
      />
      <Stack.Screen
        name="KYC"
        component={KYCScreen}
        options={{ title: 'Vérification KYC' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications', headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, loadFromStorage, user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Restore tokens from AsyncStorage on app start
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect socket
      connectSocket().catch(console.warn);

      // Register FCM token
      registerForPushNotifications();
    } else {
      // Disconnect socket on logout
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Listen for incoming notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      addNotification({
        id: notification.request.identifier,
        type: data?.type || 'SYSTEM',
        title: title || 'EASYWAY',
        body: body || '',
        data: data || {},
      });
    });

    // Listen for notification responses (user taps)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Notifications] User tapped notification:', response.notification.request.identifier);
      // Handle deep linking based on notification data
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

async function registerForPushNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const fcmToken = tokenData.data;

    // Store locally
    await AsyncStorage.setItem('fcmToken', fcmToken);

    // Register with backend
    await api.post('/api/notifications/register-token', { fcmToken }).catch((err) => {
      console.warn('[Notifications] Failed to register token with backend:', err.message);
    });

    console.log('[Notifications] FCM token registered:', fcmToken.slice(0, 20) + '...');
  } catch (err) {
    console.warn('[Notifications] Error registering push notifications:', err.message);
  }
}
