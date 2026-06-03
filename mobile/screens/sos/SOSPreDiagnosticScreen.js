import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const BREAKDOWN_TYPES = [
  {
    id: 'battery',
    emoji: '🔋',
    label: 'Batterie',
    description: "Voiture ne démarre pas, voyant batterie allumé",
  },
  {
    id: 'flat_tire',
    emoji: '🛞',
    label: 'Pneu crevé',
    description: 'Pneu à plat, crevaison',
  },
  {
    id: 'engine',
    emoji: '⚙️',
    label: 'Panne moteur',
    description: 'Moteur ne tourne pas, fumée',
  },
  {
    id: 'fuel',
    emoji: '⛽',
    label: 'Manque de carburant',
    description: 'Réservoir vide',
  },
  {
    id: 'key',
    emoji: '🔑',
    label: 'Clé bloquée',
    description: 'Clé perdue ou bloquée dans le contact',
  },
  {
    id: 'accident',
    emoji: '🚗',
    label: 'Accident',
    description: 'Choc, dommages carrosserie',
  },
  {
    id: 'other',
    emoji: '❓',
    label: 'Autre',
    description: 'Autre problème non listé',
  },
];

export default function SOSPreDiagnosticScreen({ navigation }) {
  const handleSelect = (type) => {
    navigation.navigate('SOSRequest', { breakdownType: type });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pré-diagnostic</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={styles.introEmoji}>🛻</Text>
          <Text style={styles.introTitle}>Identifiez votre panne</Text>
          <Text style={styles.introText}>
            Sélectionnez le type de problème pour aider le dépanneur 🛻 à venir préparé avec le bon équipement.
          </Text>
        </View>

        {/* Breakdown type list */}
        {BREAKDOWN_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.card}
            onPress={() => handleSelect(type.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardEmoji}>{type.emoji}</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>{type.label}</Text>
              <Text style={styles.cardDescription}>{type.description}</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Emergency tip */}
        <View style={styles.emergencyBox}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyText}>
            En cas de danger immédiat, appelez le <Text style={styles.emergencyNumber}>197</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  backIcon: { fontSize: 22, color: COLORS.text },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSpacer: { width: 30 },
  content: { padding: 16, paddingBottom: 32 },
  introBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  introEmoji: { fontSize: 40, marginBottom: 8 },
  introTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  introText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardEmoji: { fontSize: 36, marginRight: 14 },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardDescription: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  cardArrow: { fontSize: 24, color: COLORS.primary, marginLeft: 8 },
  emergencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1010',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#5C2020',
    gap: 10,
  },
  emergencyIcon: { fontSize: 24 },
  emergencyText: { flex: 1, fontSize: 14, color: '#FF6B6B', lineHeight: 20 },
  emergencyNumber: { fontWeight: '800', fontSize: 16, color: '#FF4444' },
});
