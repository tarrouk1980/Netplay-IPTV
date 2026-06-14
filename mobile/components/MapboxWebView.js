import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import Constants from 'expo-constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAPBOX_TOKEN = Constants.expoConfig?.extra?.mapboxToken || 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

// Builds a Mapbox Static API URL — just a regular image, no WebView
function buildStaticUrl({ centerCoordinate, zoom, markers, width, height }) {
  const [lng, lat] = centerCoordinate;
  const w = Math.min(Math.round(width || SCREEN_WIDTH), 1280);
  const h = Math.round(height || 220);
  const z = zoom || 13;

  const MARKER_COLORS = ['F5A623', 'E74C3C', '27AE60', '3498DB'];
  const overlays = markers.map((m, i) => {
    const color = (m.color || '#F5A623').replace('#', '');
    const [mLng, mLat] = m.coordinates;
    return `pin-l+${color}(${mLng},${mLat})`;
  }).join(',');

  const base = overlays ? `${overlays}/` : '';
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${base}${lng},${lat},${z}/${w}x${h}@2x?access_token=${MAPBOX_TOKEN}`;
}

export default function MapboxWebView({
  style,
  centerCoordinate = [10.1815, 36.8065],
  zoom = 13,
  markers = [],
  route = null,
  heatmapZones = [],
}) {
  const [imgError, setImgError] = useState(false);
  const containerStyle = [styles.container, style];
  const width = (style?.width) || SCREEN_WIDTH - 32;
  const height = (style?.height) || 220;

  if (imgError) {
    return (
      <View style={[containerStyle, styles.placeholder, { height }]}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.text}>Carte indisponible</Text>
        {markers[0] && (
          <Text style={styles.hint}>
            {markers[0].coordinates[1].toFixed(4)}° N, {markers[0].coordinates[0].toFixed(4)}° E
          </Text>
        )}
      </View>
    );
  }

  const uri = buildStaticUrl({ centerCoordinate, zoom, markers, width, height });

  return (
    <View style={[containerStyle, { height }]}>
      <Image
        source={{ uri }}
        style={{ width: '100%', height }}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 12, backgroundColor: '#1C1C28' },
  placeholder: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2C2C3E', borderRadius: 12,
  },
  icon: { fontSize: 36, marginBottom: 8 },
  text: { color: '#8E8E9A', fontSize: 13, fontWeight: '600' },
  hint: { color: '#4A4A5A', fontSize: 11, marginTop: 4 },
});
