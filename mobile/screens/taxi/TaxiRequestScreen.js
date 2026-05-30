import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import useTaxiStore from '../../store/taxiStore';
import FareEstimateCard from '../../components/FareEstimateCard';
import StaticMap from '../../components/StaticMap';
import api from '../../services/api';

// TODO: Replace with Mapbox SDK — mapbox.com/pricing — free tier: 25,000 loads/month
// TODO: Heatmap layer — uses aggregated Redis demand data — no extra cost with Redis

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  header: '#F5A623',
  headerText: '#0A0A0F',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  accent: '#F5A623',
  accentLight: '#F5A623',
  border: '#2C2C3E',
  inputBg: '#252535',
};

const TAXI_LABELS = {
  NORMAL: { emoji: '🚕', label: 'EasyTaxy', color: '#F5A623' },
  EASYLADY: { emoji: '🚺', label: 'EasyLady', color: '#E91E8C' },
  EASYACCESS: { emoji: '♿', label: 'EasyAccess', color: '#2196F3' },
};

export default function TaxiRequestScreen({ route, navigation }) {
  const { taxiType = 'NORMAL' } = route.params || {};
  const taxiInfo = TAXI_LABELS[taxiType];

  const { requestTaxi, isSearching, nearbyDrivers } = useTaxiStore();

  const [origin, setOrigin] = useState(null);
  const [originAddress, setOriginAddress] = useState('Localisation en cours…');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState('A'); // 'A' = Taximètre EASYWAY, 'B' = Mise en relation
  const [fareEstimate, setFareEstimate] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  // Detect origin via expo-location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setOriginAddress('Permission de localisation refusée');
          setLoadingLocation(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setOrigin({ lat: loc.coords.latitude, lng: loc.coords.longitude });

        // Reverse geocode for human-readable address
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo && geo.length > 0) {
          const g = geo[0];
          const parts = [g.street, g.district, g.city].filter(Boolean);
          setOriginAddress(parts.join(', ') || 'Position détectée');
        } else {
          setOriginAddress(`${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
        }
      } catch (err) {
        setOriginAddress('Impossible de détecter la position');
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  // Fetch fare estimate when mode=A and origin known
  useEffect(() => {
    if (mode === 'A' && origin) {
      fetchEstimate();
    } else {
      setFareEstimate(null);
    }
  }, [mode, origin]);

  const fetchEstimate = useCallback(async () => {
    if (!origin) return;
    setLoadingEstimate(true);
    try {
      const body = {
        originLat: origin.lat,
        originLng: origin.lng,
        mode: 'A',
        // Destination not required for estimate — uses straight-line to dummy point if missing
        // In production: parse destination text to coords via Mapbox Geocoding API
      };

      const response = await api.post('/taxi/estimate', body);
      setFareEstimate(response.data);
    } catch (err) {
      console.warn('[TaxiRequest] Estimate error:', err?.response?.data || err.message);
    } finally {
      setLoadingEstimate(false);
    }
  }, [origin]);

  const handleDestinationChange = (text) => {
    setDestination(text);
    // Mapbox autocomplete triggers at 3 characters to minimise API calls
    // (free tier: 100,000 requests/month)
    if (text.length >= 3) {
      // TODO: Replace with Mapbox SDK — mapbox.com/pricing — free tier: 25,000 loads/month
      // fetchMapboxSuggestions(text)
    }
  };

  const handleSearch = async () => {
    if (!origin) {
      Alert.alert('Position requise', 'Veuillez activer la localisation.');
      return;
    }

    try {
      const order = await requestTaxi(
        { lat: origin.lat, lng: origin.lng, address: originAddress },
        { address: destination },
        mode,
        taxiType
      );
      navigation.navigate('TaxiTracking', { orderId: order.id });
    } catch (err) {
      Alert.alert('Erreur', err?.message || 'Impossible de créer la demande de taxi.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.header} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {taxiInfo.emoji} {taxiInfo.label}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Static map */}
        <View style={styles.mapContainer}>
          <StaticMap lat={origin?.lat} lng={origin?.lng} width={340} height={180} />
        </View>

        {/* Origin */}
        <View style={styles.section}>
          <Text style={styles.label}>📍 Point de départ</Text>
          <View style={styles.inputRow}>
            {loadingLocation
              ? <ActivityIndicator size="small" color={COLORS.header} />
              : <Text style={styles.originText}>{originAddress}</Text>}
          </View>
        </View>

        {/* Destination */}
        <View style={styles.section}>
          <Text style={styles.label}>🏁 Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre destination…"
            placeholderTextColor={COLORS.textMuted}
            value={destination}
            onChangeText={handleDestinationChange}
            returnKeyType="done"
          />
          <Text style={styles.inputHint}>Autocomplétion dès 3 lettres — Mapbox</Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.section}>
          <Text style={styles.label}>Mode de tarification</Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'A' && styles.modeBtnActive]}
              onPress={() => setMode('A')}
              activeOpacity={0.85}
            >
              <Text style={[styles.modeBtnText, mode === 'A' && styles.modeBtnTextActive]}>
                🧮 Taximètre EASYWAY
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'B' && styles.modeBtnActive]}
              onPress={() => setMode('B')}
              activeOpacity={0.85}
            >
              <Text style={[styles.modeBtnText, mode === 'B' && styles.modeBtnTextActive]}>
                🤝 Mise en relation
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fare estimate (Mode A) */}
        {mode === 'A' && (
          <View style={styles.section}>
            {loadingEstimate
              ? <ActivityIndicator size="large" color={COLORS.accent} />
              : fareEstimate
                ? <FareEstimateCard estimate={fareEstimate} />
                : null}
          </View>
        )}

        {/* Mode B message */}
        {mode === 'B' && (
          <View style={[styles.section, styles.modeBCard]}>
            <Text style={styles.modeBIcon}>🔵</Text>
            <Text style={styles.modeBText}>
              Le chauffeur déclenchera son compteur physique homologué
            </Text>
            <Text style={styles.modeBSubtext}>
              Le tarif sera celui affiché sur le compteur officiel du véhicule,
              conformément à la réglementation tunisienne.
            </Text>
          </View>
        )}

        {/* Nearby drivers */}
        <View style={styles.nearbyRow}>
          <Text style={styles.nearbyText}>
            🚕 {nearbyDrivers.length} chauffeur{nearbyDrivers.length !== 1 ? 's' : ''} disponible{nearbyDrivers.length !== 1 ? 's' : ''} à proximité
          </Text>
        </View>

        {/* Legal disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Prix indicatif, peut varier selon trafic réel
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isSearching || loadingLocation}
          activeOpacity={0.85}
        >
          {isSearching
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.searchButtonText}>🔍 Chercher un taxi</Text>}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { alignItems: 'center', paddingTop: 16, paddingHorizontal: 20 },
  header: {
    backgroundColor: COLORS.header,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: { padding: 4 },
  backArrow: { fontSize: 32, color: COLORS.headerText, lineHeight: 32, marginTop: -4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: COLORS.headerText },
  headerSpacer: { width: 32 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 12, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  originText: { color: COLORS.text, fontSize: 15 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  inputHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, marginLeft: 4 },
  modeToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '22',
  },
  modeBtnText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500', textAlign: 'center' },
  modeBtnTextActive: { color: COLORS.accent, fontWeight: '700' },
  modeBCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  modeBIcon: { fontSize: 32 },
  modeBText: { fontSize: 15, color: COLORS.text, fontWeight: '600', textAlign: 'center' },
  modeBSubtext: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  nearbyRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  nearbyText: { fontSize: 13, color: COLORS.text },
  disclaimer: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#2C1A00',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F5A62344',
  },
  disclaimerText: { fontSize: 12, color: '#F5A623', textAlign: 'center' },
  searchButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchButtonDisabled: { opacity: 0.6 },
  searchButtonText: { color: '#0A0A0F', fontSize: 16, fontWeight: '700' },
});
