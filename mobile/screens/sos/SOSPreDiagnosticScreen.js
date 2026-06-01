import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useLocationStore from '../../store/locationStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  red: '#E74C3C',
  orange: '#F5A623',
  green: '#27AE60',
};

const VEHICLE_TYPES = [
  { key: 'CAR',      icon: '🚗', label: 'Voiture' },
  { key: 'SUV',      icon: '🚙', label: 'SUV / 4×4' },
  { key: 'MOTO',     icon: '🏍️', label: 'Moto' },
  { key: 'TRUCK',    icon: '🚚', label: 'Camion' },
  { key: 'VAN',      icon: '🚐', label: 'Utilitaire' },
  { key: 'OTHER',    icon: '🚘', label: 'Autre' },
];

const BREAKDOWN_TYPES = [
  { key: 'FLAT_TIRE',  icon: '🛞', label: 'Crevaison',          urgent: false },
  { key: 'BATTERY',    icon: '🔋', label: 'Batterie déchargée', urgent: false },
  { key: 'ENGINE',     icon: '🔥', label: 'Panne moteur',       urgent: true  },
  { key: 'ACCIDENT',   icon: '💥', label: 'Accident',           urgent: true  },
  { key: 'KEY_LOCK',   icon: '🔑', label: 'Clés bloquées',      urgent: false },
  { key: 'FUEL',       icon: '⛽', label: 'Panne de carburant', urgent: false },
  { key: 'TOWING',     icon: '⛓️', label: 'Besoin de remorquage', urgent: false },
  { key: 'OVERHEATING',icon: '🌡️', label: 'Surchauffe',         urgent: true  },
  { key: 'OTHER',      icon: '🔧', label: 'Autre panne',        urgent: false },
];

const LOCATION_TYPES = [
  { key: 'ROAD',     icon: '🛣️', label: 'Sur la route' },
  { key: 'HIGHWAY',  icon: '🛤️', label: 'Autoroute' },
  { key: 'PARKING',  icon: '🅿️', label: 'Parking' },
  { key: 'HOME',     icon: '🏠', label: 'À domicile' },
  { key: 'TUNNEL',   icon: '🚇', label: 'Tunnel / Souterrain' },
];

const URGENCY_LEVELS = [
  { key: 'LOW',    label: 'Pas urgent',    color: COLORS.green,  icon: '🟢', desc: 'Interventions en moins d\'1h' },
  { key: 'MEDIUM', label: 'Urgent',        color: COLORS.orange, icon: '🟡', desc: 'Interventions en 30 min' },
  { key: 'HIGH',   label: 'Très urgent',   color: COLORS.red,    icon: '🔴', desc: 'Interventions en 15 min' },
];

const PRICE_ESTIMATES = {
  FLAT_TIRE:   { min: 25, max: 45 },
  BATTERY:     { min: 20, max: 35 },
  ENGINE:      { min: 50, max: 120 },
  ACCIDENT:    { min: 60, max: 150 },
  KEY_LOCK:    { min: 30, max: 60 },
  FUEL:        { min: 15, max: 25 },
  TOWING:      { min: 40, max: 80 },
  OVERHEATING: { min: 35, max: 70 },
  OTHER:       { min: 30, max: 80 },
};

function Step({ num, label, active, done }) {
  return (
    <View style={st.item}>
      <View style={[st.circle, done && st.done, active && st.active]}>
        <Text style={[st.num, (active || done) && { color: active ? COLORS.orange : COLORS.green }]}>
          {done ? '✓' : num}
        </Text>
      </View>
      <Text style={[st.label, active && { color: COLORS.orange }]}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  item: { alignItems: 'center', flex: 1 },
  circle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  done: { borderColor: COLORS.green, backgroundColor: COLORS.green + '22' },
  active: { borderColor: COLORS.orange },
  num: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  label: { color: COLORS.muted, fontSize: 9, fontWeight: '600', textAlign: 'center' },
});

