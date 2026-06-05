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
  green: '#27AE60',
};

const SLIDES = [
  {
    key: '1',
    emoji: '⚡',
    title: 'EASYWAY',
    subtitle: 'La super-app tunisienne',
    desc: 'Taxi, livraison, épicerie, dépannage — tout en une seule application. Zéro commission prélevée sur vos courses.',
    color: COLORS.accent,
  },
  {
    key: '2',
    emoji: '🚕',
    title: 'Taxi instantané',
    subtitle: 'En moins de 5 minutes',
    desc: 'Commandez un taxi standard, confort ou van. Suivez votre chauffeur en temps réel et payez en toute sécurité.',
    color: '#3498DB',
  },
  {
    key: '3',
    emoji: '📦',
    title: 'Livraison express',
    subtitle: 'Restau, épicerie, colis',
    desc: 'Faites livrer vos repas, courses ou colis depuis les meilleurs commerçants de votre ville.',
    color: COLORS.green,
  },
  {
    key: '4',
    emoji: '🔧',
    title: 'SOS Dépannage',
    subtitle: 'Intervention sous 20 min',
    desc: 'Panne, crevaison, batterie ? Nos dépanneurs certifiés interviennent rapidement où que vous soyez.',
    color: '#E74C3C',
  },
  {
    key: '5',
    emoji: '🛡️',
    title: 'Sécurisé & gratuit',
    subtitle: '0% de commission',
    desc: 'EasyWay ne prélève aucune commission. Les prestataires gardent 100% de leurs revenus. Rejoignez la révolution.',
    color: COLORS.accent,
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

      {/* Skip button */}
      <View style={styles.topBar}>
        <View style={{ width: 60 }} />
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIdx && styles.dotActive, i === currentIdx && { backgroundColor: slide.color }]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
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
            <View style={[styles.emojiCircle, { backgroundColor: s.color + '20', borderColor: s.color + '50' }]}>
              <Text style={styles.emojiText}>{s.emoji}</Text>
            </View>
            <Text style={[styles.slideTitle, { color: s.color }]}>{s.title}</Text>
            <Text style={styles.slideSubtitle}>{s.subtitle}</Text>
            <Text style={styles.slideDesc}>{s.desc}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {currentIdx === SLIDES.length - 1 ? 'Commencer →' : 'Suivant →'}
          </Text>
        </TouchableOpacity>

        {currentIdx === SLIDES.length - 1 && (
          <TouchableOpacity style={styles.signupBtn} onPress={() => { handleFinish(); }}>
            <Text style={styles.signupBtnText}>Créer un compte</Text>
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
    paddingHorizontal: 16, paddingVertical: 12,
  },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { width: 20, height: 6, borderRadius: 3 },
  skipBtn: { padding: 4 },
  skipText: { color: COLORS.muted, fontSize: 14 },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emojiCircle: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32, borderWidth: 2,
  },
  emojiText: { fontSize: 52 },
  slideTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  slideSubtitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  slideDesc: { color: COLORS.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  bottom: { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
  nextBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  signupBtn: {
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 14, alignItems: 'center',
  },
  signupBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
});
