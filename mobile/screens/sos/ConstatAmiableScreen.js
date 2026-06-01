import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, StatusBar, Modal, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';


import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#252535',
  accent: '#8E44AD', text: '#FFFFFF', muted: '#8E8E9A',
  border: '#2C2C3E', green: '#27AE60', red: '#E74C3C', primary: '#F5A623',
};

// ── Données ──────────────────────────────────────────────────────────────────

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
const GEARBOX_TYPES = ['Manuelle', 'Automatique', 'Semi-automatique'];
const CAR_COLORS = ['Blanc','Noir','Gris','Argent','Rouge','Bleu','Vert','Beige','Marron','Jaune','Orange','Autre'];

const INSURANCE_COMPANIES = [
  // Tunisie
  'STAR','GAT Assurances','AMI Assurances','Assurances BIAT','Lloyd Assurance',
  'CTAMA','Salim Assurances','CARTE Assurances','Astree Assurances','BH Assurance',
  'Maghrebia Assurances','Zitouna Takaful','Comar','TUNIS RE',
  // Algérie
  'SAA (Algérie)','CAAR (Algérie)','CAAT (Algérie)','Alliance Assurances',
  'Trust Algeria','Salama Assurances Algeria',
  // Maroc
  'Wafa Assurance','RMA Watanya','Atlanta Assurances','SAHAM Assurances',
  'Allianz Maroc','AXA Assurance Maroc',
  // Libye / Mauritanie
  'Libya Insurance','Assurances Sahara','Autre',
];

const CIRCUMSTANCES = [
  'En stationnement (à l\'arrêt ou en stationnement)',
  'Quittait un stationnement / ouvrait une portière',
  'En marche arrière',
  'S\'engageait dans un parking / allée privée',
  'Circulait en sens interdit',
  'Venait d\'un carrefour / rond-point',
  'Tournait à droite',
  'Tournait à gauche',
  'Changeait de file / dépassait',
  'Dépassement dangereux',
  'Refus de priorité / stop / cédez-le-passage',
  'Brûlait un feu rouge',
  'Heurtait à l\'arrière (même sens de circulation)',
  'Collision frontale',
  'Percutait un véhicule en stationnement',
  'Avait ses feux éteints (nuit / mauvaise visibilité)',
  'Roulait sur une piste réservée',
  'Survenait d\'une allée privée / terrain',
];

const ROAD_TYPES = ['Route nationale', 'Route régionale', 'Voie urbaine', 'Autoroute', 'Parking', 'Voie privée', 'Autre'];

const EMPTY_VEHICLE = {
  marque: '', modele: '', annee: '', couleur: '', boiteVitesse: '',
  immatriculation: '', assurance: '', numPolice: '',
};

// ── Composant Picker ──────────────────────────────────────────────────────────

function FieldPicker({ label, value, options, onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerBtn, disabled && { opacity: 0.4 }]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={value ? styles.pickerText : styles.pickerPlaceholder} numberOfLines={1}>
          {value || 'Sélectionner...'}
        </Text>
        <Text style={{ color: COLORS.primary }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={sheetStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={sheetStyles.sheet}>
            <View style={sheetStyles.handle} />
            <Text style={sheetStyles.title}>{label}</Text>
            <ScrollView style={sheetStyles.scroll} showsVerticalScrollIndicator={false}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt} style={[sheetStyles.option, value === opt && sheetStyles.optionSel]}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                >
                  <Text style={[sheetStyles.optionText, value === opt && { color: COLORS.primary, fontWeight: '700' }]}>{opt}</Text>
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

const sheetStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1C1C28', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '65%', paddingBottom: 32 },
  handle: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  title: { color: '#8E8E9A', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 20, paddingBottom: 8 },
  scroll: { paddingHorizontal: 20 },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2C2C3E', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionSel: {},
  optionText: { color: '#FFFFFF', fontSize: 15 },
});

// ── Section véhicule ──────────────────────────────────────────────────────────

