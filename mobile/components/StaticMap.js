import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Free OpenStreetMap static tile (no API key needed)
function osmStaticUrl(lat, lng, zoom, w, h) {
  // Use tile.openstreetmap.org to build a static image via a proxy-free trick:
  // We use a free static map service that wraps OSM tiles
  const z = zoom || 15;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${z}&size=${Math.round(w)}x${Math.round(h)}&markers=${lat},${lng},red-pushpin`;
}

export default function StaticMap({ lat, lng, width = SCREEN_WIDTH - 32, height = 200, zoom = 15, style }) {
  const [imgError, setImgError] = useState(false);

  if (!lat || !lng) {
    return (
      <View style={[styles.placeholder, { width, height }, style]}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.text}>Localisation en cours...</Text>
      </View>
    );
  }

  if (imgError) {
    // Fallback élégant si le service OSM est indisponible
    return (
      <View style={[styles.placeholder, { width, height }, style]}>
        <View style={styles.pinContainer}>
          <View style={styles.pinCircle} />
          <View style={styles.pinStem} />
        </View>
        <Text style={[styles.text, { marginTop: 12 }]}>
          {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
        </Text>
        <Text style={styles.hint}>Position GPS enregistrée</Text>
      </View>
    );
  }

  return (
    <View style={[{ width, height, borderRadius: 14, overflow: 'hidden' }, style]}>
      <Image
        source={{ uri: osmStaticUrl(lat, lng, zoom, width, height) }}
        style={{ width, height }}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
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
  pinContainer: { alignItems: 'center' },
  pinCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#D32F2F', borderWidth: 3, borderColor: '#FF6659' },
  pinStem: { width: 3, height: 16, backgroundColor: '#D32F2F', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
});
