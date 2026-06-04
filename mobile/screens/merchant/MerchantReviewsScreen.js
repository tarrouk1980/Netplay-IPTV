import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_REVIEWS = [
  { id: 1, client: 'Sana B.', avatar: '👩', rating: 5, comment: 'Pizza excellente, livrée chaude et à temps. Je recommande !', date: 'Auj. 15:30', order: 'CMD-4441', replied: false },
  { id: 2, client: 'Karim L.', avatar: '👨', rating: 4, comment: 'Bonne qualité, juste un peu de retard sur la livraison.', date: 'Hier 20:10', order: 'CMD-4430', replied: true, reply: 'Merci Karim ! Nous nous excusons pour le retard. À très bientôt !' },
  { id: 3, client: 'Ines M.', avatar: '👩', rating: 5, comment: 'Toujours aussi délicieux, c\'est ma pizza préférée à Tunis !', date: '02/06', order: 'CMD-4420', replied: false },
  { id: 4, client: 'Youssef T.', avatar: '👨', rating: 3, comment: 'Commande incomplète, il manquait les desserts. Déçu.', date: '01/06', order: 'CMD-4410', replied: true, reply: 'Bonjour Youssef, nous sommes vraiment désolés. Un bon de réduction vous a été envoyé.' },
  { id: 5, client: 'Amira K.', avatar: '👩', rating: 5, comment: 'Service parfait, pizza cuite à la perfection. Bravo !', date: '30/05', order: 'CMD-4400', replied: false },
];

const MOCK_STATS = {
  avgRating: 4.4,
  total: 287,
  dist: [
    { stars: 5, count: 178, pct: 62 },
    { stars: 4, count: 63, pct: 22 },
    { stars: 3, count: 29, pct: 10 },
    { stars: 2, count: 11, pct: 4 },
    { stars: 1, count: 6, pct: 2 },
  ],
};

export default function MerchantReviewsScreen({ navigation }) {
  const [filterRating, setFilterRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filtered = filterRating === 0
    ? MOCK_REVIEWS
    : MOCK_REVIEWS.filter(r => r.rating === filterRating);

  const submitReply = (id) => {
    if (!replyText.trim()) return;
    setReplyingTo(null);
    setReplyText('');
  };

  const renderItem = ({ item: r }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <Text style={{ fontSize: 28 }}>{r.avatar}</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewClient}>{r.client}</Text>
            <Text style={styles.reviewDate}>{r.date}</Text>
          </View>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Text key={s} style={{ fontSize: 14, opacity: s <= r.rating ? 1 : 0.2 }}>⭐</Text>
            ))}
            <Text style={styles.orderRef}>{r.order}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{r.comment}</Text>

      {r.replied && r.reply && (
        <View style={styles.replyBubble}>
          <Text style={styles.replyLabel}>🏪 Votre réponse :</Text>
          <Text style={styles.replyText}>{r.reply}</Text>
        </View>
      )}

      {!r.replied && replyingTo !== r.id && (
        <TouchableOpacity style={styles.replyBtn} onPress={() => setReplyingTo(r.id)}>
          <Text style={styles.replyBtnText}>↩ Répondre</Text>
        </TouchableOpacity>
      )}

      {replyingTo === r.id && (
        <View style={styles.replyInput}>
          <TextInput
            style={styles.replyInputField}
            placeholder="Votre réponse..."
            placeholderTextColor={COLORS.muted}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            autoFocus
          />
          <View style={styles.replyActions}>
            <TouchableOpacity style={styles.replyCancelBtn} onPress={() => { setReplyingTo(null); setReplyText(''); }}>
              <Text style={styles.replyCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.replySendBtn} onPress={() => submitReply(r.id)}>
              <Text style={styles.replySendText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avis clients</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Rating summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.bigRating}>{MOCK_STATS.avgRating}</Text>
          <Text style={{ fontSize: 24 }}>⭐</Text>
          <Text style={styles.totalReviews}>{MOCK_STATS.total} avis</Text>
        </View>
        <View style={styles.summaryRight}>
          {MOCK_STATS.dist.map(d => (
            <View key={d.stars} style={styles.distRow}>
              <Text style={styles.distStars}>{d.stars}⭐</Text>
              <View style={styles.distBarWrap}>
                <View style={[styles.distBar, {
                  width: `${d.pct}%`,
                  backgroundColor: d.stars >= 4 ? COLORS.green : d.stars === 3 ? COLORS.orange : COLORS.red,
                }]} />
              </View>
              <Text style={styles.distPct}>{d.pct}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter by rating */}
      <View style={styles.filtersRow}>
        {[0, 5, 4, 3, 2, 1].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, filterRating === r && styles.filterChipActive]}
            onPress={() => setFilterRating(r)}
          >
            <Text style={[styles.filterText, filterRating === r && { color: '#000' }]}>
              {r === 0 ? 'Tous' : `${r}⭐`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => String(r.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
            <Text style={styles.emptyText}>Aucun avis</Text>
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
  summaryCard: {
    flexDirection: 'row', margin: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 16,
  },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  bigRating: { color: COLORS.white, fontSize: 36, fontWeight: '900' },
  totalReviews: { color: COLORS.muted, fontSize: 11 },
  summaryRight: { flex: 1, gap: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distStars: { color: COLORS.muted, fontSize: 10, width: 24 },
  distBarWrap: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  distBar: { height: '100%', borderRadius: 3 },
  distPct: { color: COLORS.muted, fontSize: 10, width: 28, textAlign: 'right' },
  filtersRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  reviewTop: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewClient: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  orderRef: { color: COLORS.muted, fontSize: 10, marginLeft: 8 },
  reviewComment: { color: COLORS.muted, fontSize: 13, marginBottom: 10 },
  replyBubble: { backgroundColor: COLORS.accent + '11', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.accent + '33' },
  replyLabel: { color: COLORS.accent, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  replyText: { color: COLORS.white, fontSize: 12 },
  replyBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border },
  replyBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  replyInput: { marginTop: 8 },
  replyInputField: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12, color: COLORS.white, fontSize: 13, minHeight: 70, marginBottom: 8 },
  replyActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  replyCancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border },
  replyCancelText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  replySendBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.accent },
  replySendText: { color: '#000', fontSize: 12, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
