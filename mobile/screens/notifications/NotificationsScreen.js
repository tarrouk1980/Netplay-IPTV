import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useNotificationStore from '../../store/notificationStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  unread: '#1E1E2E',
};

const TYPE_CONFIG = {
  ORDER_NEW: { emoji: '🆕', color: '#3498DB' },
  ORDER_ACCEPTED: { emoji: '✅', color: '#27AE60' },
  ORDER_IN_PROGRESS: { emoji: '🚗', color: '#F5A623' },
  ORDER_COMPLETED: { emoji: '🎉', color: '#27AE60' },
  ORDER_CANCELLED: { emoji: '❌', color: '#E74C3C' },
  ORDER_DISPUTED: { emoji: '⚠️', color: '#E74C3C' },
  SUBSCRIPTION_EXPIRING: { emoji: '⏰', color: '#F39C12' },
  SUBSCRIPTION_EXHAUSTED: { emoji: '🔴', color: '#E74C3C' },
  KYC_APPROVED: { emoji: '✅', color: '#27AE60' },
  KYC_REJECTED: { emoji: '❌', color: '#E74C3C' },
  PROMO: { emoji: '🎁', color: '#8E44AD' },
  SYSTEM: { emoji: '📢', color: '#8E8E9A' },
};

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
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
      <View style={[styles.notifIcon, { backgroundColor: config.color + '20' }]}>
        <Text style={styles.notifEmoji}>{config.emoji}</Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: config.color }]} />}
      <TouchableOpacity style={styles.dismissBtn} onPress={() => onDismiss(item.id)}>
        <Text style={styles.dismissText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }) {
  const { notifications, markRead, markAllRead, removeNotification, unreadCount } = useNotificationStore();

  const handlePress = useCallback((id) => markRead(id), [markRead]);
  const handleDismiss = useCallback((id) => removeNotification(id), [removeNotification]);

  const renderItem = useCallback(
    ({ item }) => (
      <NotificationItem item={item} onPress={handlePress} onDismiss={handleDismiss} />
    ),
    [handlePress, handleDismiss]
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔔</Text>
      <Text style={styles.emptyTitle}>Aucune notification</Text>
      <Text style={styles.emptySubtitle}>Vous n'avez pas encore de notifications</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllBtn}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { color: COLORS.primary, fontSize: 22, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.text },
  markAllBtn: { color: COLORS.primary, fontSize: 13 },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    gap: 12,
  },
  notifItemUnread: { backgroundColor: COLORS.unread },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmoji: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTitle: { color: COLORS.text, fontWeight: '600', fontSize: 14, marginBottom: 2 },
  notifBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  notifTime: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  dismissBtn: { padding: 8 },
  dismissText: { color: COLORS.textMuted, fontSize: 20, lineHeight: 22 },
  separator: { height: 1, backgroundColor: COLORS.border },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
