import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, FlatList, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C',
};

const DEFAULT_REGION = { latitude: 36.8189, longitude: 10.1658, latitudeDelta: 0.05, longitudeDelta: 0.05 };

const QUICK_PLACES = [
  { label: 'Aéroport Tunis-Carthage', lat: 36.8510, lng: 10.2272 },
  { label: 'Gare de Tunis', lat: 36.7988, lng: 10.1825 },
  { label: 'La Marsa Plage', lat: 36.8877, lng: 10.3261 },
  { label: 'Centre-ville Sfax', lat: 34.7406, lng: 10.7603 },
  { label: 'Sousse Médina', lat: 35.8256, lng: 10.6369 },
];

async function reverseGeocode(lat, lng) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=fr&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    return data.features?.[0]?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function forwardGeocode(query) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=TN&language=fr&limit=6`;
    const res = await fetch(url);
    const data = await res.json();
    return data.features || [];
  } catch {
    return [];
  }
}

export default function MapAddressPickerScreen({ route, navigation }) {
  const { onSelect, title = 'Choisir une adresse', initialLat, initialLng } = route.params || {};

  const [region, setRegion] = useState({
    latitude: initialLat || DEFAULT_REGION.latitude,
    longitude: initialLng || DEFAULT_REGION.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [pin, setPin] = useState({ lat: initialLat || DEFAULT_REGION.latitude, lng: initialLng || DEFAULT_REGION.longitude });
  const [address, setAddress] = useState('');
  const [resolving, setResolving] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef(null);
  const debounceRef = useRef(null);

  const resolvePin = useCallback(async (lat, lng) => {
    setResolving(true);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    setResolving(false);
  }, []);

  useEffect(() => { resolvePin(pin.lat, pin.lng); }, []);

  const handleRegionChange = (reg) => {
    setPin({ lat: reg.latitude, lng: reg.longitude });
  };

  const handleRegionChangeComplete = (reg) => {
    setPin({ lat: reg.latitude, lng: reg.longitude });
    resolvePin(reg.latitude, reg.longitude);
  };

  const handleSearch = (text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    if (text.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await forwardGeocode(text);
      setSuggestions(results);
      setSearching(false);
    }, 400);
  };

  const pickSuggestion = (feature) => {
    const [lng, lat] = feature.center;
    const newRegion = { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setRegion(newRegion);
    setPin({ lat, lng });
    setAddress(feature.place_name);
    setQuery(feature.place_name);
    setSuggestions([]);
    setShowSearch(false);
    mapRef.current?.animateToRegion(newRegion, 500);
  };

  const handleMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée'); return; }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude } = loc.coords;
    const newRegion = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setRegion(newRegion);
    setPin({ lat: latitude, lng: longitude });
    mapRef.current?.animateToRegion(newRegion, 500);
    resolvePin(latitude, longitude);
  };

  const handleConfirm = () => {
    if (!address) { Alert.alert('Impossible de confirmer', 'Adresse non résolue.'); return; }
    if (onSelect) onSelect({ address, lat: pin.lat, lng: pin.lng });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType="standard"
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* Center pin */}
      <View style={styles.pinContainer} pointerEvents="none">
        <Text style={styles.pinEmoji}>📍</Text>
        <View style={styles.pinShadow} />
      </View>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchBox} onPress={() => setShowSearch(true)}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={[styles.searchPlaceholder, query && { color: COLORS.white }]} numberOfLines={1}>
              {query || 'Rechercher une adresse…'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locBtn} onPress={handleMyLocation}>
            <Text style={{ fontSize: 18 }}>🎯</Text>
          </TouchableOpacity>
        </View>

        {/* Quick places */}
        {!showSearch && (
          <FlatList
            horizontal
            data={QUICK_PLACES}
            keyExtractor={i => i.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => {
                  const r = { latitude: item.lat, longitude: item.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };
                  mapRef.current?.animateToRegion(r, 500);
                  setPin({ lat: item.lat, lng: item.lng });
                  resolvePin(item.lat, item.lng);
                }}
              >
                <Text style={styles.quickChipText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Search overlay */}
        {showSearch && (
          <View style={styles.searchOverlay}>
            <View style={styles.searchInputRow}>
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={handleSearch}
                placeholder="Entrez une adresse en Tunisie…"
                placeholderTextColor={COLORS.muted}
                autoFocus
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => { setShowSearch(false); setSuggestions([]); }}>
                <Text style={styles.closeSearch}>✕</Text>
              </TouchableOpacity>
            </View>
            {searching && <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 8 }} />}
            {suggestions.map(f => (
              <TouchableOpacity key={f.id} style={styles.suggestion} onPress={() => pickSuggestion(f)}>
                <Text style={styles.suggestionText} numberOfLines={2}>{f.place_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SafeAreaView>

      {/* Bottom confirmation bar */}
      <SafeAreaView style={styles.bottomBar}>
        <View style={styles.addressRow}>
          {resolving ? (
            <ActivityIndicator color={COLORS.accent} size="small" />
          ) : (
            <Text style={styles.addressText} numberOfLines={2}>{address || 'Déplacez la carte pour choisir'}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, (!address || resolving) && { opacity: 0.5 }]}
          onPress={handleConfirm}
          disabled={!address || resolving}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>✅ Confirmer cette adresse</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  pinContainer: {
    position: 'absolute', top: '50%', left: '50%',
    marginLeft: -18, marginTop: -44,
    alignItems: 'center',
  },
  pinEmoji: { fontSize: 36 },
  pinShadow: { width: 10, height: 4, backgroundColor: '#00000040', borderRadius: 5, marginTop: -2 },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
  },
  topRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center' },
  backText: { color: COLORS.white, fontSize: 24 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#000000CC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { color: COLORS.muted, fontSize: 14, flex: 1 },
  locBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center' },
  quickRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 6 },
  quickChip: {
    backgroundColor: '#000000CC', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: COLORS.border,
  },
  quickChipText: { color: COLORS.white, fontSize: 12 },
  searchOverlay: {
    backgroundColor: '#000000EE', marginHorizontal: 12, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  searchInputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  closeSearch: { color: COLORS.muted, fontSize: 18 },
  suggestion: { paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  suggestionText: { color: COLORS.white, fontSize: 13 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#000000EE', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  addressRow: { minHeight: 40, justifyContent: 'center', marginBottom: 12 },
  addressText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  confirmBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 8,
  },
  confirmBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
