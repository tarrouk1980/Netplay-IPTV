module.exports = {
  expo: {
    name: 'EasyHotels - Comparer les Prix',
    slug: 'easytravel',
    owner: 'tarekeasytravel',
    version: '2.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    backgroundColor: '#0A0A0F',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#004E89',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.easyhotels.maghreb',
      scheme: 'easyhotels',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0A0A0F',
      },
      package: 'com.easyhotels.maghreb',
      scheme: 'easyhotels',
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      minSdkVersion: 24,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
      ],
    },
    updates: {
      url: 'https://u.expo.dev/e2f575c0-e061-411e-9652-a28101376272',
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    plugins: [
      'expo-notifications',
      'expo-location',
    ],
    extra: {
      mapboxToken: process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ',
      eas: {
        projectId: 'e2f575c0-e061-411e-9652-a28101376272',
      },
    },
  },
};
