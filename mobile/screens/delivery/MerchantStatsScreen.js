import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#27AE60',
  red: '#E74C3C',
  blue: '#3498DB',
  purple: '#9B59B6',
};

const PERIODS = ["Aujourd'hui", 'Cette semaine', 'Ce mois'];

const MOCK_DATA = {
  "Aujourd'hui": {
    commandes: { value: 24, trend: '+3', up: true },
    revenus: { value: '312.50', trend: '+8%', up: true },
    note: { value: '4.6', avis: 18 },
    annulation: { value: '4.2%', trend: '-1.1%', up: true },
    topProducts: [
      { emoji: '🍕', nom: 'Pizza Margherita', ventes: 12, revenu: '96.00' },
      { emoji: '🥗', nom: 'Salade César', ventes: 9, revenu: '63.00' },
      { emoji: '🍔', nom: 'Burger Classic', ventes: 7, revenu: '56.00' },
      { emoji: '🧃', nom: 'Jus Orange Frais', ventes: 6, revenu: '18.00' },
      { emoji: '🍰', nom: 'Gâteau Chocolat', ventes: 5, revenu: '40.00' },
    ],
    hours: [0, 1, 2, 4, 6, 8, 10, 7, 5, 4, 6, 8, 10, 6, 4],
    satisfaction: { positif: 78, neutre: 16, negatif: 6 },
  },
  'Cette semaine': {
    commandes: { value: 163, trend: '+21', up: true },
    revenus: { value: '2 184.00', trend: '+12%', up: true },
    note: { value: '4.5', avis: 94 },
    annulation: { value: '5.1%', trend: '+0.4%', up: false },
    topProducts: [
      { emoji: '🍕', nom: 'Pizza Margherita', ventes: 74, revenu: '592.00' },
      { emoji: '🍔', nom: 'Burger Classic', ventes: 58, revenu: '464.00' },
      { emoji: '🥗', nom: 'Salade César', ventes: 46, revenu: '322.00' },
      { emoji: '🍰', nom: 'Gâteau Chocolat', ventes: 39, revenu: '312.00' },
      { emoji: '🧃', nom: 'Jus Orange Frais', ventes: 35, revenu: '105.00' },
    ],
    hours: [0, 0, 1, 3, 7, 9, 11, 10, 8, 7, 9, 12, 13, 9, 6],
    satisfaction: { positif: 74, neutre: 19, negatif: 7 },
  },
  'Ce mois': {
    commandes: { value: 712, trend: '+88', up: true },
    revenus: { value: '9 456.00', trend: '+18%', up: true },
    note: { value: '4.7', avis: 381 },
    annulation: { value: '3.8%', trend: '-0.9%', up: true },
    topProducts: [
      { emoji: '🍕', nom: 'Pizza Margherita', ventes: 298, revenu: '2 384.00' },
      { emoji: '🍔', nom: 'Burger Classic', ventes: 241, revenu: '1 928.00' },
      { emoji: '🥗', nom: 'Salade César', ventes: 187, revenu: '1 309.00' },
      { emoji: '🍰', nom: 'Gâteau Chocolat', ventes: 162, revenu: '1 296.00' },
      { emoji: '🧃', nom: 'Jus Orange Frais', ventes: 148, revenu: '444.00' },
    ],
    hours: [0, 0, 1, 2, 5, 8, 10, 12, 11, 9, 10, 14, 15, 11, 8],
    satisfaction: { positif: 81, neutre: 14, negatif: 5 },
  },
};

const HOURS_LABELS = ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h'];

