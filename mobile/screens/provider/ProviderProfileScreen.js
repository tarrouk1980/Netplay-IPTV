import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const ROLE_ICON = { CHAUFFEUR: '🚕', LIVREUR: '📦', DEPANNEUR: '🔧', MARCHAND: '🏪' };
const ROLE_LABEL = { CHAUFFEUR: 'Chauffeur Taxi', LIVREUR: 'Livreur', DEPANNEUR: 'Dépanneur', MARCHAND: 'Marchand' };

const MOCK_STATS = {
  totalEarnings: 4820.750, totalOrders: 612, rating: 4.8,
  ratingCount: 204, memberSince: 'Février 2025', completionRate: 97,
};

export default function ProviderProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(MOCK_STATS);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/provider/stats').then(r => setStats(r.data || MOCK_STATS)).catch(() => {});
  }, []);

  const startEdit = (field, val) => { setEditing(field); setEditValue(val || ''); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.patch('/api/auth/profile', { [editing]: editValue.trim() });
      setEditing(null);
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour.');
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => { logout(); navigation.replace('Login'); } },
    ]);
  };

  const role = user?.role || 'CHAUFFEUR';
  const kycApproved = user?.kycStatus === 'APPROVED';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{ROLE_ICON[role] || '👤'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Prestataire'}</Text>
          <Text style={styles.userRole}>{ROLE_LABEL[role] || role}</Text>
          <View style={[styles.kycBadge, kycApproved ? styles.kycOk : styles.kycPending]}>
            <Text style={[styles.kycText, { color: kycApproved ? COLORS.green : COLORS.accent }]}>
              {kycApproved ? '✓ KYC approuvé' : '⏳ KYC en attente'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.totalEarnings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>TND gagnés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>missions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>★ {stats.rating}</Text>
            <Text style={styles.statLabel}>{stats.ratingCount} avis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.green }]}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>complétion</Text>
          </View>
        </View>

        {/* Edit inline */}
        {editing && (
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Modifier {editing}</Text>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
              placeholderTextColor={COLORS.muted}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(null)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS</Text>
          {[
            { label: 'Nom', field: 'name', value: user?.name },
            { label: 'Téléphone', field: 'phone', value: user?.phone },
            { label: 'Email', field: 'email', value: user?.email },
          ].map(row => (
            <View key={row.field} style={styles.infoRow}>
              <View>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value || '—'}</Text>
              </View>
              <TouchableOpacity onPress={() => startEdit(row.field, row.value)} style={styles.editBtn}>
                <Text style={{ color: COLORS.accent, fontSize: 13 }}>✏️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Quick links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCÈS RAPIDE</Text>
          {[
            { icon: '💰', label: 'Relevé de revenus', screen: 'ProviderIncome' },
            { icon: '🔒', label: 'Sécurité', screen: 'SecuritySettings' },
            { icon: '📋', label: 'Documents KYC', screen: 'KYCPending' },
          ].map(item => (
            <TouchableOpacity
              key={item.screen}
              style={styles.navRow}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scroll: { padding: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent + '20',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    borderWidth: 2, borderColor: COLORS.accent + '50',
  },
  avatarEmoji: { fontSize: 36 },
  userName: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 2 },
  userRole: { color: COLORS.muted, fontSize: 13, marginBottom: 10 },
  kycBadge: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 5 },
  kycOk: { backgroundColor: COLORS.green + '15', borderColor: COLORS.green + '50' },
  kycPending: { backgroundColor: COLORS.accent + '15', borderColor: COLORS.accent + '50' },
  kycText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 9, marginTop: 2, textAlign: 'center' },
  editCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  editTitle: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  editInput: {
    backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  editActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 9, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 13 },
  saveBtn: { flex: 2, borderRadius: 10, backgroundColor: COLORS.accent, paddingVertical: 9, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  section: { marginBottom: 20 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  infoLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 3 },
  infoValue: { color: COLORS.text, fontSize: 14 },
  editBtn: { padding: 4 },
  navRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  navIcon: { fontSize: 18 },
  navLabel: { flex: 1, color: COLORS.text, fontSize: 14 },
  navArrow: { color: COLORS.muted, fontSize: 20 },
  logoutBtn: {
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.red + '60',
    backgroundColor: COLORS.red + '10', paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});
