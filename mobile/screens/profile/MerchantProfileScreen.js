import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#252535',
  primary: '#F5A623',
  primaryDim: '#2A1F0A',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  error: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
};

const MERCHANT_CATEGORIES = [
  { value: 'RESTAURANT', label: 'Restaurant', emoji: '🍕' },
  { value: 'PHARMACY', label: 'Pharmacie', emoji: '💊' },
  { value: 'SUPERMARKET', label: 'Supermarché', emoji: '🛒' },
  { value: 'BEAUTY', label: 'Beauté', emoji: '💄' },
  { value: 'PETS', label: 'Animaux', emoji: '🐾' },
  { value: 'HIGHTECH', label: 'High-Tech', emoji: '💻' },
  { value: 'ELECTRO', label: 'Électro', emoji: '⚡' },
  { value: 'OTHER', label: 'Autre', emoji: '📦' },
];

function getCategoryInfo(value) {
  return MERCHANT_CATEGORIES.find((c) => c.value === value) || { label: value, emoji: '🏪' };
}

// ─── Edit modal (inline) ───────────────────────────────────────────────────────

function EditSection({ merchant, onSave, onCancel, isSaving }) {
  const [name, setName] = useState(merchant.name || '');
  const [address, setAddress] = useState(merchant.address || '');
  const [category, setCategory] = useState(merchant.category || 'RESTAURANT');
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Obligatoire';
    if (!address.trim()) e.address = 'Obligatoire';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({ name: name.trim(), address: address.trim(), category });
  }

  return (
    <View style={styles.editSection}>
      <Text style={styles.sectionTitle}>Modifier la boutique</Text>

      {/* Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Nom de la boutique <Text style={{ color: COLORS.primary }}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          value={name}
          onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
          placeholder="Nom de votre boutique"
          placeholderTextColor={COLORS.textMuted}
          editable={!isSaving}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
      </View>

      {/* Address */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Adresse <Text style={{ color: COLORS.primary }}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.address ? styles.inputError : null]}
          value={address}
          onChangeText={(v) => { setAddress(v); setErrors((e) => ({ ...e, address: undefined })); }}
          placeholder="Adresse complète"
          placeholderTextColor={COLORS.textMuted}
          editable={!isSaving}
          multiline
          numberOfLines={2}
        />
        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
      </View>

      {/* Category */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Catégorie</Text>
        <View style={styles.categoryGrid}>
          {MERCHANT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.catBtn, category === cat.value ? styles.catBtnSelected : null]}
              onPress={() => setCategory(cat.value)}
              disabled={isSaving}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, category === cat.value ? styles.catLabelSelected : null]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.editActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={isSaving}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving ? styles.btnDisabled : null]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? <ActivityIndicator color={COLORS.background} size="small" />
            : <Text style={styles.saveBtnText}>Enregistrer</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MerchantProfileScreen({ navigation }) {
  const { user } = useAuthStore();

  const [merchant, setMerchant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const fetchMerchant = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.get('/api/merchants/me');
      setMerchant(res.data.merchant);
    } catch (err) {
      if (!silent) {
        const msg = err.response?.data?.error || 'Impossible de charger le profil';
        Alert.alert('Erreur', msg);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchant();
  }, [fetchMerchant]);

  async function handleToggleOpen() {
    if (isToggling || !merchant) return;
    setIsToggling(true);
    try {
      const res = await api.patch('/api/merchants/me/toggle');
      setMerchant((prev) => ({ ...prev, isOpen: res.data.merchant.isOpen }));
    } catch (err) {
      const msg = err.response?.data?.error || 'Impossible de changer le statut';
      Alert.alert('Erreur', msg);
    } finally {
      setIsToggling(false);
    }
  }

  async function handleSaveProfile(data) {
    setIsSaving(true);
    try {
      const res = await api.patch('/api/merchants/me', data);
      setMerchant(res.data.merchant);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (err) {
      const msg = err.response?.data?.error || 'La mise à jour a échoué';
      Alert.alert('Erreur', msg);
    } finally {
      setIsSaving(false);
    }
  }

  function handleRefresh() {
    setIsRefreshing(true);
    fetchMerchant(true);
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!merchant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏪</Text>
          <Text style={styles.emptyTitle}>Profil non trouvé</Text>
          <Text style={styles.emptySubtitle}>
            Votre profil marchand n'a pas encore été créé.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => fetchMerchant()}>
            <Text style={styles.primaryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const catInfo = getCategoryInfo(merchant.category);
  const isKycPending = user?.kycStatus === 'PENDING';
  const isKycRejected = user?.kycStatus === 'REJECTED';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma boutique</Text>
        <TouchableOpacity
          style={styles.editHeaderBtn}
          onPress={() => setIsEditing((v) => !v)}
        >
          <Text style={styles.editHeaderBtnText}>{isEditing ? '✕' : '✏️'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* KYC Warning Banner */}
        {(isKycPending || isKycRejected) && (
          <TouchableOpacity
            style={[styles.kycBanner, isKycRejected ? styles.kycBannerRejected : null]}
            onPress={() => navigation.navigate('KYC')}
          >
            <Text style={styles.kycBannerIcon}>{isKycRejected ? '❌' : '⏳'}</Text>
            <View style={styles.kycBannerText}>
              <Text style={styles.kycBannerTitle}>
                {isKycRejected ? 'KYC rejeté' : 'Vérification en cours'}
              </Text>
              <Text style={styles.kycBannerSub}>
                {isKycRejected
                  ? 'Votre compte a été rejeté. Appuyez pour contacter le support.'
                  : 'Votre boutique sera activée après validation. Appuyez pour les détails.'}
              </Text>
            </View>
            <Text style={styles.kycBannerArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Profile card */}
        {!isEditing ? (
          <View style={styles.card}>
            {/* Shop header */}
            <View style={styles.shopHeader}>
              <View style={styles.shopIconContainer}>
                <Text style={styles.shopIcon}>{catInfo.emoji}</Text>
              </View>
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{merchant.name}</Text>
                <Text style={styles.shopCategory}>{catInfo.label}</Text>
              </View>
              <View style={[styles.statusBadge, merchant.isOpen ? styles.statusOpen : styles.statusClosed]}>
                <Text style={styles.statusBadgeText}>{merchant.isOpen ? 'Ouvert' : 'Fermé'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Details */}
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText}>{merchant.address || 'Adresse non renseignée'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📦</Text>
              <Text style={styles.detailText}>
                {merchant.products?.length ?? 0} produit{(merchant.products?.length ?? 0) !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🆔</Text>
              <Text style={[styles.detailText, styles.detailMuted]}>ID: {merchant.id}</Text>
            </View>
          </View>
        ) : (
          <EditSection
            merchant={merchant}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        )}

        {/* Open/Closed toggle */}
        {!isEditing && (
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>
                  {merchant.isOpen ? '🟢 Boutique ouverte' : '🔴 Boutique fermée'}
                </Text>
                <Text style={styles.toggleSubtitle}>
                  {merchant.isOpen
                    ? 'Les clients peuvent passer commande'
                    : 'Les commandes sont suspendues'}
                </Text>
              </View>
              {isToggling
                ? <ActivityIndicator color={COLORS.primary} />
                : (
                  <Switch
                    value={merchant.isOpen}
                    onValueChange={handleToggleOpen}
                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    thumbColor={merchant.isOpen ? COLORS.background : COLORS.textMuted}
                  />
                )
              }
            </View>
          </View>
        )}

        {/* Actions */}
        {!isEditing && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('MerchantDashboard')}
            >
              <Text style={styles.actionBtnIcon}>📋</Text>
              <View style={styles.actionBtnInfo}>
                <Text style={styles.actionBtnTitle}>Gérer mes produits</Text>
                <Text style={styles.actionBtnSub}>Ajouter, modifier ou supprimer des produits</Text>
              </View>
              <Text style={styles.actionBtnArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('MerchantOrders')}
            >
              <Text style={styles.actionBtnIcon}>🛍️</Text>
              <View style={styles.actionBtnInfo}>
                <Text style={styles.actionBtnTitle}>Mes commandes</Text>
                <Text style={styles.actionBtnSub}>Voir et gérer les commandes en cours</Text>
              </View>
              <Text style={styles.actionBtnArrow}>›</Text>
            </TouchableOpacity>

            {(isKycPending || isKycRejected) && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnWarning]}
                onPress={() => navigation.navigate('KYC')}
              >
                <Text style={styles.actionBtnIcon}>🔒</Text>
                <View style={styles.actionBtnInfo}>
                  <Text style={[styles.actionBtnTitle, { color: COLORS.warning }]}>
                    Documents KYC
                  </Text>
                  <Text style={styles.actionBtnSub}>
                    {isKycRejected ? 'KYC rejeté — contacter le support' : 'En attente de vérification'}
                  </Text>
                </View>
                <Text style={styles.actionBtnArrow}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Stats summary */}
        {!isEditing && (
          <View style={[styles.card, styles.statsCard]}>
            <Text style={styles.sectionTitle}>Résumé</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{merchant.products?.length ?? 0}</Text>
                <Text style={styles.statLabel}>Produits</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, merchant.isOpen ? { color: COLORS.success } : { color: COLORS.error }]}>
                  {merchant.isOpen ? 'Ouvert' : 'Fermé'}
                </Text>
                <Text style={styles.statLabel}>Statut</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{catInfo.emoji}</Text>
                <Text style={styles.statLabel}>{catInfo.label}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  backBtnText: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  headerTitle: { flex: 1, textAlign: 'center', color: COLORS.text, fontWeight: '800', fontSize: 18 },
  editHeaderBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  editHeaderBtnText: { fontSize: 18 },

  // ── Loading / empty
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.textMuted, fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  emptySubtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // ── Scroll
  scrollContent: { padding: 16, paddingBottom: 48 },

  // ── KYC banner
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1508',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A2A08',
    gap: 10,
  },
  kycBannerRejected: { backgroundColor: '#1A0808', borderColor: '#4A1010' },
  kycBannerIcon: { fontSize: 22 },
  kycBannerText: { flex: 1 },
  kycBannerTitle: { color: COLORS.warning, fontWeight: '700', fontSize: 13 },
  kycBannerSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2, lineHeight: 16 },
  kycBannerArrow: { color: COLORS.textMuted, fontSize: 20 },

  // ── Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  statsCard: { marginBottom: 0 },

  // ── Shop header
  shopHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shopIcon: { fontSize: 28 },
  shopInfo: { flex: 1 },
  shopName: { color: COLORS.text, fontWeight: '800', fontSize: 17 },
  shopCategory: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusOpen: { backgroundColor: '#0D2B0D' },
  statusClosed: { backgroundColor: '#2B0D0D' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.text },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },

  // ── Detail rows
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  detailIcon: { fontSize: 16, width: 20 },
  detailText: { color: COLORS.text, fontSize: 14, flex: 1, lineHeight: 20 },
  detailMuted: { color: COLORS.textMuted, fontSize: 12 },

  // ── Toggle
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleInfo: { flex: 1 },
  toggleTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  toggleSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },

  // ── Actions
  actionsSection: { marginBottom: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  actionBtnWarning: { borderWidth: 1, borderColor: '#3A2A08' },
  actionBtnIcon: { fontSize: 22 },
  actionBtnInfo: { flex: 1 },
  actionBtnTitle: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  actionBtnSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  actionBtnArrow: { color: COLORS.textMuted, fontSize: 22 },

  // ── Stats
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statValue: { color: COLORS.primary, fontWeight: '800', fontSize: 18 },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.border },

  // ── Section title
  sectionTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginBottom: 12 },

  // ── Edit section
  editSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catBtnSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  catEmoji: { fontSize: 18, marginBottom: 3 },
  catLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  catLabelSelected: { color: COLORS.primary },

  editActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },
  saveBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.background, fontWeight: '800', fontSize: 15 },

  // ── Primary button (empty state)
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: COLORS.background, fontWeight: '800', fontSize: 16 },
});
