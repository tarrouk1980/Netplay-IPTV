import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const STATS = {
  coursesTotales: 347,
  revenusMonth: 4820,
  noteMoyenne: 4.7,
  tauxAcceptation: 91,
  tempsReponse: 2.3,
};

const REVENUS_SEMAINES = [1200, 980, 1450, 1190];

const TOP_ZONES = [
  { zone: 'Centre-Ville', courses: 89, revenus: 1340 },
  { zone: 'Lac Mariem', courses: 62, revenus: 980 },
  { zone: 'La Marsa', courses: 54, revenus: 870 },
  { zone: 'Ariana', courses: 41, revenus: 650 },
  { zone: 'Manouba', courses: 28, revenus: 420 },
];

function getBadgeNiveau(courses) {
  if (courses >= 500) return { label: 'Platine', color: '#E5E4E2' };
  if (courses >= 300) return { label: 'Or', color: '#F5A623' };
  if (courses >= 150) return { label: 'Argent', color: '#C0C0C0' };
  return { label: 'Bronze', color: '#CD7F32' };
}

function LineChart({ data }) {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;
  const chartWidth = width - 64;
  const chartHeight = 100;
  const stepX = chartWidth / (data.length - 1);

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
  const badge = getBadgeNiveau(STATS.coursesTotales);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Statistiques</Text>
        <View style={[styles.badge, { borderColor: badge.color }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{STATS.coursesTotales}</Text>
            <Text style={styles.kpiLabel}>Courses totales</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: COLORS.primary }]}>
              {STATS.revenusMonth} DT
            </Text>
            <Text style={styles.kpiLabel}>Revenus ce mois</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>★ {STATS.noteMoyenne}</Text>
            <Text style={styles.kpiLabel}>Note moyenne</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{STATS.tauxAcceptation}%</Text>
            <Text style={styles.kpiLabel}>Taux d'acceptation</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardFull]}>
            <Text style={styles.kpiValue}>{STATS.tempsReponse} min</Text>
            <Text style={styles.kpiLabel}>Temps de réponse moyen</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenus — 4 dernières semaines</Text>
          <View style={styles.chartContainer}>
            <LineChart data={REVENUS_SEMAINES} />
          </View>
          <View style={styles.chartLegend}>
            {REVENUS_SEMAINES.map((v, i) => (
              <Text key={i} style={styles.chartLegendText}>
                S{i + 1} : {v} DT
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 zones les plus rentables</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellFlex, styles.tableHeaderText]}>Zone</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Courses</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Revenus</Text>
          </View>
          {TOP_ZONES.map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <View style={styles.tableRankWrap}>
                <Text style={styles.tableRank}>{i + 1}</Text>
              </View>
              <Text style={[styles.tableCell, styles.tableCellFlex, styles.tableText]}>{row.zone}</Text>
              <Text style={[styles.tableCell, styles.tableText]}>{row.courses}</Text>
              <Text style={[styles.tableCell, { color: COLORS.primary }]}>{row.revenus} DT</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  badge: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
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
  kpiCardFull: {
    width: '100%',
    alignItems: 'center',
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
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableHeaderText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  tableRowAlt: {
    backgroundColor: '#ffffff08',
  },
  tableRankWrap: {
    width: 24,
    alignItems: 'center',
  },
  tableRank: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  tableCell: {
    width: 80,
    textAlign: 'center',
  },
  tableCellFlex: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 4,
  },
  tableText: {
    color: COLORS.text,
    fontSize: 13,
  },
});
