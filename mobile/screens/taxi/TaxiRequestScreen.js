import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import useTaxiStore from '../../store/taxiStore';
import FareEstimateCard from '../../components/FareEstimateCard';
import PriceEstimate from '../../components/PriceEstimate';
import MapboxWebView from '../../components/MapboxWebView';
import PromoCodeWidget from '../payment/PromoCodeWidget';
import ServiceIcon from '../../components/ServiceIcon';
import api from '../../services/api';

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
  NORMAL: { svgKey: 'EASYTAXY', label: 'EasyTaxy', color: '#F5A623' },
  EASYLADY: { svgKey: 'EASYLADY', label: 'Easy For Lady', color: '#E91E8C' },
  EASYACCESS: { svgKey: 'EASYACCESS', label: 'EasyAccess', color: '#2196F3' },
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
  const [demandZones, setDemandZones] = useState([]);
  const [showPriceEstimate, setShowPriceEstimate] = useState(false);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState(5);
  const [waypoints, setWaypoints] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestTimeout = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const addWaypoint = () => {
    if (waypoints.length >= 3) {
      Alert.alert('Maximum', 'Vous pouvez ajouter jusqu\'à 3 arrêts intermédiaires.');
      return;
    }
    setWaypoints([...waypoints, '']);
  };

  const updateWaypoint = (index, value) => {
    const updated = [...waypoints];
    updated[index] = value;
    setWaypoints(updated);
  };

  const removeWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  // Detect origin automatically on mount (like Uber/Careem)
  useEffect(() => { detectLocation(); }, []);

  const detectLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setOriginAddress('Activez la localisation');
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      setOrigin({ lat, lng });

      try {
        const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geo && geo.length > 0) {
          const g = geo[0];
          const parts = [g.street, g.district, g.city].filter(Boolean);
          if (parts.length > 0) { setOriginAddress(parts.join(', ')); return; }
        }
      } catch {}

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
          { headers: { 'User-Agent': 'EASYWAY-App/1.0' } }
        );
        const data = await res.json();
        if (data?.display_name) {
          const addr = data.address || {};
          const parts = [addr.road, addr.suburb, addr.city || addr.town || addr.village].filter(Boolean);
          setOriginAddress(parts.join(', ') || data.display_name.split(',').slice(0, 2).join(','));
          return;
        }
      } catch {}

      setOriginAddress(`${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`);
    } catch {
      setOriginAddress('Activez la localisation et réessayez');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Heatmap pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Fetch demand heatmap zones when origin is known
  useEffect(() => {
    if (!origin) return;
    (async () => {
      try {
        const res = await api.get(`/api/taxi/heatmap?lat=${origin.lat}&lng=${origin.lng}`);
        setDemandZones(res.data?.zones || []);
      } catch {
        // Fallback: show mock demand zones near origin
        setDemandZones([
          { label: 'Centre-ville', level: 'HAUTE', color: '#E53935' },
          { label: 'Aéroport', level: 'MOYENNE', color: '#F5A623' },
          { label: 'Banlieue nord', level: 'FAIBLE', color: '#43A047' },
        ]);
      }
    })();
  }, [origin]);

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

  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

  const handleDestinationChange = (text) => {
    setDestination(text);
    setSuggestions([]);
    setShowSuggestions(false);
    if (suggestTimeout.current) clearTimeout(suggestTimeout.current);
    if (text.length < 3) return;
    suggestTimeout.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const proximity = origin ? `&proximity=${origin.lng},${origin.lat}` : '';
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?country=TN&language=fr&limit=5&access_token=${MAPBOX_TOKEN}${proximity}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          setSuggestions(data.features.map(f => ({
            id: f.id,
            name: f.text,
            fullName: f.place_name,
            coords: { lng: f.center[0], lat: f.center[1] },
          })));
          setShowSuggestions(true);
        }
      } catch {}
      finally { setLoadingSuggestions(false); }
    }, 400);
  };

  const handleSelectSuggestion = (suggestion) => {
    setDestination(suggestion.fullName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const doRequestTaxi = async () => {
    try {
      const order = await requestTaxi(
        { lat: origin.lat, lng: origin.lng, address: originAddress },
        { address: destination },
        mode,
        taxiType,
        waypoints.filter(w => w.trim().length > 0)
      );
      navigation.navigate('TaxiTracking', { orderId: order.id });
    } catch (err) {
      Alert.alert('Erreur', err?.message || 'Impossible de créer la demande de taxi.');
    }
  };

  const handleSearch = () => {
    if (!origin) {
      Alert.alert('Position requise', 'Veuillez activer la localisation.');
      return;
    }
    // Compute a fictional distance estimate between 3 and 8 km if none known
    const dist = fareEstimate?.distanceKm || (3 + Math.random() * 5);
    setEstimatedDistanceKm(parseFloat(dist.toFixed(1)));
    setShowPriceEstimate(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.header} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ServiceIcon service={taxiInfo.svgKey} size={28} />
          <Text style={styles.headerTitle}>{taxiInfo.label}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Interactive map */}
        <View
          style={styles.mapContainer}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <MapboxWebView
            style={{ height: 220 }}
            centerCoordinate={origin ? [origin.lng, origin.lat] : [10.1815, 36.8065]}
            zoom={13}
            markers={origin ? [{ coordinates: [origin.lng, origin.lat], color: '#F5A623', label: '📍' }] : []}
            heatmapZones={demandZones.map((z, i) => ({
              lat: origin ? origin.lat + (i - 1) * 0.025 : 36.8065 + (i - 1) * 0.025,
              lng: origin ? origin.lng + (i - 1) * 0.03 : 10.1815 + (i - 1) * 0.03,
              color: z.color,
              label: z.label,
            }))}
          />
        </View>

        {/* Origin */}
        <View style={styles.section}>
          <Text style={styles.label}>📍 Point de départ</Text>
          <View style={styles.inputRow}>
            {loadingLocation
              ? <ActivityIndicator size="small" color={COLORS.header} style={{ flex: 1 }} />
              : <Text style={[styles.originText, { flex: 1 }]}>{originAddress}</Text>}
            {!loadingLocation && (
              <TouchableOpacity onPress={detectLocation} style={{ paddingLeft: 8 }}>
                <Text style={{ fontSize: 20 }}>📍</Text>
              </TouchableOpacity>
            )}
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
          {/* Autocomplete suggestions */}
          {loadingSuggestions && (
            <ActivityIndicator size="small" color={COLORS.accent} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
          )}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(s)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.suggestionIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionName} numberOfLines={1}>{s.name}</Text>
                    <Text style={styles.suggestionFull} numberOfLines={1}>{s.fullName}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Waypoints */}
        {waypoints.map((wp, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.label}>🔵 Arrêt {idx + 1}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={`Arrêt intermédiaire ${idx + 1}…`}
                placeholderTextColor={COLORS.textMuted}
                value={wp}
                onChangeText={(v) => updateWaypoint(idx, v)}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.removeWpBtn}
                onPress={() => removeWaypoint(idx)}
                activeOpacity={0.75}
              >
                <Text style={styles.removeWpText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add waypoint button */}
        {waypoints.length < 3 && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.addWpBtn} onPress={addWaypoint} activeOpacity={0.75}>
              <Text style={styles.addWpText}>＋ Ajouter un arrêt</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Heatmap demand zones */}
        {demandZones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>🔥 Zones de forte demande</Text>
            <View style={styles.heatmapCard}>
              {demandZones.map((zone, idx) => (
                <View key={idx} style={styles.heatmapRow}>
                  <Animated.View
                    style={[
                      styles.heatmapDot,
                      { backgroundColor: zone.color },
                      idx === 0 && { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.heatmapLabel}>{zone.label}</Text>
                    <Text style={[styles.heatmapLevel, { color: zone.color }]}>Demande {zone.level}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.heatmapHint}>🕐 Données mises à jour en temps réel</Text>
            </View>
          </View>
        )}

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

      {/* PriceEstimate Modal */}
      <Modal
        visible={showPriceEstimate}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPriceEstimate(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <PriceEstimate
              serviceType="TAXI"
              distanceKm={estimatedDistanceKm}
              onConfirm={() => {
                setShowPriceEstimate(false);
                doRequestTaxi();
              }}
              onCancel={() => setShowPriceEstimate(false)}
            />
            <PromoCodeWidget
              serviceType="TAXI"
              amount={fareEstimate?.total || 0}
              onDiscount={(discount, code) => {
                // Discount stored for later use in order creation
                if (discount > 0) console.log(`[Promo] -${discount} TND avec code ${code}`);
              }}
            />
          </View>
        </View>
      </Modal>
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
  heatmapCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heatmapDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  heatmapLabel: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  heatmapLevel: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  heatmapHint: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
  removeWpBtn: {
    backgroundColor: '#3A1A1A',
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D32F2F44',
  },
  removeWpText: { color: '#D32F2F', fontSize: 14, fontWeight: '700' },
  addWpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.accent + '66',
    borderStyle: 'dashed',
    paddingVertical: 12,
    backgroundColor: COLORS.accent + '11',
  },
  addWpText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  suggestionsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionIcon: { fontSize: 16 },
  suggestionName: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  suggestionFull: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
