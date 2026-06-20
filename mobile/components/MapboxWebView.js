import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { LEAFLET_JS, LEAFLET_CSS } from '../assets/leaflet/leafletAssets';

const SCREEN_WIDTH = Dimensions.get('window').width;

function buildHtml(lat, lng, zoom, markers) {
  const markerJs = markers
    .map((m) => {
      const [mlng, mlat] = m.coordinates;
      const label = (m.label || '').replace(/'/g, "\\'");
      return `L.marker([${mlat}, ${mlng}]).addTo(map)${label ? `.bindPopup('${label}')` : ''};`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>${LEAFLET_CSS}</style>
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #1C1C28; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>${LEAFLET_JS}</script>
  <script>
    L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
    var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${lat}, ${lng}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);
    ${markerJs}
  </script>
</body>
</html>`;
}

export default function MapboxWebView({
  style,
  centerCoordinate = [10.1815, 36.8065],
  zoom = 13,
  markers = [],
}) {
  const height = style?.height || 220;
  const width = style?.width || SCREEN_WIDTH;
  const [lng, lat] = centerCoordinate;
  const webviewRef = useRef(null);

  const html = buildHtml(lat, lng, zoom, markers);

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        ref={webviewRef}
        source={{ html, baseUrl: 'https://easyway.tn/' }}
        style={{ width, height, backgroundColor: '#1C1C28' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 12, backgroundColor: '#1C1C28' },
});
