import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_PROFILE = {
  name: 'Tarek Tarrouk', role: 'CHAUFFEUR', zone: 'Tunis Centre',
  rating: 4.9, completedToday: 7, earningsToday: 84.50,
  online: true, vehicle: 'Clio 5 Grise · TUN-2234',
};

const MOCK_REQUESTS = [
  {
    id: 1, type: 'taxi', clientName: 'Sana B.', distance: '0.8 km',
    fare: 14.50, from: 'Av. Bourguiba', to: 'La Marsa', eta: '3 min', urgent: false,
  },
  {
    id: 2, type: 'sos', clientName: 'Karim M.', distance: '2.1 km',
    fare: 65.00, from: 'Route Soukra', to: 'Garage', eta: '7 min', urgent: true,
  },
];

const MOCK_HISTORY = [
  { id: 1, client: 'Amira T.', fare: 12.00, time: '14:42', type: 'taxi', rating: 5 },
  { id: 2, client: 'Youssef L.', fare: 9.50, time: '13:10', type: 'taxi', rating: null },
  { id: 3, client: 'Ines K.', fare: 18.00, time: '11:35', type: 'taxi', rating: 4 },
];

export default function ProviderHomeScreen({ navigation }) {
  const [online, setOnline] = useState(MOCK_PROFILE.online);
  const [activeRequest, setActiveRequest] = useState(null);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [countdown, setCountdown] = useState(30);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (online) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [online]);

  useEffect(() => {
    if (activeRequest) {
      setCountdown(30);
      timerRef.current = setInterval(() => {
        setCountdown(p => {
          if (p <= 1) { clearInterval(timerRef.current); setActiveRequest(null); return 30; }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeRequest]);

  const toggleOnline = () => {
    if (online) {
      Alert.alert('Passer hors ligne ?', 'Vous ne recevrez plus de demandes.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => setOnline(false) },
      ]);
    } else {
      setOnline(true);
    }
  };

  const acceptRequest = (req) => {
    clearInterval(timerRef.current);
    setActiveRequest(null);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    navigation.navigate(req.type === 'sos' ? 'SOSDepanneurMap' : 'DriverNavigationLive', { ride: req });
  };

  const declineRequest = (id) => {
    clearInterval(timerRef.current);
    setActiveRequest(null);
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {MOCK_PROFILE.name.split(' ')[0]} 👋</Text>
          <Text style={styles.vehicle}>{MOCK_PROFILE.vehicle}</Text>
        </View>
        <TouchableOpacity
          style={[styles.onlineToggle, online && styles.onlineToggleActive]}
          onPress={toggleOnline}
        >
          <Animated.View style={[styles.onlineDot, online && { transform: [{ scale: pulseAnim }], backgroundColor: COLORS.green }]} />
          <Text style={[styles.onlineLabel, online && { color: COLORS.green }]}>
            {online ? 'EN LIGNE' : 'HORS LIGNE'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Today Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{MOCK_PROFILE.completedToday}</Text>
            <Text style={styles.statLbl}>Courses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>
              {MOCK_PROFILE.earningsToday.toFixed(2)} TND
            </Text>
            <Text style={styles.statLbl}>Gains today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>⭐ {MOCK_PROFILE.rating}</Text>
            <Text style={styles.statLbl}>Note</Text>
          </View>
        </View>

        {/* Incoming Requests */}
        {online && requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Demandes en attente</Text>
            {requests.map((req) => (
              <View key={req.id} style={[styles.requestCard, req.urgent && styles.requestCardUrgent]}>
                {req.urgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>🆘 URGENT</Text>
                  </View>
                )}
                <View style={styles.requestTop}>
                  <Text style={styles.requestType}>
                    {req.type === 'taxi' ? '🚕 Taxi' : '🔧 SOS Dépannage'}
                  </Text>
                  <Text style={[styles.requestFare, req.urgent && { color: COLORS.red }]}>
                    {req.fare.toFixed(2)} TND
                  </Text>
                </View>
                <View style={styles.requestRoute}>
                  <View style={styles.routeDotGreen} />
                  <Text style={styles.routeText} numberOfLines={1}>{req.from}</Text>
                </View>
                <View style={styles.requestRoute}>
                  <View style={styles.routeDotRed} />
                  <Text style={styles.routeText} numberOfLines={1}>{req.to}</Text>
                </View>
                <View style={styles.requestMeta}>
                  <Text style={styles.requestMetaText}>📍 {req.distance}</Text>
                  <Text style={styles.requestMetaText}>⏱ {req.eta}</Text>
                  <Text style={styles.requestMetaText}>👤 {req.clientName}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => declineRequest(req.id)}>
                    <Text style={styles.declineBtnText}>✕ Refuser</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.acceptBtn, req.urgent && { backgroundColor: COLORS.red }]} onPress={() => acceptRequest(req)}>
                    <Text style={styles.acceptBtnText}>✓ Accepter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Offline State */}
        {!online && (
          <View style={styles.offlineBox}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>😴</Text>
            <Text style={styles.offlineTitle}>Vous êtes hors ligne</Text>
            <Text style={styles.offlineSub}>Passez en ligne pour recevoir des demandes.</Text>
            <TouchableOpacity style={styles.goOnlineBtn} onPress={() => setOnline(true)}>
              <Text style={styles.goOnlineBtnText}>Passer en ligne</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Accès rapide</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '💰', label: 'Mes gains', screen: 'EarningsDashboard' },
              { icon: '📋', label: 'Checklist', screen: 'DriverChecklist' },
              { icon: '🔧', label: 'Incident', screen: 'DriverIncident' },
              { icon: '💸', label: 'Retrait', screen: 'DriverWithdraw' },
              { icon: '📊', label: 'Statistiques', screen: 'ProviderStats' },
              { icon: '📅', label: 'Planning', screen: 'ProviderAvailability' },
            ].map((a) => (
              <TouchableOpacity
                key={a.screen}
                style={styles.actionCard}
                onPress={() => navigation.navigate(a.screen)}
              >
                <Text style={{ fontSize: 26 }}>{a.icon}</Text>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Rides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Courses du jour</Text>
          {MOCK_HISTORY.map((h) => (
            <View key={h.id} style={styles.rideHistRow}>
              <Text style={styles.rideHistTime}>{h.time}</Text>
              <Text style={styles.rideHistClient}>{h.client}</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.rideHistFare}>{h.fare.toFixed(2)} TND</Text>
              {h.rating ? (
                <Text style={styles.rideHistRating}>⭐{h.rating}</Text>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>En attente</Text>
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  greeting: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  vehicle: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  onlineToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  onlineToggleActive: { borderColor: COLORS.green, backgroundColor: '#0A1A0A' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.muted },
  onlineLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statsCard: {
    flexDirection: 'row', margin: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  statLbl: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  requestCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  requestCardUrgent: { borderColor: COLORS.red, backgroundColor: '#1A0808' },
  urgentBadge: {
    backgroundColor: '#2A0808', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.red, marginBottom: 8,
  },
  urgentText: { color: COLORS.red, fontSize: 11, fontWeight: '800' },
  requestTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  requestType: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  requestFare: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  requestRoute: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  routeDotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  routeDotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red },
  routeText: { color: COLORS.muted, fontSize: 12, flex: 1 },
  requestMeta: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  requestMetaText: { color: COLORS.muted, fontSize: 12 },
  requestActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  declineBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  declineBtnText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  acceptBtn: {
    flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.accent,
  },
  acceptBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  offlineBox: { alignItems: 'center', padding: 40 },
  offlineTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  offlineSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  goOnlineBtn: {
    backgroundColor: COLORS.green, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14,
  },
  goOnlineBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionCard: {
    width: '30%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  actionLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  rideHistRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 12,
    marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  rideHistTime: { color: COLORS.muted, fontSize: 12, width: 40 },
  rideHistClient: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  rideHistFare: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  rideHistRating: { color: COLORS.accent, fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  pendingBadge: {
    backgroundColor: '#1A1408', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pendingText: { color: COLORS.muted, fontSize: 9 },
});
