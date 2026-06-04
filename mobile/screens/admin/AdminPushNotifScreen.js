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

const AUDIENCES = [
  { key: 'ALL', label: '👥 Tous les utilisateurs', count: '12 430', color: COLORS.blue },
  { key: 'CLIENT', label: '🙋 Clients uniquement', count: '9 842', color: COLORS.accent },
  { key: 'CHAUFFEUR', label: '🚕 Chauffeurs', count: '1 204', color: '#F5A623' },
  { key: 'LIVREUR', label: '🛵 Livreurs', count: '876', color: COLORS.green },
  { key: 'DEPANNEUR', label: '🔧 Dépanneurs', count: '312', color: COLORS.red },
  { key: 'MARCHAND', label: '🏪 Marchands', count: '196', color: '#9B59B6' },
];

const TEMPLATES = [
  { label: '🔥 Promo du jour', title: 'Offre spéciale aujourd\'hui !', body: 'Profitez de -20% sur votre prochaine course EasyTaxy. Valable jusqu\'à minuit.' },
  { label: '🆕 Nouvelle fonctionnalité', title: 'Nouvelle mise à jour EASYWAY', body: 'Découvrez les nouvelles fonctionnalités de l\'application. Mettez à jour maintenant !' },
  { label: '⚠️ Maintenance', title: 'Maintenance planifiée', body: 'Une maintenance est prévue ce soir de 2h à 4h. L\'application sera temporairement indisponible.' },
  { label: '🎉 Bienvenue', title: 'Bienvenue sur EASYWAY !', body: 'Votre compte est prêt. Commandez votre premier taxi et bénéficiez de 5 TND offerts.' },
];

const HISTORY = [
  { id: 1, title: 'Promo Ramadan', audience: 'ALL', sent: 12430, opened: 8104, date: 'Auj. 10:22', status: 'SENT' },
  { id: 2, title: 'Nouveau driver disponible', audience: 'CLIENT', sent: 9842, opened: 4210, date: 'Hier 18:45', status: 'SENT' },
  { id: 3, title: 'Rappel recharge wallet', audience: 'CLIENT', sent: 3200, opened: 1890, date: '02/06', status: 'SENT' },
];

export default function AdminPushNotifScreen({ navigation }) {
  const [tab, setTab] = useState('SEND');
  const [audience, setAudience] = useState('ALL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const applyTemplate = (t) => { setTitle(t.title); setBody(t.body); };

  const sendNotification = async () => {
    if (!title.trim() || !body.trim()) { Alert.alert('Champs requis', 'Titre et message sont obligatoires.'); return; }
    Alert.alert('Confirmer', `Envoyer à ${AUDIENCES.find(a => a.key === audience)?.count} utilisateurs ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Envoyer', onPress: async () => {
          setSending(true);
          try {
            await api.post('/api/admin/notifications/push', { audience, title, body });
            Alert.alert('✅ Envoyé', 'La notification a été envoyée avec succès.');
            setTitle(''); setBody('');
          } catch {
            Alert.alert('Erreur', 'Impossible d\'envoyer la notification.');
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
                  <Text style={[styles.audienceCount, { color: a.color }]}>{a.count}</Text>
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
            {HISTORY.map(h => (
              <View key={h.id} style={styles.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histTitle}>{h.title}</Text>
                  <Text style={styles.histMeta}>{h.audience} · {h.date}</Text>
                </View>
                <View style={styles.histStats}>
                  <Text style={styles.histSent}>📤 {h.sent.toLocaleString()}</Text>
                  <Text style={styles.histOpened}>👁 {h.opened.toLocaleString()}</Text>
                  <Text style={styles.histRate}>{Math.round(h.opened / h.sent * 100)}%</Text>
                </View>
              </View>
            ))}
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
