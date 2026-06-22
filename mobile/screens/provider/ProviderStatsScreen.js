import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

function LineChart({ data }) {
  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;
  const chartWidth = width - 64;
  const chartHeight = 100;
  const stepX = chartWidth / Math.max(data.length - 1, 1);

  const points = data.map((val, i) => ({
    x: i * stepX,
    y: chartHeight - ((val - minVal) / range) * chartHeight,
  }));

  return (
    <View style={{ height: chartHeight + 24, width: chartWidth, position: 'relative' }}>
      {points.map((pt, i) => {
        if (i === points.length - 1) return null;
        const next = points[i + 1];
        const dx = next.x - pt.x;
        const dy = next.y - pt.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: pt.x,
              top: pt.y,
              width: length,
              height: 2,
              backgroundColor: COLORS.primary,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'left center',
            }}
          />
        );
      })}
      {points.map((pt, i) => (
        <View
          key={`dot-${i}`}
          style={{
            position: 'absolute',
            left: pt.x - 5,
            top: pt.y - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: COLORS.primary,
            borderWidth: 2,
            borderColor: COLORS.surface,
          }}
        />
      ))}
      {data.map((val, i) => (
        <Text
          key={`lbl-${i}`}
          style={{
            position: 'absolute',
            left: points[i].x - 20,
            top: chartHeight + 4,
            width: 40,
            textAlign: 'center',
            color: COLORS.muted,
            fontSize: 11,
          }}
        >
          S{i + 1}
        </Text>
      ))}
    </View>
  );
}

export default function ProviderStatsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/provider/earnings?days=28'),
      api.get('/api/provider/status'),
    ])
      .then(([earnings, status]) => {
        const data = earnings.data.chart?.data || [];
        const weekly = [0, 0, 0, 0];
        data.forEach((v, i) => {
          const weekIdx = Math.min(Math.floor(i / 7), 3);
          weekly[weekIdx] += v;
        });
        setStats({
          coursesTotales: earnings.data.ordersCompleted,
          revenus28j: earnings.data.totalTND,
          avgPerOrder: earnings.data.avgPerOrder,
          noteMoyenne: status.data.todayStats?.rating ?? null,
          weekly,
        });
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Statistiques</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>
            Impossible de charger vos statistiques.
          </Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 14, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{stats.coursesTotales}</Text>
              <Text style={styles.kpiLabel}>Courses (28j)</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiValue, { color: COLORS.primary }]}>
                {stats.revenus28j.toFixed(1)} DT
              </Text>
              <Text style={styles.kpiLabel}>Revenus (28j)</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{stats.noteMoyenne != null ? `★ ${stats.noteMoyenne.toFixed(1)}` : '—'}</Text>
              <Text style={styles.kpiLabel}>Note moyenne</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{stats.avgPerOrder.toFixed(1)} DT</Text>
              <Text style={styles.kpiLabel}>Gain moyen / course</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenus — 4 dernières semaines</Text>
            <View style={styles.chartContainer}>
              <LineChart data={stats.weekly} />
            </View>
            <View style={styles.chartLegend}>
              {stats.weekly.map((v, i) => (
                <Text key={i} style={styles.chartLegendText}>
                  S{i + 1} : {v.toFixed(1)} DT
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingRight: 12,
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 28,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  kpiCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    width: (width - 42) / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  kpiLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  chartLegendText: {
    color: COLORS.muted,
    fontSize: 12,
  },
});
