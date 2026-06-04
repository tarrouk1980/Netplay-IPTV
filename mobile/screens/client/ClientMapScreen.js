import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxWebView from '../../components/MapboxWebView';
import { getCurrentLocationWithAddress } from '../../utils/locationUtils';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const NEARBY = [
  { id: 'T1', type: 'taxi', icon: '🚕', label: 'Karim · 3 min', lat: 36.8095, lng: 10.1835 },
  { id: 'T2', type: 'taxi', icon: '🚕', label: 'Sami · 5 min', lat: 36.8055, lng: 10.1795 },
  { id: 'L1', type: 'livreur', icon: '🛵', label: 'Livreur · 2 min', lat: 36.8075, lng: 10.1855 },
  { id: 'D1', type: 'depanneur', icon: '🛻', label: 'Dépanneur · 8 min', lat: 36.8035, lng: 10.1815 },
];

const FILTERS = [
  { key: 'all', label: 'Tous', icon: '📍' },
  { key: 'taxi', label: 'Taxis', icon: '🚕' },
  { key: 'livreur', label: 'Livreurs', icon: '🛵' },
  { key: 'depanneur', label: 'Dépanneurs', icon: '🛻' },
];

export default function ClientMapScreen({ navigation }) {
  const [userPos, setUserPos] = useState(null);
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      const r = await getCurrentLocationWithAddress();
      if (r) { setUserPos(r.coords); setAddress(r.address); }
      setLocating(false);
    })();
  }, []);

  const visible = filter === 'all' ? NEARBY : NEARBY.filter(n => n.type === filter);

  const markers = [
    ...(userPos ? [{ coordinates: [userPos.lng, userPos.lat], color: COLORS.accent, label: '📍' }] : []),
    ...visible.map(n => ({ coordinates: [n.lng, n.lat], color: n.type === 'taxi' ? '#F5A623' : n.type === 'livreur' ? '#27AE60' : '#E67E22', label: n.icon })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Carte en direct</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Map */}
      <View style={{ flex: 1 }}>
        {locating ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.accent} size="large" />
            <Text style={styles.loadingText}>Localisation...</Text>
          </View>
        ) : (
          <MapboxWebView
            style={{ flex: 1, borderRadius: 0 }}
            centerCoordinate={userPos ? [userPos.lng, userPos.lat] : [10.1815, 36.8065]}
            zoom={14}
            markers={markers}
          />
        )}
      </View>

      {/* Bottom panel */}
      <View style={styles.panel}>
        {address ? (
          <Text style={styles.addressText} numberOfLines={1}>📍 {address}</Text>
        ) : null}

        {/* Filters */}
        <View style={styles.filtersRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={styles.filterIcon}>{f.icon}</Text>
              <Text style={[styles.filterLabel, filter === f.key && { color: COLORS.accent }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nearby list */}
        <Text style={styles.nearbyTitle}>{visible.length} prestataire{visible.length > 1 ? 's' : ''} à proximité</Text>
        {visible.map(n => (
          <View key={n.id} style={styles.nearbyRow}>
            <Text style={{ fontSize: 20 }}>{n.icon}</Text>
            <Text style={styles.nearbyLabel}>{n.label}</Text>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => navigation.navigate(n.type === 'taxi' ? 'TaxiHome' : n.type === 'livreur' ? 'DeliveryHome' : 'SOSHome')}
            >
              <Text style={styles.callBtnText}>Appeler →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: COLORS.muted, fontSize: 14 },
  panel: { backgroundColor: COLORS.surface, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  addressText: { color: COLORS.muted, fontSize: 12, marginBottom: 10 },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: COLORS.bg, borderRadius: 10, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  filterIcon: { fontSize: 13 },
  filterLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  nearbyTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  nearbyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border + '60' },
  nearbyLabel: { flex: 1, color: COLORS.text, fontSize: 13 },
  callBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.accent + '40' },
  callBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
});
