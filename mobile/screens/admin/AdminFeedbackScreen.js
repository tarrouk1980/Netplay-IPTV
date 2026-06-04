import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const SERVICE_ICON = { TAXI: '🚕', DELIVERY: '🛵', GROCERY: '🛒', SOS: '🔧' };

const MOCK_REVIEWS = [
  { id: 'R1', service: 'TAXI',     user: 'Nadia K.',  provider: 'Karim B.', rating: 5, comment: 'Chauffeur très sympa, rapide et ponctuel.', date: '03/06', flagged: false },
  { id: 'R2', service: 'DELIVERY', user: 'Ahmed R.',  provider: 'Rim H.',   rating: 2, comment: 'Livraison très en retard, colis abîmé.', date: '02/06', flagged: true },
  { id: 'R3', service: 'GROCERY',  user: 'Sara M.',   provider: 'Carrefour', rating: 4, comment: 'Bon service, produits frais.', date: '01/06', flagged: false },
  { id: 'R4', service: 'SOS',      user: 'Hatem K.',  provider: 'Anis M.',  rating: 5, comment: 'Dépanneur arrivé en 12 min, impeccable.', date: '31/05', flagged: false },
  { id: 'R5', service: 'TAXI',     user: 'Karim B.',  provider: 'Sami T.',  rating: 1, comment: 'Conducteur impoli, voiture sale.', date: '30/05', flagged: true },
  { id: 'R6', service: 'DELIVERY', user: 'Rim H.',    provider: 'Nabil R.', rating: 3, comment: 'Correct mais peut mieux faire.', date: '29/05', flagged: false },
];

function stars(n) {
  return Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('');
}

function ReviewCard({ item, onPress }) {
  const starColor = item.rating >= 4 ? COLORS.green : item.rating === 3 ? COLORS.accent : COLORS.red;
  return (
    <TouchableOpacity style={[styles.card, item.flagged && styles.cardFlagged]} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={{ fontSize: 22 }}>{SERVICE_ICON[item.service] || '📦'}</Text>
          <View>
            <Text style={styles.cardUser}>{item.user}</Text>
            <Text style={styles.cardProvider}>→ {item.provider}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.cardRating, { color: starColor }]}>{stars(item.rating)}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.cardComment} numberOfLines={2}>{item.comment}</Text>
      {item.flagged && (
        <View style={styles.flaggedBadge}>
          <Text style={styles.flaggedText}>🚩 Signalé</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function AdminFeedbackScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  const FILTERS = [
    { key: 'ALL', label: 'Tous' },
    { key: 'FLAGGED', label: '🚩 Signalés' },
    { key: 'LOW', label: '⭐ < 3' },
    { key: 'HIGH', label: '⭐⭐⭐⭐⭐ 5 étoiles' },
  ];

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/reviews')
      .then(r => setReviews(r.data.reviews || MOCK_REVIEWS))
      .catch(() => setReviews(MOCK_REVIEWS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    setSelected(null);
    api.delete(`/api/admin/reviews/${id}`).catch(() => {});
  };

  const handleUnflag = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, flagged: false } : r));
    setSelected(s => s ? { ...s, flagged: false } : null);
    api.patch(`/api/admin/reviews/${id}/unflag`).catch(() => {});
  };

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.user.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
    const matchFilter = filter === 'ALL' || (filter === 'FLAGGED' && r.flagged) || (filter === 'LOW' && r.rating < 3) || (filter === 'HIGH' && r.rating === 5);
    return matchSearch && matchFilter;
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
  const flaggedCount = reviews.filter(r => r.flagged).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>⭐ Avis clients</Text>
          {flaggedCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{flaggedCount}</Text></View>}
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.accent }]}>★ {avgRating}</Text>
          <Text style={styles.kpiLabel}>Note moy.</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.text }]}>{reviews.length}</Text>
          <Text style={styles.kpiLabel}>Total avis</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: flaggedCount > 0 ? COLORS.red : COLORS.muted }]}>{flaggedCount}</Text>
          <Text style={styles.kpiLabel}>Signalés</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Utilisateur, prestataire, commentaire..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={f => f.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={r => r.id}
          renderItem={({ item }) => <ReviewCard item={item} onPress={setSelected} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>⭐</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun avis</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selected?.user} → {selected?.provider}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={{ color: COLORS.muted, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalRating, { color: selected?.rating >= 4 ? COLORS.green : selected?.rating === 3 ? COLORS.accent : COLORS.red }]}>
              {stars(selected?.rating || 0)} ({selected?.rating}/5)
            </Text>
            <View style={styles.modalComment}>
              <Text style={styles.modalCommentText}>{selected?.comment}</Text>
            </View>
            <View style={styles.modalMeta}>
              <Text style={styles.modalMetaText}>{SERVICE_ICON[selected?.service]} {selected?.service} · {selected?.date}</Text>
            </View>
            <View style={styles.modalActions}>
              {selected?.flagged && (
                <TouchableOpacity style={styles.unflagBtn} onPress={() => handleUnflag(selected.id)}>
                  <Text style={styles.unflagBtnText}>✅ Désignaler</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(selected?.id)}>
                <Text style={styles.deleteBtnText}>🗑️ Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  badge: { backgroundColor: COLORS.red, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  kpiRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 18, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  kpiDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: {
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.surface,
  },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: COLORS.accent },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardFlagged: { borderColor: COLORS.red + '50', backgroundColor: COLORS.red + '08' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardUser: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  cardProvider: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  cardRight: { alignItems: 'flex-end' },
  cardRating: { fontSize: 13, fontWeight: '700' },
  cardDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  cardComment: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  flaggedBadge: {
    marginTop: 8, backgroundColor: COLORS.red + '20', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: COLORS.red + '40',
  },
  flaggedText: { color: COLORS.red, fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  modalTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800', flex: 1, marginRight: 10 },
  modalRating: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalComment: {
    backgroundColor: COLORS.bg, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  modalCommentText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  modalMeta: { marginBottom: 14 },
  modalMetaText: { color: COLORS.muted, fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 10 },
  unflagBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.green + '50',
    paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.green + '10',
  },
  unflagBtnText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  deleteBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.red + '50',
    paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.red + '10',
  },
  deleteBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
});
