import React, { useEffect, useRef, useState } from 'react';
import { AppState, Linking, View, Text, ScrollView, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e) { console.error('[ErrorBoundary]', e); }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#0A0A0F', padding: 24, paddingTop: 60 }}>
          <Text style={{ color: '#E74C3C', fontSize: 18, fontWeight: '900', marginBottom: 12 }}>⚠ Erreur détectée</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 13, marginBottom: 8 }}>{this.state.error?.message || String(this.state.error)}</Text>
          <Text style={{ color: '#8E8E9A', fontSize: 11 }}>{this.state.error?.stack?.slice(0, 600)}</Text>
          <TouchableOpacity style={{ marginTop: 24, backgroundColor: '#F5A623', padding: 14, borderRadius: 10 }} onPress={() => this.setState({ error: null })}>
            <Text style={{ color: '#000', fontWeight: '700', textAlign: 'center' }}>Réessayer</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
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
import AdminSupportScreen from './screens/admin/AdminSupportScreen';
import AdminBroadcastScreen from './screens/admin/AdminBroadcastScreen';
import AdminOrderDetailScreen from './screens/admin/AdminOrderDetailScreen';
import AdminUserDetailScreen from './screens/admin/AdminUserDetailScreen';

// Nearby Providers
import NearbyProvidersScreen from './screens/home/NearbyProvidersScreen';

// Schedule Ride
import TaxiScheduleRideScreen from './screens/taxi/TaxiScheduleRideScreen';
import TaxiScheduleScreen from './screens/taxi/TaxiScheduleScreen';

// Quick Taxi
import QuickTaxiScreen from './screens/taxi/QuickTaxiScreen';

// Wallet Transactions
import WalletTransactionsScreen from './screens/wallet/WalletTransactionsScreen';

// Live Order Map
import LiveOrderMapScreen from './screens/shared/LiveOrderMapScreen';

// EasyPass
import EasyPassScreen from './screens/subscriptions/EasyPassScreen';

// Merchant Order Detail
import MerchantOrderDetailScreen from './screens/delivery/MerchantOrderDetailScreen';

// Grocery Checkout
import GroceryCheckoutScreen from './screens/grocery/GroceryCheckoutScreen';

// Provider Reviews
import ProviderReviewsScreen from './screens/provider/ProviderReviewsScreen';

// Admin Geo Stats
import AdminGeoStatsScreen from './screens/admin/AdminGeoStatsScreen';

// Tip & Rating
import TipAndRatingScreen from './screens/shared/TipAndRatingScreen';

// Invoice
import InvoiceScreen from './screens/shared/InvoiceScreen';

// Admin System Health
import AdminSystemHealthScreen from './screens/admin/AdminSystemHealthScreen';

// Settings
import SettingsScreen from './screens/profile/SettingsScreen';
import LanguageScreen from './screens/profile/LanguageScreen';
import SupportScreen from './screens/profile/SupportScreen';
import AddressBookScreen from './screens/profile/AddressBookScreen';

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
import ProviderScheduleScreen from './screens/provider/ProviderScheduleScreen';
import ProviderIncomeScreen from './screens/provider/ProviderIncomeScreen';
import OrderCancelScreen from './screens/shared/OrderCancelScreen';

// Legal
import CGUScreen from './screens/legal/CGUScreen';

// Loyalty & Emergency
import EasyPointsScreen from './screens/loyalty/EasyPointsScreen';
import EmergencyScreen from './screens/emergency/EmergencyScreen';
import SilentSOSScreen from './screens/emergency/SilentSOSScreen';

// Business
import EasyBusinessScreen from './screens/business/EasyBusinessScreen';
import EasyCarScreen from './screens/business/EasyCarScreen';

// Package
import EasyPackageScreen from './screens/delivery/EasyPackageScreen';

// Payment Methods
import PaymentMethodsScreen from './screens/payment/PaymentMethodsScreen';

// Chat
import ChatScreen from './screens/chat/ChatScreen';

// Batch 70
import EasyLadyScreen from './screens/taxi/EasyLadyScreen';
import DriverNavigationScreen from './screens/taxi/DriverNavigationScreen';
import GroceryStoreMapScreen from './screens/grocery/GroceryStoreMapScreen';

// Batch 71
import EasyAccessScreen from './screens/taxi/EasyAccessScreen';
import SOSPrePaymentScreen from './screens/sos/SOSPrePaymentScreen';
import ReferralLeaderboardScreen from './screens/shared/ReferralLeaderboardScreen';

// Rating
import RatingScreen from './screens/taxi/RatingScreen';

// History Detail
import HistoryDetailScreen from './screens/profile/HistoryDetailScreen';

// Provider Onboarding
import ProviderOnboardingScreen from './screens/onboarding/ProviderOnboardingScreen';

// Batch 11
import SOSPreDiagnosticScreen from './screens/sos/SOSPreDiagnosticScreen';
import DriverHeatmapScreen from './screens/taxi/DriverHeatmapScreen';
import AdminCouponGeneratorScreen from './screens/admin/AdminCouponGeneratorScreen';

// Batch 12
import EasyPointsDashboardScreen from './screens/loyalty/EasyPointsDashboardScreen';
import EarningsGoalScreen from './screens/provider/EarningsGoalScreen';
import AdminPushNotificationScreen from './screens/admin/AdminPushNotificationScreen';

// Batch 13
import DriverDocumentsScreen from './screens/provider/DriverDocumentsScreen';
import AdminRevenueReportScreen from './screens/admin/AdminRevenueReportScreen';
import MultiOrderTrackerScreen from './screens/shared/MultiOrderTrackerScreen';

// Batch 14
import LiveChatScreen from './screens/support/LiveChatScreen';
import AvailabilityScheduleScreen from './screens/provider/AvailabilityScheduleScreen';
import AdminBulkActionsScreen from './screens/admin/AdminBulkActionsScreen';

// Batch 15
import ClientOnboardingScreen from './screens/onboarding/ClientOnboardingScreen';
import KonnectPaymentScreen from './screens/payment/KonnectPaymentScreen';
import NotificationCenterScreen from './screens/notifications/NotificationCenterScreen';

