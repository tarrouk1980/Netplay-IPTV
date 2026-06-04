import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3A',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  red: '#E74C3C', green: '#27AE60',
};

const BREAKDOWN_TREE = [
  {
    id: 'battery',
    emoji: '🔋',
    label: 'Batterie',
    description: 'Voiture ne démarre pas, voyant batterie allumé',
    subcauses: [
      { id: 'battery_dead', label: 'Batterie complètement déchargée', detail: 'Le moteur ne répond plus du tout' },
      { id: 'battery_weak', label: 'Batterie faible', detail: 'Démarrage difficile, lumières faibles' },
      { id: 'battery_cable', label: 'Problème de câbles', detail: 'Bornes oxydées ou câbles endommagés' },
      { id: 'battery_alternator', label: 'Alternateur défectueux', detail: 'Batterie ne se recharge pas en roulant' },
    ],
  },
  {
    id: 'flat_tire',
    emoji: '🛞',
    label: 'Pneu crevé',
    description: 'Pneu à plat, crevaison',
    subcauses: [
      { id: 'tire_puncture', label: 'Crevaison simple', detail: 'Clou, vis ou objet perforant' },
      { id: 'tire_blowout', label: 'Éclatement de pneu', detail: 'Pneu totalement détruit' },
      { id: 'tire_slow_leak', label: 'Fuite lente', detail: 'Pneu se dégonfle progressivement' },
      { id: 'tire_rim', label: 'Jante endommagée', detail: 'Jante tordue après un choc' },
    ],
  },
  {
    id: 'engine',
    emoji: '⚙️',
    label: 'Panne moteur',
    description: 'Moteur ne tourne pas, fumée, bruit',
    subcauses: [
      { id: 'engine_wont_start', label: 'Moteur ne démarre pas', detail: 'Le démarreur tourne mais rien' },
      { id: 'engine_overheating', label: 'Surchauffe moteur', detail: 'Voyant température allumé, fumée' },
      { id: 'engine_noise', label: 'Bruit anormal', detail: 'Claquement, sifflement, cognement' },
      { id: 'engine_stall', label: 'Moteur cale en route', detail: 'Coupure soudaine en conduisant' },
      { id: 'engine_smoke', label: 'Fumée sous capot', detail: 'Fumée blanche, noire ou bleue' },
    ],
  },
  {
    id: 'fuel',
    emoji: '⛽',
    label: 'Carburant',
    description: 'Réservoir vide ou mauvais carburant',
    subcauses: [
      { id: 'fuel_empty', label: 'Réservoir vide', detail: 'Manque de carburant' },
      { id: 'fuel_wrong', label: 'Mauvais carburant mis', detail: 'Essence à la place du diesel ou inversement' },
      { id: 'fuel_leak', label: 'Fuite de carburant', detail: 'Odeur forte, traces au sol' },
    ],
  },
  {
    id: 'key',
    emoji: '🔑',
    label: 'Clé / Verrouillage',
    description: 'Clé perdue, bloquée ou problème de serrure',
    subcauses: [
      { id: 'key_locked_in', label: 'Clé enfermée dans la voiture', detail: 'Clé visible à l\'intérieur, portes verrouillées' },
      { id: 'key_lost', label: 'Clé perdue', detail: 'Impossible de retrouver la clé' },
      { id: 'key_broken', label: 'Clé cassée', detail: 'Clé brisée dans la serrure ou le contact' },
      { id: 'key_fob', label: 'Télécommande défaillante', detail: 'Télécommande ne répond plus' },
    ],
  },
  {
    id: 'accident',
    emoji: '🚗',
    label: 'Accident / Choc',
    description: 'Dommages carrosserie, voiture non déplaçable',
    subcauses: [
      { id: 'accident_minor', label: 'Accrochage mineur', detail: 'Légères rayures, voiture roulable' },
      { id: 'accident_major', label: 'Accident important', detail: 'Dommages sérieux, voiture immobilisée' },
      { id: 'accident_towing', label: 'Remorquage nécessaire', detail: 'Voiture non déplaçable par ses propres moyens' },
    ],
  },
  {
    id: 'electrical',
    emoji: '⚡',
    label: 'Problème électrique',
    description: 'Voyants allumés, électronique, fusibles',
    subcauses: [
      { id: 'elec_lights', label: 'Problème de phares / feux', detail: 'Feux ne s\'allument pas' },
      { id: 'elec_fuse', label: 'Fusible grillé', detail: 'Perte d\'un équipement électrique' },
      { id: 'elec_warning', label: 'Voyant moteur allumé', detail: 'Voyant check engine ou autre' },
      { id: 'elec_starter', label: 'Démarreur défectueux', detail: 'Clic au démarrage sans démarrage' },
    ],
  },
  {
    id: 'other',
    emoji: '❓',
    label: 'Autre',
    description: 'Panne non listée ci-dessus',
    subcauses: [
      { id: 'other_towing', label: 'Remorquage simple', detail: 'Besoin de remorquage sans diagnostic' },
      { id: 'other_unknown', label: 'Problème non identifié', detail: 'Je ne sais pas quelle est la panne' },
    ],
  },
];

