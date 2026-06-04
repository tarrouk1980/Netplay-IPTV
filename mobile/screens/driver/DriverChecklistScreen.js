import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const CHECKLIST_SECTIONS = [
  {
    id: 'vehicle', title: '🚗 Véhicule', items: [
      { id: 'v1', label: 'Nettoyage intérieur et extérieur' },
      { id: 'v2', label: 'Niveau carburant suffisant (> 25%)' },
      { id: 'v3', label: 'Pneus gonflés et en bon état' },
      { id: 'v4', label: 'Rétroviseurs bien réglés' },
      { id: 'v5', label: 'Feux de position et clignotants OK' },
    ],
  },
  {
    id: 'docs', title: '📄 Documents', items: [
      { id: 'd1', label: 'Carte grise présente' },
      { id: 'd2', label: 'Permis de conduire valide' },
      { id: 'd3', label: 'Assurance à jour' },
      { id: 'd4', label: 'Vignette technique valide' },
    ],
  },
  {
    id: 'safety', title: '🦺 Sécurité', items: [
      { id: 's1', label: 'Trousse de premiers secours présente' },
      { id: 's2', label: 'Triangle de sécurité dans le coffre' },
      { id: 's3', label: 'Extincteur vérifié' },
      { id: 's4', label: 'Gilet jaune accessible' },
    ],
  },
  {
    id: 'comfort', title: '🎵 Confort client', items: [
      { id: 'c1', label: 'Climatisation/chauffage fonctionnel' },
      { id: 'c2', label: 'Chargeur téléphone disponible' },
      { id: 'c3', label: 'Eau/mouchoirs en option' },
      { id: 'c4', label: 'Masque et gel hydroalcoolique' },
    ],
  },
];

export default function DriverChecklistScreen({ navigation }) {
  const [checked, setChecked] = useState({});

  const toggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalItems = CHECKLIST_SECTIONS.reduce((s, sec) => s + sec.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((checkedCount / totalItems) * 100);

  const allDone = checkedCount === totalItems;

  const handleGoOnline = () => {
    if (!allDone) {
      Alert.alert(
        'Checklist incomplète',
        `${totalItems - checkedCount} point(s) non cochés. Continuer quand même ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Continuer', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checklist départ</Text>
        <Text style={styles.headerCount}>{checkedCount}/{totalItems}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: allDone ? COLORS.green : COLORS.accent }]} />
        </View>
        <Text style={[styles.progressPct, { color: allDone ? COLORS.green : COLORS.accent }]}>{pct}%</Text>
      </View>

      {allDone && (
        <View style={styles.allDoneBanner}>
          <Text style={styles.allDoneText}>✅ Tout est bon ! Vous pouvez démarrer.</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {CHECKLIST_SECTIONS.map((sec) => {
          const secChecked = sec.items.filter(i => checked[i.id]).length;
          return (
            <View key={sec.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{sec.title}</Text>
                <Text style={styles.sectionCount}>{secChecked}/{sec.items.length}</Text>
              </View>
              {sec.items.map((item) => {
                const isChecked = !!checked[item.id];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemRow, isChecked && styles.itemRowChecked]}
                    onPress={() => toggle(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Text style={{ color: '#000', fontSize: 12, fontWeight: '900' }}>✓</Text>}
                    </View>
                    <Text style={[styles.itemLabel, isChecked && styles.itemLabelChecked]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.goBtn, allDone && { backgroundColor: COLORS.green }]}
          onPress={handleGoOnline}
        >
          <Text style={styles.goBtnText}>
            {allDone ? '✅ Checklist validée — Passer en ligne' : `Continuer (${checkedCount}/${totalItems})`}
          </Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  headerCount: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  progressWrap: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12,
  },
  progressBar: { flex: 1, height: 8, backgroundColor: COLORS.surface, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 13, fontWeight: '800', width: 38, textAlign: 'right' },
  allDoneBanner: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#0D2E0D',
    borderRadius: 10, padding: 10, borderWidth: 1, borderColor: COLORS.green,
  },
  allDoneText: { color: COLORS.green, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  sectionCount: { color: COLORS.muted, fontSize: 12 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 14, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  itemRowChecked: { borderColor: COLORS.green + '55', backgroundColor: '#0D2E0D' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  itemLabel: { color: COLORS.white, fontSize: 13, flex: 1 },
  itemLabelChecked: { color: COLORS.muted, textDecorationLine: 'line-through' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  goBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  goBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
