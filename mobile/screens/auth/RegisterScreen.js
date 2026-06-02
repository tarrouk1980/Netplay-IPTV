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
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import api, { setTokens } from '../../services/api';
import useAuthStore from '../../store/authStore';
import ServiceIcon from '../../components/ServiceIcon';

async function uploadKycPhotos(accessToken, photos) {
  try {
    const formData = new FormData();
    if (photos.facePhoto) {
      const uri = photos.facePhoto;
      const ext = uri.split('.').pop() || 'jpg';
      formData.append('facePhoto', { uri, name: `facePhoto.${ext}`, type: `image/${ext}` });
    }
    if (photos.truckPhoto) {
      const uri = photos.truckPhoto;
      const ext = uri.split('.').pop() || 'jpg';
      formData.append('truckPhoto', { uri, name: `truckPhoto.${ext}`, type: `image/${ext}` });
    }
    const baseURL = api.defaults.baseURL || '';
    await axios.post(`${baseURL}/api/auth/kyc-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('[RegisterScreen] KYC photos uploaded successfully');
  } catch (err) {
    console.warn('[RegisterScreen] KYC photo upload failed (non-blocking):', err?.message);
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COUNTRY_CODES = [
  { flag: '🇹🇳', code: '+216', key: 'TN', label: 'Tunisie' },
  { flag: '🇩🇿', code: '+213', key: 'DZ', label: 'Algérie' },
  { flag: '🇲🇦', code: '+212', key: 'MA', label: 'Maroc' },
  { flag: '🇱🇾', code: '+218', key: 'LY', label: 'Libye' },
  { flag: '🇲🇷', code: '+222', key: 'MR', label: 'Mauritanie' },
  { flag: '🇫🇷', code: '+33',  key: 'FR', label: 'France' },
  { flag: '🇸🇦', code: '+966', key: 'SA', label: 'Arabie Saoudite' },
];

const ZONES_BY_COUNTRY = {
  TN: [
    'Ariana','Béja','Ben Arous','Bizerte','Gabès','Gafsa','Jendouba','Kairouan',
    'Kasserine','Kébili','Kef','Mahdia','Manouba','Médenine','Monastir','Nabeul',
    'Sfax','Sidi Bouzid','Siliana','Sousse','Tataouine','Tozeur','Tunis','Zaghouan',
  ],
  DZ: [
    'Adrar','Aïn Défla','Aïn Témouchent','Alger','Annaba','Batna','Béchar','Béjaïa',
    'Biskra','Blida','Bordj Bou Arréridj','Bouira','Boumerdès','Chlef','Constantine',
    'Djelfa','El Bayadh','El Oued','El Tarf','Ghardaïa','Guelma','Illizi','Jijel',
    'Khenchela','Laghouat','Mascara','Médéa','Mila','Mostaganem','Msila','Naâma',
    'Oran','Ouargla','Oum El Bouaghi','Relizane','Saïda','Sétif','Sidi Bel Abbès',
    'Skikda','Souk Ahras','Tamanrasset','Tébessa','Tiaret','Tindouf','Tipaza',
    'Tissemsilt','Tizi Ouzou','Tlemcen','Bordj Badji Mokhtar','Béni Abbès',
    'Timimoun','Ouled Djellal','Touggourt','Djanet','In Salah','In Guezzam',
    'El Meniaa','Oran 2',
  ],
  MA: [
    'Tanger-Tétouan-Al Hoceïma','Oriental','Fès-Meknès','Rabat-Salé-Kénitra',
    'Béni Mellal-Khénifra','Casablanca-Settat','Marrakech-Safi',
    'Drâa-Tafilalet','Souss-Massa','Guelmim-Oued Noun',
    'Laâyoune-Sakia El Hamra','Dakhla-Oued Ed-Dahab',
  ],
  LY: [
    'Tripoli','Benghazi','Misrata','Al Bayda','Surt','Sebha','Zintan','Zawiya',
    'Zliten','Derna','Tobruk','Al Jufra','Al Kufra','Al Marj','Al Wahat',
    'Ghat','Jabal al Akhdar','Jabal al Gharbi','Murzuq','Nalut','Nuqat al Khams','Wadi al Hayaa',
  ],
  MR: [
    'Adrar','Assaba','Brakna','Dakhlet Nouadhibou','Gorgol','Guidimaka',
    'Hodh Ech Chargui','Hodh El Gharbi','Inchiri','Lagouira','Nouakchott-Nord',
    'Nouakchott-Ouest','Nouakchott-Sud','Tagant','Tiris Zemmour','Trarza',
  ],
  FR: ['Île-de-France','Provence-Alpes-Côte d\'Azur','Occitanie','Hauts-de-France','Auvergne-Rhône-Alpes','Bretagne','Normandie','Pays de la Loire','Centre-Val de Loire','Bourgogne-Franche-Comté','Grand Est','Nouvelle-Aquitaine'],
  SA: ['Riyad','La Mecque','Médine','Al-Qassim','Hail','Tabuk','Asir','Jizan','Najran','Al Jouf','Al-Bahah','Frontière du Nord','Frontière de l\'Est'],
};

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
  { value: 'CLIENT', label: 'Client', svgKey: 'CLIENT' },
  { value: 'CHAUFFEUR', label: 'Chauffeur', svgKey: 'EASYTAXY' },
  { value: 'LIVREUR', label: 'Livreur', svgKey: 'DELIVERY' },
  { value: 'DEPANNEUR', label: 'Dépanneur', svgKey: 'SOS' },
  { value: 'MARCHAND', label: 'Marchand', svgKey: 'GROCERY' },
];

const CHAUFFEUR_VEHICLE_TYPES = [
  { value: 'BERLINE', label: 'Berline', svgKey: 'VEHICLE_BERLINE' },
  { value: 'SUV', label: 'SUV', svgKey: 'VEHICLE_SUV' },
  { value: 'MINIVAN', label: 'Minivan', svgKey: 'VEHICLE_MINIVAN' },
  { value: 'MOTO', label: 'Moto', svgKey: 'VEHICLE_MOTO' },
];

const SEAT_OPTIONS = ['2', '3', '4', '5', '6', '7', '8'];
const DRIVER_GENDER_OPTIONS = [
  { value: 'MALE', label: 'Homme', emoji: '👨' },
  { value: 'FEMALE', label: 'Femme', emoji: '👩' },
];

const BRANDS_MODELS = {
  'Volkswagen': ['Golf','Polo','Passat','Tiguan','T-Roc','Caddy','Transporter','Autre'],
  'Renault': ['Clio','Megane','Scenic','Kadjar','Captur','Duster','Symbol','Logan','Sandero','Kangoo','Autre'],
  'Peugeot': ['208','308','508','2008','3008','5008','Partner','Autre'],
  'Citroën': ['C3','C4','C5','Berlingo','C-Elysée','Autre'],
  'Ford': ['Fiesta','Focus','Kuga','Transit','Ranger','Autre'],
  'Toyota': ['Yaris','Corolla','Camry','RAV4','Hilux','Land Cruiser','Fortuner','Innova','Autre'],
  'Hyundai': ['i10','i20','i30','Tucson','Santa Fe','Elantra','Accent','Autre'],
  'Kia': ['Picanto','Rio','Sportage','Sorento','Seltos','Autre'],
  'Seat': ['Ibiza','Leon','Arona','Ateca','Autre'],
  'Skoda': ['Fabia','Octavia','Superb','Karoq','Autre'],
  'BMW': ['Série 1','Série 3','Série 5','X1','X3','X5','Autre'],
  'Mercedes': ['Classe A','Classe C','Classe E','GLA','GLC','Sprinter','Autre'],
  'Audi': ['A1','A3','A4','A6','Q3','Q5','Autre'],
  'Fiat': ['500','Punto','Tipo','Doblo','Ducato','Autre'],
  'Dacia': ['Sandero','Logan','Duster','Spring','Lodgy','Autre'],
  'Autre': ['Autre'],
};
const VEHICLE_BRANDS = Object.keys(BRANDS_MODELS);
const VEHICLE_YEARS = Array.from({ length: 26 }, (_, i) => String(2025 - i));
const CAR_COLORS = ['Blanc','Noir','Gris','Argent','Rouge','Bleu','Vert','Beige','Marron','Jaune','Orange','Autre'];

const DELIVERY_VEHICLE_TYPES = [
  { value: 'MOTO', label: 'Moto', svgKey: 'VEHICLE_MOTO' },
  { value: 'SCOOTER', label: 'Scooter', svgKey: 'VEHICLE_MOTO' },
  { value: 'VELO', label: 'Vélo', svgKey: 'DELIV_VELO' },
  { value: 'APIED', label: 'À pied', svgKey: 'DELIV_APIED' },
  { value: 'VOITURE', label: 'Voiture', svgKey: 'VEHICLE_BERLINE' },
];

const MOTORIZED_DELIVERY = ['MOTO', 'SCOOTER', 'VOITURE'];

const TRUCK_TYPES = [
  { value: 'PLATEAU',    label: 'Plateau',     svgKey: 'TRUCK_PLATEAU' },
  { value: 'LEVE_ROUE',  label: 'Lève-roue',   svgKey: 'TRUCK_LEVE_ROUE' },
  { value: 'CROCHET',    label: 'Crochet/Chaîne', svgKey: 'TRUCK_CROCHET' },
  { value: 'GRUE',       label: 'Grue',         svgKey: 'TRUCK_GRUE' },
  { value: 'PANIER',     label: 'Panier',       svgKey: 'TRUCK_PANIER' },
];

const MERCHANT_CATEGORIES = [
  { value: 'RESTAURANT', label: 'Restaurant', emoji: '🍕', svgKey: 'RESTAURANT' },
  { value: 'PHARMACY', label: 'Pharmacie', emoji: '💊', svgKey: 'PHARMACY' },
  { value: 'SUPERMARKET', label: 'Supermarché', emoji: '🛒', svgKey: 'SUPERMARKET' },
  { value: 'BEAUTY', label: 'Beauté', emoji: '💄', svgKey: 'BEAUTY' },
  { value: 'PETS', label: 'Animalerie', emoji: '🐾', svgKey: 'PETS' },
  { value: 'HIGHTECH', label: 'High-Tech', emoji: '💻', svgKey: 'HIGHTECH' },
  { value: 'ELECTRO', label: 'Électroménager', emoji: '⚡', svgKey: 'ELECTRO' },
  { value: 'OTHER', label: 'Autre', emoji: '📦' },
];

// ─── Reusable sub-components ──────────────────────────────────────────────────

function MultiPickerField({ label, required, selected, options, onToggle, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const displayText = selected.length > 0 ? selected.join(', ') : null;
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}{required ? <Text style={{ color: COLORS.primary }}> *</Text> : null}</Text>
      <TouchableOpacity
        style={[styles.pickerBtn, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[displayText ? styles.pickerBtnText : styles.pickerBtnPlaceholder, { flex: 1, marginRight: 8 }]} numberOfLines={2}>
          {displayText || placeholder || 'Sélectionner...'}
        </Text>
        <Text style={{ color: COLORS.primary, fontSize: 16 }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={pickerStyles.sheet}>
            <View style={pickerStyles.handle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 }}>
              <Text style={pickerStyles.title}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 14 }}>OK ({selected.length})</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={pickerStyles.scroll} showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[pickerStyles.option, isSelected && pickerStyles.optionSelected]}
                    onPress={() => onToggle(opt)}
                  >
                    <Text style={[pickerStyles.optionText, isSelected && { color: COLORS.primary, fontWeight: '700' }]}>{opt}</Text>
                    {isSelected && <Text style={{ color: COLORS.primary }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function PickerField({ label, required, value, options, onSelect, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}{required ? <Text style={{ color: COLORS.primary }}> *</Text> : null}</Text>
      <TouchableOpacity
        style={[styles.pickerBtn, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={value ? styles.pickerBtnText : styles.pickerBtnPlaceholder}>
          {value || placeholder || 'Sélectionner...'}
        </Text>
        <Text style={{ color: COLORS.primary, fontSize: 16 }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={pickerStyles.sheet}>
            <View style={pickerStyles.handle} />
            <Text style={pickerStyles.title}>{label}</Text>
            <ScrollView style={pickerStyles.scroll} showsVerticalScrollIndicator={false}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[pickerStyles.option, value === opt && pickerStyles.optionSelected]}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                >
                  <Text style={[pickerStyles.optionText, value === opt && { color: COLORS.primary, fontWeight: '700' }]}>{opt}</Text>
                  {value === opt && <Text style={{ color: COLORS.primary }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1C1C28', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '65%', paddingBottom: 32 },
  handle: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  title: { color: '#8E8E9A', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, paddingBottom: 8 },
  scroll: { paddingHorizontal: 20 },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2C2C3E', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionSelected: { },
  optionText: { color: '#FFFFFF', fontSize: 16 },
});

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
            {opt.svgKey ? (
              <ServiceIcon service={opt.svgKey} size={28} />
            ) : (
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            )}
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
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
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
  const [chauffeurZones, setChauffeurZones] = useState([]);
  const [chauffeurFacePhoto, setChauffeurFacePhoto] = useState(null);
  const [vSeats, setVSeats] = useState('4');
  const [driverGender, setDriverGender] = useState('');
  const [isEasyLady, setIsEasyLady] = useState(false);
  const [isPMR, setIsPMR] = useState(false);
  const [pmrPhoto, setPmrPhoto] = useState(null);

  // Step 2 — LIVREUR
  const [deliveryVehicle, setDeliveryVehicle] = useState('MOTO');
  const [deliveryPlate, setDeliveryPlate] = useState('');
  const [deliveryZones, setDeliveryZones] = useState([]);

  // Step 2 — DEPANNEUR
  const [depLicense, setDepLicense] = useState('');
  const [truckType, setTruckType] = useState('PLATEAU');
  const [truckPlate, setTruckPlate] = useState('');
  const [depZones, setDepZones] = useState([]);
  const [depPhoto, setDepPhoto] = useState(null);
  const [depFacePhoto, setDepFacePhoto] = useState(null);

  // Step 2 — MARCHAND
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('RESTAURANT');
  const [shopAddress, setShopAddress] = useState('');
  const [shopGov, setShopGov] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopPhoneCountry, setShopPhoneCountry] = useState(COUNTRY_CODES[0]);
  const [shopPhonePickerOpen, setShopPhonePickerOpen] = useState(false);
  const [shopCity, setShopCity] = useState('');
  const [shopLogo, setShopLogo] = useState(null);

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

  // ── Alert-based step validation ─────────────────────────────────────────────

  function validateStep() {
    // Step 1 — infos de base
    if (step === 1) {
      if (!name.trim() || name.trim().length < 2) {
        Alert.alert('Erreur', 'Le nom doit contenir au moins 2 caractères.');
        return false;
      }
      const phoneClean = phone.replace(/\s/g, '').replace(/^0+/, '');
      if (phoneClean.length < 6 || phoneClean.length > 15 || !/^\d+$/.test(phoneClean)) {
        Alert.alert('Erreur', 'Numéro de téléphone invalide (6 à 15 chiffres).');
        return false;
      }
      if (password.length < 8) {
        Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
        return false;
      }
    }
    // Step 2 — rôle (only for CLIENT going to recap, as role is on step 1 for non-CLIENT)
    if (step === 1 && !role) {
      Alert.alert('Erreur', 'Veuillez choisir un rôle.');
      return false;
    }
    return true;
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
    if (!validateStep()) return;
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

  // ── Photo picker ───────────────────────────────────────────────────────────

  async function pickPhoto(onDone, aspect = [4, 3]) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie dans les paramètres.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      onDone(result.assets[0].uri);
    }
  }

  async function takePhoto(onDone, aspect = [1, 1]) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra dans les paramètres.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      onDone(result.assets[0].uri);
    }
  }

  function FacePhotoField({ value, onSet, disabled }) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Photo de visage (selfie) <Text style={{ color: COLORS.primary }}>*</Text></Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 8 }}>
          Photo claire de votre visage pour vérification d'identité
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={[styles.photoBtn, { flex: 1, height: 120 }]}
            onPress={() => takePhoto(onSet, [1, 1])}
            disabled={disabled}
          >
            {value ? (
              <Image source={{ uri: value }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={{ fontSize: 28 }}>📸</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4 }}>Prendre un selfie</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.photoBtn, { flex: 1, height: 120 }]}
            onPress={() => pickPhoto(onSet, [1, 1])}
            disabled={disabled}
          >
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 28 }}>🖼️</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4 }}>Depuis galerie</Text>
            </View>
          </TouchableOpacity>
        </View>
        {value && (
          <TouchableOpacity onPress={() => onSet(null)} style={{ marginTop: 6, alignSelf: 'flex-end' }}>
            <Text style={{ color: COLORS.error, fontSize: 12 }}>✕ Supprimer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
        // Upload KYC face photo (non-blocking)
        if (chauffeurFacePhoto) {
          uploadKycPhotos(accessToken, { facePhoto: chauffeurFacePhoto });
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
        // Upload KYC photos for DEPANNEUR (non-blocking)
        if (depFacePhoto || depPhoto) {
          uploadKycPhotos(accessToken, { facePhoto: depFacePhoto, truckPhoto: depPhoto });
        }
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
        { label: 'Type véhicule', value: cvInfo ? cvInfo.label : chauffeurVehicleType },
        { label: 'Véhicule', value: [vMake, vModel, vYear ? `(${vYear})` : ''].filter(Boolean).join(' ') },
        { label: 'Plaque', value: vPlate },
      );
      if (chauffeurZones.length > 0) rows.push({ label: 'Zones', value: chauffeurZones.join(', ') });
    }
    if (role === 'LIVREUR') {
      const dvInfo = DELIVERY_VEHICLE_TYPES.find((v) => v.value === deliveryVehicle);
      rows.push({ label: 'Véhicule', value: dvInfo ? dvInfo.label : deliveryVehicle });
      if (MOTORIZED_DELIVERY.includes(deliveryVehicle) && deliveryPlate) {
        rows.push({ label: 'Plaque', value: deliveryPlate });
      }
      if (deliveryZones.length > 0) rows.push({ label: 'Zones', value: deliveryZones.join(', ') });
    }
    if (role === 'DEPANNEUR') {
      const ttInfo = TRUCK_TYPES.find((t) => t.value === truckType);
      rows.push(
        { label: 'Permis', value: depLicense },
        { label: 'Camion', value: ttInfo ? `${ttInfo.emoji} ${ttInfo.label}` : truckType },
        { label: 'Plaque camion', value: truckPlate },
      );
      if (depZones.length > 0) rows.push({ label: 'Zones', value: depZones.join(', ') });
    }
    if (role === 'MARCHAND') {
      const catInfo = MERCHANT_CATEGORIES.find((c) => c.value === shopCategory);
      rows.push(
        { label: 'Boutique', value: shopName },
        { label: 'Catégorie', value: catInfo ? `${catInfo.emoji} ${catInfo.label}` : shopCategory },
        { label: 'Gouvernorat', value: shopGov },
        { label: 'Adresse', value: shopAddress },
      );
      if (shopPhone) rows.push({ label: 'Tél. boutique', value: `${shopPhoneCountry.code} ${shopPhone}` });
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Téléphone <Text style={{ color: COLORS.primary }}>*</Text></Text>
          <View style={[styles.phoneRow, fieldErrors.phone ? styles.inputError : null]}>
            <TouchableOpacity
              style={styles.countryPicker}
              onPress={() => setCountryPickerOpen(true)}
            >
              <Modal visible={countryPickerOpen} transparent animationType="slide" onRequestClose={() => setCountryPickerOpen(false)}>
                <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={() => setCountryPickerOpen(false)}>
                  <View style={pickerStyles.sheet}>
                    <View style={pickerStyles.handle} />
                    <Text style={pickerStyles.title}>Indicatif pays</Text>
                    <ScrollView style={pickerStyles.scroll} showsVerticalScrollIndicator={false}>
                      {COUNTRY_CODES.map((c) => (
                        <TouchableOpacity
                          key={c.key}
                          style={[pickerStyles.option, selectedCountry.key === c.key && pickerStyles.optionSelected]}
                          onPress={() => { setSelectedCountry(c); setCountryPickerOpen(false); }}
                        >
                          <Text style={[pickerStyles.optionText, selectedCountry.key === c.key && { color: COLORS.primary, fontWeight: '700' }]}>
                            {c.flag}  {c.code}  {c.label}
                          </Text>
                          {selectedCountry.key === c.key && <Text style={{ color: COLORS.primary }}>✓</Text>}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              </Modal>
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Text style={styles.countryChevron}>▼</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="XX XXX XXX"
              placeholderTextColor={COLORS.textMuted}
              value={phone}
              onChangeText={(v) => { setPhone(v); setFieldErrors((e) => ({ ...e, phone: undefined })); }}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
          {fieldErrors.phone ? <Text style={styles.errorText}>{fieldErrors.phone}</Text> : null}
        </View>

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

          <PickerField
            label="Marque du véhicule"
            required
            value={vMake}
            options={VEHICLE_BRANDS}
            onSelect={(v) => { setVMake(v); setVModel(''); setFieldErrors((e) => ({ ...e, vMake: undefined })); }}
            placeholder="Choisir une marque..."
            disabled={isLoading}
          />
          <PickerField
            label="Modèle"
            required
            value={vModel}
            options={vMake ? (BRANDS_MODELS[vMake] || ['Autre']) : ['Choisissez d\'abord une marque']}
            onSelect={(v) => { setVModel(v); setFieldErrors((e) => ({ ...e, vModel: undefined })); }}
            placeholder="Choisir un modèle..."
            disabled={isLoading || !vMake}
          />
          <PickerField
            label="Année"
            required
            value={vYear}
            options={VEHICLE_YEARS}
            onSelect={(v) => { setVYear(v); setFieldErrors((e) => ({ ...e, vYear: undefined })); }}
            placeholder="Choisir l'année..."
            disabled={isLoading}
          />
          <PickerField
            label="Couleur du véhicule"
            required
            value={vColor}
            options={CAR_COLORS}
            onSelect={(v) => { setVColor(v); setFieldErrors((e) => ({ ...e, vColor: undefined })); }}
            placeholder="Choisir une couleur..."
            disabled={isLoading}
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

          <PickerField
            label="Nombre de places passagers"
            required
            value={vSeats}
            options={SEAT_OPTIONS}
            onSelect={setVSeats}
            placeholder="Sélectionner..."
            disabled={isLoading}
          />

          <MultiPickerField
            label="Zone légale d'opération"
            required
            selected={chauffeurZones}
            options={ZONES_BY_COUNTRY[selectedCountry.key] || ZONES_BY_COUNTRY['TN']}
            onToggle={(z) => setChauffeurZones((prev) => prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z])}
            placeholder="Gouvernorats autorisés..."
            disabled={isLoading}
          />

          {/* Genre du chauffeur */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Votre genre <Text style={{ color: COLORS.primary }}>*</Text></Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {DRIVER_GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.toggleBtn, { flex: 1 }, driverGender === opt.value && styles.toggleBtnActive]}
                  onPress={() => {
                    setDriverGender(opt.value);
                    setIsEasyLady(false);
                  }}
                  disabled={isLoading}
                >
                  <Text style={{ fontSize: 24 }}>{opt.emoji}</Text>
                  <Text style={[styles.toggleBtnText, driverGender === opt.value && styles.toggleBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Si femme → option EasyLady */}
            {driverGender === 'FEMALE' && (
              <TouchableOpacity
                style={[styles.radioRow, { marginTop: 12 }, isEasyLady && styles.radioRowSelected]}
                onPress={() => setIsEasyLady((v) => !v)}
                disabled={isLoading}
              >
                <View style={[styles.radioCircle, isEasyLady && styles.radioCircleSelected]}>
                  {isEasyLady && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.radioLabel}>👩 Rejoindre le programme EasyLady</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>
                    Vous serez visible pour les clientes qui préfèrent une conductrice. Vous restez libre d'accepter tous les passagers.
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {isEasyLady && (
              <View style={styles.easyLadyBadge}>
                <Text style={styles.easyLadyText}>✅ Programme EasyLady activé — les clientes qui préfèrent une conductrice pourront vous trouver.</Text>
              </View>
            )}
          </View>

          {/* Véhicule adapté PMR */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Véhicule adapté PMR (personnes à mobilité réduite) ?</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.toggleBtn, isPMR && styles.toggleBtnActive]}
                onPress={() => setIsPMR(true)}
                disabled={isLoading}
              >
                <Text style={[styles.toggleBtnText, isPMR && styles.toggleBtnTextActive]}>♿ Oui, EasyAccess</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !isPMR && styles.toggleBtnActive]}
                onPress={() => { setIsPMR(false); setPmrPhoto(null); }}
                disabled={isLoading}
              >
                <Text style={[styles.toggleBtnText, !isPMR && styles.toggleBtnTextActive]}>Non</Text>
              </TouchableOpacity>
            </View>
            {isPMR && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 8 }}>
                  Photo de preuve : rampe d'accès, espace fauteuil roulant, etc.
                </Text>
                <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(setPmrPhoto, [4, 3])} disabled={isLoading}>
                  {pmrPhoto ? (
                    <Image source={{ uri: pmrPhoto }} style={styles.photoPreview} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Text style={{ fontSize: 28 }}>♿</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 6 }}>Photo de l'aménagement PMR</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <FacePhotoField
            value={chauffeurFacePhoto}
            onSet={setChauffeurFacePhoto}
            disabled={isLoading}
          />

          <KycNote text="📋 Vos documents seront vérifiés sous 24h — la zone doit correspondre à votre autorisation de taxi" />
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

          <MultiPickerField
            label="Zones de livraison"
            selected={deliveryZones}
            options={ZONES_BY_COUNTRY[selectedCountry.key] || ZONES_BY_COUNTRY['TN']}
            onToggle={(z) => setDeliveryZones((prev) => prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z])}
            placeholder="Sélectionner vos zones..."
            disabled={isLoading}
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

          <MultiPickerField
            label="Zones d'intervention"
            selected={depZones}
            options={ZONES_BY_COUNTRY[selectedCountry.key] || ZONES_BY_COUNTRY['TN']}
            onToggle={(z) => setDepZones((prev) => prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z])}
            placeholder="Sélectionner vos zones..."
            disabled={isLoading}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Photo du camion <Text style={{ color: COLORS.primary }}>*</Text></Text>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(setDepPhoto, [4, 3])} disabled={isLoading}>
              {depPhoto ? (
                <Image source={{ uri: depPhoto }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={{ fontSize: 32 }}>🚛</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 6 }}>Photo du camion</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>Camion + plaque visible</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <FacePhotoField
            value={depFacePhoto}
            onSet={setDepFacePhoto}
            disabled={isLoading}
          />

          <KycNote text="📋 Vérification sous 24h — photo du camion et photo de visage obligatoires" />
        </View>
      );
    }

    if (role === 'MARCHAND') {
      return (
        <View>
          <Text style={styles.stepTitle}>Infos boutique</Text>
          <Text style={styles.stepSubtitle}>Votre établissement commercial</Text>

          {/* Logo de la boutique */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Logo / Photo de la boutique <Text style={{ color: COLORS.primary }}>*</Text></Text>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto(setShopLogo)} disabled={isLoading}>
              {shopLogo ? (
                <Image source={{ uri: shopLogo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={{ fontSize: 32 }}>🏪</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 6 }}>Ajouter un logo ou photo</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>Façade, enseigne ou logo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

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

          <PickerField
            label="Gouvernorat / Wilaya"
            required
            value={shopGov}
            options={ZONES_BY_COUNTRY[selectedCountry.key] || ZONES_BY_COUNTRY['TN']}
            onSelect={(v) => { setShopGov(v); setFieldErrors((e) => ({ ...e, shopAddress: undefined })); }}
            placeholder="Sélectionner votre région..."
            disabled={isLoading}
          />

          <InputField
            label="Adresse exacte"
            required
            placeholder="N° rue, quartier, ville"
            value={shopAddress}
            onChangeText={(v) => { setShopAddress(v); setFieldErrors((e) => ({ ...e, shopAddress: undefined })); }}
            error={fieldErrors.shopAddress}
            editable={!isLoading}
          />

          {/* Téléphone boutique avec indicatif */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone boutique</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity style={styles.countryPicker} onPress={() => setShopPhonePickerOpen(true)}>
                <Modal visible={shopPhonePickerOpen} transparent animationType="slide" onRequestClose={() => setShopPhonePickerOpen(false)}>
                  <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={() => setShopPhonePickerOpen(false)}>
                    <View style={pickerStyles.sheet}>
                      <View style={pickerStyles.handle} />
                      <Text style={pickerStyles.title}>Indicatif pays</Text>
                      <ScrollView style={pickerStyles.scroll} showsVerticalScrollIndicator={false}>
                        {COUNTRY_CODES.map((c) => (
                          <TouchableOpacity
                            key={c.key}
                            style={[pickerStyles.option, shopPhoneCountry.key === c.key && pickerStyles.optionSelected]}
                            onPress={() => { setShopPhoneCountry(c); setShopPhonePickerOpen(false); }}
                          >
                            <Text style={[pickerStyles.optionText, shopPhoneCountry.key === c.key && { color: COLORS.primary, fontWeight: '700' }]}>
                              {c.flag}  {c.code}  {c.label}
                            </Text>
                            {shopPhoneCountry.key === c.key && <Text style={{ color: COLORS.primary }}>✓</Text>}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>
                <Text style={styles.countryFlag}>{shopPhoneCountry.flag}</Text>
                <Text style={styles.countryCode}>{shopPhoneCountry.code}</Text>
                <Text style={styles.countryChevron}>▼</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="XX XXX XXX"
                placeholderTextColor={COLORS.textMuted}
                value={shopPhone}
                onChangeText={setShopPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </View>

          <KycNote text="📷 Après validation, vous pourrez ajouter vos produits et prix depuis votre tableau de bord" />
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
  pickerBtn: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerBtnText: { color: '#FFFFFF', fontSize: 15 },
  pickerBtnPlaceholder: { color: COLORS.textMuted, fontSize: 15 },
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    gap: 4,
  },
  countryFlag: { fontSize: 18 },
  countryCode: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  countryChevron: { color: COLORS.textMuted, fontSize: 9, marginLeft: 2 },
  phoneInput: { flex: 1, color: COLORS.text, fontSize: 16, paddingHorizontal: 12, paddingVertical: 14 },

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

  // ── Photo
  photoBtn: { borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', overflow: 'hidden' },
  photoPreview: { width: '100%', height: 160, resizeMode: 'cover' },
  photoPlaceholder: { height: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceAlt },

  // ── Login link
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  loginText: { color: COLORS.textMuted, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },

  // ── Radio buttons (genre pref)
  radioRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 8, backgroundColor: COLORS.surface,
  },
  radioRowSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  radioLabel: { color: COLORS.text, fontSize: 14, flex: 1 },
  easyLadyBadge: { backgroundColor: '#2A0A1A', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E91E8C44', marginTop: 4 },
  easyLadyText: { color: '#E91E8C', fontSize: 12, lineHeight: 18 },

  // ── Toggle buttons (PMR)
  toggleBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  toggleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  toggleBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  toggleBtnTextActive: { color: COLORS.primary },
});
