import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
};

function Row({ label, value, valueColor }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueColor ? { color: valueColor } : null]}>{value ?? '—'}</Text>
    </View>
  );
}

export default function AdminPromoDetailScreen({ route, navigation }) {
  const { promoId, promoCode } = route.params || {};
  const [promo, setPromo] = useState(null);
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/admin/promo-codes/${promoId || promoCode}`);
      setPromo(res.data.promo);
      setUsages(res.data.usages || []);
      setMaxUses(res.data.promo?.maxUses?.toString() || '');
      setExpiresAt(res.data.promo?.expiresAt ? new Date(res.data.promo.expiresAt).toISOString().split('T')[0] : '');
    } catch {
      Alert.alert('Erreur', 'Code promo introuvable.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [promoId, promoCode]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/admin/promo-codes/${promoId || promoCode}`, {
        maxUses: parseInt(maxUses) || null,
        expiresAt: expiresAt || null,
      });
      Alert.alert('Sauvegardé ✅');
      setEditMode(false);
      load();
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = () => {
    Alert.alert('Désactiver ?', `Le code "${promo?.code}" ne pourra plus être utilisé.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Désactiver', style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/api/admin/promo-codes/${promoId || promoCode}`, { active: false });
            Alert.alert('Code désactivé');
            load();
          } catch {
            Alert.alert('Erreur');
          }
        },
      },
    ]);
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;
  if (!promo) return null;

  const usageRate = promo.maxUses ? ((promo.usedCount || 0) / promo.maxUses) * 100 : null;
  const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
  const isActive = promo.active && !isExpired;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🎟 {promo.code}</Text>
          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: isActive ? COLORS.green + '22' : COLORS.accent + '22', borderColor: isActive ? COLORS.green : COLORS.accent }]}>
              <Text style={[s.badgeTxt, { color: isActive ? COLORS.green : COLORS.accent }]}>{isActive ? '✅ Actif' : isExpired ? '⏰ Expiré' : '❌ Inactif'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Text style={s.editBtn}>{editMode ? 'Annuler' : '✏️ Modifier'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Stats cards */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: COLORS.orange }]}>{promo.discountValue}{promo.discountType === 'PERCENT' ? '%' : ' TND'}</Text>
            <Text style={s.statLabel}>Remise</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: COLORS.green }]}>{promo.usedCount || 0}</Text>
            <Text style={s.statLabel}>Utilisations</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{promo.maxUses || '∞'}</Text>
            <Text style={s.statLabel}>Limite</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: COLORS.orange }]}>
              {promo.totalSavings != null ? `${parseFloat(promo.totalSavings).toFixed(0)} TND` : '—'}
            </Text>
            <Text style={s.statLabel}>Économisé</Text>
          </View>
        </View>

        {/* Usage bar */}
        {usageRate != null && (
          <View style={s.usageCard}>
            <View style={s.usageHeader}>
              <Text style={s.usageLabel}>Taux d'utilisation</Text>
              <Text style={[s.usagePct, { color: usageRate >= 90 ? COLORS.accent : usageRate >= 60 ? COLORS.orange : COLORS.green }]}>
                {usageRate.toFixed(0)}%
              </Text>
            </View>
            <View style={s.usageTrack}>
              <View style={[s.usageFill, {
                width: `${Math.min(usageRate, 100)}%`,
                backgroundColor: usageRate >= 90 ? COLORS.accent : usageRate >= 60 ? COLORS.orange : COLORS.green,
              }]} />
            </View>
            <Text style={s.usageSub}>{promo.usedCount || 0} / {promo.maxUses} utilisations</Text>
          </View>
        )}

        {/* Details */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Détails</Text>
          <View style={s.card}>
            <Row label="Code" value={promo.code} />
            <Row label="Type" value={promo.discountType === 'PERCENT' ? 'Pourcentage' : 'Montant fixe'} />
            <Row label="Valeur" value={promo.discountType === 'PERCENT' ? `${promo.discountValue}%` : `${promo.discountValue} TND`} valueColor={COLORS.orange} />
            {promo.minOrderAmount && <Row label="Commande min." value={`${promo.minOrderAmount} TND`} />}
            {promo.serviceType && <Row label="Service" value={promo.serviceType} />}
            <Row label="Créé le" value={new Date(promo.createdAt).toLocaleDateString('fr-TN')} />
            {promo.expiresAt && <Row label="Expire le" value={new Date(promo.expiresAt).toLocaleDateString('fr-TN')} valueColor={isExpired ? COLORS.accent : COLORS.muted} />}
          </View>
        </View>

        {/* Edit form */}
        {editMode && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Modifier</Text>
            <View style={s.card}>
              <Text style={s.fieldLabel}>Limite d'utilisation (vide = illimité)</Text>
              <TextInput
                style={s.input}
                value={maxUses}
                onChangeText={setMaxUses}
                keyboardType="number-pad"
                placeholder="Illimité"
                placeholderTextColor={COLORS.muted}
              />
              <Text style={s.fieldLabel}>Date d'expiration (AAAA-MM-JJ)</Text>
              <TextInput
                style={s.input}
                value={expiresAt}
                onChangeText={setExpiresAt}
                placeholder="2025-12-31"
                placeholderTextColor={COLORS.muted}
              />
              <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.saveBtnTxt}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent usages */}
        {usages.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Utilisations récentes</Text>
            <View style={s.card}>
              {usages.slice(0, 10).map((u, i) => (
                <View key={i} style={[s.usageRow, i < usages.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.usageUser}>{u.user?.name || 'Utilisateur'}</Text>
                    <Text style={s.usageDate}>{new Date(u.usedAt || u.createdAt).toLocaleDateString('fr-TN')}</Text>
                  </View>
                  <Text style={s.usageAmount}>-{u.discount?.toFixed(3) || '?'} TND</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Deactivate */}
        {isActive && (
          <TouchableOpacity style={s.deactivateBtn} onPress={handleDeactivate}>
            <Text style={s.deactivateBtnTxt}>🚫 Désactiver ce code</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', marginTop: 4 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  editBtn: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 16, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statValue: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  usageCard: { backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 4 },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  usageLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  usagePct: { fontSize: 13, fontWeight: '700' },
  usageTrack: { height: 8, backgroundColor: COLORS.surfaceAlt, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  usageFill: { height: '100%', borderRadius: 4 },
  usageSub: { color: COLORS.muted, fontSize: 11 },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  fieldLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  saveBtn: { backgroundColor: COLORS.green, borderRadius: 10, padding: 12, alignItems: 'center' },
  saveBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  usageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  usageUser: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  usageDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  usageAmount: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  deactivateBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 12, marginHorizontal: 16, marginTop: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent },
  deactivateBtnTxt: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
});
