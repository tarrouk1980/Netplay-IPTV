import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, StatusBar, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  accent: '#D32F2F',
  amber: '#F57C00',
  info: '#3498DB',
};

const ROLES = [
  { key: 'CLIENT', label: 'Clients', icon: '👤', color: '#4A9EFF' },
  { key: 'CHAUFFEUR', label: 'Chauffeurs', icon: '🚕', color: '#F5A623' },
  { key: 'LIVREUR', label: 'Livreurs', icon: '🛵', color: '#27AE60' },
  { key: 'DEPANNEUR', label: 'Dépanneurs', icon: '🛻', color: '#9B59B6' },
  { key: 'MARCHAND', label: 'Marchands', icon: '🏪', color: '#E74C3C' },
];

const NOTIF_TYPES = [
  { key: 'PROMO', label: '🎁 Promotion', desc: 'Offres et réductions' },
  { key: 'SYSTEM', label: '⚙️ Système', desc: 'Maintenance, mises à jour' },
  { key: 'ORDER_NEW', label: '📦 Commandes', desc: 'Nouvelles commandes disponibles' },
  { key: 'KYC_APPROVED', label: '✅ KYC', desc: 'Vérification d\'identité' },
];

const HISTORY = [
  { id: 1, title: 'Mise à jour v2.1', roles: ['ALL'], sentAt: '2025-05-28', type: 'SYSTEM', recipients: 1240 },
  { id: 2, title: 'Promo Ramadan -20%', roles: ['CLIENT'], sentAt: '2025-05-15', type: 'PROMO', recipients: 870 },
];

