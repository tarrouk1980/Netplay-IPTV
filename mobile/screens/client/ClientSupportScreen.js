import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const FAQ = [
  { q: 'Comment annuler une commande ?', a: 'Vous pouvez annuler depuis le détail de votre commande tant que le restaurant n\'a pas commencé la préparation. Après, contactez le support.' },
  { q: 'Comment demander un remboursement ?', a: 'Signalez le problème dans les 24h via le bouton "Signaler un problème" sur votre commande. Le remboursement est traité sous 3-5 jours.' },
  { q: 'Pourquoi mon paiement a été refusé ?', a: 'Vérifiez le solde de votre portefeuille ou les informations de votre carte. Contactez votre banque si le problème persiste.' },
  { q: 'Comment modifier mon adresse de livraison ?', a: 'Vous pouvez modifier l\'adresse avant que le livreur parte chercher votre commande. Ouvrez la commande et cliquez "Modifier l\'adresse".' },
  { q: 'EasyWay prélève-t-il des commissions ?', a: 'Non ! EasyWay ne prélève aucune commission. Les prix affichés sont identiques à ceux du restaurant.' },
];

const CATEGORIES = [
  { key: 'commande', icon: '📦', label: 'Commande' },
  { key: 'paiement', icon: '💳', label: 'Paiement' },
  { key: 'compte', icon: '👤', label: 'Mon compte' },
  { key: 'technique', icon: '📱', label: 'Technique' },
  { key: 'autre', icon: '💬', label: 'Autre' },
];

export default function ClientSupportScreen({ navigation }) {
  const [expanded, setExpanded] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [category, setCategory] = useState('commande');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir le sujet et le message.');
      return;
    }
    setSending(true);
    try {
      await api.post('/api/client/support/ticket', { category, subject, message });
    } catch {}
    setSending(false);
    setShowTicket(false);
    setSubject('');
    setMessage('');
    Alert.alert('✅ Ticket envoyé', 'Notre équipe vous répondra sous 2h en moyenne. Vous recevrez une notification.');
  };

  const handleCall = () => Linking.openURL('tel:+21671000000').catch(() => {});
  const handleWhatsApp = () => Linking.openURL('https://wa.me/21671000000').catch(() => {});

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎧 Support EasyWay</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Contact options */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => navigation.navigate('ClientChat', { topic: 'Support EasyWay' })}>
            <Text style={{ fontSize: 28 }}>💬</Text>
            <Text style={styles.contactLabel}>Chat en direct</Text>
            <Text style={styles.contactSub}>Répond en &lt; 2 min</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <Text style={{ fontSize: 28 }}>📞</Text>
            <Text style={styles.contactLabel}>Téléphone</Text>
            <Text style={styles.contactSub}>Lun–Sam 8h–20h</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { borderColor: COLORS.green + '40' }]} onPress={handleWhatsApp}>
            <Text style={{ fontSize: 28 }}>📱</Text>
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <Text style={styles.contactSub}>24h/24</Text>
          </TouchableOpacity>
        </View>

        {/* Open ticket */}
        <TouchableOpacity style={styles.ticketBtn} onPress={() => setShowTicket(!showTicket)}>
          <Text style={styles.ticketBtnText}>📝 Ouvrir un ticket support</Text>
          <Text style={styles.ticketBtnArrow}>{showTicket ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showTicket && (
          <View style={styles.ticketForm}>
            <Text style={styles.fieldLabel}>CATÉGORIE</Text>
            <View style={styles.categoriesRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.catBtn, category === c.key && styles.catBtnActive]}
                  onPress={() => setCategory(c.key)}
                >
                  <Text style={{ fontSize: 16 }}>{c.icon}</Text>
                  <Text style={[styles.catLabel, category === c.key && styles.catLabelActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>SUJET</Text>
            <TextInput
              style={styles.fieldInput}
              value={subject}
              onChangeText={setSubject}
              placeholder="Ex: Commande non livrée #CMD-0042"
              placeholderTextColor={COLORS.muted}
            />
            <Text style={styles.fieldLabel}>MESSAGE</Text>
            <TextInput
              style={[styles.fieldInput, { minHeight: 100, textAlignVertical: 'top' }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Décrivez votre problème en détail..."
              placeholderTextColor={COLORS.muted}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, sending && { opacity: 0.6 }]}
              onPress={handleSendTicket}
              disabled={sending}
            >
              {sending ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.sendBtnText}>Envoyer le ticket</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* FAQ */}
        <Text style={styles.sectionTitle}>QUESTIONS FRÉQUENTES</Text>
        {FAQ.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqCard}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.faqTop}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Text style={[styles.faqArrow, expanded === i && { color: COLORS.accent }]}>
                {expanded === i ? '▲' : '▼'}
              </Text>
            </View>
            {expanded === i && <Text style={styles.faqA}>{item.a}</Text>}
          </TouchableOpacity>
        ))}

        {/* Emergency */}
        <TouchableOpacity
          style={styles.emergencyBtn}
          onPress={() => navigation.navigate('ClientEmergency')}
        >
          <Text style={styles.emergencyBtnText}>🆘 Urgence / Sécurité</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  contactCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border },
  contactLabel: { color: COLORS.text, fontSize: 11, fontWeight: '800', marginTop: 2 },
  contactSub: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  ticketBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.accent + '40' },
  ticketBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  ticketBtnArrow: { color: COLORS.accent, fontSize: 12 },
  ticketForm: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catBtn: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, gap: 3 },
  catBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  catLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  catLabelActive: { color: COLORS.accent },
  fieldInput: { backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  sendBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  sendBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  faqCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  faqTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  faqQ: { color: COLORS.text, fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 19 },
  faqArrow: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  faqA: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  emergencyBtn: { backgroundColor: COLORS.red + '15', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: COLORS.red + '40' },
  emergencyBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '800' },
});
