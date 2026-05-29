import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSosStore from '../../store/sosStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  sos: '#E74C3C',
  sosDark: '#B03A2E',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
  insurance: '#27AE60',
  independent: '#2980B9',
};

const EMERGENCY_NUMBER = '197';

export default function SOSHomeScreen({ navigation }) {
  const { myContract, fetchMyContract } = useSosStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchMyContract();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleInsurance = () => {
    if (!myContract) {
      Alert.alert(
        'Aucun contrat détecté',
        'Vous n\'avez pas de contrat d\'assurance enregistré. Voulez-vous en ajouter un ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ajouter', onPress: () => navigation.navigate('AddInsurance') },
        ]
      );
      return;
    }
    if (new Date(myContract.expiresAt) < new Date()) {
      Alert.alert('Contrat expiré', 'Votre contrat d\'assurance a expiré.');
      return;
    }
    navigation.navigate('SOSRequest', { mode: 'INSURANCE', contract: myContract });
  };

  const handleIndependent = () => {
    navigation.navigate('SOSRequest', { mode: 'INDEPENDENT' });
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Appel d\'urgence',
      `Appeler le ${EMERGENCY_NUMBER} (Dépannage national Tunisie) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => Linking.openURL(`tel:${EMERGENCY_NUMBER}`) },
      ]
    );
  };

  const contractValid = myContract && new Date(myContract.expiresAt) >= new Date();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Remorquage</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Choisissez votre mode d'intervention</Text>

        {/* Insurance option */}
        <TouchableOpacity
          style={[styles.modeCard, { borderColor: COLORS.insurance }]}
          onPress={handleInsurance}
          activeOpacity={0.85}
        >
          <View style={[styles.modeIcon, { backgroundColor: COLORS.insurance + '22' }]}>
            <Text style={styles.modeEmoji}>🔒</Text>
          </View>
          <View style={styles.modeContent}>
            <Text style={[styles.modeTitle, { color: COLORS.insurance }]}>Couvert par mon assurance</Text>
            <Text style={styles.modeSubtitle}>
              {contractValid
                ? `Contrat actif — expire le ${new Date(myContract.expiresAt).toLocaleDateString('fr-TN')}`
                : 'Vérification du contrat automatique'}
            </Text>
            {contractValid && (
              <View style={styles.coverageTags}>
                {myContract.coverageTypes.map((c) => (
                  <View key={c} style={styles.coverageTag}>
                    <Text style={styles.coverageTagText}>{c}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Text style={[styles.modeChevron, { color: COLORS.insurance }]}>›</Text>
        </TouchableOpacity>

        {/* Independent option */}
        <TouchableOpacity
          style={[styles.modeCard, { borderColor: COLORS.independent }]}
          onPress={handleIndependent}
          activeOpacity={0.85}
        >
          <View style={[styles.modeIcon, { backgroundColor: COLORS.independent + '22' }]}>
            <Text style={styles.modeEmoji}>🔧</Text>
          </View>
          <View style={styles.modeContent}>
            <Text style={[styles.modeTitle, { color: COLORS.independent }]}>Dépanneur indépendant</Text>
            <Text style={styles.modeSubtitle}>Paiement direct au dépanneur — devis en temps réel</Text>
          </View>
          <Text style={[styles.modeChevron, { color: COLORS.independent }]}>›</Text>
        </TouchableOpacity>

        {/* Emergency CTA */}
        <View style={styles.emergencyWrapper}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={handleEmergencyCall}
              activeOpacity={0.85}
            >
              <Text style={styles.emergencyIcon}>🚨</Text>
              <Text style={styles.emergencyText}>APPEL D'URGENCE</Text>
              <Text style={styles.emergencyNumber}>{EMERGENCY_NUMBER}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Legal note */}
        <Text style={styles.legalNote}>
          En cas d'urgence vitale, appelez le 197 — numéro national de dépannage Tunisie (disponible 24h/24).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 4 },
  backArrow: { fontSize: 32, color: COLORS.sos, lineHeight: 32, marginTop: -4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: COLORS.sos },
  headerSpacer: { width: 32 },
  content: { flex: 1, padding: 20 },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 24,
  },
  modeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
    marginBottom: 16,
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeEmoji: { fontSize: 28 },
  modeContent: { flex: 1 },
  modeTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  modeSubtitle: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16 },
  modeChevron: { fontSize: 26, fontWeight: '300' },
  coverageTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  coverageTag: {
    backgroundColor: COLORS.insurance + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coverageTagText: { fontSize: 10, color: COLORS.insurance, fontWeight: '700' },
  emergencyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emergencyButton: {
    backgroundColor: COLORS.sos,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 48,
    alignItems: 'center',
    gap: 4,
    shadowColor: COLORS.sos,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  emergencyIcon: { fontSize: 32 },
  emergencyText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  emergencyNumber: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  legalNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
