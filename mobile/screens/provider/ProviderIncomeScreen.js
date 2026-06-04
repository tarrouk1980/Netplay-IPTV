import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  accent: '#F5A623',
};

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

const MOCK_INCOME = {
  providerName: 'Tarek Ben Ali',
  role: 'CHAUFFEUR',
  totalGross: 847.500,
  platformFee: 0,
  totalNet: 847.500,
  ordersCount: 203,
  avgPerOrder: 4.175,
  workDays: 22,
  bestDay: { date: '2025-05-15', amount: 62.000 },
  byService: [
    { service: 'TAXI', count: 203, amount: 847.500 },
  ],
  byWeek: [
    { week: 'S1 (1-7)', amount: 189.500 },
    { week: 'S2 (8-14)', amount: 231.000 },
    { week: 'S3 (15-21)', amount: 247.500 },
    { week: 'S4 (22-31)', amount: 179.500 },
  ],
  taxNote: 'Revenus soumis à l\'impôt sur le revenu (IR) selon le barème tunisien.',
};

function Row({ label, value, bold, accent, border }) {
  return (
    <View style={[styles.tableRow, border && styles.tableRowBorder]}>
      <Text style={[styles.tableLabel, bold && { fontWeight: '700', color: COLORS.text }]}>{label}</Text>
      <Text style={[styles.tableValue, bold && { fontWeight: '800' }, accent && { color: COLORS.green }]}>{value}</Text>
    </View>
  );
}

export default function ProviderIncomeScreen({ navigation }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/provider/income?month=${month + 1}&year=${year}`)
      .then(r => setIncome(r.data || MOCK_INCOME))
      .catch(() => setIncome(MOCK_INCOME))
      .finally(() => setLoading(false));
  }, [month, year]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleExportPDF = async () => {
    Alert.alert('Export', `Relevé ${MONTHS[month]} ${year} — Fonctionnalité disponible prochainement.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relevé de revenus</Text>
        <TouchableOpacity style={styles.pdfBtn} onPress={handleExportPDF} disabled={exporting || !income}>
          {exporting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.pdfBtnText}>📄 PDF</Text>}
        </TouchableOpacity>
      </View>

      {/* Month navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.monthArrow} onPress={prevMonth}>
          <Text style={styles.monthArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity
          style={[styles.monthArrow, (year === now.getFullYear() && month === now.getMonth()) && { opacity: 0.3 }]}
          onPress={nextMonth}
        >
          <Text style={styles.monthArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.green} size="large" style={{ marginTop: 40 }} />
      ) : income ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Hero card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Revenus nets {MONTHS[month]}</Text>
            <Text style={styles.heroAmount}>{income.totalNet.toFixed(3)}</Text>
            <Text style={styles.heroTND}>TND</Text>
            <View style={styles.heroRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{income.ordersCount}</Text>
                <Text style={styles.heroStatLabel}>commandes</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{income.workDays}</Text>
                <Text style={styles.heroStatLabel}>jours</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{income.avgPerOrder.toFixed(2)}</Text>
                <Text style={styles.heroStatLabel}>moy/cmd</Text>
              </View>
            </View>
          </View>

          {/* Details table */}
          <View style={styles.table}>
            <Text style={styles.tableTitle}>DÉTAIL FINANCIER</Text>
            <Row label="Revenus bruts" value={`${income.totalGross.toFixed(3)} TND`} />
            <Row label="Commission EASYWAY" value="0.000 TND" />
            <Row label="Revenus nets" value={`${income.totalNet.toFixed(3)} TND`} bold accent border />
          </View>

          {/* Weekly */}
          <View style={styles.table}>
            <Text style={styles.tableTitle}>VENTILATION HEBDOMADAIRE</Text>
            {income.byWeek.map((w, i) => (
              <Row key={i} label={w.week} value={`${w.amount.toFixed(3)} TND`} />
            ))}
          </View>

          {/* Best day */}
          <View style={styles.bestDayCard}>
            <Text style={styles.bestDayLabel}>🏆 Meilleure journée</Text>
            <Text style={styles.bestDayDate}>{income.bestDay.date}</Text>
            <Text style={styles.bestDayAmount}>{income.bestDay.amount.toFixed(3)} TND</Text>
          </View>

          {/* Tax note */}
          <View style={styles.taxCard}>
            <Text style={styles.taxTitle}>⚖️ Note fiscale</Text>
            <Text style={styles.taxText}>{income.taxNote}</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : null}
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
  pdfBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  pdfBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  monthArrow: { padding: 8 },
  monthArrowText: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  monthLabel: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  heroCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: COLORS.green + '60',
  },
  heroLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  heroAmount: { color: COLORS.green, fontSize: 52, fontWeight: '900', lineHeight: 56 },
  heroTND: { color: COLORS.green, fontSize: 16, fontWeight: '600', marginBottom: 16 },
  heroRow: { flexDirection: 'row', gap: 32 },
  heroStat: { alignItems: 'center' },
  heroStatNum: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  heroStatLabel: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  table: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  tableTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4, paddingTop: 12 },
  tableLabel: { color: COLORS.muted, fontSize: 13 },
  tableValue: { color: COLORS.text, fontSize: 13 },
  bestDayCard: {
    backgroundColor: '#0D2A1A', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.green + '50',
  },
  bestDayLabel: { color: COLORS.muted, fontSize: 12 },
  bestDayDate: { color: COLORS.muted, fontSize: 12 },
  bestDayAmount: { color: COLORS.green, fontSize: 18, fontWeight: '900' },
  taxCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  taxTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  taxText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
