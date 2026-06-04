import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22', purple: '#9B59B6',
};

const ROLE_COLOR = {
  CHAUFFEUR: COLORS.accent, LIVREUR: COLORS.green,
  DEPANNEUR: COLORS.red, MARCHAND: COLORS.purple,
};

const TABS = ['En attente', 'Approuvés', 'Rejetés'];
const STATUS_TAB = { PENDING: 0, APPROVED: 1, REJECTED: 2 };

const MOCK_KYC = [
  { id: 'K1', name: 'Karim Ben Salah', role: 'CHAUFFEUR', status: 'PENDING', submittedAt: '2025-06-01', docs: ['CIN', 'Permis', 'Carte grise', 'Assurance'], note: '' },
  { id: 'K2', name: 'Yassine Mejri', role: 'LIVREUR', status: 'PENDING', submittedAt: '2025-06-02', docs: ['CIN', 'Photo moto'], note: '' },
  { id: 'K3', name: 'Mounir Tlili', role: 'DEPANNEUR', status: 'APPROVED', submittedAt: '2025-05-28', docs: ['CIN', 'Diplôme mécanicien', 'Photo camion'], note: '' },
  { id: 'K4', name: 'Sara Mansour', role: 'MARCHAND', status: 'REJECTED', submittedAt: '2025-05-25', docs: ['Registre commerce', 'CIN'], note: 'Document illisible' },
];

function KYCCard({ item, onApprove, onReject }) {
  const roleColor = ROLE_COLOR[item.role] || COLORS.muted;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: roleColor + '25' }]}>
          <Text style={[styles.avatarText, { color: roleColor }]}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{item.role}</Text>
          </View>
        </View>
        <Text style={styles.cardDate}>{item.submittedAt}</Text>
      </View>

      <View style={styles.docsRow}>
        {item.docs.map((doc, i) => (
          <View key={i} style={styles.docChip}>
            <Text style={styles.docText}>📄 {doc}</Text>
          </View>
        ))}
      </View>

      {!!item.note && (
        <View style={styles.noteRow}>
          <Text style={styles.noteText}>⚠️ {item.note}</Text>
        </View>
      )}

      {item.status === 'PENDING' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(item)}>
            <Text style={styles.rejectBtnText}>✕ Rejeter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove(item)}>
            <Text style={styles.approveBtnText}>✓ Approuver</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'APPROVED' && (
        <View style={styles.approvedBanner}>
          <Text style={styles.approvedBannerText}>✓ KYC approuvé</Text>
        </View>
      )}

      {item.status === 'REJECTED' && (
        <View style={styles.rejectedBanner}>
          <Text style={styles.rejectedBannerText}>✕ KYC rejeté</Text>
        </View>
      )}
    </View>
  );
}

export default function AdminKYCScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/kyc')
      .then(r => setItems(r.data.kyc || MOCK_KYC))
      .catch(() => setItems(MOCK_KYC))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = (kyc) => {
    Alert.alert(`Approuver ${kyc.name}`, 'Le prestataire pourra accéder à la plateforme.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Approuver', onPress: async () => {
          try {
            await api.post(`/api/admin/kyc/${kyc.id}/approve`);
            setItems(prev => prev.map(k => k.id === kyc.id ? { ...k, status: 'APPROVED' } : k));
          } catch { Alert.alert('Erreur', "Impossible d'approuver."); }
        },
      },
    ]);
  };

  const handleReject = (kyc) => {
    Alert.prompt('Motif de rejet', 'Expliquez brièvement la raison du rejet :', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Rejeter', style: 'destructive', onPress: async (note) => {
          try {
            await api.post(`/api/admin/kyc/${kyc.id}/reject`, { note });
            setItems(prev => prev.map(k => k.id === kyc.id ? { ...k, status: 'REJECTED', note: note || '' } : k));
          } catch { Alert.alert('Erreur', 'Impossible de rejeter.'); }
        },
      },
    ]);
  };

  const filtered = items.filter(k => {
    const matchTab = (STATUS_TAB[k.status] ?? 0) === tab;
    const q = search.toLowerCase();
    const matchSearch = !q || k.name.toLowerCase().includes(q) || k.role.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const pendingCount = items.filter(k => k.status === 'PENDING').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>Vérification KYC</Text>
          {pendingCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{pendingCount}</Text></View>
          )}
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[styles.tabBtn, tab === i && styles.tabBtnActive]} onPress={() => setTab(i)}>
            <Text style={[styles.tabLabel, tab === i && styles.tabLabelActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, rôle..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={k => k.id}
          renderItem={({ item }) => (
            <KYCCard item={item} onApprove={handleApprove} onReject={handleReject} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun dossier KYC ici</Text>
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
  badge: { backgroundColor: COLORS.orange, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  refreshBtn: { width: 40, alignItems: 'flex-end' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  roleBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  roleText: { fontSize: 11, fontWeight: '800' },
  cardDate: { color: COLORS.muted, fontSize: 11 },
  docsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  docChip: {
    backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.border,
  },
  docText: { color: COLORS.muted, fontSize: 11 },
  noteRow: {
    backgroundColor: COLORS.orange + '15', borderRadius: 8, padding: 8,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.orange + '40',
  },
  noteText: { color: COLORS.orange, fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.red,
    paddingVertical: 10, alignItems: 'center',
  },
  rejectBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  approveBtn: {
    flex: 2, borderRadius: 10, backgroundColor: COLORS.green,
    paddingVertical: 10, alignItems: 'center',
  },
  approveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  approvedBanner: {
    backgroundColor: COLORS.green + '20', borderRadius: 10, paddingVertical: 8,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.green + '50',
  },
  approvedBannerText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  rejectedBanner: {
    backgroundColor: COLORS.red + '20', borderRadius: 10, paddingVertical: 8,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.red + '50',
  },
  rejectedBannerText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
});