// Batch 16
import MapAddressPickerScreen from './screens/shared/MapAddressPickerScreen';
import MerchantStatsScreen from './screens/merchant/MerchantStatsScreen';
import AdminKYCDetailScreen from './screens/admin/AdminKYCDetailScreen';

// Batch 17
import ClientFavoriteProvidersScreen from './screens/profile/ClientFavoriteProvidersScreen';
import AdminDisputeDetailScreen from './screens/admin/AdminDisputeDetailScreen';

// Batch 18
import LivreurEarningsScreen from './screens/delivery/LivreurEarningsScreen';
import AdminSOSReportScreen from './screens/admin/AdminSOSReportScreen';
import ClientOrderHistoryDetailScreen from './screens/profile/ClientOrderHistoryDetailScreen';

// Batch 19
import ProviderOnlineStatusScreen from './screens/provider/ProviderOnlineStatusScreen';
import AdminUserBanHistoryScreen from './screens/admin/AdminUserBanHistoryScreen';
import GroceryStoreDetailScreen from './screens/grocery/GroceryStoreDetailScreen';

// Batch 20
import AdminPassManagementScreen from './screens/admin/AdminPassManagementScreen';
import DriverRideHistoryScreen from './screens/taxi/DriverRideHistoryScreen';
import AppSettingsScreen from './screens/profile/AppSettingsScreen';

// Batch 21
import SOSOrderDetailScreen from './screens/sos/SOSOrderDetailScreen';
import AdminZoneManagementScreen from './screens/admin/AdminZoneManagementScreen';
import ProviderEarningsDashboardScreen from './screens/provider/ProviderEarningsDashboardScreen';

// Batch 22
import ClientProfileEditScreen from './screens/profile/ClientProfileEditScreen';
import AdminAppConfigScreen from './screens/admin/AdminAppConfigScreen';
import DeliveryOrderDetailScreen from './screens/delivery/DeliveryOrderDetailScreen';

// Batch 23
import TaxiOrderDetailScreen from './screens/taxi/TaxiOrderDetailScreen';
import AdminPromoDetailScreen from './screens/admin/AdminPromoDetailScreen';
import ProviderRatingDetailScreen from './screens/provider/ProviderRatingDetailScreen';

// Batch 24
import WalletTopUpScreen from './screens/wallet/WalletTopUpScreen';
import AdminUserWalletScreen from './screens/admin/AdminUserWalletScreen';

// Batch 25
import AdminLiveOrdersScreen from './screens/admin/AdminLiveOrdersScreen';
import ProviderVehicleInfoScreen from './screens/provider/ProviderVehicleInfoScreen';
import ClientSOSHistoryScreen from './screens/sos/ClientSOSHistoryScreen';

// Batch 26
import ProviderDocumentStatusScreen from './screens/provider/ProviderDocumentStatusScreen';
import AdminRevenueDetailScreen from './screens/admin/AdminRevenueDetailScreen';
import GroceryOrderHistoryScreen from './screens/grocery/GroceryOrderHistoryScreen';
import AdminRevenueScreen from './screens/admin/AdminRevenueScreen';

// Batch 27
import TaxiRideScheduleListScreen from './screens/taxi/TaxiRideScheduleListScreen';
import AdminProviderVerificationScreen from './screens/admin/AdminProviderVerificationScreen';
import MerchantOrdersLiveScreen from './screens/delivery/MerchantOrdersLiveScreen';

// Batch 28
import ProviderWorkScheduleScreen from './screens/provider/ProviderWorkScheduleScreen';
import AdminSupportTicketsScreen from './screens/admin/AdminSupportTicketsScreen';
import EasyRewardsScreen from './screens/loyalty/EasyRewardsScreen';

// Batch 29
import TaxiSurgeMapScreen from './screens/taxi/TaxiSurgeMapScreen';
import AdminNotificationCampaignsScreen from './screens/admin/AdminNotificationCampaignsScreen';
import ClientAddressManagerScreen from './screens/profile/ClientAddressManagerScreen';

// Batch 30
import LivreurMapScreen from './screens/delivery/LivreurMapScreen';
import AdminFinancialReportScreen from './screens/admin/AdminFinancialReportScreen';
import SOSNearbyDepanneursScreen from './screens/sos/SOSNearbyDepanneursScreen';

