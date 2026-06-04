import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

// EasyWay logo rendered purely with View components — no image file needed
function EasyWayLogo({ size = 100, color = COLORS.accent }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer ring */}
      <View style={{
        position: 'absolute', width: s, height: s, borderRadius: s / 2,
        borderWidth: s * 0.03, borderColor: color + '40',
      }} />
      {/* Inner ring */}
      <View style={{
        position: 'absolute', width: s * 0.78, height: s * 0.78, borderRadius: s * 0.39,
        borderWidth: s * 0.02, borderColor: color + '25',
      }} />
      {/* Lightning bolt — top segment */}
      <View style={{
        position: 'absolute',
        top: s * 0.14, left: s * 0.52,
        width: s * 0.28, height: s * 0.36,
        backgroundColor: color,
        transform: [{ skewX: '-20deg' }],
        borderRadius: s * 0.03,
      }} />
      {/* Lightning bolt — bottom segment */}
      <View style={{
        position: 'absolute',
        top: s * 0.46, left: s * 0.24,
        width: s * 0.28, height: s * 0.36,
        backgroundColor: color,
        transform: [{ skewX: '-20deg' }],
        borderRadius: s * 0.03,
      }} />
      {/* Center bridge */}
      <View style={{
        position: 'absolute',
        top: s * 0.38, left: s * 0.3,
        width: s * 0.44, height: s * 0.12,
        backgroundColor: color,
        transform: [{ skewX: '-20deg' }],
        borderRadius: s * 0.02,
      }} />
    </View>
  );
}

function ServiceIcon({ icon, label, color }) {
  return (
    <View style={[styles.serviceItem, { borderColor: color + '30' }]}>
      <View style={[styles.serviceIconBox, { backgroundColor: color + '15' }]}>
        <Text style={{ fontSize: 26 }}>{icon}</Text>
      </View>
      <Text style={styles.serviceLabel}>{label}</Text>
    </View>
  );
}

const SLIDES = [
  {
    key: '1',
    color: COLORS.accent,
    logoColor: COLORS.accent,
    showLogo: true,
    title: 'EASYWAY',
    tag: 'La super-app tunisienne',
    desc: 'Taxi, livraison, épicerie, dépannage — tout en une seule application. Première plateforme à 0% de commission.',
    services: null,
  },
  {
    key: '2',
    color: '#3498DB',
    logoColor: '#3498DB',
    showLogo: false,
    title: 'Taxi en 5 minutes',
    tag: '🚕 Transport',
    desc: 'Réservez un taxi immédiatement ou planifiez vos courses à l\'avance. Suivi GPS en temps réel.',
    services: [
      { icon: '🚗', label: 'Berline', color: '#3498DB' },
      { icon: '🚐', label: 'Van 7 pl.', color: '#3498DB' },
      { icon: '🚘', label: 'Premium', color: '#3498DB' },
      { icon: '📅', label: 'Planifié', color: '#3498DB' },
    ],
  },
  {
    key: '3',
    color: COLORS.green,
    logoColor: COLORS.green,
    showLogo: false,
    title: 'Livraison Express',
    tag: '📦 Livraison & Épicerie',
    desc: 'Commandez depuis les meilleurs restaurants ou faites vos courses. Livraison en moins de 30 min.',
    services: [
      { icon: '🍕', label: 'Restaurants', color: COLORS.green },
      { icon: '🛒', label: 'Épicerie', color: COLORS.green },
      { icon: '📦', label: 'Colis', color: COLORS.green },
      { icon: '⚡', label: 'Express', color: COLORS.green },
    ],
  },
  {
    key: '4',
    color: COLORS.red,
    logoColor: COLORS.red,
    showLogo: false,
    title: 'SOS Dépannage 24h',
    tag: '🔧 Assistance Routière',
    desc: 'Panne, crevaison, batterie vide ? Nos dépanneurs certifiés interviennent en moins de 20 minutes.',
    services: [
      { icon: '🔋', label: 'Batterie', color: COLORS.red },
      { icon: '🔧', label: 'Crevaison', color: COLORS.red },
      { icon: '🚛', label: 'Remorquage', color: COLORS.red },
      { icon: '⛽', label: 'Carburant', color: COLORS.red },
    ],
  },
  {
    key: '5',
    color: COLORS.accent,
    logoColor: COLORS.accent,
    showLogo: true,
    title: '0% Commission',
    tag: '✅ Révolution tunisienne',
    desc: 'EasyWay ne prélève aucune commission. Les prestataires gardent 100% de leurs revenus. Rejoignez des milliers d\'utilisateurs.',
    services: null,
    perks: [
      { icon: '💰', text: 'Zéro commission' },
      { icon: '🔒', text: 'Paiement sécurisé' },
      { icon: '⭐', text: 'Note & avis vérifiés' },
      { icon: '🎁', text: 'Programme fidélité' },
    ],
  },
];

