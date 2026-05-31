import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#252535',
  accent: '#D32F2F',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3E',
  green: '#27AE60',
  warning: '#F57C00',
};

const RECHARGE_OPTIONS = [
  { amount: 7, label: '7 TND', sublabel: '1 semaine' },
  { amount: 30, label: '30 TND', sublabel: '1 mois' },
  { amount: 90, label: '90 TND', sublabel: '3 mois' },
];

function TransactionItem({ tx }) {
  const isCredit = tx.type === 'RECHARGE';
  const dateStr = new Date(tx.createdAt).toLocaleDateString('fr-TN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return (
    <View style={txStyles.row}>
      <View style={[txStyles.icon, { backgroundColor: isCredit ? '#0D2A1A' : '#2A0D0D' }]}>
        <Text style={{ fontSize: 16 }}>{isCredit ? '⬆️' : '⬇️'}</Text>
      </View>
      <View style={txStyles.info}>
        <Text style={txStyles.desc} numberOfLines={1}>{tx.description || tx.type}</Text>
        <Text style={txStyles.date}>{dateStr}</Text>
      </View>
      <Text style={[txStyles.amount, { color: isCredit ? COLORS.green : COLORS.accent }]}>
        {isCredit ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)} TND
      </Text>
    </View>
  );
}

const txStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  desc: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  date: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700' },
});

export default function WalletScreen({ navigation }) {
  const [balance, setBalance] = useState(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recharging, setRecharging] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        api.get('/api/wallet/balance'),
        api.get('/api/wallet/transactions'),
      ]);
      setBalance(balRes.data.walletBalance ?? 0);
      setSubscriptionActive(balRes.data.subscriptionActive ?? false);
      setSubscriptionExpiresAt(balRes.data.subscriptionExpiresAt ?? null);
      setTransactions(txRes.data || []);
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de charger le wallet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleRecharge = async (amount) => {
    Alert.alert(
      `Recharger ${amount} TND`,
      `Confirmer la recharge de ${amount} TND ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setRecharging(true);
            try {
              const res = await api.post('/api/wallet/recharge', { amount });
              setBalance(res.data.newBalance);
              await fetchData();
              Alert.alert('✅ Rechargé', `Votre solde est maintenant ${res.data.newBalance.toFixed(2)} TND`);
            } catch (err) {
              Alert.alert('Erreur', err?.response?.data?.error || 'Recharge échouée.');
            } finally {
              setRecharging(false);
            }
          },
        },
      ]
    );
  };

  const lowBalance = balance !== null && balance < 3;

  const expiresStr = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Wallet</Text>
        <TouchableOpacity onPress={() => navigation.navigate('WalletRecharge')} style={styles.rechargeHeaderBtn}>
          <Text style={styles.rechargeHeaderBtnText}>+ Recharger</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />}
        >
          {/* Balance card */}
          <View style={[styles.balanceCard, lowBalance && styles.balanceCardWarning]}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={[styles.balanceAmount, lowBalance && { color: COLORS.accent }]}>
              {balance !== null ? balance.toFixed(2) : '0.00'} TND
            </Text>
            {lowBalance && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningText}>⚠️ Solde insuffisant — rechargez pour maintenir votre abonnement actif</Text>
              </View>
            )}
          </View>

          {/* Subscription status */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Abonnement</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: subscriptionActive ? COLORS.green : COLORS.accent }]} />
              <Text style={[styles.statusText, { color: subscriptionActive ? COLORS.green : COLORS.accent }]}>
                {subscriptionActive ? 'Actif' : 'Inactif'}
              </Text>
            </View>
            {expiresStr && (
              <Text style={styles.expiresText}>Expire le {expiresStr}</Text>
            )}
            <Text style={styles.infoText}>1 TND débité par jour d'abonnement actif</Text>
          </View>

          {/* Recharge options */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💳 Recharger</Text>
            <View style={styles.rechargeGrid}>
              {RECHARGE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.amount}
                  style={[styles.rechargeBtn, recharging && { opacity: 0.6 }]}
                  onPress={() => handleRecharge(opt.amount)}
                  disabled={recharging}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rechargeBtnAmount}>{opt.label}</Text>
                  <Text style={styles.rechargeBtnSub}>{opt.sublabel}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transactions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📜 Historique</Text>
            {transactions.length === 0 ? (
              <Text style={styles.emptyText}>Aucune transaction pour le moment.</Text>
            ) : (
              transactions.map((tx, i) => <TransactionItem key={tx.id || i} tx={tx} />)
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  balanceCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.border,
  },
  balanceCardWarning: { borderColor: COLORS.accent, backgroundColor: '#1A0D0D' },
  balanceLabel: { color: COLORS.muted, fontSize: 14, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1 },
  balanceAmount: { color: COLORS.text, fontSize: 48, fontWeight: '800' },
  warningBadge: { backgroundColor: '#2A0D0D', borderRadius: 10, padding: 10, marginTop: 4, borderWidth: 1, borderColor: COLORS.accent },
  warningText: { color: COLORS.accent, fontSize: 12, textAlign: 'center', lineHeight: 17 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, gap: 12 },
  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 16, fontWeight: '700' },
  expiresText: { color: COLORS.muted, fontSize: 13 },
  infoText: { color: COLORS.muted, fontSize: 12, fontStyle: 'italic' },
  rechargeGrid: { flexDirection: 'row', gap: 12 },
  rechargeBtn: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', gap: 4,
  },
  rechargeBtnAmount: { color: '#fff', fontSize: 18, fontWeight: '800' },
  rechargeBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  rechargeHeaderBtn: { backgroundColor: COLORS.green, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  rechargeHeaderBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  emptyText: { color: COLORS.muted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
});
