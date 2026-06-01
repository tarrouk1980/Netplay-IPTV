import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
};

const VEHICLE_TYPES = [
  { key: 'SEDAN', label: 'Berline', icon: '🚗' },
  { key: 'SUV', label: 'SUV', icon: '🚙' },
  { key: 'VAN', label: 'Fourgonnette', icon: '🚐' },
  { key: 'MOTO', label: 'Moto', icon: '🏍' },
  { key: 'SCOOTER', label: 'Scooter', icon: '🛵' },
  { key: 'TRUCK', label: 'Camion', icon: '🛻' },
  { key: 'PICKUP', label: 'Pick-up', icon: '🛻' },
];

const COLORS_LIST = ['Blanc', 'Noir', 'Gris', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Argent', 'Beige'];

const CURRENT_YEAR = new Date().getFullYear();

function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, maxLength }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'sentences'}
        maxLength={maxLength}
      />
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
});

export default function ProviderVehicleInfoScreen({ navigation }) {
  const [vehicleType, setVehicleType] = useState('SEDAN');
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('Blanc');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [techControlExpiry, setTechControlExpiry] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/vehicles/my').then((res) => {
      const v = res.data.vehicle;
      if (v) {
        setVehicleType(v.vehicleType || 'SEDAN');
        setModel(v.model || '');
        setBrand(v.brand || '');
        setYear(v.year?.toString() || '');
        setPlate(v.licensePlate || '');
        setColor(v.color || 'Blanc');
        setInsuranceExpiry(v.insuranceExpiry ? new Date(v.insuranceExpiry).toISOString().split('T')[0] : '');
        setTechControlExpiry(v.techControlExpiry ? new Date(v.techControlExpiry).toISOString().split('T')[0] : '');
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!plate.trim()) { Alert.alert('Erreur', 'Numéro d\'immatriculation requis.'); return; }
    if (!brand.trim() || !model.trim()) { Alert.alert('Erreur', 'Marque et modèle requis.'); return; }
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > CURRENT_YEAR + 1) {
      Alert.alert('Erreur', `Année invalide (1990–${CURRENT_YEAR + 1}).`);
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/vehicles/my', {
        vehicleType,
        brand: brand.trim(),
        model: model.trim(),
        year: yearNum,
        licensePlate: plate.trim().toUpperCase(),
        color,
        insuranceExpiry: insuranceExpiry || null,
        techControlExpiry: techControlExpiry || null,
      });
      Alert.alert('Véhicule sauvegardé ✅');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  const insuranceExpired = insuranceExpiry && new Date(insuranceExpiry) < new Date();
  const techExpired = techControlExpiry && new Date(techControlExpiry) < new Date();

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🚗 Mon véhicule</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.orange} size="small" /> : <Text style={s.saveBtn}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Vehicle type */}
        <Text style={s.sectionLabel}>Type de véhicule</Text>
        <View style={s.typeGrid}>
          {VEHICLE_TYPES.map((vt) => (
            <TouchableOpacity
              key={vt.key}
              style={[s.typeCard, vehicleType === vt.key && s.typeCardActive]}
              onPress={() => setVehicleType(vt.key)}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{vt.icon}</Text>
              <Text style={[s.typeLabel, vehicleType === vt.key && { color: COLORS.orange }]}>{vt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label="Marque" value={brand} onChangeText={setBrand} placeholder="Toyota, Hyundai..." maxLength={30} />
        <Field label="Modèle" value={model} onChangeText={setModel} placeholder="Corolla, Tucson..." maxLength={30} />
        <Field label="Année" value={year} onChangeText={setYear} placeholder={CURRENT_YEAR.toString()} keyboardType="number-pad" maxLength={4} />
        <Field label="Immatriculation" value={plate} onChangeText={setPlate} placeholder="123 TUN 0000" autoCapitalize="characters" maxLength={15} />

        {/* Color picker */}
        <Text style={s.sectionLabel}>Couleur</Text>
        <View style={s.colorRow}>
          {COLORS_LIST.map((c) => (
            <TouchableOpacity
              key={c}
              style={[s.colorChip, color === c && s.colorChipActive]}
              onPress={() => setColor(c)}
            >
              <Text style={[s.colorChipTxt, color === c && { color: COLORS.orange }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Documents */}
        <Text style={s.sectionLabel}>Documents</Text>
        <View style={s.docCard}>
          <View style={s.docRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.docLabel}>Assurance (expire le)</Text>
              {insuranceExpired && <Text style={s.expiredTag}>⚠️ Expirée</Text>}
            </View>
            <TextInput
              style={s.docInput}
              value={insuranceExpiry}
              onChangeText={setInsuranceExpiry}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={COLORS.muted}
            />
          </View>
          <View style={[s.docRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.docLabel}>Visite technique (expire le)</Text>
              {techExpired && <Text style={s.expiredTag}>⚠️ Expirée</Text>}
            </View>
            <TextInput
              style={s.docInput}
              value={techControlExpiry}
              onChangeText={setTechControlExpiry}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={COLORS.muted}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  saveBtn: { color: COLORS.orange, fontSize: 15, fontWeight: '700' },
  sectionLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeCard: { width: '30%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  typeCardActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '11' },
  typeLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  colorChip: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.border },
  colorChipActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '22' },
  colorChipTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  docCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docLabel: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
  expiredTag: { color: COLORS.accent, fontSize: 11, fontWeight: '700', marginTop: 2 },
  docInput: { backgroundColor: COLORS.surfaceAlt, borderRadius: 8, padding: 10, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, width: 120, textAlign: 'center' },
});
