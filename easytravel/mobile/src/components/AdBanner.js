import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { admob } from './admob';

// Real AdMob SDK if enabled in ./admob.js, otherwise placeholder is used.
const BannerAd = admob?.BannerAd;
const BannerAdSize = admob?.BannerAdSize;
const TestIds = admob?.TestIds;

// Production ad unit IDs (replace with real IDs before publishing)
const AD_UNIT_IDS = {
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',
};

const PLACEHOLDER_ADS = [
  '🏨 Hôtel à Casablanca dès 35€ • Booking.com',
  '🚗 Location voiture à Marrakech • Rentalcars.com',
  '💳 Carte Revolut — Sans frais à l\'étranger',
  '🏖 Séjour Djerba 7 nuits dès 299€ • Voyages-sncf.com',
  '✈ Assurance voyage Maroc • AXA Travel',
];

const AD_SIZES = {
  banner: { height: 52 },
  largeBanner: { height: 90 },
};

function PlaceholderBanner({ size = 'banner' }) {
  // Pick a random ad from the pool (stable per render via useMemo)
  const adText = useMemo(
    () => PLACEHOLDER_ADS[Math.floor(Math.random() * PLACEHOLDER_ADS.length)],
    [],
  );

  const height = AD_SIZES[size]?.height ?? 52;

  return (
    <View style={[styles.placeholder, { height }]}>
      <Text style={styles.label}>PUBLICITÉ</Text>
      <Text style={styles.adText} numberOfLines={1}>
        {adText}
      </Text>
    </View>
  );
}

export default function AdBanner({ style, size = 'banner' }) {
  // If the real SDK loaded, render a live BannerAd
  if (BannerAd && BannerAdSize && TestIds) {
    const adUnitId = __DEV__
      ? TestIds.BANNER
      : Platform.OS === 'ios'
      ? AD_UNIT_IDS.ios
      : AD_UNIT_IDS.android;

    const admobSize =
      size === 'largeBanner' ? BannerAdSize.LARGE_BANNER : BannerAdSize.BANNER;

    return (
      <View style={[styles.wrapper, style]}>
        <BannerAd
          unitId={adUnitId}
          size={admobSize}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    );
  }

  // Fallback: placeholder banner
  return (
    <View style={[styles.wrapper, style]}>
      <PlaceholderBanner size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  placeholder: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  label: {
    position: 'absolute',
    top: 3,
    left: 8,
    fontSize: 9,
    letterSpacing: 0.8,
    color: COLORS.subtle,
    textTransform: 'uppercase',
  },
  adText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
  },
});
