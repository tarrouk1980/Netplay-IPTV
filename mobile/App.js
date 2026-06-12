import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HotelOnboardingScreen from './screens/hotels/HotelOnboardingScreen';
import HotelSearchScreen from './screens/hotels/HotelSearchScreen';
import HotelSearchScreenFR from './screens/hotels/HotelSearchScreenFR';
import HotelSearchScreenES from './screens/hotels/HotelSearchScreenES';
import HotelSearchScreenAR from './screens/hotels/HotelSearchScreenAR';
import HotelResultsScreen from './screens/hotels/HotelResultsScreen';
import HotelDetailScreen from './screens/hotels/HotelDetailScreen';
import HotelFavoritesScreen from './screens/hotels/HotelFavoritesScreen';
import HotelMapScreen from './screens/hotels/HotelMapScreen';
import HotelCompareScreen from './screens/hotels/HotelCompareScreen';
import PriceCalendarScreen from './screens/hotels/PriceCalendarScreen';
import FlashDealsScreen from './screens/hotels/FlashDealsScreen';
import TripPlannerScreen from './screens/hotels/TripPlannerScreen';
import PriceAlertScreen from './screens/hotels/PriceAlertScreen';
import RecentlyViewedScreen from './screens/hotels/RecentlyViewedScreen';
import BookingRedirectScreen from './screens/hotels/BookingRedirectScreen';
import MaghrebMapScreen from './screens/hotels/MaghrebMapScreen';
import CurrencyConverterScreen from './screens/hotels/CurrencyConverterScreen';
import CulturalFiltersScreen from './screens/hotels/CulturalFiltersScreen';
import CountrySelectScreen from './screens/hotels/CountrySelectScreen';
import HotelChatbotScreen from './screens/hotels/HotelChatbotScreen';
import LoyaltyScreen from './screens/hotels/LoyaltyScreen';
import ReferralScreen from './screens/hotels/ReferralScreen';
import EasyHotelsProScreen from './screens/hotels/EasyHotelsProScreen';
import HotelManagerScreen from './screens/hotels/HotelManagerScreen';
import NotificationsPermissionScreen from './screens/hotels/NotificationsPermissionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="HotelOnboarding"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="HotelOnboarding" component={HotelOnboardingScreen} />
          <Stack.Screen name="HotelSearch" component={HotelSearchScreen} />
          <Stack.Screen name="HotelSearchFR" component={HotelSearchScreenFR} />
          <Stack.Screen name="HotelSearchES" component={HotelSearchScreenES} />
          <Stack.Screen name="HotelSearchAR" component={HotelSearchScreenAR} />
          <Stack.Screen name="HotelResults" component={HotelResultsScreen} />
          <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
          <Stack.Screen name="HotelFavorites" component={HotelFavoritesScreen} />
          <Stack.Screen name="HotelMap" component={HotelMapScreen} />
          <Stack.Screen name="HotelCompare" component={HotelCompareScreen} />
          <Stack.Screen name="PriceCalendar" component={PriceCalendarScreen} />
          <Stack.Screen name="FlashDeals" component={FlashDealsScreen} />
          <Stack.Screen name="TripPlanner" component={TripPlannerScreen} />
          <Stack.Screen name="PriceAlert" component={PriceAlertScreen} />
          <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
          <Stack.Screen name="BookingRedirect" component={BookingRedirectScreen} />
          <Stack.Screen name="MaghrebMap" component={MaghrebMapScreen} />
          <Stack.Screen name="CurrencyConverter" component={CurrencyConverterScreen} />
          <Stack.Screen name="CulturalFilters" component={CulturalFiltersScreen} />
          <Stack.Screen name="CountrySelect" component={CountrySelectScreen} />
          <Stack.Screen name="HotelChatbot" component={HotelChatbotScreen} />
          <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
          <Stack.Screen name="Referral" component={ReferralScreen} />
          <Stack.Screen name="EasyHotelsPro" component={EasyHotelsProScreen} />
          <Stack.Screen name="HotelManager" component={HotelManagerScreen} />
          <Stack.Screen name="NotificationsPermission" component={NotificationsPermissionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
