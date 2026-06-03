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
    description: "Pneu à plat, crevaison",
  },
  {
    id: 'engine',
    emoji: '⚙️',
    label: 'Panne moteur',
    description: "Moteur ne tourne pas, fumée",
  },
  {
    id: 'fuel',
    emoji: '⛽',
    label: 'Manque de carburant',
    description: "Réservoir vide",
  },
  {
    id: 'key',
    emoji: '🔑',
    label: 'Clé bloquée',
    description: "Clé perdue ou bloquée dans le contact",
  },
  {
    id: 'accident',
    emoji: '🚗',
    label: 'Accident',
    description: "Choc, dommages carrosserie",
  },
  {
    id: 'other',
    emoji: '❓',
    label: 'Autre',
    description: "Autre problème non listé",
  },
];

export default function SOSPreDiagnosticScreen({ navigation }) {
  const handleSelect = (type) => {
    navigation.navigate('SOSRequest', { breakdownType: type });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pré-diagnostic</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>🛻 Identifiez votre panne</Text>
          <Text style={styles.introText}>
            {"Sélectionnez le type de panne pour aider le dépanneur à préparer l'intervention et arriver avec le bon équipement."}
          </Text>
        </View>

        {/* Breakdown Types */}
        {BREAKDOWN_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={styles.typeCard}
            onPress={() => handleSelect(type.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.typeEmoji}>{type.emoji}</Text>
            <View style={styles.typeInfo}>
              <Text style={styles.typeLabel}>{type.label}</Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </View>
            <Text style={styles.typeArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Emergency Tip */}
        <View style={styles.emergencyBox}>
          <Text style={styles.emergencyText}>
            {"⚠️ En cas de danger immédiat, appelez le 197"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
    width: 36,
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  introBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  introTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  introText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  typeDescription: {
    color: COLORS.muted,
    fontSize: 13,
  },
  typeArrow: {
    color: COLORS.muted,
    fontSize: 24,
    marginLeft: 8,
  },
  emergencyBox: {
    backgroundColor: '#2A1010',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#5A1010',
    alignItems: 'center',
  },
  emergencyText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
