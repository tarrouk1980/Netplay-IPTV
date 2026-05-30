import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const MAPBOX_TOKEN = 'MAPBOX_TOKEN_PLACEHOLDER';

export default function StaticMap({ lat, lng, width = 340, height = 180, zoom = 14 }) {
  if (!lat || !lng) {
    return (
      <View style={[styles.placeholder, { width, height }]}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.text}>Localisation en cours...</Text>
      </View>
    );
  }

  // Mapbox Static Images API
  const url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+F5A623(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`;

  return (
    <View style={{ width, height, borderRadius: 12, overflow: 'hidden' }}>
      <Image
        source={{ uri: url }}
        style={{ width, height }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2C2C3E',
  },
  icon: { fontSize: 32, marginBottom: 8 },
  text: { color: '#8E8E9A', fontSize: 13 },
});
