module.exports = {
  expo: {
    name: 'EASYWAY',
    slug: 'easyway',
    owner: 'tarekclubiste',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    backgroundColor: '#0A0A0F',
    splash: { image: './assets/splash.png', backgroundColor: '#0A0A0F' },
    assetBundlePatterns: ['**/*'],
    ios: { supportsTablet: false, bundleIdentifier: 'com.easyway.app', scheme: 'easyway' },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0A0A0F',
      },
      package: 'com.easyway.app',
      scheme: 'easyway',
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
      url: 'https://u.expo.dev/028c05e2-49a4-41fd-b364-3e5be6bc7ca1',
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
      'expo-av',
      ['@rnmapbox/maps', { RNMapboxMapsVersion: '11.0.0', RNMapboxMapsDownloadToken: 'sk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHhoY2Q5dTA4ejgycnIyZ25oMmU1ZTQifQ.AhHhtw_JNEhjY46ditVsSg' }],
    ],
    extra: {
      mapboxToken: process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ',
      eas: {
        projectId: '028c05e2-49a4-41fd-b364-3e5be6bc7ca1',
      },
    },
  },
};
