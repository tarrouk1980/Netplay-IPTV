import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_KYC = {
  id: 'KYC-001',
  userId: 'USR-4821',
  name: 'Mohamed Ali Trabelsi',
  phone: '+216 55 123 456',
  role: 'CHAUFFEUR',
  submittedAt: '03/06/2026 09:30',
  documents: [
    { type: 'CIN', label: 'Carte d\'identité nationale', status: 'PENDING', filename: 'cin_recto.jpg' },
    { type: 'LICENSE', label: 'Permis de conduire', status: 'PENDING', filename: 'permis.jpg' },
    { type: 'VEHICLE_CARD', label: 'Carte grise', status: 'PENDING', filename: 'carte_grise.jpg' },
    { type: 'INSURANCE', label: 'Attestation d\'assurance', status: 'PENDING', filename: 'assurance.pdf' },
  ],
  selfie: { label: 'Selfie de vérification', status: 'PENDING', filename: 'selfie.jpg' },
};

const DOC_ICONS = { CIN: '🪪', LICENSE: '🚗', VEHICLE_CARD: '📋', INSURANCE: '🛡️' };

export default function AdminKYCDetailScreen({ navigation, route }) {
  const { kycId } = route.params || {};
  const [kyc] = useState(MOCK_KYC);
  const [docStatuses, setDocStatuses] = useState({});
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setDocStatus = (type, status) => {
    setDocStatuses(prev => ({ ...prev, [type]: status }));
  };

  const allReviewed = kyc.documents.every(d => docStatuses[d.type]);

  const approve = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/admin/kyc/' + (kycId || kyc.id) + '/approve');
      Alert.alert('Approuvé', 'Le dossier KYC a été approuvé.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'approuver pour l\'instant.');
    } finally { setSubmitting(false); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { Alert.alert('Motif requis', 'Indiquez le motif de refus.'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/admin/kyc/' + (kycId || kyc.id) + '/reject', { reason: rejectReason });
      Alert.alert('Refusé', 'Le dossier a été refusé.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch {
      Alert.alert('Erreur', 'Impossible de refuser pour l\'instant.');
    } finally { setSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🪪 Dossier KYC</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 34 }}>👤</Text>
          </View>
          <Text style={styles.profileName}>{kyc.name}</Text>
          <Text style={styles.profilePhone}>{kyc.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{kyc.role}</Text>
          </View>
          <Text style={styles.submitDate}>Soumis le {kyc.submittedAt}</Text>
        </View>

        <Text style={styles.sectionTitle}>DOCUMENTS</Text>
        {kyc.documents.map(doc => {
          const st = docStatuses[doc.type];
          return (
            <View key={doc.type} style={styles.docCard}>
              <View style={styles.docTop}>
                <Text style={styles.docIcon}>{DOC_ICONS[doc.type] || '📄'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>{doc.label}</Text>
                  <Text style={styles.docFile}>{doc.filename}</Text>
                </View>
              </View>
              <View style={styles.docActions}>
                <TouchableOpacity
                  style={[styles.docBtn, styles.docBtnApprove, st === 'APPROVED' && styles.docBtnApproveActive]}
                  onPress={() => setDocStatus(doc.type, 'APPROVED')}
                >
                  <Text style={[styles.docBtnText, st === 'APPROVED' && { color: COLORS.green }]}>✓ Valider</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.docBtn, styles.docBtnReject, st === 'REJECTED' && styles.docBtnRejectActive]}
                  onPress={() => setDocStatus(doc.type, 'REJECTED')}
                >
                  <Text style={[styles.docBtnText, st === 'REJECTED' && { color: COLORS.red }]}>✗ Refuser</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.docCard}>
          <View style={styles.docTop}>
            <Text style={styles.docIcon}>🤳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.docLabel}>{kyc.selfie.label}</Text>
              <Text style={styles.docFile}>{kyc.selfie.filename}</Text>
            </View>
          </View>
          <View style={styles.docActions}>
            <TouchableOpacity
              style={[styles.docBtn, styles.docBtnApprove, docStatuses['SELFIE'] === 'APPROVED' && styles.docBtnApproveActive]}
              onPress={() => setDocStatus('SELFIE', 'APPROVED')}
            >
              <Text style={[styles.docBtnText, docStatuses['SELFIE'] === 'APPROVED' && { color: COLORS.green }]}>✓ Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.docBtn, styles.docBtnReject, docStatuses['SELFIE'] === 'REJECTED' && styles.docBtnRejectActive]}
              onPress={() => setDocStatus('SELFIE', 'REJECTED')}
            >
              <Text style={[styles.docBtnText, docStatuses['SELFIE'] === 'REJECTED' && { color: COLORS.red }]}>✗ Refuser</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>MOTIF DE REFUS (si applicable)</Text>
        <TextInput
          style={styles.reasonInput}
          placeholder="Ex: Document illisible, selfie non conforme..."
          placeholderTextColor={COLORS.muted}
          value={rejectReason}
          onChangeText={setRejectReason}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {submitting ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={reject}>
              <Text style={styles.rejectBtnText}>✗ Refuser le dossier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.approveBtn} onPress={approve}>
              <Text style={styles.approveBtnText}>✓ Approuver</Text>
            </TouchableOpacity>
          </View>
        )}

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
  scroll: { padding: 16 },
  profileCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 2, borderColor: COLORS.border,
  },
  profileName: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  profilePhone: { color: COLORS.muted, fontSize: 14, marginBottom: 8 },
  roleBadge: {
    backgroundColor: COLORS.accent + '20', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4, marginBottom: 8,
  },
  roleText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  submitDate: { color: COLORS.muted, fontSize: 12 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  docCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  docTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  docIcon: { fontSize: 24 },
  docLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  docFile: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  docActions: { flexDirection: 'row', gap: 8 },
  docBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  docBtnApprove: {},
  docBtnApproveActive: { backgroundColor: COLORS.green + '15', borderColor: COLORS.green },
  docBtnReject: {},
  docBtnRejectActive: { backgroundColor: COLORS.red + '15', borderColor: COLORS.red },
  docBtnText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  reasonInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    color: COLORS.text, fontSize: 14, minHeight: 80,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 20,
  },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, backgroundColor: COLORS.red + '15', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.red + '50',
  },
  rejectBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  approveBtn: {
    flex: 1, backgroundColor: COLORS.green, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  approveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
