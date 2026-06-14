import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapboxWebView({
  style,
  centerCoordinate = [10.1815, 36.8065],
  zoom = 13,
  markers = [],
  route = null,
  heatmapZones = [],
}) {
  const markersJson = JSON.stringify(markers);
  const routeJson = route ? JSON.stringify(route) : 'null';
  const zonesWithCoords = heatmapZones.map((z, i) => ({
    lat: z.lat || (36.8065 + (i - 1) * 0.03),
    lng: z.lng || (10.1815 + (i - 1) * 0.04),
    color: z.color || '#F5A623',
    radius: z.radius || 800,
    label: z.label || '',
  }));
  const zonesJson = JSON.stringify(zonesWithCoords);
  const center = `[${centerCoordinate[1]}, ${centerCoordinate[0]}]`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; background:#1a1a2e; }
  .leaflet-control-attribution { display:none !important; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl:true, attributionControl:false }).setView(${center}, ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  var markers = ${markersJson};
  markers.forEach(function(m) {
    var icon = L.divIcon({
      html: '<div style="font-size:22px;line-height:1;">' + (m.label || '📍') + '</div>',
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
    L.marker([m.coordinates[1], m.coordinates[0]], { icon: icon }).addTo(map);
  });

  var route = ${routeJson};
  if (route && route.length > 1) {
    var latlngs = route.map(function(c) { return [c[1], c[0]]; });
    L.polyline(latlngs, { color: '#F5A623', weight: 5, opacity: 0.9 }).addTo(map);
  }

  var zones = ${zonesJson};
  zones.forEach(function(z) {
    L.circle([z.lat, z.lng], {
      color: z.color,
      fillColor: z.color,
      fillOpacity: 0.18,
      opacity: 0.55,
      radius: z.radius || 800,
      weight: 2,
    }).addTo(map);
  });
</script>
</body>
</html>`;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html, baseUrl: 'https://unpkg.com' }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        nestedScrollEnabled={false}
        overScrollMode="never"
        onShouldStartLoadWithRequest={() => true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 12 },
  webview: { flex: 1, backgroundColor: '#1a1a2e' },
});