export default function AdminBroadcastScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notifType, setNotifType] = useState('SYSTEM');
  const [targetAll, setTargetAll] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('COMPOSE'); // COMPOSE | HISTORY

  const toggleRole = (key) => {
    setSelectedRoles(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Champs requis', 'Titre et message sont obligatoires.');
      return;
    }
    if (!targetAll && selectedRoles.length === 0) {
      Alert.alert('Destinataires requis', 'Sélectionnez au moins un rôle cible.');
      return;
    }

    const rolesStr = targetAll ? 'tous les utilisateurs' : selectedRoles.map(r => ROLES.find(x => x.key === r)?.label).join(', ');
    Alert.alert(
      'Confirmer l\'envoi',
      `Envoyer "${title}" à ${rolesStr} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer', onPress: async () => {
            setSending(true);
            try {
              await api.post('/api/notifications/broadcast', {
                title: title.trim(),
                body: body.trim(),
                type: notifType,
                roles: targetAll ? null : selectedRoles,
              });
              Alert.alert('Notification envoyée ✅', `La notification a été distribuée.`);
              setTitle('');
              setBody('');
              setNotifType('SYSTEM');
              setSelectedRoles([]);
            } catch (err) {
              Alert.alert('Erreur', err?.response?.data?.error || 'Envoi impossible.');
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📣 Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        {['COMPOSE', 'HISTORY'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'COMPOSE' ? '✏️ Composer' : '📜 Historique'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {tab === 'COMPOSE' && (
          <>
            {/* Type */}
            <Text style={styles.sectionLabel}>TYPE DE NOTIFICATION</Text>
            {NOTIF_TYPES.map(nt => (
              <TouchableOpacity
                key={nt.key}
                style={[styles.typeCard, notifType === nt.key && styles.typeCardActive]}
                onPress={() => setNotifType(nt.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, notifType === nt.key && styles.radioActive]}>
                  {notifType === nt.key && <View style={styles.radioDot} />}
                </View>
                <View style={styles.typeInfo}>
                  <Text style={[styles.typeLabel, notifType === nt.key && { color: COLORS.text }]}>{nt.label}</Text>
                  <Text style={styles.typeDesc}>{nt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Target */}
            <Text style={styles.sectionLabel}>DESTINATAIRES</Text>
            <View style={styles.allRow}>
              <Text style={styles.allLabel}>Tous les utilisateurs</Text>
              <Switch
                value={targetAll}
                onValueChange={setTargetAll}
                trackColor={{ false: COLORS.border, true: COLORS.info + '80' }}
                thumbColor={targetAll ? COLORS.info : COLORS.muted}
              />
            </View>
            {!targetAll && (
              <View style={styles.rolesGrid}>
                {ROLES.map(r => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.roleChip, selectedRoles.includes(r.key) && { backgroundColor: r.color + '22', borderColor: r.color }]}
                    onPress={() => toggleRole(r.key)}
                  >
                    <Text style={styles.roleChipIcon}>{r.icon}</Text>
                    <Text style={[styles.roleChipText, selectedRoles.includes(r.key) && { color: r.color }]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Content */}
            <Text style={styles.sectionLabel}>CONTENU</Text>
            <TextInput
              style={styles.input}
              placeholder="Titre de la notification"
              placeholderTextColor={COLORS.muted}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />
            <Text style={styles.charCount}>{title.length}/60</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Corps du message…"
              placeholderTextColor={COLORS.muted}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.charCount}>{body.length}/200</Text>

            {/* Preview */}
            {(title || body) && (
              <View style={styles.previewCard}>
                <Text style={styles.previewHeader}>APERÇU</Text>
                <View style={styles.notifPreview}>
                  <Text style={styles.notifPreviewApp}>EASYWAY</Text>
                  <Text style={styles.notifPreviewTitle}>{title || 'Titre de la notification'}</Text>
                  <Text style={styles.notifPreviewBody} numberOfLines={2}>{body || 'Corps du message'}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.sendBtn, sending && { opacity: 0.6 }]}
              onPress={handleSend}
              disabled={sending}
              activeOpacity={0.85}
            >
              {sending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.sendBtnText}>📣 Envoyer la notification</Text>}
            </TouchableOpacity>
          </>
        )}

        {tab === 'HISTORY' && (
          <>
            <Text style={styles.sectionLabel}>NOTIFICATIONS ENVOYÉES</Text>
            {HISTORY.map(h => (
              <View key={h.id} style={styles.historyCard}>
                <View style={styles.historyTop}>
                  <Text style={styles.historyTitle}>{h.title}</Text>
                  <Text style={styles.historyDate}>{h.sentAt}</Text>
                </View>
                <View style={styles.historyMeta}>
                  <Text style={styles.historyType}>{NOTIF_TYPES.find(n => n.key === h.type)?.label || h.type}</Text>
                  <Text style={styles.historyRecipients}>👥 {h.recipients} destinataires</Text>
                </View>
                <View style={styles.historyRoles}>
                  {h.roles.map(r => (
                    <View key={r} style={styles.historyRolePill}>
                      <Text style={styles.historyRoleText}>{r === 'ALL' ? 'Tous' : r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.info },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.text },
  scroll: { padding: 16 },
  sectionLabel: {
    color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', marginBottom: 10, marginTop: 8,
  },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeCardActive: { borderColor: COLORS.info, backgroundColor: COLORS.info + '10' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.info },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.info },
  typeInfo: { flex: 1 },
  typeLabel: { color: COLORS.muted, fontSize: 14, fontWeight: '700' },
  typeDesc: { color: COLORS.muted, fontSize: 12, marginTop: 1 },
  allRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  allLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  roleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  roleChipIcon: { fontSize: 16 },
  roleChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 4,
  },
  textarea: { minHeight: 90 },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginBottom: 10 },
  previewCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  previewHeader: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  notifPreview: { backgroundColor: COLORS.bg, borderRadius: 12, padding: 14 },
  notifPreviewApp: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  notifPreviewTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  notifPreviewBody: { color: COLORS.muted, fontSize: 13 },
  sendBtn: { backgroundColor: COLORS.info, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  sendBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  historyCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  historyTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  historyDate: { color: COLORS.muted, fontSize: 12 },
  historyMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  historyType: { color: COLORS.muted, fontSize: 12 },
  historyRecipients: { color: COLORS.info, fontSize: 12, fontWeight: '600' },
  historyRoles: { flexDirection: 'row', gap: 6 },
  historyRolePill: { backgroundColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  historyRoleText: { color: COLORS.muted, fontSize: 11 },
});
