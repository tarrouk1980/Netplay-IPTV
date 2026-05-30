import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  red: '#E74C3C',
  amber: '#F39C12',
  blue: '#3498DB',
  purple: '#9B59B6',
};

const EVENT_CONFIG = {
  ORDER_CREATED:    { emoji: '🆕', label: 'Nouvelle commande',   color: COLORS.blue },
  ORDER_ACCEPTED:   { emoji: '✅', label: 'Commande acceptée',   color: COLORS.green },
  ORDER_COMPLETED:  { emoji: '🏁', label: 'Commande terminée',   color: COLORS.green },
  ORDER_CANCELLED:  { emoji: '❌', label: 'Commande annulée',    color: COLORS.red },
  USER_REGISTERED:  { emoji: '👤', label: 'Inscription',         color: COLORS.purple },
  KYC_SUBMITTED:    { emoji: '📄', label: 'KYC soumis',         color: COLORS.amber },
  KYC_APPROVED:     { emoji: '🔖', label: 'KYC approuvé',       color: COLORS.green },
  PASS_ACTIVATED:   { emoji: '⚡', label: 'Pass activé',         color: COLORS.amber },
  FRAUD_ALERT:      { emoji: '🚨', label: 'Alerte fraude',       color: COLORS.red },
  USER_BANNED:      { emoji: '🔒', label: 'Compte banni',        color: COLORS.red },
};

const SERVICE_EMOJI = { TAXI: '🚕', SOS: '🚛', DELIVERY: '🛵', GROCERY: '🛒' };

const FILTERS = [
  { key: 'ALL', label: 'Tout' },
  { key: 'ORDERS', label: 'Commandes' },
  { key: 'USERS', label: 'Utilisateurs' },
  { key: 'FRAUD', label: '🚨 Fraude' },
  { key: 'PASSES', label: 'Passes' },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

export default function AdminActivityScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchEvents = useCallback(async (pageNum = 1, reset = false) => {
    try {
      const res = await api.get(`/api/admin/activity?page=${pageNum}&filter=${filter}&limit=30`);
      const newEvents = res.data.events || [];
      setEvents((prev) => reset ? newEvents : [...prev, ...newEvents]);
      setHasMore(newEvents.length === 30);
      setPage(pageNum);
    } catch (err) {
      console.warn('[AdminActivity]', err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    setEvents([]);
    fetchEvents(1, true);
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) fetchEvents(page + 1);
  };

  const renderEvent = ({ item }) => {
    const cfg = EVENT_CONFIG[item.type] || { emoji: '📌', label: item.type, color: COLORS.muted };
    return (
      <View style={styles.eventRow}>
        <View style={[styles.eventDot, { backgroundColor: cfg.color }]} />
        <View style={styles.eventLine} />
        <View style={[styles.eventBubble, { borderLeftColor: cfg.color }]}>
          <View style={styles.eventTop}>
            <Text style={styles.eventEmoji}>{cfg.emoji}</Text>
            <Text style={styles.eventLabel}>{cfg.label}</Text>
            {item.serviceType && (
              <Text style={styles.serviceTag}>
                {SERVICE_EMOJI[item.serviceType]} {item.serviceType}
              </Text>
            )}
            <Text style={styles.eventTime}>{timeAgo(item.createdAt)}</Text>
          </View>
          {item.description && (
            <Text style={styles.eventDesc}>{item.description}</Text>
          )}
          {item.amount != null && (
            <Text style={[styles.eventAmount, { color: cfg.color }]}>
              {parseFloat(item.amount).toFixed(3)} TND
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chronologie</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshBtn}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.red} size="large" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item, idx) => `${item.id || idx}`}
          renderItem={renderEvent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.red} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: COLORS.muted, marginTop: 40 }}>Aucun événement</Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? <ActivityIndicator color={COLORS.muted} style={{ marginVertical: 16 }} /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backArrow: { color: COLORS.text, fontSize: 32, lineHeight: 32, marginTop: -4 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  refreshBtn: { color: COLORS.muted, fontSize: 24 },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  filterChipText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#FFF' },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  eventRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  eventDot: { width: 10, height: 10, borderRadius: 5, marginTop: 8, marginRight: 4, flexShrink: 0 },
  eventLine: { width: 1, backgroundColor: COLORS.border, position: 'absolute', left: 4, top: 18, bottom: -12 },
  eventBubble: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginLeft: 8,
    borderLeftWidth: 3,
  },
  eventTop: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  eventEmoji: { fontSize: 16 },
  eventLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700', flex: 1 },
  serviceTag: { color: COLORS.muted, fontSize: 11, backgroundColor: COLORS.bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  eventTime: { color: COLORS.muted, fontSize: 11 },
  eventDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  eventAmount: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
