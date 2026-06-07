import React, { useState, useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, ActivityIndicator, Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_INCOMING = {
  id: 'SOS-0021',
  clientName: 'Karim Ben Ali',
  type: 'Batterie déchargée',
  location: 'Autoroute A1, km 14, Tunis',
  distance: 4.2,
  eta: '11 min',
  quoteMin: 22.000,
  quoteMax: 30.000,
  expiresIn: 30,
};

const MOCK_STATS = {
  today: { earned: 68.000, interventions: 3 },
  week: { earned: 312.000, interventions: 14 },
  rating: 4.9,
};

export default function DepanneurHomeScreen({ navigation }) {
  const { logout } = useAuthStore();
  const [online, setOnline] = useState(false);
  const [incoming, setIncoming] = useState(null);
  const [stats, setStats] = useState(MOCK_STATS);
  const [accepting, setAccepting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    api.get('/api/sos/depanneur/stats')
      .then(r => setStats(r.data || MOCK_STATS))
      .catch(() => {});
  }, []);

  // Block Android hardware back button — this is a root dashboard screen
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  useEffect(() => {
    if (!online) { setIncoming(null); return; }
    const t = setTimeout(() => {
      setIncoming({ ...MOCK_INCOMING, expiresIn: 30 });
      setCountdown(30);
    }, 4000);
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
    api.patch('/api/sos/depanneur/status', { online: val }).catch(() => {});
    if (!val) setIncoming(null);
  };

  const handleAccept = async () => {
    setAccepting(true);
    try { await api.post('/api/sos/depanneur/accept', { sosId: incoming.id }); } catch {}
    setAccepting(false);
    navigation.navigate('DepanneurQuote', { interventionId: incoming.id, clientName: incoming.clientName });
    setIncoming(null);
  };

  const handleDecline = () => { setIncoming(null); setCountdown(0); };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => logout()} style={{ padding: 8, marginRight: 4 }}>
          <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '300' }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔧 EasyWay Dépannage</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProviderProfile')}>
          <Text style={{ fontSize: 24 }}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Online toggle */}
        <View style={[styles.statusCard, online && styles.statusCardOnline]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{online ? '🟢 Disponible' : '⚫ Hors ligne'}</Text>
            <Text style={styles.statusSub}>{online ? 'Vous recevez des demandes SOS' : 'Activez pour recevoir des missions'}</Text>
          </View>
          <Switch
            value={online}
            onValueChange={handleToggle}
            trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
            thumbColor={online ? COLORS.green : COLORS.muted}
          />
        </View>

        {/* Incoming SOS */}
        {incoming && (
          <View style={styles.incomingCard}>
            <View style={styles.incomingHeader}>
              <Text style={styles.incomingTitle}>🚨 Demande SOS !</Text>
              <View style={[styles.countdown, countdown <= 10 && { backgroundColor: COLORS.red + '30', borderColor: COLORS.red }]}>
                <Text style={[styles.countdownText, countdown <= 10 && { color: COLORS.red }]}>{countdown}s</Text>
              </View>
            </View>
            <View style={styles.incomingDetails}>
              {[
                { icon: '🔧', text: incoming.type },
                { icon: '👤', text: incoming.clientName },
                { icon: '📍', text: incoming.location },
                { icon: '📏', text: `${incoming.distance} km · ETA ${incoming.eta}` },
              ].map((r, i) => (
                <View key={i} style={styles.incomingRow}>
                  <Text style={{ fontSize: 16 }}>{r.icon}</Text>
                  <Text style={styles.incomingRowText}>{r.text}</Text>
                </View>
              ))}
            </View>
            <View style={styles.quoteRange}>
              <Text style={styles.quoteLabel}>Estimation devis</Text>
              <Text style={styles.quoteVal}>{incoming.quoteMin.toFixed(0)} – {incoming.quoteMax.toFixed(0)} TND</Text>
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
            <Text style={styles.waitingText}>En attente d'une demande SOS...</Text>
          </View>
        )}

        {/* Stats */}
        <Text style={styles.sectionTitle}>MES PERFORMANCES</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.accent }]}>{stats.today.earned.toFixed(0)}</Text>
            <Text style={styles.statSub}>TND aujourd'hui</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.text }]}>{stats.today.interventions}</Text>
            <Text style={styles.statSub}>Interventions auj.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.accent }]}>⭐ {stats.rating}</Text>
            <Text style={styles.statSub}>Ma note</Text>
          </View>
        </View>

        {/* Quick nav */}
        <Text style={styles.sectionTitle}>ACCÈS RAPIDE</Text>
        <View style={styles.navGrid}>
          {[
            { icon: '💰', label: 'Mes gains', screen: 'DepanneurEarnings' },
            { icon: '📋', label: 'Historique', screen: 'DepanneurHistory' },
            { icon: '🛡️', label: 'Assurance', screen: 'ProviderInsurance' },
            { icon: '📄', label: 'Documents', screen: 'ProviderDocuments' },
          ].map(item => (
            <TouchableOpacity key={item.screen} style={styles.navCard} onPress={() => navigation.navigate(item.screen)}>
              <Text style={{ fontSize: 28 }}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.commissionNote}>
          <Text style={styles.commissionText}>✅ EasyWay 0% commission — vous gardez 100% de chaque intervention</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  statusCardOnline: { borderColor: COLORS.green + '60', backgroundColor: COLORS.green + '08' },
  statusTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  statusSub: { color: COLORS.muted, fontSize: 12 },
  incomingCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: COLORS.red },
  incomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  incomingTitle: { color: COLORS.red, fontSize: 16, fontWeight: '900' },
  countdown: { backgroundColor: COLORS.orange + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.orange },
  countdownText: { color: COLORS.orange, fontSize: 14, fontWeight: '900' },
  incomingDetails: { marginBottom: 12 },
  incomingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  incomingRowText: { color: COLORS.text, fontSize: 13, flex: 1 },
  quoteRange: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: 12 },
  quoteLabel: { color: COLORS.muted, fontSize: 13 },
  quoteVal: { color: COLORS.accent, fontSize: 16, fontWeight: '900' },
  incomingActions: { flexDirection: 'row', gap: 10 },
  declineBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 13, alignItems: 'center' },
  declineBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '700' },
  acceptBtn: { flex: 2, borderRadius: 12, backgroundColor: COLORS.accent, paddingVertical: 13, alignItems: 'center' },
  acceptBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
  waitingCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 32, alignItems: 'center', gap: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  waitingText: { color: COLORS.muted, fontSize: 14 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 16, fontWeight: '900' },
  statSub: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  navCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border },
  navLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  commissionNote: { backgroundColor: COLORS.green + '10', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.green + '30' },
  commissionText: { color: COLORS.green, fontSize: 12, textAlign: 'center' },
});
