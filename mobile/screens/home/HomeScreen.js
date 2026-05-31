import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
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
];

// Offres du moment — placeholders pour AdBanner
const PROMOS = [
  { id: 'p1', label: '🔥 -20% sur EasyTaxy', sub: 'Ce week-end seulement', color: '#F5A623' },
  { id: 'p2', label: '🚀 Livraison gratuite', sub: 'Commandes > 30 TND', color: '#27AE60' },
  { id: 'p3', label: '💎 Pass VIP -50%', sub: 'Offre limitée', color: '#D32F2F' },
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

  const fetchActivity = useCallback(async () => {
    try {
      const res = await api.get('/api/users/me/activity');
      setRecentActivity(res.data.activity || []);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
    fetchActivity();

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

        {/* Offres du moment */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Offres du moment</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promosContainer}
        >
          {PROMOS.map((promo) => (
            <TouchableOpacity key={promo.id} style={[styles.promoCard, { borderLeftColor: promo.color }]} activeOpacity={0.85}>
              <Text style={styles.promoLabel}>{promo.label}</Text>
              <Text style={styles.promoSub}>{promo.sub}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
  promosContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  promoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    minWidth: 180,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  promoLabel: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  promoSub: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
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
