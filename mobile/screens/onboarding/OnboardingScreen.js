import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

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

// ─── Slide fixe 1 — Logo EASYWAY ─────────────────────────────────────────────
const SLIDE_LOGO = {
  key: 'slide_logo',
  type: 'logo',
  titleWhite: 'Bienvenue sur ',
  titleEasy: 'EASY',
  titleWay: 'WAY',
  subtitle: 'La super-app tunisienne de mobilité et services.\n100% gratuite pour les utilisateurs.',
};

// ─── Slides pub par défaut (si API indisponible) ──────────────────────────────
const DEFAULT_AD_SLIDES = [
  {
    key: 'ad_taxi',
    type: 'banner',
    bg: '#1A1200',
    accent: '#F5A623',
    icon: '🚕',
    badge: 'NOUVEAU',
    badgeColor: '#F5A623',
    titleLine1: 'Réservez votre taxi',
    titleLine2: 'en 30 secondes',
    subtitle: 'Chauffeurs vérifiés · Prix fixe · Disponible 24h/24 · Zéro commission',
    features: ['✅ Pas de majoration', '✅ Paiement flexible', '✅ Suivi en temps réel'],
  },
  {
    key: 'ad_sos',
    type: 'banner',
    bg: '#1A0000',
    accent: '#E74C3C',
    icon: '🛻',
    badge: 'SOS',
    badgeColor: '#E74C3C',
    titleLine1: 'Dépannage rapide',
    titleLine2: 'où que vous soyez',
    subtitle: 'Panne · Crevaison · Batterie · Remorquage · Intervention en moins de 30 min',
    features: ['✅ Dépanneurs certifiés', '✅ Devis avant intervention', '✅ Paiement après'],
  },
  {
    key: 'ad_delivery',
    type: 'banner',
    bg: '#001A0A',
    accent: '#2ECC71',
    icon: '🛵',
    badge: 'LIVRAISON',
    badgeColor: '#2ECC71',
    titleLine1: 'Vos repas livrés',
    titleLine2: 'en moins de 45 min',
    subtitle: 'Restaurants · Épiceries · Pharmacies · Frais de livraison à partir de 2 TND',
    features: ['✅ Suivi livreur en direct', '✅ Commande groupée', '✅ Évaluation garantie'],
  },
  {
    key: 'ad_package',
    type: 'banner',
    bg: '#1A0E00',
    accent: '#E67E22',
    icon: '📦',
    badge: 'NOUVEAU',
    badgeColor: '#E67E22',
    titleLine1: 'Envoyez vos colis',
    titleLine2: 'partout en Tunisie',
    subtitle: 'Livraison colis express · Suivi en temps réel · Tarifs transparents · Sans engagement',
    features: ['✅ Enlèvement à domicile', '✅ Livraison J+1', '✅ Assurance incluse'],
  },
  {
    key: 'ad_zerocom',
    type: 'banner',
    bg: '#0A001A',
    accent: '#9B59B6',
    icon: '💎',
    badge: 'EXCLUSIF',
    badgeColor: '#9B59B6',
    titleLine1: 'Modèle zéro commission',
    titleLine2: 'unique en Tunisie',
    subtitle: 'Les prestataires paient 1 TND/jour max. L\'app est 100% gratuite pour les clients.',
    features: ['✅ EasyPass 29 TND/mois', '✅ EasyPoints & récompenses', '✅ Support 24/7'],
    isLast: true,
  },
];

