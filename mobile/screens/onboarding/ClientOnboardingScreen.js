import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

// EasyWay vector logo — drawn with Views, no image asset
function EasyWayLogo({ size = 90, color = COLORS.accent }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: Math.max(2, size * 0.03), borderColor: color + '50',
      }} />
      <View style={{
        position: 'absolute', width: size * 0.78, height: size * 0.78, borderRadius: size * 0.39,
        borderWidth: Math.max(1, size * 0.02), borderColor: color + '25',
      }} />
      {/* Top bolt */}
      <View style={{
        position: 'absolute', top: size * 0.14, left: size * 0.52,
        width: size * 0.28, height: size * 0.36, backgroundColor: color,
        transform: [{ skewX: '-20deg' }], borderRadius: size * 0.03,
      }} />
      {/* Bottom bolt */}
      <View style={{
        position: 'absolute', top: size * 0.46, left: size * 0.24,
        width: size * 0.28, height: size * 0.36, backgroundColor: color,
        transform: [{ skewX: '-20deg' }], borderRadius: size * 0.03,
      }} />
      {/* Bridge */}
      <View style={{
        position: 'absolute', top: size * 0.38, left: size * 0.3,
        width: size * 0.44, height: size * 0.12, backgroundColor: color,
        transform: [{ skewX: '-20deg' }], borderRadius: size * 0.02,
      }} />
    </View>
  );
}

const SLIDES = [
  {
    key: 'welcome',
    color: COLORS.accent,
    hero: 'logo',
    title: 'Bienvenue sur\nEASYWAY',
    subtitle: 'La super-app tunisienne qui révolutionne le transport et les services.',
    features: [],
  },
  {
    key: 'taxi',
    color: COLORS.blue,
    hero: 'grid',
    heroItems: [
      { icon: '🚗', label: 'Berline' },
      { icon: '🚐', label: 'Van 7 pl.' },
      { icon: '🚘', label: 'Premium' },
      { icon: '📅', label: 'Planifié' },
    ],
    title: 'Taxi en 5 minutes',
    subtitle: 'Commandez un taxi standard, confort ou van. Suivi GPS en temps réel, paiement flexible.',
    features: ['Trajet immédiat ou programmé', 'Suivi chauffeur en direct', 'Paiement espèces ou wallet'],
  },
  {
    key: 'services',
    color: COLORS.green,
    hero: 'grid',
    heroItems: [
      { icon: '🍕', label: 'Restaurants' },
      { icon: '🛒', label: 'Épicerie' },
      { icon: '📦', label: 'Colis' },
      { icon: '🔧', label: 'SOS 24h' },
    ],
    title: 'Tous vos services\nen un clic',
    subtitle: 'Livraison de repas, courses, colis et dépannage — une seule app pour tout.',
    features: ['🛵 Livraison de repas express', '🛒 Courses supermarché', '🔧 Dépannage & remorquage'],
  },
  {
    key: 'free',
    color: COLORS.accent,
    hero: 'perks',
    heroItems: [
      { icon: '💰', label: '0% commission' },
      { icon: '🔒', label: 'Paiement sécurisé' },
      { icon: '⭐', label: 'Avis vérifiés' },
      { icon: '🎁', label: 'EasyPoints' },
    ],
    title: '100% gratuit\npour vous',
    subtitle: 'EasyWay ne prend aucune commission. Vous payez uniquement votre service.',
    features: ['Aucune commission cachée', 'Prix directs prestataires', 'Gagnez des EasyPoints'],
  },
  {
    key: 'ready',
    color: COLORS.accent,
    hero: 'logo',
    title: 'Prêt à démarrer !',
    subtitle: 'Rejoignez des milliers de Tunisiens qui utilisent EasyWay chaque jour.',
    features: [],
    cta: true,
  },
];

function SlideHero({ slide }) {
  if (slide.hero === 'logo') {
    return (
      <View style={styles.logoContainer}>
        <View style={[styles.logoBg, { backgroundColor: slide.color + '12', borderColor: slide.color + '30' }]}>
          <EasyWayLogo size={100} color={slide.color} />
        </View>
        <Text style={[styles.brandName, { color: slide.color }]}>EASYWAY</Text>
        <Text style={styles.brandTagline}>La super-app tunisienne</Text>
      </View>
    );
  }
  return (
    <View style={styles.gridHero}>
      {(slide.heroItems || []).map((item, i) => (
        <View key={i} style={[styles.heroGridItem, { borderColor: slide.color + '30', backgroundColor: slide.color + '10' }]}>
          <Text style={{ fontSize: 30 }}>{item.icon}</Text>
          <Text style={[styles.heroGridLabel, { color: slide.color }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Slide({ slide }) {
  return (
    <View style={[styles.slide, { width }]}>
      <SlideHero slide={slide} />
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.subtitle}>{slide.subtitle}</Text>
      {slide.features.length > 0 && (
        <View style={styles.features}>
          {slide.features.map((f, i) => (
            <View key={i} style={[styles.featureRow, { borderColor: slide.color + '30' }]}>
              <View style={[styles.featureDot, { backgroundColor: slide.color }]} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Dots({ count, active, color }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[
          styles.dot,
          { backgroundColor: i === active ? color : COLORS.border },
          i === active && { width: 24 },
        ]} />
      ))}
    </View>
  );
}

export default function ClientOnboardingScreen({ navigation }) {
  const [current, setCurrent] = useState(0);
  const listRef = useRef(null);
  const slide = SLIDES[current];

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrent(next);
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    navigation.replace('Login');
  };

  const isLast = current === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {!isLast && (
        <SafeAreaView style={styles.skipContainer}>
          <TouchableOpacity onPress={finish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => <Slide slide={item} />}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      />

      <SafeAreaView style={styles.footer}>
        <Dots count={SLIDES.length} active={current} color={slide.color} />

        {isLast ? (
          <View style={styles.ctaGroup}>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: slide.color }]}
              onPress={finish}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnText}>🚀 Créer un compte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginBtn} onPress={finish}>
              <Text style={styles.loginBtnText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: slide.color }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  skipContainer: { position: 'absolute', top: 0, right: 0, zIndex: 10 },
  skipBtn: { padding: 16, paddingTop: 50 },
  skipText: { color: COLORS.muted, fontSize: 14 },
  slide: {
    minHeight: height * 0.65, paddingHorizontal: 28,
    paddingTop: 60, alignItems: 'center',
  },
  logoContainer: { alignItems: 'center', marginBottom: 28 },
  logoBg: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, marginBottom: 16,
  },
  brandName: { fontSize: 32, fontWeight: '900', letterSpacing: 4, marginBottom: 4 },
  brandTagline: { color: COLORS.muted, fontSize: 13 },
  gridHero: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    justifyContent: 'center', marginBottom: 28,
  },
  heroGridItem: {
    width: 120, alignItems: 'center', gap: 8, borderRadius: 18,
    padding: 16, borderWidth: 1,
  },
  heroGridLabel: { fontSize: 12, fontWeight: '800' },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 14, lineHeight: 34 },
  subtitle: { color: COLORS.muted, fontSize: 15, textAlign: 'center', lineHeight: 23, marginBottom: 24 },
  features: { width: '100%', gap: 10 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 13, borderWidth: 1,
  },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nextBtn: { borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  ctaGroup: { gap: 12 },
  ctaBtn: { borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  ctaBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  loginBtn: { paddingVertical: 13, alignItems: 'center' },
  loginBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
});
