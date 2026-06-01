import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#D32F2F', accentLight: '#FF5252', white: '#FFFFFF',
  muted: '#8A8A9A', border: '#2A2A3A', green: '#2E7D32',
  amber: '#F57C00', blue: '#1565C0', purple: '#7B1FA2',
};

const AUDIENCE_OPTIONS = [
  { key: 'ALL', label: 'Tout le monde', emoji: '🌍', color: COLORS.blue },
  { key: 'CLIENT', label: 'Clients', emoji: '👤', color: COLORS.green },
  { key: 'CHAUFFEUR', label: 'Chauffeurs', emoji: '🚕', color: COLORS.amber },
  { key: 'LIVREUR', label: 'Livreurs', emoji: '🛵', color: COLORS.purple },
  { key: 'DEPANNEUR', label: 'Dépanneurs', emoji: '🛻', color: COLORS.accent },
  { key: 'MARCHAND', label: 'Marchands', emoji: '🏪', color: '#00897B' },
];

const TEMPLATES = [
  {
    id: 'promo',
    label: '🎁 Promotion',
    title: '🎉 Offre spéciale EASYWAY',
    body: 'Profitez de -15% sur votre prochaine course avec le code EASY15. Valable jusqu\'au dimanche !',
  },
  {
    id: 'maintenance',
    label: '⚙️ Maintenance',
    title: '⚙️ Maintenance programmée',
    body: 'Une courte maintenance est prévue ce soir de 02h à 04h. Merci de votre compréhension.',
  },
  {
    id: 'new_feature',
    label: '✨ Nouveauté',
    title: '✨ Nouvelle fonctionnalité disponible !',
    body: 'Découvrez le suivi en temps réel de votre commande. Mettez à jour l\'application.',
  },
  {
    id: 'driver_bonus',
    label: '💰 Bonus chauffeur',
    title: '💰 Bonus de pointe ce soir !',
    body: 'Roulez entre 18h et 22h et gagnez ×1.5 sur chaque course. Ne manquez pas ça !',
  },
  {
    id: 'welcome',
    label: '👋 Bienvenue',
    title: '👋 Bienvenue sur EASYWAY !',
    body: 'Votre compte est activé. Commandez votre premier taxi et gagnez 50 EasyPoints offerts.',
  },
  {
    id: 'custom',
    label: '✏️ Personnalisé',
    title: '',
    body: '',
  },
];

const SCHEDULE_OPTIONS = [
  { key: 'now', label: 'Maintenant' },
  { key: '1h', label: 'Dans 1h' },
  { key: '3h', label: 'Dans 3h' },
  { key: 'tomorrow', label: 'Demain matin' },
  { key: 'custom', label: 'Personnalisé' },
];

