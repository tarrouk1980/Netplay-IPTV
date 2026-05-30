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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import useSosStore from '../../store/sosStore';
import StaticMap from '../../components/StaticMap';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#D32F2F',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
  green: '#27AE60',
};

const STEPS = ['État du véhicule', 'Infos véhicule', 'Confirmation'];

const VEHICLE_CHECKS = [
  { key: 'starts', label: 'Le véhicule démarre', icon: '🔑' },
  { key: 'accident', label: 'Accident survenu', icon: '💥' },
  { key: 'battery', label: 'Batterie à plat', icon: '🔋' },
  { key: 'fuel', label: 'Manque de carburant', icon: '⛽' },
  { key: 'flatTire', label: 'Pneu crevé', icon: '🔴' },
  { key: 'keysLocked', label: 'Clés enfermées', icon: '🔒' },
  { key: 'automatic', label: 'Boîte automatique', icon: '⚙️' },
];

const BRANDS_MODELS = {
  'Volkswagen': ['Golf','Polo','Passat','Tiguan','T-Roc','Touareg','Caddy','Transporter','Autre'],
  'Renault': ['Clio','Megane','Scenic','Kadjar','Captur','Duster','Symbol','Logan','Sandero','Kangoo','Autre'],
  'Peugeot': ['208','308','508','2008','3008','5008','Partner','Expert','Autre'],
  'Citroën': ['C3','C4','C5','Berlingo','Jumpy','Jumper','C-Elysée','Autre'],
  'Ford': ['Fiesta','Focus','Mondeo','Puma','Kuga','Explorer','Transit','Ranger','Autre'],
  'Toyota': ['Yaris','Corolla','Camry','RAV4','Hilux','Land Cruiser','Fortuner','Innova','Prius','Autre'],
  'Hyundai': ['i10','i20','i30','Tucson','Santa Fe','Elantra','Accent','Creta','Autre'],
  'Kia': ['Picanto','Rio','Sportage','Sorento','Stinger','Seltos','Carnival','Autre'],
  'Seat': ['Ibiza','Leon','Arona','Ateca','Tarraco','Alhambra','Autre'],
  'Skoda': ['Fabia','Octavia','Superb','Karoq','Kodiaq','Autre'],
  'BMW': ['Série 1','Série 3','Série 5','Série 7','X1','X3','X5','X7','Autre'],
  'Mercedes': ['Classe A','Classe C','Classe E','Classe S','GLA','GLC','GLE','Sprinter','Autre'],
  'Audi': ['A1','A3','A4','A6','Q2','Q3','Q5','Q7','Autre'],
  'Fiat': ['500','Punto','Tipo','Panda','Bravo','Doblo','Ducato','Autre'],
  'Dacia': ['Sandero','Logan','Duster','Spring','Lodgy','Dokker','Autre'],
  'Autre': ['Autre'],
};

const BRANDS = Object.keys(BRANDS_MODELS);
const YEARS = Array.from({ length: 26 }, (_, i) => String(2025 - i));
const CAR_COLORS = ['Blanc','Noir','Gris','Argent','Rouge','Bleu','Vert','Beige','Marron','Jaune','Orange','Autre'];

