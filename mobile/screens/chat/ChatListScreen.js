import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', pink: '#E91E8C',
};

const TYPE_LABEL = { TAXI: 'Chauffeur', DELIVERY: 'Livreur', SOS: 'Dépanneur', GROCERY: 'Marchand' };
const TYPE_COLOR = { TAXI: COLORS.accent, DELIVERY: COLORS.green, SOS: COLORS.red, GROCERY: COLORS.blue };
const TYPE_ICON = { TAXI: '🧔', DELIVERY: '🛵', SOS: '🔧', GROCERY: '🛒' };

function formatRelative(date) {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return date.toLocaleDateString('fr-FR');
}

export default function ChatListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ordersRes = await api.get('/api/users/me/orders');
      const orders = (ordersRes.data.orders || []).filter((o) => o.providerId).slice(0, 20);

      const withMessages = await Promise.all(
        orders.map(async (o) => {
          let lastMsg = null;
          try {
            const msgsRes = await api.get(`/api/chat/${o.id}/messages`);
            const msgs = msgsRes.data || [];
            lastMsg = msgs[msgs.length - 1] || null;
          } catch {
            lastMsg = null;
          }
          return {
            id: o.id,
            type: o.serviceType,
            name: o.provider?.name || TYPE_LABEL[o.serviceType] || 'Prestataire',
            lastMsgText: lastMsg ? (lastMsg.text || (lastMsg.type === 'IMAGE' ? '📷 Photo' : lastMsg.type === 'VOICE' ? '🎤 Message vocal' : '')) : '',
            time: formatRelative(new Date(lastMsg?.createdAt || o.createdAt)),
            timestamp: new Date(lastMsg?.createdAt || o.createdAt).getTime(),
          };
        })
      );

      withMessages.sort((a, b) => b.timestamp - a.timestamp);
      setConversations(withMessages);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = conversations.filter((c) => {
    if (activeFilter === 'Chauffeurs' && c.type !== 'TAXI') return false;
    if (activeFilter === 'Livreurs' && c.type !== 'DELIVERY') return false;
    if (!search) return true;
    return c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMsgText.toLowerCase().includes(search.toLowerCase());
  });

  const renderItem = ({ item: c }) => {
    const tc = TYPE_COLOR[c.type] || COLORS.muted;
    return (
      <TouchableOpacity
        style={styles.convRow}
        onPress={() => navigation.navigate('Chat', { orderId: c.id, otherName: c.name, otherRole: TYPE_LABEL[c.type] || c.type })}
        activeOpacity={0.85}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 26 }}>{TYPE_ICON[c.type] || '💬'}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.convHeader}>
            <Text style={styles.convName} numberOfLines={1}>{c.name}</Text>
            <Text style={styles.convTime}>{c.time}</Text>
          </View>
          <View style={styles.convSubRow}>
            <View style={[styles.roleTag, { backgroundColor: tc + '22' }]}>
              <Text style={[styles.roleText, { color: tc }]}>{TYPE_LABEL[c.type] || c.type}</Text>
            </View>
          </View>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {c.lastMsgText || 'Aucun message'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Messagerie</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

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

      <View style={styles.filtersRow}>
        {['Tous', 'Chauffeurs', 'Livreurs'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && { backgroundColor: COLORS.accent, borderColor: COLORS.accent }]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && { color: '#000', fontWeight: '700' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger vos conversations.
          </Text>
          <TouchableOpacity onPress={load} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}
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
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.border,
  },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { color: COLORS.white, fontSize: 14, fontWeight: '700', flex: 1 },
  convTime: { color: COLORS.muted, fontSize: 11 },
  convSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  roleTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  roleText: { fontSize: 10, fontWeight: '700' },
  lastMsg: { color: COLORS.muted, fontSize: 13 },
  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 82 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
