import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  blue: '#3498DB',
};

const SECTIONS = [
  {
    title: '🏢 Éditeur de l\'application',
    content: [
      'Raison sociale : EASYWAY Tunisia SARL',
      'Capital social : 50 000 TND',
      'Siège social : Berges du Lac 2, Tunis 1053, Tunisie',
      'Registre du Commerce : B12345678900',
      'N° fiscal : 1234567/A/M/000',
      'Email : contact@easyway.tn',
      'Téléphone : +216 71 000 000',
    ],
  },
  {
    title: '💻 Hébergement',
    content: [
      'Fournisseur : Render Inc.',
      'Adresse : 525 Brannan Street, Suite 300, San Francisco, CA 94107, USA',
      'Site : https://render.com',
    ],
  },
  {
    title: '📱 Application mobile',
    content: [
      'Plateforme : Android & iOS',
      'Version : 1.0.0',
      'Framework : React Native / Expo',
      'Développé en Tunisie 🇹🇳',
    ],
  },
  {
    title: '⚖️ Responsabilité',
    content: [
      'EASYWAY est une plateforme de mise en relation entre clients et prestataires de services indépendants.',
      'EASYWAY n\'est ni un employeur ni une agence de travail. Les prestataires exercent en qualité d\'indépendants.',
      'EASYWAY ne peut être tenu responsable des dommages résultant de l\'utilisation des services des prestataires.',
      'Les tarifs affichés sont indicatifs et peuvent varier selon les conditions réelles.',
    ],
  },
  {
    title: '🔐 Données personnelles',
    content: [
      'Responsable du traitement : EASYWAY Tunisia SARL',
      'Finalité : Gestion des commandes, paiements, support client.',
      'Durée de conservation : 5 ans après la dernière activité.',
      'Droits : Accès, rectification, suppression — email : privacy@easyway.tn',
      'Conformité : Loi organique n° 2004-63 du 27 juillet 2004 (Tunisie).',
    ],
  },
  {
    title: '🍪 Cookies',
    content: [
      'L\'application utilise des cookies techniques nécessaires au fonctionnement.',
      'Cookies analytiques : Google Analytics (anonymisés).',
      'Vous pouvez désactiver les cookies analytiques dans les paramètres.',
    ],
  },
  {
    title: '📞 Contact & Réclamations',
    content: [
      'Support : support@easyway.tn',
      'Réclamations légales : legal@easyway.tn',
      'Délai de réponse : 48h ouvrables',
    ],
  },
];

export default function LegalMentionsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚖️ Mentions légales</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <View style={styles.dateCard}>
          <Text style={styles.dateText}>Dernière mise à jour : 4 juin 2026</Text>
        </View>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((line, j) => (
              <View key={j} style={styles.lineRow}>
                <View style={styles.lineDot} />
                <Text style={styles.lineText}>{line}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>📩 Nous contacter</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:legal@easyway.tn').catch(() => {})}>
            <Text style={styles.contactLink}>legal@easyway.tn</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+21671000000').catch(() => {})}>
            <Text style={styles.contactLink}>+216 71 000 000</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2026 EASYWAY Tunisia. Tous droits réservés.</Text>
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
  dateCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  dateText: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.accent, fontSize: 14, fontWeight: '800', marginBottom: 12 },
  lineRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  lineDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.accent, marginTop: 6 },
  lineText: { color: COLORS.muted, fontSize: 13, lineHeight: 19, flex: 1 },
  contactCard: { backgroundColor: COLORS.blue + '10', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.blue + '30', alignItems: 'center', gap: 10 },
  contactTitle: { color: COLORS.blue, fontSize: 14, fontWeight: '800' },
  contactLink: { color: COLORS.blue, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  footer: { color: COLORS.border, fontSize: 11, textAlign: 'center', marginTop: 8 },
});
