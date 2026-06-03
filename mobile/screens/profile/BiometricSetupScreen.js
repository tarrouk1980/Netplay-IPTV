import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const STEPS = [
  { id: 'intro', title: 'Sécurisez votre compte', sub: 'Activez la biométrie pour vous connecter en un instant.' },
  { id: 'scan', title: 'Posez votre doigt', sub: 'Appuyez et maintenez votre doigt sur le capteur.' },
  { id: 'confirm', title: 'Scannez à nouveau', sub: 'Confirmez votre empreinte pour plus de précision.' },
  { id: 'done', title: 'Empreinte enregistrée !', sub: 'Votre biométrie est maintenant activée.' },
];

export default function BiometricSetupScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [faceEnabled, setFaceEnabled] = useState(false);
  const [fingerEnabled, setFingerEnabled] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(fillAnim, {
        toValue: step === 1 ? 0.5 : 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        setScanning(false);
        setProgress(step === 1 ? 50 : 100);
        if (step === 1) setStep(2);
        else {
          setStep(3);
          Animated.spring(successAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
        }
      });
    } else {
      pulseAnim.stopAnimation();
    }
  }, [scanning]);

  const handleScan = () => {
    if (step === 1 || step === 2) {
      setScanning(true);
    }
  };

  const handleMethodToggle = (method) => {
    if (method === 'face') {
      setFaceEnabled(p => {
        if (!p) Alert.alert('Face ID activé', 'Face ID a été activé pour votre compte EASYWAY.');
        return !p;
      });
    } else {
      if (!fingerEnabled) {
        setStep(1);
        setFingerEnabled(true);
      } else {
        setFingerEnabled(false);
        setStep(0);
        setProgress(0);
        fillAnim.setValue(0);
      }
    }
  };

  const currentStep = STEPS[step];

  if (step >= 1 && step <= 3) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setStep(0); setScanning(false); setProgress(0); fillAnim.setValue(0); }}>
            <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Empreinte digitale</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.scanContainer}>
          {step < 3 ? (
            <>
              <Text style={styles.scanTitle}>{currentStep.title}</Text>
              <Text style={styles.scanSub}>{currentStep.sub}</Text>

              <TouchableOpacity onPress={handleScan} activeOpacity={0.8}>
                <Animated.View style={[styles.fingerprintCircle, { transform: [{ scale: scanning ? pulseAnim : 1 }] }]}>
                  <View style={styles.fingerprintInner}>
                    <Text style={{ fontSize: 56 }}>👆</Text>
                  </View>
                  <Animated.View style={[
                    styles.progressRing,
                    {
                      borderColor: COLORS.accent,
                      opacity: fillAnim.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 1, 1] }),
                    }
                  ]} />
                </Animated.View>
              </TouchableOpacity>

              {/* Progress bar */}
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{progress}% · {step === 1 ? 'Première lecture' : 'Confirmation'}</Text>

              {!scanning && (
                <TouchableOpacity style={styles.scanBtn} onPress={handleScan}>
                  <Text style={styles.scanBtnText}>
                    {step === 1 ? 'Commencer le scan' : 'Scanner à nouveau'}
                  </Text>
                </TouchableOpacity>
              )}
              {scanning && <Text style={styles.scanningLabel}>Scan en cours…</Text>}
            </>
          ) : (
            <Animated.View style={[styles.successView, { transform: [{ scale: successAnim }] }]}>
              <View style={styles.successCircle}>
                <Text style={{ fontSize: 52 }}>✓</Text>
              </View>
              <Text style={styles.successTitle}>{currentStep.title}</Text>
              <Text style={styles.successSub}>{currentStep.sub}</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.doneBtnText}>Terminer</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Authentification biométrique</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔐</Text>
          <Text style={styles.heroTitle}>Connexion sécurisée</Text>
          <Text style={styles.heroSub}>
            Utilisez votre biométrie pour accéder à votre compte EASYWAY en un instant, sans saisir votre mot de passe.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsSection}>
          {[
            {
              method: 'face', icon: '😊', label: 'Face ID', sub: 'Déverrouillage par reconnaissance faciale',
              enabled: faceEnabled, supported: true,
            },
            {
              method: 'finger', icon: '👆', label: 'Empreinte digitale', sub: `${fingerEnabled ? `Configurée — ${progress}%` : 'Non configurée'}`,
              enabled: fingerEnabled, supported: true,
            },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.method}
              style={[styles.optionCard, opt.enabled && styles.optionCardActive]}
              onPress={() => handleMethodToggle(opt.method)}
            >
              <Text style={styles.optionIcon}>{opt.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionSub}>{opt.sub}</Text>
              </View>
              <View style={[styles.toggle, opt.enabled && styles.toggleOn]}>
                <View style={[styles.toggleThumb, opt.enabled && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🛡️ Sécurité</Text>
          {[
            'Vos données biométriques restent sur votre appareil.',
            'EASYWAY ne stocke jamais votre empreinte.',
            'Vous pouvez désactiver à tout moment.',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipDot}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  heroCard: {
    alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 24, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  heroTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  heroSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  optionsSection: { gap: 10, marginBottom: 16 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionCardActive: { borderColor: COLORS.accent, backgroundColor: '#1A1408' },
  optionIcon: { fontSize: 32 },
  optionLabel: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  optionSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  toggle: {
    width: 46, height: 26, borderRadius: 13,
    backgroundColor: COLORS.border, padding: 2,
  },
  toggleOn: { backgroundColor: COLORS.accent },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
  tipsCard: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tipsTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  tipDot: { color: COLORS.accent, fontSize: 14 },
  tipText: { color: COLORS.muted, fontSize: 12, flex: 1 },
  // Scan view
  scanContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  scanTitle: { color: COLORS.white, fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  scanSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 40, lineHeight: 20 },
  fingerprintCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#1A1408', borderWidth: 3, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  fingerprintInner: { alignItems: 'center', justifyContent: 'center' },
  progressRing: {
    position: 'absolute', width: 156, height: 156, borderRadius: 78,
    borderWidth: 3,
  },
  progressBar: {
    width: '100%', height: 6, backgroundColor: COLORS.border, borderRadius: 3,
    overflow: 'hidden', marginBottom: 8,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 },
  progressLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 24 },
  scanBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  scanBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  scanningLabel: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  // Success
  successView: { alignItems: 'center' },
  successCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#0A1A0A', borderWidth: 3, borderColor: COLORS.green,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  successSub: { color: COLORS.muted, fontSize: 15, textAlign: 'center', marginBottom: 32 },
  doneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 16,
  },
  doneBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
