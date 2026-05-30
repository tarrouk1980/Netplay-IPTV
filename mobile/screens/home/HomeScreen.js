import React, { useEffect } from 'react';
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
import NotificationBadge from '../../components/NotificationBadge';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  primary: '#F5A623',
};

const SERVICES = [
  { key: 'TAXI', emoji: '🚕', title: 'Taxi', subtitle: 'Réserver un taxi', color: '#F5A623' },
  { key: 'SOS', emoji: '🚨', title: 'SOS Remorquage', subtitle: 'Assistance en route', color: '#E74C3C' },
  { key: 'DELIVERY', emoji: '📦', title: 'Livraison', subtitle: 'Livraison rapide', color: '#27AE60' },
  { key: 'GROCERY', emoji: '🛒', title: 'Courses', subtitle: 'Livraison épicerie', color: '#8E44AD' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { subscription, fetchSubscription } = usePassStore();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const handleServicePress = (serviceKey) => {
    if (serviceKey === 'TAXI') navigation.navigate('TaxiHome');
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

        {/* Pass Status */}
        <PassStatusCard
          subscription={subscription}
          onBuyPass={() => navigation.navigate('BuyPass')}
        />

        {/* Services Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nos services</Text>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.key}
              emoji={service.emoji}
              title={service.title}
              subtitle={service.subtitle}
              color={service.color}
              onPress={() => handleServicePress(service.key)}
            />
          ))}
        </View>

        {/* Recent activity placeholder */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
        </View>
        <View style={styles.emptyActivity}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>Aucune activité récente</Text>
        </View>
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
  emptyActivity: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.surface,
    margin: 20,
    borderRadius: 16,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
