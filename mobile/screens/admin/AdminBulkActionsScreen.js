import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#D32F2F', accentLight: '#FF5252', white: '#FFFFFF',
  muted: '#8A8A9A', border: '#2A2A3A', green: '#2E7D32',
  amber: '#F57C00', blue: '#1565C0',
};

const ROLE_OPTS = ['TOUS', 'CLIENT', 'CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'];
const STATUS_OPTS = ['TOUS', 'ACTIVE', 'BANNED', 'PENDING_KYC'];
const ROLE_EMOJI = { CLIENT: '👤', CHAUFFEUR: '🚕', LIVREUR: '🛵', DEPANNEUR: '🛻', MARCHAND: '🏪', ADMIN: '⚙️' };

const BULK_ACTIONS = [
  { key: 'BAN', label: 'Bannir', emoji: '🚫', color: COLORS.accent, confirm: true },
  { key: 'UNBAN', label: 'Débannir', emoji: '✅', color: COLORS.green, confirm: true },
  { key: 'NOTIFY', label: 'Notifier', emoji: '📣', color: COLORS.blue, confirm: false },
  { key: 'EXPORT', label: 'Exporter CSV', emoji: '📥', color: COLORS.amber, confirm: false },
  { key: 'VERIFY_KYC', label: 'Valider KYC', emoji: '🔖', color: COLORS.green, confirm: true },
  { key: 'REVOKE_KYC', label: 'Révoquer KYC', emoji: '❌', color: COLORS.accent, confirm: true },
];

const MOCK_USERS = Array.from({ length: 20 }, (_, i) => ({
  id: `user_${i + 1}`,
  name: ['Mohamed Bensalem', 'Farouk Trabelsi', 'Slim Mrad', 'Nour Jouini', 'Yassine Khalil',
    'Amira Nasri', 'Hamza Rejeb', 'Sana Gharsalli', 'Rami Boujarra', 'Ines Ferchichi',
    'Karim Souissi', 'Lina Dhahri', 'Omar Chaabane', 'Asma Khelil', 'Bilel Mzoughi',
    'Dorra Ben Amor', 'Firas Jlassi', 'Ghada Mnif', 'Houssem Dridi', 'Imen Oueslati'][i],
  role: ['CLIENT', 'CLIENT', 'CHAUFFEUR', 'CLIENT', 'LIVREUR', 'CLIENT', 'DEPANNEUR',
    'MARCHAND', 'CLIENT', 'CHAUFFEUR', 'CLIENT', 'LIVREUR', 'CLIENT', 'CLIENT', 'CHAUFFEUR',
    'CLIENT', 'LIVREUR', 'MARCHAND', 'CLIENT', 'CHAUFFEUR'][i],
  status: i === 3 || i === 11 ? 'BANNED' : i === 7 || i === 17 ? 'PENDING_KYC' : 'ACTIVE',
  orders: Math.floor(Math.random() * 80) + 1,
  joinedAt: new Date(Date.now() - Math.random() * 365 * 86400000).toISOString(),
}));

