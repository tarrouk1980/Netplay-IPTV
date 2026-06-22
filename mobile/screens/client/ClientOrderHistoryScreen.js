import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const TYPE_ICONS = { TAXI: '🚕', DELIVERY: '📦', GROCERY: '🛒', SOS: '🔧', HOME_SERVICE: '🛠️', CAR_RENTAL: '🚗' };
const TYPE_LABELS = { TAXI: 'Taxi', DELIVERY: 'Livraison', GROCERY: 'Épicerie', SOS: 'SOS', HOME_SERVICE: 'Service', CAR_RENTAL: 'Location' };
const STATUS_COLORS = { COMPLETED: COLORS.green, CANCELLED: COLORS.red, IN_PROGRESS: COLORS.blue, ACCEPTED: COLORS.blue, PENDING: COLORS.orange, DISPUTED: COLORS.red };
const STATUS_LABELS = { COMPLETED: 'Terminé', CANCELLED: 'Annulé', IN_PROGRESS: 'En cours', ACCEPTED: 'Accepté', PENDING: 'En attente', DISPUTED: 'Contesté' };

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

const TYPE_FILTERS = ['Tous', 'TAXI', 'DELIVERY', 'GROCERY', 'SOS'];

function OrderCard({ item, onPress }) {
  const sc = STATUS_COLORS[item.status] || COLORS.muted;
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <View style={[styles.typeIcon, { backgroundColor: sc + '20' }]}>
          <Text style={{ fontSize: 22 }}>{TYPE_ICONS[item.type]}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTop}>
          <Text style={styles.cardType}>{TYPE_LABELS[item.type]}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc + '20', borderColor: sc + '40' }]}>
            <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABELS[item.status]}</Text>
          </View>
        </View>
        <Text style={styles.cardRoute} numberOfLines={1}>
          {item.from}{item.to ? ' → ' + item.to : ''}
        </Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardDate}>{item.date}</Text>
          <Text style={styles.cardAmount}>{item.amount.toFixed(3)} TND</Text>
          {item.rating && <Text style={styles.cardRating}>{'★'.repeat(item.rating)}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ClientOrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');

  const load = useCallback(() => {
    api.get('/api/users/me/orders')
      .then(r => {
        const list = (r.data?.orders || []).map(o => ({
          id: o.id,
          type: o.serviceType,
          from: o.originAddress || '—',
          to: o.destinationAddress || null,
          amount: o.finalPrice ?? o.price ?? 0,
          status: o.status,
          date: fmtDate(o.completedAt || o.createdAt),
          rating: null,
        }));
        setOrders(list);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const matchType = typeFilter === 'Tous' || o.type === typeFilter;
    const matchSearch = o.id.includes(search) ||
      o.from.toLowerCase().includes(search.toLowerCase()) ||
      (o.to || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalSpent = orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Mes commandes</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{orders.filter(o => o.status === 'COMPLETED').length}</Text>
          <Text style={styles.summaryLabel}>Commandes</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNum, { color: COLORS.accent }]}>{totalSpent.toFixed(3)}</Text>
          <Text style={styles.summaryLabel}>TND dépensés</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        placeholderTextColor={COLORS.muted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={TYPE_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={t => t}
        style={{ maxHeight: 44 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterBtn, typeFilter === item && styles.filterBtnActive]}
            onPress={() => setTypeFilter(item)}
          >
            <Text style={[styles.filterText, typeFilter === item && styles.filterTextActive]}>
              {item === 'Tous' ? 'Tous' : (TYPE_ICONS[item] + ' ' + TYPE_LABELS[item])}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger vos commandes. Vérifiez votre connexion.
          </Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <OrderCard item={item} onPress={o => navigation.navigate('OrderDetail', { orderId: o.id, type: o.type })} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune commande</Text>
            </View>
          }
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  summaryRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  summaryNum: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 3 },
  summaryLabel: { color: COLORS.muted, fontSize: 11 },
  searchInput: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtn: {
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: COLORS.accent },
  list: { padding: 16 },
  card: {
    flexDirection: 'row', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 13,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardLeft: { justifyContent: 'center' },
  typeIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardType: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardRoute: { color: COLORS.muted, fontSize: 12, marginBottom: 5 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardDate: { color: COLORS.muted, fontSize: 11, flex: 1 },
  cardAmount: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
  cardRating: { color: COLORS.accent, fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 60 },
});
