import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MapViewNative, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from 'react-native-maps';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#D32F2F',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
  blue: '#2196F3',
};

/**
 * MapView — composant carte interactive pour EASYWAY
 *
 * Props:
 *  - userLocation   { lat, lng }               — marqueur utilisateur (bleu)
 *  - driverLocation { lat, lng }               — marqueur chauffeur (emoji 🚗)
 *  - destination    { lat, lng, label }         — marqueur destination (emoji 📍)
 *  - route          [{ lat, lng }, ...]         — polyline du trajet
 *  - height         number (défaut 250)         — hauteur de la carte
 *  - style          StyleProp<ViewStyle>        — style supplémentaire
 */
export default function MapView({
  userLocation,
  driverLocation,
  destination,
  route,
  height = 250,
  style,
}) {
  const mapRef = useRef(null);

  // Calcule la région initiale selon les props disponibles
  const getInitialRegion = () => {
    const center = userLocation || driverLocation || destination;
    if (!center) {
      // Tunis par défaut
      return { latitude: 36.8065, longitude: 10.1815, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    }
    return {
      latitude: center.lat,
      longitude: center.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  };

  const handleCenter = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.animateToRegion(
      {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500
    );
  };

  const polylineCoords =
    route && route.length > 1
      ? route.map((p) => ({ latitude: p.lat, longitude: p.lng }))
      : null;

  return (
    <View style={[styles.wrapper, { height }, style]}>
      <MapViewNative
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Marqueur utilisateur — cercle bleu pulsant simulé */}
        {userLocation && (
          <Marker
            coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userMarkerOuter}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Marqueur chauffeur — emoji 🚗 sur fond blanc */}
        {driverLocation && (
          <Marker
            coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.driverMarker}>
              <Text style={styles.driverEmoji}>🚗</Text>
            </View>
          </Marker>
        )}

        {/* Marqueur destination — emoji 📍 */}
        {destination && (
          <Marker
            coordinate={{ latitude: destination.lat, longitude: destination.lng }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.destMarker}>
              <Text style={styles.destEmoji}>📍</Text>
              {destination.label ? (
                <View style={styles.destLabel}>
                  <Text style={styles.destLabelText} numberOfLines={1}>
                    {destination.label}
                  </Text>
                </View>
              ) : null}
            </View>
          </Marker>
        )}

        {/* Polyline route chauffeur → destination */}
        {polylineCoords && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={COLORS.accent}
            strokeWidth={3}
          />
        )}
      </MapViewNative>

      {/* Bouton Centrer */}
      {userLocation && (
        <TouchableOpacity
          style={styles.centerBtn}
          onPress={handleCenter}
          activeOpacity={0.8}
        >
          <Text style={styles.centerBtnText}>◎</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.surface,
  },
  map: {
    flex: 1,
  },

  // Marqueur utilisateur
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F344',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.blue,
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.blue,
  },

  // Marqueur chauffeur
  driverMarker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  driverEmoji: { fontSize: 20 },

  // Marqueur destination
  destMarker: { alignItems: 'center' },
  destEmoji: { fontSize: 28 },
  destLabel: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    maxWidth: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  destLabelText: { fontSize: 10, color: COLORS.text, fontWeight: '600' },

  // Bouton centrer
  centerBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  centerBtnText: { fontSize: 18, color: COLORS.blue },
});
