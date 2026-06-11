import { Platform } from 'react-native';

// Production ad unit IDs (replace with real IDs before publishing)
const INTERSTITIAL_UNIT_IDS = {
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX/IIIIIIIIII',
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/JJJJJJJJJJ',
};

/**
 * Show a full-screen interstitial ad before redirecting the user to an
 * airline / ferry booking site.
 *
 * Usage:
 *   import { showInterstitialBeforeBooking } from '../components/InterstitialAdHelper';
 *   showInterstitialBeforeBooking(() => Linking.openURL(bookingUrl));
 *
 * In development mode or when react-native-google-mobile-ads is not installed,
 * the callback is called immediately without showing an ad.
 *
 * @param {() => void} callback  Called after the ad is dismissed (or immediately
 *                               on fallback).
 */
export async function showInterstitialBeforeBooking(callback) {
  // Skip ads in dev mode for a faster developer experience
  if (__DEV__) {
    callback();
    return;
  }

  try {
    const {
      InterstitialAd,
      AdEventType,
      TestIds,
    } = require('react-native-google-mobile-ads');

    const adUnitId = Platform.OS === 'ios'
      ? INTERSTITIAL_UNIT_IDS.ios
      : INTERSTITIAL_UNIT_IDS.android;

    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Wrap ad lifecycle in a promise so we can await it cleanly
    await new Promise((resolve) => {
      // Ad closed by user — proceed to booking
      const unsubscribeClosed = interstitial.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeClosed();
          unsubscribeError();
          resolve();
        },
      );

      // Ad failed to load — proceed without showing anything
      const unsubscribeError = interstitial.addAdEventListener(
        AdEventType.ERROR,
        () => {
          unsubscribeClosed();
          unsubscribeError();
          resolve();
        },
      );

      // Ad loaded successfully — show it immediately
      const unsubscribeLoaded = interstitial.addAdEventListener(
        AdEventType.LOADED,
        () => {
          unsubscribeLoaded();
          interstitial.show();
        },
      );

      interstitial.load();

      // Safety timeout: if nothing happens within 5 s, proceed anyway
      setTimeout(resolve, 5000);
    });

    callback();
  } catch (_) {
    // react-native-google-mobile-ads not available — proceed immediately
    callback();
  }
}
