import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  accent: '#F5A623',
  success: '#27AE60',
  danger: '#E74C3C',
};

const ROLES = [
  { key: 'CHAUFFEUR', icon: '🚕', label: 'Chauffeur Taxi', desc: 'Effectuez des courses dans votre région' },
  { key: 'LIVREUR', icon: '🛵', label: 'Livreur', desc: 'Livrez des commandes aux clients' },
  { key: 'DEPANNEUR', icon: '🛻', label: 'Dépanneur SOS', desc: 'Assistance routière et remorquage' },
];

const STEPS = ['Rôle', 'Informations', 'Véhicule', 'Documents', 'Validation'];

function StepIndicator({ current, total }) {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={[styles.stepDot, i <= current && styles.stepDotActive]}>
            {i < current ? (
              <Text style={styles.stepDotCheck}>✓</Text>
            ) : (
              <Text style={[styles.stepDotNum, i === current && styles.stepDotNumActive]}>{i + 1}</Text>
            )}
          </View>
          {i < total - 1 && (
            <View style={[styles.stepLine, i < current && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );
}

export default function ProviderOnboardingScreen({ navigation }) {
  const { user, loadFromStorage } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0 — Rôle
  const [selectedRole, setSelectedRole] = useState('');

  // Step 1 — Infos
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [cin, setCin] = useState('');
  const [city, setCity] = useState('');

  // Step 2 — Véhicule
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  // Step 3 — Documents
  const [cinPhoto, setCinPhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);
  const [vehicleRegPhoto, setVehicleRegPhoto] = useState(null);

  const pickImage = async (setter) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!selectedRole) {
        Alert.alert('Sélection requise', 'Choisissez votre rôle pour continuer.');
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!name.trim() || !cin.trim() || !city.trim()) {
        Alert.alert('Informations manquantes', 'Veuillez remplir tous les champs obligatoires.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!vehicleBrand.trim() || !vehiclePlate.trim()) {
        Alert.alert('Véhicule requis', 'Marque et immatriculation obligatoires.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!cinPhoto) {
        Alert.alert('Document manquant', 'Veuillez joindre une photo de votre CIN.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      await submitApplication();
    }
  };

  const submitApplication = async () => {
    setLoading(true);
    try {
      await api.post('/api/users/provider-onboarding', {
        role: selectedRole,
        name,
        phone,
        cin,
        city,
        vehicle: {
          type: vehicleType,
          brand: vehicleBrand,
          plate: vehiclePlate,
          year: vehicleYear,
          color: vehicleColor,
        },
        // In prod: upload photos to server then send URLs
        hasDocuments: !!cinPhoto,
      });
      Alert.alert(
        '✅ Demande envoyée !',
        'Votre dossier est en cours de vérification. Vous serez notifié sous 24-48h.',
        [{
          text: 'OK',
          onPress: () => {
            loadFromStorage();
            navigation.navigate('KYCPending');
          },
        }]
      );
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Impossible d\'envoyer la demande.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Quel est votre rôle ?</Text>
            <Text style={styles.stepSub}>Choisissez le service que vous souhaitez proposer</Text>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.key}
                style={[styles.roleCard, selectedRole === role.key && styles.roleCardActive]}
                onPress={() => setSelectedRole(role.key)}
                activeOpacity={0.85}
              >
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleLabel}>{role.label}</Text>
                  <Text style={styles.roleDesc}>{role.desc}</Text>
                </View>
                {selectedRole === role.key && (
                  <Text style={styles.roleCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Vos informations</Text>
            <Text style={styles.fieldLabel}>Nom complet *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="Prénom Nom" placeholderTextColor={COLORS.textMuted} />
            <Text style={styles.fieldLabel}>Téléphone *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone}
              placeholder="+216 XX XXX XXX" placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad" />
            <Text style={styles.fieldLabel}>Numéro CIN *</Text>
            <TextInput style={styles.input} value={cin} onChangeText={setCin}
              placeholder="XXXXXXXX" placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric" maxLength={8} />
            <Text style={styles.fieldLabel}>Ville *</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity}
              placeholder="Ex: Tunis, Sfax, Sousse..." placeholderTextColor={COLORS.textMuted} />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Votre véhicule</Text>
            {['CHAUFFEUR', 'DEPANNEUR'].includes(selectedRole) && (
              <>
                <Text style={styles.fieldLabel}>Type de véhicule</Text>
                <View style={styles.vehicleTypeRow}>
                  {['Berline', 'SUV', 'Monospace', 'Camion'].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.vehicleTypeBtn, vehicleType === t && styles.vehicleTypeBtnActive]}
                      onPress={() => setVehicleType(t)}
                    >
                      <Text style={[styles.vehicleTypeBtnText, vehicleType === t && { color: '#000' }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            <Text style={styles.fieldLabel}>Marque *</Text>
            <TextInput style={styles.input} value={vehicleBrand} onChangeText={setVehicleBrand}
              placeholder="Ex: Toyota, Volkswagen..." placeholderTextColor={COLORS.textMuted} />
            <Text style={styles.fieldLabel}>Immatriculation *</Text>
            <TextInput style={styles.input} value={vehiclePlate} onChangeText={setVehiclePlate}
              placeholder="Ex: 123 TUN 5678" placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Année</Text>
                <TextInput style={styles.input} value={vehicleYear} onChangeText={setVehicleYear}
                  placeholder="2020" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" maxLength={4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Couleur</Text>
                <TextInput style={styles.input} value={vehicleColor} onChangeText={setVehicleColor}
                  placeholder="Blanc" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Documents requis</Text>
            <Text style={styles.stepSub}>Formats acceptés : JPG, PNG. Taille max : 5 Mo</Text>

            {[
              { label: 'CIN (recto-verso) *', state: cinPhoto, setter: setCinPhoto, required: true },
              { label: 'Permis de conduire', state: licensePhoto, setter: setLicensePhoto },
              { label: 'Carte grise du véhicule', state: vehicleRegPhoto, setter: setVehicleRegPhoto },
            ].map((doc, i) => (
              <View key={i} style={styles.docRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>{doc.label}</Text>
                  {doc.state && (
                    <Image source={{ uri: doc.state }} style={styles.docThumb} resizeMode="cover" />
                  )}
                </View>
                <TouchableOpacity style={styles.docPickBtn} onPress={() => pickImage(doc.setter)}>
                  <Text style={styles.docPickBtnText}>{doc.state ? '🔄 Changer' : '📷 Ajouter'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>📋</Text>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>
              {[
                ['Rôle', ROLES.find(r => r.key === selectedRole)?.label || selectedRole],
                ['Nom', name],
                ['CIN', cin],
                ['Ville', city],
                ['Véhicule', `${vehicleBrand} ${vehiclePlate}`],
                ['Documents', cinPhoto ? '✓ CIN joint' : '⚠ CIN manquant'],
              ].map(([label, value], i) => (
                <View key={i} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <Text style={styles.summaryValue}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ⏱ Délai de vérification : 24 à 48h{'\n'}
                📧 Vous serez notifié par SMS et notification push{'\n'}
                💡 Votre compte sera activé après validation KYC
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {step > 0 ? (
          <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Devenir prestataire</Text>
        <Text style={styles.stepCounter}>{step + 1}/{STEPS.length}</Text>
      </View>

      {/* Step indicator */}
      <StepIndicator current={step} total={STEPS.length} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {renderStep()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.nextBtnText}>
                {step === STEPS.length - 1 ? 'Envoyer ma candidature' : 'Continuer →'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 36 },
  backText: { color: COLORS.text, fontSize: 28 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  stepCounter: { color: COLORS.textMuted, fontSize: 13, width: 36, textAlign: 'right' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  stepDotCheck: { color: '#000', fontWeight: '700', fontSize: 12 },
  stepDotNum: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  stepDotNumActive: { color: '#000' },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: COLORS.accent },
  stepContent: { padding: 20 },
  stepTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  stepSub: { color: COLORS.textMuted, fontSize: 13, marginBottom: 20 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border, gap: 14,
  },
  roleCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  roleIcon: { fontSize: 32 },
  roleLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  roleDesc: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  roleCheck: { color: COLORS.accent, fontSize: 20, fontWeight: '800' },
  fieldLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#12121C', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  vehicleTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  vehicleTypeBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#12121C', borderWidth: 1, borderColor: COLORS.border,
  },
  vehicleTypeBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  vehicleTypeBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  docRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
  },
  docLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  docThumb: { width: 80, height: 50, borderRadius: 8 },
  docPickBtn: {
    backgroundColor: COLORS.accent + '22', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.accent,
  },
  docPickBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 16,
    alignItems: 'center',
  },
  summaryIcon: { fontSize: 40, marginBottom: 12 },
  summaryTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summaryLabel: { color: COLORS.textMuted, fontSize: 13 },
  summaryValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  infoBox: {
    backgroundColor: COLORS.accent + '15', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.accent + '55',
  },
  infoText: { color: COLORS.accent, fontSize: 13, lineHeight: 22 },
  bottomBar: {
    padding: 16, backgroundColor: COLORS.background,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  nextBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
