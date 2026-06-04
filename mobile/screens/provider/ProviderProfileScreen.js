import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, TextInput, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const MOCK = {
  name: 'Mohamed Ali Trabelsi',
  phone: '+216 22 111 222',
  email: 'mohamedali@example.com',
  role: 'CHAUFFEUR',
  rating: 4.8,
  totalTrips: 312,
  joinedAt: 'Décembre 2025',
  kyc: 'VERIFIED',
  vehicle: { brand: 'Volkswagen', model: 'Golf', year: '2021', plate: '123 TN 4567', color: 'Gris' },
  notifications: { newTrips: true, promotions: false, systemAlerts: true },
};

export default function ProviderProfileScreen({ navigation }) {
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({});

  const load = useCallback(() => {
    api.get('/api/provider/profile')
      .then(r => {
        const d = r.data || MOCK;
        setProfile(d);
        setForm({ name: d.name, email: d.email });
        setNotifPrefs(d.notifications || MOCK.notifications);
      })
      .catch(() => {
        setProfile(MOCK);
        setForm({ name: MOCK.name, email: MOCK.email });
        setNotifPrefs(MOCK.notifications);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/api/provider/profile', form);
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
    } catch {
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
    } finally { setSaving(false); }
  };

  const toggleNotif = (key) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    api.put('/api/provider/notifications', next).catch(() => {});
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => { logout(); navigation.replace('Login'); } },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const p = profile || MOCK;
  const kycColor = { VERIFIED: COLORS.green, PENDING: COLORS.accent, REJECTED: COLORS.red }[p.kyc] || COLORS.muted;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👤 Mon profil</Text>
        <TouchableOpacity onPress={() => editing ? saveProfile() : setEditing(true)} style={styles.editBtn}>
          <Text style={styles.editBtnText}>{editing ? (saving ? '...' : '✓') : '✏️'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 42 }}>👤</Text>
          </View>
          <Text style={styles.heroName}>{p.name}</Text>
          <Text style={styles.heroRole}>{p.role}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatNum, { color: COLORS.accent }]}>★ {p.rating}</Text>
              <Text style={styles.heroStatLabel}>Note</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{p.totalTrips}</Text>
              <Text style={styles.heroStatLabel}>Courses</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatNum, { color: kycColor, fontSize: 13 }]}>{p.kyc}</Text>
              <Text style={styles.heroStatLabel}>KYC</Text>
            </View>
          </View>
          <Text style={styles.heroJoined}>Membre depuis {p.joinedAt}</Text>
        </View>

        <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
        <View style={styles.card}>
          {editing ? (
            <>
              <Text style={styles.fieldLabel}>Nom complet</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                placeholderTextColor={COLORS.muted}
              />
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={v => setForm(f => ({ ...f, email: v }))}
                keyboardType="email-address"
                placeholderTextColor={COLORS.muted}
              />
            </>
          ) : (
            <>
              {[
                { label: 'Nom', value: p.name },
                { label: 'Téléphone', value: p.phone },
                { label: 'Email', value: p.email },
              ].map((f, i) => (
                <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
                  <Text style={styles.infoLabel}>{f.label}</Text>
                  <Text style={styles.infoValue}>{f.value}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {p.vehicle && (
          <>
            <Text style={styles.sectionTitle}>MON VÉHICULE</Text>
            <View style={styles.card}>
              {[
                { label: 'Marque / Modèle', value: p.vehicle.brand + ' ' + p.vehicle.model },
                { label: 'Année', value: p.vehicle.year },
                { label: 'Plaque', value: p.vehicle.plate },
                { label: 'Couleur', value: p.vehicle.color },
              ].map((f, i) => (
                <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
                  <Text style={styles.infoLabel}>{f.label}</Text>
                  <Text style={styles.infoValue}>{f.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          {[
            { key: 'newTrips', label: 'Nouvelles courses' },
            { key: 'promotions', label: 'Promotions' },
            { key: 'systemAlerts', label: 'Alertes système' },
          ].map((n, i) => (
            <View key={n.key} style={[styles.notifRow, i > 0 && styles.infoRowBorder]}>
              <Text style={styles.notifLabel}>{n.label}</Text>
              <Switch
                value={!!notifPrefs[n.key]}
                onValueChange={() => toggleNotif(n.key)}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor="#FFF"
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>ACTIONS</Text>
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow2} onPress={() => navigation.navigate('ProviderInsurance')}>
            <Text style={styles.actionIcon}>🛡️</Text>
            <Text style={styles.actionLabel}>Mon assurance</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow2, styles.actionRowBorder]} onPress={() => navigation.navigate('ClientSupport')}>
            <Text style={styles.actionIcon}>🎧</Text>
            <Text style={styles.actionLabel}>Support</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow2, styles.actionRowBorder, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={[styles.actionLabel, { color: COLORS.red }]}>Déconnexion</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 18 },
  scroll: { padding: 16 },
  heroCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 2, borderColor: COLORS.accent + '40',
  },
  heroName: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  heroRole: { color: COLORS.accent, fontSize: 13, fontWeight: '600', marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 10 },
  heroStat: { alignItems: 'center' },
  heroStatNum: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  heroStatLabel: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  heroDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  heroJoined: { color: COLORS.muted, fontSize: 12 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  infoLabel: { color: COLORS.muted, fontSize: 13 },
  infoValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  fieldLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bg, borderRadius: 10, padding: 12,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  notifLabel: { color: COLORS.text, fontSize: 14 },
  actionsCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  actionRow2: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  actionRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  actionIcon: { fontSize: 20 },
  actionLabel: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '600' },
  actionChevron: { color: COLORS.muted, fontSize: 20 },
});
