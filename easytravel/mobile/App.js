import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen           from './src/screens/HomeScreen';
import FlightResultsScreen  from './src/screens/FlightResultsScreen';
import FerryResultsScreen   from './src/screens/FerryResultsScreen';
import FlightDetailScreen   from './src/screens/FlightDetailScreen';
import FerryDetailScreen    from './src/screens/FerryDetailScreen';
import PriceCalendarScreen  from './src/screens/PriceCalendarScreen';
import InspireScreen        from './src/screens/InspireScreen';
import AlertsScreen         from './src/screens/AlertsScreen';
import BookmarksScreen      from './src/screens/BookmarksScreen';

import { registerForPushNotifications } from './src/services/notifications';

const Stack = createNativeStackNavigator();

const NAV_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background:   '#0A1628',
    card:         '#0A1628',
    text:         '#F0F4FF',
    border:       '#1E3050',
    notification: '#2563EB',
    primary:      '#2563EB',
  },
};

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
};

export default function App() {
  useEffect(() => {
    registerForPushNotifications().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={NAV_THEME}>
          <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
            <Stack.Screen name="Home"           component={HomeScreen} />
            <Stack.Screen name="FlightResults"  component={FlightResultsScreen} />
            <Stack.Screen name="FerryResults"   component={FerryResultsScreen} />
            <Stack.Screen name="FlightDetail"   component={FlightDetailScreen} />
            <Stack.Screen name="FerryDetail"    component={FerryDetailScreen} />
            <Stack.Screen name="Calendar"       component={PriceCalendarScreen} />
            <Stack.Screen name="Inspire"        component={InspireScreen} />
            <Stack.Screen name="Alerts"         component={AlertsScreen} />
            <Stack.Screen name="Bookmarks"      component={BookmarksScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
