import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22', purple: '#9B59B6',
};

// Target ids map directly to backend/src/routes/admin.js POST /notifications/push
// `audience` param, which filters prisma.user by `role` (or no filter for 'ALL').
// "Inactifs" and "Abonnés EasyPass" segments have no backend support (no
// inactivity tracking or EasyPass subscription model wired to this endpoint),
// so they are intentionally not offered here rather than faked.
const TARGETS = [
  { id: 'ALL', label: 'Tous les utilisateurs', icon: '👥' },
  { id: 'CLIENT', label: 'Clients uniquement', icon: '👤' },
  { id: 'CHAUFFEUR', label: 'Chauffeurs', icon: '🚕' },
  { id: 'LIVREUR', label: 'Livreurs', icon: '🛵' },
  { id: 'DEPANNEUR', label: 'Dépanneurs', icon: '🔧' },
  { id: 'MARCHAND', label: 'Marchands', icon: '🏪' },
];

const TEMPLATES = [
  { label: '🎁 Promo flash', title: 'Offre limitée !', body: '30% de réduction sur votre prochaine course. Ce soir seulement !' },
  { label: '🔔 Rappel inactivité', title: 'Vous nous manquez !', body: 'Revenez sur EASYWAY et profitez de 5 TND offerts sur votre prochaine commande.' },
  { label: '🆕 Nouveau service', title: 'Découvrez notre nouveauté', body: 'EASYWAY lance un nouveau service. Essayez-le maintenant !' },
  { label: '📊 Rapport mensuel', title: 'Votre résumé du mois', body: 'Consultez vos statistiques du mois sur l\'application.' },
];

