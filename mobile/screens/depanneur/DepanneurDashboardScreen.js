import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const SOS_TYPES = {
  PANNE: { label: 'Panne moteur', icon: '⚙️' },
  CREVAISON: { label: 'Crevaison', icon: '🔧' },
  BATTERIE: { label: 'Batterie morte', icon: '🔋' },
  ACCIDENT: { label: 'Accident', icon: '🚨' },
  REMORQUAGE: { label: 'Remorquage', icon: '🚛' },
};

const MOCK_REQUESTS = [
  { id: 'SOS001', type: 'PANNE', clientName: 'Ahmed B.', distance: 1.2, address: 'Route GP1, Km 22, Grombalia', createdAt: '14:32', urgent: true },
  { id: 'SOS002', type: 'CREVAISON', clientName: 'Nadia K.', distance: 3.7, address: 'Avenue Habib Bourguiba, Nabeul', createdAt: '14:28', urgent: false },
  { id: 'SOS003', type: 'BATTERIE', clientName: 'Sami R.', distance: 5.1, address: 'Zone Industrielle, Grombalia', createdAt: '14:15', urgent: false },
];

const MOCK_STATS = { todayEarnings: 87.500, todayJobs: 3, rating: 4.8, totalJobs: 412 };

function SOSCard({ item, onAccept }) {
  const typeInfo = SOS_TYPES[item.type] || { label: item.type, icon: '🔧' };
  return (
    <View style={[styles.sosCard, item.urgent && styles.sosCardUrgent]}>
      {item.urgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>🚨 URGENT</Text>
        </View>
      )}
      <View style={styles.sosHeader}>
        <Text style={styles.sosIcon}>{typeInfo.icon}</Text>
        <View style={styles.sosInfo}>
          <Text style={styles.sosType}>{typeInfo.label}</Text>
          <Text style={styles.sosClient}>{item.clientName}</Text>
        </View>
        <View style={styles.sosRight}>
          <Text style={styles.sosDistance}>{item.distance} km</Text>
          <Text style={styles.sosTime}>{item.createdAt}</Text>
        </View>
      </View>
      <Text style={styles.sosAddress}>📍 {item.address}</Text>
      <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(item)}>
        <Text style={styles.acceptBtnText}>✓ Accepter l'intervention</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DepanneurDashboardScreen({ navigation }) {
  const [online, setOnline] = useState(false);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      api.get('/api/depanneur/requests').catch(() => ({ data: { requests: MOCK_REQUESTS } })),
      api.get('/api/depanneur/stats').catch(() => ({ data: MOCK_STATS })),
      api.get('/api/depanneur/status').catch(() => ({ data: { online: false } })),
    ]).then(([reqRes, statsRes, statusRes]) => {
      setRequests(reqRes.data.requests || MOCK_REQUESTS);
      setStats(statsRes.data || MOCK_STATS);
      setOnline(statusRes.data.online || false);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleOnline = async (val) => {
    setTogglingOnline(true);
    try {
      await api.post('/api/depanneur/status', { online: val });
      setOnline(val);
    } catch {
      setOnline(v => v);
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleAccept = async (sos) => {
    try {
      await api.post(`/api/depanneur/requests/${sos.id}/accept`);
      setRequests(prev => prev.filter(r => r.id !== sos.id));
      Alert.alert('Intervention acceptée', `Navigation vers ${sos.clientName} lancée.`);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'accepter cette demande.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Tableau de bord</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProviderIncome')} style={styles.earningsBtn}>
          <Text style={styles.earningsBtnText}>Revenus</Text>
        </TouchableOpacity>
      </View>

      {/* Online toggle */}
      <View style={[styles.onlineCard, online ? styles.onlineCardActive : styles.onlineCardInactive]}>
        <View>
          <Text style={styles.onlineLabel}>{online ? '🟢 En ligne' : '⚫ Hors ligne'}</Text>
          <Text style={styles.onlineSubLabel}>
            {online ? 'Vous recevez les demandes SOS' : 'Vous ne recevez pas de demandes'}
          </Text>
        </View>
        {togglingOnline ? (
          <ActivityIndicator color={COLORS.accent} />
        ) : (
          <Switch
            value={online}
            onValueChange={toggleOnline}
            trackColor={{ false: COLORS.border, true: COLORS.green }}
            thumbColor={online ? '#FFF' : COLORS.muted}
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>{stats.todayEarnings.toFixed(3)}</Text>
              <Text style={styles.statLabel}>TND aujourd'hui</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.todayJobs}</Text>
              <Text style={styles.statLabel}>interventions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: COLORS.accent }]}>★ {stats.rating}</Text>
              <Text style={styles.statLabel}>note moyenne</Text>
            </View>
          </View>

          {/* Requests */}
          <Text style={styles.sectionTitle}>
            {online ? `DEMANDES SOS (${requests.length})` : 'PASSEZ EN LIGNE POUR RECEVOIR DES DEMANDES'}
          </Text>

          {online && requests.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>🔧</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucune demande pour le moment</Text>
            </View>
          )}

          {online && requests.map(r => (
            <SOSCard key={r.id} item={r} onAccept={handleAccept} />
          ))}

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>ACTIONS RAPIDES</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: '📋', label: 'Historique', screen: 'SOSHistory' },
              { icon: '👤', label: 'Mon profil', screen: 'ProviderProfile' },
              { icon: '💰', label: 'Revenus', screen: 'ProviderIncome' },
              { icon: '⚙️', label: 'Paramètres', screen: 'Settings' },
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
  onlineCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, borderRadius: 16, padding: 16, borderWidth: 1.5,
  },
  onlineCardActive: { backgroundColor: '#27AE6015', borderColor: COLORS.green + '50' },
  onlineCardInactive: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  onlineLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  onlineSubLabel: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  sosCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  sosCardUrgent: { borderColor: COLORS.red + '60', backgroundColor: '#1A0A0A' },
  urgentBadge: { backgroundColor: COLORS.red + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  urgentText: { color: COLORS.red, fontSize: 11, fontWeight: '800' },
  sosHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sosIcon: { fontSize: 28, marginRight: 12 },
  sosInfo: { flex: 1 },
  sosType: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  sosClient: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  sosRight: { alignItems: 'flex-end' },
  sosDistance: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  sosTime: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  sosAddress: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  acceptBtn: { backgroundColor: COLORS.green, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  actionBtn: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  actionIcon: { fontSize: 26, marginBottom: 6 },
  actionLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});
