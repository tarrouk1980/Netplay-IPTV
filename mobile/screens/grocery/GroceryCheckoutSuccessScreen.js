import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  teal: '#00838F',
  green: '#27AE60',
  orange: '#F57C00',
};

const STEPS = [
  { icon: '✅', label: 'Commande confirmée' },
  { icon: '🏪', label: 'Préparation en cours' },
  { icon: '🛵', label: 'Livreur en route' },
  { icon: '📦', label: 'Livraison à votre porte' },
];

export default function GroceryCheckoutSuccessScreen({ navigation, route }) {
  const orderId = route?.params?.orderId || 'GRC-001234';
  const storeName = route?.params?.storeName || 'Monoprix';
  const total = route?.params?.total || 42.5;
  const estimatedMinutes = route?.params?.estimatedMinutes || 35;

  const checkScale = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.container}>

        {/* Success icon */}
        <Animated.View style={[s.checkCircle, { transform: [{ scale: checkScale }] }]}>
          <Text style={{ fontSize: 52 }}>🛒</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], alignItems: 'center' }}>
          <Text style={s.title}>Commande passée ! 🎉</Text>
          <Text style={s.subtitle}>Votre commande chez {storeName} est confirmée</Text>

          {/* Order info */}
          <View style={s.orderCard}>
            <View style={s.orderRow}>
              <Text style={s.orderLbl}>Numéro de commande</Text>
              <Text style={s.orderVal}>#{orderId}</Text>
            </View>
            <View style={[s.orderRow, { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Text style={s.orderLbl}>Total payé</Text>
              <Text style={[s.orderVal, { color: COLORS.teal }]}>{parseFloat(total).toFixed(2)} TND</Text>
            </View>
            <View style={[s.orderRow, { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Text style={s.orderLbl}>Livraison estimée</Text>
              <Text style={[s.orderVal, { color: COLORS.orange }]}>~{estimatedMinutes} min</Text>
            </View>
          </View>

          {/* Progress steps */}
          <View style={s.stepsCard}>
            <Text style={s.stepsTitle}>Suivi de votre commande</Text>
            {STEPS.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={[s.stepDot, i === 0 && s.stepDotActive, i === 1 && s.stepDotCurrent]}>
                  <Text style={{ fontSize: 14 }}>{i === 0 ? '✓' : step.icon}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[s.stepLine, i === 0 && s.stepLineActive]} />
                )}
                <Text style={[s.stepLabel, i === 0 && { color: COLORS.green }, i === 1 && { color: COLORS.teal }]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Loyalty points */}
          <View style={s.pointsBox}>
            <Text style={{ fontSize: 20 }}>⭐</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.pointsTitle}>+5 EasyPoints gagnés !</Text>
              <Text style={s.pointsSub}>Continuez à commander pour débloquer des récompenses.</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom actions */}
      <Animated.View style={[s.bottomArea, { opacity: fadeIn }]}>
        <TouchableOpacity
          style={s.trackBtn}
          onPress={() => navigation.navigate('GroceryTracking', { orderId })}
        >
          <Text style={s.trackBtnTxt}>🗺 Suivre ma commande</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.homeBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        >
          <Text style={s.homeBtnTxt}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  checkCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.teal + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.teal, marginBottom: 24 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  orderCard: { backgroundColor: COLORS.surface, borderRadius: 14, width: '100%', borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, overflow: 'hidden' },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  orderLbl: { color: COLORS.muted, fontSize: 13 },
  orderVal: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  stepsCard: { backgroundColor: COLORS.surface, borderRadius: 14, width: '100%', padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  stepsTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepDotActive: { backgroundColor: COLORS.green + '33', borderWidth: 1, borderColor: COLORS.green },
  stepDotCurrent: { backgroundColor: COLORS.teal + '33', borderWidth: 1, borderColor: COLORS.teal },
  stepLine: { position: 'absolute', left: 15, top: 32, width: 2, height: 18, backgroundColor: COLORS.border },
  stepLineActive: { backgroundColor: COLORS.green },
  stepLabel: { color: COLORS.muted, fontSize: 13 },
  pointsBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.orange + '11', borderRadius: 12, padding: 14, width: '100%', borderWidth: 1, borderColor: COLORS.orange + '44' },
  pointsTitle: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  pointsSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  bottomArea: { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
  trackBtn: { backgroundColor: COLORS.teal, borderRadius: 14, padding: 16, alignItems: 'center' },
  trackBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  homeBtn: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  homeBtnTxt: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
});
