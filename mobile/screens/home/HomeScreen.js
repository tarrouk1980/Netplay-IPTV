import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';
import usePassStore from '../../store/passStore';
import useNotificationStore from '../../store/notificationStore';
import ServiceCard from '../../components/ServiceCard';
import PassStatusCard from '../../components/PassStatusCard';
import AdBanner from '../../components/AdBanner';
import NotificationBadge from '../../components/NotificationBadge';
import EasywayLogo from '../../components/EasywayLogo';
import ServiceIcon from '../../components/ServiceIcon';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  primary: '#F5A623',
  red: '#D32F2F',
};

const SERVICES = [
  { key: 'EASYTAXY', iconService: 'EASYTAXY', title: 'EasyTaxy', subtitle: 'Réserver un taxi', color: '#F5A623' },
  { key: 'SOS', iconService: 'SOS', title: 'SOS', subtitle: 'Assistance en route', color: '#E74C3C' },
  { key: 'DELIVERY', iconService: 'DELIVERY', title: 'Livraison', subtitle: 'Livraison rapide', color: '#27AE60' },
  { key: 'GROCERY', iconService: 'GROCERY', title: 'Courses', subtitle: 'Livraison épicerie', color: '#8E44AD' },
  { key: 'BACKHOME', iconService: 'BACKHOME', title: 'Back Home', subtitle: 'Covoiturage retour', color: '#F5A623' },
];

// Offres du moment — fallback si API indisponible
const DEFAULT_PROMOS = [
  { id: 'p1', label: '🔥 -20% sur EasyTaxy', sub: 'Ce week-end seulement', color: '#F5A623', imageUrl: null, ctaUrl: null },
  { id: 'p2', label: '🚀 Livraison gratuite', sub: 'Commandes > 30 TND', color: '#27AE60', imageUrl: null, ctaUrl: null },
  { id: 'p3', label: '💎 Pass VIP -50%', sub: 'Offre limitée', color: '#D32F2F', imageUrl: null, ctaUrl: null },
  { id: 'p4', label: '🛵 EasyLady disponible', sub: 'Conductrices certifiées', color: '#E91E8C', imageUrl: null, ctaUrl: null },
  { id: 'p5', label: '🚑 SOS 24h/24', sub: 'Dépannage rapide en Tunisie', color: '#E74C3C', imageUrl: null, ctaUrl: null },
];

