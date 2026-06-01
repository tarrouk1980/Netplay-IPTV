import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#D32F2F', accentLight: '#FF5252', white: '#FFFFFF',
  muted: '#8A8A9A', border: '#2A2A3A', green: '#2E7D32',
  amber: '#F57C00', blue: '#1565C0',
};

const DOC_LABELS = {
  CIN: 'Carte d\'identité nationale',
  PERMIS: 'Permis de conduire',
  CARTE_GRISE: 'Carte grise',
  ASSURANCE: 'Assurance véhicule',
  VISITE_TECHNIQUE: 'Visite technique',
  CASIER: 'Casier judiciaire',
  PHOTO: 'Photo professionnelle',
  RIB: 'RIB bancaire',
};

const STATUS_CFG = {
  PENDING:  { color: COLORS.amber, label: 'En attente', emoji: '⏳' },
  APPROVED: { color: COLORS.green, label: 'Approuvé',   emoji: '✅' },
  REJECTED: { color: COLORS.accent, label: 'Rejeté',    emoji: '❌' },
};

const REJECT_REASONS = [
  'Document illisible ou flou',
  'Document expiré',
  'Document non conforme',
  'Identité ne correspond pas',
  'Document incomplet',
  'Mauvais type de document',
];

function DocReviewCard({ doc, onApprove, onReject }) {
  const cfg = STATUS_CFG[doc.status] || STATUS_CFG.PENDING;
  return (
    <View style={[styles.docCard, { borderLeftColor: cfg.color }]}>
      <View style={styles.docTop}>
        <View>
          <Text style={styles.docType}>{DOC_LABELS[doc.type] || doc.type}</Text>
          <View style={styles.docStatusRow}>
            <Text style={styles.docStatusEmoji}>{cfg.emoji}</Text>
            <Text style={[styles.docStatusLabel, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {doc.uploadedAt && (
            <Text style={styles.docDate}>Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-TN')}</Text>
          )}
          {doc.expiresAt && (
            <Text style={styles.docExpiry}>Expire le {new Date(doc.expiresAt).toLocaleDateString('fr-TN')}</Text>
          )}
        </View>
        <View style={styles.docPreview}>
          <Text style={{ color: COLORS.muted, fontSize: 11 }}>📄 Document</Text>
        </View>
      </View>

      {doc.note && (
        <View style={[styles.noteBox, { borderColor: cfg.color }]}>
          <Text style={[styles.noteText, { color: cfg.color }]}>{doc.note}</Text>
        </View>
      )}

      {doc.status === 'PENDING' && (
        <View style={styles.docActions}>
          <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove(doc.type)}>
            <Text style={styles.approveBtnText}>✅ Approuver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(doc.type)}>
            <Text style={styles.rejectBtnText}>❌ Rejeter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function RejectModal({ visible, docType, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={modal.header}>
          <TouchableOpacity onPress={onClose}><Text style={modal.cancel}>Annuler</Text></TouchableOpacity>
          <Text style={modal.title}>Motif de rejet</Text>
          <TouchableOpacity onPress={() => reason || custom ? onConfirm(reason || custom) : null}>
            <Text style={[modal.confirm, !(reason || custom) && { opacity: 0.3 }]}>Rejeter</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ padding: 16 }}>
          <Text style={modal.label}>{DOC_LABELS[docType] || docType}</Text>
          <Text style={modal.sublabel}>Sélectionnez un motif :</Text>
          {REJECT_REASONS.map(r => (
            <TouchableOpacity
              key={r}
              style={[modal.reasonRow, reason === r && modal.reasonRowActive]}
              onPress={() => setReason(r)}
            >
              <View style={[modal.radio, reason === r && modal.radioActive]}>
                {reason === r && <View style={modal.radioFill} />}
              </View>
              <Text style={[modal.reasonText, reason === r && { color: COLORS.accentLight }]}>{r}</Text>
            </TouchableOpacity>
          ))}
          <Text style={[modal.sublabel, { marginTop: 16 }]}>Ou motif personnalisé :</Text>
          <TextInput
            style={modal.input}
            value={custom}
            onChangeText={t => { setCustom(t); setReason(''); }}
            placeholder="Précisez le motif…"
            placeholderTextColor={COLORS.muted}
            multiline
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function AdminKYCDetailScreen({ route, navigation }) {
  const { userId, userName } = route.params || {};
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/kyc/${userId}`);
      setUser(res.data.user);
      setDocs(res.data.documents || []);
    } catch {
      setUser({ id: userId, name: userName || 'Prestataire', role: 'CHAUFFEUR', phone: '+216 55 000 000', email: 'test@easyway.tn', kycStatus: 'PENDING', createdAt: new Date().toISOString() });
      setDocs([
        { type: 'CIN', status: 'PENDING', uploadedAt: new Date().toISOString(), expiresAt: null, note: '' },
        { type: 'PERMIS', status: 'APPROVED', uploadedAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: '2033-06-20', note: '' },
        { type: 'ASSURANCE', status: 'PENDING', uploadedAt: new Date().toISOString(), expiresAt: null, note: '' },
        { type: 'CARTE_GRISE', status: 'REJECTED', uploadedAt: new Date(Date.now() - 172800000).toISOString(), note: 'Document illisible ou flou' },
        { type: 'PHOTO', status: 'PENDING', uploadedAt: new Date().toISOString(), note: '' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (docType) => {
    setSaving(true);
    try {
      await api.post(`/api/admin/kyc/${userId}/documents/${docType}/approve`);
      setDocs(d => d.map(x => x.type === docType ? { ...x, status: 'APPROVED', note: '' } : x));
    } catch {
      Alert.alert('Erreur', 'Impossible d\'approuver.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = (docType) => setRejectModal(docType);

  const confirmReject = async (reason) => {
    setSaving(true);
    setRejectModal(null);
    try {
      await api.post(`/api/admin/kyc/${userId}/documents/${rejectModal}/reject`, { reason });
      setDocs(d => d.map(x => x.type === rejectModal ? { ...x, status: 'REJECTED', note: reason } : x));
    } catch {
      Alert.alert('Erreur', 'Impossible de rejeter.');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAll = () => {
    Alert.alert('Tout approuver', 'Valider tous les documents en attente ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Approuver tout', onPress: async () => {
          setSaving(true);
          try {
            await api.post(`/api/admin/kyc/${userId}/approve-all`);
            setDocs(d => d.map(x => x.status === 'PENDING' ? { ...x, status: 'APPROVED' } : x));
            Alert.alert('✅ KYC validé', `Le compte de ${user?.name} est maintenant certifié.`);
          } catch {
            Alert.alert('Erreur', 'Validation impossible.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const pending = docs.filter(d => d.status === 'PENDING').length;
  const approved = docs.filter(d => d.status === 'APPROVED').length;
  const rejected = docs.filter(d => d.status === 'REJECTED').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔖 Revue KYC</Text>
        {pending > 0 && (
          <TouchableOpacity style={styles.approveAllBtn} onPress={handleApproveAll} disabled={saving}>
            <Text style={styles.approveAllText}>Tout valider</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* User card */}
          {user && (
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{(user.name || '?')[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userRole}>👤 {user.role}</Text>
                <Text style={styles.userContact}>{user.phone} · {user.email}</Text>
                <Text style={styles.userJoined}>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-TN')}</Text>
              </View>
            </View>
          )}

          {/* Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Avancement du dossier</Text>
            <View style={styles.progressRow}>
              <View style={[styles.progressChip, { borderColor: COLORS.green }]}>
                <Text style={[styles.progressNum, { color: COLORS.green }]}>{approved}</Text>
                <Text style={styles.progressLabel}>Approuvés</Text>
              </View>
              <View style={[styles.progressChip, { borderColor: COLORS.amber }]}>
                <Text style={[styles.progressNum, { color: COLORS.amber }]}>{pending}</Text>
                <Text style={styles.progressLabel}>En attente</Text>
              </View>
              <View style={[styles.progressChip, { borderColor: COLORS.accent }]}>
                <Text style={[styles.progressNum, { color: COLORS.accent }]}>{rejected}</Text>
                <Text style={styles.progressLabel}>Rejetés</Text>
              </View>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${docs.length ? (approved / docs.length) * 100 : 0}%` }]} />
            </View>
          </View>

          {/* Documents */}
          <Text style={[styles.sectionTitle, { marginHorizontal: 16 }]}>Documents ({docs.length})</Text>
          {docs.map(d => (
            <DocReviewCard
              key={d.type}
              doc={d}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}

          {pending === 0 && approved === docs.length && docs.length > 0 && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>🎉 Dossier complet — tous les documents sont validés !</Text>
            </View>
          )}
        </ScrollView>
      )}

      <RejectModal
        visible={!!rejectModal}
        docType={rejectModal}
        onConfirm={confirmReject}
        onClose={() => setRejectModal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  approveAllBtn: { backgroundColor: COLORS.green + '22', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.green },
  approveAllText: { color: COLORS.green, fontWeight: '700', fontSize: 12 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    margin: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  userAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.accent + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  userAvatarText: { color: COLORS.accent, fontSize: 22, fontWeight: '800' },
  userName: { color: COLORS.white, fontSize: 17, fontWeight: '700', marginBottom: 3 },
  userRole: { color: COLORS.muted, fontSize: 13 },
  userContact: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  userJoined: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  progressCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  progressChip: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1 },
  progressNum: { fontSize: 20, fontWeight: '800' },
  progressLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  progressBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: COLORS.green, borderRadius: 3 },
  docCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4,
  },
  docTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  docType: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  docStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  docStatusEmoji: { fontSize: 12 },
  docStatusLabel: { fontSize: 12, fontWeight: '600' },
  docDate: { color: COLORS.muted, fontSize: 11 },
  docExpiry: { color: COLORS.amber, fontSize: 11, marginTop: 2 },
  docPreview: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
    width: 80, height: 60,
  },
  noteBox: { borderRadius: 8, padding: 8, marginTop: 10, borderWidth: 1, backgroundColor: COLORS.surfaceAlt },
  noteText: { fontSize: 12 },
  docActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveBtn: { flex: 1, backgroundColor: COLORS.green + '22', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.green },
  approveBtnText: { color: COLORS.green, fontWeight: '700', fontSize: 13 },
  rejectBtn: { flex: 1, backgroundColor: COLORS.accent + '15', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent },
  rejectBtnText: { color: COLORS.accentLight, fontWeight: '700', fontSize: 13 },
  successBanner: {
    backgroundColor: COLORS.green + '15', margin: 16, borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.green,
  },
  successText: { color: COLORS.green, fontWeight: '700', fontSize: 14, textAlign: 'center' },
});

const modal = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  cancel: { color: COLORS.muted, fontSize: 15 },
  confirm: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },
  label: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  sublabel: { color: COLORS.muted, fontSize: 13, marginBottom: 10 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 6, backgroundColor: COLORS.surface, gap: 12 },
  reasonRowActive: { backgroundColor: COLORS.accent + '15', borderWidth: 1, borderColor: COLORS.accent },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.accent },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  reasonText: { color: COLORS.muted, fontSize: 14, flex: 1 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, padding: 12, minHeight: 80, textAlignVertical: 'top',
  },
});
