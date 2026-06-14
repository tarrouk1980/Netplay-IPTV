import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Mapbox from '@rnmapbox/maps';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MapboxWebView({
  style,
  centerCoordinate = [10.1815, 36.8065],
  zoom = 13,
  markers = [],
  route = null,
  heatmapZones = [],
}) {
  const height = style?.height || 220;
  const width = style?.width || SCREEN_WIDTH;

  return (
    <View style={{ width, height, overflow: 'hidden', borderRadius: 12 }}>
      <Mapbox.MapView
        style={{ width, height }}
        styleURL={Mapbox.StyleURL.Dark}
        compassEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Mapbox.Camera
          centerCoordinate={centerCoordinate}
          zoomLevel={zoom}
          animationDuration={0}
        />

        {markers.map((m, i) => (
          <Mapbox.PointAnnotation
            key={`m${i}`}
            id={`m${i}`}
            coordinate={m.coordinates}
          >
            <View style={[styles.dot, { backgroundColor: m.color || '#F5A623' }]} />
          </Mapbox.PointAnnotation>
        ))}

        {route && route.length > 1 && (
          <Mapbox.ShapeSource
            id="route"
            shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: route } }}
          >
            <Mapbox.LineLayer
              id="routeLine"
              style={{ lineColor: '#F5A623', lineWidth: 5, lineOpacity: 0.9 }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#FFF',
  },
});
