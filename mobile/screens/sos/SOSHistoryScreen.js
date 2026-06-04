import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const TYPE_ICONS = { BREAKDOWN: '🔧', FLAT_TIRE: '🛞', BATTERY: '🔋', ACCIDENT: '🚨', LOCKOUT: '🔑', FUEL: '⛽', OTHER: '⚠️' };
const TYPE_LABELS = { BREAKDOWN: 'Panne moteur', FLAT_TIRE: 'Crevaison', BATTERY: 'Batterie', ACCIDENT: 'Accident', LOCKOUT: 'Verrouillé', FUEL: 'Carburant', OTHER: 'Autre' };
const STATUS_COLORS = { COMPLETED: COLORS.green, CANCELLED: COLORS.red, IN_PROGRESS: COLORS.blue, PENDING: COLORS.orange };
const STATUS_LABELS = { COMPLETED: 'Terminé', CANCELLED: 'Annulé', IN_PROGRESS: 'En cours', PENDING: 'En attente' };

const MOCK = [
  { id: 'SOS001', type: 'FLAT_TIRE', location: 'Autoroute A1, km 42', techName: 'Karim M.', amount: 45.000, status: 'COMPLETED', date: '03/06/2026 16:20', duration: '28 min' },
  { id: 'SOS002', type: 'BATTERY', location: 'Av. Habib Bourguiba, Tunis', techName: 'Sami T.', amount: 35.000, status: 'COMPLETED', date: '01/06/2026 09:15', duration: '22 min' },
  { id: 'SOS003', type: 'BREAKDOWN', location: 'Route de La Marsa', techName: null, amount: 0, status: 'CANCELLED', date: '28/05/2026 14:40', duration: null },
  { id: 'SOS004', type: 'FUEL', location: 'El Mourouj 6', techName: 'Nour B.', amount: 15.000, status: 'COMPLETED', date: '20/05/2026 18:55', duration: '15 min' },
];

function SOSCard({ item }) {
  const sc = STATUS_COLORS[item.status] || COLORS.muted;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeRow}>
          <Text style={styles.typeIcon}>{TYPE_ICONS[item.type] || '⚠️'}</Text>
          <Text style={styles.typeLabel}>{TYPE_LABELS[item.type] || item.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc + '20', borderColor: sc + '50' }]}>
          <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📍</Text>
        <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
      </View>
      {item.techName && (
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👤</Text>
          <Text style={styles.infoText}>{item.techName}</Text>
        </View>
      )}
      {item.duration && (
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>⏱</Text>
          <Text style={styles.infoText}>Intervention en {item.duration}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.footerDate}>{item.date}</Text>
        <View style={{ flex: 1 }} />
        {item.amount > 0 && <Text style={styles.footerAmount}>{item.amount.toFixed(3)} TND</Text>}
      </View>
    </View>
  );
}

export default function SOSHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, spent: 0 });

  const load = useCallback(() => {
    api.get('/api/sos/history')
      .then(r => {
        const data = r.data.items || MOCK;
        setItems(data);
        const done = data.filter(d => d.status === 'COMPLETED');
        setStats({ total: done.length, spent: done.reduce((s, d) => s + d.amount, 0) });
      })
      .catch(() => {
        setItems(MOCK);
        setStats({ total: 3, spent: 95.000 });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔧 Historique SOS</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLabel}>Interventions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.spent.toFixed(3)}</Text>
              <Text style={styles.statLabel}>TND dépensés</Text>
            </View>
          </View>

          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <SOSCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={{ fontSize: 40 }}>🔧</Text>
                <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune intervention</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeIcon: { fontSize: 20 },
  typeLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  infoIcon: { fontSize: 13 },
  infoText: { color: COLORS.muted, fontSize: 13, flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerDate: { color: COLORS.muted, fontSize: 11 },
  footerAmount: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60 },
});
