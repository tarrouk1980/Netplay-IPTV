import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
};

const DOC_CONFIG = {
  CIN: { label: 'Carte d\'identité nationale', icon: '🪪', description: 'Recto + verso de votre CIN' },
  PERMIS: { label: 'Permis de conduire', icon: '🚗', description: 'Permis valide (catégorie B minimum)' },
  CARTE_GRISE: { label: 'Carte grise', icon: '📄', description: 'Carte grise du véhicule' },
  ASSURANCE: { label: 'Attestation d\'assurance', icon: '🛡️', description: 'Assurance en cours de validité' },
  VISITE_TECHNIQUE: { label: 'Visite technique', icon: '🔧', description: 'Rapport de visite technique' },
  CASIER_JUDICIAIRE: { label: 'Casier judiciaire', icon: '⚖️', description: 'Bulletin n°3 de moins de 3 mois' },
};

const STATUS_CONFIG = {
  APPROVED: { color: COLORS.green, icon: '✅', label: 'Approuvé' },
  PENDING: { color: COLORS.orange, icon: '⏳', label: 'En attente' },
  REJECTED: { color: COLORS.accent, icon: '❌', label: 'Refusé' },
  MISSING: { color: COLORS.muted, icon: '📤', label: 'À soumettre' },
};

const MOCK_DOCS = [
  { type: 'CIN', status: 'APPROVED', uploadedAt: '2025-03-15', expiresAt: '2030-03-15', note: null },
  { type: 'PERMIS', status: 'APPROVED', uploadedAt: '2025-03-15', expiresAt: '2028-06-30', note: null },
  { type: 'CARTE_GRISE', status: 'PENDING', uploadedAt: '2025-05-10', expiresAt: null, note: null },
  { type: 'ASSURANCE', status: 'REJECTED', uploadedAt: '2025-04-01', expiresAt: null, note: 'Document illisible. Veuillez soumettre une version claire.' },
  { type: 'VISITE_TECHNIQUE', status: 'MISSING', uploadedAt: null, expiresAt: null, note: null },
  { type: 'CASIER_JUDICIAIRE', status: 'MISSING', uploadedAt: null, expiresAt: null, note: null },
];

export default function ProviderDocumentStatusScreen({ navigation }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/provider/documents');
      setDocs(res.data.documents || MOCK_DOCS);
    } catch {
      setDocs(MOCK_DOCS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approved = docs.filter((d) => d.status === 'APPROVED').length;
  const total = Object.keys(DOC_CONFIG).length;
  const pct = Math.round((approved / total) * 100);

  const handleUpload = (type) => {
    Alert.alert('Téléchargement', `Fonctionnalité de téléchargement pour ${DOC_CONFIG[type]?.label} disponible prochainement.`);
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>📋 Mes documents</Text>
        <View style={[s.badge, { backgroundColor: pct === 100 ? COLORS.green : COLORS.orange }]}>
          <Text style={s.badgeTxt}>{pct}%</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Progress bar */}
        <View style={s.progressCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={s.progressLabel}>Dossier complet</Text>
            <Text style={[s.progressPct, { color: pct === 100 ? COLORS.green : COLORS.orange }]}>{approved}/{total} documents</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: pct === 100 ? COLORS.green : COLORS.orange }]} />
          </View>
          {pct < 100 && (
            <Text style={s.progressHint}>⚠️ Complétez votre dossier pour activer votre compte prestataire.</Text>
          )}
        </View>

        {docs.map((doc) => {
          const cfg = DOC_CONFIG[doc.type] || { label: doc.type, icon: '📄', description: '' };
          const st = STATUS_CONFIG[doc.status] || STATUS_CONFIG.MISSING;
          const isExpiringSoon = doc.expiresAt && new Date(doc.expiresAt) < new Date(Date.now() + 30 * 24 * 3600000);
          return (
            <View key={doc.type} style={[s.docCard, { borderLeftColor: st.color }]}>
              <View style={s.docTop}>
                <Text style={{ fontSize: 22 }}>{cfg.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.docLabel}>{cfg.label}</Text>
                  <Text style={s.docDesc}>{cfg.description}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: st.color + '22', borderColor: st.color }]}>
                  <Text style={{ fontSize: 10 }}>{st.icon}</Text>
                  <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>

              {doc.uploadedAt && (
                <Text style={s.meta}>Soumis le {new Date(doc.uploadedAt).toLocaleDateString('fr-TN')}</Text>
              )}
              {doc.expiresAt && (
                <Text style={[s.meta, isExpiringSoon && { color: COLORS.accent }]}>
                  {isExpiringSoon ? '⚠️ ' : ''}Expire le {new Date(doc.expiresAt).toLocaleDateString('fr-TN')}
                </Text>
              )}
              {doc.note && (
                <View style={s.noteBox}>
                  <Text style={s.noteTxt}>💬 {doc.note}</Text>
                </View>
              )}

              {(doc.status === 'MISSING' || doc.status === 'REJECTED') && (
                <TouchableOpacity style={s.uploadBtn} onPress={() => handleUpload(doc.type)}>
                  <Text style={s.uploadBtnTxt}>📤 Soumettre le document</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  progressCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  progressLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressHint: { color: COLORS.orange, fontSize: 11, marginTop: 8 },
  docCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3 },
  docTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  docLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  docDesc: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  meta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  noteBox: { backgroundColor: COLORS.accent + '11', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: COLORS.accent + '44' },
  noteTxt: { color: COLORS.accent, fontSize: 12 },
  uploadBtn: { backgroundColor: COLORS.orange + '22', borderRadius: 8, padding: 10, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.orange },
  uploadBtnTxt: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
});