// ─── Réseaux sociaux ──────────────────────────────────────────────────────────
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
      onPress={() => { if (item.url) Linking.openURL(item.url); }}
      activeOpacity={0.75}
    >
      <Text style={[styles.socialIcon, { color: item.color }]}>{item.icon}</Text>
    </TouchableOpacity>
  );
}

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
  const [slides, setSlides] = useState([SLIDE_LOGO, ...DEFAULT_AD_SLIDES]);
  const [adsLoading, setAdsLoading] = useState(true);

  // Charger les pubs depuis l'API
  useEffect(() => {
    const loadAds = async () => {
      try {
        const res = await api.get('/api/ads?placement=onboarding&limit=2');
        const ads = res.data?.ads || res.data || [];
        if (ads.length > 0) {
          const adSlides = ads.map((ad, i) => ({
            key: `ad_${ad.id || i}`,
            type: 'ad',
            imageUrl: ad.imageUrl || null,
            icon: ad.icon || '📢',
            titleWhite: ad.title || '',
            titleRed: ad.highlight || '',
            titleWhite2: '',
            subtitle: ad.description || '',
            cta: ad.ctaUrl || null,
            ctaLabel: ad.ctaLabel || 'En savoir plus',
            isLast: i === ads.length - 1,
          }));
          setSlides([SLIDE_LOGO, ...adSlides]);
        } else {
          setSlides([SLIDE_LOGO, ...DEFAULT_AD_SLIDES]);
        }
      } catch {
        setSlides([SLIDE_LOGO, ...DEFAULT_AD_SLIDES]);
      } finally {
        setAdsLoading(false);
      }
    };
    loadAds();
  }, []);

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    navigation.replace('Login');
  };

  const handleStart = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
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

      {item.type === 'banner' && (
        <View style={[styles.bannerCard, { borderColor: item.accent + '44', backgroundColor: item.bg }]}>
          <View style={[styles.bannerBadge, { backgroundColor: item.accent + '22', borderColor: item.accent }]}>
            <Text style={[styles.bannerBadgeText, { color: item.accent }]}>{item.badge}</Text>
          </View>
          <Text style={styles.bannerIcon}>{item.icon}</Text>
          <Text style={[styles.bannerTitle1, { color: item.accent }]}>{item.titleLine1}</Text>
          <Text style={styles.bannerTitle2}>{item.titleLine2}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <View style={styles.bannerFeatures}>
            {item.features.map((f, i) => (
              <Text key={i} style={[styles.bannerFeature, { color: item.accent }]}>{f}</Text>
            ))}
          </View>
          {item.isLast && (
            <TouchableOpacity style={[styles.startButton, { backgroundColor: item.accent }]} onPress={handleStart} activeOpacity={0.85}>
              <Text style={[styles.startButtonText, { color: '#0A0A0F' }]}>Commencer gratuitement 🚀</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {item.type === 'ad' && (
        <>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.adImage} resizeMode="cover" />
          ) : (
            <Text style={styles.adIcon}>{item.icon}</Text>
          )}
          <View style={styles.titleRow}>
            {item.titleWhite ? <Text style={styles.slideTitle}>{item.titleWhite}</Text> : null}
            {item.titleRed ? <Text style={[styles.slideTitle, styles.titleWay]}>{item.titleRed}</Text> : null}
            {item.titleWhite2 ? <Text style={styles.slideTitle}>{item.titleWhite2}</Text> : null}
          </View>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          {item.cta && (
            <TouchableOpacity style={styles.ctaBtn} onPress={() => Linking.openURL(item.cta)} activeOpacity={0.85}>
              <Text style={styles.ctaBtnText}>{item.ctaLabel || 'En savoir plus'}</Text>
            </TouchableOpacity>
          )}
          {item.isLast && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
              <Text style={styles.startButtonText}>Commencer gratuitement</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  if (adsLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
        <EasywayBigLogo size={120} />
        <ActivityIndicator color="#D32F2F" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <LogoText />
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.75}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderSlide}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Pagination dots + Next */}
      <View style={styles.bottomBar}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer SNS + copyright */}
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
  adImage: {
    width: width - 48,
    height: 180,
    borderRadius: 16,
    marginBottom: 28,
  },
  adIcon: { fontSize: 80, marginBottom: 32 },
  bannerCard: { width: width - 32, borderRadius: 24, borderWidth: 1.5, padding: 24, alignItems: 'center' },
  bannerBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 16 },
  bannerBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  bannerIcon: { fontSize: 70, marginBottom: 12 },
  bannerTitle1: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  bannerTitle2: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  bannerSubtitle: { color: '#8E8E9A', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  bannerFeatures: { width: '100%', gap: 6, marginBottom: 20 },
  bannerFeature: { fontSize: 13, fontWeight: '600' },
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
    marginBottom: 24,
  },
  ctaBtn: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#D32F2F',
    marginBottom: 12,
  },
  ctaBtnText: { color: '#D32F2F', fontWeight: '700', fontSize: 14 },
  startButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 8,
  },
  startButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  bottomBar: { alignItems: 'center', paddingBottom: 12, gap: 12 },
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
  footer: { alignItems: 'center', paddingBottom: 24, paddingHorizontal: 20, gap: 8 },
  socialsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
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
