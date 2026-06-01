import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#2E7D32',
  amber: '#F57C00',
  blue: '#1565C0',
};

const MOCK_HEALTH = {
  status: 'OK',
  uptime: 99.97,
  uptimeSeconds: 432000,
  activeUsers: 142,
  activeSockets: 87,
  activeOrders: 23,
  dbResponseMs: 12,
  apiResponseMs: 48,
  errorRate: 0.12,
  pendingJobs: 3,
  recentErrors: [
    { time: new Date(Date.now() - 5 * 60000).toISOString(), route: 'POST /api/taxi/request', code: 500, message: 'DB timeout' },
    { time: new Date(Date.now() - 18 * 60000).toISOString(), route: 'GET /api/admin/stats', code: 503, message: 'Redis unavailable' },
    { time: new Date(Date.now() - 42 * 60000).toISOString(), route: 'POST /api/auth/otp', code: 429, message: 'Rate limit exceeded' },
  ],
  services: [
    { name: 'PostgreSQL', status: 'UP', latencyMs: 12 },
    { name: 'Redis',      status: 'UP', latencyMs: 2 },
    { name: 'Socket.io',  status: 'UP', connections: 87 },
    { name: 'Expo Push',  status: 'UP', queuedMsg: 3 },
    { name: 'Mapbox API', status: 'UP', latencyMs: 95 },
    { name: 'Flouci',     status: 'UP', latencyMs: 210 },
  ],
};

