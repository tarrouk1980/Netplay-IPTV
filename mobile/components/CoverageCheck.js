import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import api from '../services/api';

const COLORS = {
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  accent: '#F5A623',
  danger: '#E74C3C',
  success: '#27AE60',
  border: '#2C2C3A',
};

/**
 * CoverageCheck — vérifie si l'utilisateur est dans une zone couverte.
 * Props:
 *   serviceType: 'TAXI' | 'SOS' | 'DELIVERY' | 'GROCERY'
 *   onCovered: () => void — appelé si la zone est couverte
 *   onNotCovered: () => void — appelé si hors zone
 *   children: rendu si couvert
 */
export default function CoverageCheck({ serviceType, children, style }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'covered' | 'uncovered' | 'error'
  const [zone, setZone] = useState('');

  useEffect(() => {
    check();
  }, [serviceType]);

  const check = async () => {
    setStatus('checking');
    try {
      const { status: perm } = await Location.getForegroundPermissionsAsync();
      if (perm !== 'granted') {
        // Can't check — allow by default
        setStatus('covered');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const res = await api.get('/api/geo/coverage', {
        params: {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          serviceType,
        },
      });
      if (res.data.covered) {
        setZone(res.data.zone || '');
        setStatus('covered');
      } else {
        setStatus('uncovered');
      }
    } catch {
      // API error or no location — allow by default
      setStatus('covered');
    }
  };

  if (status === 'checking') {
    return (
      <View style={[styles.banner, style]}>
        <Text style={styles.bannerText}>📍 Vérification de la zone...</Text>
      </View>
    );
  }

  if (status === 'uncovered') {
    return (
      <View style={[styles.uncoveredCard, style]}>
        <Text style={styles.uncoveredIcon}>🗺️</Text>
        <Text style={styles.uncoveredTitle}>Zone non couverte</Text>
        <Text style={styles.uncoveredText}>
          Ce service n'est pas encore disponible dans votre région.{'\n'}
          Nous développons notre réseau — revenez bientôt !
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={check}>
          <Text style={styles.retryBtnText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {zone ? (
        <View style={styles.coveredBadge}>
          <Text style={styles.coveredText}>✓ Service disponible — {zone}</Text>
        </View>
      ) : null}
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  bannerText: { color: COLORS.textMuted, fontSize: 13 },
  uncoveredCard: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 16,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.danger + '44',
  },
  uncoveredIcon: { fontSize: 48, marginBottom: 12 },
  uncoveredTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  uncoveredText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  retryBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  coveredBadge: {
    backgroundColor: COLORS.success + '15', marginHorizontal: 16, marginBottom: 4,
    borderRadius: 8, padding: 8, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.success + '44',
  },
  coveredText: { color: COLORS.success, fontSize: 12, fontWeight: '600' },
});
