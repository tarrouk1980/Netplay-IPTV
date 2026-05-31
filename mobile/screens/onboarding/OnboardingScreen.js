import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Rect, Path, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ─── EASYWAY Logo SVG ────────────────────────────────────────────────────────
function EasywayBigLogo({ size = 100 }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      <View style={{
        backgroundColor: '#1C1C28',
        borderRadius: size * 0.22,
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#D32F2F',
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: size * 0.22, fontWeight: '900', letterSpacing: 1 }}>
          EASY
        </Text>
        <Text style={{ color: '#D32F2F', fontSize: size * 0.22, fontWeight: '900', letterSpacing: 1 }}>
          WAY
        </Text>
      </View>
    </View>
  );
}

// ─── Slide icons ─────────────────────────────────────────────────────────────
function TowTruckIcon({ size = 80 }) {
  return (
    <Text style={{ fontSize: size, marginBottom: 32 }}>🚚</Text>
  );
}

function ScooterIcon({ size = 80 }) {
  return (
    <Text style={{ fontSize: size, marginBottom: 32 }}>🛵</Text>
  );
}

// ─── Slides data ──────────────────────────────────────────────────────────────
const SLIDES = [
  {
    key: 'slide1',
    type: 'logo',
    titleWhite: 'Bienvenue sur ',
    titleEasy: 'EASY',
    titleWay: 'WAY',
    subtitle: 'La super-app tunisienne de mobilité et services.\n100% gratuite pour les utilisateurs.',
  },
  {
    key: 'slide2',
    type: 'services',
    titleWhite: 'Taxi · ',
    titleRed: 'SOS',
    titleWhite2: ' · Livraison',
    subtitle: 'Tous vos services en un seul endroit, disponibles 24h/24',
    icons: ['🚕', '🚚', '🛵'],
  },
  {
    key: 'slide3',
    type: 'pass',
    icon: '💳',
    titleWhite: 'Modèle ',
    titleRed: 'Zéro Commission',
    subtitle: 'Les prestataires payent seulement 1 TND/jour.\nLes clients utilisent l\'app gratuitement.',
    isLast: true,
  },
];

// ─── Social Media Links — pages officielles EASYWAY (à configurer) ───────────
const SOCIALS = [
  { name: 'Facebook', icon: 'f', color: '#1877F2', url: null },
  { name: 'Instagram', icon: '📸', color: '#E1306C', url: null },
  { name: 'TikTok', icon: '♪', color: '#FFFFFF', url: null },
  { name: 'YouTube', icon: '▶', color: '#FF0000', url: null },
  { name: 'LinkedIn', icon: 'in', color: '#0A66C2', url: null },
];

function SocialButton({ item }) {
  return (
    <TouchableOpacity
      style={[styles.socialBtn, { borderColor: item.color, opacity: 0.4 }]}
      onPress={() => {
        if (item.url) Linking.openURL(item.url);
        // Pages EASYWAY en cours de création — bientôt disponibles
      }}
      activeOpacity={0.75}
    >
      <Text style={[styles.socialIcon, { color: item.color }]}>{item.icon}</Text>
    </TouchableOpacity>
  );
}

// ─── Header Logo ─────────────────────────────────────────────────────────────
function LogoText() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.logoEasy}>EASY</Text>
      <Text style={styles.logoWay}>WAY</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingScreen({ navigation }) {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    navigation.replace('Login');
  };

  const handleStart = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      {item.type === 'logo' && (
        <>
          <EasywayBigLogo size={140} />
          <View style={styles.titleRow}>
            <Text style={styles.slideTitle}>{item.titleWhite}</Text>
            <Text style={[styles.slideTitle, styles.titleEasy]}>{item.titleEasy}</Text>
            <Text style={[styles.slideTitle, styles.titleWay]}>{item.titleWay}</Text>
          </View>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </>
      )}

      {item.type === 'services' && (
        <>
          <View style={styles.iconsRow}>
            {item.icons.map((ic, i) => (
              <Text key={i} style={styles.serviceIcon}>{ic}</Text>
            ))}
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.slideTitle}>{item.titleWhite}</Text>
            <Text style={[styles.slideTitle, styles.titleWay]}>{item.titleRed}</Text>
            <Text style={styles.slideTitle}>{item.titleWhite2}</Text>
          </View>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </>
      )}

      {item.type === 'pass' && (
        <>
          <Text style={styles.slideIconLarge}>{item.icon}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.slideTitle}>{item.titleWhite}</Text>
            <Text style={[styles.slideTitle, styles.titleWay]}>{item.titleRed}</Text>
          </View>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.startButtonText}>Commencer gratuitement</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <LogoText />
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.75}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderSlide}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Pagination dots + Next button */}
      <View style={styles.bottomBar}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Social media + copyright */}
      <View style={styles.footer}>
        <View style={styles.socialsRow}>
          {SOCIALS.map((s) => (
            <SocialButton key={s.name} item={s} />
          ))}
        </View>
        <Text style={styles.copyright}>© 2025 EASYWAY. Tous droits réservés.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  logoEasy: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  logoWay: { color: '#D32F2F', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  skipText: { color: '#8E8E9A', fontSize: 14, fontWeight: '500' },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 40,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  serviceIcon: { fontSize: 52 },
  slideIconLarge: { fontSize: 80, marginBottom: 32 },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
  },
  titleEasy: { color: '#FFFFFF' },
  titleWay: { color: '#D32F2F' },
  slideSubtitle: {
    color: '#8E8E9A',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 8,
  },
  startButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 12,
    gap: 12,
  },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2C2C3E' },
  dotActive: { backgroundColor: '#D32F2F', width: 24 },
  nextBtn: {
    backgroundColor: '#1C1C28',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  nextBtnText: { color: '#D32F2F', fontWeight: '700', fontSize: 14 },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  socialsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  socialBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C28',
  },
  socialIcon: { fontSize: 13, fontWeight: '800' },
  copyright: { color: '#4A4A5A', fontSize: 11 },
});
