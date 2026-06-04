import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C',
};

const SOS_TYPES = [
  { key: 'PANNE', icon: '⚙️', label: 'Panne moteur', desc: 'Véhicule ne démarre plus' },
  { key: 'CREVAISON', icon: '🔧', label: 'Crevaison', desc: 'Pneu crevé' },
  { key: 'BATTERIE', icon: '🔋', label: 'Batterie morte', desc: 'Batterie déchargée' },
  { key: 'ACCIDENT', icon: '🚨', label: 'Accident', desc: 'Assistance après accident' },
  { key: 'REMORQUAGE', icon: '🚛', label: 'Remorquage', desc: 'Transport du véhicule' },
  { key: 'AUTRE', icon: '❓', label: 'Autre', desc: 'Autre type de panne' },
];

export default function SOSRequestScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [sosType, setSosType] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocating(false); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      if (geo) setAddress(`${geo.street || ''} ${geo.city || ''}`.trim());
    } catch {} finally { setLocating(false); }
  };

  const handleSubmit = async () => {
    if (!sosType) { Alert.alert('Sélectionnez', 'Choisissez le type de panne.'); return; }
    setSubmitting(true);
    try {
      const body = {
        type: sosType,
        lat: location?.lat,
        lng: location?.lng,
        address,
        note,
      };
      const res = await api.post('/api/sos/request', body);
      const orderId = res.data?.order?.id || res.data?.id;
      navigation.replace('SOSTracking', { orderId, sosType });
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande. Vérifiez votre connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔧 Demande SOS</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Urgency banner */}
      <View style={styles.urgencyBanner}>
        <Text style={styles.urgencyText}>🚨 Les dépanneurs EasyWay interviennent sous 20 min</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Step 1 — type */}
        <Text style={styles.sectionTitle}>TYPE DE PANNE</Text>
        <View style={styles.typesGrid}>
          {SOS_TYPES.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeCard, sosType === t.key && styles.typeCardActive]}
              onPress={() => setSosType(t.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={[styles.typeLabel, sosType === t.key && styles.typeLabelActive]}>{t.label}</Text>
              <Text style={styles.typeDesc}>{t.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 2 — location */}
        <Text style={styles.sectionTitle}>VOTRE LOCALISATION</Text>
        <View style={styles.locationCard}>
          {locating ? (
            <View style={styles.locatingRow}>
              <ActivityIndicator color={COLORS.accent} size="small" />
              <Text style={styles.locatingText}>Localisation en cours...</Text>
            </View>
          ) : (
            <>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {address || (location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Position non détectée')}
                </Text>
                <TouchableOpacity onPress={getLocation} style={styles.relocateBtn}>
                  <Text style={styles.relocateText}>↻</Text>
                </TouchableOpacity>
              </View>
              {!location && (
                <Text style={styles.locationWarning}>⚠️ Activez la géolocalisation pour une intervention plus rapide</Text>
              )}
            </>
          )}
        </View>

        {/* Optional note */}
        <Text style={styles.sectionTitle}>DÉTAILS SUPPLÉMENTAIRES (OPTIONNEL)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Décrivez le problème, marque du véhicule..."
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={3}
        />

        {/* Summary before send */}
        {sosType && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Résumé de la demande</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type</Text>
              <Text style={styles.summaryValue}>
                {SOS_TYPES.find(t => t.key === sosType)?.icon} {SOS_TYPES.find(t => t.key === sosType)?.label}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Position</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>{address || 'GPS activé'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Commission</Text>
              <Text style={[styles.summaryValue, { color: COLORS.green }]}>0.000 TND ✓</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.sendBtn, (!sosType || submitting) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!sosType || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.sendBtnText}>🆘 Envoyer la demande SOS</Text>
          )}
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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  urgencyBanner: {
    backgroundColor: COLORS.red + '15', paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.red + '30',
  },
  urgencyText: { color: COLORS.red, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  scroll: { padding: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12, marginTop: 8 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeCardActive: { borderColor: COLORS.red, backgroundColor: COLORS.red + '10' },
  typeIcon: { fontSize: 28, marginBottom: 6 },
  typeLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  typeLabelActive: { color: COLORS.red },
  typeDesc: { color: COLORS.muted, fontSize: 10, textAlign: 'center', marginTop: 3 },
  locationCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  locatingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locatingText: { color: COLORS.muted, fontSize: 13 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { fontSize: 20 },
  locationAddress: { flex: 1, color: COLORS.text, fontSize: 13 },
  relocateBtn: { padding: 4 },
  relocateText: { color: COLORS.accent, fontSize: 20 },
  locationWarning: { color: COLORS.accent, fontSize: 11, marginTop: 8 },
  noteInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 16, textAlignVertical: 'top', height: 80,
  },
  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.green + '40',
  },
  summaryTitle: { color: COLORS.green, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  sendBtn: {
    backgroundColor: COLORS.red, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  sendBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
