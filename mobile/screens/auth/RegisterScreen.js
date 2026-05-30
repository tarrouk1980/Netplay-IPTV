import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setTokens } from '../../services/api';
import useAuthStore from '../../store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#252535',
  primary: '#F5A623',
  primaryDim: '#2A1F0A',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  error: '#E74C3C',
};

const ROLES = [
  { value: 'CLIENT', label: 'Client', emoji: '👤' },
  { value: 'CHAUFFEUR', label: 'Chauffeur', emoji: '🚕' },
  { value: 'LIVREUR', label: 'Livreur', emoji: '📦' },
  { value: 'DEPANNEUR', label: 'Dépanneur', emoji: '🔧' },
  { value: 'MARCHAND', label: 'Marchand', emoji: '🏪' },
];

const CHAUFFEUR_VEHICLE_TYPES = [
  { value: 'BERLINE', label: 'Berline', emoji: '🚗' },
  { value: 'SUV', label: 'SUV', emoji: '🚙' },
  { value: 'MINIVAN', label: 'Minivan', emoji: '🚐' },
  { value: 'MOTO', label: 'Moto', emoji: '🛵' },
];

const DELIVERY_VEHICLE_TYPES = [
  { value: 'MOTO', label: 'Moto', emoji: '🛵' },
  { value: 'SCOOTER', label: 'Scooter', emoji: '🛺' },
  { value: 'VELO', label: 'Vélo', emoji: '🚲' },
  { value: 'APIED', label: 'À pied', emoji: '🚶' },
  { value: 'VOITURE', label: 'Voiture', emoji: '🚗' },
];

const MOTORIZED_DELIVERY = ['MOTO', 'SCOOTER', 'VOITURE'];

const TRUCK_TYPES = [
  { value: 'PLATEAU', label: 'Plateau', emoji: '🚛' },
  { value: 'GRUE', label: 'Grue', emoji: '🏗️' },
  { value: 'FOURGON', label: 'Fourgon', emoji: '🚐' },
];

const MERCHANT_CATEGORIES = [
  { value: 'RESTAURANT', label: 'Restaurant', emoji: '🍕' },
  { value: 'PHARMACY', label: 'Pharmacie', emoji: '💊' },
  { value: 'SUPERMARKET', label: 'Supermarché', emoji: '🛒' },
  { value: 'BEAUTY', label: 'Beauté', emoji: '💄' },
  { value: 'PETS', label: 'Animalerie', emoji: '🐾' },
  { value: 'HIGHTECH', label: 'High-Tech', emoji: '💻' },
  { value: 'ELECTRO', label: 'Électroménager', emoji: '⚡' },
  { value: 'OTHER', label: 'Autre', emoji: '📦' },
];

// ─── Reusable sub-components ──────────────────────────────────────────────────

