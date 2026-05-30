import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#8E44AD',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3E',
  green: '#27AE60',
  red: '#E74C3C',
};

const CIRCUMSTANCES = [
  'En stationnement',
  'En marche arrière',
  'Changeait de file',
  'Tournait à droite',
  'Tournait à gauche',
  'Brûlait un feu rouge',
  'Refus de priorité',
  'Collision par l\'arrière',
  'Dépassement dangereux',
  'Sortait d\'un parking',
  'Changement de voie sans signalement',
  'Ouverture de portière',
];

const EMPTY_VEHICLE = {
  marque: '',
  modele: '',
  immatriculation: '',
  assurance: '',
  numPolice: '',
};

export default function ConstatAmiableScreen({ route, navigation }) {
  const { orderId } = route.params || {};

  const [vehicleA, setVehicleA] = useState({ ...EMPTY_VEHICLE });
  const [vehicleB, setVehicleB] = useState({ ...EMPTY_VEHICLE });
  const [selectedCircumstances, setSelectedCircumstances] = useState([]);
  const [croquis, setCroquis] = useState(null);
  const [observations, setObservations] = useState('');
  const [signedClient, setSignedClient] = useState(false);
  const [signedDepanneur, setSignedDepanneur] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleCircumstance = (item) => {
    setSelectedCircumstances((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handlePickCroquis = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setCroquis(result.assets[0].uri);
    }
  };

  const handleSign = (party) => {
    Alert.alert(
      'Signature enregistrée ✓',
      `La signature ${party === 'client' ? 'du client' : 'du dépanneur'} a été enregistrée.`,
      [{ text: 'OK' }]
    );
    if (party === 'client') setSignedClient(true);
    else setSignedDepanneur(true);
  };

  const handleSubmit = async () => {
    if (!signedClient || !signedDepanneur) {
      Alert.alert('Signatures manquantes', 'Les deux parties doivent signer le constat.');
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = orderId ? `/sos/${orderId}/constat` : '/sos/constat';
      await api.post(endpoint, {
        vehicleA,
        vehicleB,
        circumstances: selectedCircumstances,
        croquis: croquis || null,
        observations,
        signatures: { client: signedClient, depanneur: signedDepanneur },
      });
      Alert.alert(
        'Constat envoyé !',
        'Vous recevrez un email avec le PDF.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'envoyer le constat.');
    } finally {
      setSubmitting(false);
    }
  };

  const VehicleSection = ({ title, data, onChange }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {[
        { key: 'marque', label: 'Marque' },
        { key: 'modele', label: 'Modèle' },
        { key: 'immatriculation', label: 'Immatriculation' },
        { key: 'assurance', label: 'Assurance' },
        { key: 'numPolice', label: 'N° Police' },
      ].map(({ key, label }) => (
        <View key={key} style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            style={styles.fieldInput}
            value={data[key]}
            onChangeText={(val) => onChange({ ...data, [key]: val })}
            placeholder={label}
            placeholderTextColor={COLORS.muted}
          />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Constat Amiable</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Section A — Véhicule A */}
        <VehicleSection
          title="Section A — Véhicule A (Client)"
          data={vehicleA}
          onChange={setVehicleA}
        />

        {/* Section B — Véhicule B */}
        <VehicleSection
          title="Section B — Véhicule B (Dépanneur / Autre partie)"
          data={vehicleB}
          onChange={setVehicleB}
        />

        {/* Circonstances */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Circonstances de l'accident</Text>
          <Text style={styles.cardSubtitle}>Sélectionnez toutes les cases qui s'appliquent</Text>
          {CIRCUMSTANCES.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.checkRow}
              onPress={() => toggleCircumstance(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, selectedCircumstances.includes(item) && styles.checkboxChecked]}>
                {selectedCircumstances.includes(item) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Croquis */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Croquis</Text>
          <TouchableOpacity style={styles.croquisBox} onPress={handlePickCroquis} activeOpacity={0.8}>
            {croquis ? (
              <Text style={[styles.croquisText, { color: COLORS.green }]}>✅ Photo attachée</Text>
            ) : (
              <>
                <Text style={styles.croquisEmoji}>📷</Text>
                <Text style={styles.croquisText}>Croquis à remplir</Text>
                <Text style={styles.croquisHint}>Appuyez pour attacher une photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Observations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Observations libres</Text>
          <TextInput
            style={styles.observationsInput}
            value={observations}
            onChangeText={setObservations}
            placeholder="Décrivez les circonstances de l'accident..."
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Signatures */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Signatures</Text>
          <View style={styles.signaturesRow}>
            <TouchableOpacity
              style={[styles.signatureBox, signedClient && styles.signatureBoxSigned]}
              onPress={() => !signedClient && handleSign('client')}
              activeOpacity={0.8}
            >
              {signedClient ? (
                <>
                  <Text style={styles.signedCheckmark}>✅</Text>
                  <Text style={styles.signedLabel}>Client signé</Text>
                </>
              ) : (
                <Text style={styles.signaturePrompt}>Appuyez pour signer{'\n'}(Client)</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signatureBox, signedDepanneur && styles.signatureBoxSigned]}
              onPress={() => !signedDepanneur && handleSign('depanneur')}
              activeOpacity={0.8}
            >
              {signedDepanneur ? (
                <>
                  <Text style={styles.signedCheckmark}>✅</Text>
                  <Text style={styles.signedLabel}>Dépanneur signé</Text>
                </>
              ) : (
                <Text style={styles.signaturePrompt}>Appuyez pour signer{'\n'}(Dépanneur)</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? 'Envoi en cours...' : '📤 Envoyer le constat'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  fieldRow: { gap: 4 },
  fieldLabel: { color: COLORS.muted, fontSize: 12 },
  fieldInput: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: { color: COLORS.text, fontSize: 14, flex: 1 },
  croquisBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  croquisEmoji: { fontSize: 36 },
  croquisText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  croquisHint: { color: COLORS.muted, fontSize: 12 },
  observationsInput: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 100,
  },
  signaturesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  signatureBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  signatureBoxSigned: {
    borderColor: COLORS.green,
    backgroundColor: '#0D2A1A',
  },
  signaturePrompt: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  signedCheckmark: { fontSize: 28, marginBottom: 4 },
  signedLabel: { color: COLORS.green, fontSize: 13, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
