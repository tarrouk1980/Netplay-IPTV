import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Mapbox from '@rnmapbox/maps';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';
Mapbox.setAccessToken(MAPBOX_TOKEN);

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

  return (
    <View style={[styles.container, style, { height }]}>
      <Mapbox.MapView
        style={StyleSheet.absoluteFillObject}
        styleURL={Mapbox.StyleURL.Dark}
        compassEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        <Mapbox.Camera
          defaultSettings={{
            centerCoordinate,
            zoomLevel: zoom,
          }}
        />

        {/* Marqueurs */}
        {markers.map((m, i) => (
          <Mapbox.PointAnnotation
            key={`marker-${i}`}
            id={`marker-${i}`}
            coordinate={m.coordinates}
          >
            <View style={[styles.markerDot, { backgroundColor: m.color || '#F5A623' }]}>
              <Mapbox.Callout title={m.label || ''} />
            </View>
          </Mapbox.PointAnnotation>
        ))}

        {/* Route polyline */}
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

        {/* Zones heatmap */}
        {heatmapZones.length > 0 && (
          <Mapbox.ShapeSource
            id="heatmap"
            shape={{
              type: 'FeatureCollection',
              features: heatmapZones.map((z, i) => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [z.lng || 10.18, z.lat || 36.81] },
                properties: { color: z.color || '#F5A623' },
              })),
            }}
          >
            <Mapbox.CircleLayer
              id="heatmapCircles"
              style={{
                circleColor: ['get', 'color'],
                circleOpacity: 0.25,
                circleRadius: 60,
                circleStrokeColor: ['get', 'color'],
                circleStrokeWidth: 2,
                circleStrokeOpacity: 0.6,
              }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#1C1C28',
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
