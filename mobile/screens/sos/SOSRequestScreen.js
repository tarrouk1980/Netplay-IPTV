import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import useSosStore from '../../store/sosStore';
import { estimateSOSPrice } from '../../utils/sosPricing';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  sos: '#E74C3C',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
  green: '#27AE60',
  blue: '#2980B9',
  checked: '#E74C3C',
};

const STEPS = ['État du véhicule', 'Infos véhicule', 'Confirmation'];

const VEHICLE_CHECKS = [
  { key: 'starts', label: 'Le véhicule démarre', icon: '🔑' },
  { key: 'accident', label: 'Accident survenu', icon: '💥' },
  { key: 'battery', label: 'Batterie à plat', icon: '🔋' },
  { key: 'fuel', label: 'Manque de carburant', icon: '⛽' },
  { key: 'keysLocked', label: 'Clés enfermées', icon: '🔒' },
  { key: 'automatic', label: 'Boîte automatique', icon: '⚙️' },
];

export default function SOSRequestScreen({ route, navigation }) {
  const { mode, contract } = route.params || {};
  const { requestSOS, isSearching } = useSosStore();

  const [step, setStep] = useState(0);
  const [vehicleState, setVehicleState] = useState({
    starts: false,
    accident: false,
    battery: false,
    fuel: false,
    keysLocked: false,
    automatic: false,
  });
  const [vehicleInfo, setVehicleInfo] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
  });
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState(null);

  useEffect(() => {
    if (step === 2) {
      fetchLocation();
      if (mode === 'INDEPENDENT') {
        const est = estimateSOSPrice(5, vehicleState, new Date());
        setPriceEstimate(est);
      }
    }
  }, [step]);

  const fetchLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La localisation est requise pour le SOS.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (err) {
      Alert.alert('Erreur GPS', 'Impossible d\'obtenir la position.');
    } finally {
      setLocating(false);
    }
  };

  const toggleCheck = (key) => {
    setVehicleState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!vehicleInfo.brand.trim() || !vehicleInfo.licensePlate.trim()) {
        Alert.alert('Champs requis', 'Veuillez renseigner la marque et la plaque d\'immatriculation.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) navigation.goBack();
    else setStep((s) => s - 1);
  };

  const handleSendSOS = async () => {
    if (!location) {
      Alert.alert('Position requise', 'Impossible d\'envoyer le SOS sans position GPS.');
      return;
    }

    try {
      const data = {
        lat: location.lat,
        lng: location.lng,
        vehicleState,
        vehicleInfo: {
          ...vehicleInfo,
          year: vehicleInfo.year ? parseInt(vehicleInfo.year) : null,
        },
        mode,
        insuranceContractId: contract?.id || undefined,
      };
      const result = await requestSOS(data);
      navigation.replace('SOSTracking', { orderId: result.order.id });
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'envoyer le SOS.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Remorquage</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>
                  {i < step ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step 0: vehicle state */}
        {step === 0 && (
          <View>
            <Text style={styles.sectionTitle}>Décrivez l'état de votre véhicule</Text>
            {VEHICLE_CHECKS.map(({ key, label, icon }) => (
              <TouchableOpacity
                key={key}
                style={[styles.checkRow, vehicleState[key] && styles.checkRowActive]}
                onPress={() => toggleCheck(key)}
                activeOpacity={0.8}
              >
                <Text style={styles.checkIcon}>{icon}</Text>
                <Text style={[styles.checkLabel, vehicleState[key] && styles.checkLabelActive]}>{label}</Text>
                <View style={[styles.checkbox, vehicleState[key] && styles.checkboxChecked]}>
                  {vehicleState[key] && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 1: vehicle info */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Informations sur votre véhicule</Text>
            {[
              { key: 'brand', label: 'Marque *', placeholder: 'Ex: Volkswagen' },
              { key: 'model', label: 'Modèle *', placeholder: 'Ex: Golf' },
              { key: 'year', label: 'Année', placeholder: 'Ex: 2019', keyboard: 'numeric' },
              { key: 'licensePlate', label: 'Plaque d\'immatriculation *', placeholder: 'Ex: 123 TUN 4567' },
              { key: 'color', label: 'Couleur', placeholder: 'Ex: Blanc' },
            ].map(({ key, label, placeholder, keyboard }) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleInfo[key]}
                  onChangeText={(v) => setVehicleInfo((prev) => ({ ...prev, [key]: v }))}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType={keyboard || 'default'}
                  autoCapitalize="characters"
                />
              </View>
            ))}
          </View>
        )}

        {/* Step 2: confirmation */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Confirmation</Text>

            {/* GPS */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>📍 Votre position</Text>
              {locating ? (
                <ActivityIndicator color={COLORS.sos} style={{ marginTop: 8 }} />
              ) : location ? (
                <Text style={styles.infoCardValue}>
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </Text>
              ) : (
                <TouchableOpacity onPress={fetchLocation} style={styles.retryGps}>
                  <Text style={styles.retryGpsText}>Réessayer la géolocalisation</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Vehicle summary */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>🚗 Véhicule</Text>
              <Text style={styles.infoCardValue}>
                {vehicleInfo.brand} {vehicleInfo.model} {vehicleInfo.year ? `(${vehicleInfo.year})` : ''}
              </Text>
              <Text style={styles.infoCardSub}>{vehicleInfo.licensePlate} — {vehicleInfo.color}</Text>
            </View>

            {/* Insurance coverage */}
            {mode === 'INSURANCE' && contract && (
              <View style={[styles.infoCard, { borderColor: COLORS.green }]}>
                <Text style={[styles.infoCardTitle, { color: COLORS.green }]}>🔒 Couverture assurance</Text>
                <Text style={styles.infoCardValue}>Contrat N° {contract.contractNumber}</Text>
                <View style={styles.coverageTags}>
                  {contract.coverageTypes.map((c) => (
                    <View key={c} style={styles.coverageTag}>
                      <Text style={styles.coverageTagText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Price estimate (independent mode) */}
            {mode === 'INDEPENDENT' && priceEstimate && (
              <View style={[styles.infoCard, { borderColor: COLORS.sos }]}>
                <Text style={[styles.infoCardTitle, { color: COLORS.sos }]}>💰 Estimation du prix</Text>
                <Text style={styles.priceEstimate}>{priceEstimate.total.toFixed(3)} TND</Text>
                <Text style={styles.infoCardSub}>Estimation basée sur 5 km — devis précis du dépanneur</Text>
                {priceEstimate.surcharges && Object.keys(priceEstimate.surcharges).length > 0 && (
                  <Text style={styles.surchargeNote}>
                    Majorations appliquées : {Object.keys(priceEstimate.surcharges).join(', ')}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.bottomBar}>
        {step < 2 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>Suivant →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sosButton, (!location || isSearching) && styles.sosButtonDisabled]}
            onPress={handleSendSOS}
            activeOpacity={0.85}
            disabled={!location || isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.sosButtonIcon}>🚨</Text>
                <Text style={styles.sosButtonText}>Envoyer SOS</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 4 },
  backArrow: { fontSize: 32, color: COLORS.sos, lineHeight: 32, marginTop: -4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: COLORS.sos },
  headerSpacer: { width: 32 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  stepItem: { alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { borderColor: COLORS.sos, backgroundColor: COLORS.sos },
  stepDotText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  stepDotTextActive: { color: '#fff' },
  stepLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 4, textAlign: 'center', maxWidth: 60 },
  stepLabelActive: { color: COLORS.sos },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginBottom: 16 },
  stepLineActive: { backgroundColor: COLORS.sos },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  checkRowActive: { borderColor: COLORS.sos },
  checkIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  checkLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  checkLabelActive: { color: COLORS.sos, fontWeight: '600' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.sos, borderColor: COLORS.sos },
  checkmark: { color: '#fff', fontWeight: '800', fontSize: 13 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  infoCardValue: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  infoCardSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  priceEstimate: { fontSize: 28, fontWeight: '900', color: COLORS.sos, marginBottom: 4 },
  surchargeNote: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },
  coverageTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  coverageTag: {
    backgroundColor: COLORS.green + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coverageTagText: { fontSize: 10, color: COLORS.green, fontWeight: '700' },
  retryGps: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.sos + '22',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryGpsText: { color: COLORS.sos, fontWeight: '600', fontSize: 13 },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.sos,
  },
  nextButtonText: { color: COLORS.sos, fontSize: 16, fontWeight: '700' },
  sosButton: {
    backgroundColor: COLORS.sos,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.sos,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonDisabled: { opacity: 0.5 },
  sosButtonIcon: { fontSize: 20 },
  sosButtonText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 1 },
});
