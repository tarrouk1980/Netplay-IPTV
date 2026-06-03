import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxWebView from '../../components/MapboxWebView';
import * as Location from 'expo-location';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', purple: '#8E44AD',
};

const MOCK_STORES = [
  { id: '1', name: 'Monoprix Lac', type: 'Supermarché', lat: 36.832, lng: 10.238, open: true, distance: '1.2 km', deliveryTime: '25 min', minOrder: 20 },
  { id: '2', name: 'MG Ariana', type: 'Supermarché', lat: 36.861, lng: 10.193, open: true, distance: '2.8 km', deliveryTime: '35 min', minOrder: 15 },
  { id: '3', name: 'Épicerie Sidi Bou', type: 'Épicerie', lat: 36.869, lng: 10.225, open: false, distance: '4.1 km', deliveryTime: '45 min', minOrder: 10 },
  { id: '4', name: 'Carrefour Market', type: 'Supermarché', lat: 36.820, lng: 10.175, open: true, distance: '3.5 km', deliveryTime: '40 min', minOrder: 25 },
  { id: '5', name: 'Aziza Menzah', type: 'Supermarché', lat: 36.843, lng: 10.187, open: true, distance: '2.0 km', deliveryTime: '30 min', minOrder: 20 },
];

const TYPES = ['Tous', 'Supermarché', 'Épicerie', 'Bio', 'Pharmacie'];

export default function GroceryStoreMapScreen({ navigation }) {
  const [userPos, setUserPos] = useState({ lat: 36.8065, lng: 10.1815 });
  const [stores, setStores] = useState(MOCK_STORES);
  const [filter, setFilter] = useState('Tous');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('map'); // 'map' | 'list'

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      let lat = 36.8065, lng = 10.1815;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        setUserPos({ lat, lng });
      }
      const res = await api.get(`/api/grocery/stores?lat=${lat}&lng=${lng}`);
      if (res.data?.stores?.length) setStores(res.data.stores);
    } catch {
      // keep mock data
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'Tous' ? stores : stores.filter((s) => s.type === filter);

  const markers = filtered.map((s) => ({
    coordinates: [s.lng, s.lat],
    color: s.open ? COLORS.green : '#555',
    label: s.open ? '🛒' : '🔒',
  }));
  if (userPos) {
    markers.push({ coordinates: [userPos.lng, userPos.lat], color: COLORS.accent, label: '📍' });
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header overlay */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.white, fontSize: 22 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🛒 Magasins à proximité</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'map' && styles.toggleActive]}
            onPress={() => setView('map')}
          >
            <Text style={styles.toggleText}>🗺️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'list' && styles.toggleActive]}
            onPress={() => setView('list')}
          >
            <Text style={styles.toggleText}>📋</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {view === 'map' && (
        <MapboxWebView
          style={styles.map}
          centerCoordinate={[userPos.lng, userPos.lat]}
          zoom={12}
          markers={markers}
        />
      )}

      {/* Filter chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, filter === t && styles.chipActive]}
              onPress={() => setFilter(t)}
            >
              <Text style={[styles.chipText, filter === t && { color: '#000' }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Store list panel */}
      <View style={[styles.listPanel, view === 'map' ? styles.listPanelOverlay : styles.listPanelFull]}>
        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={{ padding: 20 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {filtered.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={[styles.storeRow, selected?.id === store.id && styles.storeRowActive, !store.open && { opacity: 0.55 }]}
                onPress={() => {
                  setSelected(selected?.id === store.id ? null : store);
                  if (view === 'map') setUserPos({ lat: store.lat, lng: store.lng });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.storeIcon}>
                  <Text style={{ fontSize: 24 }}>{store.type === 'Épicerie' ? '🏪' : '🛒'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.storeHeader}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <View style={[styles.openBadge, { backgroundColor: store.open ? '#1A2A1A' : '#2A1A1A' }]}>
                      <Text style={{ color: store.open ? COLORS.green : COLORS.muted, fontSize: 11, fontWeight: '700' }}>
                        {store.open ? 'Ouvert' : 'Fermé'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.storeMeta}>{store.type} · {store.distance} · {store.deliveryTime}</Text>
                  <Text style={styles.storeMin}>Min. commande: {store.minOrder} TND</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Go to store button */}
      {selected && (
        <View style={styles.goBtn}>
          <TouchableOpacity
            style={styles.goBtnInner}
            onPress={() => navigation.navigate('GroceryStore', { storeId: selected.id, storeName: selected.name })}
          >
            <Text style={styles.goBtnText}>🛒 Commander chez {selected.name}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    backgroundColor: 'rgba(10,10,15,0.85)',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  viewToggle: { flexDirection: 'row', gap: 4 },
  toggleBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  toggleActive: { backgroundColor: COLORS.accent },
  toggleText: { fontSize: 16 },
  filterContainer: {
    position: 'absolute', top: 110, left: 0, right: 0, zIndex: 10,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(28,28,40,0.9)', borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  listPanel: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  listPanelOverlay: { maxHeight: '45%' },
  listPanelFull: { top: 140, zIndex: 5 },
  storeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  storeRowActive: { backgroundColor: COLORS.surfaceAlt },
  storeIcon: {
    width: 50, height: 50, borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  storeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  openBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  storeMeta: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  storeMin: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  goBtn: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  goBtnInner: {
    backgroundColor: COLORS.purple, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  goBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