function SentCard({ n }) {
  return (
    <View style={styles.sentCard}>
      <View style={styles.sentHeader}>
        <View style={styles.sentDot} />
        <Text style={styles.sentTitle}>{n.title}</Text>
        <Text style={styles.sentDate}>{new Date(n.sentAt).toLocaleString('fr-TN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <Text style={styles.sentBody} numberOfLines={2}>{n.body}</Text>
      <View style={styles.sentMeta}>
        <Text style={styles.sentMetaText}>👥 {n.audience}</Text>
        <Text style={styles.sentMetaText}>📨 {n.sent?.toLocaleString() || '—'} envois</Text>
        <Text style={styles.sentMetaText}>👁️ {n.opened?.toLocaleString() || '—'} ouvertures</Text>
      </View>
    </View>
  );
}

const MOCK_SENT = [
  { id: '1', title: '🎉 Offre Eid El Adha !', body: 'Profitez de -20% sur tous les trajets. Code: EID20', audience: 'ALL', sentAt: new Date(Date.now() - 86400000 * 2).toISOString(), sent: 4820, opened: 2100 },
  { id: '2', title: '💰 Bonus chauffeurs week-end', body: 'Roulez ce week-end et gagnez ×1.5 sur chaque course.', audience: 'CHAUFFEUR', sentAt: new Date(Date.now() - 86400000 * 5).toISOString(), sent: 312, opened: 245 },
];

export default function AdminPushNotificationScreen({ navigation }) {
  const [audience, setAudience] = useState('ALL');
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [title, setTitle] = useState(TEMPLATES[0].title);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [schedule, setSchedule] = useState('now');
  const [silent, setSilent] = useState(false);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('compose'); // compose | history

  const pickTemplate = (t) => {
    setTemplate(t);
    if (t.id !== 'custom') {
      setTitle(t.title);
      setBody(t.body);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Champs manquants', 'Titre et corps sont requis.');
      return;
    }
    Alert.alert(
      'Confirmer l\'envoi',
      `Envoyer à: ${AUDIENCE_OPTIONS.find(a => a.key === audience)?.label}\n\n"${title}"\n\n${body}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          style: 'destructive',
          onPress: async () => {
            setSending(true);
            try {
              await api.post('/api/admin/notifications/push', {
                audience,
                title: title.trim(),
                body: body.trim(),
                silent,
                schedule,
              });
              Alert.alert('✅ Envoyé', 'La notification a été envoyée avec succès.');
              setTitle('');
              setBody('');
              setTemplate(TEMPLATES[5]);
            } catch {
              Alert.alert('Erreur', 'Impossible d\'envoyer la notification.');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📣 Notifications push</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.tabs}>
        {[['compose', '✏️ Composer'], ['history', '📋 Historique']].map(([key, lbl]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'history' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Notifications récentes</Text>
          {MOCK_SENT.map(n => <SentCard key={n.id} n={n} />)}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Audience */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audience cible</Text>
            <View style={styles.audienceGrid}>
              {AUDIENCE_OPTIONS.map(a => (
                <TouchableOpacity
                  key={a.key}
                  style={[styles.audienceBtn, audience === a.key && { borderColor: a.color, backgroundColor: a.color + '15' }]}
                  onPress={() => setAudience(a.key)}
                >
                  <Text style={styles.audienceEmoji}>{a.emoji}</Text>
                  <Text style={[styles.audienceLabel, audience === a.key && { color: a.color }]}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modèle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.templatesRow}>
                {TEMPLATES.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.templateChip, template.id === t.id && styles.templateChipActive]}
                    onPress={() => pickTemplate(t)}
                  >
                    <Text style={[styles.templateLabel, template.id === t.id && styles.templateLabelActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message</Text>
            <Text style={styles.fieldLabel}>Titre (max 65 chars)</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={(t) => setTitle(t.slice(0, 65))}
              placeholder="Titre de la notification"
              placeholderTextColor={COLORS.muted}
            />
            <Text style={styles.charCount}>{title.length}/65</Text>

            <Text style={styles.fieldLabel}>Corps (max 200 chars)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={body}
              onChangeText={(t) => setBody(t.slice(0, 200))}
              placeholder="Contenu de la notification..."
              placeholderTextColor={COLORS.muted}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{body.length}/200</Text>
          </View>

          {/* Preview */}
          {(title || body) ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aperçu</Text>
              <View style={styles.preview}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewApp}>EASYWAY</Text>
                  <Text style={styles.previewTime}>maintenant</Text>
                </View>
                <Text style={styles.previewTitle}>{title || 'Titre'}</Text>
                <Text style={styles.previewBody} numberOfLines={3}>{body || 'Corps du message'}</Text>
              </View>
            </View>
          ) : null}

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            <Text style={styles.fieldLabel}>Planification</Text>
            <View style={styles.scheduleRow}>
              {SCHEDULE_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.scheduleChip, schedule === s.key && styles.scheduleChipActive]}
                  onPress={() => setSchedule(s.key)}
                >
                  <Text style={[styles.scheduleText, schedule === s.key && styles.scheduleTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mode silencieux (data only)</Text>
              <Switch
                value={silent}
                onValueChange={setSilent}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>

          {/* Send button */}
          <TouchableOpacity
            style={[styles.sendBtn, sending && { opacity: 0.7 }]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.sendBtnText}>
                📣 Envoyer à {AUDIENCE_OPTIONS.find(a => a.key === audience)?.label}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 14 },
  tabTextActive: { color: COLORS.accent, fontWeight: '700' },
  section: {
    backgroundColor: COLORS.surface, margin: 16, marginBottom: 0, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, marginTop: 12,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  audienceBtn: {
    width: '30%', backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  audienceEmoji: { fontSize: 22, marginBottom: 4 },
  audienceLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  templatesRow: { flexDirection: 'row', gap: 8 },
  templateChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  templateChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  templateLabel: { color: COLORS.muted, fontSize: 13 },
  templateLabelActive: { color: COLORS.accentLight, fontWeight: '700' },
  fieldLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10,
  },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: 10 },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  preview: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  previewApp: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  previewTime: { color: COLORS.muted, fontSize: 11 },
  previewTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  previewBody: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  scheduleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  scheduleChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  scheduleChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '20' },
  scheduleText: { color: COLORS.muted, fontSize: 13 },
  scheduleTextActive: { color: COLORS.accentLight, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: COLORS.white, fontSize: 14 },
  sendBtn: {
    backgroundColor: COLORS.accent, margin: 16, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 20,
  },
  sendBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  sentCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  sentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  sentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  sentTitle: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: '700' },
  sentDate: { color: COLORS.muted, fontSize: 11 },
  sentBody: { color: COLORS.muted, fontSize: 13, marginBottom: 10 },
  sentMeta: { flexDirection: 'row', gap: 12 },
  sentMetaText: { color: COLORS.muted, fontSize: 12 },
});
