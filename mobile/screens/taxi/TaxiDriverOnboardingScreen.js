import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const STEPS = [
  { key: 'INFOS',    icon: '👤', label: 'Informations personnelles' },
  { key: 'VEHICLE',  icon: '🚗', label: 'Votre véhicule' },
  { key: 'DOCS',     icon: '📄', label: 'Documents requis' },
  { key: 'REVIEW',   icon: '✅', label: 'Récapitulatif' },
];

const VEHICLE_TYPES = [
  { key: 'BERLINE', icon: '🚗', label: 'Berline' },
  { key: 'SUV',     icon: '🚙', label: 'SUV' },
  { key: 'VAN',     icon: '🚐', label: 'Van (7 places)' },
];

const REQUIRED_DOCS = [
  { key: 'cin',            label: 'Carte d\'identité nationale', icon: '🪪' },
  { key: 'permis',         label: 'Permis de conduire', icon: '🪪' },
  { key: 'carte_grise',    label: 'Carte grise', icon: '📋' },
  { key: 'assurance',      label: 'Attestation d\'assurance', icon: '🛡️' },
  { key: 'visite_tech',    label: 'Visite technique', icon: '🔧' },
];

export default function TaxiDriverOnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [infos, setInfos] = useState({ firstName: '', lastName: '', phone: '', email: '', city: '' });
  const [vehicle, setVehicle] = useState({ type: 'BERLINE', brand: '', model: '', year: '', plate: '', color: '' });
  const [uploadedDocs, setUploadedDocs] = useState({});

  const updateInfos = (k, v) => setInfos(p => ({ ...p, [k]: v }));
  const updateVehicle = (k, v) => setVehicle(p => ({ ...p, [k]: v }));

  const simulateUpload = async (key) => {
    setUploadedDocs(p => ({ ...p, [key]: 'uploading' }));
    await new Promise(r => setTimeout(r, 900));
    setUploadedDocs(p => ({ ...p, [key]: 'done' }));
  };

  const canNext = () => {
    if (step === 0) return infos.firstName && infos.lastName && infos.phone;
    if (step === 1) return vehicle.brand && vehicle.model && vehicle.plate;
    if (step === 2) return REQUIRED_DOCS.slice(0, 3).every(d => uploadedDocs[d.key] === 'done');
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/taxi/driver/register', { infos, vehicle, docs: Object.keys(uploadedDocs) });
      navigation.replace('ProviderDocuments', { role: 'CHAUFFEUR' });
    } catch {
      Alert.alert('✅ Dossier envoyé !', 'Votre candidature est en cours d\'examen. Vous recevrez une réponse sous 48h.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } finally { setSubmitting(false); }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Informations personnelles</Text>
            {[
              { label: 'Prénom', key: 'firstName', placeholder: 'Karim' },
              { label: 'Nom', key: 'lastName', placeholder: 'Ben Ali' },
              { label: 'Téléphone', key: 'phone', placeholder: '+216 XX XXX XXX', keyboardType: 'phone-pad' },
              { label: 'Email', key: 'email', placeholder: 'karim@email.com', keyboardType: 'email-address' },
              { label: 'Ville', key: 'city', placeholder: 'Tunis' },
            ].map(f => (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={infos[f.key]}
                  onChangeText={v => updateInfos(f.key, v)}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.muted}
                  keyboardType={f.keyboardType || 'default'}
                />
              </View>
            ))}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Votre véhicule</Text>
            <Text style={styles.fieldLabel}>TYPE DE VÉHICULE</Text>
            <View style={styles.vehicleTypeRow}>
              {VEHICLE_TYPES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.vehicleTypeBtn, vehicle.type === t.key && styles.vehicleTypeBtnActive]}
                  onPress={() => updateVehicle('type', t.key)}
                >
                  <Text style={{ fontSize: 26 }}>{t.icon}</Text>
                  <Text style={[styles.vehicleTypeLabel, vehicle.type === t.key && { color: COLORS.accent }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {[
              { label: 'Marque', key: 'brand', placeholder: 'Toyota' },
              { label: 'Modèle', key: 'model', placeholder: 'Corolla' },
              { label: 'Année', key: 'year', placeholder: '2022', keyboardType: 'numeric' },
              { label: 'Plaque d\'immatriculation', key: 'plate', placeholder: 'TU-145-2022' },
              { label: 'Couleur', key: 'color', placeholder: 'Blanc' },
            ].map(f => (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{f.label.toUpperCase()}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={vehicle[f.key]}
                  onChangeText={v => updateVehicle(f.key, v)}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.muted}
                  keyboardType={f.keyboardType || 'default'}
                />
              </View>
            ))}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Documents requis</Text>
            <Text style={styles.stepSubtitle}>Uploadez les photos de vos documents. Les 3 premiers sont obligatoires.</Text>
            {REQUIRED_DOCS.map((doc, i) => {
              const status = uploadedDocs[doc.key];
              return (
                <View key={doc.key} style={styles.docRow}>
                  <View style={styles.docLeft}>
                    <Text style={{ fontSize: 22 }}>{doc.icon}</Text>
                    <View>
                      <Text style={styles.docLabel}>{doc.label}</Text>
                      {i >= 3 && <Text style={styles.optionalTag}>Optionnel</Text>}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.uploadBtn,
                      status === 'done' ? styles.uploadBtnDone : status === 'uploading' ? { opacity: 0.6 } : {}
                    ]}
                    onPress={() => simulateUpload(doc.key)}
                    disabled={status === 'uploading' || status === 'done'}
                  >
                    {status === 'uploading'
                      ? <ActivityIndicator size="small" color="#000" />
                      : <Text style={[styles.uploadBtnText, status === 'done' && { color: COLORS.green }]}>
                          {status === 'done' ? '✅ Uploadé' : '📎 Uploader'}
                        </Text>
                    }
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Récapitulatif</Text>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>CONDUCTEUR</Text>
              <Text style={styles.reviewItem}>👤 {infos.firstName} {infos.lastName}</Text>
              <Text style={styles.reviewItem}>📱 {infos.phone}</Text>
              <Text style={styles.reviewItem}>📍 {infos.city}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>VÉHICULE</Text>
              <Text style={styles.reviewItem}>{VEHICLE_TYPES.find(t => t.key === vehicle.type)?.icon} {vehicle.brand} {vehicle.model} {vehicle.year}</Text>
              <Text style={styles.reviewItem}>🔖 {vehicle.plate} · {vehicle.color}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>DOCUMENTS</Text>
              {REQUIRED_DOCS.map(d => (
                <Text key={d.key} style={[styles.reviewItem, { color: uploadedDocs[d.key] === 'done' ? COLORS.green : COLORS.muted }]}>
                  {uploadedDocs[d.key] === 'done' ? '✅' : '⬜'} {d.label}
                </Text>
              ))}
            </View>
            <View style={styles.commissionNote}>
              <Text style={styles.commissionText}>✅ EasyWay ne prélève aucune commission. Vous gardez 100% de vos revenus.</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Devenir chauffeur EasyWay</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View key={s.key} style={styles.progressStep}>
            <View style={[styles.progressCircle, i <= step && { backgroundColor: COLORS.accent }]}>
              <Text style={[styles.progressNum, i <= step && { color: '#000' }]}>{i + 1}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.progressLine, i < step && { backgroundColor: COLORS.accent }]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !canNext() && { opacity: 0.4 }, submitting && { opacity: 0.6 }]}
          onPress={() => step < STEPS.length - 1 ? setStep(s => s + 1) : handleSubmit()}
          disabled={!canNext() || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.nextBtnText}>{step < STEPS.length - 1 ? 'Continuer →' : '🚕 Soumettre ma candidature'}</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  progressStep: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  progressNum: { color: COLORS.muted, fontSize: 12, fontWeight: '800' },
  progressLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
  stepContent: { padding: 16 },
  stepTitle: { color: COLORS.text, fontSize: 20, fontWeight: '900', marginBottom: 6 },
  stepSubtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 18, marginBottom: 16 },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', marginBottom: 5, letterSpacing: 0.8 },
  fieldInput: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  vehicleTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  vehicleTypeBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  vehicleTypeBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  vehicleTypeLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  docLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  docLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  optionalTag: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  uploadBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  uploadBtnDone: { backgroundColor: COLORS.green + '20', borderWidth: 1, borderColor: COLORS.green + '50' },
  uploadBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  reviewSection: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  reviewSectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  reviewItem: { color: COLORS.text, fontSize: 14, marginBottom: 6 },
  commissionNote: { backgroundColor: COLORS.green + '10', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.green + '30' },
  commissionText: { color: COLORS.green, fontSize: 13, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  nextBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
