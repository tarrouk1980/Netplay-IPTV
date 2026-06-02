import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2A2A2A',
  primary: '#FF6F00',
  primaryLight: '#FF8F00',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  border: '#333333',
  success: '#4CAF50',
  warning: '#FFC107',
};

const QUICK_DESTINATIONS = [
  { id: '1', label: 'Maison', icon: '🏠', lat: 36.8065, lng: 10.1815 },
  { id: '2', label: 'Bureau', icon: '🏢', lat: 36.8190, lng: 10.1658 },
  { id: '3', label: 'Aéroport', icon: '✈️', lat: 36.8510, lng: 10.2272 },
  { id: '4', label: 'Gare', icon: '🚉', lat: 36.7992, lng: 10.1761 },
];

const VEHICLE_TYPES = [
  { id: '1', type: 'Standard', icon: '🚗', baseFare: 3.0, ratePerKm: 0.5, waitTime: 3, available: 8 },
  { id: '2', type: 'Confort', icon: '🚙', baseFare: 5.0, ratePerKm: 0.8, waitTime: 5, available: 4 },
  { id: '3', type: 'VAN', icon: '🚐', baseFare: 7.0, ratePerKm: 1.0, waitTime: 8, available: 2 },
];

const USER_LAT = 36.8065;
const USER_LNG = 10.1815;

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimatePrice(vehicle, distanceKm) {
  return (vehicle.baseFare + distanceKm * vehicle.ratePerKm).toFixed(2);
}

export default function TaxiHomeV2Screen({ navigation }) {
  const [destination, setDestination] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_TYPES[0]);
  const [distance, setDistance] = useState(0);
  const totalAvailable = VEHICLE_TYPES.reduce((sum, v) => sum + v.available, 0);

  useEffect(() => {
    if (selectedDestination) {
      const d = calculateDistance(
        USER_LAT,
        USER_LNG,
        selectedDestination.lat,
        selectedDestination.lng
      );
      setDistance(d);
    }
  }, [selectedDestination]);

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+FF6F00(${USER_LNG},${USER_LAT})/${USER_LNG},${USER_LAT},13,0/400x200@2x?access_token=pk.placeholder`;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Taxi EasyWay</Text>
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />
            <Text style={styles.availableText}>{totalAvailable} chauffeurs disponibles</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Où allez-vous ?"
            placeholderTextColor={COLORS.textMuted}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <View style={styles.mapContainer}>
          <Image
            source={{ uri: mapUrl }}
            style={styles.map}
            resizeMode="cover"
          />
          <View style={styles.mapPin}>
            <Text style={styles.mapPinIcon}>📍</Text>
          </View>
          <View style={styles.mapOverlay}>
            <Text style={styles.mapLabel}>Votre position</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Destinations rapides</Text>
        <View style={styles.quickDestinations}>
          {QUICK_DESTINATIONS.map((dest) => (
            <TouchableOpacity
              key={dest.id}
              style={[
                styles.quickDestBtn,
                selectedDestination?.id === dest.id && styles.quickDestBtnActive,
              ]}
              onPress={() => {
                setSelectedDestination(dest);
                setDestination(dest.label);
              }}
            >
              <Text style={styles.quickDestIcon}>{dest.icon}</Text>
              <Text
                style={[
                  styles.quickDestLabel,
                  selectedDestination?.id === dest.id && styles.quickDestLabelActive,
                ]}
              >
                {dest.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedDestination && (
          <View style={styles.distanceInfo}>
            <Text style={styles.distanceText}>
              Distance estimée : <Text style={styles.distanceValue}>{distance.toFixed(1)} km</Text>
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Type de véhicule</Text>
        {VEHICLE_TYPES.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={[
              styles.vehicleCard,
              selectedVehicle.id === vehicle.id && styles.vehicleCardActive,
            ]}
            onPress={() => setSelectedVehicle(vehicle)}
          >
            <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleType}>{vehicle.type}</Text>
              <Text style={styles.vehicleWait}>⏱ {vehicle.waitTime} min</Text>
              <Text style={styles.vehicleAvailable}>{vehicle.available} disponibles</Text>
            </View>
            <View style={styles.vehiclePrice}>
              <Text style={styles.vehiclePriceLabel}>À partir de</Text>
              <Text style={styles.vehiclePriceValue}>
                {selectedDestination
                  ? estimatePrice(vehicle, distance)
                  : vehicle.baseFare.toFixed(2)}{' '}
                TND
              </Text>
              {selectedDestination && (
                <Text style={styles.vehiclePriceEstimate}>estimé</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {selectedDestination && (
          <View style={styles.priceSummary}>
            <Text style={styles.priceSummaryLabel}>Prix estimé — {selectedVehicle.type}</Text>
            <Text style={styles.priceSummaryValue}>
              {estimatePrice(selectedVehicle, distance)} TND
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.commandBtn, !selectedDestination && styles.commandBtnDisabled]}
          disabled={!selectedDestination}
          onPress={() => {}}
        >
          <Text style={styles.commandBtnText}>
            {selectedDestination ? `Commander un ${selectedVehicle.type}` : 'Choisir une destination'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  availableText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: COLORS.text,
    fontSize: 16,
  },
  mapContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 180,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPin: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -12,
  },
  mapPinIcon: {
    fontSize: 24,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mapLabel: {
    color: COLORS.text,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  quickDestinations: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  quickDestBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  quickDestBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#2A1800',
  },
  quickDestIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickDestLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  quickDestLabelActive: {
    color: COLORS.primary,
  },
  distanceInfo: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
  },
  distanceText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  distanceValue: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  vehicleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#1A1200',
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  vehicleWait: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  vehicleAvailable: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
  },
  vehiclePrice: {
    alignItems: 'flex-end',
  },
  vehiclePriceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  vehiclePriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  vehiclePriceEstimate: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceSummaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  priceSummaryValue: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  commandBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  commandBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  commandBtnText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
});
