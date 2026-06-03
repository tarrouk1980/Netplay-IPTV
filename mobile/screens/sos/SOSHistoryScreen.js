import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', orange: '#E67E22',
};

const STATUS_CONFIG = {
  done:       { label: 'Terminé',   color: COLORS.green,  icon: '✅' },
  cancelled:  { label: 'Annulé',    color: COLORS.red,    icon: '❌' },
  in_progress:{ label: 'En cours',  color: COLORS.orange, icon: '🔧' },
};

const MOCK_HISTORY = [
  { id: 'SOS001', type: 'Crevaison', address: 'Autoroute A1, km 32', depanneur: 'Slim D.', amount: 55.0, date: '15/01/2025 09:12', status: 'done', duration: '18 min', rating: 5 },
  { id: 'SOS002', type: 'Panne moteur', address: 'Av. Mohamed V, Tunis', depanneur: 'Hassen B.', amount: 80.0, date: '10/01/2025 14:35', status: 'done', duration: '25 min', rating: 4 },
  { id: 'SOS003', type: 'Batterie déchargée', address: 'Menzah 9', depanneur: 'Walid T.', amount: 35.0, date: '28/12/2024 08:02', status: 'done', duration: '12 min', rating: 5 },
  { id: 'SOS004', type: 'Accident léger', address: 'Bd du 9 Avril', depanneur: '', amount: 0, date: '15/12/2024 18:22', status: 'cancelled', duration: '—', rating: 0 },
  { id: 'SOS005', type: 'Remorquage', address: 'Ariana Superville', depanneur: 'Nabil K.', amount: 120.0, date: '02/12/2024 11:45', status: 'done', duration: '40 min', rating: 4 },
];

function StarRating({ value }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={{ fontSize: 12, color: s <= value ? COLORS.accent : COLORS.border }}>★</Text>
      ))}
    </View>
  );
}

export default function SOSHistoryScreen({ navigation }) {
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/sos/history');
        if (res.data?.history?.length) setHistory(res.data.history);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = filter === 'all' ? history : history.filter((h) => h.status === filter);
  const totalSpent = history.filter((h) => h.status === 'done').reduce((s, h) => s + h.amount, 0);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🛻 Historique SOS</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{history.filter((h) => h.status === 'done').length}</Text>
          <Text style={styles.summaryLabel}>Interventions</Text>
        </View>
        <View style={[styles.summaryBox, { borderColor: COLORS.accent }]}>
          <Text style={[styles.summaryValue, { color: COLORS.accent }]}>{totalSpent.toFixed(3)} TND</Text>
          <Text style={styles.summaryLabel}>Total dépensé</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>4.7 ★</Text>
          <Text style={styles.summaryLabel}>Note moyenne</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterList}>
        {[{ key: 'all', label: '🔍 Tout' }, { key: 'done', label: '✅ Terminés' }, { key: 'cancelled', label: '❌ Annulés' }].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && { color: '#000' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {loading && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />}
        {filtered.map((item) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.done;
          return (
            <View key={item.id} style={[styles.card, { borderLeftColor: cfg.color }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardType}>{cfg.icon} {item.type}</Text>
                  <Text style={styles.cardAddress}>{item.address}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.color + '22' }]}>
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <View style={styles.cardMeta}>
                {item.depanneur ? (
                  <Text style={styles.metaText}>🔧 {item.depanneur}</Text>
                ) : null}
                <Text style={styles.metaText}>⏱ {item.duration}</Text>
                <Text style={styles.metaText}>📅 {item.date}</Text>
              </View>

              <View style={styles.cardBottom}>
                {item.rating > 0 && <StarRating value={item.rating} />}
                {item.amount > 0 && (
                  <Text style={styles.cardAmount}>{item.amount.toFixed(3)} TND</Text>
                )}
              </View>
            </View>
          );
        })}
        {filtered.length === 0 && !loading && (
          <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 40 }}>
            Aucune intervention dans cette catégorie.
          </Text>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', padding: 12, gap: 10 },
  summaryBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  summaryValue: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  summaryLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  filterScroll: { maxHeight: 46 },
  filterList: { paddingHorizontal: 12, gap: 8, paddingVertical: 6 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 12, paddingTop: 8 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border,
    borderLeftWidth: 4, padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardType: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  cardAddress: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  metaText: { color: COLORS.muted, fontSize: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardAmount: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
});
