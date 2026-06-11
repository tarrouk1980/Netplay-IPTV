import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';

// ---------------------------------------------------------------------------
// Simple in-memory bookmark store (replace with AsyncStorage when installed)
// ---------------------------------------------------------------------------
let _bookmarks = [];

export function addBookmark(b) {
  _bookmarks = [b, ..._bookmarks.filter((x) => x.id !== b.id)];
}

export function removeBookmark(id) {
  _bookmarks = _bookmarks.filter((x) => x.id !== id);
}

export function getBookmarks() {
  return _bookmarks;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MODE_LABELS = { vol: '✈  Vol', ferry: '⛴  Ferry' };
const MODE_COLORS = { vol: COLORS.accent, ferry: COLORS.ferry };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// BookmarkCard
// ---------------------------------------------------------------------------
function BookmarkCard({ bookmark, onDelete }) {
  const modeColor = MODE_COLORS[bookmark.mode] || COLORS.accent;
  const modeLabel = MODE_LABELS[bookmark.mode] || bookmark.mode;

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le favori',
      `Supprimer ${bookmark.origin} → ${bookmark.dest} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => onDelete(bookmark.id),
        },
      ]
    );
  };

  return (
    <View style={s.card}>
      {/* Top row: route + trash */}
      <View style={s.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.route}>
            {bookmark.origin} → {bookmark.dest}
          </Text>
          <Text style={s.dateText}>{formatDate(bookmark.date)}</Text>
        </View>
        <TouchableOpacity style={s.trashBtn} onPress={handleDelete} activeOpacity={0.75}>
          <Text style={s.trashIcon}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom row: passengers + mode + price */}
      <View style={s.cardBottom}>
        <View style={s.pill}>
          <Text style={s.pillText}>
            {bookmark.passengers || 1} pax
          </Text>
        </View>
        <View style={[s.pill, { borderColor: modeColor }]}>
          <Text style={[s.pillText, { color: modeColor }]}>{modeLabel}</Text>
        </View>
        {bookmark.price != null && (
          <View style={s.priceChip}>
            <Text style={s.priceEst}>
              dès {Math.round(bookmark.price)} {bookmark.currency || 'EUR'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// BookmarksScreen
// ---------------------------------------------------------------------------
export default function BookmarksScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      setBookmarks([...getBookmarks()]);
    }, [])
  );

  const handleDelete = (id) => {
    removeBookmark(id);
    setBookmarks([...getBookmarks()]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>⭐ Mes favoris</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(b) => b.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <BookmarkCard bookmark={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>⭐</Text>
            <Text style={s.emptyTitle}>Aucun favori enregistré</Text>
            <Text style={s.emptySub}>
              Sauvegardez une recherche pour la retrouver ici rapidement.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:      { padding: 4, width: 36 },
  backIcon:     { color: COLORS.accent, fontSize: 22 },
  headerTitle:  { color: COLORS.text, fontSize: 17, fontWeight: '800' },

  // List
  list:         { padding: 16, paddingBottom: 40 },

  // Card
  card:         { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  route:        { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  dateText:     { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  trashBtn:     { backgroundColor: COLORS.card, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: COLORS.border, marginLeft: 8 },
  trashIcon:    { fontSize: 16 },

  cardBottom:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  pill:         { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  pillText:     { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  priceChip:    { marginLeft: 'auto' },
  priceEst:     { color: COLORS.accent, fontSize: 14, fontWeight: '800' },

  // Empty state
  empty:        { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyEmoji:   { fontSize: 52, marginBottom: 16 },
  emptyTitle:   { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub:     { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
