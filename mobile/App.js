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

// Taxi Screens
import TaxiHomeScreen from './screens/taxi/TaxiHomeScreen';
import TaxiRequestScreen from './screens/taxi/TaxiRequestScreen';
import TaxiTrackingScreen from './screens/taxi/TaxiTrackingScreen';
import DriverDashboardScreen from './screens/taxi/DriverDashboardScreen';

// SOS Screens
import SOSHomeScreen from './screens/sos/SOSHomeScreen';
import SOSRequestScreen from './screens/sos/SOSRequestScreen';
import SOSTrackingScreen from './screens/sos/SOSTrackingScreen';
import DepanneurDashboardScreen from './screens/sos/DepanneurDashboardScreen';
import ConstatAmiableScreen from './screens/sos/ConstatAmiableScreen';

// Delivery Screens
import DeliveryHomeScreen from './screens/delivery/DeliveryHomeScreen';
import MerchantScreen from './screens/delivery/MerchantScreen';
import DeliveryTrackingScreen from './screens/delivery/DeliveryTrackingScreen';
import LivreurDashboardScreen from './screens/delivery/LivreurDashboardScreen';
import MerchantDashboardScreen from './screens/delivery/MerchantDashboardScreen';

// Grocery Screens
import GroceryHomeScreen from './screens/grocery/GroceryHomeScreen';
import GroceryCartScreen from './screens/grocery/GroceryCartScreen';
import GroceryTrackingScreen from './screens/grocery/GroceryTrackingScreen';

// Admin Screens
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminOrdersScreen from './screens/admin/AdminOrdersScreen';
import AdminKYCScreen from './screens/admin/AdminKYCScreen';
import AdminReportsScreen from './screens/admin/AdminReportsScreen';

// Referral & Profile extras
import ReferralScreen from './screens/profile/ReferralScreen';
import ShareAppScreen from './screens/profile/ShareAppScreen';

// Subscriptions
import BuyPassScreen from './screens/subscriptions/BuyPassScreen';

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
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications', headerShown: false }} />

      {/* Taxi */}
      <Stack.Screen name="TaxiHome" component={TaxiHomeScreen} options={{ title: 'Taxi' }} />
      <Stack.Screen name="TaxiRequest" component={TaxiRequestScreen} options={{ title: 'Commander un taxi' }} />
      <Stack.Screen name="TaxiTracking" component={TaxiTrackingScreen} options={{ title: 'Suivi course', headerShown: false }} />
      <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} options={{ title: 'Tableau de bord', headerShown: false }} />

      {/* SOS */}
      <Stack.Screen name="SOSHome" component={SOSHomeScreen} options={{ title: 'SOS Remorquage', headerShown: false }} />
      <Stack.Screen name="SOSRequest" component={SOSRequestScreen} options={{ title: 'Demande SOS' }} />
      <Stack.Screen name="SOSTracking" component={SOSTrackingScreen} options={{ title: 'Suivi SOS', headerShown: false }} />
      <Stack.Screen name="DepanneurDashboard" component={DepanneurDashboardScreen} options={{ title: 'Tableau de bord', headerShown: false }} />
      <Stack.Screen name="ConstatAmiable" component={ConstatAmiableScreen} options={{ title: 'Constat Amiable', headerShown: false }} />

      {/* Delivery */}
      <Stack.Screen name="DeliveryHome" component={DeliveryHomeScreen} options={{ title: 'Delivery', headerShown: false }} />
      <Stack.Screen name="Merchant" component={MerchantScreen} options={{ title: 'Commande' }} />
      <Stack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} options={{ title: 'Suivi livraison', headerShown: false }} />
      <Stack.Screen name="LivreurDashboard" component={LivreurDashboardScreen} options={{ title: 'Tableau de bord', headerShown: false }} />
      <Stack.Screen name="MerchantDashboard" component={MerchantDashboardScreen} options={{ title: 'Ma boutique', headerShown: false }} />

      {/* Grocery */}
      <Stack.Screen name="GroceryHome" component={GroceryHomeScreen} options={{ title: 'Courses', headerShown: false }} />
      <Stack.Screen name="GroceryCart" component={GroceryCartScreen} options={{ title: 'Mon panier' }} />
      <Stack.Screen name="GroceryTracking" component={GroceryTrackingScreen} options={{ title: 'Suivi courses', headerShown: false }} />

      {/* Admin */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Administration', headerShown: false }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Utilisateurs' }} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'Commandes' }} />
      <Stack.Screen name="AdminKYC" component={AdminKYCScreen} options={{ title: 'KYC' }} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'Rapports' }} />

      {/* Referral & Sharing */}
      <Stack.Screen name="Referral" component={ReferralScreen} options={{ title: 'Parrainage' }} />
      <Stack.Screen name="ShareApp" component={ShareAppScreen} options={{ title: 'Inviter des amis' }} />

      {/* Subscriptions */}
      <Stack.Screen name="BuyPass" component={BuyPassScreen} options={{ title: 'Passer Premium' }} />
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
