import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const PANIC_HOLD_DURATION = 3000;

export default function PanicButtonScreen({ navigation }) {
  const [holding, setHolding] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const progress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdTimer = useRef(null);
  const cancelTimer = useRef(null);
  const anim = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    return () => pulseAnim.stopAnimation();
  }, []);

  useEffect(() => {
    if (triggered) {
      let cd = 5;
      setCountdown(cd);
      cancelTimer.current = setInterval(() => {
        cd--;
        setCountdown(cd);
        if (cd <= 0) {
          clearInterval(cancelTimer.current);
          sendAlert();
        }
      }, 1000);
    }
    return () => clearInterval(cancelTimer.current);
  }, [triggered]);

  const sendAlert = () => {
    Alert.alert(
      '🆘 Alerte envoyée',
      'Votre position a été transmise à vos contacts d\'urgence et au support EASYWAY.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const startHold = () => {
    setHolding(true);
    anim.current = Animated.timing(progress, {
      toValue: 1,
      duration: PANIC_HOLD_DURATION,
      useNativeDriver: false,
    });
    anim.current.start(({ finished }) => {
      if (finished) {
        setHolding(false);
        setTriggered(true);
      }
    });
  };

  const endHold = () => {
    if (anim.current) anim.current.stop();
    progress.setValue(0);
    setHolding(false);
  };

  const cancelAlert = () => {
    clearInterval(cancelTimer.current);
    setTriggered(false);
    setCountdown(5);
  };

  const progressColor = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.orange, COLORS.red, COLORS.red],
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (triggered) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: '#1A0808' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1A0808" />
        <View style={styles.alertBox}>
          <Text style={{ fontSize: 80, marginBottom: 20 }}>🆘</Text>
          <Text style={styles.alertTitle}>ALERTE SOS</Text>
          <Text style={styles.alertSub}>Envoi dans {countdown} secondes...</Text>
          <View style={styles.alertProgress}>
            <View style={[styles.alertProgressFill, { width: `${((5 - countdown) / 5) * 100}%` }]} />
          </View>
          <Text style={styles.alertInfo}>Votre position GPS est partagée avec vos contacts d'urgence.</Text>
          <TouchableOpacity style={styles.cancelAlertBtn} onPress={cancelAlert}>
            <Text style={styles.cancelAlertText}>✕ Annuler l'alerte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:197')}>
            <Text style={styles.callBtnText}>📞 Appeler Police (197)</Text>
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
        <Text style={styles.headerTitle}>Bouton panique</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>Maintenez le bouton appuyé 3 secondes pour déclencher l'alerte</Text>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: progressColor }]} />
        </View>

        {/* Big panic button */}
        <Animated.View style={[styles.panicOuter, { transform: [{ scale: holding ? 1 : pulseAnim }] }]}>
          <TouchableOpacity
            style={[styles.panicBtn, holding && styles.panicBtnActive]}
            onPressIn={startHold}
            onPressOut={endHold}
            activeOpacity={1}
          >
            <Text style={styles.panicIcon}>🆘</Text>
            <Text style={styles.panicLabel}>{holding ? 'MAINTENIR...' : 'SOS'}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.holdHint}>{holding ? 'Relâchez pour annuler' : 'Appuyez et maintenez'}</Text>

        {/* Emergency numbers */}
        <View style={styles.numbersCard}>
          <Text style={styles.numbersTitle}>📞 Numéros d'urgence</Text>
          <View style={styles.numbersList}>
            {[
              { label: 'Police', number: '197' },
              { label: 'Pompiers', number: '198' },
              { label: 'SAMU', number: '190' },
              { label: 'Protection civile', number: '198' },
            ].map(n => (
              <TouchableOpacity
                key={n.label}
                style={styles.numberBtn}
                onPress={() => Linking.openURL(`tel:${n.number}`)}
              >
                <Text style={styles.numberLabel}>{n.label}</Text>
                <Text style={styles.numberVal}>{n.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.contactsBtn}
          onPress={() => navigation.navigate('EmergencyContact')}
        >
          <Text style={styles.contactsBtnText}>👥 Gérer mes contacts d'urgence</Text>
        </TouchableOpacity>
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
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  instruction: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  progressWrap: { width: '100%', height: 6, backgroundColor: COLORS.surface, borderRadius: 3, overflow: 'hidden', marginBottom: 40 },
  progressFill: { height: '100%', borderRadius: 3 },
  panicOuter: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: COLORS.red + '22', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.red + '44', marginBottom: 16,
  },
  panicBtn: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#FF6666',
  },
  panicBtnActive: { backgroundColor: '#FF0000', borderColor: COLORS.white },
  panicIcon: { fontSize: 52, marginBottom: 4 },
  panicLabel: { color: COLORS.white, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  holdHint: { color: COLORS.muted, fontSize: 12, marginBottom: 32 },
  numbersCard: { width: '100%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  numbersTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  numbersList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  numberBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.red + '22', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.red + '55' },
  numberLabel: { color: COLORS.muted, fontSize: 12 },
  numberVal: { color: COLORS.red, fontSize: 14, fontWeight: '900' },
  contactsBtn: { width: '100%', backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  contactsBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  alertBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  alertTitle: { color: COLORS.red, fontSize: 32, fontWeight: '900', marginBottom: 10, letterSpacing: 3 },
  alertSub: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  alertProgress: { width: '100%', height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginBottom: 20 },
  alertProgressFill: { height: '100%', backgroundColor: COLORS.red, borderRadius: 4 },
  alertInfo: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 28 },
  cancelAlertBtn: { backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cancelAlertText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  callBtn: { backgroundColor: COLORS.red, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  callBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
});
