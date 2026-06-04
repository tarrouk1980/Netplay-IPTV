import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const COLORS = {
  bg: '#0A0A0F', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
};

const SLIDES = [
  {
    key: 'welcome',
    emoji: '👋',
    title: 'Bienvenue sur EASYWAY',
    subtitle: 'La super-application tunisienne de transport et services à domicile.',
    bg: '#0A0A0F',
    accent: '#F5A623',
    features: [],
  },
  {
    key: 'taxi',
    emoji: '🚕',
    title: 'Taxi & Transport',
    subtitle: 'Réservez un taxi en quelques secondes. Suivi en temps réel, prix transparent, paiement flexible.',
    bg: '#0A0A0F',
    accent: '#F5A623',
    features: ['Trajet immédiat ou programmé', 'Suivi GPS en direct', 'Paiement espèces ou wallet'],
  },
  {
    key: 'services',
    emoji: '⚡',
    title: 'SOS · Livraison · Courses',
    subtitle: 'Dépannage 24h/24, livraison de repas et courses à domicile. Tout en une seule application.',
    bg: '#0A0A0F',
    accent: '#D32F2F',
    features: ['🛻 Dépannage & remorquage', '🛵 Livraison de repas', '🛒 Courses supermarché'],
  },
  {
    key: 'free',
    emoji: '💸',
    title: '100% gratuit pour vous',
    subtitle: 'EASYWAY ne prend aucune commission. Les prestataires paient 1 TND/jour. Vous payez uniquement votre service.',
    bg: '#0A0A0F',
    accent: '#27AE60',
    features: ['Aucune commission cachée', 'Prix directs prestataires', 'EasyPoints à chaque trajet'],
  },
  {
    key: 'ready',
    emoji: '🎉',
    title: 'C\'est parti !',
    subtitle: 'Créez votre compte ou connectez-vous pour commencer à utiliser EASYWAY.',
    bg: '#0A0A0F',
    accent: '#F5A623',
    features: [],
    cta: true,
  },
];

function Slide({ slide }) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.emojiContainer}>
        <View style={[styles.emojiCircle, { backgroundColor: slide.accent + '20', borderColor: slide.accent + '40' }]}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>
      </View>

      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.subtitle}>{slide.subtitle}</Text>

      {slide.features.length > 0 && (
        <View style={styles.features}>
          {slide.features.map((f, i) => (
            <View key={i} style={[styles.featureRow, { borderColor: slide.accent + '30' }]}>
              <View style={[styles.featureDot, { backgroundColor: slide.accent }]} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Dots({ count, active, accent }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === active ? accent : COLORS.muted,
              width: i === active ? 24 : 8,
            },
          ]}
        />
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

  const skip = async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    navigation.replace('Login');
  };

  const isLast = current === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Skip */}
      {!isLast && (
        <SafeAreaView style={styles.skipContainer}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
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
        <Dots count={SLIDES.length} active={current} accent={slide.accent} />

        {isLast ? (
          <View style={styles.ctaGroup}>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: slide.accent }]}
              onPress={finish}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnText}>Créer un compte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginBtn} onPress={finish}>
              <Text style={styles.loginBtnText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: slide.accent }]}
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
  skipText: { color: COLORS.muted, fontSize: 15 },
  slide: {
    flex: 1, minHeight: height * 0.7, paddingHorizontal: 32,
    paddingTop: 80, alignItems: 'center',
  },
  emojiContainer: { marginBottom: 32 },
  emojiCircle: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  emoji: { fontSize: 72 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 16, lineHeight: 34 },
  subtitle: { color: COLORS.muted, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  features: { width: '100%', gap: 10 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1C1C28', borderRadius: 12, padding: 14,
    borderWidth: 1,
  },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingBottom: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  nextBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  ctaGroup: { gap: 12 },
  ctaBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  ctaBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  loginBtn: { paddingVertical: 14, alignItems: 'center' },
  loginBtnText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
});
