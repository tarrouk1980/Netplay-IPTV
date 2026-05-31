import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useNotificationStore from '../../store/notificationStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  unread: '#1A1A2E',
  accent: '#D32F2F',
};

const TYPE_CONFIG = {
  ORDER_NEW: { emoji: '🆕', color: '#3498DB', category: 'Commandes' },
  ORDER_ACCEPTED: { emoji: '✅', color: '#27AE60', category: 'Commandes' },
  ORDER_IN_PROGRESS: { emoji: '🚗', color: '#F5A623', category: 'Commandes' },
  ORDER_COMPLETED: { emoji: '🎉', color: '#27AE60', category: 'Commandes' },
  ORDER_CANCELLED: { emoji: '❌', color: '#E74C3C', category: 'Commandes' },
  ORDER_DISPUTED: { emoji: '⚠️', color: '#E74C3C', category: 'Commandes' },
  SUBSCRIPTION_EXPIRING: { emoji: '⏰', color: '#F39C12', category: 'Compte' },
  SUBSCRIPTION_EXHAUSTED: { emoji: '🔴', color: '#E74C3C', category: 'Compte' },
  SUBSCRIPTION_SUSPENDED: { emoji: '🚫', color: '#E74C3C', category: 'Compte' },
  KYC_APPROVED: { emoji: '✅', color: '#27AE60', category: 'Compte' },
  KYC_REJECTED: { emoji: '❌', color: '#E74C3C', category: 'Compte' },
  PROMO: { emoji: '🎁', color: '#8E44AD', category: 'Promos' },
  WEATHER: { emoji: '🌧️', color: '#2196F3', category: 'Infos' },
  SYSTEM: { emoji: '📢', color: '#8E8E9A', category: 'Infos' },
};

const CATEGORY_FILTERS = [
  { key: '', label: 'Toutes' },
  { key: 'Commandes', label: '🚗 Commandes' },
  { key: 'Compte', label: '👤 Compte' },
  { key: 'Promos', label: '🎁 Promos' },
  { key: 'Infos', label: '📢 Infos' },
];

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  return `Il y a ${diffDays}j`;
}

function NotificationItem({ item, onPress, onDismiss }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.SYSTEM;

  return (
    <TouchableOpacity
      style={[styles.notifItem, !item.read && styles.notifItemUnread]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      {!item.read && <View style={styles.unreadDot} />}
      <View style={[styles.notifIcon, { backgroundColor: config.color + '20' }]}>
        <Text style={styles.notifEmoji}>{config.emoji}</Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <View style={styles.notifMeta}>
          <Text style={[styles.notifCategory, { color: config.color }]}>{config.category}</Text>
          <Text style={styles.notifTime}>{formatTime(item.receivedAt || item.createdAt)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={() => onDismiss(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }) {
  const { notifications, markRead, removeNotification, clearAll } = useNotificationStore();
  const [categoryFilter, setCategoryFilter] = useState('');

  const handlePress = useCallback((id) => {
    markRead(id);
  }, [markRead]);

  const handleDismiss = useCallback((id) => {
    removeNotification(id);
  }, [removeNotification]);

  const handleClearAll = () => {
    Alert.alert(
      'Effacer tout',
      'Supprimer toutes les notifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: clearAll },
      ]
    );
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) markAsRead(n.id);
    });
  };

  const filtered = categoryFilter
    ? notifications.filter(n => (TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM).category === categoryFilter)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>✓ Tout lire</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.headerBtn}>
              <Text style={[styles.headerBtnText, { color: COLORS.accent }]}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter chips */}
      <View style={styles.filterRow}>
        {CATEGORY_FILTERS.map(f => {
          const count = f.key
            ? notifications.filter(n => (TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM).category === f.key && !n.read).length
            : unreadCount;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, categoryFilter === f.key && styles.filterChipActive]}
              onPress={() => setCategoryFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, categoryFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
                {count > 0 ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptySub}>
            {categoryFilter ? 'Aucune notification dans cette catégorie.' : 'Vous êtes à jour !'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              onPress={handlePress}
              onDismiss={handleDismiss}
            />
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 30, color: COLORS.text, lineHeight: 30 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  headerSub: { color: COLORS.primary, fontSize: 12, marginTop: 1 },
  headerActions: { marginLeft: 'auto', flexDirection: 'row', gap: 8, alignItems: 'center' },
  headerBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerBtnText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary },
  filterChipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.primary },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
    position: 'relative',
  },
  notifItemUnread: { backgroundColor: COLORS.unread },
  unreadDot: {
    position: 'absolute',
    left: 6,
    top: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifEmoji: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  notifBody: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17 },
  notifMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  notifCategory: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  notifTime: { color: COLORS.textMuted, fontSize: 11 },
  dismissBtn: { padding: 4 },
  dismissText: { color: COLORS.textMuted, fontSize: 14 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
});
