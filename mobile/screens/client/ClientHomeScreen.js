import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const SERVICES = [
  { key: 'taxi', icon: '🚕', label: 'Taxi', sub: 'Réservez une course', screen: 'TaxiHome', color: COLORS.accent },
  { key: 'delivery', icon: '🛵', label: 'Livraison', sub: 'Commandez à manger', screen: 'DeliveryHome', color: COLORS.orange },
  { key: 'grocery', icon: '🛒', label: 'Épicerie', sub: 'Courses à domicile', screen: 'GroceryHome', color: COLORS.green },
  { key: 'sos', icon: '🔧', label: 'SOS Dépannage', sub: 'Intervention rapide', screen: 'SOSHome', color: COLORS.red },
];

const MOCK_PROMOS = [
  { id: 'P1', title: '🎉 -20% sur votre première course', sub: 'Code : BIENVENUE20', color: COLORS.accent },
  { id: 'P2', title: '🛵 Livraison gratuite ce soir', sub: 'Entre 19h et 22h', color: COLORS.orange },
];

const MOCK_RECENT = [
  { id: 'R1', icon: '🚕', label: 'Taxi vers Aéroport', time: 'Aujourd\'hui', screen: 'TaxiHome' },
  { id: 'R2', icon: '🍕', label: 'Pizza Roma', time: 'Hier', screen: 'DeliveryHome' },
  { id: 'R3', icon: '🛒', label: 'Carrefour Market', time: 'Il y a 3j', screen: 'GroceryHome' },
];

export default function ClientHomeScreen({ navigation }) {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir');

    api.get('/api/client/home')
      .then(r => {
        setUserName(r.data.firstName || '');
        setActiveOrder(r.data.activeOrder || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}{userName ? `, ${userName}` : ''} 👋</Text>
          <Text style={styles.headerSub}>Où voulez-vous aller aujourd'hui ?</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('ClientNotifications')}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={{ fontSize: 22 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Active order banner */}
        {activeOrder && (
          <TouchableOpacity
            style={styles.activeOrderBanner}
            onPress={() => navigation.navigate(activeOrder.screen, { orderId: activeOrder.id })}
          >
            <Text style={{ fontSize: 20 }}>{activeOrder.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeOrderTitle}>{activeOrder.title}</Text>
              <Text style={styles.activeOrderSub}>{activeOrder.status}</Text>
            </View>
            <Text style={styles.activeOrderArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Services grid */}
        <View style={styles.servicesGrid}>
          {SERVICES.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.serviceCard, { borderColor: s.color + '40' }]}
              onPress={() => navigation.navigate(s.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.serviceIconBg, { backgroundColor: s.color + '15' }]}>
                <Text style={{ fontSize: 32 }}>{s.icon}</Text>
              </View>
              <Text style={styles.serviceLabel}>{s.label}</Text>
              <Text style={styles.serviceSub}>{s.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promos */}
        {MOCK_PROMOS.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OFFRES DU MOMENT</Text>
            {MOCK_PROMOS.map(p => (
              <View key={p.id} style={[styles.promoCard, { borderColor: p.color + '50', backgroundColor: p.color + '08' }]}>
                <Text style={[styles.promoTitle, { color: p.color }]}>{p.title}</Text>
                <Text style={styles.promoSub}>{p.sub}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RÉCEMMENT UTILISÉ</Text>
          <View style={styles.recentRow}>
            {MOCK_RECENT.map(r => (
              <TouchableOpacity key={r.id} style={styles.recentCard} onPress={() => navigation.navigate(r.screen)}>
                <Text style={{ fontSize: 26 }}>{r.icon}</Text>
                <Text style={styles.recentLabel} numberOfLines={1}>{r.label}</Text>
                <Text style={styles.recentTime}>{r.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MON COMPTE</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: '💳', label: 'Portefeuille', screen: 'Wallet' },
              { icon: '🎁', label: 'Parrainage', screen: 'ClientReferral' },
              { icon: '⭐', label: 'Fidélité', screen: 'ClientRewards' },
              { icon: '🆘', label: 'Urgences', screen: 'ClientEmergency' },
            ].map(q => (
              <TouchableOpacity key={q.screen} style={styles.quickCard} onPress={() => navigation.navigate(q.screen)}>
                <Text style={{ fontSize: 24 }}>{q.icon}</Text>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.commissionBanner}>
          <Text style={styles.commissionText}>⚡ EasyWay — Zéro commission sur toutes vos courses</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  greeting: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  headerSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 14 },
  activeOrderBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.accent + '15', borderBottomWidth: 1, borderColor: COLORS.accent + '40', paddingHorizontal: 16, paddingVertical: 12 },
  activeOrderTitle: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
  activeOrderSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  activeOrderArrow: { color: COLORS.accent, fontSize: 24, fontWeight: '300' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  serviceCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, gap: 8 },
  serviceIconBg: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  serviceLabel: { color: COLORS.text, fontSize: 14, fontWeight: '900' },
  serviceSub: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  section: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  promoCard: { borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1 },
  promoTitle: { fontSize: 14, fontWeight: '800' },
  promoSub: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  recentRow: { flexDirection: 'row', gap: 10 },
  recentCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border },
  recentLabel: { color: COLORS.text, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  recentTime: { color: COLORS.muted, fontSize: 10 },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border },
  quickLabel: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  commissionBanner: { marginHorizontal: 16, backgroundColor: COLORS.accent + '10', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.accent + '30' },
  commissionText: { color: COLORS.accent, fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
