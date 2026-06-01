import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C',
  amber: '#F57C00', blue: '#1565C0',
};

const DOC_TYPES = [
  { key: 'CIN', label: 'Carte d\'identité nationale', emoji: '🪪', required: true, renewEvery: null },
  { key: 'PERMIS', label: 'Permis de conduire', emoji: '🚗', required: true, renewEvery: 10 },
  { key: 'CARTE_GRISE', label: 'Carte grise', emoji: '📄', required: true, renewEvery: null },
  { key: 'ASSURANCE', label: 'Assurance véhicule', emoji: '🛡️', required: true, renewEvery: 1 },
  { key: 'VISITE_TECHNIQUE', label: 'Visite technique', emoji: '🔧', required: true, renewEvery: 1 },
  { key: 'CASIER', label: 'Casier judiciaire', emoji: '⚖️', required: true, renewEvery: null },
  { key: 'PHOTO', label: 'Photo professionnelle', emoji: '📸', required: true, renewEvery: null },
  { key: 'RIB', label: 'RIB bancaire', emoji: '🏦', required: false, renewEvery: null },
];

const STATUS_CONFIG = {
  APPROVED: { label: 'Validé', color: COLORS.green, emoji: '✅' },
  PENDING:  { label: 'En attente', color: COLORS.amber, emoji: '⏳' },
  REJECTED: { label: 'Rejeté', color: COLORS.danger, emoji: '❌' },
  EXPIRED:  { label: 'Expiré', color: COLORS.danger, emoji: '⚠️' },
  MISSING:  { label: 'Non fourni', color: COLORS.muted, emoji: '📋' },
};