function FilterBar({ roleFilter, statusFilter, search, onRoleChange, onStatusChange, onSearchChange }) {
  return (
    <View style={styles.filterBar}>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={onSearchChange}
        placeholder="Rechercher par nom…"
        placeholderTextColor={COLORS.muted}
      />
      <ScrollRow>
        {ROLE_OPTS.map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, roleFilter === r && styles.filterChipActive]}
            onPress={() => onRoleChange(r)}
          >
            <Text style={[styles.filterChipText, roleFilter === r && styles.filterChipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollRow>
      <ScrollRow>
        {STATUS_OPTS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
            onPress={() => onStatusChange(s)}
          >
            <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollRow>
    </View>
  );
}

function ScrollRow({ children }) {
  const { ScrollView } = require('react-native');
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>{children}</View>
    </ScrollView>
  );
}

function UserRow({ user, selected, onToggle }) {
  const statusColor = { ACTIVE: COLORS.green, BANNED: COLORS.accent, PENDING_KYC: COLORS.amber }[user.status] || COLORS.muted;
  return (
    <TouchableOpacity style={[styles.userRow, selected && styles.userRowSelected]} onPress={() => onToggle(user.id)} activeOpacity={0.75}>
      <View style={[styles.checkbox, selected && styles.checkboxOn]}>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{(user.name || '?')[0].toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userMeta}>{ROLE_EMOJI[user.role] || '👤'} {user.role} · {user.orders} commandes</Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
    </TouchableOpacity>
  );
}

function ActionModal({ visible, action, count, onConfirm, onClose }) {
  const [message, setMessage] = useState('');
  if (!action) return null;
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.box}>
          <Text style={modal.title}>{action.emoji} {action.label}</Text>
          <Text style={modal.desc}>{count} utilisateur{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}</Text>
          {action.key === 'NOTIFY' && (
            <TextInput
              style={modal.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Message de la notification…"
              placeholderTextColor={COLORS.muted}
              multiline
            />
          )}
          <View style={modal.btns}>
            <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
              <Text style={modal.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[modal.confirmBtn, { backgroundColor: action.color }]} onPress={() => onConfirm(message)}>
              <Text style={modal.confirmText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminBulkActionsScreen({ navigation }) {
  const [users, setUsers] = useState(MOCK_USERS);
  const [filtered, setFiltered] = useState(MOCK_USERS);
  const [selected, setSelected] = useState(new Set());
  const [roleFilter, setRoleFilter] = useState('TOUS');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [executing, setExecuting] = useState(false);

  const applyFilters = useCallback(() => {
    let list = [...users];
    if (roleFilter !== 'TOUS') list = list.filter(u => u.role === roleFilter);
    if (statusFilter !== 'TOUS') list = list.filter(u => u.status === statusFilter);
    if (search.trim()) list = list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [users, roleFilter, statusFilter, search]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const toggleUser = (id) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(u => u.id)));
    }
  };

  const handleAction = (action) => {
    if (selected.size === 0) { Alert.alert('Sélectionnez au moins un utilisateur.'); return; }
    if (action.key === 'EXPORT') { exportCSV(); return; }
    setActionModal(action);
  };

  const exportCSV = async () => {
    const sel = filtered.filter(u => selected.has(u.id));
    const header = 'id,name,role,status,orders,joinedAt';
    const rows = sel.map(u => `${u.id},${u.name},${u.role},${u.status},${u.orders},${u.joinedAt.slice(0,10)}`);
    const csv = [header, ...rows].join('\n');
    const path = FileSystem.documentDirectory + `users_export_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Exporter les utilisateurs' });
  };

  const executeAction = async (message) => {
    setActionModal(null);
    setExecuting(true);
    const ids = Array.from(selected);
    try {
      await api.post('/api/admin/users/bulk', { action: actionModal.key, ids, message });
      if (actionModal.key === 'BAN') {
        setUsers(u => u.map(x => ids.includes(x.id) ? { ...x, status: 'BANNED' } : x));
      } else if (actionModal.key === 'UNBAN') {
        setUsers(u => u.map(x => ids.includes(x.id) ? { ...x, status: 'ACTIVE' } : x));
      }
      setSelected(new Set());
      Alert.alert('✅ Action exécutée', `${actionModal.label} appliqué à ${ids.length} utilisateur(s).`);
    } catch {
      Alert.alert('Erreur', 'Action impossible.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚡ Actions groupées</Text>
        <Text style={styles.headerCount}>{selected.size > 0 ? `${selected.size} sél.` : ''}</Text>
      </View>

      <FilterBar
        roleFilter={roleFilter} statusFilter={statusFilter} search={search}
        onRoleChange={setRoleFilter} onStatusChange={setStatusFilter} onSearchChange={setSearch}
      />

      {/* Bulk action buttons */}
      {selected.size > 0 && (
        <View style={styles.actionsBar}>
          <Text style={styles.actionsLabel}>{selected.size} sélectionné(s)</Text>
          <View style={styles.actionBtns}>
            {BULK_ACTIONS.map(a => (
              <TouchableOpacity
                key={a.key}
                style={[styles.actionChip, { borderColor: a.color }]}
                onPress={() => handleAction(a)}
              >
                <Text style={[styles.actionChipText, { color: a.color }]}>{a.emoji} {a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Select all / count */}
      <View style={styles.listHeader}>
        <TouchableOpacity style={styles.selectAllBtn} onPress={toggleAll}>
          <View style={[styles.checkbox, selected.size === filtered.length && filtered.length > 0 && styles.checkboxOn]}>
            {selected.size === filtered.length && filtered.length > 0 && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.selectAllText}>
            {selected.size === filtered.length && filtered.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.countText}>{filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}</Text>
      </View>

      {executing ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <UserRow user={item} selected={selected.has(item.id)} onToggle={toggleUser} />
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ActionModal
        visible={!!actionModal}
        action={actionModal}
        count={selected.size}
        onConfirm={executeAction}
        onClose={() => setActionModal(null)}
      />
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  headerCount: { color: COLORS.accent, fontSize: 14, fontWeight: '700', width: 60, textAlign: 'right' },
  filterBar: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  filterChipText: { color: COLORS.muted, fontSize: 12 },
  filterChipTextActive: { color: COLORS.accentLight, fontWeight: '700' },
  actionsBar: { backgroundColor: COLORS.surface, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  actionsLabel: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  actionBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    borderWidth: 1, backgroundColor: COLORS.surfaceAlt,
  },
  actionChipText: { fontSize: 12, fontWeight: '700' },
  listHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectAllText: { color: COLORS.muted, fontSize: 13 },
  countText: { color: COLORS.muted, fontSize: 13 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  userRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  userRowSelected: { backgroundColor: COLORS.accent + '10' },
  userAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
    marginLeft: 10,
  },
  userAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  userName: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  userMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000BB', alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, width: '85%', borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  desc: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, padding: 12, minHeight: 80, textAlignVertical: 'top', marginBottom: 16,
  },
  btns: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelText: { color: COLORS.muted, fontWeight: '700' },
  confirmBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  confirmText: { color: COLORS.white, fontWeight: '700' },
});
