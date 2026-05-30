import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F5A623',
};

const ROLE_LABELS = {
  CHAUFFEUR: 'Chauffeur',
  LIVREUR: 'Livreur',
  DEPANNEUR: 'Dépanneur',
  MARCHAND: 'Marchand',
};

const ROLE_DOCS = {
  CHAUFFEUR: ['CIN recto/verso', 'Permis de conduire', 'Carte grise du véhicule'],
  LIVREUR: ['CIN recto/verso', 'Permis de conduire (si motorisé)', 'Photo du véhicule'],
  DEPANNEUR: ['CIN recto/verso', 'Carte professionnelle', 'Photos du camion'],
  MARCHAND: ['CIN recto/verso', 'Patente commerciale', 'Photo de la boutique'],
};

const STEPS = [
  { icon: '📋', title: 'Dossier reçu', desc: 'Votre inscription a été enregistrée avec succès.' },
  { icon: '🔍', title: 'Vérification admin', desc: 'Un agent EASYWAY vérifie votre dossier sous 24h ouvrables.' },
  { icon: '📲', title: 'Notification', desc: 'Vous recevez une notification dès que votre compte est activé.' },
  { icon: '✅', title: 'Compte actif', desc: 'Vous pouvez commencer à travailler avec EASYWAY.' },
];

export default function KYCPendingScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const docs = ROLE_DOCS[user?.role] || [];
  const roleLabel = ROLE_LABELS[user?.role] || 'Prestataire';

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@easyway.app?subject=KYC%20' + (user?.id || ''));
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Animated clock icon */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.icon}>⏳</Text>
        </Animated.View>

        <Text style={styles.title}>Vérification en cours</Text>
        <Text style={styles.subtitle}>
          Votre compte <Text style={styles.roleTag}>{roleLabel}</Text> est en attente de validation par notre équipe.
        </Text>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PROCESSUS DE VALIDATION</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepLeft}>
                <View style={[styles.stepDot, i === 1 && styles.stepDotActive]}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                </View>
                {i < STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepRight}>
                <Text style={[styles.stepTitle, i === 1 && { color: COLORS.orange }]}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Documents à préparer */}
        {docs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>DOCUMENTS QUI PEUVENT ÊTRE DEMANDÉS</Text>
            {docs.map((doc, i) => (
              <View key={i} style={styles.docRow}>
                <Text style={styles.docBullet}>•</Text>
                <Text style={styles.docText}>{doc}</Text>
              </View>
            ))}
            <Text style={styles.docNote}>
              Notre agent peut vous contacter par téléphone pour vous demander ces documents.
            </Text>
          </View>
        )}

        {/* Info délai */}
        <View style={[styles.card, { borderColor: COLORS.orange }]}>
          <Text style={styles.cardLabel}>DÉLAI DE TRAITEMENT</Text>
          <Text style={styles.delayText}>⏱ Sous <Text style={{ color: COLORS.orange, fontWeight: '700' }}>24h ouvrables</Text></Text>
          <Text style={styles.delayDesc}>
            Du lundi au samedi, 8h–20h. Vous serez notifié sur ce numéro : <Text style={{ color: COLORS.text }}>{user?.phone}</Text>
          </Text>
        </View>

        {/* Contact */}
        <TouchableOpacity style={styles.contactBtn} onPress={handleContactSupport} activeOpacity={0.8}>
          <Text style={styles.contactBtnText}>📧 Contacter le support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
          <Text style={styles.logoutBtnText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, alignItems: 'center' },
  iconWrap: { marginTop: 16, marginBottom: 20 },
  icon: { fontSize: 72 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 },
  roleTag: { color: COLORS.accent, fontWeight: '700' },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  stepLeft: { alignItems: 'center', width: 36 },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#252535',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepDotActive: { borderColor: COLORS.orange, backgroundColor: '#2A1F0A' },
  stepIcon: { fontSize: 16 },
  stepLine: { width: 2, flex: 1, minHeight: 20, backgroundColor: COLORS.border, marginVertical: 4 },
  stepRight: { flex: 1, paddingBottom: 20 },
  stepTitle: { color: COLORS.text, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  stepDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  docRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  docBullet: { color: COLORS.accent, fontSize: 16, lineHeight: 20 },
  docText: { color: COLORS.text, fontSize: 13, flex: 1, lineHeight: 20 },
  docNote: { color: COLORS.textMuted, fontSize: 11, marginTop: 8, lineHeight: 16, fontStyle: 'italic' },
  delayText: { fontSize: 16, color: COLORS.textMuted, marginBottom: 6 },
  delayDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  contactBtn: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: 12,
  },
  contactBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
  logoutBtn: { paddingVertical: 12 },
  logoutBtnText: { color: COLORS.textMuted, fontSize: 13 },
});
