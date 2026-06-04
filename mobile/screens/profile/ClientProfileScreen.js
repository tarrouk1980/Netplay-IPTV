import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const MOCK_STATS = { totalOrders: 47, totalSpent: 312.750, memberSince: 'Janvier 2025', loyalty: 'Gold' };

function Field({ label, value, onEdit }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldValue}>{value || '—'}</Text>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editIcon}>
            <Text style={{ color: COLORS.accent, fontSize: 13 }}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function ClientProfileScreen({ navigation }) {
  const { user, updateProfile, logout } = useAuthStore();
  const [stats, setStats] = useState(MOCK_STATS);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/client/stats').then(r => setStats(r.data || MOCK_STATS)).catch(() => {});
  }, []);

  const startEdit = (field, currentValue) => {
    setEditing(field);
    setEditValue(currentValue || '');
  };

  const saveEdit = async () => {
    if (!editValue.trim()) return;
    setSaving(true);
    try {
      await api.patch('/api/auth/profile', { [editing]: editValue.trim() });
      if (updateProfile) updateProfile({ [editing]: editValue.trim() });
      setEditing(null);
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => { logout(); navigation.replace('Login'); } },
    ]);
  };

  const loyaltyColor = stats.loyalty === 'Gold' ? '#FFD700' : stats.loyalty === 'Silver' ? '#C0C0C0' : COLORS.accent;

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

        {/* Avatar hero */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={[styles.loyaltyBadge, { borderColor: loyaltyColor + '60', backgroundColor: loyaltyColor + '15' }]}>
            <Text style={[styles.loyaltyText, { color: loyaltyColor }]}>
              {stats.loyalty === 'Gold' ? '🥇' : stats.loyalty === 'Silver' ? '🥈' : '🥉'} {stats.loyalty}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>commandes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.totalSpent.toFixed(3)}</Text>
            <Text style={styles.statLabel}>TND dépensés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats.memberSince?.split(' ')[1] || '2025'}</Text>
            <Text style={styles.statLabel}>membre depuis</Text>
          </View>
        </View>

        {/* Edit form (inline) */}
        {editing ? (
          <View style={styles.editCard}>
            <Text style={styles.editCardTitle}>Modifier {editing}</Text>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
              placeholderTextColor={COLORS.muted}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditing(null)}>
                <Text style={styles.cancelEditText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveEditBtn} onPress={saveEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveEditText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Info section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
          <Field label="Nom complet" value={user?.name} onEdit={() => startEdit('name', user?.name)} />
          <Field label="Téléphone" value={user?.phone} onEdit={() => startEdit('phone', user?.phone)} />
          <Field label="Email" value={user?.email} />
        </View>

        {/* Quick nav */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MON COMPTE</Text>
          {[
            { icon: '🏠', label: 'Mes adresses', screen: 'ClientSavedAddresses' },
            { icon: '📋', label: 'Historique courses', screen: 'ClientRideHistory' },
            { icon: '🔔', label: 'Notifications', screen: 'ClientNotifications' },
            { icon: '🔒', label: 'Sécurité', screen: 'SecuritySettings' },
            { icon: '💳', label: 'Portefeuille', screen: 'Wallet' },
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

        {/* Logout */}
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
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent + '25',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 2, borderColor: COLORS.accent + '50',
  },
  avatarLetter: { color: COLORS.accent, fontSize: 36, fontWeight: '900' },
  userName: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  userEmail: { color: COLORS.muted, fontSize: 13, marginBottom: 12 },
  loyaltyBadge: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 5 },
  loyaltyText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  editCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  editCardTitle: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  editInput: {
    backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  editActions: { flexDirection: 'row', gap: 10 },
  cancelEditBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 9, alignItems: 'center',
  },
  cancelEditText: { color: COLORS.muted, fontSize: 13 },
  saveEditBtn: { flex: 2, borderRadius: 10, backgroundColor: COLORS.accent, paddingVertical: 9, alignItems: 'center' },
  saveEditText: { color: '#000', fontSize: 13, fontWeight: '700' },
  section: { marginBottom: 20 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  field: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  fieldLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 4 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldValue: { color: COLORS.text, fontSize: 15 },
  editIcon: { padding: 4 },
  navRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  navIcon: { fontSize: 18 },
  navLabel: { flex: 1, color: COLORS.text, fontSize: 14 },
  navArrow: { color: COLORS.muted, fontSize: 20 },
  logoutBtn: {
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.red + '60',
    backgroundColor: COLORS.red + '10', paddingVertical: 14, alignItems: 'center', marginBottom: 8,
  },
  logoutText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});
