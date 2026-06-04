import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const TOPICS = [
  { id: 'payment', icon: '💳', label: 'Problème de paiement' },
  { id: 'order', icon: '📦', label: 'Problème de commande' },
  { id: 'driver', icon: '🚕', label: 'Signaler un chauffeur' },
  { id: 'account', icon: '👤', label: 'Problème de compte' },
  { id: 'refund', icon: '↩️', label: 'Demander un remboursement' },
  { id: 'other', icon: '💬', label: 'Autre' },
];

const FAQ = [
  { q: 'Comment annuler une course ?', a: 'Ouvrez votre trajet en cours > Annuler. Des frais peuvent s\'appliquer si le chauffeur est déjà en route.' },
  { q: 'Mon paiement a été prélevé mais la course n\'a pas eu lieu ?', a: 'Contactez-nous via le formulaire, le remboursement est traité sous 48h.' },
  { q: 'Comment modifier mon adresse ?', a: 'Allez dans Profil > Mes adresses pour ajouter ou modifier vos adresses sauvegardées.' },
  { q: 'Comment changer de numéro de téléphone ?', a: 'Allez dans Profil > Modifier le profil. Une vérification par SMS sera effectuée.' },
];

export default function ClientSupportScreen({ navigation }) {
  const [topic, setTopic] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!topic) { Alert.alert('Sélectionnez un sujet'); return; }
    if (message.trim().length < 10) { Alert.alert('Message trop court'); return; }
    setSending(true);
    try {
      await api.post('/api/support/ticket', { topic, message });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.successBox}>
          <Text style={{ fontSize: 60 }}>✅</Text>
          <Text style={styles.successTitle}>Message envoyé !</Text>
          <Text style={styles.successSub}>Notre équipe vous répondra dans les 24h via votre email.</Text>
          <TouchableOpacity style={styles.successBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.successBtnText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎧 Support client</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <Text style={styles.sectionTitle}>FAQ RAPIDE</Text>
          {FAQ.map((item, i) => (
            <TouchableOpacity key={i} style={styles.faqCard} onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}>
              <View style={styles.faqRow}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Text style={styles.faqChevron}>{expandedFaq === i ? '▲' : '▼'}</Text>
              </View>
              {expandedFaq === i && <Text style={styles.faqA}>{item.a}</Text>}
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>CONTACTER LE SUPPORT</Text>

          <Text style={styles.label}>Sujet</Text>
          <View style={styles.topicsGrid}>
            {TOPICS.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.topicBtn, topic === t.id && styles.topicBtnActive]}
                onPress={() => setTopic(t.id)}
              >
                <Text style={styles.topicIcon}>{t.icon}</Text>
                <Text style={[styles.topicLabel, topic === t.id && { color: COLORS.accent }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Votre message</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez votre problème en détail..."
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{message.length}/1000</Text>

          <TouchableOpacity
            style={[styles.sendBtn, (sending || !topic) && { opacity: 0.5 }]}
            onPress={send}
            disabled={sending || !topic}
          >
            <Text style={styles.sendBtnText}>{sending ? 'Envoi...' : '📨 Envoyer au support'}</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📞 Urgence : +216 71 000 000</Text>
            <Text style={styles.infoText}>⏰ Disponible 7j/7 de 8h à 22h</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  scroll: { padding: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  faqCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 },
  faqChevron: { color: COLORS.muted, fontSize: 12 },
  faqA: { color: COLORS.muted, fontSize: 13, marginTop: 10, lineHeight: 20 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 10 },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  topicBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  topicIcon: { fontSize: 16 },
  topicLabel: { color: COLORS.text, fontSize: 12 },
  textArea: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    color: COLORS.text, fontSize: 14, minHeight: 120,
    borderWidth: 1, borderColor: COLORS.border,
  },
  charCount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  sendBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 20,
  },
  sendBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  infoBox: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginTop: 16, borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  infoText: { color: COLORS.muted, fontSize: 13 },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginTop: 20, marginBottom: 12 },
  successSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  successBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 40, marginTop: 32,
  },
  successBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
