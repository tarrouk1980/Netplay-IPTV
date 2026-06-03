import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', orange: '#E67E22',
};

const CHECKLIST_GROUPS = [
  {
    title: '🚗 Véhicule',
    items: [
      { id: 'veh1', label: 'Pneus en bon état (pression vérifiée)' },
      { id: 'veh2', label: 'Niveaux huile & liquide de refroidissement OK' },
      { id: 'veh3', label: 'Phares, feux et clignotants fonctionnels' },
      { id: 'veh4', label: 'Carburant suffisant (> 1/4 du réservoir)' },
      { id: 'veh5', label: 'Habitacle propre et désodorisé' },
    ],
  },
  {
    title: '📋 Documents',
    items: [
      { id: 'doc1', label: 'Permis de conduire valide' },
      { id: 'doc2', label: 'Carte grise du véhicule' },
      { id: 'doc3', label: 'Assurance en cours de validité' },
      { id: 'doc4', label: 'Vignette technique à jour' },
    ],
  },
  {
    title: '📱 Application',
    items: [
      { id: 'app1', label: 'GPS et localisation activés' },
      { id: 'app2', label: 'Connexion internet stable' },
      { id: 'app3', label: 'Batterie téléphone > 30%' },
      { id: 'app4', label: 'Notifications autorisées' },
    ],
  },
  {
    title: '🎒 Équipement',
    items: [
      { id: 'eq1', label: 'Chargeur téléphone passager disponible' },
      { id: 'eq2', label: 'Masque et gel hydroalcoolique (optionnel)' },
      { id: 'eq3', label: 'Monnaie disponible pour paiement espèces' },
    ],
  },
];

const ALL_IDS = CHECKLIST_GROUPS.flatMap((g) => g.items.map((i) => i.id));

export default function DriverChecklistScreen({ navigation }) {
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const doneCount = ALL_IDS.filter((id) => checked[id]).length;
  const allDone = doneCount === ALL_IDS.length;

  const handleStart = () => {
    if (!allDone) {
      Alert.alert(
        'Checklist incomplète',
        `Il reste ${ALL_IDS.length - doneCount} point(s) à valider. Voulez-vous continuer quand même ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Continuer', onPress: () => navigation.navigate('DriverStatus') },
        ]
      );
    } else {
      navigation.navigate('DriverStatus');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>✅ Checklist Départ</Text>
        <Text style={styles.progress}>{doneCount}/{ALL_IDS.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {
          width: `${(doneCount / ALL_IDS.length) * 100}%`,
          backgroundColor: allDone ? COLORS.green : COLORS.accent,
        }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {CHECKLIST_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item) => {
              const done = !!checked[item.id];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.item, done && styles.itemDone]}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, done && styles.checkboxDone]}>
                    {done && <Text style={{ color: '#000', fontSize: 12, fontWeight: '900' }}>✓</Text>}
                  </View>
                  <Text style={[styles.itemLabel, done && styles.itemLabelDone]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.startBtn, allDone && styles.startBtnGreen]}
          onPress={handleStart}
        >
          <Text style={styles.startBtnText}>
            {allDone ? '🚀 Démarrer la session' : `⚡ Démarrer quand même (${ALL_IDS.length - doneCount} restants)`}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  progress: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  progressBar: { height: 4, backgroundColor: COLORS.border },
  progressFill: { height: 4, borderRadius: 2 },
  scroll: { padding: 16 },
  group: { marginBottom: 20 },
  groupTitle: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  itemDone: { borderColor: COLORS.green, backgroundColor: '#0A1A0A' },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  itemLabel: { flex: 1, color: COLORS.white, fontSize: 14 },
  itemLabelDone: { color: COLORS.muted, textDecorationLine: 'line-through' },
  startBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  startBtnGreen: { backgroundColor: COLORS.green },
  startBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
