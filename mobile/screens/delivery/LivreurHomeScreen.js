import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_INCOMING = {
  id: 'ORD-2025-0789',
  restaurant: 'Restaurant El Bey',
  clientZone: 'Lac 1',
  distance: 3.2,
  fee: 4.500,
  tip: 1.000,
  eta: '18 min',
  items: 4,
  expiresIn: 25,
};

const MOCK_STATS = { today: { earned: 28.500, deliveries: 4 }, week: { earned: 192.000, deliveries: 29 } };

export default function LivreurHomeScreen({ navigation }) {
  const [online, setOnline] = useState(false);
  const [incoming, setIncoming] = useState(null);
  const [stats, setStats] = useState(MOCK_STATS);
  const [loadingStats, setLoadingStats] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    api.get('/api/livreur/stats')
      .then(r => setStats(r.data || MOCK_STATS))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!online) { setIncoming(null); return; }
    const timer = setTimeout(() => {
      setIncoming({ ...MOCK_INCOMING, expiresIn: 25 });
      setCountdown(25);
    }, 3000);
    return () => clearTimeout(timer);
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

  const handleToggleOnline = (val) => {
    setOnline(val);
    api.patch('/api/livreur/status', { online: val }).catch(() => {});
    if (!val) setIncoming(null);
  };

  const handleAccept = async () => {
    if (!incoming) return;
    setAccepting(true);
    try {
      await api.post('/api/livreur/orders/accept', { orderId: incoming.id });
    } catch {}
    setAccepting(false);
    setIncoming(null);
    navigation.navigate('LivreurTask', { taskId: incoming.id });
  };

  const handleDecline = () => {
    setIncoming(null);
    setCountdown(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛵 EasyWay Livraison</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LivreurProfile')}>
          <Text style={{ fontSize: 24 }}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Online toggle */}
        <View style={[styles.statusCard, online && styles.statusCardOnline]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{online ? '🟢 En ligne' : '⚫ Hors ligne'}</Text>
            <Text style={styles.statusSub}>{online ? 'Vous recevez des commandes' : 'Activez pour recevoir des missions'}</Text>
          </View>
          <Switch
            value={online}
            onValueChange={handleToggleOnline}
            trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
            thumbColor={online ? COLORS.green : COLORS.muted}
          />
        </View>

        {/* Incoming order */}
        {incoming && (
          <View style={styles.incomingCard}>
            <View style={styles.incomingHeader}>
              <Text style={styles.incomingTitle}>🔔 Nouvelle commande !</Text>
              <View style={[styles.countdownBadge, countdown <= 10 && { backgroundColor: COLORS.red + '30', borderColor: COLORS.red }]}>
                <Text style={[styles.countdownText, countdown <= 10 && { color: COLORS.red }]}>{countdown}s</Text>
              </View>
            </View>
            <View style={styles.incomingDetails}>
              {[
                { icon: '🍽️', label: incoming.restaurant },
                { icon: '📍', label: `Livraison : ${incoming.clientZone}` },
                { icon: '📦', label: `${incoming.items} articles · ${incoming.distance} km` },
                { icon: '⏱️', label: `ETA : ${incoming.eta}` },
              ].map((row, i) => (
                <View key={i} style={styles.incomingRow}>
                  <Text style={{ fontSize: 16 }}>{row.icon}</Text>
                  <Text style={styles.incomingRowText}>{row.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Gain estimé</Text>
              <Text style={styles.feeVal}>{(incoming.fee + incoming.tip).toFixed(3)} TND</Text>
            </View>
            <View style={styles.incomingActions}>
              <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
                <Text style={styles.declineBtnText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptBtn, accepting && { opacity: 0.6 }]}
                onPress={handleAccept}
                disabled={accepting}
              >
                {accepting ? <ActivityIndicator color="#000" /> : <Text style={styles.acceptBtnText}>✅ Accepter</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {online && !incoming && (
          <View style={styles.waitingCard}>
            <ActivityIndicator color={COLORS.accent} size="large" />
            <Text style={styles.waitingText}>En attente d'une commande...</Text>
          </View>
        )}

        {/* Stats */}
        <Text style={styles.sectionTitle}>MES PERFORMANCES</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.accent }]}>{stats.today.earned.toFixed(3)}</Text>
            <Text style={styles.statSub}>TND aujourd'hui</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.text }]}>{stats.today.deliveries}</Text>
            <Text style={styles.statSub}>Livraisons auj.</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: COLORS.green }]}>{stats.week.earned.toFixed(0)}</Text>
            <Text style={styles.statSub}>TND cette semaine</Text>
          </View>
        </View>

        {/* Quick nav */}
        <Text style={styles.sectionTitle}>ACCÈS RAPIDE</Text>
        <View style={styles.navGrid}>
          {[
            { icon: '💰', label: 'Mes gains', screen: 'LivreurEarnings' },
            { icon: '🗺️', label: 'Mes zones', screen: 'LivreurZones' },
            { icon: '📋', label: 'Historique', screen: 'LivreurHistory' },
            { icon: '⭐', label: 'Évaluations', screen: 'LivreurRatings' },
          ].map(item => (
            <TouchableOpacity key={item.screen} style={styles.navCard} onPress={() => navigation.navigate(item.screen)}>
              <Text style={{ fontSize: 28 }}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.commissionNote}>
          <Text style={styles.commissionText}>✅ EasyWay 0% commission — vous gardez 100% de vos gains</Text>
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
  incomingCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: COLORS.accent },
  incomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  incomingTitle: { color: COLORS.accent, fontSize: 16, fontWeight: '900' },
  countdownBadge: { backgroundColor: COLORS.orange + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.orange },
  countdownText: { color: COLORS.orange, fontSize: 14, fontWeight: '900' },
  incomingDetails: { marginBottom: 12 },
  incomingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  incomingRowText: { color: COLORS.text, fontSize: 13 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: 12 },
  feeLabel: { color: COLORS.muted, fontSize: 13 },
  feeVal: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
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
