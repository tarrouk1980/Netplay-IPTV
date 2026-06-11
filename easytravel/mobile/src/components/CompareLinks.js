import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { COLORS } from '../theme/colors';

const buildUrls = (origin, dest, date, passengers) => {
  const o = origin.toUpperCase();
  const d = dest.toUpperCase();
  const oLower = origin.toLowerCase();
  const dLower = dest.toLowerCase();
  // YYMMDD for Skyscanner (e.g. 2025-07-15 → 250715)
  const skyscannerDate = date.replace(/-/g, '').slice(2);

  return [
    {
      key: 'skyscanner',
      label: 'Skyscanner',
      bg: '#00b3d9',
      color: '#FFFFFF',
      url: `https://www.skyscanner.es/transporte/vuelos/${oLower}/${dLower}/${skyscannerDate}/`,
    },
    {
      key: 'kayak',
      label: 'Kayak',
      bg: '#ff690f',
      color: '#FFFFFF',
      url: `https://www.kayak.es/flights/${o}-${d}/${date}/${passengers}adults`,
    },
    {
      key: 'google',
      label: 'Google Flights',
      bg: '#4285F4',
      color: '#FFFFFF',
      url: `https://www.google.com/travel/flights?q=Vuelos+${o}+${d}+${date}`,
    },
    {
      key: 'ryanair',
      label: 'Ryanair',
      bg: '#073590',
      color: '#FFFFFF',
      url: `https://www.ryanair.com/es/es/trip/flights/select?adults=${passengers}&dateOut=${date}&originIata=${o}&destinationIata=${d}&isReturn=false`,
    },
  ];
};

export default function CompareLinks({ origin, dest, date, passengers = 1 }) {
  if (!origin || !dest || !date) return null;

  const links = buildUrls(origin, dest, date, passengers);

  const handlePress = (url) => {
    Linking.openURL(url).catch(() => {
      // Silently fail if URL cannot be opened
    });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Comparer sur :</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {links.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.button, { backgroundColor: item.bg }]}
            onPress={() => handlePress(item.url)}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: item.color }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  label: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  button: {
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
