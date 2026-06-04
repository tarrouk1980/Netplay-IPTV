import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const STATUS_COLOR = { APPROVED: COLORS.green, PENDING: COLORS.orange, REJECTED: COLORS.red, MISSING: COLORS.muted };
const STATUS_LABEL = { APPROVED: '✅ Approuvé', PENDING: '⏳ En cours de vérification', REJECTED: '❌ Refusé', MISSING: '📎 À fournir' };

const DOC_CONFIGS = {
  CHAUFFEUR: [
    { key: 'cin', label: 'Carte d\'identité nationale', icon: '🪪', required: true },
    { key: 'permis', label: 'Permis de conduire', icon: '🪪', required: true },
    { key: 'carte_grise', label: 'Carte grise véhicule', icon: '🚗', required: true },
    { key: 'assurance', label: 'Assurance véhicule', icon: '🛡️', required: true },
    { key: 'visite_technique', label: 'Visite technique', icon: '🔧', required: true },
    { key: 'casier_judiciaire', label: 'Casier judiciaire', icon: '📄', required: false },
  ],
  LIVREUR: [
    { key: 'cin', label: 'Carte d\'identité nationale', icon: '🪪', required: true },
    { key: 'permis', label: 'Permis (si moto)', icon: '🪪', required: false },
    { key: 'carte_grise', label: 'Carte grise', icon: '🛵', required: true },
    { key: 'assurance', label: 'Assurance véhicule', icon: '🛡️', required: true },
  ],
  DEPANNEUR: [
    { key: 'cin', label: 'Carte d\'identité nationale', icon: '🪪', required: true },
    { key: 'certification', label: 'Certification professionnelle', icon: '📜', required: true },
    { key: 'permis', label: 'Permis de conduire', icon: '🪪', required: true },
    { key: 'assurance', label: 'Assurance responsabilité', icon: '🛡️', required: true },
  ],
  MARCHAND: [
    { key: 'cin', label: 'Carte d\'identité nationale', icon: '🪪', required: true },
    { key: 'patente', label: 'Patente commerciale', icon: '📜', required: true },
    { key: 'registre_commerce', label: 'Registre de commerce', icon: '🏢', required: true },
    { key: 'photo_boutique', label: 'Photo de la boutique', icon: '📷', required: false },
  ],
};

const MOCK_DOCS = {
  cin: { status: 'APPROVED', uploadedAt: '20 mai 2025', note: null },
  permis: { status: 'APPROVED', uploadedAt: '20 mai 2025', note: null },
  carte_grise: { status: 'PENDING', uploadedAt: '25 mai 2025', note: null },
  assurance: { status: 'REJECTED', uploadedAt: '18 mai 2025', note: 'Document expiré. Merci de fournir une assurance valide.' },
  visite_technique: { status: 'MISSING', uploadedAt: null, note: null },
  casier_judiciaire: { status: 'MISSING', uploadedAt: null, note: null },
};

