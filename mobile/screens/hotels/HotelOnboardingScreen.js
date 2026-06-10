import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  FlatList, Animated, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    title: 'Comparez les meilleurs prix',
    subtitle: 'Jusqu\'à 5 sites comparés en temps réel. Booking, Expedia, Hotels.com et plus.',
    icon: 'pricetag',
    iconBg: '#FF6B35',
    gradient: ['#004E89', '#1a6eac'],
    iconName1: 'pricetag',
    iconName2: 'cash',
    iconName3: 'trending-down',
  },
  {
    key: '2',
    title: 'Des centaines d\'hôtels vérifiés',
    subtitle: 'Tunisie, Paris, Dubai et plus. Des avis authentiques de milliers de voyageurs.',
    icon: 'bed',
    iconBg: '#004E89',
    gradient: ['#1a6eac', '#004E89'],
    iconName1: 'bed',
    iconName2: 'star',
    iconName3: 'people',
  },
  {
    key: '3',
    title: 'Alertes prix en temps réel',
    subtitle: 'Définissez votre budget. Recevez une notification dès que le prix baisse.',
    icon: 'notifications',
    iconBg: '#276749',
    gradient: ['#004E89', '#FF6B35'],
    iconName1: 'notifications',
    iconName2: 'alarm',
    iconName3: 'checkmark-circle',
  },
];

export default function HotelOnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentIdx, setCurrentIdx] = useState(0);
  const flatRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function goNext() {
    if (currentIdx < SLIDES.length - 1) {
      const next = currentIdx + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIdx(next);
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }

  async function finish() {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(async () => {
      await AsyncStorage.setItem('hotelOnboardingDone', '1');
      navigation.replace('HotelSearch');
    });
  }

  const slide = SLIDES[currentIdx];

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={slide.gradient} style={{ flex: 1 }}>

        {/* Skip button */}
        <View style={[styles.skipRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={finish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        </View>

        {/* Illustration area */}
        <View style={styles.illustrationArea}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <View style={[styles.iconCircleInner, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={slide.icon} size={60} color="#fff" />
            </View>
          </View>

          {/* Floating secondary icons */}
          <View style={[styles.floatIcon, styles.floatIconTL]}>
            <Ionicons name={slide.iconName1} size={22} color="rgba(255,255,255,0.7)" />
          </View>
          <View style={[styles.floatIcon, styles.floatIconTR]}>
            <Ionicons name={slide.iconName2} size={22} color="rgba(255,255,255,0.7)" />
          </View>
          <View style={[styles.floatIcon, styles.floatIconBL]}>
            <Ionicons name={slide.iconName3} size={22} color="rgba(255,255,255,0.7)" />
          </View>
          <View style={[styles.floatIcon, styles.floatIconBR]}>
            <Ionicons name="shield-checkmark" size={22} color="rgba(255,255,255,0.7)" />
          </View>
        </View>

        {/* Content */}
        <View style={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
          <View style={styles.textCard}>
            <Text style={styles.slideNumber}>{currentIdx + 1} / {SLIDES.length}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dot, i === currentIdx && styles.dotActive]}
                onPress={() => {
                  flatRef.current?.scrollToIndex({ index: i, animated: true });
                  setCurrentIdx(i);
                }}
              />
            ))}
          </View>

          {/* CTA Button */}
          {currentIdx < SLIDES.length - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>Suivant</Text>
              <Ionicons name="arrow-forward" size={18} color="#FF6B35" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startBtn} onPress={finish} activeOpacity={0.85}>
              <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.startBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.startBtnText}>Commencer</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Hidden FlatList for scroll position tracking */}
          <FlatList
            ref={flatRef}
            data={SLIDES}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            keyExtractor={s => s.key}
            renderItem={() => null}
            style={{ height: 0 }}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skipRow: { paddingHorizontal: 20, alignItems: 'flex-end' },
  skipBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 },
  skipText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13 },
  illustrationArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
  },
  iconCircleInner: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
  },
  floatIcon: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
  },
  floatIconTL: { top: '10%', left: '8%' },
  floatIconTR: { top: '10%', right: '8%' },
  floatIconBL: { bottom: '10%', left: '8%' },
  floatIconBR: { bottom: '10%', right: '8%' },
  content: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    gap: 20,
  },
  textCard: { gap: 10 },
  slideNumber: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 34 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 24, backgroundColor: '#fff' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16,
  },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#FF6B35' },
  startBtn: { borderRadius: 16, overflow: 'hidden' },
  startBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  startBtnText: { fontSize: 17, fontWeight: '900', color: '#fff' },
});
