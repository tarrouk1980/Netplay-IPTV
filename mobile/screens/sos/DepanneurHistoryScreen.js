import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const PANNE_ICON = {
  BATTERIE: '🔋', CREVAISON: '🛞', PANNE_MOTEUR: '⚙️',
  CARBURANT: '⛽', ACCIDENT: '🚨', AUTRE: '🔧',
};

function fmtDate(d) {
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function DepanneurHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(false);
  const [rating, setRating] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/sos/depanneur/dashboard')
      .then(r => {
        const list = (r.data?.history || []).map(o => ({
          id: o.id,
          type: o.metadata?.sosType?.toUpperCase?.() || 'AUTRE',
          client: o.client?.name || 'Client',
          address: o.destinationAddress || o.originAddress || '—',
          date: fmtDate(o.completedAt || o.createdAt),
          amount: o.finalPrice ?? Number(o.price || 0),
          status: o.status,
        }));
        setHistory(list);
        setRating(r.data?.stats?.rating ?? null);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = history.filter(h => {
    const q = search.toLowerCase();
    return !q || h.client.toLowerCase().includes(q) || h.address.toLowerCase().includes(q) || h.type.toLowerCase().includes(q);
  });

  const totalAmount = history.reduce((s, h) => s + h.amount, 0);
  const avgRating = rating != null ? rating.toFixed(1) : '—';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔧 Mes interventions</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats strip */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: COLORS.accent }]}>{history.length}</Text>
          <Text style={styles.statLabel}>Interventions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: COLORS.green }]}>{totalAmount.toFixed(0)} TND</Text>
          <Text style={styles.statLabel}>Total gagné</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: COLORS.accent }]}>★ {avgRating}</Text>
          <Text style={styles.statLabel}>Note moy.</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Chercher client, adresse, type..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger vos interventions. Vérifiez votre connexion.
          </Text>
          <TouchableOpacity onPress={load} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={h => h.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>🔧</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune intervention</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isOpen = expanded === item.id;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => setExpanded(isOpen ? null : item.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardIcon}>
                    <Text style={{ fontSize: 24 }}>{PANNE_ICON[item.type] || '🔧'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardType}>{item.type.replace('_', ' ')}</Text>
                    <Text style={styles.cardClient}>{item.client}</Text>
                    <Text style={styles.cardDate}>{item.date}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardAmount}>{item.amount.toFixed(2)} TND</Text>
                  </View>
                </View>

                {isOpen && (
                  <View style={styles.detail}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📍 Adresse</Text>
                      <Text style={styles.detailValue}>{item.address}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>💰 Gagné</Text>
                      <Text style={[styles.detailValue, { color: COLORS.green }]}>{item.amount.toFixed(2)} TND</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  cardType: { color: COLORS.text, fontSize: 13, fontWeight: '800', textTransform: 'capitalize' },
  cardClient: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  cardDate: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardAmount: { color: COLORS.accent, fontSize: 15, fontWeight: '900' },
  cardRating: { color: COLORS.accent, fontSize: 12 },
  detail: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: 8,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { color: COLORS.muted, fontSize: 12 },
  detailValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});
