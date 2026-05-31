import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  success: '#27AE60',
  danger: '#E74C3C',
};

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '29',
    period: '/mois',
    color: '#4A9EFF',
    features: [
      'Jusqu\'à 5 conducteurs',
      'Facturation mensuelle',
      'Tableau de bord entreprise',
      'Support prioritaire',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '79',
    period: '/mois',
    color: COLORS.accent,
    badge: 'Populaire',
    features: [
      'Jusqu\'à 20 conducteurs',
      'Facturation mensuelle + export',
      'Statistiques avancées',
      'Manager dédié',
      'Tarifs négociés',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '199',
    period: '/mois',
    color: '#E5E4E2',
    features: [
      'Conducteurs illimités',
      'API d\'intégration',
      'Facturation personnalisée',
      'SLA garanti',
      'Formation équipe',
    ],
  },
];

function PlanCard({ plan, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.planCard, selected && { borderColor: plan.color, borderWidth: 2 }]}
      onPress={() => onSelect(plan)}
      activeOpacity={0.85}
    >
      {plan.badge && (
        <View style={[styles.planBadge, { backgroundColor: plan.color }]}>
          <Text style={styles.planBadgeText}>{plan.badge}</Text>
        </View>
      )}
      <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
      <View style={styles.planPriceRow}>
        <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price} TND</Text>
        <Text style={styles.planPeriod}>{plan.period}</Text>
      </View>
      <View style={styles.planDivider} />
      {plan.features.map((f, i) => (
        <View key={i} style={styles.featureRow}>
          <Text style={[styles.featureCheck, { color: plan.color }]}>✓</Text>
          <Text style={styles.featureText}>{f}</Text>
        </View>
      ))}
      {selected && (
        <View style={[styles.selectedBadge, { backgroundColor: plan.color + '22', borderColor: plan.color }]}>
          <Text style={[styles.selectedBadgeText, { color: plan.color }]}>Sélectionné</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function EasyBusinessScreen({ navigation }) {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('plans'); // 'plans' | 'dashboard' | 'register'
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Register form
  const [companyName, setCompanyName] = useState('');
  const [companyTax, setCompanyTax] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [driverPhone, setDriverPhone] = useState('');
  const [driverName, setDriverName] = useState('');

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      const [statsRes, driversRes, invoicesRes] = await Promise.all([
        api.get('/api/business/stats').catch(() => ({ data: null })),
        api.get('/api/business/drivers').catch(() => ({ data: [] })),
        api.get('/api/business/invoices').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setDrivers(driversRes.data || []);
      setInvoices(invoicesRes.data || []);
      if (statsRes.data) setTab('dashboard');
    } catch {}
  };

  const handleRegister = async () => {
    if (!companyName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom de l\'entreprise.');
      return;
    }
    if (!companyEmail.trim() || !companyEmail.includes('@')) {
      Alert.alert('Erreur', 'Adresse email invalide.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/business/register', {
        companyName,
        taxId: companyTax,
        phone: companyPhone,
        email: companyEmail,
        plan: selectedPlan.id,
      });
      Alert.alert(
        'Demande envoyée !',
        'Notre équipe vous contactera dans les 24h pour finaliser votre compte entreprise.',
        [{ text: 'OK', onPress: fetchBusinessData }]
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Impossible d\'envoyer la demande.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async () => {
    if (!driverPhone.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/business/drivers', { phone: driverPhone, name: driverName });
      setShowAddDriver(false);
      setDriverPhone('');
      setDriverName('');
      fetchBusinessData();
      Alert.alert('Succès', 'Conducteur ajouté à votre compte entreprise.');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Impossible d\'ajouter ce conducteur.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDriver = (driverId) => {
    Alert.alert(
      'Retirer ce conducteur ?',
      'Le conducteur ne sera plus associé à votre compte entreprise.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/business/drivers/${driverId}`);
              fetchBusinessData();
            } catch {}
          },
        },
      ]
    );
  };

  // ── DEMO data if API not available ──
  const demoStats = stats || {
    planName: 'Business',
    driversCount: 3,
    ridesThisMonth: 47,
    totalSpent: 211.5,
    nextBilling: '2026-07-01',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏢 EasyBusiness</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: 'plans', label: 'Offres' },
          { key: 'register', label: 'S\'inscrire' },
          { key: 'dashboard', label: 'Dashboard' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabBtnText, tab === t.key && styles.tabBtnTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {/* ── PLANS TAB ── */}
        {tab === 'plans' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisissez votre formule</Text>
            <Text style={styles.sectionSub}>
              Gérez vos conducteurs, suivez vos dépenses et profitez de tarifs entreprise.
            </Text>
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlan.id === plan.id}
                onSelect={setSelectedPlan}
              />
            ))}
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => setTab('register')}
            >
              <Text style={styles.ctaBtnText}>Commencer avec {selectedPlan.name} →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── REGISTER TAB ── */}
        {tab === 'register' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Créer un compte entreprise</Text>
            <View style={[styles.selectedPlanBanner, { borderColor: selectedPlan.color }]}>
              <Text style={styles.selectedPlanLabel}>Formule sélectionnée :</Text>
              <Text style={[styles.selectedPlanValue, { color: selectedPlan.color }]}>
                {selectedPlan.name} — {selectedPlan.price} TND/mois
              </Text>
              <TouchableOpacity onPress={() => setTab('plans')}>
                <Text style={styles.changePlanLink}>Changer</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Nom de l'entreprise *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Transport Bourguiba SARL"
              placeholderTextColor={COLORS.textMuted}
              value={companyName}
              onChangeText={setCompanyName}
            />

            <Text style={styles.fieldLabel}>Matricule fiscal</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1234567/A/M/000"
              placeholderTextColor={COLORS.textMuted}
              value={companyTax}
              onChangeText={setCompanyTax}
              autoCapitalize="characters"
            />

            <Text style={styles.fieldLabel}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              placeholder="+216 XX XXX XXX"
              placeholderTextColor={COLORS.textMuted}
              value={companyPhone}
              onChangeText={setCompanyPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="contact@entreprise.tn"
              placeholderTextColor={COLORS.textMuted}
              value={companyEmail}
              onChangeText={setCompanyEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.ctaBtn, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.ctaBtnText}>Envoyer la demande</Text>
              }
            </TouchableOpacity>

            <Text style={styles.footNote}>
              Notre équipe vous contactera dans les 24h pour valider votre compte et configurer votre accès.
            </Text>
          </View>
        )}

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <View style={styles.section}>
            {/* Plan banner */}
            <View style={styles.dashPlanBanner}>
              <Text style={styles.dashPlanLabel}>Formule active</Text>
              <Text style={styles.dashPlanName}>{demoStats.planName}</Text>
              <Text style={styles.dashBilling}>
                Prochain paiement : {demoStats.nextBilling}
              </Text>
            </View>

            {/* KPIs */}
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{demoStats.driversCount}</Text>
                <Text style={styles.kpiLabel}>Conducteurs</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{demoStats.ridesThisMonth}</Text>
                <Text style={styles.kpiLabel}>Courses / mois</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={[styles.kpiValue, { color: COLORS.accent }]}>
                  {demoStats.totalSpent} TND
                </Text>
                <Text style={styles.kpiLabel}>Dépensé / mois</Text>
              </View>
            </View>

            {/* Drivers list */}
            <View style={styles.subsection}>
              <View style={styles.subsectionHeader}>
                <Text style={styles.subsectionTitle}>Conducteurs</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => setShowAddDriver(true)}
                >
                  <Text style={styles.addBtnText}>+ Ajouter</Text>
                </TouchableOpacity>
              </View>

              {drivers.length === 0 ? (
                <Text style={styles.emptyText}>Aucun conducteur associé</Text>
              ) : (
                drivers.map((d, i) => (
                  <View key={d.id || i} style={styles.driverRow}>
                    <View style={styles.driverAvatar}>
                      <Text style={styles.driverAvatarText}>{(d.name || 'D')[0].toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.driverName}>{d.name || 'Conducteur'}</Text>
                      <Text style={styles.driverPhone}>{d.phone}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveDriver(d.id)}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Invoices */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Factures</Text>
              {invoices.length === 0 ? (
                <Text style={styles.emptyText}>Aucune facture disponible</Text>
              ) : (
                invoices.map((inv, i) => (
                  <View key={inv.id || i} style={styles.invoiceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invoiceLabel}>{inv.label || `Facture #${i + 1}`}</Text>
                      <Text style={styles.invoiceDate}>{inv.date}</Text>
                    </View>
                    <Text style={[styles.invoiceAmount, { color: COLORS.accent }]}>
                      {inv.amount} TND
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Driver Modal */}
      <Modal visible={showAddDriver} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ajouter un conducteur</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du conducteur"
              placeholderTextColor={COLORS.textMuted}
              value={driverName}
              onChangeText={setDriverName}
            />
            <TextInput
              style={styles.input}
              placeholder="Numéro de téléphone"
              placeholderTextColor={COLORS.textMuted}
              value={driverPhone}
              onChangeText={setDriverPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => { setShowAddDriver(false); setDriverPhone(''); setDriverName(''); }}
              >
                <Text style={styles.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm, loading && { opacity: 0.6 }]}
                onPress={handleAddDriver}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#000" size="small" />
                  : <Text style={styles.modalBtnConfirmText}>Ajouter</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.text, fontSize: 28 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    marginHorizontal: 16, borderRadius: 12, padding: 4, marginBottom: 8,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLORS.accent },
  tabBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  tabBtnTextActive: { color: '#000' },
  section: { padding: 16 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  sectionSub: { color: COLORS.textMuted, fontSize: 13, marginBottom: 20 },
  planCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  planBadge: {
    position: 'absolute', top: -10, right: 16,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  planBadgeText: { color: '#000', fontSize: 11, fontWeight: '700' },
  planName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
  planPrice: { fontSize: 32, fontWeight: '800' },
  planPeriod: { color: COLORS.textMuted, fontSize: 14 },
  planDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  featureCheck: { fontWeight: '700', fontSize: 14 },
  featureText: { color: COLORS.textMuted, fontSize: 13, flex: 1 },
  selectedBadge: {
    marginTop: 12, paddingVertical: 8, borderRadius: 10,
    alignItems: 'center', borderWidth: 1,
  },
  selectedBadgeText: { fontWeight: '700', fontSize: 13 },
  ctaBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  ctaBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  selectedPlanBanner: {
    borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8,
  },
  selectedPlanLabel: { color: COLORS.textMuted, fontSize: 13 },
  selectedPlanValue: { fontWeight: '700', fontSize: 14, flex: 1 },
  changePlanLink: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  fieldLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#12121C', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  footNote: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 },
  dashPlanBanner: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    borderLeftWidth: 4, borderLeftColor: COLORS.accent, marginBottom: 16,
  },
  dashPlanLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  dashPlanName: { color: COLORS.accent, fontSize: 22, fontWeight: '800' },
  dashBilling: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  kpiCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  kpiValue: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  kpiLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' },
  subsection: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16 },
  subsectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subsectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  addBtn: { backgroundColor: COLORS.accent + '22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  driverRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  driverAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent + '33', alignItems: 'center', justifyContent: 'center' },
  driverAvatarText: { color: COLORS.accent, fontWeight: '700', fontSize: 16 },
  driverName: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  driverPhone: { color: COLORS.textMuted, fontSize: 12 },
  removeBtn: { color: COLORS.danger, fontSize: 16, padding: 4 },
  invoiceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  invoiceLabel: { color: COLORS.text, fontSize: 14 },
  invoiceDate: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  invoiceAmount: { fontWeight: '700', fontSize: 15 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: COLORS.border },
  modalBtnCancelText: { color: COLORS.textMuted, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: COLORS.accent },
  modalBtnConfirmText: { color: '#000', fontWeight: '700' },
});
