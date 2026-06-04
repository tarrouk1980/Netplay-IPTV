import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_AGENTS = [
  { id: 'D1', name: 'Karim B.', role: 'CHAUFFEUR', status: 'ONLINE', lat: 36.806, lng: 10.181, rides: 3 },
  { id: 'D2', name: 'Sami T.', role: 'CHAUFFEUR', status: 'IN_RIDE', lat: 36.819, lng: 10.166, rides: 1 },
  { id: 'D3', name: 'Nabil R.', role: 'LIVREUR', status: 'ONLINE', lat: 36.845, lng: 10.195, rides: 2 },
  { id: 'D4', name: 'Rim H.', role: 'LIVREUR', status: 'IN_RIDE', lat: 36.832, lng: 10.209, rides: 1 },
  { id: 'D5', name: 'Anis M.', role: 'DEPANNEUR', status: 'ONLINE', lat: 36.800, lng: 10.173, rides: 0 },
  { id: 'D6', name: 'Hatem K.', role: 'CHAUFFEUR', status: 'OFFLINE', lat: 36.812, lng: 10.155, rides: 0 },
];

const ZONES = [
  { id: 'Z1', name: 'Tunis Centre', agents: 8, active: 6, demand: 'HIGH' },
  { id: 'Z2', name: 'Berges du Lac', agents: 5, active: 4, demand: 'MEDIUM' },
  { id: 'Z3', name: 'La Marsa', agents: 3, active: 2, demand: 'LOW' },
  { id: 'Z4', name: 'Ariana', agents: 6, active: 5, demand: 'HIGH' },
  { id: 'Z5', name: 'Ben Arous', agents: 4, active: 3, demand: 'MEDIUM' },
];

const ROLE_ICON = { CHAUFFEUR: '🚕', LIVREUR: '🛵', DEPANNEUR: '🔧' };
const STATUS_COLOR = { ONLINE: COLORS.green, IN_RIDE: COLORS.accent, OFFLINE: COLORS.muted };
const STATUS_LABEL = { ONLINE: 'En ligne', IN_RIDE: 'En course', OFFLINE: 'Hors ligne' };
const DEMAND_COLOR = { HIGH: COLORS.red, MEDIUM: COLORS.orange, LOW: COLORS.green };

export default function AdminMapScreen({ navigation }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [tab, setTab] = useState('AGENTS');

  const FILTERS = [
    { key: 'ALL', label: 'Tous' },
    { key: 'CHAUFFEUR', label: '🚕 Taxis' },
    { key: 'LIVREUR', label: '🛵 Livreurs' },
    { key: 'DEPANNEUR', label: '🔧 Dépanneurs' },
  ];

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await api.get('/api/admin/map/agents');
      setAgents(r.data.agents || MOCK_AGENTS);
    } catch {
      setAgents(MOCK_AGENTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = filter === 'ALL' ? agents : agents.filter(a => a.role === filter);
  const online = agents.filter(a => a.status !== 'OFFLINE').length;
  const inRide = agents.filter(a => a.status === 'IN_RIDE').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Carte en direct</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* KPI strip */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.green }]}>{online}</Text>
          <Text style={styles.kpiLabel}>En ligne</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.accent }]}>{inRide}</Text>
          <Text style={styles.kpiLabel}>En course</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.muted }]}>{agents.length - online}</Text>
          <Text style={styles.kpiLabel}>Hors ligne</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={[styles.kpiVal, { color: COLORS.blue }]}>{agents.length}</Text>
          <Text style={styles.kpiLabel}>Total</Text>
        </View>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapTitle}>Carte interactive</Text>
        <Text style={styles.mapSub}>Intégrez MapView (react-native-maps){'\n'}pour afficher les positions GPS en temps réel</Text>
        <View style={styles.mapAgentDots}>
          {filtered.slice(0, 6).map(a => (
            <View key={a.id} style={[styles.mapDot, { backgroundColor: STATUS_COLOR[a.status] }]}>
              <Text style={{ fontSize: 10 }}>{ROLE_ICON[a.role]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {['AGENTS', 'ZONES'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'AGENTS' ? `Agents (${filtered.length})` : `Zones (${ZONES.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'AGENTS' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        >
          {tab === 'AGENTS' ? (
            filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Text style={{ fontSize: 40 }}>📍</Text>
                <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun agent trouvé</Text>
              </View>
            ) : (
              filtered.map(agent => (
                <View key={agent.id} style={styles.agentCard}>
                  <View style={styles.agentLeft}>
                    <View style={[styles.agentIcon, { backgroundColor: STATUS_COLOR[agent.status] + '20' }]}>
                      <Text style={{ fontSize: 20 }}>{ROLE_ICON[agent.role]}</Text>
                    </View>
                    <View>
                      <Text style={styles.agentName}>{agent.name}</Text>
                      <Text style={styles.agentRole}>{agent.role}</Text>
                    </View>
                  </View>
                  <View style={styles.agentRight}>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[agent.status] + '20', borderColor: STATUS_COLOR[agent.status] + '50' }]}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[agent.status] }]} />
                      <Text style={[styles.statusText, { color: STATUS_COLOR[agent.status] }]}>{STATUS_LABEL[agent.status]}</Text>
                    </View>
                    {agent.rides > 0 && (
                      <Text style={styles.agentRides}>{agent.rides} course{agent.rides > 1 ? 's' : ''}</Text>
                    )}
                  </View>
                </View>
              ))
            )
          ) : (
            ZONES.map(zone => (
              <View key={zone.id} style={styles.zoneCard}>
                <View style={styles.zoneLeft}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneSub}>{zone.active}/{zone.agents} agents actifs</Text>
                </View>
                <View style={styles.zoneRight}>
                  <View style={[styles.demandBadge, { backgroundColor: DEMAND_COLOR[zone.demand] + '20', borderColor: DEMAND_COLOR[zone.demand] + '50' }]}>
                    <Text style={[styles.demandText, { color: DEMAND_COLOR[zone.demand] }]}>
                      {zone.demand === 'HIGH' ? '🔥 Fort' : zone.demand === 'MEDIUM' ? '📊 Moyen' : '✅ Calme'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
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
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.red + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.red + '50',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.red },
  liveText: { color: COLORS.red, fontSize: 10, fontWeight: '800' },
  kpiRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiVal: { fontSize: 20, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  kpiDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  mapPlaceholder: {
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  mapEmoji: { fontSize: 40, marginBottom: 8 },
  mapTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  mapSub: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  mapAgentDots: { flexDirection: 'row', gap: 8, marginTop: 14 },
  mapDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border,
    marginHorizontal: 16,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterBtn: {
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.surface,
  },
  filterBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  filterLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterLabelActive: { color: COLORS.accent },
  agentCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  agentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  agentIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  agentName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  agentRole: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  agentRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 11, fontWeight: '700' },
  agentRides: { color: COLORS.muted, fontSize: 10 },
  zoneCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  zoneLeft: {},
  zoneName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  zoneSub: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  zoneRight: {},
  demandBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  demandText: { fontSize: 12, fontWeight: '700' },
});
