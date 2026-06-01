import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C',
  blue: '#1565C0', purple: '#7B1FA2',
};

const NOTIF_TYPES = {
  ORDER_UPDATE:   { emoji: '📦', color: COLORS.accent,  label: 'Commande' },
  PAYMENT:        { emoji: '💰', color: COLORS.green,   label: 'Paiement' },
  PROMO:          { emoji: '🎁', color: COLORS.purple,  label: 'Promo' },
  SYSTEM:         { emoji: '⚙️', color: COLORS.muted,   label: 'Système' },
  DRIVER_ARRIVED: { emoji: '📍', color: COLORS.blue,    label: 'Arrivée' },
  RATING:         { emoji: '⭐', color: COLORS.accent,  label: 'Avis' },
  KYC:            { emoji: '🔖', color: COLORS.green,   label: 'KYC' },
  POINTS:         { emoji: '🏆', color: '#FFD700',      label: 'Points' },
  SUPPORT:        { emoji: '💬', color: COLORS.blue,    label: 'Support' },
};

const FILTER_TABS = ['Tout', 'Non lus', 'Commandes', 'Promos', 'Système'];

const MOCK_NOTIFS = [
  { id: '1',  type: 'ORDER_UPDATE',   title: 'Votre chauffeur est en route',  body: 'Mohamed B. arrive dans ~5 min. Soyez prêt(e) !',                    read: false, createdAt: new Date(Date.now() - 120000).toISOString(),   action: { screen: 'MultiOrderTracker' } },
  { id: '2',  type: 'PAYMENT',        title: 'Paiement reçu',                 body: 'Votre wallet a été rechargé de 50 TND avec succès.',                 read: false, createdAt: new Date(Date.now() - 600000).toISOString(),   action: { screen: 'Wallet' } },
  { id: '3',  type: 'PROMO',          title: '🎉 Offre exclusive !',           body: '-20% sur votre prochain taxi. Code: EASY20. Valable 48h.',           read: false, createdAt: new Date(Date.now() - 3600000).toISOString(),  action: { screen: 'PromoCode' } },
  { id: '4',  type: 'POINTS',         title: '+15 EasyPoints gagnés',          body: 'Vous avez gagné 15 points pour votre trajet SOS.',                  read: true,  createdAt: new Date(Date.now() - 7200000).toISOString(),  action: { screen: 'EasyPointsDashboard' } },
  { id: '5',  type: 'DRIVER_ARRIVED', title: 'Votre livreur est arrivé',       body: 'Slim M. est devant votre porte avec votre commande.',               read: true,  createdAt: new Date(Date.now() - 86400000).toISOString(), action: null },
  { id: '6',  type: 'KYC',            title: 'KYC approuvé ✅',                body: 'Votre dossier a été validé. Votre compte est maintenant certifié.', read: true,  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), action: null },
  { id: '7',  type: 'RATING',         title: 'Notez votre dernier trajet',     body: 'Comment s\'est passé votre course avec Mohamed B. ?',               read: true,  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), action: { screen: 'History' } },
  { id: '8',  type: 'PROMO',          title: 'Livraison offerte ce week-end',  body: 'Commandez avant dimanche minuit et profitez de la livraison gratuite.', read: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), action: null },
  { id: '9',  type: 'SYSTEM',         title: 'Mise à jour disponible',         body: 'Une nouvelle version d\'EASYWAY est disponible sur le store.',      read: true,  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), action: null },
  { id: '10', type: 'SUPPORT',        title: 'Réponse de notre équipe',        body: 'Nour a répondu à votre ticket #A1B2C3D4.',                          read: true,  createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), action: { screen: 'LiveChat' } },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short' });
}

function NotifCard({ notif, onPress, onDismiss }) {
  const meta = NOTIF_TYPES[notif.type] || NOTIF_TYPES.SYSTEM;
  return (
    <TouchableOpacity
      style={[styles.card, !notif.read && styles.cardUnread]}
      onPress={() => onPress(notif)}
      onLongPress={() => onDismiss(notif.id)}
      activeOpacity={0.75}
    >
      {!notif.read && <View style={[styles.unreadDot, { backgroundColor: meta.color }]} />}
      <View style={[styles.iconBox, { backgroundColor: meta.color + '20' }]}>
        <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardTitle, !notif.read && { color: COLORS.white, fontWeight: '700' }]} numberOfLines={1}>
            {notif.title}
          </Text>
          <Text style={styles.cardTime}>{timeAgo(notif.createdAt)}</Text>
        </View>
        <Text style={styles.cardBody} numberOfLines={2}>{notif.body}</Text>
        <View style={[styles.typeBadge, { backgroundColor: meta.color + '20' }]}>
          <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationCenterScreen({ navigation }) {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [filter, setFilter] = useState('Tout');
  const [loading, setLoading] = useState(false);

  const unreadCount = notifs.filter(n => !n.read).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications');
      if (res.data?.notifications?.length) setNotifs(res.data.notifications);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = notifs.filter(n => {
    if (filter === 'Non lus') return !n.read;
    if (filter === 'Commandes') return ['ORDER_UPDATE', 'DRIVER_ARRIVED'].includes(n.type);
    if (filter === 'Promos') return n.type === 'PROMO';
    if (filter === 'Système') return ['SYSTEM', 'KYC', 'SUPPORT'].includes(n.type);
    return true;
  });

  const handlePress = (notif) => {
    setNotifs(ns => ns.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.action?.screen) {
      try { navigation.navigate(notif.action.screen, notif.action.params || {}); } catch {}
    }
    try { api.post(`/api/notifications/${notif.id}/read`); } catch {}
  };

  const handleDismiss = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette notification ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setNotifs(ns => ns.filter(n => n.id !== id)) },
    ]);
  };

  const markAllRead = () => {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    try { api.post('/api/notifications/read-all'); } catch {}
  };

  const clearAll = () => {
    Alert.alert('Effacer tout', 'Supprimer toutes les notifications ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive', onPress: () => setNotifs([]) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead} style={styles.headerAction}>
          <Text style={styles.headerActionText}>Tout lire</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>{tab}</Text>
            {tab === 'Non lus' && unreadCount > 0 && (
              <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{unreadCount}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptyText}>Vous êtes à jour !</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NotifCard notif={item} onPress={handlePress} onDismiss={handleDismiss} />
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            notifs.length > 0 ? (
              <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
                <Text style={styles.clearBtnText}>🗑️ Effacer tout</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  badge: { backgroundColor: COLORS.accent, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#000', fontSize: 11, fontWeight: '800' },
  headerAction: { paddingHorizontal: 4 },
  headerActionText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  filterRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterTab: { flex: 1, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  filterTabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  filterTabText: { color: COLORS.muted, fontSize: 12 },
  filterTabTextActive: { color: COLORS.accent, fontWeight: '700' },
  filterBadge: { backgroundColor: COLORS.accent, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  filterBadgeText: { color: '#000', fontSize: 9, fontWeight: '800' },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, position: 'relative',
  },
  cardUnread: { backgroundColor: COLORS.surface },
  unreadDot: { position: 'absolute', top: 18, left: 4, width: 8, height: 8, borderRadius: 4 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { color: COLORS.muted, fontSize: 14, flex: 1, marginRight: 8 },
  cardTime: { color: COLORS.muted, fontSize: 11 },
  cardBody: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginBottom: 6 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeLabel: { fontSize: 10, fontWeight: '700' },
  clearBtn: { margin: 16, alignItems: 'center', paddingVertical: 12 },
  clearBtnText: { color: COLORS.muted, fontSize: 14 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: COLORS.muted, fontSize: 14 },
});