function VehicleSection({ title, data, onChange }) {
  const models = data.marque ? (BRANDS_MODELS[data.marque] || ['Autre']) : [];
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      <FieldPicker label="Marque" value={data.marque}
        options={VEHICLE_BRANDS}
        onSelect={(v) => onChange({ ...data, marque: v, modele: '' })} />

      <FieldPicker label="Modèle" value={data.modele}
        options={models.length ? models : ['Choisissez d\'abord une marque']}
        onSelect={(v) => onChange({ ...data, modele: v })}
        disabled={!data.marque} />

      <FieldPicker label="Année" value={data.annee}
        options={VEHICLE_YEARS}
        onSelect={(v) => onChange({ ...data, annee: v })} />

      <FieldPicker label="Couleur" value={data.couleur}
        options={CAR_COLORS}
        onSelect={(v) => onChange({ ...data, couleur: v })} />

      <FieldPicker label="Boîte de vitesse" value={data.boiteVitesse}
        options={GEARBOX_TYPES}
        onSelect={(v) => onChange({ ...data, boiteVitesse: v })} />

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Immatriculation</Text>
        <TextInput style={styles.fieldInput} value={data.immatriculation}
          onChangeText={(v) => onChange({ ...data, immatriculation: v })}
          placeholder="Ex: 123 TUN 4567" placeholderTextColor={COLORS.muted}
          autoCapitalize="characters" />
      </View>

      <FieldPicker label="Compagnie d'assurance" value={data.assurance}
        options={INSURANCE_COMPANIES}
        onSelect={(v) => onChange({ ...data, assurance: v })} />

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>N° Police d'assurance</Text>
        <TextInput style={styles.fieldInput} value={data.numPolice}
          onChangeText={(v) => onChange({ ...data, numPolice: v })}
          placeholder="Ex: TN-2024-000123" placeholderTextColor={COLORS.muted} />
      </View>
    </View>
  );
}

// ── Écran principal ───────────────────────────────────────────────────────────