export default function MerchantStatsScreen({ navigation }) {
  const [period, setPeriod] = useState(PERIODS[0]);
  const data = MOCK_DATA[period];
  const maxBar = Math.max(...data.hours, 1);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes statistiques</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Commandes reçues</Text>
            <Text style={styles.kpiValue}>{data.commandes.value}</Text>
            <Text style={[styles.kpiTrend, { color: data.commandes.up ? COLORS.green : COLORS.red }]}>
              {data.commandes.up ? '↑' : '↓'} {data.commandes.trend}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Revenus</Text>
            <Text style={styles.kpiValue}>{data.revenus.value}</Text>
            <Text style={styles.kpiSub}>TND</Text>
            <Text style={[styles.kpiTrend, { color: data.revenus.up ? COLORS.green : COLORS.red }]}>
              {data.revenus.up ? '↑' : '↓'} {data.revenus.trend}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Note moyenne</Text>
            <Text style={styles.kpiValue}>⭐ {data.note.value}</Text>
            <Text style={styles.kpiSub}>{data.note.avis} avis</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Taux annulation</Text>
            <Text style={styles.kpiValue}>{data.annulation.value}</Text>
            <Text style={[styles.kpiTrend, { color: data.annulation.up ? COLORS.green : COLORS.red }]}>
              {data.annulation.up ? '↓' : '↑'} {data.annulation.trend}
            </Text>
          </View>
        </View>

        {/* Top 5 Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Produits les plus vendus</Text>
          {data.topProducts.map((p, i) => (
            <View key={i} style={styles.productRow}>
              <Text style={styles.productRank}>{i + 1}</Text>
              <Text style={styles.productEmoji}>{p.emoji}</Text>
              <Text style={styles.productName} numberOfLines={1}>{p.nom}</Text>
              <View style={styles.productStats}>
                <Text style={styles.productVentes}>{p.ventes} ventes</Text>
                <Text style={styles.productRevenu}>{p.revenu} TND</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Peak Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Heures de pointe</Text>
          <View style={styles.chartContainer}>
            {data.hours.map((val, i) => (
              <View key={i} style={styles.barWrapper}>
                <View style={[styles.bar, { height: Math.max((val / maxBar) * 80, 4) }]} />
                <Text style={styles.barLabel}>{HOURS_LABELS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Satisfaction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>😊 Satisfaction client</Text>
          <View style={styles.satRow}>
            <Text style={[styles.satLabel, { color: COLORS.green }]}>Positif</Text>
            <View style={styles.satBarBg}>
              <View style={[styles.satBar, { width: `${data.satisfaction.positif}%`, backgroundColor: COLORS.green }]} />
            </View>
            <Text style={styles.satPct}>{data.satisfaction.positif}%</Text>
          </View>
          <View style={styles.satRow}>
            <Text style={[styles.satLabel, { color: COLORS.primary }]}>Neutre</Text>
            <View style={styles.satBarBg}>
              <View style={[styles.satBar, { width: `${data.satisfaction.neutre}%`, backgroundColor: COLORS.primary }]} />
            </View>
            <Text style={styles.satPct}>{data.satisfaction.neutre}%</Text>
          </View>
          <View style={styles.satRow}>
            <Text style={[styles.satLabel, { color: COLORS.red }]}>Négatif</Text>
            <View style={styles.satBarBg}>
              <View style={[styles.satBar, { width: `${data.satisfaction.negatif}%`, backgroundColor: COLORS.red }]} />
            </View>
            <Text style={styles.satPct}>{data.satisfaction.negatif}%</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  periodRow: {
    flexDirection: 'row', margin: 16, backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 4, gap: 4,
  },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  periodTextActive: { color: COLORS.bg },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12, marginBottom: 8 },
  kpiCard: {
    width: '46%', backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  kpiLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  kpiValue: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  kpiSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  kpiTrend: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  section: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  productRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  productRank: { color: COLORS.muted, fontSize: 13, width: 20, fontWeight: '700' },
  productEmoji: { fontSize: 20, marginRight: 10 },
  productName: { color: COLORS.text, fontSize: 14, flex: 1 },
  productStats: { alignItems: 'flex-end' },
  productVentes: { color: COLORS.muted, fontSize: 11 },
  productRevenu: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 3 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: COLORS.primary, borderRadius: 3, marginBottom: 4 },
  barLabel: { color: COLORS.muted, fontSize: 8, textAlign: 'center' },
  satRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  satLabel: { width: 52, fontSize: 12, fontWeight: '600' },
  satBarBg: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  satBar: { height: '100%', borderRadius: 5 },
  satPct: { color: COLORS.muted, fontSize: 12, width: 36, textAlign: 'right' },
});
