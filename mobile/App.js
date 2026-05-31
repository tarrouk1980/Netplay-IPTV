import React, { useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { initI18n } from './i18n';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './services/api';
import { connectSocket, disconnectSocket } from './services/socket';
import { registerForPushNotifications as registerPushToken, useNotificationListener } from './services/notifications';

import useAuthStore from './store/authStore';
import useNotificationStore from './store/notificationStore';
import useThemeStore from './store/themeStore';

// Onboarding
import OnboardingScreen from './screens/onboarding/OnboardingScreen';

// Auth Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import OTPScreen from './screens/auth/OTPScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';

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
import DriverRequestScreen from './screens/taxi/DriverRequestScreen';

// SOS Screens
import SOSHomeScreen from './screens/sos/SOSHomeScreen';
import SOSRequestScreen from './screens/sos/SOSRequestScreen';
import SOSTrackingScreen from './screens/sos/SOSTrackingScreen';
import DepanneurDashboardScreen from './screens/sos/DepanneurDashboardScreen';
import ConstatAmiableScreen from './screens/sos/ConstatAmiableScreen';
import EasyInsuranceScreen from './screens/sos/EasyInsuranceScreen';

// Delivery Screens
import DeliveryHomeScreen from './screens/delivery/DeliveryHomeScreen';
import MerchantScreen from './screens/delivery/MerchantScreen';
import DeliveryTrackingScreen from './screens/delivery/DeliveryTrackingScreen';
import LivreurDashboardScreen from './screens/delivery/LivreurDashboardScreen';
import MerchantDashboardScreen from './screens/delivery/MerchantDashboardScreen';
import MerchantProductsScreen from './screens/delivery/MerchantProductsScreen';

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
import AdminActivityScreen from './screens/admin/AdminActivityScreen';
import AdminFraudScreen from './screens/admin/AdminFraudScreen';
import AdminAnalyticsScreen from './screens/admin/AdminAnalyticsScreen';
import AdminMerchantsScreen from './screens/admin/AdminMerchantsScreen';
import AdminDisputesScreen from './screens/admin/AdminDisputesScreen';
import AdminWalletScreen from './screens/admin/AdminWalletScreen';
import AdminDriverMapScreen from './screens/admin/AdminDriverMapScreen';
import AdminPromoCodesScreen from './screens/admin/AdminPromoCodesScreen';

// Settings
import SettingsScreen from './screens/profile/SettingsScreen';
import LanguageScreen from './screens/profile/LanguageScreen';
import SupportScreen from './screens/profile/SupportScreen';

// Referral & Profile extras
import ReferralScreen from './screens/profile/ReferralScreen';
import PromoCodeScreen from './screens/promo/PromoCodeScreen';
import ShareAppScreen from './screens/profile/ShareAppScreen';
import KYCPendingScreen from './screens/profile/KYCPendingScreen';
import HistoryScreen from './screens/profile/HistoryScreen';
import ProviderProfileScreen from './screens/profile/ProviderProfileScreen';

// Subscriptions
import BuyPassScreen from './screens/subscriptions/BuyPassScreen';

// Back Home Ride & Payment
import BackHomeRideScreen from './screens/taxi/BackHomeRideScreen';
import PaymentScreen from './screens/payment/PaymentScreen';
import WalletScreen from './screens/wallet/WalletScreen';
import WalletRechargeScreen from './screens/wallet/WalletRechargeScreen';
import ProviderDashboardScreen from './screens/provider/ProviderDashboardScreen';
import VehicleChecklistScreen from './screens/provider/VehicleChecklistScreen';
import ProviderEarningsScreen from './screens/provider/ProviderEarningsScreen';

// Legal
import CGUScreen from './screens/legal/CGUScreen';

// Loyalty & Emergency
import EasyPointsScreen from './screens/loyalty/EasyPointsScreen';
import EmergencyScreen from './screens/emergency/EmergencyScreen';
import SilentSOSScreen from './screens/emergency/SilentSOSScreen';

// Business
import EasyBusinessScreen from './screens/business/EasyBusinessScreen';

// Chat
import ChatScreen from './screens/chat/ChatScreen';

// Rating
import RatingScreen from './screens/taxi/RatingScreen';

// History Detail
import HistoryDetailScreen from './screens/profile/HistoryDetailScreen';

// Provider Onboarding
import ProviderOnboardingScreen from './screens/onboarding/ProviderOnboardingScreen';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['easyway://', 'https://easyway.tn'],
  config: {
    screens: {
      Home: 'home',
      TaxiHome: 'taxi',
      SOSHome: 'sos',
      DeliveryHome: 'delivery',
      GroceryHome: 'grocery',
      Wallet: 'wallet',
      Profile: 'profile',
      Notifications: 'notifications',
      AdminDashboard: 'admin',
      TaxiTracking: 'tracking/taxi/:orderId',
      SOSTracking: 'tracking/sos/:orderId',
      DeliveryTracking: 'tracking/delivery/:orderId',
      BuyPass: 'subscription',
      Chat: 'chat/:orderId',
    },
  },
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function AuthStack({ onboardingDone }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {onboardingDone === false && (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      )}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
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
      <Stack.Screen name="DriverRequest" component={DriverRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderEarnings" component={ProviderEarningsScreen} options={{ headerShown: false }} />

      {/* SOS */}
      <Stack.Screen name="SOSHome" component={SOSHomeScreen} options={{ title: 'SOS Remorquage', headerShown: false }} />
      <Stack.Screen name="SOSRequest" component={SOSRequestScreen} options={{ title: 'Demande SOS' }} />
      <Stack.Screen name="SOSTracking" component={SOSTrackingScreen} options={{ title: 'Suivi SOS', headerShown: false }} />
      <Stack.Screen name="DepanneurDashboard" component={DepanneurDashboardScreen} options={{ title: 'Tableau de bord', headerShown: false }} />
      <Stack.Screen name="ConstatAmiable" component={ConstatAmiableScreen} options={{ title: 'Constat Amiable', headerShown: false }} />
      <Stack.Screen name="EasyInsurance" component={EasyInsuranceScreen} options={{ headerShown: false }} />

      {/* Delivery */}
      <Stack.Screen name="DeliveryHome" component={DeliveryHomeScreen} options={{ title: 'Delivery', headerShown: false }} />
      <Stack.Screen name="Merchant" component={MerchantScreen} options={{ title: 'Commande' }} />
      <Stack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} options={{ title: 'Suivi livraison', headerShown: false }} />
      <Stack.Screen name="LivreurDashboard" component={LivreurDashboardScreen} options={{ title: 'Tableau de bord', headerShown: false }} />
      <Stack.Screen name="MerchantDashboard" component={MerchantDashboardScreen} options={{ title: 'Ma boutique', headerShown: false }} />
      <Stack.Screen name="MerchantProducts" component={MerchantProductsScreen} options={{ headerShown: false }} />

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
      <Stack.Screen name="AdminActivity" component={AdminActivityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminFraud" component={AdminFraudScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminMerchants" component={AdminMerchantsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDisputes" component={AdminDisputesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminWallet" component={AdminWalletScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDriverMap" component={AdminDriverMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPromoCodes" component={AdminPromoCodesScreen} options={{ headerShown: false }} />

      {/* KYC Pending */}
      <Stack.Screen name="KYCPending" component={KYCPendingScreen} options={{ headerShown: false }} />

      {/* Referral & Sharing */}
      <Stack.Screen name="Referral" component={ReferralScreen} options={{ title: 'Parrainage' }} />
      <Stack.Screen name="PromoCode" component={PromoCodeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleChecklist" component={VehicleChecklistScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ShareApp" component={ShareAppScreen} options={{ title: 'Inviter des amis' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Language" component={LanguageScreen} options={{ headerShown: false }} />

      {/* Subscriptions */}
      <Stack.Screen name="BuyPass" component={BuyPassScreen} options={{ title: 'Passer Premium' }} />

      {/* Back Home Ride & Payment & Wallet */}
      <Stack.Screen name="BackHomeRide" component={BackHomeRideScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WalletRecharge" component={WalletRechargeScreen} options={{ headerShown: false }} />

      {/* Legal */}
      <Stack.Screen name="CGU" component={CGUScreen} options={{ headerShown: false }} />

      {/* Loyalty & Emergency */}
      <Stack.Screen name="EasyPoints" component={EasyPointsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SilentSOS" component={SilentSOSScreen} options={{ headerShown: false }} />

      {/* Business */}
      <Stack.Screen name="EasyBusiness" component={EasyBusinessScreen} options={{ headerShown: false }} />

      {/* Chat */}
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />

      {/* Rating */}
      <Stack.Screen name="Rating" component={RatingScreen} options={{ headerShown: false }} />

      {/* History Detail */}
      <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ headerShown: false }} />

      {/* Provider Onboarding */}
      <Stack.Screen name="ProviderOnboarding" component={ProviderOnboardingScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, loadFromStorage, user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { init: initTheme, refreshAuto } = useThemeStore();
  const notificationListener = useRef();
  const responseListener = useRef();
  const [onboardingDone, setOnboardingDone] = useState(null); // null=loading, true/false

  useEffect(() => {
    initI18n().catch(() => {});
    loadFromStorage();
    initTheme();
    AsyncStorage.getItem('onboardingDone').then((done) => {
      setOnboardingDone(!!done);
    });
    // Refresh auto theme when app comes back to foreground
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshAuto();
    });
    return () => appStateSub.remove();
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
      const data = response.notification.request.content.data || {};
      // Deep link routing based on notification data
      if (data.screen) {
        // Use Linking to navigate via the scheme
        const screenRoutes = {
          Wallet: 'easyway://wallet',
          TaxiTracking: data.orderId ? `easyway://tracking/taxi/${data.orderId}` : null,
          SOSTracking: data.orderId ? `easyway://tracking/sos/${data.orderId}` : null,
          DeliveryTracking: data.orderId ? `easyway://tracking/delivery/${data.orderId}` : null,
          Chat: data.orderId ? `easyway://chat/${data.orderId}` : null,
          BuyPass: 'easyway://subscription',
          AdminDashboard: 'easyway://admin',
        };
        const url = screenRoutes[data.screen];
        if (url) Linking.openURL(url).catch(() => {});
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="light" />
      {isAuthenticated ? <MainStack /> : <AuthStack onboardingDone={onboardingDone} />}
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
