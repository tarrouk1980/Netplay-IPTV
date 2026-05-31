import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  accentLight: '#FF5252',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
  greenLight: '#4CAF50',
  amber: '#F57C00',
  orange: '#F5A623',
};

const INSURERS = [
  { id: 'GAT', label: 'GAT Assurances' },
  { id: 'STAR', label: 'STAR Assurances' },
  { id: 'MAGHREBIA', label: 'Maghrebia Assurances' },
  { id: 'COTUNACE', label: 'COTUNACE' },
  { id: 'AMI', label: 'AMI Assurances' },
  { id: 'ASTREE', label: 'Astrée' },
  { id: 'TIKWA', label: 'Tikwa' },
  { id: 'CARTE', label: 'CARTE Assurances' },
  { id: 'OTHER', label: 'Autre' },
];

const COVERAGE_OPTIONS = [
  { key: 'REMORQUAGE', label: '🚚 Remorquage', desc: 'Prise en charge du remorquage de votre véhicule' },
  { key: 'PANNE', label: '🔧 Assistance panne', desc: 'Intervention mécanique sur place' },
  { key: 'ACCIDENT', label: '🚗 Accident', desc: 'Assistance en cas d\'accident de la route' },
];

export default function EasyInsuranceScreen({ navigation }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form fields
  const [insurerId, setInsurerId] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [coverageTypes, setCoverageTypes] = useState([]);

  useEffect(() => {
    loadContract();
  }, []);

  const loadContract = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/insurance/contracts/me');
      const c = res.data.contract;
      setContract(c);
      // Pre-fill form
      setInsurerId(c.insurerId);
      setContractNumber(c.contractNumber);
      setExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 10) : '');
      setCoverageTypes(c.coverageTypes || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setContract(null);
        setEditMode(true); // No contract — open form directly
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCoverage = (key) => {
    setCoverageTypes(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const validateDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

  const saveContract = async () => {
    if (!insurerId) { Alert.alert('Erreur', 'Sélectionnez votre assureur.'); return; }
    if (!contractNumber.trim()) { Alert.alert('Erreur', 'Entrez le numéro de contrat.'); return; }
    if (!validateDate(expiresAt)) { Alert.alert('Erreur', 'Date d\'expiration invalide. Format: AAAA-MM-JJ'); return; }
    if (coverageTypes.length === 0) { Alert.alert('Erreur', 'Sélectionnez au moins un type de couverture.'); return; }

    setSaving(true);
    try {
      const res = await api.post('/api/insurance/contracts', {
        insurerId,
        contractNumber: contractNumber.trim(),
        expiresAt: new Date(expiresAt).toISOString(),
        coverageTypes,
      });
      setContract(res.data.contract);
      setEditMode(false);
      Alert.alert('✅ Contrat enregistré', 'Votre contrat d\'assurance a été sauvegardé avec succès.');
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de sauvegarder le contrat.');
    } finally {
      setSaving(false);
    }
  };

  const isExpired = contract && new Date(contract.expiresAt) < new Date();
  const daysLeft = contract
    ? Math.ceil((new Date(contract.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛡️ Mon Assurance</Text>
        {contract && !editMode && (
          <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editBtn}>
            <Text style={styles.editText}>Modifier</Text>
          </TouchableOpacity>
        )}
        {!contract && <View style={{ width: 70 }} />}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }}>

          {/* Status banner */}
          {contract && !editMode && (
            <View style={[styles.banner, isExpired ? styles.bannerRed : daysLeft <= 30 ? styles.bannerAmber : styles.bannerGreen]}>
              <Text style={styles.bannerIcon}>{isExpired ? '⚠️' : daysLeft <= 30 ? '⏰' : '✅'}</Text>
              <View>
                <Text style={styles.bannerTitle}>
                  {isExpired ? 'Contrat expiré' : daysLeft <= 30 ? `Expire dans ${daysLeft} jours` : 'Contrat valide'}
                </Text>
                <Text style={styles.bannerSub}>
                  {isExpired ? 'Renouvelez votre assurance immédiatement' : `Valide jusqu'au ${new Date(contract.expiresAt).toLocaleDateString('fr-TN')}`}
                </Text>
              </View>
            </View>
          )}

          {/* View mode: contract details */}
          {contract && !editMode && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Détails du contrat</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Assureur</Text>
                <Text style={styles.rowValue}>
                  {INSURERS.find(i => i.id === contract.insurerId)?.label || contract.insurerId}
                </Text>
              </View>
              <View style={styles.separator} />

              <View style={styles.row}>
                <Text style={styles.rowLabel}>N° Contrat</Text>
                <Text style={styles.rowValue}>{contract.contractNumber}</Text>
              </View>
              <View style={styles.separator} />

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Expiration</Text>
                <Text style={[styles.rowValue, isExpired && { color: COLORS.accentLight }]}>
                  {new Date(contract.expiresAt).toLocaleDateString('fr-TN')}
                </Text>
              </View>
              <View style={styles.separator} />

              <Text style={[styles.rowLabel, { marginBottom: 10 }]}>Couvertures</Text>
              {COVERAGE_OPTIONS.filter(o => (contract.coverageTypes || []).includes(o.key)).map(o => (
                <View key={o.key} style={styles.coverageChip}>
                  <Text style={styles.coverageChipText}>{o.label}</Text>
                  <Text style={styles.coverageChipDesc}>{o.desc}</Text>
                </View>
              ))}
            </View>
          )}

          {/* No contract yet */}
          {!contract && !editMode && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🛡️</Text>
              <Text style={styles.emptyTitle}>Aucun contrat enregistré</Text>
              <Text style={styles.emptySub}>Ajoutez votre contrat d'assurance pour l'activer lors de vos demandes SOS.</Text>
            </View>
          )}

          {/* Edit / Create form */}
          {editMode && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{contract ? 'Modifier le contrat' : 'Enregistrer votre assurance'}</Text>

              {/* Insurer selector */}
              <Text style={styles.fieldLabel}>Assureur *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
                  {INSURERS.map(ins => (
                    <TouchableOpacity
                      key={ins.id}
                      style={[styles.insurerChip, insurerId === ins.id && styles.insurerChipActive]}
                      onPress={() => setInsurerId(ins.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.insurerChipText, insurerId === ins.id && styles.insurerChipTextActive]}>
                        {ins.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Contract number */}
              <Text style={styles.fieldLabel}>Numéro de contrat *</Text>
              <TextInput
                style={styles.input}
                value={contractNumber}
                onChangeText={setContractNumber}
                placeholder="Ex: GAT-2024-123456"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="characters"
              />

              {/* Expiry date */}
              <Text style={styles.fieldLabel}>Date d'expiration *</Text>
              <TextInput
                style={styles.input}
                value={expiresAt}
                onChangeText={setExpiresAt}
                placeholder="AAAA-MM-JJ (ex: 2025-12-31)"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                maxLength={10}
              />

              {/* Coverage types */}
              <Text style={styles.fieldLabel}>Types de couverture *</Text>
              {COVERAGE_OPTIONS.map(o => (
                <TouchableOpacity
                  key={o.key}
                  style={[styles.coverageOption, coverageTypes.includes(o.key) && styles.coverageOptionActive]}
                  onPress={() => toggleCoverage(o.key)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.checkbox, coverageTypes.includes(o.key) && styles.checkboxActive]}>
                    {coverageTypes.includes(o.key) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coverageOptionLabel}>{o.label}</Text>
                    <Text style={styles.coverageOptionDesc}>{o.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Save button */}
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={saveContract}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.saveBtnText}>💾 Enregistrer le contrat</Text>
                }
              </TouchableOpacity>

              {editMode && contract && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditMode(false)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Info box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ À quoi ça sert ?</Text>
            <Text style={styles.infoText}>
              Votre contrat d'assurance est consulté automatiquement lors d'une demande SOS. Il permet à EASYWAY de coordonner l'intervention avec votre assureur et de facturer directement si votre couverture le permet.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4, minWidth: 40 },
  backText: { fontSize: 30, color: COLORS.white, lineHeight: 30 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  editBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.accent + '44' },
  editText: { color: COLORS.accentLight, fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  bannerGreen: { backgroundColor: COLORS.green + '22', borderColor: COLORS.greenLight + '44' },
  bannerAmber: { backgroundColor: COLORS.amber + '22', borderColor: COLORS.amber + '44' },
  bannerRed: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accentLight + '44' },
  bannerIcon: { fontSize: 28 },
  bannerTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  bannerSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    margin: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.white, fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  separator: { height: 1, backgroundColor: COLORS.border },
  coverageChip: {
    backgroundColor: COLORS.green + '22',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.greenLight + '33',
  },
  coverageChipText: { color: COLORS.greenLight, fontSize: 13, fontWeight: '700' },
  coverageChipDesc: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  fieldLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.white,
    fontSize: 15,
    marginBottom: 16,
  },
  insurerChip: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insurerChipActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  insurerChipText: { color: COLORS.muted, fontSize: 13 },
  insurerChipTextActive: { color: COLORS.accentLight, fontWeight: '700' },
  coverageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  coverageOptionActive: { borderColor: COLORS.green + '88', backgroundColor: COLORS.green + '11' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  coverageOptionLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  coverageOptionDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelBtnText: { color: COLORS.muted, fontSize: 14 },
  infoBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 14,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  infoTitle: { color: COLORS.orange, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  infoText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
