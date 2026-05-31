import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Vibration, Alert,
  AppState, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  danger: '#E74C3C',
  success: '#27AE60',
  accent: '#F5A623',
};

const SHAKE_THRESHOLD = 2.8;   // g-force delta to count as a shake
const SHAKE_COUNT_NEEDED = 3;  // 3 shakes to trigger
const SHAKE_WINDOW_MS = 2000;  // within 2 seconds
const COOLDOWN_MS = 30000;     // 30s cooldown after SOS sent

export default function SilentSOSScreen({ navigation }) {
  const [enabled, setEnabled] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [lastSOS, setLastSOS] = useState(null);
  const [contacts, setContacts] = useState([]);

  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const shakeTimes = useRef([]);
  const subscription = useRef(null);
  const cooldownRef = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    AsyncStorage.getItem('emergencyContacts').then((raw) => {
      if (raw) setContacts(JSON.parse(raw));
    });
    return () => stopListening();
  }, []);

  const triggerSOS = useCallback(async () => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, COOLDOWN_MS);

    Vibration.vibrate([0, 200, 100, 200, 100, 500]);
    setLastSOS(new Date());
    setShakeCount(0);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      let coords = null;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        coords = loc.coords;
      }

      await api.post('/api/emergency/silent-sos', {
        lat: coords?.latitude,
        lng: coords?.longitude,
        trigger: 'shake',
      });
    } catch {}
  }, []);

  const handleAccelerometer = useCallback(({ x, y, z }) => {
    const prev = lastAccel.current;
    const delta = Math.sqrt(
      Math.pow(x - prev.x, 2) +
      Math.pow(y - prev.y, 2) +
      Math.pow(z - prev.z, 2)
    );
    lastAccel.current = { x, y, z };

    if (delta > SHAKE_THRESHOLD) {
      const now = Date.now();
      shakeTimes.current = shakeTimes.current
        .filter((t) => now - t < SHAKE_WINDOW_MS)
        .concat(now);

      setShakeCount(shakeTimes.current.length);

      if (shakeTimes.current.length >= SHAKE_COUNT_NEEDED) {
        shakeTimes.current = [];
        triggerSOS();
      }
    }
  }, [triggerSOS]);

  const startListening = useCallback(async () => {
    Accelerometer.setUpdateInterval(100);
    subscription.current = Accelerometer.addListener(handleAccelerometer);
    setEnabled(true);
  }, [handleAccelerometer]);

  const stopListening = useCallback(() => {
    subscription.current?.remove();
    subscription.current = null;
    setEnabled(false);
    setShakeCount(0);
    shakeTimes.current = [];
  }, []);

  const toggleEnabled = () => {
    if (enabled) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Persist across app state changes (background)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && enabled && !subscription.current) {
        startListening();
      }
    });
    return () => sub.remove();
  }, [enabled, startListening]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Discret</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Explainer */}
        <View style={styles.explainer}>
          <Text style={styles.explainerIcon}>📱</Text>
          <Text style={styles.explainerTitle}>Comment ça fonctionne</Text>
          <Text style={styles.explainerText}>
            Agitez votre téléphone <Text style={{ color: COLORS.accent, fontWeight: '700' }}>3 fois</Text> rapidement pour envoyer un SOS silencieux à vos contacts d'urgence avec votre position GPS.
          </Text>
          <Text style={styles.explainerText}>
            Aucun son, aucune notification visible — discret et rapide.
          </Text>
        </View>

        {/* Toggle */}
        <TouchableOpacity
          style={[styles.toggleBtn, enabled ? styles.toggleBtnActive : styles.toggleBtnInactive]}
          onPress={toggleEnabled}
          activeOpacity={0.85}
        >
          <Text style={styles.toggleBtnIcon}>{enabled ? '🔴' : '⚪'}</Text>
          <Text style={styles.toggleBtnText}>
            {enabled ? 'Surveillance active — Appuyez pour désactiver' : 'Activer la surveillance'}
          </Text>
        </TouchableOpacity>

        {/* Shake indicator */}
        {enabled && (
          <View style={styles.shakeIndicator}>
            <Text style={styles.shakeLabel}>Détection de mouvement</Text>
            <View style={styles.shakeDots}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.shakeDot,
                    i < shakeCount && styles.shakeDotActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.shakeHint}>
              {shakeCount === 0 ? 'Agitez le téléphone…' : `${shakeCount}/3 agitations détectées`}
            </Text>
          </View>
        )}

        {/* Last SOS */}
        {lastSOS && (
          <View style={styles.lastSOSBox}>
            <Text style={styles.lastSOSIcon}>✅</Text>
            <Text style={styles.lastSOSText}>
              SOS envoyé à {lastSOS.toLocaleTimeString('fr-TN')}
            </Text>
          </View>
        )}

        {/* Contacts preview */}
        <View style={styles.contactsSection}>
          <View style={styles.contactsHeader}>
            <Text style={styles.contactsTitle}>Contacts d'urgence</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Emergency')}>
              <Text style={styles.contactsEdit}>Gérer</Text>
            </TouchableOpacity>
          </View>
          {contacts.length === 0 ? (
            <View style={styles.noContacts}>
              <Text style={styles.noContactsText}>
                Aucun contact configuré. Ajoutez des contacts d'urgence pour utiliser le SOS discret.
              </Text>
              <TouchableOpacity
                style={styles.addContactBtn}
                onPress={() => navigation.navigate('Emergency')}
              >
                <Text style={styles.addContactBtnText}>+ Ajouter des contacts</Text>
              </TouchableOpacity>
            </View>
          ) : (
            contacts.map((c, i) => (
              <View key={i} style={styles.contactRow}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>{(c.name || 'C')[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactPhone}>{c.phone}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Warning */}
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ Le SOS discret nécessite une connexion Internet et la permission de localisation pour envoyer votre position GPS.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ScrollView must be imported separately since it's used inside
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.text, fontSize: 28 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  explainer: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 16, padding: 20,
    alignItems: 'center',
  },
  explainerIcon: { fontSize: 40, marginBottom: 12 },
  explainerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  explainerText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 8, lineHeight: 20 },
  toggleBtn: {
    marginHorizontal: 16, borderRadius: 16, paddingVertical: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  toggleBtnActive: { backgroundColor: COLORS.danger + '22', borderWidth: 2, borderColor: COLORS.danger },
  toggleBtnInactive: { backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border },
  toggleBtnIcon: { fontSize: 22 },
  toggleBtnText: { color: COLORS.text, fontWeight: '700', fontSize: 14, flex: 1, flexWrap: 'wrap' },
  shakeIndicator: {
    backgroundColor: COLORS.surface, margin: 16, marginTop: 12,
    borderRadius: 14, padding: 16, alignItems: 'center',
  },
  shakeLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 12 },
  shakeDots: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  shakeDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.border },
  shakeDotActive: { backgroundColor: COLORS.danger },
  shakeHint: { color: COLORS.textMuted, fontSize: 12 },
  lastSOSBox: {
    backgroundColor: COLORS.success + '22', marginHorizontal: 16,
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.success,
  },
  lastSOSIcon: { fontSize: 20 },
  lastSOSText: { color: COLORS.success, fontWeight: '600', fontSize: 14 },
  contactsSection: { backgroundColor: COLORS.surface, margin: 16, borderRadius: 16, padding: 16 },
  contactsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  contactsTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  contactsEdit: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },
  noContacts: { alignItems: 'center', paddingVertical: 12 },
  noContactsText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 12, lineHeight: 18 },
  addContactBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  addContactBtnText: { color: '#000', fontWeight: '700', fontSize: 13 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  contactAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.danger + '33', alignItems: 'center', justifyContent: 'center' },
  contactAvatarText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
  contactName: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  contactPhone: { color: COLORS.textMuted, fontSize: 12 },
  warning: { marginHorizontal: 16, padding: 14, backgroundColor: '#1A1208', borderRadius: 12, borderWidth: 1, borderColor: COLORS.accent + '55' },
  warningText: { color: COLORS.accent, fontSize: 12, lineHeight: 18 },
});
