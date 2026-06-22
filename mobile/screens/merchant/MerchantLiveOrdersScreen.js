import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STATUS_META = {
  PENDING:     { label: 'Nouvelle',       color: COLORS.blue,   bg: '#0A1A2E' },
  ACCEPTED:    { label: 'En préparation', color: COLORS.orange, bg: '#1A100A' },
  IN_PROGRESS: { label: 'Prête',          color: COLORS.green,  bg: '#0D2E0D' },
  COMPLETED:   { label: 'Récupérée',      color: COLORS.muted,  bg: COLORS.surface },
};

const NEXT_STATUS = { PENDING: 'ACCEPTED', ACCEPTED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED' };
const NEXT_BTN_LABEL = { PENDING: '▶ Commencer', ACCEPTED: '✓ Prête', IN_PROGRESS: '📦 Livreur arrivé' };

export default function MerchantLiveOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/merchants/me/orders')
      .then(res => { setOrders(res.data.orders || []); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const advance = async (id) => {
    const order = orders.find(o => o.id === id);
    const next = NEXT_STATUS[order?.status];
    if (!next) return;
    try {
      await api.patch(`/api/merchants/me/orders/${id}/status`, { status: next });
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: next } : o)));
    } catch {
      Alert.alert('Erreur', "Impossible de mettre à jour la commande.");
    }
  };

  const cancelOrder = (id) => {
    Alert.alert('Annuler la commande ?', 'Le client sera remboursé.', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/api/merchants/me/orders/${id}/status`, { status: 'CANCELLED' });
            setOrders(prev => prev.filter(o => o.id !== id));
          } catch {
            Alert.alert('Erreur', "Impossible d'annuler la commande.");
          }
        },
      },
    ]);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const newCount = orders.filter(o => o.status === 'PENDING').length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.root, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger les commandes. Vérifiez votre connexion.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderOrder = ({ item: o }) => {
    const meta = STATUS_META[o.status] || STATUS_META.PENDING;
    const nextStatus = NEXT_STATUS[o.status];
    const items = Array.isArray(o.metadata?.items) ? o.metadata.items : [];
    const time = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <View style={[styles.card, { backgroundColor: meta.bg, borderColor: meta.color + '55' }]}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderId}>{o.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.orderClient}>👤 {o.client?.name || 'Client'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.color + '22' }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
        {items.length > 0 && (
          <View style={styles.itemsList}>
            {items.map((it, i) => (
              <Text key={i} style={styles.itemLine}>· {it.name || it.label} {it.qty ? `x${it.qty}` : ''}</Text>
            ))}
          </View>
        )}
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>🕐 {time}</Text>
          <Text style={[styles.totalText]}>{Number(o.finalPrice ?? o.price ?? 0).toFixed(2)} TND</Text>
        </View>
        {o.destinationAddress && <Text style={styles.addressText} numberOfLines={1}>📍 {o.destinationAddress}</Text>}
        {nextStatus && (
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelOrder(o.id)}>
              <Text style={styles.cancelBtnText}>✕ Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.advanceBtn, { backgroundColor: meta.color }]}
              onPress={() => advance(o.id)}
            >
              <Text style={styles.advanceBtnText}>{NEXT_BTN_LABEL[o.status]}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>Commandes live</Text>
          {newCount > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{newCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.liveDot} />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {[['all', 'Toutes'], ['PENDING', 'Nouvelles'], ['ACCEPTED', 'En cours'], ['IN_PROGRESS', 'Prêtes']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.filterChip, filter === val && styles.filterChipActive]}
            onPress={() => setFilter(val)}
          >
            <Text style={[styles.filterText, filter === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🍽️</Text>
            <Text style={styles.emptyText}>Aucune commande en cours</Text>
          </View>
        }
      />
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  newBadge: {
    backgroundColor: COLORS.blue, borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  newBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  liveDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green,
  },
  filtersRow: { flexDirection: 'row', gap: 8, padding: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  card: {
    borderRadius: 14, padding: 14, borderWidth: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  orderClient: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  itemsList: { marginBottom: 10 },
  itemLine: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  cardMeta: { flexDirection: 'row', gap: 12, marginBottom: 6, alignItems: 'center' },
  metaText: { color: COLORS.muted, fontSize: 12 },
  totalText: { color: COLORS.accent, fontSize: 14, fontWeight: '800', marginLeft: 'auto' },
  addressText: { color: COLORS.muted, fontSize: 11, marginBottom: 10 },
  cardActions: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  advanceBtn: {
    flex: 2, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  advanceBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