export default function AdminPushCampaignScreen({ navigation }) {
  const [tab, setTab] = useState('create');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('ALL');
  const [scheduled, setScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const selectedTarget = TARGETS.find(t => t.id === target);

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setBody(tpl.body);
  };

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await api.get('/api/admin/notifications/campaigns');
      setHistory(res?.data?.campaigns || []);
    } catch (err) {
      console.error('[AdminPushCampaignScreen] loadHistory failed:', err);
      setHistoryError(err?.response?.data?.error || err.message || 'Impossible de charger l\'historique.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, loadHistory]);

  const doSend = async () => {
    setSending(true);
    try {
      const res = await api.post('/api/admin/notifications/campaigns', {
        title,
        body,
        audience: target,
        sendNow: !scheduled,
        scheduledAt: scheduled ? scheduleDate : null,
      });
      setLastResult(res?.data?.campaign || null);
      setSent(true);
    } catch (err) {
      console.error('[AdminPushCampaignScreen] send campaign failed:', err);
      const msg = err?.response?.data?.error || err.message || 'Impossible d\'envoyer la campagne.';
      Alert.alert('Erreur', msg);
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Champs requis', 'Titre et message sont obligatoires.');
      return;
    }
    Alert.alert(
      scheduled ? 'Planifier la campagne' : 'Envoyer maintenant',
      `${selectedTarget.label}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: scheduled ? 'Planifier' : 'Envoyer', onPress: doSend },
      ]
    );
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.sentContainer}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🚀</Text>
          <Text style={styles.sentTitle}>{scheduled ? 'Campagne planifiée !' : 'Notification envoyée !'}</Text>
          <Text style={styles.sentSub}>
            {scheduled
              ? `Planifiée · ${selectedTarget.label}`
              : `${(lastResult?.reached ?? 0).toLocaleString()} destinataires · ${selectedTarget.label}`}
          </Text>
          <View style={styles.sentCard}>
            <Text style={styles.sentCardTitle}>{title}</Text>
            <Text style={styles.sentCardBody}>{body}</Text>
          </View>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => { setSent(false); setTitle(''); setBody(''); setLastResult(null); }}
          >
            <Text style={styles.backBtnText}>Créer une nouvelle campagne</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campagnes push</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { id: 'create', label: '✏️ Créer' },
          { id: 'history', label: '📋 Historique' },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, tab === t.id && styles.tabActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabText, tab === t.id && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'create' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          {/* Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Modèles rapides</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.templatesRow}>
                {TEMPLATES.map((tpl, i) => (
                  <TouchableOpacity key={i} style={styles.tplChip} onPress={() => applyTemplate(tpl)}>
                    <Text style={styles.tplText}>{tpl.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Contenu</Text>
            <Text style={styles.fieldLabel}>Titre (max 60 car.)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Offre flash ce soir !"
              placeholderTextColor={COLORS.muted}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />
            <Text style={styles.charCount}>{title.length}/60</Text>
            <Text style={styles.fieldLabel}>Message (max 160 car.)</Text>
            <TextInput
              style={[styles.input, { minHeight: 90 }]}
              placeholder="Votre message aux utilisateurs..."
              placeholderTextColor={COLORS.muted}
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
              maxLength={160}
            />
            <Text style={styles.charCount}>{body.length}/160</Text>
          </View>

          {/* Preview */}
          {(title || body) && (
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Aperçu notification</Text>
              <View style={styles.notifPreview}>
                <View style={styles.notifIcon}>
                  <Text style={{ fontSize: 20 }}>🔔</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{title || 'Titre...'}</Text>
                  <Text style={styles.notifBody} numberOfLines={2}>{body || 'Message...'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Target */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Cible</Text>
            <View style={styles.targetGrid}>
              {TARGETS.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.targetCard, target === t.id && styles.targetCardActive]}
                  onPress={() => setTarget(t.id)}
                >
                  <Text style={styles.targetIcon}>{t.icon}</Text>
                  <Text style={[styles.targetLabel, target === t.id && { color: COLORS.white }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <View style={styles.scheduleRow}>
              <Text style={styles.sectionTitle}>📅 Planifier l'envoi</Text>
              <Switch
                value={scheduled}
                onValueChange={setScheduled}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={COLORS.white}
              />
            </View>
            {scheduled && (
              <TextInput
                style={styles.input}
                placeholder="JJ/MM/AAAA à HH:MM"
                placeholderTextColor={COLORS.muted}
                value={scheduleDate}
                onChangeText={setScheduleDate}
              />
            )}
          </View>

        </ScrollView>
      )}

      {tab === 'history' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.section}>
            {historyLoading && (
              <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
            )}
            {!historyLoading && historyError && (
              <Text style={{ color: COLORS.red, textAlign: 'center', marginTop: 20 }}>{historyError}</Text>
            )}
            {!historyLoading && !historyError && history.length === 0 && (
              <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 20 }}>
                Aucune campagne envoyée pour le moment.
              </Text>
            )}
            {!historyLoading && !historyError && history.map((h) => {
              // NOTE: "opened" / open-rate is not tracked by the backend
              // (backend/src/routes/admin.js POST /notifications/campaigns
              // always stores opened: 0) — there is no click/open tracking
              // wired up, so we only show real fields (reached, status).
              return (
                <View key={h.id} style={styles.historyCard}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyTitle}>{h.title}</Text>
                    <Text style={styles.historyDate}>{h.sentAt ? new Date(h.sentAt).toLocaleString() : (h.scheduledAt || h.status)}</Text>
                  </View>
                  <Text style={styles.historyTarget}>🎯 {h.audience} · {h.status}</Text>
                  <View style={styles.historyStats}>
                    <View style={styles.historyStat}>
                      <Text style={styles.historyStatNum}>{(h.reached || 0).toLocaleString()}</Text>
                      <Text style={styles.historyStatLbl}>Atteints</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Footer */}
      {tab === 'create' && (
        <View style={styles.footer}>
          <View style={styles.recipientsInfo}>
            <Text style={styles.recipientsLabel}>{selectedTarget.label}</Text>
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!title.trim() || !body.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!title.trim() || !body.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.sendBtnText}>
                {scheduled ? '📅 Planifier' : '🚀 Envoyer maintenant'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  templatesRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  tplChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tplText: { color: COLORS.white, fontSize: 13 },
  fieldLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 14, paddingVertical: 11,
  },
  charCount: { color: COLORS.border, fontSize: 11, textAlign: 'right', marginTop: 3 },
  previewCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.blue,
  },
  previewLabel: { color: COLORS.blue, fontSize: 11, fontWeight: '700', marginBottom: 10 },
  notifPreview: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  notifIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#1A1408', alignItems: 'center', justifyContent: 'center',
  },
  notifTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  notifBody: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  targetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  targetCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  targetCardActive: { borderColor: COLORS.accent, backgroundColor: '#1A1408' },
  targetIcon: { fontSize: 24, marginBottom: 4 },
  targetLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginBottom: 3 },
  targetCount: { color: COLORS.muted, fontSize: 14, fontWeight: '700' },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  historyCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  historyDate: { color: COLORS.muted, fontSize: 11 },
  historyTarget: { color: COLORS.muted, fontSize: 12, marginBottom: 10 },
  historyStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  historyStat: { alignItems: 'center' },
  historyStatNum: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  historyStatLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  openRateBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  openRateFill: { height: '100%', backgroundColor: COLORS.green, borderRadius: 2 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: 16, alignItems: 'center',
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  recipientsInfo: { alignItems: 'center' },
  recipientsNum: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  recipientsLabel: { color: COLORS.muted, fontSize: 10 },
  sendBtn: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.surface },
  sendBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  sentContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  sentTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  sentSub: { color: COLORS.muted, fontSize: 14, marginBottom: 24 },
  sentCard: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 32,
  },
  sentCardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  sentCardBody: { color: COLORS.muted, fontSize: 14 },
  backBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14,
  },
  backBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