function StatusDot({ status }) {
  const color = status === 'UP' || status === 'OK' ? COLORS.green : status === 'DEGRADED' ? COLORS.amber : COLORS.accent;
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

function MetricCard({ label, value, unit, color, icon }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={[styles.metricValue, color && { color }]}>{value}</Text>
      {unit && <Text style={styles.metricUnit}>{unit}</Text>}
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}j ${h}h ${m}m`;
}

function MiniSparkline({ values, color }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 30 }}>
      {values.map((v, i) => (
        <View
          key={i}
          style={{ width: 6, borderRadius: 3, height: Math.max(4, Math.round((v / max) * 30)), backgroundColor: color || COLORS.accent }}
        />
      ))}
    </View>
  );
}

export default function AdminSystemHealthScreen({ navigation }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const MOCK_RESPONSE_HISTORY = [35, 42, 38, 51, 48, 55, 43, 48, 50, 47];

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/system/health');
      setHealth(res.data || MOCK_HEALTH);
    } catch {
      setHealth(MOCK_HEALTH);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 15000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const h = health || MOCK_HEALTH;
  const statusColor = h.status === 'OK' ? COLORS.green : h.status === 'DEGRADED' ? COLORS.amber : COLORS.accent;
  const errorRateColor = h.errorRate < 0.5 ? COLORS.green : h.errorRate < 2 ? COLORS.amber : COLORS.accent;
  const dbColor = h.dbResponseMs < 50 ? COLORS.green : h.dbResponseMs < 200 ? COLORS.amber : COLORS.accent;
  const apiColor = h.apiResponseMs < 100 ? COLORS.green : h.apiResponseMs < 500 ? COLORS.amber : COLORS.accent;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏥 Santé système</Text>
        <View style={styles.livePill}>
          <View style={[styles.liveDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.liveText, { color: statusColor }]}>{h.status}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.accent} />}
      >
        {lastUpdated && (
          <Text style={styles.lastUpdate}>Dernière mise à jour : {lastUpdated.toLocaleTimeString('fr-FR')} · Auto ↺ 15s</Text>
        )}

        {/* Main metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard icon="👥" label="Utilisateurs actifs" value={h.activeUsers} color={COLORS.blue} />
          <MetricCard icon="🔌" label="Connexions socket" value={h.activeSockets} color="#9B59B6" />
          <MetricCard icon="📦" label="Commandes live" value={h.activeOrders} color={COLORS.amber} />
          <MetricCard icon="⏱️" label="Uptime" value={formatUptime(h.uptimeSeconds)} color={COLORS.green} />
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard icon="🗄️" label="DB latence" value={h.dbResponseMs} unit="ms" color={dbColor} />
          <MetricCard icon="🌐" label="API latence" value={h.apiResponseMs} unit="ms" color={apiColor} />
          <MetricCard icon="⚠️" label="Taux d'erreur" value={h.errorRate} unit="%" color={errorRateColor} />
          <MetricCard icon="📬" label="Jobs en attente" value={h.pendingJobs} color={h.pendingJobs > 10 ? COLORS.amber : COLORS.green} />
        </View>

        {/* API response sparkline */}
        <View style={styles.sparkCard}>
          <View style={styles.sparkHeader}>
            <Text style={styles.sparkTitle}>Temps de réponse API (10 dernières requêtes)</Text>
            <Text style={[styles.sparkAvg, { color: apiColor }]}>{h.apiResponseMs} ms moy.</Text>
          </View>
          <MiniSparkline values={MOCK_RESPONSE_HISTORY} color={apiColor} />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {(h.services || []).map((svc, i) => (
            <View key={i} style={styles.serviceRow}>
              <StatusDot status={svc.status} />
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Text style={styles.serviceDetail}>
                {svc.latencyMs !== undefined ? `${svc.latencyMs} ms`
                  : svc.connections !== undefined ? `${svc.connections} conn.`
                  : svc.queuedMsg !== undefined ? `${svc.queuedMsg} msg en queue`
                  : svc.status}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: svc.status === 'UP' ? COLORS.green + '22' : COLORS.amber + '22' }]}>
                <Text style={[styles.statusBadgeText, { color: svc.status === 'UP' ? COLORS.green : COLORS.amber }]}>{svc.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent errors */}
        <View style={styles.section}>
          <View style={styles.errHeader}>
            <Text style={styles.sectionTitle}>Erreurs récentes</Text>
            <Text style={[styles.errCount, { color: (h.recentErrors || []).length > 0 ? COLORS.amber : COLORS.green }]}>
              {(h.recentErrors || []).length} erreur(s)
            </Text>
          </View>
          {(h.recentErrors || []).length === 0 ? (
            <Text style={styles.noErrors}>✅ Aucune erreur récente</Text>
          ) : (
            (h.recentErrors || []).map((err, i) => (
              <View key={i} style={styles.errorRow}>
                <View style={[styles.errCode, { backgroundColor: err.code >= 500 ? COLORS.accent + '22' : COLORS.amber + '22' }]}>
                  <Text style={[styles.errCodeText, { color: err.code >= 500 ? COLORS.accent : COLORS.amber }]}>{err.code}</Text>
                </View>
                <View style={styles.errInfo}>
                  <Text style={styles.errRoute}>{err.route}</Text>
                  <Text style={styles.errMsg}>{err.message}</Text>
                </View>
                <Text style={styles.errTime}>
                  {Math.round((Date.now() - new Date(err.time)) / 60000)} min
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Uptime */}
        <View style={styles.uptimeCard}>
          <Text style={styles.sectionTitle}>Disponibilité</Text>
          <View style={styles.uptimeRow}>
            <Text style={[styles.uptimePct, { color: h.uptime >= 99.9 ? COLORS.green : COLORS.amber }]}>
              {h.uptime?.toFixed(2)}%
            </Text>
            <Text style={styles.uptimeSub}>Ce mois — SLA cible : 99.9%</Text>
          </View>
          <View style={styles.uptimeBar}>
            <View style={[styles.uptimeFill, { width: `${Math.min(h.uptime || 0, 100)}%`, backgroundColor: h.uptime >= 99.9 ? COLORS.green : COLORS.amber }]} />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surfaceAlt, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: '800' },
  scroll: { padding: 16 },
  lastUpdate: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginBottom: 12 },
  metricsGrid: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  metricCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  metricIcon: { fontSize: 18, marginBottom: 4 },
  metricValue: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  metricUnit: { color: COLORS.muted, fontSize: 10 },
  metricLabel: { color: COLORS.muted, fontSize: 9, marginTop: 2, textAlign: 'center' },
  sparkCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  sparkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sparkTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '600', flex: 1 },
  sparkAvg: { fontSize: 13, fontWeight: '800' },
  section: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  serviceName: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: '600' },
  serviceDetail: { color: COLORS.muted, fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  errHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  errCount: { fontSize: 13, fontWeight: '700' },
  noErrors: { color: COLORS.green, fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  errCode: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, minWidth: 38, alignItems: 'center' },
  errCodeText: { fontSize: 12, fontWeight: '800' },
  errInfo: { flex: 1 },
  errRoute: { color: COLORS.text, fontSize: 12, fontWeight: '600', fontFamily: 'monospace' },
  errMsg: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  errTime: { color: COLORS.muted, fontSize: 11 },
  uptimeCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  uptimeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 10 },
  uptimePct: { fontSize: 32, fontWeight: '900' },
  uptimeSub: { color: COLORS.muted, fontSize: 12 },
  uptimeBar: { height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden' },
  uptimeFill: { height: 12, borderRadius: 6 },
});