export default function SOSPreDiagnosticScreen({ navigation }) {
  const [expanded, setExpanded] = useState(null);
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const handleExpand = (id) => {
    setExpanded(prev => prev === id ? null : id);
    setSelectedMain(id);
    setSelectedSub(null);
  };

  const handleSelectSub = (mainId, subId) => {
    setSelectedSub(subId);
    setSelectedMain(mainId);
  };

  const handleConfirm = () => {
    if (!selectedMain) return;
    navigation.navigate('SOSRequest', {
      breakdownType: selectedMain,
      subcause: selectedSub,
    });
  };

  const mainType = BREAKDOWN_TREE.find(t => t.id === selectedMain);
  const subType = mainType?.subcauses.find(s => s.id === selectedSub);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛻 Pré-diagnostic</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>Identifiez votre panne</Text>
          <Text style={styles.introText}>
            Sélectionnez la cause principale puis la sous-cause pour aider le dépanneur à préparer l'intervention.
          </Text>
        </View>

        {BREAKDOWN_TREE.map(type => {
          const isOpen = expanded === type.id;
          const isSelected = selectedMain === type.id;
          return (
            <View key={type.id}>
              {/* Main cause card */}
              <TouchableOpacity
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                onPress={() => handleExpand(type.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.typeEmoji}>{type.emoji}</Text>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>
                <Text style={[styles.typeArrow, isOpen && { color: COLORS.accent, transform: [{ rotate: '90deg' }] }]}>
                  ›
                </Text>
              </TouchableOpacity>

              {/* Subcauses dropdown */}
              {isOpen && (
                <View style={styles.subList}>
                  {type.subcauses.map(sub => {
                    const isSub = selectedSub === sub.id && selectedMain === type.id;
                    return (
                      <TouchableOpacity
                        key={sub.id}
                        style={[styles.subCard, isSub && styles.subCardSelected]}
                        onPress={() => handleSelectSub(type.id, sub.id)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.subDot, isSub && { backgroundColor: COLORS.accent }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.subLabel, isSub && { color: COLORS.accent }]}>{sub.label}</Text>
                          <Text style={styles.subDetail}>{sub.detail}</Text>
                        </View>
                        {isSub && <Text style={{ color: COLORS.accent, fontSize: 18 }}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* Summary + confirm */}
        {selectedMain && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋 Récapitulatif</Text>
            <Text style={styles.summaryLine}>
              <Text style={styles.summaryKey}>Cause : </Text>
              <Text style={styles.summaryVal}>{mainType?.emoji} {mainType?.label}</Text>
            </Text>
            {selectedSub && (
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryKey}>Détail : </Text>
                <Text style={styles.summaryVal}>{subType?.label}</Text>
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmBtn, !selectedMain && { opacity: 0.4 }]}
          onPress={handleConfirm}
          disabled={!selectedMain}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>
            {selectedSub ? 'Trouver un dépanneur →' : selectedMain ? 'Continuer sans sous-cause →' : 'Sélectionnez une panne'}
          </Text>
        </TouchableOpacity>

        <View style={styles.emergencyBox}>
          <Text style={styles.emergencyText}>⚠️ Danger immédiat ? Appelez le 197</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  introBox: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  introTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  introText: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 2, borderWidth: 1, borderColor: COLORS.border,
  },
  typeCardSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  typeEmoji: { fontSize: 32, marginRight: 12 },
  typeInfo: { flex: 1 },
  typeLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  typeDescription: { color: COLORS.muted, fontSize: 12 },
  typeArrow: { color: COLORS.muted, fontSize: 24, marginLeft: 8 },
  subList: {
    backgroundColor: COLORS.bg, borderRadius: 12, marginBottom: 8,
    marginLeft: 16, borderWidth: 1, borderColor: COLORS.accent + '30',
    overflow: 'hidden',
  },
  subCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  subCardSelected: { backgroundColor: COLORS.accent + '10' },
  subDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.border, borderWidth: 1, borderColor: COLORS.muted,
  },
  subLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  subDetail: { color: COLORS.muted, fontSize: 11 },
  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginTop: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  summaryTitle: { color: COLORS.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  summaryLine: { marginBottom: 4 },
  summaryKey: { color: COLORS.muted, fontSize: 13 },
  summaryVal: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  confirmBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginBottom: 16,
  },
  confirmBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  emergencyBox: {
    backgroundColor: '#2A1010', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#5A1010', alignItems: 'center',
  },
  emergencyText: { color: '#FF6B6B', fontSize: 13, fontWeight: '700' },
});
