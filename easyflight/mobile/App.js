import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen          from './src/screens/HomeScreen';
import FlightResultsScreen from './src/screens/FlightResultsScreen';
import FerryResultsScreen  from './src/screens/FerryResultsScreen';
import PriceCalendarScreen from './src/screens/PriceCalendarScreen';
import InspireScreen       from './src/screens/InspireScreen';
import AlertsScreen        from './src/screens/AlertsScreen';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{ dark: true, colors: { background: '#0A1628', card: '#0A1628', text: '#F0F4FF', border: '#1E3050', notification: '#2563EB', primary: '#2563EB' } }}
        >
          <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
            <Stack.Screen name="Home"          component={HomeScreen} />
            <Stack.Screen name="FlightResults" component={FlightResultsScreen} />
            <Stack.Screen name="FerryResults"  component={FerryResultsScreen} />
            <Stack.Screen name="Calendar"      component={PriceCalendarScreen} />
            <Stack.Screen name="Inspire"       component={InspireScreen} />
            <Stack.Screen name="Alerts"        component={AlertsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