export default function OnboardingScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleNext = () => {
    if (currentIdx < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIdx + 1) * width, animated: true });
      setCurrentIdx(i => i + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true').catch(() => {});
    navigation.replace('Login');
  };

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIdx(idx);
  };

  const slide = SLIDES[currentIdx];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.topBar}>
        <View style={{ width: 60 }} />
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIdx ? slide.color : COLORS.border },
                i === currentIdx && { width: 24 },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s) => (
          <View key={s.key} style={styles.slide}>
            {/* Hero area */}
            <View style={styles.heroArea}>
              {s.showLogo ? (
                <View style={styles.logoWrapper}>
                  <View style={[styles.logoBg, { backgroundColor: s.color + '12', borderColor: s.color + '30' }]}>
                    <EasyWayLogo size={110} color={s.color} />
                  </View>
                </View>
              ) : (
                <View style={styles.serviceGrid}>
                  {(s.services || []).map((sv, i) => (
                    <ServiceIcon key={i} icon={sv.icon} label={sv.label} color={sv.color} />
                  ))}
                </View>
              )}
            </View>

            {/* Text area */}
            <View style={styles.textArea}>
              <View style={[styles.tagPill, { backgroundColor: s.color + '18', borderColor: s.color + '35' }]}>
                <Text style={[styles.tagText, { color: s.color }]}>{s.tag}</Text>
              </View>
              <Text style={styles.slideTitle}>{s.title}</Text>
              <Text style={styles.slideDesc}>{s.desc}</Text>

              {s.perks && (
                <View style={styles.perksGrid}>
                  {s.perks.map((p, i) => (
                    <View key={i} style={[styles.perkCard, { borderColor: s.color + '25' }]}>
                      <Text style={{ fontSize: 22 }}>{p.icon}</Text>
                      <Text style={styles.perkText}>{p.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.color }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentIdx === SLIDES.length - 1 ? '🚀 Commencer' : 'Suivant →'}
          </Text>
        </TouchableOpacity>

        {currentIdx === SLIDES.length - 1 && (
          <TouchableOpacity style={styles.loginBtn} onPress={handleFinish}>
            <Text style={styles.loginBtnText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  skipBtn: { padding: 6 },
  skipText: { color: COLORS.muted, fontSize: 14 },
  slide: { width, flex: 1, paddingHorizontal: 24 },
  heroArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  logoWrapper: { alignItems: 'center' },
  logoBg: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  serviceGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 16,
    justifyContent: 'center', paddingHorizontal: 10,
  },
  serviceItem: {
    width: 110, alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 16, borderWidth: 1,
  },
  serviceIconBox: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  serviceLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  textArea: { paddingBottom: 8 },
  tagPill: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, marginBottom: 12 },
  tagText: { fontSize: 12, fontWeight: '800' },
  slideTitle: { color: COLORS.text, fontSize: 30, fontWeight: '900', marginBottom: 12, lineHeight: 36 },
  slideDesc: { color: COLORS.muted, fontSize: 14, lineHeight: 22, marginBottom: 16 },
  perksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  perkCard: {
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, borderWidth: 1,
  },
  perkText: { color: COLORS.text, fontSize: 12, fontWeight: '700', flex: 1 },
  bottom: { paddingHorizontal: 24, paddingBottom: 20, gap: 10 },
  nextBtn: { borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  loginBtn: { paddingVertical: 12, alignItems: 'center' },
  loginBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
});
