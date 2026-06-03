import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

MapboxGL.setAccessToken(MAPBOX_TOKEN);

export default function MapboxMap({
  style,
  centerCoordinate = [10.1815, 36.8065], // Tunis default
  zoom = 13,
  markers = [], // [{ id, coordinates: [lng, lat], color, label }]
  route = null, // array of [lng, lat] coordinates for a route line
  onPress,
}) {
  return (
    <MapboxGL.MapView
      style={[styles.map, style]}
      styleURL={MapboxGL.StyleURL.Street}
      onPress={onPress}
    >
      <MapboxGL.Camera
        zoomLevel={zoom}
        centerCoordinate={centerCoordinate}
        animationMode="flyTo"
        animationDuration={1000}
      />

      {markers.map((marker) => (
        <MapboxGL.PointAnnotation
          key={marker.id}
          id={marker.id}
          coordinate={marker.coordinates}
        >
          <View style={[styles.marker, { backgroundColor: marker.color || '#F5A623' }]}>
            <Text style={styles.markerText}>{marker.label || '📍'}</Text>
          </View>
        </MapboxGL.PointAnnotation>
      ))}

      {route && route.length > 1 && (
        <MapboxGL.ShapeSource
          id="route"
          shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: route } }}
        >
          <MapboxGL.LineLayer
            id="routeLine"
            style={{ lineColor: '#F5A623', lineWidth: 4, lineOpacity: 0.9 }}
          />
        </MapboxGL.ShapeSource>
      )}
    </MapboxGL.MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerText: { fontSize: 16 },
});
