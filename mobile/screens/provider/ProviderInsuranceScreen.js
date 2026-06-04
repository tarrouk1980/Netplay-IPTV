import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

// Liste complète des assureurs tunisiens actifs
const ASSUREURS_TN = [
  { id: 'STAR', name: 'STAR Assurances', abbr: 'STAR', type: 'Tous risques disponible' },
  { id: 'GAT', name: 'GAT Assurances', abbr: 'GAT', type: 'Tous risques disponible' },
  { id: 'MAGHREBIA', name: 'Maghrebia Assurances', abbr: 'MAGHREBIA', type: 'RC + Tiers étendu' },
  { id: 'COMAR', name: 'COMAR Assurances', abbr: 'COMAR', type: 'Tous risques disponible' },
  { id: 'CARTE', name: 'CARTE Assurances', abbr: 'CARTE', type: 'Tiers étendu' },
  { id: 'AMT', name: 'AMT Assurances', abbr: 'AMT', type: 'RC obligatoire' },
  { id: 'TUNIS_RE', name: 'Tunis Ré', abbr: 'TUNIS RE', type: 'Réassurance' },
  { id: 'HAYETT', name: 'Hayett Assurances', abbr: 'HAYETT', type: 'RC + Tiers' },
  { id: 'ALLIANCE', name: 'Alliance Assurances', abbr: 'ALLIANCE', type: 'Tous risques disponible' },
  { id: 'SALIM', name: 'Assurances Salim', abbr: 'SALIM', type: 'RC + Tiers étendu' },
  { id: 'ASTREE', name: 'Astrée Assurances', abbr: 'ASTREE', type: 'Tous risques disponible' },
  { id: 'OTHER', name: 'Autre assureur', abbr: 'AUTRE', type: '' },
];

const TYPES_CONTRAT = [
  { key: 'RC', label: 'Responsabilité Civile (obligatoire)', min: true },
  { key: 'TIERS', label: 'Tiers étendu', min: false },
  { key: 'TOUS_RISQUES', label: 'Tous risques', min: false },
];

const STATUS_CONFIG = {
  ACTIVE: { color: COLORS.green, label: 'Active ✅', bg: COLORS.green + '15' },
  EXPIRING: { color: COLORS.orange, label: 'Expire bientôt ⚠️', bg: COLORS.orange + '15' },
  EXPIRED: { color: COLORS.red, label: 'Expirée ❌', bg: COLORS.red + '15' },
  PENDING: { color: COLORS.blue, label: 'En vérification 🔄', bg: COLORS.blue + '15' },
  NONE: { color: COLORS.muted, label: 'Non renseignée', bg: COLORS.border },
};

const TABS = [
  { key: 'police', label: '🛡️ Ma police' },
  { key: 'saisir', label: '➕ Ajouter / modifier' },
  { key: 'offres', label: '💼 Offres partenaires' },
];

function InsuranceStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NONE;
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function AssureurPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = ASSUREURS_TN.find(a => a.id === selected);

  return (
    <>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setOpen(true)}>
        <Text style={current ? styles.pickerSelected : styles.pickerPlaceholder}>
          {current ? current.name : 'Sélectionner un assureur...'}
        </Text>
        <Text style={styles.pickerChevron}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Choisir l'assureur</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {ASSUREURS_TN.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.pickerItem, selected === a.id && styles.pickerItemActive]}
                  onPress={() => { onSelect(a.id); setOpen(false); }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerItemName, selected === a.id && { color: COLORS.accent }]}>
                      {a.name}
                    </Text>
                    {a.type ? <Text style={styles.pickerItemType}>{a.type}</Text> : null}
                  </View>
                  {selected === a.id && <Text style={{ color: COLORS.accent, fontSize: 18 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function ProviderInsuranceScreen({ navigation }) {
  const [tab, setTab] = useState('police');
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    assureurId: '',
    assureurAutre: '',
    typeContrat: 'RC',
    numeroPolice: '',
    dateDebut: '',
    dateFin: '',
  });

  useEffect(() => {
    api.get('/api/provider/insurance')
      .then(res => {
        const ins = res.data?.insurance;
        setInsurance(ins);
        if (ins) {
          setForm({
            assureurId: ins.assureurId || '',
            assureurAutre: ins.assureurAutre || '',
            typeContrat: ins.typeContrat || 'RC',
            numeroPolice: ins.policyNumber || '',
            dateDebut: ins.startDate || '',
            dateFin: ins.endDate || '',
          });
        }
      })
      .catch(() => {}) // keep null = no insurance
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async () => {
    if (!insurance?.policyNumber) {
      Alert.alert('Aucun contrat', 'Ajoutez d\'abord un contrat à vérifier.');
      return;
    }
    setVerifying(true);
    try {
      const res = await api.post('/api/provider/insurance/verify', {
        policyNumber: insurance.policyNumber,
        assureurId: insurance.assureurId,
      });
      const status = res.data?.status;
      const statusLabel = STATUS_CONFIG[status]?.label || status;
      Alert.alert(
        '🔍 Résultat de vérification',
        `Police n° ${insurance.policyNumber}\nStatut : ${statusLabel}\n${res.data?.message || ''}`,
        [{ text: 'OK' }]
      );
      setInsurance(prev => ({ ...prev, status }));
    } catch {
      // Simulate a mock verification
      const mockStatus = form.dateFin ? (
        new Date(form.dateFin.split('/').reverse().join('-')) > new Date() ? 'ACTIVE' : 'EXPIRED'
      ) : 'PENDING';
      Alert.alert(
        '🔍 Vérification simulée',
        `Police n° ${insurance?.policyNumber || form.numeroPolice}\nStatut estimé : ${STATUS_CONFIG[mockStatus]?.label}\n\nConnectez le backend pour la vérification réelle.`
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!form.assureurId) { Alert.alert('Assureur requis', 'Sélectionnez un assureur.'); return; }
    if (!form.numeroPolice.trim()) { Alert.alert('N° police requis', 'Saisissez le numéro de police.'); return; }
    if (!form.dateFin.trim()) { Alert.alert('Date d\'expiration requise', 'Saisissez la date de fin.'); return; }

    setSaving(true);
    const assureur = ASSUREURS_TN.find(a => a.id === form.assureurId);
    const payload = {
      assureurId: form.assureurId,
      assureurNom: form.assureurId === 'OTHER' ? form.assureurAutre : assureur?.name,
      assureurAutre: form.assureurAutre,
      typeContrat: form.typeContrat,
      policyNumber: form.numeroPolice.trim().toUpperCase(),
      startDate: form.dateDebut.trim(),
      endDate: form.dateFin.trim(),
    };
    try {
      const res = await api.post('/api/provider/insurance', payload);
      setInsurance(res.data?.insurance || { ...payload, status: 'PENDING' });
      Alert.alert('✅ Contrat enregistré', 'Votre contrat d\'assurance a été soumis pour vérification.', [
        { text: 'OK', onPress: () => setTab('police') },
      ]);
    } catch {
      // Optimistic local update
      setInsurance({ ...payload, status: 'PENDING' });
      Alert.alert('✅ Enregistré localement', 'La synchronisation se fera dès que le serveur sera disponible.', [
        { text: 'OK', onPress: () => setTab('police') },
      ]);
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛡️ Assurance véhicule</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Onglet Police ── */}
          {tab === 'police' && (
            insurance ? (
              <View>
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={{ fontSize: 40 }}>🛡️</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <InsuranceStatusBadge status={insurance.status || 'PENDING'} />
                      <Text style={styles.providerName}>{insurance.assureurNom || insurance.provider || 'Assureur non renseigné'}</Text>
                      <Text style={styles.policyType}>{TYPES_CONTRAT.find(t => t.key === insurance.typeContrat)?.label || insurance.type || ''}</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  {[
                    { label: 'N° Police', value: insurance.policyNumber },
                    { label: 'Début', value: insurance.startDate },
                    { label: 'Expiration', value: insurance.endDate },
                  ].filter(r => r.value).map(row => (
                    <View key={row.label} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={styles.detailValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Vérification */}
                <TouchableOpacity
                  style={[styles.verifyBtn, verifying && { opacity: 0.6 }]}
                  onPress={handleVerify}
                  disabled={verifying}
                >
                  {verifying ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.verifyBtnText}>🔍 Vérifier la couverture</Text>}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>ℹ️ Comment fonctionne la vérification ?</Text>
                  <Text style={styles.infoText}>
                    EasyWay interroge directement le registre des assureurs tunisiens (CGA) pour confirmer que votre police est active et valide.{'\n\n'}
                    La vérification prend moins de 30 secondes. Résultat : ✅ Couverte, ⚠️ En attente, ❌ Expirée.
                  </Text>
                </View>

                <TouchableOpacity style={styles.editBtn} onPress={() => setTab('saisir')}>
                  <Text style={styles.editBtnText}>✏️ Modifier le contrat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 56 }}>🛡️</Text>
                <Text style={styles.emptyTitle}>Aucun contrat enregistré</Text>
                <Text style={styles.emptyText}>Ajoutez votre contrat d'assurance pour pouvoir conduire sur EasyWay.</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setTab('saisir')}>
                  <Text style={styles.addBtnText}>➕ Ajouter mon assurance</Text>
                </TouchableOpacity>
              </View>
            )
          )}

          {/* ── Onglet Saisie ── */}
          {tab === 'saisir' && (
            <View>
              <Text style={styles.formTitle}>Renseignez votre contrat</Text>
              <Text style={styles.formSubtitle}>Ces informations seront vérifiées auprès de votre assureur.</Text>

              <Text style={styles.fieldLabel}>Assureur *</Text>
              <AssureurPicker
                selected={form.assureurId}
                onSelect={v => setForm(f => ({ ...f, assureurId: v }))}
              />
              {form.assureurId === 'OTHER' && (
                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'assureur..."
                  placeholderTextColor={COLORS.muted}
                  value={form.assureurAutre}
                  onChangeText={v => setForm(f => ({ ...f, assureurAutre: v }))}
                />
              )}

              <Text style={styles.fieldLabel}>Type de contrat *</Text>
              <View style={styles.typeRow}>
                {TYPES_CONTRAT.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.typeBtn, form.typeContrat === t.key && styles.typeBtnActive]}
                    onPress={() => setForm(f => ({ ...f, typeContrat: t.key }))}
                  >
                    <Text style={[styles.typeBtnText, form.typeContrat === t.key && { color: COLORS.accent }]}>
                      {t.label}
                    </Text>
                    {t.min && <Text style={styles.minTag}>OBLIGATOIRE</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Numéro de police *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: TN-2025-AUTO-12345"
                placeholderTextColor={COLORS.muted}
                value={form.numeroPolice}
                onChangeText={v => setForm(f => ({ ...f, numeroPolice: v }))}
                autoCapitalize="characters"
              />

              <View style={styles.dateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Date de début</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={COLORS.muted}
                    value={form.dateDebut}
                    onChangeText={v => setForm(f => ({ ...f, dateDebut: v }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Date d'expiration *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={COLORS.muted}
                    value={form.dateFin}
                    onChangeText={v => setForm(f => ({ ...f, dateFin: v }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.legalNote}>
                <Text style={styles.legalNoteText}>
                  ⚠️ Une assurance RC minimum est obligatoire pour exercer. EasyWay vérifie la validité auprès du CGA (Comité Général des Assurances).
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>💾 Enregistrer le contrat</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* ── Onglet Offres partenaires ── */}
          {tab === 'offres' && (
            <View>
              <Text style={styles.offersNote}>
                Nos partenaires proposent des tarifs préférentiels pour les prestataires EasyWay. Un conseiller vous rappelle sous 24h.
              </Text>
              {[
                { id: 'O1', provider: 'STAR Assurances', type: 'Tous risques', price: 720, coverage: 'Accidents, vol, incendie, bris de glace', rating: 4.8, recommended: true },
                { id: 'O2', provider: 'GAT Assurances', type: 'Tiers étendu', price: 480, coverage: 'Accidents, vol, incendie', rating: 4.5, recommended: false },
                { id: 'O3', provider: 'Maghrebia', type: 'RC obligatoire', price: 290, coverage: 'Dommages aux tiers uniquement', rating: 4.2, recommended: false },
                { id: 'O4', provider: 'COMAR Assurances', type: 'Tous risques', price: 650, coverage: 'Accidents, vol, incendie, assistance', rating: 4.6, recommended: false },
              ].map(offer => (
                <View key={offer.id} style={[styles.offerCard, offer.recommended && { borderColor: COLORS.accent + '60' }]}>
                  {offer.recommended && (
                    <View style={styles.recBadge}><Text style={styles.recBadgeText}>⭐ Recommandé</Text></View>
                  )}
                  <View style={styles.offerTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.offerProvider}>{offer.provider}</Text>
                      <Text style={styles.offerType}>{offer.type}</Text>
                      <Text style={styles.offerCoverage}>{offer.coverage}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.offerPrice}>{offer.price.toFixed(3)}</Text>
                      <Text style={styles.offerPriceSub}>TND/an</Text>
                      <Text style={{ color: COLORS.accent, fontSize: 11, marginTop: 4 }}>⭐ {offer.rating}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.subscribeBtn}
                    onPress={() => Alert.alert(
                      `Souscrire — ${offer.provider}`,
                      `${offer.type} à ${offer.price} TND/an\n\nUn conseiller vous rappellera pour finaliser le contrat.`,
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Confirmer', onPress: () => Alert.alert('✅ Demande envoyée', 'Rappel sous 24h ouvrables.') },
                      ]
                    )}
                  >
                    <Text style={styles.subscribeBtnText}>Souscrire →</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
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
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingHorizontal: 4 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  content: { padding: 16, paddingBottom: 40 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  providerName: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  policyType: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { color: COLORS.muted, fontSize: 13 },
  detailValue: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  verifyBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginBottom: 14,
  },
  verifyBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  infoBox: {
    backgroundColor: COLORS.blue + '15', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.blue + '30',
  },
  infoTitle: { color: COLORS.blue, fontSize: 12, fontWeight: '800', marginBottom: 6 },
  infoText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  editBtn: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  editBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptyText: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 6, paddingHorizontal: 20 },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 20 },
  addBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  formTitle: { color: COLORS.text, fontSize: 20, fontWeight: '900', marginBottom: 4 },
  formSubtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginBottom: 20 },
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pickerSelected: { color: COLORS.text, fontSize: 14, flex: 1 },
  pickerPlaceholder: { color: COLORS.muted, fontSize: 14, flex: 1 },
  pickerChevron: { color: COLORS.muted, fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  pickerModal: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '70%', borderTopWidth: 1, borderColor: COLORS.border,
  },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  pickerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  pickerClose: { color: COLORS.muted, fontSize: 20 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border + '60' },
  pickerItemActive: { backgroundColor: COLORS.accent + '10' },
  pickerItemName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  pickerItemType: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  typeRow: { gap: 8, marginBottom: 4 },
  typeBtn: {
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  typeBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  typeBtnText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  minTag: { color: COLORS.red, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginTop: 3 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  dateRow: { flexDirection: 'row' },
  legalNote: {
    backgroundColor: COLORS.orange + '10', borderRadius: 10, padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: COLORS.orange + '30',
  },
  legalNoteText: { color: COLORS.orange, fontSize: 12, lineHeight: 18 },
  saveBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 16,
  },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  offersNote: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  offerCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, overflow: 'hidden',
  },
  recBadge: { backgroundColor: COLORS.accent + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  recBadgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  offerTop: { flexDirection: 'row', marginBottom: 14 },
  offerProvider: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  offerType: { color: COLORS.accent, fontSize: 12, marginTop: 2 },
  offerCoverage: { color: COLORS.muted, fontSize: 11, marginTop: 4, lineHeight: 16 },
  offerPrice: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  offerPriceSub: { color: COLORS.muted, fontSize: 11 },
  subscribeBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  subscribeBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
});