export default function ConstatAmiableScreen({ route, navigation }) {
  const { orderId } = route.params || {};

  const [vehicleA, setVehicleA] = useState({ ...EMPTY_VEHICLE });
  const [vehicleB, setVehicleB] = useState({ ...EMPTY_VEHICLE });
  const [selectedCircumstances, setSelectedCircumstances] = useState([]);
  const [croquis, setCroquis] = useState(null);
  const [observations, setObservations] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [sigA, setSigA] = useState(null); // { timestamp, coords }
  const [sigB, setSigB] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasBlessés, setHasBlessés] = useState(false);
  const [blessésDetails, setBlessésDetails] = useState('');
  const [witness, setWitness] = useState({ name: '', phone: '' });
  const [roadType, setRoadType] = useState('');
  const [otherDamage, setOtherDamage] = useState('');

  const toggleCircumstance = (item) =>
    setSelectedCircumstances((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );

  const handlePickCroquis = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée', 'Accès galerie requis.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets?.length > 0) setCroquis(result.assets[0].uri);
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission refusée', 'Localisation requise pour le constat.'); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) });
    } catch {
      Alert.alert('Erreur', 'Impossible d\'obtenir la position GPS.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSign = (party) => {
    Alert.alert(
      'Confirmer la signature',
      `En signant, vous confirmez les informations du constat. Cette signature est horodatée et géolocalisée.\n\nDate: ${new Date().toLocaleString('fr-TN')}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Je signe',
          onPress: async () => {
            let coords = location;
            if (!coords) {
              try {
                const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              } catch {}
            }
            const sig = { timestamp: new Date().toISOString(), coords };
            if (party === 'A') setSigA(sig);
            else setSigB(sig);
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!sigA || !sigB) {
      Alert.alert('Signatures manquantes', 'Les deux parties doivent signer le constat.');
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = orderId ? `/api/sos/${orderId}/constat` : '/api/sos/constat';
      await api.post(endpoint, {
        vehicleA, vehicleB,
        circumstances: selectedCircumstances,
        croquis: croquis || null,
        observations,
        location,
        signatures: { A: sigA, B: sigB },
        blessés: { present: hasBlessés, details: blessésDetails },
        witness,
        roadType,
        otherDamage,
      });
      Alert.alert(
        '✅ Constat envoyé',
        'Un PDF signé sera envoyé par email aux deux parties et conservé dans votre historique SOS.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'envoyer le constat.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSig = (sig) => {
    if (!sig) return null;
    const d = new Date(sig.timestamp);
    const time = d.toLocaleString('fr-TN');
    const gps = sig.coords ? ` — GPS: ${sig.coords.lat.toFixed(5)}, ${sig.coords.lng.toFixed(5)}` : '';
    return `${time}${gps}`;
  };

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

        {/* Info envoi */}
        <View style={[styles.card, { backgroundColor: '#0D1A2A', borderWidth: 1, borderColor: '#1565C0' }]}>
          <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: '700' }}>📤 Où est envoyé ce constat ?</Text>
          <Text style={{ color: '#90CAF9', fontSize: 12, marginTop: 4, lineHeight: 18 }}>
            Après signature des deux parties, un PDF officiel sera généré et envoyé par email aux deux conducteurs. Il sera également archivé dans votre historique SOS pendant 5 ans.
          </Text>
        </View>

        {/* Localisation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Lieu de l'accident</Text>
          {location ? (
            <View style={{ backgroundColor: '#0D2A0D', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.green }}>
              <Text style={{ color: COLORS.green, fontSize: 13, fontWeight: '700' }}>✅ Position enregistrée</Text>
              <Text style={{ color: '#81C784', fontSize: 11, marginTop: 4 }}>
                Lat: {location.lat.toFixed(6)}  Lng: {location.lng.toFixed(6)}{'\n'}
                Précision: ±{location.accuracy}m
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.gpsBtn} onPress={getLocation} disabled={locationLoading}>
              <Text style={styles.gpsBtnText}>{locationLoading ? '📡 Localisation...' : '📍 Enregistrer la position GPS'}</Text>
              <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 4, textAlign: 'center' }}>Obligatoire pour la validité légale du constat</Text>
            </TouchableOpacity>
          )}
        </View>

        <VehicleSection title="🚗 Véhicule A (Client)" data={vehicleA} onChange={setVehicleA} />
        <VehicleSection title="🚗 Véhicule B (Autre partie)" data={vehicleB} onChange={setVehicleB} />

        {/* Circonstances */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Circonstances de l'accident</Text>
          <Text style={styles.cardSubtitle}>Sélectionnez toutes les cases qui s'appliquent</Text>
          {CIRCUMSTANCES.map((item) => (
            <TouchableOpacity key={item} style={styles.checkRow} onPress={() => toggleCircumstance(item)} activeOpacity={0.7}>
              <View style={[styles.checkbox, selectedCircumstances.includes(item) && styles.checkboxChecked]}>
                {selectedCircumstances.includes(item) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Blessés */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚑 Y a-t-il des blessés ?</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[styles.toggleBtn, hasBlessés && styles.toggleBtnActive]}
              onPress={() => setHasBlessés(true)} activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, hasBlessés && styles.toggleBtnTextActive]}>Oui</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !hasBlessés && styles.toggleBtnActive]}
              onPress={() => setHasBlessés(false)} activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, !hasBlessés && styles.toggleBtnTextActive]}>Non</Text>
            </TouchableOpacity>
          </View>
          {hasBlessés && (
            <>
              <TextInput
                style={styles.fieldInput}
                value={blessésDetails}
                onChangeText={setBlessésDetails}
                placeholder="Précisez (nombre, gravité apparente)..."
                placeholderTextColor={COLORS.muted}
                multiline
              />
              <Text style={{ color: COLORS.red, fontSize: 13, fontWeight: '700' }}>
                ⚠️ Appelez le 190 (SAMU) immédiatement si pas encore fait
              </Text>
            </>
          )}
        </View>

        {/* Témoins */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👁️ Témoin éventuel</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nom du témoin</Text>
            <TextInput
              style={styles.fieldInput}
              value={witness.name}
              onChangeText={(v) => setWitness({ ...witness, name: v })}
              placeholder="Nom du témoin (optionnel)"
              placeholderTextColor={COLORS.muted}
            />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Téléphone du témoin</Text>
            <TextInput
              style={styles.fieldInput}
              value={witness.phone}
              onChangeText={(v) => setWitness({ ...witness, phone: v })}
              placeholder="Téléphone du témoin"
              placeholderTextColor={COLORS.muted}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Type de voie */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛣️ Type de voie</Text>
          <FieldPicker
            label="Type de voie"
            value={roadType}
            options={ROAD_TYPES}
            onSelect={setRoadType}
          />
        </View>

        {/* Dégâts matériels autres */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏗️ Dégâts matériels autres</Text>
          <TextInput
            style={styles.observationsInput}
            value={otherDamage}
            onChangeText={setOtherDamage}
            placeholder="Mobilier urbain, clôture, autre véhicule... (optionnel)"
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Croquis */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Croquis / Photos de l'accident</Text>
          <TouchableOpacity style={styles.croquisBox} onPress={handlePickCroquis} activeOpacity={0.8}>
            {croquis
              ? <Text style={[styles.croquisText, { color: COLORS.green }]}>✅ Photo attachée</Text>
              : (<>
                <Text style={styles.croquisEmoji}>📷</Text>
                <Text style={styles.croquisText}>Croquis ou photo des dégâts</Text>
                <Text style={styles.croquisHint}>Dessinez sur papier puis photographiez</Text>
              </>)}
          </TouchableOpacity>
        </View>

        {/* Observations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Observations libres</Text>
          <TextInput style={styles.observationsInput} value={observations} onChangeText={setObservations}
            placeholder="Décrivez les circonstances de l'accident..." placeholderTextColor={COLORS.muted}
            multiline numberOfLines={5} textAlignVertical="top" />
        </View>

        {/* Signatures */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Signatures électroniques</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 12, lineHeight: 17 }}>
            Chaque signature est horodatée avec date, heure et coordonnées GPS — valeur probatoire conforme à la loi tunisienne n° 2000-83.
          </Text>

          <TouchableOpacity
            style={[styles.signatureBox, sigA && styles.signatureBoxSigned]}
            onPress={() => !sigA && handleSign('A')} activeOpacity={0.8}
          >
            {sigA ? (
              <>
                <Text style={styles.signedCheckmark}>✅</Text>
                <Text style={styles.signedLabel}>Conducteur A signé</Text>
                <Text style={{ color: '#81C784', fontSize: 10, marginTop: 4, textAlign: 'center' }}>{formatSig(sigA)}</Text>
              </>
            ) : (
              <Text style={styles.signaturePrompt}>Appuyer pour signer{'\n'}(Conducteur A — Client)</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 10 }} />

          <TouchableOpacity
            style={[styles.signatureBox, sigB && styles.signatureBoxSigned]}
            onPress={() => !sigB && handleSign('B')} activeOpacity={0.8}
          >
            {sigB ? (
              <>
                <Text style={styles.signedCheckmark}>✅</Text>
                <Text style={styles.signedLabel}>Conducteur B signé</Text>
                <Text style={{ color: '#81C784', fontSize: 10, marginTop: 4, textAlign: 'center' }}>{formatSig(sigB)}</Text>
              </>
            ) : (
              <Text style={styles.signaturePrompt}>Appuyer pour signer{'\n'}(Conducteur B / Autre partie)</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 0 }}>
          <TouchableOpacity style={[styles.submitBtn, { flex: 1 }, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}>
            <Text style={styles.submitBtnText}>{submitting ? 'Envoi...' : '📤 Envoyer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, { flex: 1, backgroundColor: COLORS.primary }]}
            onPress={async () => {
              try {
                const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;padding:20px;background:#fff;color:#222}h1{color:#8E44AD;font-size:18px}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #ccc;padding:8px;font-size:12px}th{background:#f0f0f0}h2{font-size:14px;color:#555;margin-top:16px}</style></head><body><h1>⚖️ Constat Amiable EASYWAY</h1><p>Date : ${new Date().toLocaleDateString('fr-TN')}</p><h2>Conducteur A</h2><table><tr><th>Nom</th><td>${driverA.name||''}</td><th>Tél</th><td>${driverA.phone||''}</td></tr><tr><th>Véhicule</th><td>${driverA.vehicleBrand||''} ${driverA.vehicleModel||''}</td><th>Immat.</th><td>${driverA.licensePlate||''}</td></tr><tr><th>Assureur</th><td>${driverA.insuranceCompany||''}</td><th>N° Police</th><td>${driverA.policyNumber||''}</td></tr></table><h2>Conducteur B</h2><table><tr><th>Nom</th><td>${driverB.name||''}</td><th>Tél</th><td>${driverB.phone||''}</td></tr><tr><th>Véhicule</th><td>${driverB.vehicleBrand||''} ${driverB.vehicleModel||''}</td><th>Immat.</th><td>${driverB.licensePlate||''}</td></tr><tr><th>Assureur</th><td>${driverB.insuranceCompany||''}</td><th>N° Police</th><td>${driverB.policyNumber||''}</td></tr></table><h2>Circonstances</h2><p>${circumstances||'Non renseignées'}</p><p style="margin-top:30px;font-size:10px;color:#999">Généré par EASYWAY · ${new Date().toISOString()}</p></body></html>`;
                const { uri } = await Print.printToFileAsync({ html, base64: false });
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Partager le constat amiable' });
                } else {
                  Alert.alert('PDF généré', `Fichier : ${uri}`);
                }
              } catch (e) {
                Alert.alert('Erreur', 'Impossible de générer le PDF.');
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>📄 PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, gap: 12 },
  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardSubtitle: { color: COLORS.muted, fontSize: 12, fontStyle: 'italic' },
  fieldRow: { gap: 4 },
  fieldLabel: { color: COLORS.muted, fontSize: 12 },
  fieldInput: { backgroundColor: COLORS.background, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  pickerBtn: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerText: { color: COLORS.text, fontSize: 14 },
  pickerPlaceholder: { color: COLORS.muted, fontSize: 14 },
  gpsBtn: { backgroundColor: COLORS.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', paddingVertical: 20, alignItems: 'center' },
  gpsBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: { color: COLORS.text, fontSize: 14, flex: 1 },
  croquisBox: { backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', paddingVertical: 32, alignItems: 'center', gap: 8 },
  croquisEmoji: { fontSize: 36 },
  croquisText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  croquisHint: { color: COLORS.muted, fontSize: 12 },
  observationsInput: { backgroundColor: COLORS.background, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 100 },
  signatureBox: { borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 24, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  signatureBoxSigned: { borderColor: COLORS.green, backgroundColor: '#0D2A1A' },
  signaturePrompt: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  signedCheckmark: { fontSize: 28, marginBottom: 4 },
  signedLabel: { color: COLORS.green, fontSize: 13, fontWeight: '600' },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggleBtn: { flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  toggleBtnText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
  toggleBtnTextActive: { color: '#fff' },
});
