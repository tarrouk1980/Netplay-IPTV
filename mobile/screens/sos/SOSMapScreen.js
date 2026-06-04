import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ActivityIndicator, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { getCurrentLocationWithAddress } from '../../utils/locationUtils';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_DEPANNEURS = [
  { id: 'D1', name: 'Karim Dépannage', distance: 1.2, eta: '8 min', rating: 4.9, available: true, specialties: ['Batterie', 'Crevaison'] },
  { id: 'D2', name: 'SOS Auto Tunis', distance: 2.4, eta: '14 min', rating: 4.7, available: true, specialties: ['Remorquage', 'Déverrouillage'] },
  { id: 'D3', name: 'Nabil Assistance', distance: 3.1, eta: '19 min', rating: 4.8, available: true, specialties: ['Batterie', 'Panne sèche', 'Remorquage'] },
];

const SOS_TYPES = [
  { key: 'batterie', icon: '🔋', label: 'Batterie' },
  { key: 'crevaison', icon: '🔧', label: 'Crevaison' },
  { key: 'remorquage', icon: '🚛', label: 'Remorquage' },
  { key: 'carburant', icon: '⛽', label: 'Panne sèche' },
  { key: 'deverrouillage', icon: '🔑', label: 'Déverrouillage' },
  { key: 'autre', icon: '🛠️', label: 'Autre' },
];

export default function SOSMapScreen({ navigation, route }) {
  const [step, setStep] = useState('type'); // type | locating | searching | found
  const [sosType, setSosType] = useState(null);
  const [location, setLocation] = useState(null);
  const [depanneurs, setDepanneurs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (step === 'searching') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      setTimeout(() => {
        setDepanneurs(MOCK_DEPANNEURS);
        setStep('found');
        pulseAnim.stopAnimation();
      }, 2500);
    }
  }, [step]);

  const handleLocate = async () => {
    setStep('locating');
    const result = await getCurrentLocationWithAddress();
    if (result) {
      setLocation(result.coords);
    } else {
      setLocation({ lat: 36.8065, lng: 10.1815 });
    }
    setStep('searching');
  };

  const handleRequest = async (depanneur) => {
    setSelected(depanneur);
    setSending(true);
    try {
      await api.post('/api/sos/request', {
        type: sosType,
        depanneurId: depanneur.id,
        location,
      });
      navigation.replace('SOSTracking', { depanneurId: depanneur.id, sosType });
    } catch {
      navigation.replace('SOSTracking', { depanneurId: depanneur.id, sosType });
    } finally { setSending(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 'type' ? navigation.goBack() : setStep('type')} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔧 SOS Dépannage</Text>
        <View style={{ width: 40 }} />
      </View>

      {step === 'type' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Quel est votre problème ?</Text>
          <Text style={styles.stepSub}>Sélectionnez le type de panne pour trouver le bon dépanneur.</Text>
          <View style={styles.typeGrid}>
            {SOS_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeBtn, sosType === t.key && styles.typeBtnActive]}
                onPress={() => setSosType(t.key)}
              >
                <Text style={{ fontSize: 32 }}>{t.icon}</Text>
                <Text style={[styles.typeLabel, sosType === t.key && styles.typeLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, !sosType && { opacity: 0.4 }]}
            onPress={handleLocate}
            disabled={!sosType}
          >
            <Text style={styles.nextBtnText}>📍 Localiser ma position →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'locating' && (
        <View style={styles.centeredState}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={styles.stateText}>Localisation en cours...</Text>
        </View>
      )}

      {step === 'searching' && (
        <View style={styles.centeredState}>
          <Animated.View style={[styles.sosPulse, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={{ fontSize: 48 }}>🔧</Text>
          </Animated.View>
          <Text style={styles.stateText}>Recherche de dépanneurs...</Text>
          <Text style={styles.stateSub}>Analyse des disponibilités autour de vous</Text>
        </View>
      )}

      {step === 'found' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Dépanneurs disponibles</Text>
          <Text style={styles.stepSub}>{depanneurs.length} dépanneurs proches de vous</Text>
          {depanneurs.map(dep => (
            <View key={dep.id} style={styles.depCard}>
              <View style={styles.depTop}>
                <View style={styles.depAvatar}><Text style={{ fontSize: 24 }}>🔧</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.depName}>{dep.name}</Text>
                  <Text style={styles.depMeta}>📏 {dep.distance} km · ⏱️ {dep.eta} · ⭐ {dep.rating}</Text>
                  <View style={styles.specialtiesRow}>
                    {dep.specialties.map(s => (
                      <View key={s} style={styles.specialtyTag}><Text style={styles.specialtyText}>{s}</Text></View>
                    ))}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.requestBtn, (sending && selected?.id === dep.id) && { opacity: 0.6 }]}
                onPress={() => handleRequest(dep)}
                disabled={sending}
              >
                {sending && selected?.id === dep.id
                  ? <ActivityIndicator color="#000" size="small" />
                  : <Text style={styles.requestBtnText}>Appeler ce dépanneur →</Text>
                }
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  stepContainer: { flex: 1, padding: 16 },
  stepTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900', marginBottom: 6 },
  stepSub: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginBottom: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  typeBtn: { width: '30%', alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  typeBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  typeLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  typeLabelActive: { color: COLORS.accent },
  nextBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  sosPulse: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.red + '20', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.red + '50' },
  stateText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  stateSub: { color: COLORS.muted, fontSize: 13 },
  depCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  depTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  depAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  depName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  depMeta: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  specialtyTag: { backgroundColor: COLORS.accent + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.accent + '40' },
  specialtyText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
  requestBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  requestBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
});
