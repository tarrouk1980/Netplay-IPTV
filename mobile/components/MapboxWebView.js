import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { WebView } from 'react-native-webview';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

/**
 * heatmapZones: Array of { lat, lng, color, radius, label }
 *   OR simple zones without coords (rendered as legend only if no lat/lng).
 */
export default function MapboxWebView({
  style,
  centerCoordinate = [10.1815, 36.8065],
  zoom = 13,
  markers = [],
  route = null,
  heatmapZones = [],
}) {
  const scrollRef = useRef(null);

  const markersJson = JSON.stringify(markers);
  const routeJson = route ? JSON.stringify(route) : 'null';

  // Build heatmap zones with default Tunis coords if none given
  const zonesWithCoords = heatmapZones.map((z, i) => ({
    lat: z.lat || (36.8065 + (i - 1) * 0.03),
    lng: z.lng || (10.1815 + (i - 1) * 0.04),
    color: z.color || '#F5A623',
    radius: z.radius || 800,
    label: z.label || '',
  }));
  const zonesJson = JSON.stringify(zonesWithCoords);

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; touch-action: none; }
  #map { width: 100%; height: 100%; }
  .mapboxgl-ctrl-logo { display: none !important; }
  .marker {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; border: 2px solid white; cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
  mapboxgl.accessToken = '${MAPBOX_TOKEN}';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: ${JSON.stringify(centerCoordinate)},
    zoom: ${zoom},
    dragRotate: false,
    touchZoomRotate: true,
    cooperativeGestures: false,
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

  // ── Markers ───────────────────────────────────────────────────────────────
  const markers = ${markersJson};
  markers.forEach(function(m) {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundColor = m.color || '#F5A623';
    el.textContent = m.label || '📍';
    new mapboxgl.Marker(el).setLngLat(m.coordinates).addTo(map);
  });

  // ── Route polyline ────────────────────────────────────────────────────────
  const route = ${routeJson};
  if (route && route.length > 1) {
    map.on('load', function() {
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: route } }
      });
      map.addLayer({
        id: 'route', type: 'line', source: 'route',
        paint: { 'line-color': '#F5A623', 'line-width': 5, 'line-opacity': 0.9 }
      });
    });
  }

  // ── Heatmap zones (circles) ───────────────────────────────────────────────
  const zones = ${zonesJson};
  if (zones.length > 0) {
    map.on('load', function() {
      const features = zones.map(function(z) {
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [z.lng, z.lat] },
          properties: { color: z.color, radius: z.radius }
        };
      });

      map.addSource('heatmap-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: features }
      });

      map.addLayer({
        id: 'heatmap-fill',
        type: 'circle',
        source: 'heatmap-zones',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.18,
          'circle-radius': { base: 1.75, stops: [[12, 80], [14, 160], [16, 320]] }
        }
      });
      map.addLayer({
        id: 'heatmap-ring',
        type: 'circle',
        source: 'heatmap-zones',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.55,
          'circle-radius': { base: 1.75, stops: [[12, 10], [14, 20], [16, 40]] },
          'circle-stroke-width': 2,
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 0.8
        }
      });
    });
  }
</script>
</body>
</html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        nestedScrollEnabled={false}
        overScrollMode="never"
        onShouldStartLoadWithRequest={() => true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 12 },
  webview: { flex: 1, backgroundColor: '#0A0A0F' },
});
