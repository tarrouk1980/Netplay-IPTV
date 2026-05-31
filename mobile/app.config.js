module.exports = {
  expo: {
    name: 'EASYWAY',
    slug: 'easyway',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    backgroundColor: '#0A0A0F',
    splash: { image: './assets/splash.png', backgroundColor: '#0A0A0F' },
    assetBundlePatterns: ['**/*'],
    ios: { supportsTablet: false, bundleIdentifier: 'com.easyway.app' },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0A0A0F',
      },
      package: 'com.easyway.app',
    },
    plugins: ['expo-notifications', 'expo-location'],
    extra: {
      mapboxToken: process.env.MAPBOX_TOKEN || '',
      eas: {
        projectId: '028c05e2-49a4-41fd-b364-3e5be6bc7ca1',
      },
    },
  },
};