// Batch 31
import TaxiDriverStatsScreen from './screens/taxi/TaxiDriverStatsScreen';
import AdminMapOverviewScreen from './screens/admin/AdminMapOverviewScreen';
import AdminMapScreen from './screens/admin/AdminMapScreen';
import GroceryCheckoutSuccessScreen from './screens/grocery/GroceryCheckoutSuccessScreen';
// Batch 112
import MerchantInventoryScreen from './screens/merchant/MerchantInventoryScreen';
import ClientRewardsScreen from './screens/client/ClientRewardsScreen';
import AdminZonesScreen from './screens/admin/AdminZonesScreen';
// Batch 113
import AdminVehiclesScreen from './screens/admin/AdminVehiclesScreen';
import DepanneurHistoryScreen from './screens/sos/DepanneurHistoryScreen';
import ClientFavoritesScreen from './screens/client/ClientFavoritesScreen';
// Batch 114
import AdminBannersScreen from './screens/admin/AdminBannersScreen';
import ProviderDocumentsScreen from './screens/provider/ProviderDocumentsScreen';
import ClientAddressMapScreen from './screens/client/ClientAddressMapScreen';
// Batch 115
import AdminTransactionsScreen from './screens/admin/AdminTransactionsScreen';
import ClientTripDetailScreen from './screens/client/ClientTripDetailScreen';
import MerchantHoursScreen from './screens/merchant/MerchantHoursScreen';
// Batch 116
import AdminFeedbackScreen from './screens/admin/AdminFeedbackScreen';
import TaxiSurgePricingScreen from './screens/taxi/TaxiSurgePricingScreen';
import ClientSubscriptionScreen from './screens/client/ClientSubscriptionScreen';
// Batch 117
import MerchantCouponsScreen from './screens/merchant/MerchantCouponsScreen';
import LivreurZonesScreen from './screens/delivery/LivreurZonesScreen';
import ClientLanguageScreen from './screens/client/ClientLanguageScreen';
// Batch 118
import TaxiDriverOnboardingScreen from './screens/taxi/TaxiDriverOnboardingScreen';
import GroceryShopScreen from './screens/grocery/GroceryShopScreen';
import ClientEmergencyScreen from './screens/client/ClientEmergencyScreen';
import MerchantStaffScreen from './screens/merchant/MerchantStaffScreen';
import ProviderInsuranceScreen from './screens/provider/ProviderInsuranceScreen';
import TaxiDispatchScreen from './screens/taxi/TaxiDispatchScreen';
import ClientReferralScreen from './screens/client/ClientReferralScreen';
import TaxiRatingsScreen from './screens/taxi/TaxiRatingsScreen';
import GroceryOrdersScreen from './screens/grocery/GroceryOrdersScreen';
import DepanneurQuoteScreen from './screens/sos/DepanneurQuoteScreen';
import LivreurTaskScreen from './screens/delivery/LivreurTaskScreen';
import TaxiEarningsScreen from './screens/taxi/TaxiEarningsScreen';
import ClientChatScreen from './screens/client/ClientChatScreen';
import LivreurHomeScreen from './screens/delivery/LivreurHomeScreen';
import MerchantMenuScreen from './screens/merchant/MerchantMenuScreen';
import MerchantNotificationsScreen from './screens/merchant/MerchantNotificationsScreen';
import LivreurRatingsScreen from './screens/delivery/LivreurRatingsScreen';
import ClientHomeScreen from './screens/client/ClientHomeScreen';
import DepanneurHomeScreen from './screens/sos/DepanneurHomeScreen';
import ClientOrderDetailScreen from './screens/client/ClientOrderDetailScreen';
import TaxiDriverHomeScreen from './screens/taxi/TaxiDriverHomeScreen';
import SOSMapScreen from './screens/sos/SOSMapScreen';
import MerchantQRCodeScreen from './screens/merchant/MerchantQRCodeScreen';
import ClientSupportScreen from './screens/client/ClientSupportScreen';
import ClientWalletDetailScreen from './screens/client/ClientWalletScreen';
import MerchantPromotionsScreen from './screens/merchant/MerchantPromotionsScreen';
import LivreurBonusScreen from './screens/delivery/LivreurBonusScreen';
import TaxiScheduleBookingScreen from './screens/taxi/TaxiScheduleBookingScreen';
import GroceryStoreProfileScreen from './screens/grocery/GroceryStoreProfileScreen';
import ProviderGoalsScreen from './screens/provider/ProviderGoalsScreen';
import ClientInvoiceScreen from './screens/client/ClientInvoiceScreen';
import MerchantEarningsScreen from './screens/merchant/MerchantEarningsScreen';
import SOSRatingDetailScreen from './screens/sos/SOSRatingDetailScreen';
import AdminLiveDriversScreen from './screens/admin/AdminLiveDriversScreen';
import ClientAddressBookScreen from './screens/client/ClientAddressBookScreen';
import LivreurScheduleScreen from './screens/delivery/LivreurScheduleScreen';
import AdminRevenueChartScreen from './screens/admin/AdminRevenueChartScreen';
import LegalMentionsScreen from './screens/legal/LegalMentionsScreen';
import ClientLoyaltyScreen from './screens/client/ClientLoyaltyScreen';
import GroceryReviewsScreen from './screens/grocery/GroceryReviewsScreen';
import ProviderTripHistoryScreen from './screens/provider/ProviderTripHistoryScreen';
import AdminNotificationsScreen from './screens/admin/AdminNotificationsScreen';
import TaxiScheduledTripsScreen from './screens/taxi/TaxiScheduledTripsScreen';
import ClientPromoCodesScreen from './screens/client/ClientPromoCodesScreen';
import AdminDriverPerformanceScreen from './screens/admin/AdminDriverPerformanceScreen';
import ClientFeedbackScreen from './screens/client/ClientFeedbackScreen';
import MerchantStockAlertScreen from './screens/merchant/MerchantStockAlertScreen';

// Batch 32
import ClientOrdersAllScreen from './screens/profile/ClientOrdersAllScreen';
import AdminCouponListScreen from './screens/admin/AdminCouponListScreen';
import DeliveryRatingScreen from './screens/delivery/DeliveryRatingScreen';

// Batch 55
import TaxiMapScreen from './screens/taxi/TaxiMapScreen';

// Batch 54
import ProfileSettingsScreen from './screens/profile/ProfileSettingsScreen';

// Batch 53
import DriverEarningsScreen from './screens/driver/DriverEarningsScreen';

// Batch 52
import ProfileSOSHistoryScreen from './screens/profile/ProfileSOSHistoryScreen';
import AdminPromoCodesV2Screen from './screens/admin/AdminPromoCodesV2Screen';


// Batch 51
import TaxiScheduledRidesScreen from './screens/taxi/TaxiScheduledRidesScreen';
import AdminDriverEarningsScreen from './screens/admin/AdminDriverEarningsScreen';
import GroceryFavoritesScreen from './screens/grocery/GroceryFavoritesScreen';

// Batch 50
import ClientDeliveryHistoryScreen from './screens/profile/ClientDeliveryHistoryScreen';
import AdminPlatformSettingsScreen from './screens/admin/AdminPlatformSettingsScreen';
import TaxiOrderSuccessScreen from './screens/taxi/TaxiOrderSuccessScreen';

// Batch 49
import TaxiActiveRideScreen from './screens/taxi/TaxiActiveRideScreen';
import AdminEarningsScreen from './screens/admin/AdminEarningsScreen';
import DeliveryOrderConfirmScreen from './screens/delivery/DeliveryOrderConfirmScreen';

// Batch 48
import DeliveryLivreurTrackingScreen from './screens/delivery/DeliveryLivreurTrackingScreen';
import AdminUsersExportScreen from './screens/admin/AdminUsersExportScreen';
import SOSPaymentScreen from './screens/sos/SOSPaymentScreen';

