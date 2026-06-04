import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const CATEGORIES = ['Toutes', 'Commandes', 'Promos', 'Système'];

const CAT_MAP = {
  ORDER: 'Commandes', PROMO: 'Promos', SYSTEM: 'Système',
};

const MOCK_NOTIFS = [
  { id: '1', type: 'ORDER', title: 'Chauffeur en route', body: 'Karim B. arrive dans 4 min.', time: '14:32', read: false },
  { id: '2', type: 'ORDER', title: 'Livraison terminée', body: 'Votre commande Pizza Roma a été livrée.', time: '13:15', read: false },
  { id: '3', type: 'PROMO', title: '🎁 Offre exclusive', body: '-20% sur votre prochaine course taxi ce soir !', time: '12:00', read: true },
  { id: '4', type: 'ORDER', title: 'Commande confirmée', body: 'Votre épicerie est en préparation.', time: 'Hier', read: true },
  { id: '5', type: 'SYSTEM', title: 'Mise à jour disponible', body: 'EasyWay v2.1 est disponible avec de nouvelles fonctionnalités.', time: 'Hier', read: true },
  { id: '6', type: 'PROMO', title: '🔧 SOS à -15%', body: 'Profitez de 15% de réduction sur le premier dépannage du mois.', time: '03 juin', read: true },
];

const TYPE_ICON = { ORDER: '📦', PROMO: '🎁', SYSTEM: '⚙️' };
const TYPE_COLOR = { ORDER: COLORS.blue, PROMO: COLORS.accent, SYSTEM: COLORS.muted };

function NotifItem({ item, onPress, onMarkRead }) {
  const icon = TYPE_ICON[item.type] || '🔔';
  const color = TYPE_COLOR[item.type] || COLORS.muted;
  return (
    <TouchableOpacity
      style={[styles.notifItem, !item.read && styles.notifItemUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.notifIcon, { backgroundColor: color + '20' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, !item.read && styles.notifTitleBold]}>{item.title}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function ClientNotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Toutes');

  const load = useCallback(() => {
    api.get('/api/client/notifications')
      .then(r => setNotifs(r.data.notifications || MOCK_NOTIFS))
      .catch(() => setNotifs(MOCK_NOTIFS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    await api.post('/api/client/notifications/read-all').catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handlePress = async (notif) => {
    if (!notif.read) {
      await api.post(`/api/client/notifications/${notif.id}/read`).catch(() => {});
      setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
  };

  const filtered = notifs.filter(n => {
    if (category === 'Toutes') return true;
    return CAT_MAP[n.type] === category;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>Tout lire</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <View style={styles.catRow}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.catBtn, category === c && styles.catBtnActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.catLabel, category === c && styles.catLabelActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={n => n.id}
          renderItem={({ item }) => (
            <NotifItem item={item} onPress={handlePress} />
          )}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Text style={{ fontSize: 48 }}>🔔</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune notification</Text>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  badge: { backgroundColor: COLORS.red, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  readAllBtn: { paddingHorizontal: 4 },
  readAllText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  catRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  catBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  catBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  catLabelActive: { color: '#000' },
  notifItem: {
    flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16,
    paddingVertical: 14, gap: 12,
  },
  notifItemUnread: { backgroundColor: COLORS.surface },
  notifIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { color: COLORS.muted, fontSize: 14, fontWeight: '500', flex: 1 },
  notifTitleBold: { color: COLORS.text, fontWeight: '700' },
  notifTime: { color: COLORS.muted, fontSize: 11, marginLeft: 8 },
  notifBody: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent,
    marginTop: 6,
  },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
});
