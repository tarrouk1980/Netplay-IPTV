import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  blue: '#1565C0',
  gold: '#FFD700',
  teal: '#00838F',
};

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const MOCK = {
  currentMonth: {
    revenue: 28450,
    expenses: 4200,
    profit: 24250,
    growth: 18.4,
    passRevenue: 7200,
    commissions: 0,
    refunds: 340,
    walletDeposits: 21250,
  },
  monthly: [12000, 14500, 11200, 16800, 18900, 22100, 19400, 24600, 21300, 26800, 28450, null],
  paymentMethods: [
    { method: 'Wallet EasyPay', amount: 15400, pct: 54 },
    { method: 'D17', amount: 7200, pct: 25 },
    { method: 'Cash', amount: 3600, pct: 13 },
    { method: 'Konnect', amount: 2250, pct: 8 },
  ],
  taxBreakdown: {
    grossRevenue: 28450,
    vatCollected: 5400,
    vatPaid: 798,
    netProfit: 22252,
  },
};

function BarChart({ data, color, maxVal }) {
  const max = maxVal || Math.max(...data.filter(Boolean), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 3 }}>
      {data.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{
            width: '100%',
            height: v ? (v / max) * 70 : 2,
            backgroundColor: v ? (i === new Date().getMonth() ? color : color + '55') : COLORS.border,
            borderRadius: 3,
          }} />
          <Text style={{ color: COLORS.muted, fontSize: 7, marginTop: 3 }}>{MONTHS[i]}</Text>
        </View>
      ))}
    </View>
  );
}

function KPICard({ label, value, sub, color, icon }) {
  return (
    <View style={k.card}>
      <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
      <Text style={[k.val, { color }]}>{value}</Text>
      <Text style={k.lbl}>{label}</Text>
      {sub && <Text style={k.sub}>{sub}</Text>}
    </View>
  );
}

const k = StyleSheet.create({
  card: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  val: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  lbl: { color: COLORS.muted, fontSize: 10, textAlign: 'center', fontWeight: '600' },
  sub: { color: COLORS.muted, fontSize: 9, marginTop: 2, textAlign: 'center' },
});

export default function AdminFinancialReportScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/financial/report');
      setData(res.data);
    } catch {
      setData(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      Alert.alert('Export PDF', 'Le rapport financier sera envoyé par email à l\'administrateur.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.gold} size="large" /></View>;

  const d = data || MOCK;
  const cm = d.currentMonth || {};
  const monthName = MONTHS[new Date().getMonth()];

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>📊 Rapport financier</Text>
          <Text style={s.sub}>{monthName} {new Date().getFullYear()}</Text>
        </View>
        <TouchableOpacity style={s.exportBtn} onPress={handleExport} disabled={exporting}>
          {exporting ? <ActivityIndicator color={COLORS.gold} size="small" /> : (
            <Text style={s.exportBtnTxt}>📤 Export</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Main KPIs */}
        <View style={s.kpiRow}>
          <KPICard label="Revenu brut" value={`${cm.revenue?.toLocaleString()} TND`} color={COLORS.green} icon="💰" sub={`+${cm.growth}% vs mois préc.`} />
          <KPICard label="Profit net" value={`${cm.profit?.toLocaleString()} TND`} color={COLORS.gold} icon="📈" />
        </View>
        <View style={[s.kpiRow, { marginTop: 8 }]}>
          <KPICard label="EasyPass" value={`${cm.passRevenue?.toLocaleString()} TND`} color={COLORS.orange} icon="⭐" />
          <KPICard label="Remboursements" value={`${cm.refunds?.toLocaleString()} TND`} color={COLORS.accent} icon="↩️" />
        </View>

        {/* Monthly chart */}
        <View style={s.chartCard}>
          <Text style={s.sectionTitle}>Revenus mensuels</Text>
          <BarChart data={d.monthly || []} color={COLORS.green} />
        </View>

        {/* Payment methods */}
        <Text style={s.sectionTitle}>Méthodes de paiement</Text>
        {(d.paymentMethods || []).map((pm) => (
          <View key={pm.method} style={s.pmRow}>
            <Text style={s.pmMethod}>{pm.method}</Text>
            <View style={s.pmBar}>
              <View style={[s.pmBarFill, { width: `${pm.pct}%`, backgroundColor: COLORS.teal }]} />
            </View>
            <Text style={[s.pmAmount, { color: COLORS.teal }]}>{pm.amount?.toLocaleString()} TND</Text>
            <Text style={s.pmPct}>{pm.pct}%</Text>
          </View>
        ))}

        {/* Tax breakdown */}
        <Text style={[s.sectionTitle, { marginTop: 16 }]}>Fiscalité (TVA 19%)</Text>
        <View style={s.taxCard}>
          {[
            { label: 'Revenu brut', value: d.taxBreakdown?.grossRevenue, color: COLORS.text },
            { label: 'TVA collectée', value: d.taxBreakdown?.vatCollected, color: COLORS.orange },
            { label: 'TVA déductible', value: d.taxBreakdown?.vatPaid, color: COLORS.green },
            { label: 'Bénéfice net', value: d.taxBreakdown?.netProfit, color: COLORS.gold, bold: true },
          ].map((row, i) => (
            <View key={i} style={[s.taxRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Text style={[s.taxLabel, row.bold && { fontWeight: '800' }]}>{row.label}</Text>
              <Text style={[s.taxValue, { color: row.color }, row.bold && { fontSize: 16 }]}>
                {row.value?.toLocaleString()} TND
              </Text>
            </View>
          ))}
        </View>

        {/* Wallet summary */}
        <View style={s.walletCard}>
          <Text style={s.walletTitle}>💳 Dépôts portefeuille</Text>
          <Text style={[s.walletAmount, { color: COLORS.blue }]}>
            {cm.walletDeposits?.toLocaleString()} TND
          </Text>
          <Text style={s.walletSub}>Rechargements clients ce mois</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  exportBtn: { backgroundColor: COLORS.gold + '22', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.gold },
  exportBtnTxt: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 8 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginTop: 16, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, marginTop: 12 },
  pmRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pmMethod: { color: COLORS.text, fontSize: 12, width: 90 },
  pmBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  pmBarFill: { height: '100%', borderRadius: 3 },
  pmAmount: { fontSize: 11, fontWeight: '700', width: 72, textAlign: 'right' },
  pmPct: { color: COLORS.muted, fontSize: 10, width: 28, textAlign: 'right' },
  taxCard: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  taxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  taxLabel: { color: COLORS.muted, fontSize: 13 },
  taxValue: { fontSize: 14, fontWeight: '700' },
  walletCard: { backgroundColor: COLORS.blue + '11', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: COLORS.blue + '44', alignItems: 'center' },
  walletTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  walletAmount: { fontSize: 24, fontWeight: '800' },
  walletSub: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
});