const STATUS_LABELS = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const STATUS_COLORS = {
  PENDING: '#F39C12',
  ACCEPTED: '#3498DB',
  IN_PROGRESS: '#27AE60',
  COMPLETED: '#8E8E9A',
  CANCELLED: '#E74C3C',
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { subscription, fetchSubscription } = usePassStore();
  const { unreadCount } = useNotificationStore();
  const [recentActivity, setRecentActivity] = useState([]);
  const [promos, setPromos] = useState(DEFAULT_PROMOS);
  const [heroBanner, setHeroBanner] = useState(null);
  const promoBannerRef = useRef(null);
  const [promoBannerIndex, setPromoBannerIndex] = useState(0);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await api.get('/api/users/me/activity');
      setRecentActivity(res.data.activity || []);
    } catch {
      // silently ignore
    }
  }, []);

  const fetchAds = useCallback(async () => {
    try {
      const [heroRes, promoRes] = await Promise.all([
        api.get('/api/ads?placement=home_hero&limit=1'),
        api.get('/api/ads?placement=home_promos&limit=8'),
      ]);
      const hero = (heroRes.data?.ads || heroRes.data || [])[0];
      if (hero) setHeroBanner(hero);
      const ads = promoRes.data?.ads || promoRes.data || [];
      if (ads.length > 0) {
        setPromos(ads.map((ad, i) => ({
          id: ad.id || `ad_${i}`,
          label: ad.title || '',
          sub: ad.description || '',
          color: ad.color || '#D32F2F',
          imageUrl: ad.imageUrl || null,
          ctaUrl: ad.ctaUrl || null,
        })));
      }
    } catch {
      // garder les defaults
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
    fetchActivity();
    fetchAds();

    if (!user?.role) return;

    const PROVIDER_ROLES = ['CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'];

    if (user.role === 'ADMIN') {
      navigation.replace('AdminDashboard');
      return;
    }

    if (PROVIDER_ROLES.includes(user.role)) {
      // Tout prestataire non encore approuvé → attente KYC
      if (user.kycStatus !== 'APPROVED') {
        navigation.replace('KYCPending');
        return;
      }
      // Prestataire approuvé → son tableau de bord
      if (user.role === 'CHAUFFEUR') navigation.replace('DriverDashboard');
      else if (user.role === 'LIVREUR') navigation.replace('LivreurDashboard');
      else if (user.role === 'DEPANNEUR') navigation.replace('DepanneurDashboard');
      else if (user.role === 'MARCHAND') navigation.replace('MerchantDashboard');
      return;
    }

    // CLIENT → reste sur HomeScreen (ne pas rediriger)
  }, [user?.role, user?.kycStatus]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const handleServicePress = (serviceKey) => {
    if (serviceKey === 'EASYTAXY') navigation.navigate('TaxiHome');
    else if (serviceKey === 'SOS') navigation.navigate('SOSHome');
    else if (serviceKey === 'DELIVERY') navigation.navigate('DeliveryHome');
    else if (serviceKey === 'GROCERY') navigation.navigate('GroceryHome');
    else if (serviceKey === 'BACKHOME') navigation.navigate('BackHomeRide');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Utilisateur'} 👋</Text>
          </View>

          {/* Logo centré */}
          <EasywayLogo size={40} showTagline={false} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NotificationBadge
              unreadCount={unreadCount}
              onPress={() => navigation.navigate('Notifications')}
            />
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pass Status — prestataires uniquement, jamais pour CLIENT */}
        {user?.role !== 'CLIENT' && (
          <PassStatusCard
            subscription={subscription}
            onBuyPass={() => navigation.navigate('BuyPass')}
          />
        )}

        {/* Ad Banner */}
        <AdBanner placement="HOME" style={{ marginHorizontal: 16, marginTop: 8 }} />

        {/* Services Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nos services</Text>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.key}
              icon={<ServiceIcon service={service.iconService} size={40} />}
              title={service.title}
              subtitle={service.subtitle}
              color={service.color}
              onPress={() => handleServicePress(service.key)}
            />
          ))}
        </View>

        {/* Bannière pub héro dynamique */}
        {heroBanner && (
          <TouchableOpacity
            style={styles.heroBanner}
            activeOpacity={0.9}
            onPress={() => heroBanner.ctaUrl && Linking.openURL(heroBanner.ctaUrl)}
          >
            {heroBanner.imageUrl ? (
              <Image source={{ uri: heroBanner.imageUrl }} style={styles.heroBannerImage} resizeMode="cover" />
            ) : (
              <View style={[styles.heroBannerFallback, { backgroundColor: heroBanner.color || '#D32F2F' }]}>
                <Text style={styles.heroBannerTitle}>{heroBanner.title || ''}</Text>
                <Text style={styles.heroBannerSub}>{heroBanner.description || ''}</Text>
                {heroBanner.ctaLabel && (
                  <View style={styles.heroBannerCta}>
                    <Text style={styles.heroBannerCtaText}>{heroBanner.ctaLabel}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Offres du moment */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Offres du moment</Text>
        </View>
        <ScrollView
          ref={promoBannerRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promosContainer}
          snapToInterval={196}
          decelerationRate="fast"
          onScroll={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / 196);
            setPromoBannerIndex(idx);
          }}
          scrollEventThrottle={16}
        >
          {promos.map((promo) => (
            <TouchableOpacity
              key={promo.id}
              style={[styles.promoCard, { borderLeftColor: promo.color }]}
              activeOpacity={0.85}
              onPress={() => promo.ctaUrl && Linking.openURL(promo.ctaUrl)}
            >
              {promo.imageUrl ? (
                <Image source={{ uri: promo.imageUrl }} style={styles.promoImage} resizeMode="cover" />
              ) : (
                <View style={[styles.promoColorBar, { backgroundColor: promo.color + '22' }]}>
                  <Text style={[styles.promoColorDot, { color: promo.color }]}>●</Text>
                </View>
              )}
              <Text style={styles.promoLabel} numberOfLines={2}>{promo.label}</Text>
              <Text style={styles.promoSub} numberOfLines={2}>{promo.sub}</Text>
              {promo.ctaUrl && (
                <Text style={[styles.promoCta, { color: promo.color }]}>En savoir plus →</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Dots pagination promos */}
        <View style={styles.promosDots}>
          {promos.map((_, i) => (
            <View key={i} style={[styles.promosDot, i === promoBannerIndex && styles.promosDotActive]} />
          ))}
        </View>

        {/* Activité récente */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
        </View>
        {recentActivity.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>Aucune activité récente</Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <View key={item.id} style={styles.activityRow}>
                <Text style={styles.activityEmoji}>{item.emoji}</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityLabel}>{item.label}</Text>
                  <Text style={styles.activityDate}>
                    {new Date(item.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={[styles.activityStatusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22', borderColor: STATUS_COLORS[item.status] }]}>
                  <Text style={[styles.activityStatusText, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status] || item.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 8,
  },
  greeting: { fontSize: 14, color: COLORS.textMuted },
  userName: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  heroBanner: { marginHorizontal: 16, marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  heroBannerImage: { width: '100%', height: 160, borderRadius: 16 },
  heroBannerFallback: { borderRadius: 16, padding: 24, minHeight: 120, justifyContent: 'center' },
  heroBannerTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  heroBannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 12 },
  heroBannerCta: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  heroBannerCtaText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  promosContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  promoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    width: 184,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  promoImage: { width: '100%', height: 90, borderRadius: 10, marginBottom: 10 },
  promoColorBar: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8, alignSelf: 'flex-start' },
  promoColorDot: { fontSize: 10 },
  promoLabel: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  promoSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  promoCta: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  promosDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 4 },
  promosDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2C2C3E' },
  promosDotActive: { backgroundColor: '#D32F2F', width: 18 },
  emptyActivity: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.surface,
    margin: 20,
    borderRadius: 16,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  activityList: { marginHorizontal: 16, marginBottom: 24, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.surface },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3A',
  },
  activityEmoji: { fontSize: 22, marginRight: 12 },
  activityInfo: { flex: 1 },
  activityLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  activityDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  activityStatusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  activityStatusText: { fontSize: 11, fontWeight: '700' },
});