function PickerModal({ visible, title, options, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={modalStyles.scroll}>
            {options.map((opt) => (
              <TouchableOpacity key={opt} style={modalStyles.option} onPress={() => { onSelect(opt); onClose(); }}>
                <Text style={modalStyles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1C1C28', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, maxHeight: '70%' },
  handle: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  title: { fontSize: 14, color: '#8E8E9A', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', paddingHorizontal: 20, paddingBottom: 8 },
  scroll: { paddingHorizontal: 20 },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2C2C3E' },
  optionText: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
});

export default function SOSRequestScreen({ route, navigation }) {
  const { mode, contract } = route.params || {};
  const { requestSOS, isSearching } = useSosStore();

  const [step, setStep] = useState(0);
  const [vehicleState, setVehicleState] = useState({
    starts: false,
    accident: false,
    battery: false,
    fuel: false,
    flatTire: false,
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
  const [pickerModal, setPickerModal] = useState({ visible: false, field: '', title: '', options: [] });
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    if (step === 2) {
      fetchLocation();
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

  const openPicker = (field, title, options) => {
    setPickerModal({ visible: true, field, title, options });
  };

  const closePicker = () => {
    setPickerModal((p) => ({ ...p, visible: false }));
  };

  const handlePickerSelect = (value) => {
    const field = pickerModal.field;
    setVehicleInfo((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'brand') next.model = '';
      return next;
    });
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

  const handleSubmit = async (submitMode) => {
    if (!location) {
      Alert.alert('Position requise', 'Impossible d\'envoyer le SOS sans position GPS.');
      return;
    }

    if (submitMode === 'SCHEDULED') {
      // Pré-remplir avec aujourd'hui + 2h
      const now = new Date();
      const d = now.toISOString().slice(0, 10);
      const h = String(now.getHours() + 2).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setScheduleDate(d);
      setScheduleTime(`${h}:${m}`);
      setScheduleModal(true);
      return;
    }

    await sendSOS(submitMode);
  };

  const sendSOS = async (submitMode, slot) => {
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
        submitMode,
        slot: slot || null,
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

      <PickerModal
        visible={pickerModal.visible}
        title={pickerModal.title}
        options={pickerModal.options}
        onSelect={handlePickerSelect}
        onClose={closePicker}
      />

      {/* Modal agenda — réservation dépanneur */}
      <Modal visible={scheduleModal} transparent animationType="slide" onRequestClose={() => setScheduleModal(false)}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={() => setScheduleModal(false)}>
          <TouchableOpacity style={[modalStyles.sheet, { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 }]} activeOpacity={1}>
            <View style={modalStyles.handle} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 6 }}>📅 Programmer une intervention</Text>
            <Text style={{ fontSize: 13, color: '#8E8E9A', marginBottom: 20 }}>Le dépanneur sera notifié et confirmera le créneau.</Text>

            <Text style={scheduleStyles.label}>DATE (AAAA-MM-JJ)</Text>
            <TextInput
              style={scheduleStyles.input}
              value={scheduleDate}
              onChangeText={setScheduleDate}
              placeholder="2025-06-15"
              placeholderTextColor="#555"
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={scheduleStyles.label}>HEURE (HH:MM)</Text>
            <TextInput
              style={scheduleStyles.input}
              value={scheduleTime}
              onChangeText={setScheduleTime}
              placeholder="14:30"
              placeholderTextColor="#555"
              keyboardType="numeric"
              maxLength={5}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              {['+1h', '+2h', '+3h', 'Demain matin'].map((label) => (
                <TouchableOpacity
                  key={label}
                  style={scheduleStyles.quickBtn}
                  onPress={() => {
                    const base = new Date();
                    if (label === 'Demain matin') {
                      base.setDate(base.getDate() + 1);
                      base.setHours(9, 0, 0);
                    } else {
                      const h = parseInt(label.replace('+', '').replace('h', ''));
                      base.setHours(base.getHours() + h);
                    }
                    setScheduleDate(base.toISOString().slice(0, 10));
                    setScheduleTime(`${String(base.getHours()).padStart(2,'0')}:${String(base.getMinutes()).padStart(2,'0')}`);
                  }}
                >
                  <Text style={scheduleStyles.quickBtnText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[scheduleStyles.confirmBtn, { backgroundColor: COLORS.accent }]}
              onPress={() => {
                setScheduleModal(false);
                sendSOS('SCHEDULED', `${scheduleDate}T${scheduleTime}`);
              }}
            >
              <Text style={scheduleStyles.confirmBtnText}>Confirmer le rendez-vous</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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

            {/* Marque */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Marque *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openPicker('brand', 'Marque', BRANDS)}
              >
                <Text style={[styles.pickerButtonText, !vehicleInfo.brand && styles.pickerPlaceholder]}>
                  {vehicleInfo.brand || 'Sélectionner la marque'}
                </Text>
                <Text style={styles.pickerChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Modèle */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Modèle</Text>
              {vehicleInfo.brand === 'Autre' ? (
                <TextInput
                  style={styles.input}
                  value={vehicleInfo.model}
                  onChangeText={(v) => setVehicleInfo((prev) => ({ ...prev, model: v }))}
                  placeholder="Ex: Golf"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                />
              ) : (
                <TouchableOpacity
                  style={[styles.pickerButton, !vehicleInfo.brand && { opacity: 0.45 }]}
                  onPress={() => {
                    if (!vehicleInfo.brand) {
                      Alert.alert('Marque requise', 'Veuillez d\'abord sélectionner la marque du véhicule.');
                      return;
                    }
                    openPicker('model', 'Modèle', BRANDS_MODELS[vehicleInfo.brand] || ['Autre']);
                  }}
                >
                  <Text style={[styles.pickerButtonText, !vehicleInfo.model && styles.pickerPlaceholder]}>
                    {vehicleInfo.model || 'Sélectionner le modèle'}
                  </Text>
                  <Text style={styles.pickerChevron}>›</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Année */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Année</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openPicker('year', 'Année', YEARS)}
              >
                <Text style={[styles.pickerButtonText, !vehicleInfo.year && styles.pickerPlaceholder]}>
                  {vehicleInfo.year || "Sélectionner l'année"}
                </Text>
                <Text style={styles.pickerChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Plaque d'immatriculation */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Plaque d'immatriculation *</Text>
              <View style={styles.plateRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={vehicleInfo.licensePlate}
                  onChangeText={(v) => setVehicleInfo((prev) => ({ ...prev, licensePlate: v }))}
                  placeholder="Ex: 123 TUN 4567"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Couleur */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Couleur</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openPicker('color', 'Couleur', CAR_COLORS)}
              >
                <Text style={[styles.pickerButtonText, !vehicleInfo.color && styles.pickerPlaceholder]}>
                  {vehicleInfo.color || 'Sélectionner la couleur'}
                </Text>
                <Text style={styles.pickerChevron}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: confirmation */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Confirmation</Text>

            {/* GPS + Map */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>📍 Votre position</Text>
              {locating ? (
                <ActivityIndicator color={COLORS.accent} style={{ marginTop: 8 }} />
              ) : location ? (
                <>
                  <StaticMap
                    lat={location.lat}
                    lng={location.lng}
                    height={180}
                    zoom={15}
                    style={{ marginTop: 10, marginBottom: 8 }}
                  />
                  <Text style={styles.infoCardValue}>
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </Text>
                </>
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
                <Text style={[styles.infoCardTitle, { color: COLORS.green }]}>🛡️ Couverture assurance</Text>
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
          <View style={styles.submitButtons}>
            <TouchableOpacity
              style={[styles.urgentButton, (!location || isSearching) && styles.buttonDisabled]}
              onPress={() => handleSubmit('URGENT')}
              activeOpacity={0.85}
              disabled={!location || isSearching}
            >
              {isSearching ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.urgentButtonIcon}>🚨</Text>
                  <Text style={styles.urgentButtonText}>Dépanneur urgent</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scheduledButton, (!location || isSearching) && styles.buttonDisabled]}
              onPress={() => handleSubmit('SCHEDULED')}
              activeOpacity={0.85}
              disabled={!location || isSearching}
            >
              <Text style={styles.scheduledButtonIcon}>📅</Text>
              <Text style={styles.scheduledButtonText}>Réserver un dépanneur</Text>
            </TouchableOpacity>
          </View>
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
  backArrow: { fontSize: 32, color: COLORS.accent, lineHeight: 32, marginTop: -4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: COLORS.accent },
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
  stepDotActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  stepDotText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  stepDotTextActive: { color: '#000' },
  stepLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 4, textAlign: 'center', maxWidth: 60 },
  stepLabelActive: { color: COLORS.accent },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginBottom: 16 },
  stepLineActive: { backgroundColor: COLORS.accent },
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
  checkRowActive: { borderColor: COLORS.accent },
  checkIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  checkLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  checkLabelActive: { color: COLORS.accent, fontWeight: '600' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkmark: { color: '#000', fontWeight: '800', fontSize: 13 },
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
  pickerButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: { fontSize: 14, color: COLORS.text, flex: 1 },
  pickerPlaceholder: { color: COLORS.textMuted },
  pickerChevron: { fontSize: 22, color: COLORS.textMuted, marginLeft: 8 },
  plateRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  photoButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  photoButtonText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
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
    backgroundColor: COLORS.accent + '22',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryGpsText: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  submitButtons: { gap: 12 },
  urgentButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  urgentButtonIcon: { fontSize: 20 },
  urgentButtonText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  scheduledButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  scheduledButtonIcon: { fontSize: 20 },
  scheduledButtonText: { color: COLORS.accent, fontSize: 16, fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },
});

const scheduleStyles = StyleSheet.create({
  label: { color: '#8E8E9A', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C3E',
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    letterSpacing: 1,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#2C2C3E',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  confirmBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
