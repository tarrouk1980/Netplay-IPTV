import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const VEHICLE_TYPES = [
  { id: 'berline', icon: '🚗', label: 'Berline' },
  { id: 'suv', icon: '🚙', label: 'SUV' },
  { id: 'minivan', icon: '🚐', label: 'Minivan' },
  { id: 'scooter', icon: '🛵', label: 'Scooter' },
  { id: 'moto', icon: '🏍️', label: 'Moto' },
  { id: 'camion', icon: '🚛', label: 'Camion' },
];

const FUEL_TYPES = ['Essence', 'Diesel', 'GPL', 'Électrique', 'Hybride'];
const YEARS = Array.from({ length: 20 }, (_, i) => String(2025 - i));
const COLORS_LIST = ['Blanc', 'Noir', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Argent', 'Beige'];

export default function VehicleRegistrationScreen({ navigation }) {
  const [vehicleType, setVehicleType] = useState(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [fuel, setFuel] = useState('');
  const [seats, setSeats] = useState('4');
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!vehicleType) return 'Sélectionnez un type de véhicule';
    if (!brand.trim()) return 'Entrez la marque';
    if (!model.trim()) return 'Entrez le modèle';
    if (!year) return 'Sélectionnez l\'année';
    if (!plate.trim()) return 'Entrez la plaque d\'immatriculation';
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { Alert.alert('Champ requis', err); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.successBox}>
          <Text style={{ fontSize: 72, marginBottom: 20 }}>🚗</Text>
          <Text style={styles.successTitle}>Véhicule enregistré !</Text>
          <Text style={styles.successSub}>
            Votre véhicule est en cours de vérification. Vous recevrez une confirmation sous 24h.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Retour au profil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon véhicule</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

        {/* Vehicle type */}
        <Text style={styles.fieldLabel}>Type de véhicule *</Text>
        <View style={styles.typeGrid}>
          {VEHICLE_TYPES.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeCard, vehicleType === t.id && styles.typeCardActive]}
              onPress={() => setVehicleType(t.id)}
            >
              <Text style={{ fontSize: 28 }}>{t.icon}</Text>
              <Text style={[styles.typeLabel, vehicleType === t.id && { color: COLORS.accent }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Brand & Model */}
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Marque *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex : Renault"
              placeholderTextColor={COLORS.muted}
              value={brand}
              onChangeText={setBrand}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Modèle *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex : Clio 5"
              placeholderTextColor={COLORS.muted}
              value={model}
              onChangeText={setModel}
            />
          </View>
        </View>

        {/* Plate */}
        <Text style={styles.fieldLabel}>Plaque d'immatriculation *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex : TUN-2234"
          placeholderTextColor={COLORS.muted}
          value={plate}
          onChangeText={setPlate}
          autoCapitalize="characters"
        />

        {/* Year */}
        <Text style={styles.fieldLabel}>Année</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
          {YEARS.slice(0, 12).map(y => (
            <TouchableOpacity
              key={y}
              style={[styles.yearChip, year === y && styles.yearChipActive]}
              onPress={() => setYear(y)}
            >
              <Text style={[styles.yearText, year === y && { color: '#000' }]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Color */}
        <Text style={styles.fieldLabel}>Couleur</Text>
        <View style={styles.colorRow}>
          {COLORS_LIST.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorChip, color === c && styles.colorChipActive]}
              onPress={() => setColor(c)}
            >
              <Text style={[styles.colorText, color === c && { color: '#000' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fuel */}
        <Text style={styles.fieldLabel}>Carburant</Text>
        <View style={styles.fuelRow}>
          {FUEL_TYPES.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.fuelChip, fuel === f && styles.fuelChipActive]}
              onPress={() => setFuel(f)}
            >
              <Text style={[styles.fuelText, fuel === f && { color: '#000' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seats */}
        <Text style={styles.fieldLabel}>Nombre de places</Text>
        <View style={styles.seatsRow}>
          {['2', '4', '5', '7', '8', '9+'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.seatChip, seats === s && styles.seatChipActive]}
              onPress={() => setSeats(s)}
            >
              <Text style={[styles.seatText, seats === s && { color: '#000' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Docs note */}
        <View style={styles.docsNote}>
          <Text style={styles.docsTitle}>📄 Documents requis</Text>
          <Text style={styles.docsText}>Après validation, vous devrez uploader :</Text>
          {['Carte grise', 'Assurance en cours de validité', 'Vignette technique'].map(d => (
            <Text key={d} style={styles.docsItem}>· {d}</Text>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>✅ Enregistrer le véhicule</Text>
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
  fieldLabel: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeCard: { width: '30%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  typeCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '11' },
  typeLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  row2: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 12, color: COLORS.white, fontSize: 14, marginBottom: 16,
  },
  yearChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  yearChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  yearText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  colorChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  colorChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  colorText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  fuelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  fuelChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  fuelChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  fuelText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  seatsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  seatChip: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  seatChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  seatText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  docsNote: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  docsTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  docsText: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  docsItem: { color: COLORS.muted, fontSize: 12, marginBottom: 3 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successTitle: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginBottom: 12 },
  successSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 32 },
  doneBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14 },
  doneBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