function InputField({ label, required, error, ...props }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? <Text style={{ color: COLORS.primary }}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function OptionSelector({ label, required, options, value, onChange, disabled }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? <Text style={{ color: COLORS.primary }}> *</Text> : null}
      </Text>
      <View style={styles.optionGrid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionBtn, value === opt.value ? styles.optionBtnSelected : null]}
            onPress={() => onChange(opt.value)}
            disabled={disabled}
          >
            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            <Text style={[styles.optionLabel, value === opt.value ? styles.optionLabelSelected : null]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function KycNote({ text }) {
  return (
    <View style={styles.kycNote}>
      <Text style={styles.kycNoteIcon}>🔒</Text>
      <Text style={styles.kycNoteText}>{text}</Text>
    </View>
  );
}

function Stepper({ currentStep, totalSteps }) {
  return (
    <View style={styles.stepper}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        return (
          <React.Fragment key={stepNum}>
            <View style={[
              styles.stepCircle,
              isActive ? styles.stepCircleActive : null,
              isDone ? styles.stepCircleDone : null,
            ]}>
              {isDone
                ? <Text style={styles.stepCheckmark}>✓</Text>
                : <Text style={[styles.stepNumber, isActive ? styles.stepNumberActive : null]}>{stepNum}</Text>
              }
            </View>
            {stepNum < totalSteps && (
              <View style={[styles.stepLine, isDone ? styles.stepLineDone : null]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 1
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [fieldErrors, setFieldErrors] = useState({});

  // Step 2 — CHAUFFEUR
  const [licenseNumber, setLicenseNumber] = useState('');
  const [chauffeurVehicleType, setChauffeurVehicleType] = useState('BERLINE');
  const [vMake, setVMake] = useState('');
  const [vModel, setVModel] = useState('');
  const [vYear, setVYear] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vColor, setVColor] = useState('');

  // Step 2 — LIVREUR
  const [deliveryVehicle, setDeliveryVehicle] = useState('MOTO');
  const [deliveryPlate, setDeliveryPlate] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('');

  // Step 2 — DEPANNEUR
  const [depLicense, setDepLicense] = useState('');
  const [truckType, setTruckType] = useState('PLATEAU');
  const [truckPlate, setTruckPlate] = useState('');
  const [depZone, setDepZone] = useState('');

  // Step 2 — MARCHAND
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('RESTAURANT');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopCity, setShopCity] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const { setUser, setTokens: storeSetTokens } = useAuthStore();

  // CLIENT: 2 steps (base + recap), others: 3 steps (base + role + recap)
  const totalSteps = role === 'CLIENT' ? 2 : 3;

  // ── Validation ──────────────────────────────────────────────────────────────

  function validateStep1() {
    const errors = {};
    if (!name.trim()) errors.name = 'Nom obligatoire';
    if (!phone.trim()) {
      errors.phone = 'Téléphone obligatoire';
    } else if (!/^\+?[0-9]{8,15}$/.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'Numéro invalide (ex: +21612345678)';
    }
    if (!password.trim()) {
      errors.password = 'Mot de passe obligatoire';
    } else if (password.length < 6) {
      errors.password = 'Minimum 6 caractères';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStep2() {
    const errors = {};
    if (role === 'CHAUFFEUR') {
      if (!licenseNumber.trim()) errors.licenseNumber = 'Obligatoire';
      if (!vMake.trim()) errors.vMake = 'Obligatoire';
      if (!vModel.trim()) errors.vModel = 'Obligatoire';
      if (!vYear.trim() || !/^\d{4}$/.test(vYear)) errors.vYear = 'Année invalide (4 chiffres)';
      if (!vPlate.trim()) errors.vPlate = 'Obligatoire';
      if (!vColor.trim()) errors.vColor = 'Obligatoire';
    }
    if (role === 'DEPANNEUR') {
      if (!depLicense.trim()) errors.depLicense = 'Obligatoire';
      if (!truckPlate.trim()) errors.truckPlate = 'Obligatoire';
    }
    if (role === 'MARCHAND') {
      if (!shopName.trim()) errors.shopName = 'Obligatoire';
      if (!shopAddress.trim()) errors.shopAddress = 'Obligatoire';
      if (!shopCity.trim()) errors.shopCity = 'Obligatoire';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Step transitions ────────────────────────────────────────────────────────

  function animateToStep(nextStep) {
    const direction = nextStep > step ? 1 : -1;
    slideAnim.setValue(direction * SCREEN_WIDTH);
    setStep(nextStep);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }

  function handleNext() {
    setFieldErrors({});
    if (step === 1) {
      if (!validateStep1()) return;
      animateToStep(2);
    } else if (step === 2 && role !== 'CLIENT') {
      if (!validateStep2()) return;
      animateToStep(3);
    }
  }

  function handleBack() {
    if (step === 1) {
      navigation.goBack();
    } else {
      animateToStep(step - 1);
    }
  }

  // ── Registration ────────────────────────────────────────────────────────────

  async function handleRegister() {
    setIsLoading(true);
    try {
      // 1. Create user account
      const regRes = await api.post('/api/auth/register', {
        name: name.trim(),
        phone: phone.trim(),
        password,
        role,
      });

      const { user, accessToken, refreshToken } = regRes.data;

      await setTokens(accessToken, refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      storeSetTokens(accessToken, refreshToken);

      // 2. Role-specific follow-up calls
      if (role === 'CHAUFFEUR') {
        try {
          await api.post('/api/vehicles', {
            make: vMake.trim(),
            model: vModel.trim(),
            year: vYear.trim(),
            plate: vPlate.trim(),
            licenseNumber: licenseNumber.trim(),
            vehicleType: chauffeurVehicleType,
          });
        } catch (vErr) {
          console.warn('[RegisterScreen] Vehicle registration failed (non-blocking):', vErr?.response?.data);
        }
        Alert.alert(
          'Compte créé !',
          'En attente de vérification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }

      if (role === 'LIVREUR') {
        Alert.alert(
          'Compte créé !',
          'En attente de vérification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }

      if (role === 'DEPANNEUR') {
        Alert.alert(
          'Compte créé !',
          'En attente de vérification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }

      if (role === 'MARCHAND') {
        try {
          await api.post('/api/merchants/register', {
            name: shopName.trim(),
            category: shopCategory,
            address: shopAddress.trim(),
            phone: shopPhone.trim(),
            lat: 0,
            lng: 0,
          });
        } catch (mErr) {
          console.warn('[RegisterScreen] Merchant registration failed (non-blocking):', mErr?.response?.data);
        }
        Alert.alert(
          'Compte créé !',
          'En attente de vérification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }

      // CLIENT: direct access
      navigation.navigate('Home');
    } catch (error) {
      const message = error.response?.data?.error || "L'inscription a échoué. Veuillez réessayer.";
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Recap helpers ────────────────────────────────────────────────────────────

  function RecapRow({ label, value }) {
    if (!value) return null;
    return (
      <View style={styles.recapRow}>
        <Text style={styles.recapLabel}>{label}</Text>
        <Text style={styles.recapValue}>{value}</Text>
      </View>
    );
  }

  function renderRecapItems() {
    const roleInfo = ROLES.find((r) => r.value === role);
    const roleDisplay = roleInfo ? `${roleInfo.emoji} ${roleInfo.label}` : role;

    const rows = [
      { label: 'Nom', value: name },
      { label: 'Téléphone', value: phone },
      { label: 'Rôle', value: roleDisplay },
    ];

    if (role === 'CHAUFFEUR') {
      const cvInfo = CHAUFFEUR_VEHICLE_TYPES.find((t) => t.value === chauffeurVehicleType);
      rows.push(
        { label: 'Permis', value: licenseNumber },
        { label: 'Type véhicule', value: cvInfo ? `${cvInfo.emoji} ${cvInfo.label}` : chauffeurVehicleType },
        { label: 'Véhicule', value: [vMake, vModel, vYear ? `(${vYear})` : ''].filter(Boolean).join(' ') },
        { label: 'Plaque', value: vPlate },
      );
    }
    if (role === 'LIVREUR') {
      const dvInfo = DELIVERY_VEHICLE_TYPES.find((v) => v.value === deliveryVehicle);
      rows.push({ label: 'Véhicule', value: dvInfo ? `${dvInfo.emoji} ${dvInfo.label}` : deliveryVehicle });
      if (MOTORIZED_DELIVERY.includes(deliveryVehicle) && deliveryPlate) {
        rows.push({ label: 'Plaque', value: deliveryPlate });
      }
      if (deliveryZone) rows.push({ label: 'Zone', value: deliveryZone });
    }
    if (role === 'DEPANNEUR') {
      const ttInfo = TRUCK_TYPES.find((t) => t.value === truckType);
      rows.push(
        { label: 'Permis', value: depLicense },
        { label: 'Camion', value: ttInfo ? `${ttInfo.emoji} ${ttInfo.label}` : truckType },
        { label: 'Plaque camion', value: truckPlate },
      );
      if (depZone) rows.push({ label: 'Zone', value: depZone });
    }
    if (role === 'MARCHAND') {
      const catInfo = MERCHANT_CATEGORIES.find((c) => c.value === shopCategory);
      rows.push(
        { label: 'Boutique', value: shopName },
        { label: 'Catégorie', value: catInfo ? `${catInfo.emoji} ${catInfo.label}` : shopCategory },
        { label: 'Adresse', value: shopAddress },
      );
      if (shopPhone) rows.push({ label: 'Tél. boutique', value: shopPhone });
    }

    return rows.map((row, idx) => <RecapRow key={idx} label={row.label} value={row.value} />);
  }

  // ── Step renderers ──────────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <View>
        <Text style={styles.stepTitle}>Informations de base</Text>
        <Text style={styles.stepSubtitle}>Créez votre compte EASYWAY</Text>

        <InputField
          label="Nom complet"
          required
          placeholder="Votre nom et prénom"
          value={name}
          onChangeText={(v) => { setName(v); setFieldErrors((e) => ({ ...e, name: undefined })); }}
          error={fieldErrors.name}
          editable={!isLoading}
        />

        <InputField
          label="Téléphone"
          required
          placeholder="+216 XX XXX XXX"
          value={phone}
          onChangeText={(v) => { setPhone(v); setFieldErrors((e) => ({ ...e, phone: undefined })); }}
          keyboardType="phone-pad"
          error={fieldErrors.phone}
          editable={!isLoading}
        />

        <InputField
          label="Mot de passe"
          required
          placeholder="Minimum 6 caractères"
          value={password}
          onChangeText={(v) => { setPassword(v); setFieldErrors((e) => ({ ...e, password: undefined })); }}
          secureTextEntry
          error={fieldErrors.password}
          editable={!isLoading}
        />

        <OptionSelector
          label="Rôle"
          required
          options={ROLES}
          value={role}
          onChange={(v) => { setRole(v); setFieldErrors({}); }}
          disabled={isLoading}
        />
      </View>
    );
  }

  function renderStep2() {
    if (role === 'CHAUFFEUR') {
      return (
        <View>
          <Text style={styles.stepTitle}>Infos chauffeur</Text>
          <Text style={styles.stepSubtitle}>Votre permis et votre véhicule</Text>

          <InputField
            label="Numéro de permis de conduire"
            required
            placeholder="Ex: 12345678"
            value={licenseNumber}
            onChangeText={(v) => { setLicenseNumber(v); setFieldErrors((e) => ({ ...e, licenseNumber: undefined })); }}
            error={fieldErrors.licenseNumber}
            editable={!isLoading}
          />

          <OptionSelector
            label="Type de véhicule"
            options={CHAUFFEUR_VEHICLE_TYPES}
            value={chauffeurVehicleType}
            onChange={setChauffeurVehicleType}
            disabled={isLoading}
          />

          <InputField
            label="Marque du véhicule"
            required
            placeholder="Ex: Toyota"
            value={vMake}
            onChangeText={(v) => { setVMake(v); setFieldErrors((e) => ({ ...e, vMake: undefined })); }}
            error={fieldErrors.vMake}
            editable={!isLoading}
          />
          <InputField
            label="Modèle"
            required
            placeholder="Ex: Corolla"
            value={vModel}
            onChangeText={(v) => { setVModel(v); setFieldErrors((e) => ({ ...e, vModel: undefined })); }}
            error={fieldErrors.vModel}
            editable={!isLoading}
          />
          <InputField
            label="Année"
            required
            placeholder="Ex: 2020"
            value={vYear}
            onChangeText={(v) => { setVYear(v); setFieldErrors((e) => ({ ...e, vYear: undefined })); }}
            keyboardType="numeric"
            maxLength={4}
            error={fieldErrors.vYear}
            editable={!isLoading}
          />
          <InputField
            label="Plaque d'immatriculation"
            required
            placeholder="Ex: 123 TUN 4567"
            value={vPlate}
            onChangeText={(v) => { setVPlate(v); setFieldErrors((e) => ({ ...e, vPlate: undefined })); }}
            autoCapitalize="characters"
            error={fieldErrors.vPlate}
            editable={!isLoading}
          />

          <KycNote text="📋 Vos documents seront vérifiés sous 24h" />
        </View>
      );
    }

    if (role === 'LIVREUR') {
      return (
        <View>
          <Text style={styles.stepTitle}>Infos livreur</Text>
          <Text style={styles.stepSubtitle}>Votre véhicule de livraison</Text>

          <OptionSelector
            label="Type de véhicule"
            options={DELIVERY_VEHICLE_TYPES}
            value={deliveryVehicle}
            onChange={setDeliveryVehicle}
            disabled={isLoading}
          />

          {MOTORIZED_DELIVERY.includes(deliveryVehicle) && (
            <InputField
              label="Plaque d'immatriculation"
              placeholder="Ex: 123 TUN 4567"
              value={deliveryPlate}
              onChangeText={setDeliveryPlate}
              autoCapitalize="characters"
              editable={!isLoading}
            />
          )}

          <InputField
            label="Zone de livraison"
            placeholder="Ex: Tunis Centre, La Marsa"
            value={deliveryZone}
            onChangeText={setDeliveryZone}
            editable={!isLoading}
          />

          <KycNote text="📋 Vérification sous 24h" />
        </View>
      );
    }

    if (role === 'DEPANNEUR') {
      return (
        <View>
          <Text style={styles.stepTitle}>Infos dépanneur</Text>
          <Text style={styles.stepSubtitle}>Votre camion de dépannage</Text>

          <InputField
            label="Numéro de permis de conduire"
            required
            placeholder="Ex: 12345678"
            value={depLicense}
            onChangeText={(v) => { setDepLicense(v); setFieldErrors((e) => ({ ...e, depLicense: undefined })); }}
            error={fieldErrors.depLicense}
            editable={!isLoading}
          />

          <OptionSelector
            label="Type de camion"
            options={TRUCK_TYPES}
            value={truckType}
            onChange={setTruckType}
            disabled={isLoading}
          />

          <InputField
            label="Plaque camion"
            required
            placeholder="Ex: 456 TUN 7890"
            value={truckPlate}
            onChangeText={(v) => { setTruckPlate(v); setFieldErrors((e) => ({ ...e, truckPlate: undefined })); }}
            autoCapitalize="characters"
            error={fieldErrors.truckPlate}
            editable={!isLoading}
          />

          <InputField
            label="Zone d'intervention"
            placeholder="Ex: Grand Tunis, Ariana"
            value={depZone}
            onChangeText={setDepZone}
            editable={!isLoading}
          />

          <KycNote text="📋 Vérification sous 24h" />
        </View>
      );
    }

    if (role === 'MARCHAND') {
      return (
        <View>
          <Text style={styles.stepTitle}>Infos boutique</Text>
          <Text style={styles.stepSubtitle}>Votre établissement commercial</Text>

          <InputField
            label="Nom de la boutique"
            required
            placeholder="Ex: Pizza Express"
            value={shopName}
            onChangeText={(v) => { setShopName(v); setFieldErrors((e) => ({ ...e, shopName: undefined })); }}
            error={fieldErrors.shopName}
            editable={!isLoading}
          />

          <OptionSelector
            label="Catégorie"
            required
            options={MERCHANT_CATEGORIES}
            value={shopCategory}
            onChange={setShopCategory}
            disabled={isLoading}
          />

          <InputField
            label="Adresse de la boutique"
            required
            placeholder="Numéro, rue, ville"
            value={shopAddress}
            onChangeText={(v) => { setShopAddress(v); setFieldErrors((e) => ({ ...e, shopAddress: undefined })); }}
            error={fieldErrors.shopAddress}
            editable={!isLoading}
          />

          <InputField
            label="Téléphone boutique"
            placeholder="Ex: +216 XX XXX XXX"
            value={shopPhone}
            onChangeText={setShopPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
          />

          <KycNote text="📷 Vous pourrez ajouter vos produits après validation" />
        </View>
      );
    }

    return null;
  }

  function renderRecapStep() {
    return (
      <View>
        <Text style={styles.stepTitle}>Récapitulatif</Text>
        <Text style={styles.stepSubtitle}>Vérifiez vos informations avant de valider</Text>

        <View style={styles.recapCard}>
          {renderRecapItems()}
        </View>

        {(role === 'CHAUFFEUR' || role === 'LIVREUR' || role === 'DEPANNEUR') && (
          <KycNote text="Votre compte sera activé après validation KYC par notre équipe (24-48h)." />
        )}
        {role === 'MARCHAND' && (
          <KycNote text="Votre boutique sera activée après vérification de nos équipes." />
        )}

        <TouchableOpacity
          style={[styles.primaryButton, isLoading ? styles.buttonDisabled : null]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color={COLORS.background} />
            : <Text style={styles.primaryButtonText}>S'inscrire ✓</Text>
          }
        </TouchableOpacity>
      </View>
    );
  }

  const isRecapStep = (role === 'CLIENT' && step === 2) || (role !== 'CLIENT' && step === 3);

  function renderCurrentStep() {
    if (step === 1) return renderStep1();
    if (isRecapStep) return renderRecapStep();
    return renderStep2();
  }

  const stepLabels = ['Infos de base', ...(role !== 'CLIENT' ? ['Infos métier'] : []), 'Récapitulatif'];
  const currentLabel = stepLabels[step - 1] || '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Créer un compte</Text>
          <Text style={styles.headerSub}>{currentLabel}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Visual stepper */}
      <Stepper currentStep={step} totalSteps={totalSteps} />

      {/* Scrollable form */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <View style={styles.formCard}>
            {renderCurrentStep()}

            {/* Next button — hidden on recap step (has its own submit btn) */}
            {!isRecapStep && (
              <TouchableOpacity
                style={[styles.primaryButton, isLoading ? styles.buttonDisabled : null]}
                onPress={handleNext}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {role === 'CLIENT' && step === 1 ? 'Voir le récapitulatif →' : 'Suivant →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Déjà un compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  backBtnText: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontWeight: '800', fontSize: 18 },
  headerSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  headerRight: { width: 40 },

  // ── Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  stepCircleDone: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  stepNumber: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  stepNumberActive: { color: COLORS.primary },
  stepCheckmark: { color: COLORS.background, fontSize: 14, fontWeight: '800' },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: COLORS.primary },

  // ── Scroll
  scrollContent: { padding: 16, paddingBottom: 48 },

  // ── Form card
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  stepTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  stepSubtitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: 20 },

  // ── Fields
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: { borderColor: COLORS.error },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },

  // ── Options
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionBtnSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  optionEmoji: { fontSize: 20, marginBottom: 4 },
  optionLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  optionLabelSelected: { color: COLORS.primary },

  // ── KYC note
  kycNote: {
    flexDirection: 'row',
    backgroundColor: '#1A1508',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3A2A08',
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'flex-start',
    gap: 8,
  },
  kycNoteIcon: { fontSize: 16 },
  kycNoteText: { color: '#D4A017', fontSize: 12, flex: 1, lineHeight: 18 },

  // ── Recap
  recapCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recapLabel: { color: COLORS.textMuted, fontSize: 13 },
  recapValue: { color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  // ── Buttons
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: COLORS.background, fontWeight: '800', fontSize: 16 },

  // ── Login link
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  loginText: { color: COLORS.textMuted, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
