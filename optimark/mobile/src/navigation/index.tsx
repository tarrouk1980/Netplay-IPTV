import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { useAuth } from "../contexts/AuthContext";

import HomeScreen from "../screens/buyer/HomeScreen";
import ProductDetailScreen from "../screens/buyer/ProductDetailScreen";
import CartScreen from "../screens/buyer/CartScreen";
import OrdersScreen from "../screens/buyer/OrdersScreen";
import OrderDetailScreen from "../screens/buyer/OrderDetailScreen";
import ProfileScreen from "../screens/buyer/ProfileScreen";
import FlashSalesScreen from "../screens/buyer/FlashSalesScreen";
import MessagesScreen from "../screens/buyer/MessagesScreen";
import AuthScreen from "../screens/AuthScreen";
import SellerDashboardScreen from "../screens/seller/SellerDashboardScreen";
import SellerProductsScreen from "../screens/seller/SellerProductsScreen";
import SellerProductFormScreen from "../screens/seller/SellerProductFormScreen";
import SellerOrdersScreen from "../screens/seller/SellerOrdersScreen";
import SellerFlashSalesScreen from "../screens/seller/SellerFlashSalesScreen";
import SellerCouponsScreen from "../screens/seller/SellerCouponsScreen";
import NotificationsScreen from "../screens/buyer/NotificationsScreen";
import SellerLiveScreen from "../screens/seller/SellerLiveScreen";
import SearchScreen from "../screens/buyer/SearchScreen";
import ServiceDetailScreen from "../screens/buyer/ServiceDetailScreen";
import LiveViewScreen from "../screens/buyer/LiveViewScreen";
import SellerAnalyticsScreen from "../screens/seller/SellerAnalyticsScreen";
import SellerServicesScreen from "../screens/seller/SellerServicesScreen";
import SellerSubscriptionScreen from "../screens/seller/SellerSubscriptionScreen";
import SellerReturnsScreen from "../screens/seller/SellerReturnsScreen";
import SellerStoreEditorScreen from "../screens/seller/SellerStoreEditorScreen";
import SellerQuestionsScreen from "../screens/seller/SellerQuestionsScreen";
import CompareScreen from "../screens/buyer/CompareScreen";
import SellerPayoutsScreen from "../screens/seller/SellerPayoutsScreen";
import SellerReviewsScreen from "../screens/seller/SellerReviewsScreen";
import SellerEarningsScreen from "../screens/seller/SellerEarningsScreen";
import BundlesScreen from "../screens/buyer/BundlesScreen";
import SellerInventoryScreen from "../screens/seller/SellerInventoryScreen";
import SellerAdsScreen from "../screens/seller/SellerAdsScreen";
import SellerPerformanceScreen from "../screens/seller/SellerPerformanceScreen";
import SellerCollectionsScreen from "../screens/seller/SellerCollectionsScreen";
import SellerFaqScreen from "../screens/seller/SellerFaqScreen";
import FollowedSellersScreen from "../screens/buyer/FollowedSellersScreen";
import MyReviewsScreen from "../screens/buyer/MyReviewsScreen";
import NotifPreferencesScreen from "../screens/buyer/NotifPreferencesScreen";
import SellerBulkPriceScreen from "../screens/seller/SellerBulkPriceScreen";
import RecentlyViewedScreen from "../screens/buyer/RecentlyViewedScreen";
import SellerBundlesScreen from "../screens/seller/SellerBundlesScreen";
import GiftCardsScreen from "../screens/buyer/GiftCardsScreen";
import PriceAlertsScreen from "../screens/buyer/PriceAlertsScreen";
import LoyaltyScreen from "../screens/buyer/LoyaltyScreen";
import WishlistScreen from "../screens/buyer/WishlistScreen";
import ReferralScreen from "../screens/buyer/ReferralScreen";
import AdminScreen from "../screens/AdminScreen";
import FavoritesScreen from "../screens/buyer/FavoritesScreen";
import SellerStoreScreen from "../screens/buyer/SellerStoreScreen";
import { useCart } from "../contexts/CartContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ROSE = "#9f1239";

function BuyerTabs() {
  const { items } = useCart();
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: ROSE,
      tabBarInactiveTintColor: "#94a3b8",
      tabBarStyle: { borderTopWidth: 1, borderTopColor: "#f1f5f9", height: 60, paddingBottom: 8 },
      headerStyle: { backgroundColor: "#fff" },
      headerTitleStyle: { fontWeight: "800", color: "#1e293b" },
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Accueil", tabBarLabel: "Accueil", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text> }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{
        title: "Panier", tabBarLabel: "Panier",
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🛒</Text>,
        tabBarBadge: items.length > 0 ? items.length : undefined,
      }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "Commandes", tabBarLabel: "Commandes", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📦</Text> }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: "Messages", tabBarLabel: "Messages", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💬</Text> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil", tabBarLabel: "Profil", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }} />
    </Tab.Navigator>
  );
}