export default function ProviderDocumentsScreen({ navigation, route }) {
  const role = route?.params?.role || 'CHAUFFEUR';
  const docs = DOC_CONFIGS[role] || DOC_CONFIGS.CHAUFFEUR;

  const [docStatus, setDocStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    api.get('/api/provider/documents')
      .then(r => setDocStatus(r.data.documents || MOCK_DOCS))
      .catch(() => setDocStatus(MOCK_DOCS))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = (doc) => {
    Alert.alert(
      `Uploader : ${doc.label}`,
      'Choisissez la source du document',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '📷 Appareil photo', onPress: async () => {
            setUploading(doc.key);
            await new Promise(r => setTimeout(r, 1200));
            setDocStatus(prev => ({ ...prev, [doc.key]: { status: 'PENDING', uploadedAt: 'Aujourd\'hui', note: null } }));
            setUploading(null);
            Alert.alert('✅ Document envoyé', 'Votre document est en cours de vérification.');
          },
        },
        {
          text: '🖼️ Galerie', onPress: async () => {
            setUploading(doc.key);
            await new Promise(r => setTimeout(r, 1200));
            setDocStatus(prev => ({ ...prev, [doc.key]: { status: 'PENDING', uploadedAt: 'Aujourd\'hui', note: null } }));
            setUploading(null);
            Alert.alert('✅ Document envoyé', 'Votre document est en cours de vérification.');
          },
        },
      ]
    );
  };

  const approved = docs.filter(d => docStatus[d.key]?.status === 'APPROVED').length;
  const total = docs.length;
  const kycProgress = Math.round((approved / total) * 100);

  const kycComplete = docs.filter(d => d.required).every(d => docStatus[d.key]?.status === 'APPROVED');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📄 Mes documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* KYC status card */}
        <View style={[styles.kycCard, { borderColor: kycComplete ? COLORS.green + '50' : COLORS.orange + '50' }]}>
          <View style={styles.kycTop}>
            <Text style={styles.kycTitle}>Statut KYC</Text>
            <View style={[styles.kycBadge, { backgroundColor: kycComplete ? COLORS.green + '20' : COLORS.orange + '20' }]}>
              <Text style={[styles.kycBadgeText, { color: kycComplete ? COLORS.green : COLORS.orange }]}>
                {kycComplete ? '✅ Vérifié' : '⏳ En attente'}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${kycProgress}%`,
              backgroundColor: kycComplete ? COLORS.green : COLORS.orange,
            }]} />
          </View>
          <Text style={styles.kycProgress}>{approved}/{total} documents approuvés</Text>
        </View>

        <View style={{ padding: 16 }}>
          {docs.map(doc => {
            const status = docStatus[doc.key] || { status: 'MISSING' };
            const sc = STATUS_COLOR[status.status];
            const isUploading = uploading === doc.key;
            return (
              <View key={doc.key} style={styles.docCard}>
                <View style={styles.docTop}>
                  <View style={[styles.docIcon, { backgroundColor: sc + '15' }]}>
                    <Text style={{ fontSize: 22 }}>{doc.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.docTitleRow}>
                      <Text style={styles.docLabel}>{doc.label}</Text>
                      {!doc.required && <Text style={styles.optionalTag}>Optionnel</Text>}
                    </View>
                    <Text style={[styles.docStatus, { color: sc }]}>{STATUS_LABEL[status.status]}</Text>
                    {status.uploadedAt && (
                      <Text style={styles.docDate}>Envoyé le {status.uploadedAt}</Text>
                    )}
                  </View>
                </View>

                {status.note && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>💬 {status.note}</Text>
                  </View>
                )}

                {(status.status === 'MISSING' || status.status === 'REJECTED') && (
                  <TouchableOpacity
                    style={[styles.uploadBtn, isUploading && { opacity: 0.6 }]}
                    onPress={() => handleUpload(doc)}
                    disabled={isUploading}
                  >
                    {isUploading
                      ? <ActivityIndicator color="#000" size="small" />
                      : <Text style={styles.uploadBtnText}>📎 {status.status === 'REJECTED' ? 'Renvoyer' : 'Uploader'}</Text>
                    }
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  kycCard: {
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 18, borderWidth: 1.5,
  },
  kycTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kycTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  kycBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  kycBadgeText: { fontSize: 12, fontWeight: '700' },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  kycProgress: { color: COLORS.muted, fontSize: 12 },
  docCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  docTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4 },
  docIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700', flex: 1 },
  optionalTag: {
    color: COLORS.muted, fontSize: 10, fontWeight: '600',
    backgroundColor: COLORS.border, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  docStatus: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  docDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  noteBox: {
    backgroundColor: COLORS.red + '10', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: COLORS.red + '30', marginTop: 8,
  },
  noteText: { color: COLORS.red, fontSize: 12, lineHeight: 18 },
  uploadBtn: {
    marginTop: 10, backgroundColor: COLORS.accent, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  uploadBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
});