// Batch 47
import ProviderStatsScreen from './screens/provider/ProviderStatsScreen';
import GroceryCheckoutReviewScreen from './screens/grocery/GroceryCheckoutReviewScreen';
// Batch 135
import ClientMapScreen from './screens/client/ClientMapScreen';
import MerchantAnalyticsScreen from './screens/merchant/MerchantAnalyticsScreen';
// Batch 136
import LivreurHistoryScreen from './screens/delivery/LivreurHistoryScreen';
// Batch 137
import TaxiRatingScreen from './screens/taxi/TaxiRatingScreen';
import SOSHistoryScreen from './screens/sos/SOSHistoryScreen';
import GroceryOrderTrackingScreen from './screens/grocery/GroceryOrderTrackingScreen';
// Batch 138
import ClientNotificationsScreen from './screens/client/ClientNotificationsScreen';
import DepanneurEarningsScreen from './screens/sos/DepanneurEarningsScreen';
// Batch 139
import DriverTripHistoryScreen from './screens/taxi/DriverTripHistoryScreen';
import GroceryStoreScreen from './screens/grocery/GroceryStoreScreen';
// Batch 140
import ClientAddressesScreen from './screens/client/ClientAddressesScreen';
import AdminDriversScreen from './screens/admin/AdminDriversScreen';
// Batch 141
import TaxiHomeScreen2 from './screens/taxi/TaxiHomeScreen2';
// Batch 142
import MerchantOrdersScreen from './screens/merchant/MerchantOrdersScreen';
import DepanneurHomeScreen2 from './screens/sos/DepanneurHomeScreen2';
import AdminLiveMapScreen from './screens/admin/AdminLiveMapScreen';
// Batch 143
import ClientOrderHistoryScreen from './screens/client/ClientOrderHistoryScreen';
import AdminPromotionsScreen from './screens/admin/AdminPromotionsScreen';
import ProviderIncomeScreen2 from './screens/provider/ProviderIncomeScreen2';
// Batch 144
import TaxiTrackingScreen2 from './screens/taxi/TaxiTrackingScreen2';
import AdminProvidersScreen from './screens/admin/AdminProvidersScreen';

// Batch 46
import MerchantProfileScreen from './screens/merchant/MerchantProfileScreen';
import AdminRefundsScreen from './screens/admin/AdminRefundsScreen';
import TaxiConfirmRideScreen from './screens/taxi/TaxiConfirmRideScreen';

// Batch 45
import ClientTripHistoryScreen from './screens/profile/ClientTripHistoryScreen';
import AdminServiceConfigScreen from './screens/admin/AdminServiceConfigScreen';
import SOSLiveTrackingScreen from './screens/sos/SOSLiveTrackingScreen';

// Batch 44
import TaxiWaitingScreen from './screens/taxi/TaxiWaitingScreen';
import AdminAuditLogScreen from './screens/admin/AdminAuditLogScreen';
import LivreurRatingScreen from './screens/delivery/LivreurRatingScreen';

// Batch 43
import AdminDriverVerificationScreen from './screens/admin/AdminDriverVerificationScreen';
import GroceryOrderDetailScreen from './screens/grocery/GroceryOrderDetailScreen';

// Batch 42
import DeliveryAddressScreen from './screens/delivery/DeliveryAddressScreen';
import AdminHeatmapScreen from './screens/admin/AdminHeatmapScreen';
import ProviderFeedbackScreen from './screens/provider/ProviderFeedbackScreen';

// Batch 41
import AdminChatMonitorScreen from './screens/admin/AdminChatMonitorScreen';
import ClientWalletScreen from './screens/profile/ClientWalletScreen';

// Batch 40
import SOSDepanneurDetailScreen from './screens/sos/SOSDepanneurDetailScreen';
import AdminSubscriptionsScreen from './screens/admin/AdminSubscriptionsScreen';
import DeliveryRateScreen from './screens/delivery/DeliveryRateScreen';

// Batch 39
import TaxiDriverEarningsScreen from './screens/taxi/TaxiDriverEarningsScreen';
import AdminPaymentsScreen from './screens/admin/AdminPaymentsScreen';

// Batch 38
import TaxiHomeV2Screen from './screens/taxi/TaxiHomeV2Screen';
import DeliveryHomeV2Screen from './screens/delivery/DeliveryHomeV2Screen';
import AdminStatsOverviewScreen from './screens/admin/AdminStatsOverviewScreen';

// Batch 37
import TaxiScheduleConfirmScreen from './screens/taxi/TaxiScheduleConfirmScreen';
import AdminDriverIncidentsScreen from './screens/admin/AdminDriverIncidentsScreen';
import GrocerySearchScreen from './screens/grocery/GrocerySearchScreen';

// Batch 36
import SOSRatingScreen from './screens/sos/SOSRatingScreen';
import AdminReferralStatsScreen from './screens/admin/AdminReferralStatsScreen';
import GroceryProductDetailScreen from './screens/grocery/GroceryProductDetailScreen';

// Batch 35
import DeliveryOrderSummaryScreen from './screens/delivery/DeliveryOrderSummaryScreen';
import AdminProviderPayoutsScreen from './screens/admin/AdminProviderPayoutsScreen';
import ClientNotificationPrefsScreen from './screens/profile/ClientNotificationPrefsScreen';

// Batch 34
import GroceryStoreAnalyticsScreen from './screens/grocery/GroceryStoreAnalyticsScreen';
import AdminAppVersionScreen from './screens/admin/AdminAppVersionScreen';
import TaxiReceiptScreen from './screens/taxi/TaxiReceiptScreen';

// Batch 33
import TaxiPromoScreen from './screens/taxi/TaxiPromoScreen';
import AdminUserSessionsScreen from './screens/admin/AdminUserSessionsScreen';

// Batch 57
import DriverAcceptRideScreen from './screens/taxi/DriverAcceptRideScreen';
import LivreurAcceptOrderScreen from './screens/delivery/LivreurAcceptOrderScreen';

// Batch 58
import PaymentSuccessScreen from './screens/payment/PaymentSuccessScreen';
import EditProfileScreen from './screens/profile/EditProfileScreen';
// Batch 59
import SOSContractScreen from './screens/sos/SOSContractScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';
// Batch 60
import TaxiHistoryScreen from './screens/taxi/TaxiHistoryScreen';
import DeliveryOrderHistoryScreen from './screens/delivery/DeliveryOrderHistoryScreen';
import NotificationPreferencesScreen from './screens/profile/NotificationPreferencesScreen';

// Batch 67
import DriverStatusScreen from './screens/driver/DriverStatusScreen';
import DepanneurStatusScreen from './screens/sos/DepanneurStatusScreen';

// Batch 68

