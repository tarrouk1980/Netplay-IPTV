import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

// NOTE: per-audience recipient counts are not provided by
// POST /api/admin/notifications/push (it only returns { sent } after the
// fact), so no live count is shown here rather than a fabricated number.
const AUDIENCES = [
  { key: 'ALL', label: '👥 Tous les utilisateurs', color: COLORS.blue },
  { key: 'CLIENT', label: '🙋 Clients uniquement', color: COLORS.accent },
  { key: 'CHAUFFEUR', label: '🚕 Chauffeurs', color: '#F5A623' },
  { key: 'LIVREUR', label: '🛵 Livreurs', color: COLORS.green },
  { key: 'DEPANNEUR', label: '🔧 Dépanneurs', color: COLORS.red },
  { key: 'MARCHAND', label: '🏪 Marchands', color: '#9B59B6' },
];

const TEMPLATES = [
  { label: '🔥 Promo du jour', title: 'Offre spéciale aujourd\'hui !', body: 'Profitez de -20% sur votre prochaine course EasyTaxy. Valable jusqu\'à minuit.' },
  { label: '🆕 Nouvelle fonctionnalité', title: 'Nouvelle mise à jour EASYWAY', body: 'Découvrez les nouvelles fonctionnalités de l\'application. Mettez à jour maintenant !' },
  { label: '⚠️ Maintenance', title: 'Maintenance planifiée', body: 'Une maintenance est prévue ce soir de 2h à 4h. L\'application sera temporairement indisponible.' },
  { label: '🎉 Bienvenue', title: 'Bienvenue sur EASYWAY !', body: 'Votre compte est prêt. Commandez votre premier taxi et bénéficiez de 5 TND offerts.' },
];

// NOTE: There is no backend persistence for notifications sent via
// POST /api/admin/notifications/push (backend/src/routes/admin.js ~L1640) —
// it just fans out to Expo push and returns { sent }. There is no
// send-history/open-rate tracking endpoint to back a "Historique" tab,
// so we show an honest empty/unavailable state instead of fabricating data.

export default function AdminPushNotifScreen({ navigation }) {
  const [tab, setTab] = useState('SEND');
  const [audience, setAudience] = useState('ALL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const applyTemplate = (t) => { setTitle(t.title); setBody(t.body); };

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) { Alert.alert('Champs requis', 'Titre et message sont obligatoires.'); return; }
    Alert.alert('Confirmer', `Envoyer à : ${AUDIENCES.find(a => a.key === audience)?.label} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Envoyer', onPress: async () => {
          setSending(true);
          try {
            const res = await api.post('/api/admin/notifications/push', { audience, title, body });
            const sentCount = res?.data?.sent ?? 0;
            Alert.alert('✅ Envoyé', `La notification a été envoyée à ${sentCount.toLocaleString()} appareil(s).`);
            setTitle(''); setBody('');
          } catch (err) {
            console.error('[AdminPushNotifScreen] sendNotification failed:', err);
            const msg = err?.response?.data?.error || err.message || 'Impossible d\'envoyer la notification.';
            Alert.alert('Erreur', msg);
          } finally { setSending(false); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications Push</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.tabs}>
        {[['SEND', '📤 Envoyer'], ['HISTORY', '📋 Historique']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && { color: '#000' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {tab === 'SEND' && (
          <>
            <Text style={styles.sectionTitle}>🎯 Audience cible</Text>
            <View style={styles.audienceGrid}>
              {AUDIENCES.map(a => (
                <TouchableOpacity
                  key={a.key}
                  style={[styles.audienceCard, audience === a.key && { borderColor: a.color, backgroundColor: a.color + '15' }]}
                  onPress={() => setAudience(a.key)}
                >
                  <Text style={styles.audienceLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>⚡ Templates rapides</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {TEMPLATES.map((t, i) => (
                <TouchableOpacity key={i} style={styles.templateChip} onPress={() => applyTemplate(t)}>
                  <Text style={styles.templateText}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>✏️ Composer</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Titre de la notification"
                placeholderTextColor={COLORS.muted}
                maxLength={60}
              />
              <Text style={styles.charCount}>{title.length}/60</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]}
                value={body}
                onChangeText={setBody}
                placeholder="Contenu de la notification..."
                placeholderTextColor={COLORS.muted}
                multiline
                maxLength={200}
              />
              <Text style={styles.charCount}>{body.length}/200</Text>
            </View>

            {(title || body) && (
              <View style={styles.preview}>
                <Text style={styles.previewLabel}>👁 Aperçu</Text>
                <View style={styles.previewCard}>
                  <Text style={{ fontSize: 18, marginBottom: 6 }}>🔔</Text>
                  <Text style={styles.previewTitle}>{title || 'Titre'}</Text>
                  <Text style={styles.previewBody}>{body || 'Message...'}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.sendBtn, (!title.trim() || !body.trim()) && { opacity: 0.5 }]}
              onPress={sendNotification}
              disabled={sending || !title.trim() || !body.trim()}
            >
              {sending ? <ActivityIndicator color="#000" /> : <Text style={styles.sendBtnText}>📤 Envoyer la notification</Text>}
            </TouchableOpacity>
          </>
        )}

        {tab === 'HISTORY' && (
          <>
            <Text style={styles.sectionTitle}>📋 Notifications envoyées</Text>
            <View style={styles.histRow}>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>
                L'historique d'envoi et les taux d'ouverture ne sont pas encore disponibles côté serveur.
                Utilisez l'onglet "Campagnes" pour un suivi avec stockage des envois.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  audienceCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  audienceLabel: { color: COLORS.white, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  audienceCount: { fontSize: 15, fontWeight: '900' },
  templateChip: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  templateText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12, color: COLORS.white, fontSize: 14 },
  charCount: { color: COLORS.muted, fontSize: 10, textAlign: 'right', marginTop: 4 },
  preview: { marginBottom: 16 },
  previewLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600', marginBottom: 8 },
  previewCard: { backgroundColor: COLORS.surfaceAlt, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  previewTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  previewBody: { color: COLORS.muted, fontSize: 13 },
  sendBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  sendBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  histRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  histTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  histMeta: { color: COLORS.muted, fontSize: 11 },
  histStats: { alignItems: 'flex-end', gap: 2 },
  histSent: { color: COLORS.muted, fontSize: 11 },
  histOpened: { color: COLORS.blue, fontSize: 11 },
  histRate: { color: COLORS.green, fontSize: 13, fontWeight: '900' },
});