const MOCK_DOCS = {
  CIN:      { status: 'APPROVED', uploadedAt: '2024-01-15', expiresAt: null, note: '' },
  PERMIS:   { status: 'APPROVED', uploadedAt: '2023-06-20', expiresAt: '2033-06-20', note: '' },
  ASSURANCE:{ status: 'EXPIRED',  uploadedAt: '2024-01-01', expiresAt: '2025-01-01', note: 'Veuillez renouveler votre assurance.' },
  PHOTO:    { status: 'PENDING',  uploadedAt: '2025-05-01', expiresAt: null, note: 'Vérification en cours…' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function ExpiryBadge({ expiresAt }) {
  if (!expiresAt) return null;
  const days = daysUntil(expiresAt);
  if (days === null) return null;
  const color = days < 0 ? COLORS.danger : days < 30 ? COLORS.amber : COLORS.green;
  const label = days < 0 ? `Expiré il y a ${Math.abs(days)}j` : days === 0 ? 'Expire aujourd\'hui' : `Expire dans ${days}j`;
  return (
    <View style={[styles.expiryBadge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.expiryText, { color }]}>{label}</Text>
    </View>
  );
}

function DocCard({ docType, doc, onUpload, onView }) {
  const status = doc ? STATUS_CONFIG[doc.status] || STATUS_CONFIG.MISSING : STATUS_CONFIG.MISSING;
  const borderColor = doc ? status.color : COLORS.border;

  return (
    <View style={[styles.docCard, { borderLeftColor: borderColor }]}>
      <View style={styles.docTop}>
        <Text style={styles.docEmoji}>{docType.emoji}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.docTitleRow}>
            <Text style={styles.docLabel}>{docType.label}</Text>
            {docType.required && <Text style={styles.required}>*</Text>}
          </View>
          <View style={styles.statusRow}>
            <Text style={[styles.statusEmoji]}>{status.emoji}</Text>
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.docActions}>
          {doc && (
            <TouchableOpacity style={styles.docBtn} onPress={() => onView(docType.key, doc)}>
              <Text style={styles.docBtnText}>👁️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.docBtn, styles.uploadBtn]} onPress={() => onUpload(docType.key)}>
            <Text style={styles.uploadBtnText}>{doc ? '🔄' : '📤'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {doc?.expiresAt && <ExpiryBadge expiresAt={doc.expiresAt} />}
      {doc?.note ? <Text style={styles.docNote}>ℹ️ {doc.note}</Text> : null}
      {doc?.uploadedAt && (
        <Text style={styles.docDate}>Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-TN')}</Text>
      )}
    </View>
  );
}

function ViewModal({ visible, docKey, doc, onClose }) {
  const docType = DOC_TYPES.find(d => d.key === docKey);
  const status = doc ? STATUS_CONFIG[doc.status] || STATUS_CONFIG.MISSING : STATUS_CONFIG.MISSING;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={modal.header}>
          <Text style={modal.title}>{docType?.emoji} {docType?.label}</Text>
          <TouchableOpacity onPress={onClose}><Text style={modal.close}>✕</Text></TouchableOpacity>
        </View>
        <View style={{ padding: 16 }}>
          <View style={[modal.statusCard, { borderColor: status.color }]}>
            <Text style={{ fontSize: 32 }}>{status.emoji}</Text>
            <Text style={[modal.statusLabel, { color: status.color }]}>{status.label}</Text>
          </View>
          {doc?.uploadedAt && (
            <View style={modal.row}>
              <Text style={modal.rowLabel}>Date de dépôt</Text>
              <Text style={modal.rowValue}>{new Date(doc.uploadedAt).toLocaleDateString('fr-TN')}</Text>
            </View>
          )}
          {doc?.expiresAt && (
            <View style={modal.row}>
              <Text style={modal.rowLabel}>Date d'expiration</Text>
              <Text style={modal.rowValue}>{new Date(doc.expiresAt).toLocaleDateString('fr-TN')}</Text>
            </View>
          )}
          {doc?.note ? (
            <View style={modal.noteBox}>
              <Text style={modal.noteText}>{doc.note}</Text>
            </View>
          ) : null}
          <View style={[modal.previewBox]}>
            <Text style={{ color: COLORS.muted, fontSize: 13, textAlign: 'center' }}>
              📄 Document chiffré et stocké en sécurité
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function DriverDocumentsScreen({ navigation }) {
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/provider/documents');
      if (res.data?.documents) setDocs(res.data.documents);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (key) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie pour uploader vos documents.');
      return;
    }

    Alert.alert(
      'Source du document',
      'Comment souhaitez-vous fournir ce document ?',
      [
        {
          text: '📷 Prendre une photo', onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
            if (!result.canceled) await uploadFile(key, result.assets[0]);
          },
        },
        {
          text: '🖼️ Choisir depuis galerie', onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
            if (!result.canceled) await uploadFile(key, result.assets[0]);
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const uploadFile = async (key, asset) => {
    setUploading(key);
    try {
      const form = new FormData();
      form.append('document', { uri: asset.uri, type: 'image/jpeg', name: `${key}.jpg` });
      form.append('type', key);
      await api.post('/api/provider/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocs(d => ({ ...d, [key]: { status: 'PENDING', uploadedAt: new Date().toISOString().slice(0, 10), expiresAt: null, note: 'Vérification en cours…' } }));
      Alert.alert('✅ Document envoyé', 'Votre document est en cours de vérification.');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer le document. Réessayez.');
    } finally {
      setUploading(null);
    }
  };

  const approved = Object.values(docs).filter(d => d?.status === 'APPROVED').length;
  const total = DOC_TYPES.filter(d => d.required).length;
  const pct = Math.round((approved / total) * 100);
  const allGood = approved === total;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📂 Mes documents</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Compliance bar */}
          <View style={styles.complianceCard}>
            <View style={styles.complianceTop}>
              <View>
                <Text style={styles.complianceTitle}>Conformité du dossier</Text>
                <Text style={styles.complianceScore}>{approved}/{total} documents validés</Text>
              </View>
              <Text style={[styles.compliancePct, { color: allGood ? COLORS.green : COLORS.amber }]}>
                {pct}%
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: allGood ? COLORS.green : COLORS.amber }]} />
            </View>
            {!allGood && (
              <Text style={styles.complianceNote}>⚠️ Complétez votre dossier pour activer votre compte</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Documents requis</Text>
          {DOC_TYPES.filter(d => d.required).map(dt => (
            <DocCard
              key={dt.key}
              docType={dt}
              doc={docs[dt.key]}
              onUpload={handleUpload}
              onView={(k, d) => setViewing({ key: k, doc: d })}
            />
          ))}

          <Text style={styles.sectionTitle}>Documents optionnels</Text>
          {DOC_TYPES.filter(d => !d.required).map(dt => (
            <DocCard
              key={dt.key}
              docType={dt}
              doc={docs[dt.key]}
              onUpload={handleUpload}
              onView={(k, d) => setViewing({ key: k, doc: d })}
            />
          ))}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔒 Sécurité & confidentialité</Text>
            <Text style={styles.infoText}>Vos documents sont chiffrés (AES-256) et stockés sur des serveurs sécurisés. Ils ne sont accessibles qu'à l'équipe de vérification EASYWAY.</Text>
          </View>
        </ScrollView>
      )}

      {uploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={styles.uploadingText}>Envoi en cours…</Text>
        </View>
      )}

      <ViewModal
        visible={!!viewing}
        docKey={viewing?.key}
        doc={viewing?.doc}
        onClose={() => setViewing(null)}
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
  complianceCard: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  complianceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  complianceTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  complianceScore: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  compliancePct: { fontSize: 32, fontWeight: '800' },
  progressBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  complianceNote: { color: COLORS.amber, fontSize: 12, marginTop: 10 },
  sectionTitle: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginHorizontal: 16, marginTop: 8, marginBottom: 8,
  },
  docCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4,
  },
  docTop: { flexDirection: 'row', alignItems: 'center' },
  docEmoji: { fontSize: 26 },
  docTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  docLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  required: { color: COLORS.danger, fontSize: 14, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  statusEmoji: { fontSize: 12 },
  statusLabel: { fontSize: 12, fontWeight: '600' },
  docActions: { flexDirection: 'row', gap: 6 },
  docBtn: { padding: 8, backgroundColor: COLORS.surfaceAlt, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  docBtnText: { fontSize: 16 },
  uploadBtn: { borderColor: COLORS.accent + '60', backgroundColor: COLORS.accent + '15' },
  uploadBtnText: { fontSize: 16 },
  expiryBadge: {
    alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  expiryText: { fontSize: 11, fontWeight: '700' },
  docNote: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  docDate: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  infoCard: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  infoTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  infoText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  uploadOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000000AA', alignItems: 'center', justifyContent: 'center',
  },
  uploadingText: { color: COLORS.white, fontSize: 16, marginTop: 12, fontWeight: '700' },
});

const modal = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  close: { color: COLORS.muted, fontSize: 20 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, marginBottom: 12,
  },
  statusLabel: { fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { color: COLORS.muted, fontSize: 14 },
  rowValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  noteBox: {
    backgroundColor: COLORS.amber + '15', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.amber, marginTop: 12,
  },
  noteText: { color: COLORS.amber, fontSize: 13 },
  previewBox: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 14, padding: 40,
    alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: COLORS.border,
  },
});