// Batch 61
import TaxiSearchScreen from './screens/taxi/TaxiSearchScreen';
import DepanneurProfileScreen from './screens/sos/DepanneurProfileScreen';
import SecurityScreen from './screens/profile/SecurityScreen';
import HelpCenterScreen from './screens/profile/HelpCenterScreen';
import AdminSOSScreen from './screens/admin/AdminSOSScreen';
import TaxiLiveTrackingScreen from './screens/taxi/TaxiLiveTrackingScreen';
import FlashSaleScreen from './screens/promo/FlashSaleScreen';
import LiveTrafficScreen from './screens/traffic/LiveTrafficScreen';
import EasyCommunityScreen from './screens/community/EasyCommunityScreen';
import EarningsDashboardScreen from './screens/driver/EarningsDashboardScreen';
import ReviewsScreen from './screens/shared/ReviewsScreen';
import GroceryReorderScreen from './screens/grocery/GroceryReorderScreen';
import DisputeScreen from './screens/shared/DisputeScreen';
import NotificationsSettingsScreen from './screens/profile/NotificationsSettingsScreen';
import MerchantAddProductScreen from './screens/merchant/MerchantAddProductScreen';
import PackageTrackingScreen from './screens/delivery/PackageTrackingScreen';
import DeleteAccountScreen from './screens/profile/DeleteAccountScreen';
import DriverIncidentScreen from './screens/driver/DriverIncidentScreen';
import PassBenefitsScreen from './screens/subscriptions/PassBenefitsScreen';
import EasyPointsHistoryScreen from './screens/loyalty/EasyPointsHistoryScreen';
import DeliveryScheduleScreen from './screens/delivery/DeliveryScheduleScreen';
import ProviderAvailabilityScreen from './screens/provider/ProviderAvailabilityScreen';
import AdminPromoCreateScreen from './screens/admin/AdminPromoCreateScreen';
import GroceryOrderSuccessScreen from './screens/grocery/GroceryOrderSuccessScreen';
import DriverWithdrawScreen from './screens/driver/DriverWithdrawScreen';
import MerchantPayoutsScreen from './screens/merchant/MerchantPayoutsScreen';
import EmergencyContactScreen from './screens/shared/EmergencyContactScreen';
import AdminLiveStatsScreen from './screens/admin/AdminLiveStatsScreen';
import TaxiActiveRideV2Screen from './screens/taxi/TaxiActiveRideV2Screen';
import ReferralDashboardScreen from './screens/loyalty/ReferralDashboardScreen';
import AdminSupportTicketsDetailScreen from './screens/admin/AdminSupportTicketsDetailScreen';
import NotificationCenterV2Screen from './screens/notifications/NotificationCenterV2Screen';
import WalletTransferScreen from './screens/wallet/WalletTransferScreen';
import DriverNavigationLiveScreen from './screens/driver/DriverNavigationLiveScreen';
import AdminDriverDetailScreen from './screens/admin/AdminDriverDetailScreen';
import MerchantSettingsScreen from './screens/merchant/MerchantSettingsScreen';
import GroceryWishlistScreen from './screens/grocery/GroceryWishlistScreen';
import AdminRefundDetailScreen from './screens/admin/AdminRefundDetailScreen';
import BiometricSetupScreen from './screens/profile/BiometricSetupScreen';
import TaxiSplitFareScreen from './screens/taxi/TaxiSplitFareScreen';
import AdminGeoZonesScreen from './screens/admin/AdminGeoZonesScreen';
import LivreurNavigationScreen from './screens/delivery/LivreurNavigationScreen';
import TwoFactorAuthScreen from './screens/profile/TwoFactorAuthScreen';
import AdminPushCampaignScreen from './screens/admin/AdminPushCampaignScreen';

// Batch 90
import ChatListScreen from './screens/chat/ChatListScreen';
import ProviderHomeScreen from './screens/provider/ProviderHomeScreen';
import AdminFinancialDashboardScreen from './screens/admin/AdminFinancialDashboardScreen';

// Batch 91
import DriverChecklistScreen from './screens/driver/DriverChecklistScreen';
import MerchantLiveOrdersScreen from './screens/merchant/MerchantLiveOrdersScreen';
import AdminVehicleInspectionScreen from './screens/admin/AdminVehicleInspectionScreen';

// Batch 92
import PromoCodesClientScreen from './screens/promo/PromoCodesClientScreen';
import ProviderIncidentScreen from './screens/provider/ProviderIncidentScreen';
import AdminSOSInterventionsScreen from './screens/admin/AdminSOSInterventionsScreen';

// Batch 93
import WalletHistoryScreen from './screens/wallet/WalletHistoryScreen';
import LivreurProfileScreen from './screens/delivery/LivreurProfileScreen';
import AdminEasyPassScreen from './screens/admin/AdminEasyPassScreen';

// Batch 94
import FeedbackScreen from './screens/shared/FeedbackScreen';
import AdminClientDetailScreen from './screens/admin/AdminClientDetailScreen';
import TaxiDriverProfileScreen from './screens/taxi/TaxiDriverProfileScreen';

// Batch 95
import GroceryBrowseScreen from './screens/grocery/GroceryBrowseScreen';
import ProviderEarningsDashboard from './screens/provider/ProviderEarningsDashboard';
import AdminMerchantDetailScreen from './screens/admin/AdminMerchantDetailScreen';

// Batch 96
import PaymentHistoryScreen from './screens/payment/PaymentHistoryScreen';
import SOSDepanneurProfileScreen from './screens/sos/SOSDepanneurProfileScreen';
import AdminDeliveryStatsScreen from './screens/admin/AdminDeliveryStatsScreen';

// Batch 97
import VehicleRegistrationScreen from './screens/profile/VehicleRegistrationScreen';
import DeliveryZoneScreen from './screens/delivery/DeliveryZoneScreen';
import AdminTaxiStatsScreen from './screens/admin/AdminTaxiStatsScreen';

// Batch 98
import PanicButtonScreen from './screens/emergency/PanicButtonScreen';
import AdminSOSStatsScreen from './screens/admin/AdminSOSStatsScreen';
import MerchantReviewsScreen from './screens/merchant/MerchantReviewsScreen';

// Batch 99
import SOSDepanneurMapScreen from './screens/sos/SOSDepanneurMapScreen';
import MerchantMenuEditorScreen from './screens/merchant/MerchantMenuEditorScreen';
import AdminPushNotifScreen from './screens/admin/AdminPushNotifScreen';