function SellerTabs() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: ROSE,
      tabBarInactiveTintColor: "#94a3b8",
      tabBarStyle: { borderTopWidth: 1, borderTopColor: "#f1f5f9", height: 60, paddingBottom: 8 },
      headerStyle: { backgroundColor: "#9f1239" },
      headerTitleStyle: { fontWeight: "800", color: "#fff" },
      headerTintColor: "#fff",
    }}>
      <Tab.Screen name="SellerDashboard" component={SellerDashboardScreen} options={{ title: "Dashboard", tabBarLabel: "Dashboard", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text> }} />
      <Tab.Screen name="SellerProducts" component={SellerProductsScreen} options={{ title: "Mes produits", tabBarLabel: "Produits", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text> }} />
      <Tab.Screen name="SellerOrders" component={SellerOrdersScreen} options={{ title: "Commandes", tabBarLabel: "Commandes", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📬</Text> }} />
      <Tab.Screen name="SellerAnalytics" component={SellerAnalyticsScreen} options={{ title: "Analytiques", tabBarLabel: "Stats", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text> }} />
      <Tab.Screen name="SellerMessages" component={MessagesScreen} options={{ title: "Messages", tabBarLabel: "Messages", tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💬</Text> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#fff" }, headerTitleStyle: { fontWeight: "800" }, headerTintColor: ROSE }}>
        <Stack.Screen name="BuyerTab" component={BuyerTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Produit" }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Commande" }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: "Connexion" }} />
        <Stack.Screen name="SellerTab" component={SellerTabs} options={{ headerShown: false }} />
        <Stack.Screen name="FlashSales" component={FlashSalesScreen} options={{ title: "⚡ Ventes Flash" }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
        <Stack.Screen name="LiveView" component={LiveViewScreen} options={{ title: "Live", headerStyle: { backgroundColor: "#1e293b" }, headerTintColor: "#fff", headerTitleStyle: { color: "#fff" } }} />
        <Stack.Screen name="SellerFlashSalesStack" component={SellerFlashSalesScreen} options={{ title: "⚡ Ventes Flash" }} />
        <Stack.Screen name="SellerCouponsStack" component={SellerCouponsScreen} options={{ title: "🏷️ Codes promo" }} />
        <Stack.Screen name="SellerLiveStack" component={SellerLiveScreen} options={{ title: "🔴 Live Commerce" }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Recherche" }} />
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: "Service" }} />
        <Stack.Screen name="SellerServicesStack" component={SellerServicesScreen} options={{ title: "💼 Mes services" }} />
        <Stack.Screen name="SellerAddProduct" component={SellerProductFormScreen} options={{ title: "Nouveau produit" }} />
        <Stack.Screen name="SellerEditProduct" component={SellerProductFormScreen} options={{ title: "Modifier le produit" }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "❤️ Mes favoris" }} />
        <Stack.Screen name="SellerStore" component={SellerStoreScreen} options={{ title: "Boutique" }} />
        <Stack.Screen name="SellerSubscription" component={SellerSubscriptionScreen} options={{ title: "💎 Plans & Tarifs" }} />
        <Stack.Screen name="SellerReturnsStack" component={SellerReturnsScreen} options={{ title: "↩️ Retours clients" }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: "🛡️ Admin Panel", headerStyle: { backgroundColor: "#1e293b" }, headerTintColor: "#fff", headerTitleStyle: { color: "#fff" } }} />
        <Stack.Screen name="SellerStoreEditor" component={SellerStoreEditorScreen} options={{ title: "🏪 Ma boutique" }} />
        <Stack.Screen name="SellerQuestionsStack" component={SellerQuestionsScreen} options={{ title: "❓ Questions clients" }} />
        <Stack.Screen name="SellerPayoutsStack" component={SellerPayoutsScreen} options={{ title: "💸 Virements" }} />
        <Stack.Screen name="SellerReviewsStack" component={SellerReviewsScreen} options={{ title: "⭐ Avis clients" }} />
        <Stack.Screen name="SellerEarningsStack" component={SellerEarningsScreen} options={{ title: "💰 Revenus" }} />
        <Stack.Screen name="Compare" component={CompareScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GiftCards" component={GiftCardsScreen} options={{ title: "🎁 Cartes cadeaux" }} />
        <Stack.Screen name="PriceAlerts" component={PriceAlertsScreen} options={{ title: "🔔 Alertes de prix" }} />
        <Stack.Screen name="SellerBundlesStack" component={SellerBundlesScreen} options={{ title: "📦 Mes bundles" }} />
        <Stack.Screen name="SellerAds" component={SellerAdsScreen} options={{ title: "📣 Publicité" }} />
        <Stack.Screen name="Bundles" component={BundlesScreen} options={{ title: "🎁 Offres groupées" }} />
        <Stack.Screen name="SellerInventory" component={SellerInventoryScreen} options={{ title: "📦 Inventaire" }} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: "📋 Mes listes" }} />
        <Stack.Screen name="Referral" component={ReferralScreen} options={{ title: "🤝 Parrainage" }} />
        <Stack.Screen name="Loyalty" component={LoyaltyScreen} options={{ title: "⭐ Points fidélité" }} />
        <Stack.Screen name="SellerPerformance" component={SellerPerformanceScreen} options={{ title: "🏆 Mon score vendeur" }} />
        <Stack.Screen name="SellerCollections" component={SellerCollectionsScreen} options={{ title: "🗂️ Mes collections" }} />
        <Stack.Screen name="SellerFaq" component={SellerFaqScreen} options={{ title: "❓ FAQ boutique" }} />
        <Stack.Screen name="FollowedSellers" component={FollowedSellersScreen} options={{ title: "🔔 Boutiques suivies" }} />
        <Stack.Screen name="MyReviews" component={MyReviewsScreen} options={{ title: "⭐ Mes avis" }} />
        <Stack.Screen name="NotifPreferences" component={NotifPreferencesScreen} options={{ title: "⚙️ Préférences notifs" }} />
        <Stack.Screen name="SellerBulkPrice" component={SellerBulkPriceScreen} options={{ title: "💲 Prix en masse" }} />
        <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} options={{ title: "🕐 Récemment vus" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
