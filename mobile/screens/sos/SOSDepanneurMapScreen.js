import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#E74C3C', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', orange: '#E67E22', blue: '#3498DB',
};

const STATUS_CONFIG = {
  AVAILABLE: { label: 'Disponible', color: '#27AE60', dot: '🟢' },
  BUSY: { label: 'Occupé', color: '#E67E22', dot: '🟡' },
  OFFLINE: { label: 'Hors ligne', color: '#8A8A9A', dot: '⚫' },
};

const MOCK_DEPANNEURS = [
  { id: 1, name: 'Karim SOS Express', distance: 1.2, eta: '4 min', rating: 4.9, status: 'AVAILABLE', speciality: 'Crevaison, Batterie', vehicle: 'Ford Transit' },
  { id: 2, name: 'Mohamed Dépanne Pro', distance: 2.8, eta: '8 min', rating: 4.8, status: 'AVAILABLE', speciality: 'Remorquage, Panne', vehicle: 'Mercedes Sprinter' },
  { id: 3, name: 'Amine Assistance', distance: 3.5, eta: '11 min', rating: 4.7, status: 'BUSY', speciality: 'Toutes pannes', vehicle: 'Peugeot Expert' },
  { id: 4, name: 'Sami SOS Tunis', distance: 4.1, eta: '14 min', rating: 4.6, status: 'AVAILABLE', speciality: 'Batterie, Carburant', vehicle: 'VW Crafter' },
];

export default function SOSDepanneurMapScreen({ navigation }) {
  const [depanneurs, setDepanneurs] = useState(MOCK_DEPANNEURS);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchDepanneurs();
    intervalRef.current = setInterval(fetchDepanneurs, 15000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchDepanneurs = async () => {
    try {
      const res = await api.get('/api/sos/depanneurs/nearby');
      if (res.data?.depanneurs?.length > 0) setDepanneurs(res.data.depanneurs);
    } catch {
      // garder mock
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'ALL' ? depanneurs : depanneurs.filter(d => d.status === filter);
  const available = depanneurs.filter(d => d.status === 'AVAILABLE').length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dépanneurs à proximité</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={{ color: COLORS.green, fontSize: 10, fontWeight: '700' }}>LIVE</Text>
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{available}</Text>
          <Text style={styles.statLabel}>Disponibles</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.white }]}>{depanneurs.length}</Text>
          <Text style={styles.statLabel}>Total zone</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.accent }]}>
            {depanneurs.find(d => d.status === 'AVAILABLE')?.eta || '—'}
          </Text>
          <Text style={styles.statLabel}>ETA le + proche</Text>
        </View>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={{ fontSize: 40, marginBottom: 6 }}>🗺️</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>{available} dépanneur{available > 1 ? 's' : ''} disponible{available > 1 ? 's' : ''} près de vous</Text>
        <View style={styles.mapDots}>
          {depanneurs.map((d, i) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.mapDot, { left: 40 + i * 55, top: 18 + (i % 2) * 28 }, { backgroundColor: STATUS_CONFIG[d.status]?.color || COLORS.muted }, selected?.id === d.id && { borderColor: COLORS.accent, borderWidth: 3, width: 34, height: 34, borderRadius: 17 }]}
              onPress={() => setSelected(d)}
            >
              <Text style={{ fontSize: 8 }}>🔧</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        {['ALL', 'AVAILABLE', 'BUSY'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && { color: '#000' }]}>
              {f === 'ALL' ? 'Tous' : STATUS_CONFIG[f]?.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {filtered.map(d => {
            const sc = STATUS_CONFIG[d.status];
            const isSel = selected?.id === d.id;
            return (
              <TouchableOpacity key={d.id} style={[styles.card, isSel && { borderColor: COLORS.accent }]} onPress={() => setSelected(isSel ? null : d)} activeOpacity={0.85}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatar, { backgroundColor: sc.color + '22', borderColor: sc.color }]}>
                    <Text style={{ fontSize: 22 }}>🔧</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardName}>{d.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: sc.color + '22', borderColor: sc.color }]}>
                        <Text style={[styles.statusText, { color: sc.color }]}>{sc.dot} {sc.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardSub}>{d.speciality}</Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.metaItem}>📍 {d.distance} km</Text>
                      <Text style={styles.metaItem}>⏱ {d.eta}</Text>
                      <Text style={styles.metaItem}>⭐ {d.rating}</Text>
                    </View>
                  </View>
                </View>
                {isSel && d.status === 'AVAILABLE' && (
                  <TouchableOpacity style={styles.callBtn} onPress={() => navigation.navigate('SOSHome', { preselectedDepanneur: d })}>
                    <Text style={styles.callBtnText}>🆘 Appeler ce dépanneur</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#27AE6022', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.green },
  statsBar: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  mapPlaceholder: { height: 150, backgroundColor: COLORS.surfaceAlt, margin: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  mapDots: { position: 'absolute', width: '100%', height: '100%' },
  mapDot: { position: 'absolute', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { color: COLORS.white, fontSize: 14, fontWeight: '700', flex: 1 },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardSub: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', gap: 10 },
  metaItem: { color: COLORS.muted, fontSize: 11 },
  callBtn: { marginTop: 12, backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  callBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
});
