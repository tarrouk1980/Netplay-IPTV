import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

export default function MapboxWebView({
  style,
  centerCoordinate = [10.1815, 36.8065],
  zoom = 13,
  markers = [],
  route = null,
}) {
  const markersJson = JSON.stringify(markers);
  const routeJson = route ? JSON.stringify(route) : 'null';

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
  body { width: 100vw; height: 100vh; overflow: hidden; }
  #map { width: 100%; height: 100%; }
  .marker { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; cursor: pointer; }
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
    zoom: ${zoom}
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  const markers = ${markersJson};
  markers.forEach(function(m) {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundColor = m.color || '#F5A623';
    el.textContent = m.label || '📍';
    new mapboxgl.Marker(el).setLngLat(m.coordinates).addTo(map);
  });

  const route = ${routeJson};
  if (route && route.length > 1) {
    map.on('load', function() {
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: route } }
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#F5A623', 'line-width': 4, 'line-opacity': 0.9 }
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 12 },
  webview: { flex: 1 },
});