export default function SOSPreDiagnosticScreen({ navigation }) {
  const { location } = useLocationStore();
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState(null);
  const [breakdownType, setBreakdownType] = useState(null);
  const [locationType, setLocationType] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const [description, setDescription] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  const breakdownCfg = breakdownType ? BREAKDOWN_TYPES.find(b => b.key === breakdownType) : null;
  const priceEst = breakdownType ? PRICE_ESTIMATES[breakdownType] : null;
  const autoUrgency = breakdownCfg?.urgent ? 'HIGH' : 'MEDIUM';

  const handleConfirm = useCallback(() => {
    navigation.navigate('SOSRequest', {
      vehicleType,
      breakdownType,
      locationType,
      urgency: urgency || autoUrgency,
      description,
      plateNumber,
      priceMin: priceEst?.min,
      priceMax: priceEst?.max,
      originLat: location?.latitude,
      originLng: location?.longitude,
    });
  }, [vehicleType, breakdownType, locationType, urgency, autoUrgency, description, plateNumber, priceEst, location, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛻 Pré-diagnostic SOS</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Steps */}
      <View style={styles.stepsRow}>
        {['Véhicule', 'Panne', 'Lieu', 'Confirmer'].map((l, i) => (
          <React.Fragment key={i}>
            <Step num={i + 1} label={l} active={step === i + 1} done={step > i + 1} />
            {i < 3 && <View style={[styles.stepLine, step > i + 1 && styles.stepLineDone]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Step 1: Vehicle type */}
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>Type de véhicule</Text>
            <View style={styles.grid}>
              {VEHICLE_TYPES.map(v => (
                <TouchableOpacity
                  key={v.key}
                  style={[styles.optCard, vehicleType === v.key && styles.optCardActive]}
                  onPress={() => setVehicleType(v.key)}
                >
                  <Text style={styles.optIcon}>{v.icon}</Text>
                  <Text style={[styles.optLabel, vehicleType === v.key && { color: COLORS.orange }]}>{v.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Immatriculation (optionnel)</Text>
            <TextInput
              style={styles.textInput}
              value={plateNumber}
              onChangeText={setPlateNumber}
              placeholder="Ex: 123 TUN 4567"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.nextBtn, !vehicleType && styles.nextBtnDisabled]}
              disabled={!vehicleType}
              onPress={() => setStep(2)}
            >
              <Text style={styles.nextBtnText}>Suivant →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 2: Breakdown type */}
        {step === 2 && (
          <>
            <Text style={styles.sectionTitle}>Type de panne</Text>
            {BREAKDOWN_TYPES.map(b => (
              <TouchableOpacity
                key={b.key}
                style={[styles.breakdownRow, breakdownType === b.key && styles.breakdownRowActive, b.urgent && { borderLeftColor: COLORS.red, borderLeftWidth: 3 }]}
                onPress={() => setBreakdownType(b.key)}
              >
                <Text style={styles.breakdownIcon}>{b.icon}</Text>
                <View style={styles.breakdownInfo}>
                  <Text style={[styles.breakdownLabel, breakdownType === b.key && { color: COLORS.orange }]}>{b.label}</Text>
                  {b.urgent && <Text style={styles.urgentTag}>⚠️ Urgent</Text>}
                </View>
                {PRICE_ESTIMATES[b.key] && (
                  <Text style={styles.priceHint}>{PRICE_ESTIMATES[b.key].min}–{PRICE_ESTIMATES[b.key].max} TND</Text>
                )}
                {breakdownType === b.key && <Text style={{ color: COLORS.orange, fontWeight: '700' }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <Text style={styles.inputLabel}>Description (optionnel)</Text>
            <TextInput
              style={[styles.textInput, { height: 70 }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez le problème en quelques mots..."
              placeholderTextColor={COLORS.muted}
              multiline
            />
            <TouchableOpacity
              style={[styles.nextBtn, !breakdownType && styles.nextBtnDisabled]}
              disabled={!breakdownType}
              onPress={() => setStep(3)}
            >
              <Text style={styles.nextBtnText}>Suivant →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 3: Location type + urgency */}
        {step === 3 && (
          <>
            <Text style={styles.sectionTitle}>Type d'emplacement</Text>
            <View style={styles.grid}>
              {LOCATION_TYPES.map(l => (
                <TouchableOpacity
                  key={l.key}
                  style={[styles.optCard, locationType === l.key && styles.optCardActive]}
                  onPress={() => setLocationType(l.key)}
                >
                  <Text style={styles.optIcon}>{l.icon}</Text>
                  <Text style={[styles.optLabel, locationType === l.key && { color: COLORS.orange }]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Niveau d'urgence</Text>
            {URGENCY_LEVELS.map(u => (
              <TouchableOpacity
                key={u.key}
                style={[styles.urgencyRow, urgency === u.key && { borderColor: u.color, backgroundColor: u.color + '10' }]}
                onPress={() => setUrgency(u.key)}
              >
                <Text style={{ fontSize: 20 }}>{u.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.urgencyLabel, urgency === u.key && { color: u.color }]}>{u.label}</Text>
                  <Text style={styles.urgencyDesc}>{u.desc}</Text>
                </View>
                {(urgency || autoUrgency) === u.key && !urgency && (
                  <Text style={[styles.autoTag, { color: u.color }]}>Auto</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.nextBtn, !locationType && styles.nextBtnDisabled]}
              disabled={!locationType}
              onPress={() => setStep(4)}
            >
              <Text style={styles.nextBtnText}>Suivant →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 4: Summary + confirm */}
        {step === 4 && (() => {
          const vCfg = VEHICLE_TYPES.find(v => v.key === vehicleType);
          const bCfg = BREAKDOWN_TYPES.find(b => b.key === breakdownType);
          const lCfg = LOCATION_TYPES.find(l => l.key === locationType);
          const uKey = urgency || autoUrgency;
          const uCfg = URGENCY_LEVELS.find(u => u.key === uKey);
          return (
            <>
              <Text style={styles.sectionTitle}>Récapitulatif</Text>
              <View style={styles.summaryCard}>
                {[
                  ['Véhicule', `${vCfg?.icon} ${vCfg?.label}${plateNumber ? ` · ${plateNumber}` : ''}`],
                  ['Panne', `${bCfg?.icon} ${bCfg?.label}`],
                  ['Emplacement', `${lCfg?.icon} ${lCfg?.label}`],
                  ['Urgence', `${uCfg?.icon} ${uCfg?.label}`],
                  ...(description ? [['Note', description]] : []),
                ].map(([k, v], i) => (
                  <View key={i} style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>{k}</Text>
                    <Text style={styles.summaryVal}>{v}</Text>
                  </View>
                ))}
              </View>
              {priceEst && (
                <View style={styles.estimateBox}>
                  <Text style={styles.estimateTitle}>💰 Estimation du coût</Text>
                  <Text style={styles.estimateRange}>{priceEst.min} – {priceEst.max} TND</Text>
                  <Text style={styles.estimateNote}>Devis définitif fourni par le dépanneur avant intervention</Text>
                </View>
              )}
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: uCfg?.color || COLORS.red }]} onPress={handleConfirm} activeOpacity={0.85}>
                <Text style={styles.confirmBtnText}>🛻 Appeler un dépanneur</Text>
              </TouchableOpacity>
            </>
          );
        })()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  stepsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepLine: { flex: 1, height: 1.5, backgroundColor: COLORS.border, marginBottom: 14 },
  stepLineDone: { backgroundColor: COLORS.green },
  scroll: { padding: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  optCard: { width: '30%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  optCardActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '10' },
  optIcon: { fontSize: 24, marginBottom: 6 },
  optLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  inputLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  textInput: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, fontSize: 14, padding: 12, marginBottom: 12 },
  nextBtn: { backgroundColor: COLORS.orange, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, marginBottom: 8 },
  breakdownRowActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '08' },
  breakdownIcon: { fontSize: 22 },
  breakdownInfo: { flex: 1 },
  breakdownLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  urgentTag: { color: COLORS.red, fontSize: 11, marginTop: 2 },
  priceHint: { color: COLORS.muted, fontSize: 11 },
  urgencyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 8 },
  urgencyLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  urgencyDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  autoTag: { fontSize: 11, fontWeight: '700' },
  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryKey: { color: COLORS.muted, fontSize: 13 },
  summaryVal: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  estimateBox: { backgroundColor: '#1A0A0A', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.red, marginBottom: 16, alignItems: 'center' },
  estimateTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  estimateRange: { color: COLORS.red, fontSize: 26, fontWeight: '900' },
  estimateNote: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginTop: 6 },
  confirmBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
