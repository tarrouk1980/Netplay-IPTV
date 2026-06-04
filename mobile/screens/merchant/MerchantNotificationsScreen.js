import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_NOTIFS = [
  { id: 'N1', icon: '🛍️', title: 'Nouvelle commande', body: 'Commande #CMD-0089 reçue — 3 articles · 18.500 TND', time: 'Il y a 5 min', read: false, type: 'order' },
  { id: 'N2', icon: '⭐', title: 'Nouvel avis client', body: 'Karim B. vous a attribué 5 étoiles : "Excellent service !"', time: 'Il y a 22 min', read: false, type: 'review' },
  { id: 'N3', icon: '📦', title: 'Stock bas', body: 'Tajine poulet : seulement 2 portions restantes', time: 'Il y a 1h', read: true, type: 'stock' },
  { id: 'N4', icon: '🛍️', title: 'Commande annulée', body: 'Commande #CMD-0085 annulée par le client', time: 'Il y a 2h', read: true, type: 'order' },
  { id: 'N5', icon: '💰', title: 'Paiement reçu', body: '42.000 TND crédités sur votre portefeuille', time: 'Hier 18:30', read: true, type: 'payment' },
  { id: 'N6', icon: '⏰', title: 'Rappel horaires', body: 'Votre boutique ferme dans 30 minutes selon votre planning', time: 'Hier 21:30', read: true, type: 'system' },
];

const PREFS_MOCK = {
  new_order: true,
  order_cancelled: true,
  new_review: true,
  low_stock: true,
  payment: true,
  promotions: false,
};

const PREF_LABELS = {
  new_order: '🛍️ Nouvelles commandes',
  order_cancelled: '❌ Commandes annulées',
  new_review: '⭐ Nouveaux avis',
  low_stock: '📦 Stock bas',
  payment: '💰 Paiements reçus',
  promotions: '📢 Promotions EasyWay',
};

const TYPE_COLORS = { order: COLORS.accent, review: COLORS.blue, stock: COLORS.orange, payment: COLORS.green, system: COLORS.muted };

function NotifCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: TYPE_COLORS[item.type] || COLORS.accent }]} />}
      <View style={styles.notifIcon}><Text style={{ fontSize: 22 }}>{item.icon}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MerchantNotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [prefs, setPrefs] = useState(PREFS_MOCK);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('notifs');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/merchant/notifications')
      .then(r => setNotifs(r.data.notifications || MOCK_NOTIFS))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRead = (item) => {
    setNotifs(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    api.patch(`/api/merchant/notifications/${item.id}/read`).catch(() => {});
  };

  const handleReadAll = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    api.post('/api/merchant/notifications/read-all').catch(() => {});
  };

  const handleTogglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    api.put('/api/merchant/notifications/preferences', next).catch(() => {});
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>🔔 Notifications</Text>
          {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>}
        </View>
        <TouchableOpacity onPress={handleReadAll} style={{ width: 60, alignItems: 'flex-end' }}>
          <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '700' }}>Tout lire</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {[{ k: 'notifs', l: 'Notifications' }, { k: 'prefs', l: 'Préférences' }].map(t => (
          <TouchableOpacity key={t.k} style={[styles.tabBtn, tab === t.k && styles.tabBtnActive]} onPress={() => setTab(t.k)}>
            <Text style={[styles.tabLabel, tab === t.k && styles.tabLabelActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'notifs' ? (
        loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
          <FlatList
            data={notifs}
            keyExtractor={n => n.id}
            renderItem={({ item }) => <NotifCard item={item} onPress={handleRead} />}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<View style={{ alignItems: 'center', paddingVertical: 60 }}><Text style={{ fontSize: 40 }}>🔔</Text><Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune notification</Text></View>}
          />
        )
      ) : (
        <FlatList
          data={Object.keys(prefs)}
          keyExtractor={k => k}
          renderItem={({ item: key }) => (
            <View style={styles.prefRow}>
              <Text style={styles.prefLabel}>{PREF_LABELS[key]}</Text>
              <Switch
                value={prefs[key]}
                onValueChange={() => handleTogglePref(key)}
                trackColor={{ false: COLORS.border, true: COLORS.accent + '80' }}
                thumbColor={prefs[key] ? COLORS.accent : COLORS.muted}
              />
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.prefsNote}>Choisissez les événements pour lesquels vous souhaitez recevoir une notification push.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 60 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  badge: { backgroundColor: COLORS.red, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, position: 'relative' },
  cardUnread: { borderColor: COLORS.accent + '40', backgroundColor: COLORS.accent + '05' },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4 },
  notifIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  notifTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800', marginBottom: 3 },
  notifBody: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  notifTime: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  prefLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1 },
  prefsNote: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: 16 },
});