// Batch 100
import TaxiScheduleAdvancedScreen from './screens/taxi/TaxiScheduleAdvancedScreen';
import LivreurLiveMapScreen from './screens/delivery/LivreurLiveMapScreen';
import AdminAppSettingsScreen from './screens/admin/AdminAppSettingsScreen';

// Batch 101

// Batch 102
import SecuritySettingsScreen from './screens/profile/SecuritySettingsScreen';

// Batch 103
import ClientRideHistoryScreen from './screens/client/ClientRideHistoryScreen';

// Batch 104
import ClientSavedAddressesScreen from './screens/client/ClientSavedAddressesScreen';

// Batch 105

// Batch 107
import ClientProfileScreen from './screens/profile/ClientProfileScreen';

// Batch 109
import AdminStatsScreen from './screens/admin/AdminStatsScreen';

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
      <Stack.Screen name="TaxiMap" component={TaxiMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderEarnings" component={ProviderEarningsScreen} options={{ headerShown: false }} />

      {/* SOS */}
      <Stack.Screen name="SOSHome" component={SOSHomeScreen} options={{ title: 'SOS Remorquage', headerShown: false }} />
      <Stack.Screen name="SOSRequest" component={SOSRequestScreen} options={{ headerShown: false }} />
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
      <Stack.Screen name="AdminSupport" component={AdminSupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminBroadcast" component={AdminBroadcastScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} options={{ headerShown: false }} />

      {/* Nearby & Schedule */}
      <Stack.Screen name="NearbyProviders" component={NearbyProvidersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiScheduleRide" component={TaxiScheduleRideScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiSchedule" component={TaxiScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QuickTaxi" component={QuickTaxiScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WalletTransactions" component={WalletTransactionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LiveOrderMap" component={LiveOrderMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EasyPass" component={EasyPassScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantOrderDetail" component={MerchantOrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryCheckout" component={GroceryCheckoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderReviews" component={ProviderReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminGeoStats" component={AdminGeoStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TipAndRating" component={TipAndRatingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSystemHealth" component={AdminSystemHealthScreen} options={{ headerShown: false }} />

      {/* KYC Pending */}
      <Stack.Screen name="KYCPending" component={KYCPendingScreen} options={{ headerShown: false }} />

      {/* Referral & Sharing */}
      <Stack.Screen name="Referral" component={ReferralScreen} options={{ title: 'Parrainage' }} />
      <Stack.Screen name="PromoCode" component={PromoCodeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleChecklist" component={VehicleChecklistScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderSchedule" component={ProviderScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderIncome" component={ProviderIncomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddressBook" component={AddressBookScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderCancel" component={OrderCancelScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ShareApp" component={ShareAppScreen} options={{ title: 'Inviter des amis' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Language" component={LanguageScreen} options={{ headerShown: false }} />

      {/* Subscriptions */}
      <Stack.Screen name="BuyPass" component={BuyPassScreen} options={{ title: 'Passer Premium' }} />
      <Stack.Screen name="PassScreen" component={EasyPassScreen} options={{ headerShown: false }} />

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
      <Stack.Screen name="EasyCar" component={EasyCarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EasyLady" component={EasyLadyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverNavigation" component={DriverNavigationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryStoreMap" component={GroceryStoreMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EasyAccess" component={EasyAccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSPrePayment" component={SOSPrePaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReferralLeaderboard" component={ReferralLeaderboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EasyPackage" component={EasyPackageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FlashSale" component={FlashSaleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LiveTraffic" component={LiveTrafficScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EasyCommunity" component={EasyCommunityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EarningsDashboard" component={EarningsDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSHistory" component={SOSHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverChecklist" component={DriverChecklistScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryReorder" component={GroceryReorderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dispute" component={DisputeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantAddProduct" component={MerchantAddProductScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PackageTracking" component={PackageTrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryProductDetail" component={GroceryProductDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverIncident" component={DriverIncidentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PassBenefits" component={PassBenefitsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EasyPointsHistory" component={EasyPointsHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliverySchedule" component={DeliveryScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantAnalytics" component={MerchantAnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderAvailability" component={ProviderAvailabilityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPromoCreate" component={AdminPromoCreateScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryOrderSuccess" component={GroceryOrderSuccessScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="DriverWithdraw" component={DriverWithdrawScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantPayouts" component={MerchantPayoutsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EmergencyContact" component={EmergencyContactScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminLiveStats" component={AdminLiveStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiActiveRideV2" component={TaxiActiveRideV2Screen} options={{ headerShown: false }} />
      <Stack.Screen name="ReferralDashboard" component={ReferralDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSupportTicketsDetail" component={AdminSupportTicketsDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationCenterV2" component={NotificationCenterV2Screen} options={{ headerShown: false }} />
      <Stack.Screen name="WalletTransfer" component={WalletTransferScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverNavigationLive" component={DriverNavigationLiveScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDriverDetail" component={AdminDriverDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantSettings" component={MerchantSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryWishlist" component={GroceryWishlistScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminRefundDetail" component={AdminRefundDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiSplitFare" component={TaxiSplitFareScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminGeoZones" component={AdminGeoZonesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurNavigation" component={LivreurNavigationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPushCampaign" component={AdminPushCampaignScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderHome" component={ProviderHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminFinancialDashboard" component={AdminFinancialDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantLiveOrders" component={MerchantLiveOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminVehicleInspection" component={AdminVehicleInspectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PromoCodesClient" component={PromoCodesClientScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderIncident" component={ProviderIncidentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSOSInterventions" component={AdminSOSInterventionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WalletHistory" component={WalletHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurProfile" component={LivreurProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminEasyPass" component={AdminEasyPassScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminClientDetail" component={AdminClientDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiDriverProfile" component={TaxiDriverProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryBrowse" component={GroceryBrowseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminMerchantDetail" component={AdminMerchantDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSDepanneurProfile" component={SOSDepanneurProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDeliveryStats" component={AdminDeliveryStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleRegistration" component={VehicleRegistrationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryZone" component={DeliveryZoneScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminTaxiStats" component={AdminTaxiStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PanicButton" component={PanicButtonScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSOSStats" component={AdminSOSStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantReviews" component={MerchantReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSDepanneurMap" component={SOSDepanneurMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantMenuEditor" component={MerchantMenuEditorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPushNotif" component={AdminPushNotifScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiScheduleAdvanced" component={TaxiScheduleAdvancedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurLiveMap" component={LivreurLiveMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminAppSettings" component={AdminAppSettingsScreen} options={{ headerShown: false }} />

      {/* Chat */}
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />

      {/* Rating */}
      <Stack.Screen name="Rating" component={RatingScreen} options={{ headerShown: false }} />

      {/* History Detail */}
      <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ headerShown: false }} />

      {/* Provider Onboarding */}
      <Stack.Screen name="ProviderOnboarding" component={ProviderOnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSPreDiagnostic" component={SOSPreDiagnosticScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverHeatmap" component={DriverHeatmapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminCouponGenerator" component={AdminCouponGeneratorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EasyPointsDashboard" component={EasyPointsDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EarningsGoal" component={EarningsGoalScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPushNotification" component={AdminPushNotificationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverDocuments" component={DriverDocumentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminRevenueReport" component={AdminRevenueReportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MultiOrderTracker" component={MultiOrderTrackerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LiveChat" component={LiveChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AvailabilitySchedule" component={AvailabilityScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminBulkActions" component={AdminBulkActionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientOnboarding" component={ClientOnboardingScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="KonnectPayment" component={KonnectPaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MapAddressPicker" component={MapAddressPickerScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="MerchantStats" component={MerchantStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminKYCDetail" component={AdminKYCDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientFavoriteProviders" component={ClientFavoriteProvidersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDisputeDetail" component={AdminDisputeDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurEarnings" component={LivreurEarningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSOSReport" component={AdminSOSReportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientOrderHistoryDetail" component={ClientOrderHistoryDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderOnlineStatus" component={ProviderOnlineStatusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminUserBanHistory" component={AdminUserBanHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryStoreDetail" component={GroceryStoreDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPassManagement" component={AdminPassManagementScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverRideHistory" component={DriverRideHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSOrderDetail" component={SOSOrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminZoneManagement" component={AdminZoneManagementScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderEarningsDashboard" component={ProviderEarningsDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientProfileEdit" component={ClientProfileEditScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminAppConfig" component={AdminAppConfigScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryOrderDetail" component={DeliveryOrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiOrderDetail" component={TaxiOrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPromoDetail" component={AdminPromoDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderRatingDetail" component={ProviderRatingDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WalletTopUp" component={WalletTopUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminUserWallet" component={AdminUserWalletScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminLiveOrders" component={AdminLiveOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderVehicleInfo" component={ProviderVehicleInfoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientSOSHistory" component={ClientSOSHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderDocumentStatus" component={ProviderDocumentStatusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminRevenueDetail" component={AdminRevenueDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryOrderHistory" component={GroceryOrderHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiRideScheduleList" component={TaxiRideScheduleListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminProviderVerification" component={AdminProviderVerificationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantOrdersLive" component={MerchantOrdersLiveScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderWorkSchedule" component={ProviderWorkScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSupportTickets" component={AdminSupportTicketsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EasyRewards" component={EasyRewardsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiSurgeMap" component={TaxiSurgeMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminNotificationCampaigns" component={AdminNotificationCampaignsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientAddressManager" component={ClientAddressManagerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurMap" component={LivreurMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminFinancialReport" component={AdminFinancialReportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSNearbyDepanneurs" component={SOSNearbyDepanneursScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiDriverStats" component={TaxiDriverStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminMapOverview" component={AdminMapOverviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminMap" component={AdminMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryCheckoutSuccess" component={GroceryCheckoutSuccessScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="MerchantInventory" component={MerchantInventoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientRewards" component={ClientRewardsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminZones" component={AdminZonesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminVehicles" component={AdminVehiclesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DepanneurHistory" component={DepanneurHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientFavorites" component={ClientFavoritesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminBanners" component={AdminBannersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderDocuments" component={ProviderDocumentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientAddressMap" component={ClientAddressMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminTransactions" component={AdminTransactionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientTripDetail" component={ClientTripDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantHours" component={MerchantHoursScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiSurgePricing" component={TaxiSurgePricingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientSubscription" component={ClientSubscriptionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantCoupons" component={MerchantCouponsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurZones" component={LivreurZonesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientLanguage" component={ClientLanguageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiDriverOnboarding" component={TaxiDriverOnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryShop" component={GroceryShopScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientEmergency" component={ClientEmergencyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantStaff" component={MerchantStaffScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderInsurance" component={ProviderInsuranceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiDispatch" component={TaxiDispatchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientReferral" component={ClientReferralScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiRatings" component={TaxiRatingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryOrders" component={GroceryOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DepanneurQuote" component={DepanneurQuoteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurTask" component={LivreurTaskScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiEarnings" component={TaxiEarningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientChat" component={ClientChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurHome" component={LivreurHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantMenu" component={MerchantMenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantNotifications" component={MerchantNotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurRatings" component={LivreurRatingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientHome" component={ClientHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DepanneurHome" component={DepanneurHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientOrderDetail" component={ClientOrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiDriverHome" component={TaxiDriverHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSMap" component={SOSMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantQRCode" component={MerchantQRCodeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientSupport" component={ClientSupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientWalletDetail" component={ClientWalletDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantPromotions" component={MerchantPromotionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurBonus" component={LivreurBonusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiScheduleBooking" component={TaxiScheduleBookingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryStoreProfile" component={GroceryStoreProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderGoals" component={ProviderGoalsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientInvoice" component={ClientInvoiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantEarnings" component={MerchantEarningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSRatingDetail" component={SOSRatingDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminLiveDrivers" component={AdminLiveDriversScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientAddressBook" component={ClientAddressBookScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurSchedule" component={LivreurScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminRevenueChart" component={AdminRevenueChartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LegalMentions" component={LegalMentionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDriverPerformance" component={AdminDriverPerformanceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiScheduledTrips" component={TaxiScheduledTripsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientPromoCodes" component={ClientPromoCodesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryReviews" component={GroceryReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderTripHistory" component={ProviderTripHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientLoyalty" component={ClientLoyaltyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientFeedback" component={ClientFeedbackScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantStockAlert" component={MerchantStockAlertScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientOrdersAll" component={ClientOrdersAllScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientMap" component={ClientMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminRevenue" component={AdminRevenueScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurHistory" component={LivreurHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiRating" component={TaxiRatingScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="GroceryOrderTracking" component={GroceryOrderTrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientNotifications" component={ClientNotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DepanneurEarnings" component={DepanneurEarningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverTripHistory" component={DriverTripHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryStore" component={GroceryStoreScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientAddresses" component={ClientAddressesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDrivers" component={AdminDriversScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientWallet" component={ClientWalletDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiHome2" component={TaxiHomeScreen2} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantOrders" component={MerchantOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DepanneurHome2" component={DepanneurHomeScreen2} options={{ headerShown: false }} />
      <Stack.Screen name="AdminLiveMap" component={AdminLiveMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientOrderHistory" component={ClientOrderHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPromotions" component={AdminPromotionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderIncome2" component={ProviderIncomeScreen2} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiTracking2" component={TaxiTrackingScreen2} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="AdminProviders" component={AdminProvidersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminCouponList" component={AdminCouponListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryRating" component={DeliveryRatingScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="TaxiPromo" component={TaxiPromoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminUserSessions" component={AdminUserSessionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryStoreAnalytics" component={GroceryStoreAnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminAppVersion" component={AdminAppVersionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiReceipt" component={TaxiReceiptScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="DeliveryOrderSummary" component={DeliveryOrderSummaryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminProviderPayouts" component={AdminProviderPayoutsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientNotificationPrefs" component={ClientNotificationPrefsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSRating" component={SOSRatingScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="AdminReferralStats" component={AdminReferralStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileSOSHistory" component={ProfileSOSHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiScheduledRides" component={TaxiScheduledRidesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDriverEarnings" component={AdminDriverEarningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryFavorites" component={GroceryFavoritesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientDeliveryHistory" component={ClientDeliveryHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPlatformSettings" component={AdminPlatformSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiOrderSuccess" component={TaxiOrderSuccessScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="TaxiActiveRide" component={TaxiActiveRideScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="AdminEarnings" component={AdminEarningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryOrderConfirm" component={DeliveryOrderConfirmScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="DeliveryLivreurTracking" component={DeliveryLivreurTrackingScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="AdminUsersExport" component={AdminUsersExportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSPayment" component={SOSPaymentScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="ProviderStats" component={ProviderStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryCheckoutReview" component={GroceryCheckoutReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MerchantProfile" component={MerchantProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminRefunds" component={AdminRefundsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiConfirmRide" component={TaxiConfirmRideScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientTripHistory" component={ClientTripHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminServiceConfig" component={AdminServiceConfigScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSLiveTracking" component={SOSLiveTrackingScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="TaxiWaiting" component={TaxiWaitingScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="AdminAuditLog" component={AdminAuditLogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurRating" component={LivreurRatingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDriverVerification" component={AdminDriverVerificationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryOrderDetail" component={GroceryOrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryAddress" component={DeliveryAddressScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminHeatmap" component={AdminHeatmapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderFeedback" component={ProviderFeedbackScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminChatMonitor" component={AdminChatMonitorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSDepanneurDetail" component={SOSDepanneurDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSubscriptions" component={AdminSubscriptionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryRate" component={DeliveryRateScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="TaxiDriverEarnings" component={TaxiDriverEarningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiHomeV2" component={TaxiHomeV2Screen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryHomeV2" component={DeliveryHomeV2Screen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminStatsOverview" component={AdminStatsOverviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiScheduleConfirm" component={TaxiScheduleConfirmScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="AdminDriverIncidents" component={AdminDriverIncidentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GrocerySearch" component={GrocerySearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverAcceptRide" component={DriverAcceptRideScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LivreurAcceptOrder" component={LivreurAcceptOrderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SOSContract" component={SOSContractScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiHistory" component={TaxiHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryOrderHistory" component={DeliveryOrderHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiSearch" component={TaxiSearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DepanneurProfile" component={DepanneurProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Security" component={SecurityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSOS" component={AdminSOSScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TaxiLiveTracking" component={TaxiLiveTrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverStatus" component={DriverStatusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DepanneurStatus" component={DepanneurStatusScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientRideHistory" component={ClientRideHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientSavedAddresses" component={ClientSavedAddressesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ClientProfile" component={ClientProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminStats" component={AdminStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProviderProfileV2" component={ProviderProfileScreen} options={{ headerShown: false }} />
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
      try { connectSocket().catch(() => {}); } catch {}
      setTimeout(() => {
        try { registerForPushNotifications(); } catch {}
      }, 3000);
    } else {
      try { disconnectSocket(); } catch {}
    }
    return () => { try { disconnectSocket(); } catch {} };
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

  if (onboardingDone === null) {
    return (
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="__Loading" component={() => (
            <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: 2 }}>EASY</Text>
              <Text style={{ color: '#D32F2F', fontSize: 26, fontWeight: '900', letterSpacing: 2, marginBottom: 8 }}>WAY</Text>
              <Text style={{ color: '#8E8E9A', fontSize: 11, letterSpacing: 0.5 }}>La super-app tunisienne</Text>
            </View>
          )} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer linking={linking}>
        <StatusBar style="light" />
        {isAuthenticated ? <MainStack /> : <AuthStack onboardingDone={onboardingDone} />}
      </NavigationContainer>
    </ErrorBoundary>
  );
}

async function registerForPushNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
    // Ne pas bloquer sur getExpoPushTokenAsync — peut échouer hors Expo Go
    try {
      const tokenData = await Promise.race([
        Notifications.getExpoPushTokenAsync({ projectId: '028c05e2-49a4-41fd-b364-3e5be6bc7ca1' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]);
      if (tokenData?.data) {
        await AsyncStorage.setItem('fcmToken', tokenData.data).catch(() => {});
        api.post('/api/notifications/register-token', { fcmToken: tokenData.data }).catch(() => {});
      }
    } catch {}
  } catch {}
}
