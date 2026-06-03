import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6', orange: '#E67E22',
};

const CATEGORIES = ['Tout', 'Courses', 'Livraisons', 'SOS', 'Promos', 'Système'];

const CAT_COLOR = {
  Courses: COLORS.accent, Livraisons: COLORS.green, SOS: COLORS.red,
  Promos: COLORS.purple, Système: COLORS.blue,
};

const MOCK = [
  {
    id: 1, type: 'Promos', icon: '🎁', read: false,
    title: 'Offre flash — 30% sur votre prochaine course !',
    body: 'Code FLASH30 valable jusqu\'à ce soir 23h59. Utilisez-le maintenant !',
    time: 'Il y a 5 min',
  },
  {
    id: 2, type: 'Courses', icon: '🚕', read: false,
    title: 'Votre chauffeur est arrivé',
    body: 'Achraf B. vous attend devant l\'entrée. Plaque : TUN-2234.',
    time: 'Il y a 18 min',
  },
  {
    id: 3, type: 'Livraisons', icon: '🛵', read: true,
    title: 'Colis livré avec succès',
    body: 'Votre commande GRO-8821 a été livrée à 14:35. Bon appétit !',
    time: 'Il y a 1h',
  },
  {
    id: 4, type: 'SOS', icon: '🔧', read: true,
    title: 'Dépanneur en route',
    body: 'Mohamed K. arrive dans ~12 minutes. Restez près de votre véhicule.',
    time: 'Il y a 2h',
  },
  {
    id: 5, type: 'Promos', icon: '⭐', read: true,
    title: 'Nouveau : EasyPass disponible !',
    body: 'Souscrivez à EasyPass et économisez jusqu\'à 40% par mois.',
    time: 'Hier',
  },
  {
    id: 6, type: 'Système', icon: '🔒', read: true,
    title: 'Connexion depuis un nouvel appareil',
    body: 'Une connexion a été détectée depuis un iPhone 15 Pro à Tunis.',
    time: 'Hier',
  },
  {
    id: 7, type: 'Courses', icon: '⭐', read: true,
    title: 'Évaluez votre course',
    body: 'Comment s\'est passée votre course avec Achraf B. ? Donnez votre avis.',
    time: 'Il y a 2 jours',
  },
  {
    id: 8, type: 'Promos', icon: '🎉', read: true,
    title: 'Bienvenue ! +10 TND offerts',
    body: 'Votre crédit de bienvenue a été crédité sur votre portefeuille.',
    time: 'Il y a 5 jours',
  },
];

export default function NotificationCenterV2Screen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState(MOCK);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filtered = notifications.filter(n => {
    const matchCat = activeCategory === 'Tout' || n.type === activeCategory;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead} disabled={unreadCount === 0}>
          <Text style={[styles.markAllText, unreadCount === 0 && { color: COLORS.border }]}>
            Tout lire
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: COLORS.muted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll}>
        <View style={styles.catsRow}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            const count = cat === 'Tout'
              ? notifications.filter(n => !n.read).length
              : notifications.filter(n => n.type === cat && !n.read).length;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, active && { backgroundColor: COLORS.accent, borderColor: COLORS.accent }]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.catText, active && { color: '#000' }]}>{cat}</Text>
                {count > 0 && (
                  <View style={[styles.catBadge, active && { backgroundColor: '#000' }]}>
                    <Text style={[styles.catBadgeText, active && { color: COLORS.accent }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
            <Text style={styles.emptyText}>Aucune notification</Text>
          </View>
        )}
        {filtered.map((n) => {
          const catColor = CAT_COLOR[n.type] || COLORS.accent;
          return (
            <TouchableOpacity
              key={n.id}
              style={[styles.notifCard, !n.read && styles.notifUnread]}
              onPress={() => markRead(n.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.notifIconWrap, { backgroundColor: catColor + '22', borderColor: catColor + '55' }]}>
                <Text style={{ fontSize: 22 }}>{n.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.notifHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: catColor + '22' }]}>
                    <Text style={[styles.typeText, { color: catColor }]}>{n.type}</Text>
                  </View>
                  <Text style={styles.notifTime}>{n.time}</Text>
                </View>
                <Text style={[styles.notifTitle, !n.read && { color: COLORS.white }]} numberOfLines={1}>
                  {n.title}
                </Text>
                <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
              </View>
              <View style={styles.notifRight}>
                {!n.read && <View style={styles.unreadDot} />}
                <TouchableOpacity onPress={() => deleteNotif(n.id)}>
                  <Text style={{ color: COLORS.border, fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  unreadBadge: {
    backgroundColor: COLORS.red, borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadCount: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  markAllText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  catsScroll: { marginTop: 10, marginBottom: 6 },
  catsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  catText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  catBadge: {
    backgroundColor: COLORS.red, borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  catBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
  notifCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  notifUnread: { borderColor: COLORS.accent + '55', backgroundColor: '#1A1408' },
  notifIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '700' },
  notifTime: { color: COLORS.muted, fontSize: 10 },
  notifTitle: { color: COLORS.muted, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  notifBody: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  notifRight: { alignItems: 'center', gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
});
