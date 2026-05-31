import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  amber: '#F57C00',
  error: '#E74C3C',
};

const CHECKLIST_GROUPS = [
  {
    title: '🔒 Sécurité',
    items: [
      { key: 'brakes', label: 'Freins fonctionnels' },
      { key: 'tires', label: 'Pneus en bon état (sans usure excessive)' },
      { key: 'seatbelts', label: 'Ceintures de sécurité OK' },
      { key: 'mirrors', label: 'Rétroviseurs bien positionnés' },
      { key: 'lights', label: 'Phares et feux de signalisation fonctionnels' },
    ],
  },
  {
    title: '🚗 État du véhicule',
    items: [
      { key: 'fuel', label: 'Carburant suffisant (> 1/4 du réservoir)' },
      { key: 'oil', label: 'Niveau d\'huile vérifié' },
      { key: 'cleanliness', label: 'Véhicule propre (intérieur et extérieur)' },
      { key: 'ac', label: 'Climatisation/chauffage fonctionnel' },
      { key: 'damage', label: 'Aucun dommage récent non signalé' },
    ],
  },
  {
    title: '📋 Documents & équipements',
    items: [
      { key: 'license', label: 'Permis de conduire valide et disponible' },
      { key: 'insurance', label: 'Assurance véhicule à jour' },
      { key: 'registration', label: 'Carte grise présente' },
      { key: 'firstaid', label: 'Trousse de premiers secours' },
      { key: 'phone_mount', label: 'Support téléphone installé' },
    ],
  },
];

// For DEPANNEUR role only
const DEPANNEUR_ITEMS = [
  { key: 'tow_cable', label: '🔗 Câble de remorquage vérifié' },
  { key: 'jack', label: '🔧 Cric et clé de roue présents' },
  { key: 'jumper', label: '⚡ Câbles de démarrage présents' },
  { key: 'tow_chain', label: '⛓ Chaîne d\'attelage en bon état' },
];

export default function VehicleChecklistScreen({ navigation, route }) {
  const { role } = route?.params || {};
  const isDepanneur = role === 'DEPANNEUR';

  // Build initial state: all unchecked
  const allItems = [
    ...CHECKLIST_GROUPS.flatMap(g => g.items),
    ...(isDepanneur ? DEPANNEUR_ITEMS : []),
  ];
  const initialState = Object.fromEntries(allItems.map(i => [i.key, false]));
  const [checked, setChecked] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const totalItems = allItems.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === totalItems;
  const percent = Math.round((checkedCount / totalItems) * 100);

  const handleSubmit = async () => {
    if (!allChecked) {
      Alert.alert(
        'Checklist incomplète',
        `Vous avez validé ${checkedCount}/${totalItems} points. Certains éléments obligatoires ne sont pas cochés. Voulez-vous continuer quand même ?`,
        [
          { text: 'Vérifier', style: 'cancel' },
          { text: 'Continuer', onPress: () => doSubmit() },
        ]
      );
      return;
    }
    doSubmit();
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/provider/vehicle-checklist', {
        checkedItems: Object.keys(checked).filter(k => checked[k]),
        totalItems,
        completedAt: new Date().toISOString(),
      }).catch(() => {});
      Alert.alert(
        'Checklist validée ✅',
        'Votre véhicule est prêt. Bonne journée !',
        [{ text: 'Commencer', onPress: () => navigation.goBack() }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckAll = () => {
    const newState = Object.fromEntries(allItems.map(i => [i.key, true]));
    setChecked(newState);
  };

  const progressColor = percent === 100 ? COLORS.green : percent >= 70 ? COLORS.amber : COLORS.error;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checklist véhicule</Text>
        <TouchableOpacity style={styles.allBtn} onPress={handleCheckAll}>
          <Text style={styles.allBtnText}>Tout ✓</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressBox}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{checkedCount}/{totalItems} points validés</Text>
          <Text style={[styles.progressPct, { color: progressColor }]}>{percent}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: progressColor }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {CHECKLIST_GROUPS.map(group => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map(item => (
              <TouchableOpacity
                key={item.key}
                style={[styles.checkRow, checked[item.key] && styles.checkRowDone]}
                onPress={() => toggle(item.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, checked[item.key] && styles.checkboxDone]}>
                  {checked[item.key] && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkLabel, checked[item.key] && styles.checkLabelDone]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {isDepanneur && (
          <View style={styles.group}>
            <Text style={styles.groupTitle}>🛻 Équipement dépannage</Text>
            {DEPANNEUR_ITEMS.map(item => (
              <TouchableOpacity
                key={item.key}
                style={[styles.checkRow, checked[item.key] && styles.checkRowDone]}
                onPress={() => toggle(item.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, checked[item.key] && styles.checkboxDone]}>
                  {checked[item.key] && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.checkLabel, checked[item.key] && styles.checkLabelDone]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Submit */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: allChecked ? COLORS.green : COLORS.amber },
            submitting && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {allChecked ? '✅ Valider et commencer' : `⚠️ Valider (${checkedCount}/${totalItems})`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  allBtn: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  allBtnText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  progressBox: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: COLORS.muted, fontSize: 13 },
  progressPct: { fontSize: 13, fontWeight: '800' },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  scroll: { padding: 16 },
  group: { marginBottom: 24 },
  groupTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  checkRowDone: { borderColor: COLORS.green + '60', backgroundColor: '#0D2A1A' },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  checkmark: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  checkLabel: { color: COLORS.muted, fontSize: 13, flex: 1 },
  checkLabelDone: { color: COLORS.text },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
