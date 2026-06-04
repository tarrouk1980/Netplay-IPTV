import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const INTERVENTION_TYPES = [
  { type: 'FLAT_TIRE', icon: '🛞', label: 'Crevaison' },
  { type: 'BATTERY', icon: '🔋', label: 'Batterie' },
  { type: 'BREAKDOWN', icon: '🔧', label: 'Panne moteur' },
  { type: 'FUEL', icon: '⛽', label: 'Carburant' },
  { type: 'LOCKOUT', icon: '🔑', label: 'Verrouillé' },
  { type: 'TOWING', icon: '🚛', label: 'Remorquage' },
];

const MOCK_REQUEST = {
  id: 'SOS-999',
  type: 'FLAT_TIRE',
  clientName: 'Nadia K.',
  location: 'Autoroute A1, km 42, direction Sfax',
  distance: 3.2,
  estimatedFee: 45.000,
  phone: '+216 55 123 456',
};

const MOCK_STATS = { todayJobs: 3, todayEarnings: 95.000, rating: 4.9, streak: 5 };

export default function DepanneurHomeScreen2({ navigation }) {
  const [available, setAvailable] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const load = useCallback(() => {
    Promise.all([
      api.get('/api/depanneur/stats').catch(() => ({ data: MOCK_STATS })),
      api.get('/api/depanneur/status').catch(() => ({ data: { available: false } })),
      api.get('/api/depanneur/pending').catch(() => ({ data: { request: null } })),
    ]).then(([statsRes, statusRes, pendingRes]) => {
      setStats(statsRes.data || MOCK_STATS);
      setAvailable(statusRes.data.available || false);
      setPendingRequest(pendingRes.data.request || null);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleAvailable = async (val) => {
    setToggling(true);
    try {
      await api.post('/api/depanneur/status', { available: val });
      setAvailable(val);
    } catch { setAvailable(v => v); }
    finally { setToggling(false); }
  };

  const acceptRequest = async () => {
    if (!pendingRequest) return;
    try {
      await api.post('/api/depanneur/requests/' + pendingRequest.id + '/accept');
      navigation.navigate('SOSTracking', { requestId: pendingRequest.id });
      setPendingRequest(null);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'accepter pour l\'instant.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔧 Tableau de bord</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DepanneurEarnings')} style={styles.earningsBtn}>
          <Text style={styles.earningsBtnText}>Revenus</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statusCard, available ? styles.statusCardOn : styles.statusCardOff]}>
        <View>
          <Text style={styles.statusLabel}>{available ? '🟢 Disponible' : '⚫ Indisponible'}</Text>
          <Text style={styles.statusSub}>
            {available ? 'Vous recevez les demandes SOS' : 'Activez pour recevoir des demandes'}
          </Text>
        </View>
        {toggling ? (
          <ActivityIndicator color={COLORS.accent} />
        ) : (
          <Switch value={available} onValueChange={toggleAvailable}
            trackColor={{ false: COLORS.border, true: COLORS.green }} thumbColor={available ? '#FFF' : COLORS.muted} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.todayEarnings.toFixed(3)}</Text>
              <Text style={styles.statLabel}>TND aujourd'hui</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.todayJobs}</Text>
              <Text style={styles.statLabel}>Interventions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>★ {stats.rating}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
          </View>

          {stats.streak >= 3 && (
            <View style={styles.streakBanner}>
              <Text style={styles.streakText}>🔥 {stats.streak} jours consécutifs actif !</Text>
            </View>
          )}

          {pendingRequest && available && (
            <View style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestType}>
                  {INTERVENTION_TYPES.find(t => t.type === pendingRequest.type)?.icon || '🔧'} {' '}
                  {INTERVENTION_TYPES.find(t => t.type === pendingRequest.type)?.label || pendingRequest.type}
                </Text>
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              </View>
              <Text style={styles.requestClient}>{pendingRequest.clientName}</Text>
              <Text style={styles.requestLocation}>📍 {pendingRequest.location}</Text>
              <View style={styles.requestMeta}>
                <Text style={styles.requestDist}>🗺️ {pendingRequest.distance} km</Text>
                <Text style={styles.requestFee}>{pendingRequest.estimatedFee.toFixed(3)} TND estimé</Text>
              </View>
              <TouchableOpacity style={styles.acceptBtn} onPress={acceptRequest}>
                <Text style={styles.acceptBtnText}>✓ Accepter l'intervention</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>TYPES D'INTERVENTION</Text>
          <View style={styles.typesGrid}>
            {INTERVENTION_TYPES.map(t => (
              <View key={t.type} style={styles.typeCard}>
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text style={styles.typeLabel}>{t.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '📋', label: 'Historique', screen: 'SOSHistory' },
              { icon: '💰', label: 'Revenus', screen: 'DepanneurEarnings' },
              { icon: '👤', label: 'Profil', screen: 'ProviderProfile' },
              { icon: '🛡️', label: 'Assurance', screen: 'ProviderInsurance' },
            ].map(a => (
              <TouchableOpacity key={a.screen} style={styles.actionBtn} onPress={() => navigation.navigate(a.screen)}>
                <Text style={styles.actionIcon}>{a.icon}</Text>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  earningsBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  earningsBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, borderRadius: 16, padding: 16, borderWidth: 1.5,
  },
  statusCardOn: { backgroundColor: COLORS.green + '15', borderColor: COLORS.green + '50' },
  statusCardOff: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  statusLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  statusSub: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  scroll: { paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  streakBanner: {
    backgroundColor: COLORS.orange + '15', borderRadius: 12, padding: 10, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.orange + '40', alignItems: 'center',
  },
  streakText: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  requestCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 2, borderColor: COLORS.red + '60',
  },
  requestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  requestType: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  urgentBadge: { backgroundColor: COLORS.red, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  requestClient: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  requestLocation: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  requestMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  requestDist: { color: COLORS.muted, fontSize: 13 },
  requestFee: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  acceptBtn: { backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeCard: {
    width: '30%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  typeIcon: { fontSize: 24, marginBottom: 6 },
  typeLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  actionBtn: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  actionIcon: { fontSize: 26, marginBottom: 6 },
  actionLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});
