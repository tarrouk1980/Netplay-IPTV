import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StaticMap from './StaticMap';

// Composant carte — utilise StaticMap (Mapbox static API, pas de clé Google requise)
// react-native-maps sera réintégré quand la clé Google Maps Android sera configurée
export default function MapView({
  userLocation,
  driverLocation,
  destination,
  height = 250,
  style,
}) {
  const activeLocation = driverLocation || userLocation;

  return (
    <View style={[styles.container, { height }, style]}>
      {activeLocation ? (
        <>
          <StaticMap
            lat={activeLocation.lat}
            lng={activeLocation.lng}
            height={height}
            zoom={15}
          />
          <View style={styles.legend}>
            {userLocation && (
              <View style={styles.legendItem}>
                <View style={styles.dotBlue} />
                <Text style={styles.legendText}>Vous</Text>
              </View>
            )}
            {driverLocation && (
              <View style={styles.legendItem}>
                <Text style={{ fontSize: 14 }}>🚗</Text>
                <Text style={styles.legendText}>Chauffeur</Text>
              </View>
            )}
            {destination && (
              <View style={styles.legendItem}>
                <Text style={{ fontSize: 14 }}>📍</Text>
                <Text style={styles.legendText}>{destination.label || 'Destination'}</Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View style={[styles.placeholder, { height }]}>
          <Text style={styles.placeholderText}>📍 En attente du GPS...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, overflow: 'hidden', position: 'relative' },
  legend: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(10,10,15,0.85)',
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotBlue: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3498DB' },
  legendText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  placeholder: {
    backgroundColor: '#1C1C28',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  placeholderText: { color: '#8E8E9A', fontSize: 13 },
});
