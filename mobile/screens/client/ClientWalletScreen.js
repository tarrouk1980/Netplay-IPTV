import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK = {
  balance: 47.500,
  bonus: 12.000,
  totalTopUp: 250.000,
  totalSpent: 202.500,
  transactions: [
    { id: 'T1', type: 'credit', label: 'Recharge portefeuille', amount: 50.000, date: 'Aujourd\'hui 10:22', icon: '➕' },
    { id: 'T2', type: 'debit', label: 'Course taxi #RID-0091', amount: -14.500, date: 'Hier 18:45', icon: '🚕' },
    { id: 'T3', type: 'debit', label: 'Commande restaurant #CMD-0042', amount: -32.000, date: 'Hier 13:10', icon: '🍽️' },
    { id: 'T4', type: 'credit', label: 'Bonus parrainage', amount: 10.000, date: '01/06 09:00', icon: '🎁' },
    { id: 'T5', type: 'debit', label: 'Livraison express', amount: -8.200, date: '30/05 20:15', icon: '📦' },
    { id: 'T6', type: 'credit', label: 'Remboursement commande', amount: 14.500, date: '29/05 14:00', icon: '↩️' },
  ],
};

const TOPUP_AMOUNTS = [10, 20, 50, 100];

export default function ClientWalletScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/api/client/wallet')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data?.transactions.filter(t =>
    filter === 'all' ? true : filter === 'credit' ? t.type === 'credit' : t.type === 'debit'
  ) || [];

  const handleTopUp = (amount) => {
    Alert.alert('Recharger', `Recharger ${amount} TND ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () => navigation.navigate('WalletRecharge', { amount }) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Mon Portefeuille</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceVal}>{data.balance.toFixed(3)} TND</Text>
            {data.bonus > 0 && (
              <View style={styles.bonusBadge}>
                <Text style={styles.bonusText}>🎁 +{data.bonus.toFixed(3)} TND bonus</Text>
              </View>
            )}
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Text style={[styles.balanceStatVal, { color: COLORS.green }]}>+{data.totalTopUp.toFixed(0)}</Text>
                <Text style={styles.balanceStatLabel}>TND rechargés</Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceStat}>
                <Text style={[styles.balanceStatVal, { color: COLORS.red }]}>-{data.totalSpent.toFixed(0)}</Text>
                <Text style={styles.balanceStatLabel}>TND dépensés</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>RECHARGER</Text>
          <View style={styles.topUpRow}>
            {TOPUP_AMOUNTS.map(amt => (
              <TouchableOpacity key={amt} style={styles.topUpBtn} onPress={() => handleTopUp(amt)}>
                <Text style={styles.topUpVal}>{amt}</Text>
                <Text style={styles.topUpCur}>TND</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.customTopUp} onPress={() => navigation.navigate('WalletRecharge', {})}>
            <Text style={styles.customTopUpText}>+ Montant personnalisé</Text>
          </TouchableOpacity>

          <View style={styles.filterRow}>
            {['all', 'credit', 'debit'].map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                  {f === 'all' ? 'Tout' : f === 'credit' ? '⬆️ Crédits' : '⬇️ Débits'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>HISTORIQUE</Text>
          {filtered.map(t => (
            <View key={t.id} style={styles.txRow}>
              <View style={styles.txIconBox}>
                <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txLabel}>{t.label}</Text>
                <Text style={styles.txDate}>{t.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: t.type === 'credit' ? COLORS.green : COLORS.red }]}>
                {t.amount > 0 ? '+' : ''}{t.amount.toFixed(3)} TND
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  balanceCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.accent + '30' },
  balanceLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  balanceVal: { color: COLORS.accent, fontSize: 36, fontWeight: '900', marginBottom: 10 },
  bonusBadge: { backgroundColor: COLORS.green + '20', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.green + '40', marginBottom: 16 },
  bonusText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  balanceStats: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  balanceStat: { alignItems: 'center' },
  balanceStatVal: { fontSize: 16, fontWeight: '900' },
  balanceStatLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  balanceDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  topUpRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  topUpBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  topUpVal: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  topUpCur: { color: COLORS.muted, fontSize: 10 },
  customTopUp: { backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '40', marginBottom: 20 },
  customTopUpText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  filterBtnText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  filterBtnTextActive: { color: COLORS.accent },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  txIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  txLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  txDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '900' },
});
