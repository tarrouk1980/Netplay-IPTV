import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const CODE_LENGTH = 6;

const METHODS = [
  { id: 'sms', icon: '📱', label: 'SMS', detail: '+216 20 *** ***', available: true },
  { id: 'email', icon: '📧', label: 'Email', detail: 't***@gmail.com', available: true },
  { id: 'app', icon: '🔐', label: 'Application Auth', detail: 'Google Authenticator', available: false },
];

export default function TwoFactorAuthScreen({ navigation }) {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState('sms');
  const [phase, setPhase] = useState('settings');
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const startVerification = () => {
    setPhase('verify');
    setCode(Array(CODE_LENGTH).fill(''));
    setResendTimer(60);
    setTimeout(() => inputs.current[0]?.focus(), 300);
  };

  const handleCodeInput = (val, idx) => {
    const clean = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[idx] = clean;
    setCode(next);
    setError('');
    if (clean && idx < CODE_LENGTH - 1) inputs.current[idx + 1]?.focus();
    if (next.every(c => c !== '') && idx === CODE_LENGTH - 1) verifyCode(next.join(''));
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const verifyCode = async (codeStr) => {
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1000));
    setVerifying(false);
    if (codeStr === '123456' || !enabled) {
      setEnabled(true);
      setPhase('success');
      Animated.spring(successAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
    } else {
      setError('Code incorrect. Réessayez.');
      setCode(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  };

  const disableOTP = () => {
    Alert.alert(
      'Désactiver le 2FA',
      'Cela réduit la sécurité de votre compte. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Désactiver', style: 'destructive', onPress: () => { setEnabled(false); setPhase('settings'); } },
      ]
    );
  };

  if (phase === 'success') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.successContainer}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: successAnim }] }]}>
            <Text style={{ fontSize: 48 }}>🔒</Text>
          </Animated.View>
          <Text style={styles.successTitle}>2FA activé !</Text>
          <Text style={styles.successSub}>
            Votre compte est maintenant protégé par l'authentification à deux facteurs via {METHODS.find(m => m.id === method)?.label}.
          </Text>
          <View style={styles.successInfo}>
            <Text style={styles.successInfoText}>
              💡 À chaque connexion, un code à 6 chiffres vous sera envoyé par {method === 'sms' ? 'SMS' : 'email'}.
            </Text>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Parfait !</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'verify') {
    const filled = code.filter(c => c !== '').length;
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPhase('settings')}>
            <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.verifyContainer}>
          <Text style={{ fontSize: 52, marginBottom: 16 }}>
            {method === 'sms' ? '📱' : '📧'}
          </Text>
          <Text style={styles.verifyTitle}>Entrez le code</Text>
          <Text style={styles.verifySub}>
            Code envoyé par {method === 'sms' ? 'SMS' : 'email'} à{' '}
            <Text style={{ color: COLORS.white }}>{METHODS.find(m => m.id === method)?.detail}</Text>
          </Text>

          <Animated.View style={[styles.codeRow, { transform: [{ translateX: shakeAnim }] }]}>
            {code.map((c, i) => (
              <TextInput
                key={i}
                ref={r => (inputs.current[i] = r)}
                style={[
                  styles.codeBox,
                  c && styles.codeBoxFilled,
                  error && styles.codeBoxError,
                ]}
                value={c}
                onChangeText={(v) => handleCodeInput(v, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </Animated.View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {verifying && <Text style={styles.verifyingText}>Vérification…</Text>}

          <View style={styles.progressDots}>
            {Array(CODE_LENGTH).fill(0).map((_, i) => (
              <View key={i} style={[styles.progressDot, i < filled && { backgroundColor: COLORS.accent }]} />
            ))}
          </View>

          <TouchableOpacity
            disabled={resendTimer > 0}
            onPress={() => { setResendTimer(60); setCode(Array(CODE_LENGTH).fill('')); }}
          >
            <Text style={[styles.resendText, resendTimer > 0 && { color: COLORS.border }]}>
              {resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : '🔁 Renvoyer le code'}
            </Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Double authentification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, enabled && { borderColor: COLORS.green, backgroundColor: '#0A1A0A' }]}>
          <Text style={{ fontSize: 36 }}>{enabled ? '🔒' : '🔓'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>
              {enabled ? '2FA activé' : '2FA désactivé'}
            </Text>
            <Text style={styles.statusSub}>
              {enabled
                ? 'Votre compte est sécurisé par double authentification.'
                : 'Activez le 2FA pour mieux protéger votre compte.'}
            </Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: enabled ? COLORS.green : COLORS.red }]} />
        </View>

        {/* Methods */}
        {!enabled && (
          <>
            <Text style={styles.sectionTitle}>Choisissez votre méthode</Text>
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.methodCard,
                  method === m.id && styles.methodCardActive,
                  !m.available && { opacity: 0.4 },
                ]}
                onPress={() => m.available && setMethod(m.id)}
                disabled={!m.available}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  <Text style={styles.methodDetail}>{m.detail}</Text>
                  {!m.available && <Text style={styles.comingSoon}>Bientôt disponible</Text>}
                </View>
                <View style={[styles.radio, method === m.id && styles.radioActive]}>
                  {method === m.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          {[
            '🛡️ Protège votre compte même si votre mot de passe est compromis.',
            '⚡ Demande un code à chaque nouvelle connexion.',
            '🔄 Vous pouvez désactiver à tout moment.',
          ].map((t, i) => (
            <Text key={i} style={styles.tipText}>{t}</Text>
          ))}
        </View>

        {/* Action */}
        {!enabled ? (
          <TouchableOpacity style={styles.enableBtn} onPress={startVerification}>
            <Text style={styles.enableBtnText}>Activer le 2FA</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.disableBtn} onPress={disableOTP}>
            <Text style={styles.disableBtnText}>Désactiver le 2FA</Text>
          </TouchableOpacity>
        )}
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
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1A0A0A', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.red, marginBottom: 20,
  },
  statusTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statusSub: { color: COLORS.muted, fontSize: 12, lineHeight: 16 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  methodCardActive: { borderColor: COLORS.accent, backgroundColor: '#1A1408' },
  methodIcon: { fontSize: 26 },
  methodLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  methodDetail: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  comingSoon: { color: COLORS.orange, fontSize: 10, marginTop: 2, fontWeight: '600' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  tipsCard: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginVertical: 16, gap: 8,
  },
  tipText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  enableBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  enableBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  disableBtn: {
    backgroundColor: '#1A0808', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.red,
  },
  disableBtnText: { color: COLORS.red, fontSize: 16, fontWeight: '700' },
  // Verify phase
  verifyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  verifyTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  verifySub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  codeBox: {
    width: 46, height: 56, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border,
    backgroundColor: COLORS.surface, color: COLORS.white, fontSize: 24, fontWeight: '900',
    textAlign: 'center',
  },
  codeBoxFilled: { borderColor: COLORS.accent },
  codeBoxError: { borderColor: COLORS.red },
  errorText: { color: COLORS.red, fontSize: 13, marginBottom: 8 },
  verifyingText: { color: COLORS.accent, fontSize: 13, marginBottom: 8 },
  progressDots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  resendText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  // Success
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#0A1A0A', borderWidth: 3, borderColor: COLORS.green,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successTitle: { color: COLORS.white, fontSize: 26, fontWeight: '900', marginBottom: 10 },
  successSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  successInfo: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 32, width: '100%',
  },
  successInfoText: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  doneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 48, paddingVertical: 16,
  },
  doneBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
