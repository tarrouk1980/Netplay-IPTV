import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  TextInput, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
// useTaxiStore no longer needed here — ordering flow handled by TaxiRequestScreen

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const TAXI_TYPES = [
  { key: 'STANDARD', icon: '🚕', label: 'Standard', desc: 'Berline confortable', multiplier: 1 },
  { key: 'CONFORT', icon: '🚙', label: 'Confort', desc: 'SUV ou premium', multiplier: 1.4 },
  { key: 'VAN', icon: '🚐', label: 'Van', desc: 'Jusqu\'à 7 personnes', multiplier: 1.8 },
];

const MODES = [
  { key: 'NOW', label: '⚡ Maintenant' },
  { key: 'SCHEDULED', label: '📅 Programmer' },
];

const SAVED_ADDRESSES = [
  { icon: '🏠', label: 'Maison', address: 'Berges du Lac 2, Tunis' },
  { icon: '💼', label: 'Bureau', address: 'Centre Urbain Nord, Tunis' },
];

const BASE_FARE = 1.2;
const PER_KM = 0.8;

export default function TaxiHomeScreen({ navigation }) {
  const [origin, setOrigin] = useState(null);
  const [originText, setOriginText] = useState('');
  const [destText, setDestText] = useState('');
  const [taxiType, setTaxiType] = useState('STANDARD');
  const [mode, setMode] = useState('NOW');
  const [locating, setLocating] = useState(false);
  const [nearbyCount] = useState(4);

  useEffect(() => { detectLocation(); }, []);

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocating(false); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      if (geo) setOriginText(`${geo.street || ''} ${geo.city || ''}`.trim());
    } catch {} finally { setLocating(false); }
  };

  const estimatedFare = (multiplier) => {
    const dist = 5.2;
    return ((BASE_FARE + dist * PER_KM) * multiplier).toFixed(3);
  };

  const handleRequest = () => {
    // Navigate to TaxiRequestScreen which contains:
    // - Taximètre EASYWAY vs Mise en relation toggle
    // - Fare estimate algorithm
    // - Legal disclaimer
    // - Destination autocomplete with map
    const taxiTypeMap = { STANDARD: 'NORMAL', CONFORT: 'NORMAL', VAN: 'NORMAL' };
    navigation.navigate('TaxiRequest', {
      taxiType: taxiType === 'STANDARD' ? 'NORMAL' : taxiType,
      prefilledDest: destText || '',
      scheduledMode: mode === 'SCHEDULED',
    });
  };

  const selectedType = TAXI_TYPES.find(t => t.key === taxiType);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚕 Taxi EasyWay</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Nearby indicator */}
        <View style={styles.nearbyRow}>
          <View style={styles.nearbyDot} />
          <Text style={styles.nearbyText}>{nearbyCount} chauffeurs disponibles près de vous</Text>
        </View>

        {/* Mode tabs */}
        <View style={styles.modeRow}>
          {MODES.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
              onPress={() => setMode(m.key)}
            >
              <Text style={[styles.modeLabel, mode === m.key && styles.modeLabelActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Address inputs */}
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View style={[styles.addrDot, { backgroundColor: COLORS.green }]} />
            <View style={styles.addrInput}>
              {locating ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                  <Text style={styles.addrPlaceholder}>Localisation en cours...</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.addrText}
                  value={originText}
                  onChangeText={setOriginText}
                  placeholder="Départ — position actuelle"
                  placeholderTextColor={COLORS.muted}
                />
              )}
            </View>
            <TouchableOpacity onPress={detectLocation} style={styles.gpsBtn}>
              <Text style={{ fontSize: 16 }}>📍</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addrSeparator} />
          <View style={styles.addressRow}>
            <View style={[styles.addrDot, { backgroundColor: COLORS.accent }]} />
            <TextInput
              style={[styles.addrText, { flex: 1 }]}
              value={destText}
              onChangeText={setDestText}
              placeholder="Destination (optionnel)"
              placeholderTextColor={COLORS.muted}
            />
          </View>
        </View>

        {/* Saved addresses */}
        <View style={styles.savedRow}>
          {SAVED_ADDRESSES.map((a, i) => (
            <TouchableOpacity key={i} style={styles.savedBtn} onPress={() => setDestText(a.address)}>
              <Text style={{ fontSize: 14 }}>{a.icon}</Text>
              <Text style={styles.savedLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Taxi type */}
        <Text style={styles.sectionTitle}>TYPE DE VÉHICULE</Text>
        <View style={styles.typesRow}>
          {TAXI_TYPES.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeCard, taxiType === t.key && styles.typeCardActive]}
              onPress={() => setTaxiType(t.key)}
            >
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, taxiType === t.key && styles.typeLabelActive]}>{t.label}</Text>
              <Text style={styles.typeDesc}>{t.desc}</Text>
              <Text style={[styles.typeFare, taxiType === t.key && { color: COLORS.accent }]}>
                ~{estimatedFare(t.multiplier)} TND
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Services spéciaux */}
        <Text style={styles.sectionTitle}>SERVICES SPÉCIAUX</Text>
        <View style={styles.specialRow}>
          <TouchableOpacity
            style={[styles.specialCard, { borderColor: '#E91E8C40' }]}
            onPress={() => navigation.navigate('EasyLady')}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 28 }}>👩</Text>
            <Text style={[styles.specialLabel, { color: '#E91E8C' }]}>Easy For Lady</Text>
            <Text style={styles.specialDesc}>Chauffeures femmes uniquement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.specialCard, { borderColor: '#2196F340' }]}
            onPress={() => navigation.navigate('EasyAccess')}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 28 }}>♿</Text>
            <Text style={[styles.specialLabel, { color: '#2196F3' }]}>EasyAccess</Text>
            <Text style={styles.specialDesc}>Véhicules adaptés PMR</Text>
          </TouchableOpacity>
        </View>

        {/* Estimate */}
        {selectedType && (
          <View style={styles.estimateCard}>
            <View>
              <Text style={styles.estimateLabel}>Estimation pour {selectedType.label}</Text>
              <Text style={styles.estimateNote}>Prix indicatif · ~5 km · commission 0%</Text>
            </View>
            <Text style={styles.estimateFare}>{estimatedFare(selectedType.multiplier)} TND</Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={handleRequest}
        >
          <Text style={styles.requestBtnText}>
            {mode === 'NOW' ? '🚕 Commander un taxi' : '📅 Programmer la course'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  scroll: { padding: 16 },
  nearbyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
    backgroundColor: COLORS.green + '15', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: COLORS.green + '30',
  },
  nearbyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  nearbyText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  modeBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 10, alignItems: 'center', backgroundColor: COLORS.surface,
  },
  modeBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  modeLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  modeLabelActive: { color: COLORS.accent },
  addressCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addrDot: { width: 10, height: 10, borderRadius: 5 },
  addrInput: { flex: 1 },
  addrText: { color: COLORS.text, fontSize: 14, flex: 1 },
  addrPlaceholder: { color: COLORS.muted, fontSize: 13 },
  gpsBtn: { padding: 4 },
  addrSeparator: { height: 1, backgroundColor: COLORS.border, marginVertical: 10, marginLeft: 20 },
  savedRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  savedBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  savedLabel: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  typesRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  typeIcon: { fontSize: 26, marginBottom: 4 },
  typeLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  typeLabelActive: { color: COLORS.accent },
  typeDesc: { color: COLORS.muted, fontSize: 9, textAlign: 'center', marginTop: 2 },
  typeFare: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginTop: 4 },
  estimateCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.green + '40',
  },
  estimateLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  estimateNote: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  estimateFare: { color: COLORS.accent, fontSize: 20, fontWeight: '900' },
  requestBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  requestBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  specialRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  specialCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 6, borderWidth: 1,
  },
  specialLabel: { fontSize: 13, fontWeight: '900' },
  specialDesc: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
});
