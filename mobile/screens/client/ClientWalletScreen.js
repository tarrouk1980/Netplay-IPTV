import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const RECHARGE_AMOUNTS = [10, 20, 50, 100];

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function ClientWalletScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState('history');

  const load = useCallback(() => {
    api.get('/api/wallet')
      .then(r => {
        const balance = r.data?.balance || 0;
        const transactions = (r.data?.transactions || []).map(t => ({
          id: t.id,
          type: t.type === 'CREDIT' ? 'CREDIT' : 'DEBIT',
          label: t.label || 'Transaction',
          amount: t.amount,
          date: fmtDate(t.date),
          icon: t.amount >= 0 ? '➕' : '➖',
        }));
        setData({ balance, transactions });
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = data || { balance: 0, transactions: [] };
  const totalIn = d.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = d.transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const recharge = (amount) => {
    navigation.navigate('Payment', { amount, purpose: 'WALLET_RECHARGE' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 Mon portefeuille</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger votre portefeuille. Vérifiez votre connexion.
          </Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(); }} style={{ backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceAmount}>{d.balance.toFixed(3)}</Text>
            <Text style={styles.balanceTND}>TND</Text>
          </View>

          <Text style={styles.sectionTitle}>RECHARGER</Text>
          <View style={styles.rechargeGrid}>
            {RECHARGE_AMOUNTS.map(amt => (
              <TouchableOpacity key={amt} style={styles.rechargeBtn} onPress={() => recharge(amt)}>
                <Text style={styles.rechargeAmount}>{amt} TND</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.customRechargeBtn} onPress={() => recharge(0)}>
            <Text style={styles.customRechargeBtnText}>+ Montant personnalisé</Text>
          </TouchableOpacity>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]}
              onPress={() => setTab('history')}
            >
              <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Historique</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'stats' && styles.tabBtnActive]}
              onPress={() => setTab('stats')}
            >
              <Text style={[styles.tabText, tab === 'stats' && styles.tabTextActive]}>Statistiques</Text>
            </TouchableOpacity>
          </View>

          {tab === 'history' ? (
            d.transactions.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>💳</Text>
                <Text style={{ color: COLORS.muted, fontSize: 14 }}>Aucune transaction</Text>
              </View>
            ) : (
              d.transactions.map(tx => (
                <View key={tx.id} style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: tx.type === 'CREDIT' ? COLORS.green + '20' : COLORS.red + '20' }]}>
                    <Text style={{ fontSize: 18 }}>{tx.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txLabel}>{tx.label}</Text>
                    <Text style={styles.txDate}>{tx.date}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: tx.type === 'CREDIT' ? COLORS.green : COLORS.red }]}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(3)} TND
                  </Text>
                </View>
              ))
            )
          ) : (
            <View style={styles.statsCard}>
              {[
                { label: 'Total entrées', value: `+${totalIn.toFixed(3)} TND`, color: COLORS.green },
                { label: 'Total sorties', value: `-${totalOut.toFixed(3)} TND`, color: COLORS.red },
              ].map((s, i) => (
                <View key={i} style={[styles.statRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                </View>
              ))}
            </View>
          )}

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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  scroll: { padding: 16 },
  balanceCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1.5, borderColor: COLORS.accent + '40',
  },
  balanceLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  balanceAmount: { color: COLORS.accent, fontSize: 44, fontWeight: '900', lineHeight: 48 },
  balanceTND: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  rechargeGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  rechargeBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  rechargeAmount: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  customRechargeBtn: {
    backgroundColor: COLORS.accent + '15', borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  customRechargeBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tabBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.accent },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  txIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  txDate: { color: COLORS.muted, fontSize: 11 },
  txAmount: { fontSize: 13, fontWeight: '800' },
  statsCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  statLabel: { color: COLORS.muted, fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: '700' },
});
