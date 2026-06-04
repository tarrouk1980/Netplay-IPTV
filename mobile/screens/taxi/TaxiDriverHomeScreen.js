import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_INCOMING = {
  id: 'RIDE-0091',
  clientName: 'Sana Trabelsi',
  from: 'Lac 1, Tunis',
  to: 'Aéroport Tunis-Carthage',
  distance: 12.4,
  fare: 14.500,
  eta: '4 min',
  vehicle: 'Berline',
  expiresIn: 20,
};

const MOCK_STATS = {
  today: { earned: 92.500, trips: 8, hours: 6 },
  week: { earned: 540.000, trips: 48 },
  rating: 4.9,
  acceptRate: 94,
};

export default function TaxiDriverHomeScreen({ navigation }) {
  const [online, setOnline] = useState(false);
  const [incoming, setIncoming] = useState(null);
  const [stats, setStats] = useState(MOCK_STATS);
  const [accepting, setAccepting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    api.get('/api/taxi/driver/stats')
      .then(r => setStats(r.data || MOCK_STATS))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!online) { setIncoming(null); return; }
    const t = setTimeout(() => {
      setIncoming({ ...MOCK_INCOMING });
      setCountdown(20);
    }, 3000);
    return () => clearTimeout(t);
  }, [online]);

  useEffect(() => {
    if (!incoming || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { setIncoming(null); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [incoming]);

  const handleToggle = (val) => {
    setOnline(val);
    api.patch('/api/taxi/driver/status', { online: val }).catch(() => {});
    if (!val) setIncoming(null);
  };

  const handleAccept = async () => {
    setAccepting(true);
    try { await api.post('/api/taxi/driver/accept', { rideId: incoming.id }); } catch {}
    setAccepting(false);
    setIncoming(null);
    navigation.navigate('TaxiTracking', { rideId: incoming.id });
  };

  const handleDecline = () => { setIncoming(null); setCountdown(0); };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚕 EasyWay Chauffeur</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('TaxiRatings')}>
            <Text style={styles.ratingBadge}>⭐ {stats.rating}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ProviderProfile')}>
            <Text style={{ fontSize: 22 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Online toggle */}
        <View style={[styles.statusCard, online && styles.statusCardOnline]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{online ? '🟢 En ligne' : '⚫ Hors ligne'}</Text>
            <Text style={styles.statusSub}>{online ? 'Vous recevez des courses' : 'Activez pour recevoir des courses'}</Text>
          </View>
          <Switch
            value={online}
            onValueChange={handleToggle}
            trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
            thumbColor={online ? COLORS.green : COLORS.muted}
          />
        </View>

        {/* Incoming ride */}
        {incoming && (
          <View style={styles.incomingCard}>
            <View style={styles.incomingHeader}>
              <Text style={styles.incomingTitle}>🔔 Nouvelle course !</Text>
              <View style={[styles.countdown, countdown <= 8 && { backgroundColor: COLORS.red + '30', borderColor: COLORS.red }]}>
                <Text style={[styles.countdownText, countdown <= 8 && { color: COLORS.red }]}>{countdown}s</Text>
              </View>
            </View>
            <View style={styles.routeCard}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.routeText} numberOfLines={1}>{incoming.from}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.red }]} />
                <Text style={styles.routeText} numberOfLines={1}>{incoming.to}</Text>
              </View>
            </View>
            <View style={styles.incomingMeta}>
              <View style={styles.metaItem}><Text style={styles.metaVal}>{incoming.distance} km</Text><Text style={styles.metaLabel}>Distance</Text></View>
              <View style={styles.metaItem}><Text style={styles.metaVal}>{incoming.eta}</Text><Text style={styles.metaLabel}>ETA client</Text></View>
              <View style={styles.metaItem}><Text style={[styles.metaVal, { color: COLORS.accent }]}>{incoming.fare.toFixed(3)}</Text><Text style={styles.metaLabel}>TND</Text></View>
            </View>
            <View style={styles.incomingActions}>
              <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
                <Text style={styles.declineBtnText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.acceptBtn, accepting && { opacity: 0.6 }]} onPress={handleAccept} disabled={accepting}>
                {accepting ? <ActivityIndicator color="#000" /> : <Text style={styles.acceptBtnText}>✅ Accepter</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {online && !incoming && (
          <View style={styles.waitingCard}>
            <ActivityIndicator color={COLORS.accent} size="large" />
            <Text style={styles.waitingText}>En attente d'une course...</Text>
          </View>
        )}

        {/* Today stats */}
        <Text style={styles.sectionTitle}>AUJOURD'HUI</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.accent }]}>{stats.today.earned.toFixed(0)}</Text>
            <Text style={styles.statSub}>TND gagnés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.text }]}>{stats.today.trips}</Text>
            <Text style={styles.statSub}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.blue }]}>{stats.today.hours}h</Text>
            <Text style={styles.statSub}>En ligne</Text>
          </View>
        </View>

        <View style={styles.acceptRateCard}>
          <Text style={styles.acceptRateLabel}>Taux d'acceptation</Text>
          <View style={styles.acceptRateBar}>
            <View style={[styles.acceptRateFill, { width: `${stats.acceptRate}%` }]} />
          </View>
          <Text style={styles.acceptRateVal}>{stats.acceptRate}%</Text>
        </View>

        {/* Quick nav */}
        <Text style={styles.sectionTitle}>ACCÈS RAPIDE</Text>
        <View style={styles.navGrid}>
          {[
            { icon: '💰', label: 'Mes gains', screen: 'TaxiEarnings' },
            { icon: '⭐', label: 'Évaluations', screen: 'TaxiRatings' },
            { icon: '🚀', label: 'Surge pricing', screen: 'TaxiSurgePricing' },
            { icon: '📄', label: 'Documents', screen: 'ProviderDocuments' },
          ].map(item => (
            <TouchableOpacity key={item.screen} style={styles.navCard} onPress={() => navigation.navigate(item.screen)}>
              <Text style={{ fontSize: 28 }}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.commissionNote}>
          <Text style={styles.commissionText}>✅ EasyWay 0% commission — vous gardez 100% de vos courses</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingBadge: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  statusCardOnline: { borderColor: COLORS.green + '60', backgroundColor: COLORS.green + '08' },
  statusTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  statusSub: { color: COLORS.muted, fontSize: 12 },
  incomingCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: COLORS.accent },
  incomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  incomingTitle: { color: COLORS.accent, fontSize: 16, fontWeight: '900' },
  countdown: { backgroundColor: COLORS.orange + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.orange },
  countdownText: { color: COLORS.orange, fontSize: 14, fontWeight: '900' },
  routeCard: { backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { color: COLORS.text, fontSize: 13, flex: 1 },
  routeLine: { width: 2, height: 16, backgroundColor: COLORS.border, marginLeft: 4, marginVertical: 3 },
  incomingMeta: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: 12 },
  metaItem: { alignItems: 'center' },
  metaVal: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  metaLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  incomingActions: { flexDirection: 'row', gap: 10 },
  declineBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 13, alignItems: 'center' },
  declineBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '700' },
  acceptBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 13, alignItems: 'center' },
  acceptBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  waitingCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 32, alignItems: 'center', gap: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  waitingText: { color: COLORS.muted, fontSize: 14 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 16, fontWeight: '900' },
  statSub: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  acceptRateCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  acceptRateLabel: { color: COLORS.muted, fontSize: 12, width: 90 },
  acceptRateBar: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  acceptRateFill: { height: 8, backgroundColor: COLORS.green, borderRadius: 4 },
  acceptRateVal: { color: COLORS.green, fontSize: 13, fontWeight: '800', width: 36, textAlign: 'right' },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  navCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border },
  navLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  commissionNote: { backgroundColor: COLORS.green + '10', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.green + '30' },
  commissionText: { color: COLORS.green, fontSize: 12, textAlign: 'center' },
});
