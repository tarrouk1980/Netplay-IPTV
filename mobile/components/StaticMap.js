import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import Constants from 'expo-constants';

const MAPBOX_TOKEN = Constants.expoConfig?.extra?.mapboxToken || '';
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function StaticMap({
  lat,
  lng,
  width = SCREEN_WIDTH - 32,
  height = 200,
  zoom = 14,
  style,
}) {
  if (!lat || !lng) {
    return (
      <View style={[styles.placeholder, { width, height }, style]}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.text}>Localisation en cours...</Text>
      </View>
    );
  }

  if (!MAPBOX_TOKEN) {
    return (
      <View style={[styles.placeholder, { width, height }, style]}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.text}>{lat.toFixed(5)}, {lng.toFixed(5)}</Text>
        <Text style={styles.hint}>Token Mapbox non configuré</Text>
      </View>
    );
  }

  const url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+D32F2F(${lng},${lat})/${lng},${lat},${zoom},0/${Math.round(width)}x${Math.round(height)}@2x?access_token=${MAPBOX_TOKEN}`;

  return (
    <View style={[{ width, height, borderRadius: 14, overflow: 'hidden' }, style]}>
      <Image
        source={{ uri: url }}
        style={{ width, height }}
        resizeMode="cover"
      />
      <View style={styles.pin}>
        <Text style={{ fontSize: 22 }}>📍</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  icon: { fontSize: 36, marginBottom: 8 },
  text: { color: '#8E8E9A', fontSize: 13, fontWeight: '600' },
  hint: { color: '#4A4A5A', fontSize: 11, marginTop: 4 },
  pin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -11,
    marginTop: -22,
  },
});
