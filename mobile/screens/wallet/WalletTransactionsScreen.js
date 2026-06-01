import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  red: '#E74C3C',
  accent: '#F5A623',
  blue: '#3498DB',
};

const TYPES = [
  { key: 'ALL', label: 'Tout' },
  { key: 'CREDIT', label: 'Crédits' },
  { key: 'DEBIT', label: 'Débits' },
  { key: 'RECHARGE', label: 'Recharges' },
  { key: 'REFUND', label: 'Remboursements' },
];

const TYPE_CONFIG = {
  CREDIT:    { sign: '+', color: COLORS.green,  icon: '⬆️' },
  DEBIT:     { sign: '-', color: COLORS.red,    icon: '⬇️' },
  RECHARGE:  { sign: '+', color: COLORS.blue,   icon: '💳' },
  REFUND:    { sign: '+', color: COLORS.green,  icon: '↩️' },
  PAYMENT:   { sign: '-', color: COLORS.red,    icon: '🛒' },
  EARNING:   { sign: '+', color: COLORS.green,  icon: '💰' },
  PENALTY:   { sign: '-', color: COLORS.red,    icon: '⚠️' },
  PROMO:     { sign: '+', color: COLORS.accent, icon: '🎁' },
};

const MOCK_TRANSACTIONS = [
  { id: 'tx1', type: 'RECHARGE', amount: 20, description: 'Recharge Flouci', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'tx2', type: 'DEBIT',    amount: 4.5, description: 'Course taxi #A3F2', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'tx3', type: 'REFUND',   amount: 2.0, description: 'Remboursement commande annulée', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'tx4', type: 'PROMO',    amount: 5.0, description: 'Code promo BIENVENUE', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'tx5', type: 'DEBIT',    amount: 8.0, description: 'Livraison #D8C1', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'tx6', type: 'DEBIT',    amount: 12.5, description: 'SOS Remorquage #S2F4', createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'tx7', type: 'RECHARGE', amount: 50,  description: 'Recharge D17', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 'tx8', type: 'CREDIT',   amount: 1.0, description: 'Bonus parrainage', createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
];

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function TransactionRow({ tx }) {
  const cfg = TYPE_CONFIG[tx.type] || { sign: '', color: COLORS.muted, icon: '•' };
  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: cfg.color + '18' }]}>
        <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
        <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
      </View>
      <Text style={[styles.txAmount, { color: cfg.color }]}>
        {cfg.sign}{Math.abs(tx.amount).toFixed(3)} TND
      </Text>
    </View>
  );
}

export default function WalletTransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/wallet/transactions');
      setTransactions(res.data?.transactions || MOCK_TRANSACTIONS);
    } catch {
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (activeType === 'ALL') {
      setFiltered(transactions);
    } else {
      setFiltered(transactions.filter(tx => tx.type === activeType));
    }
  }, [activeType, transactions]);

  const totalIn = transactions.filter(tx => ['CREDIT', 'RECHARGE', 'REFUND', 'PROMO', 'EARNING'].includes(tx.type)).reduce((s, tx) => s + tx.amount, 0);
  const totalOut = transactions.filter(tx => ['DEBIT', 'PAYMENT', 'PENALTY'].includes(tx.type)).reduce((s, tx) => s + tx.amount, 0);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const header = 'Date,Type,Description,Montant (TND)\n';
      const rows = transactions.map(tx => {
        const cfg = TYPE_CONFIG[tx.type] || { sign: '' };
        return `"${formatDate(tx.createdAt)}","${tx.type}","${tx.description}","${cfg.sign}${tx.amount.toFixed(3)}"`;
      }).join('\n');
      const csv = header + rows;
      const path = FileSystem.documentDirectory + `transactions_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Exporter les transactions' });
      } else {
        Alert.alert('Export', 'Fichier CSV créé');
      }
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'exporter");
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique Wallet</Text>
        <TouchableOpacity onPress={exportCSV} disabled={exporting} style={styles.exportBtn}>
          {exporting ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={styles.exportBtnText}>CSV</Text>}
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryNum, { color: COLORS.green }]}>+{totalIn.toFixed(3)}</Text>
          <Text style={styles.summaryLbl}>Entrées (TND)</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryChip}>
          <Text style={[styles.summaryNum, { color: COLORS.red }]}>-{totalOut.toFixed(3)}</Text>
          <Text style={styles.summaryLbl}>Sorties (TND)</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryChip}>
          <Text style={styles.summaryNum}>{(totalIn - totalOut).toFixed(3)}</Text>
          <Text style={styles.summaryLbl}>Solde net</Text>
        </View>
      </View>

      {/* Type filter */}
      <FlatList
        data={TYPES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.key}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeType === item.key && styles.filterChipActive]}
            onPress={() => setActiveType(item.key)}
          >
            <Text style={[styles.filterChipText, activeType === item.key && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Aucune transaction</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={tx => tx.id}
          renderItem={({ item }) => <TransactionRow tx={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
  exportBtn: { backgroundColor: COLORS.accent + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.accent },
  exportBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 12 },
  summaryRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryChip: { flex: 1, alignItems: 'center' },
  summaryNum: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  summaryLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 4 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '18' },
  filterChipText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.accent },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: COLORS.border },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, backgroundColor: COLORS.surface,
  },
  txIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDesc: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  txDate: { color: COLORS.muted, fontSize: 12 },
  txAmount: { fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
