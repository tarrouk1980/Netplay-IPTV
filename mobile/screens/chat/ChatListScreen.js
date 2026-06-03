import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', pink: '#E91E8C',
};

const MOCK_CONVERSATIONS = [
  {
    id: 1, type: 'driver', avatar: '🧔', name: 'Achraf B.', role: 'Chauffeur',
    lastMsg: 'Je suis devant l\'entrée principale.', time: 'Il y a 2 min',
    unread: 2, online: true, rideId: 'TXI-7741',
  },
  {
    id: 2, type: 'support', avatar: '🎧', name: 'Support EASYWAY', role: 'Service client',
    lastMsg: 'Votre remboursement a été traité.', time: 'Il y a 1h',
    unread: 0, online: true, rideId: null,
  },
  {
    id: 3, type: 'livreur', avatar: '🛵', name: 'Khaled M.', role: 'Livreur',
    lastMsg: 'Votre commande est en route.', time: 'Hier',
    unread: 0, online: false, rideId: 'DEL-4421',
  },
  {
    id: 4, type: 'driver', avatar: '👨', name: 'Mohamed S.', role: 'Chauffeur',
    lastMsg: 'Merci pour la course ! Bonne journée.', time: 'Lun',
    unread: 0, online: false, rideId: 'TXI-7605',
  },
  {
    id: 5, type: 'support', avatar: '🎧', name: 'Support EASYWAY', role: 'Service client',
    lastMsg: 'Ticket #TKT-0091 créé pour votre réclamation.', time: '25/05',
    unread: 0, online: true, rideId: null,
  },
];

const TYPE_COLOR = { driver: COLORS.accent, livreur: COLORS.green, support: COLORS.blue };

export default function ChatListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [conversations] = useState(MOCK_CONVERSATIONS);

  const filtered = conversations.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  const renderItem = ({ item: c }) => {
    const tc = TYPE_COLOR[c.type] || COLORS.muted;
    return (
      <TouchableOpacity
        style={[styles.convRow, c.unread > 0 && styles.convRowUnread]}
        onPress={() => navigation.navigate('Chat', { conversationId: c.id, name: c.name, avatar: c.avatar })}
        activeOpacity={0.85}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 26 }}>{c.avatar}</Text>
          </View>
          {c.online && <View style={styles.onlineDot} />}
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={styles.convHeader}>
            <Text style={styles.convName} numberOfLines={1}>{c.name}</Text>
            <Text style={styles.convTime}>{c.time}</Text>
          </View>
          <View style={styles.convSubRow}>
            <View style={[styles.roleTag, { backgroundColor: tc + '22' }]}>
              <Text style={[styles.roleText, { color: tc }]}>{c.role}</Text>
            </View>
            {c.rideId && (
              <Text style={styles.rideRef}>{c.rideId}</Text>
            )}
          </View>
          <Text style={[styles.lastMsg, c.unread > 0 && { color: COLORS.white, fontWeight: '600' }]} numberOfLines={1}>
            {c.lastMsg}
          </Text>
        </View>

        {/* Unread badge */}
        {c.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadNum}>{c.unread}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Messagerie</Text>
          {totalUnread > 0 && (
            <View style={styles.totalUnreadBadge}>
              <Text style={styles.totalUnreadText}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Chat', { isSupport: true, name: 'Support EASYWAY', avatar: '🎧' })}>
          <Text style={{ fontSize: 22 }}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={{ color: COLORS.muted, fontSize: 16 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une conversation..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: COLORS.muted }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick filters */}
      <View style={styles.filtersRow}>
        {['Tous', 'Non lus', 'Support', 'Chauffeurs'].map((f) => (
          <TouchableOpacity key={f} style={styles.filterChip}>
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
            <Text style={styles.emptyText}>Aucune conversation</Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : {}}
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  totalUnreadBadge: {
    backgroundColor: COLORS.red, borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  totalUnreadText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 12, marginBottom: 8,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterText: { color: COLORS.muted, fontSize: 12 },
  convRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.bg,
  },
  convRowUnread: { backgroundColor: '#0E0C06' },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.border,
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.green, borderWidth: 2, borderColor: COLORS.bg,
  },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { color: COLORS.white, fontSize: 14, fontWeight: '700', flex: 1 },
  convTime: { color: COLORS.muted, fontSize: 11 },
  convSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  roleTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  roleText: { fontSize: 10, fontWeight: '700' },
  rideRef: { color: COLORS.border, fontSize: 10 },
  lastMsg: { color: COLORS.muted, fontSize: 13 },
  unreadBadge: {
    backgroundColor: COLORS.accent, borderRadius: 12, minWidth: 22, height: 22,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadNum: { color: '#000', fontSize: 11, fontWeight: '900' },
  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 82 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
