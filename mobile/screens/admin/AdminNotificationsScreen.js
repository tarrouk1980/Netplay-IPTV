import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const TARGETS = [
  { key: 'ALL', label: 'Tous les utilisateurs', icon: '👥' },
  { key: 'CLIENTS', label: 'Clients uniquement', icon: '👤' },
  { key: 'CHAUFFEURS', label: 'Chauffeurs', icon: '🚕' },
  { key: 'LIVREURS', label: 'Livreurs', icon: '🛵' },
  { key: 'DEPANNEURS', label: 'Dépanneurs', icon: '🛻' },
  { key: 'MARCHANDS', label: 'Marchands', icon: '🏪' },
];

const HISTORY = [
  { id: 'N1', title: 'Promo weekend', body: '-20% sur tous les taxis ce week-end !', target: 'ALL', sentAt: '01 juin 14:30', reach: 18432 },
  { id: 'N2', title: 'Mise à jour disponible', body: 'EasyWay v2.1 est disponible sur le store.', target: 'ALL', sentAt: '28 mai 09:00', reach: 18432 },
  { id: 'N3', title: 'Bonus chauffeurs', body: 'Bonus x2 pour les 10 premières courses du jour.', target: 'CHAUFFEURS', sentAt: '25 mai 07:00', reach: 212 },
];

export default function AdminNotificationsScreen({ navigation }) {
  const [tab, setTab] = useState('send');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('ALL');
  const [scheduled, setScheduled] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Champs requis', 'Titre et message sont obligatoires.');
      return;
    }
    const targetLabel = TARGETS.find(t => t.key === target)?.label;
    Alert.alert(
      'Confirmer l\'envoi',
      `Envoyer "${title}" à : ${targetLabel} ?\n\n${scheduled ? `Programmé le ${schedDate}` : 'Envoi immédiat'}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer', onPress: async () => {
            setSending(true);
            try {
              await api.post('/api/admin/notifications/send', { title, body, target, scheduled, schedDate });
            } catch {}
            Alert.alert('✅ Notification envoyée', `Message diffusé à ${targetLabel}.`);
            setTitle(''); setBody(''); setScheduled(false); setSchedDate('');
            setSending(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 Notifications push</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.tabRow}>
        {[{ key: 'send', label: '📤 Envoyer' }, { key: 'history', label: '📋 Historique' }].map(t => (
          <TouchableOpacity key={t.key} style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tab === 'send' ? (
          <>
            <Text style={styles.fieldLabel}>DESTINATAIRES</Text>
            <View style={styles.targetsWrap}>
              {TARGETS.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.targetBtn, target === t.key && styles.targetBtnActive]}
                  onPress={() => setTarget(t.key)}
                >
                  <Text style={styles.targetIcon}>{t.icon}</Text>
                  <Text style={[styles.targetLabel, target === t.key && { color: COLORS.accent }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>TITRE *</Text>
            <TextInput
              style={styles.input}
              placeholder="Titre de la notification..."
              placeholderTextColor={COLORS.muted}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />
            <Text style={styles.charCount}>{title.length}/60</Text>

            <Text style={styles.fieldLabel}>MESSAGE *</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Corps du message..."
              placeholderTextColor={COLORS.muted}
              value={body}
              onChangeText={setBody}
              multiline numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.charCount}>{body.length}/200</Text>

            <View style={styles.scheduledRow}>
              <Text style={styles.scheduledLabel}>Programmer l'envoi</Text>
              <Switch
                value={scheduled}
                onValueChange={setScheduled}
                trackColor={{ false: COLORS.border, true: COLORS.accent + '60' }}
                thumbColor={scheduled ? COLORS.accent : COLORS.muted}
              />
            </View>
            {scheduled && (
              <TextInput
                style={styles.input}
                placeholder="JJ/MM/AAAA HH:MM"
                placeholderTextColor={COLORS.muted}
                value={schedDate}
                onChangeText={setSchedDate}
                keyboardType="numeric"
              />
            )}

            <TouchableOpacity
              style={[styles.sendBtn, (sending || !title || !body) && { opacity: 0.5 }]}
              onPress={handleSend}
              disabled={sending || !title || !body}
            >
              {sending ? <ActivityIndicator color="#000" /> : (
                <Text style={styles.sendBtnText}>
                  {scheduled ? '📅 Programmer' : '📤 Envoyer maintenant'}
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{HISTORY.length} NOTIFICATIONS ENVOYÉES</Text>
            {HISTORY.map(n => (
              <View key={n.id} style={styles.histCard}>
                <View style={styles.histTop}>
                  <Text style={styles.histTitle}>{n.title}</Text>
                  <Text style={styles.histTarget}>{TARGETS.find(t => t.key === n.target)?.icon} {n.target}</Text>
                </View>
                <Text style={styles.histBody} numberOfLines={2}>{n.body}</Text>
                <View style={styles.histMeta}>
                  <Text style={styles.histDate}>{n.sentAt}</Text>
                  <Text style={styles.histReach}>👥 {n.reach.toLocaleString()} destinataires</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  content: { padding: 16 },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  targetsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  targetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  targetBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  targetIcon: { fontSize: 14 },
  targetLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  textarea: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, minHeight: 100 },
  charCount: { color: COLORS.muted, fontSize: 10, textAlign: 'right', marginTop: 3, marginBottom: 2 },
  scheduledRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 14 },
  scheduledLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  sendBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  sendBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  histCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  histTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  histTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', flex: 1 },
  histTarget: { color: COLORS.accent, fontSize: 11, fontWeight: '600' },
  histBody: { color: COLORS.muted, fontSize: 12, lineHeight: 17, marginBottom: 8 },
  histMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  histDate: { color: COLORS.muted, fontSize: 11 },
  histReach: { color: COLORS.green, fontSize: 11, fontWeight: '600' },
});
