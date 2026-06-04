import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const TYPE_ICONS = {
  ORDER: '📦', TAXI: '🚕', SOS: '🔧', PROMO: '🎁',
  PAYMENT: '💳', SYSTEM: '⚙️', LOYALTY: '🏆',
};

const MOCK = [
  { id: '1', type: 'TAXI', title: 'Course terminée', body: 'Votre course avec Mohamed A. est terminée. Notez votre expérience !', read: false, date: 'Il y a 5 min' },
  { id: '2', type: 'PROMO', title: 'Offre exclusive !', body: '🎉 -20% sur votre prochaine course taxi avec le code EASY20. Valable 24h.', read: false, date: 'Il y a 1h' },
  { id: '3', type: 'ORDER', title: 'Livraison en route', body: 'Sami K. est parti avec votre commande. ETA : 12 min.', read: true, date: 'Il y a 2h' },
  { id: '4', type: 'LOYALTY', title: 'Nouveau badge !', body: 'Félicitations, vous atteignez le statut Silver ! 10% de réduction sur tous les services.', read: true, date: 'Hier' },
  { id: '5', type: 'PAYMENT', title: 'Paiement confirmé', body: 'Votre paiement de 12.500 TND a bien été traité.', read: true, date: 'Hier' },
  { id: '6', type: 'SOS', title: 'Technicien assigné', body: 'Karim M. prend en charge votre demande SOS. Il arrive dans ~20 min.', read: true, date: 'Il y a 3 jours' },
];

function NotifCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: COLORS.accent + (item.read ? '15' : '25') }]}>
        <Text style={styles.icon}>{TYPE_ICONS[item.type] || '🔔'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !item.read && { color: COLORS.accent }]}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ClientNotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.get('/api/client/notifications')
      .then(r => setNotifs(r.data.notifications || MOCK))
      .catch(() => setNotifs(MOCK))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = (item) => {
    setNotifs(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    api.post('/api/client/notifications/' + item.id + '/read').catch(() => {});
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    api.post('/api/client/notifications/read-all').catch(() => {});
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🔔 Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>Tout lire</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 64 }} />}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NotifCard item={item} onPress={markRead} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🔔</Text>
              <Text style={{ color: COLORS.muted, marginTop: 14, fontSize: 15 }}>Aucune notification</Text>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  countBadge: {
    backgroundColor: COLORS.red, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
  },
  countText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  readAllBtn: { paddingHorizontal: 4 },
  readAllText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  list: { padding: 16 },
  card: {
    flexDirection: 'row', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardUnread: { borderColor: COLORS.accent + '40', backgroundColor: COLORS.accent + '08' },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  title: { color: COLORS.text, fontSize: 14, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  body: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginBottom: 5 },
  date: { color: COLORS.muted, fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 80 },
});
