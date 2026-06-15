import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MapboxWebView({
  style,
  centerCoordinate = [10.1815, 36.8065],
  zoom = 13,
  markers = [],
}) {
  const height = style?.height || 220;
  const width = style?.width || SCREEN_WIDTH;
  const [lng, lat] = centerCoordinate;

  // Use OSM embed URL — loads as a real URL, not inline HTML, so tiles always work
  const delta = zoom >= 14 ? 0.005 : zoom >= 12 ? 0.02 : 0.05;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const uri = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        source={{ uri }}
        style={{ width, height }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        scrollEnabled={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 12, backgroundColor: '#1C1C28' },
});
