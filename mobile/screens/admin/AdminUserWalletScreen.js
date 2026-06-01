import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
  Modal,
  RefreshControl,
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
  green: '#27AE60',
  orange: '#F57C00',
  blue: '#1565C0',
};

const TX_ICONS = {
  CREDIT: '⬆️',
  DEBIT: '⬇️',
  REFUND: '↩️',
  BONUS: '🎁',
  WITHDRAWAL: '💸',
  PAYMENT: '💳',
  ADMIN: '🔧',
};

function AdjustModal({ visible, userId, onClose, onConfirm }) {
  const [type, setType] = useState('CREDIT');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) { Alert.alert('Erreur', 'Montant invalide'); return; }
    setLoading(true);
    try {
      await onConfirm(type, num, note.trim());
      setAmount(''); setNote('');
      onClose();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.card}>
          <Text style={m.title}>🔧 Ajustement wallet</Text>
          <View style={m.typeRow}>
            <TouchableOpacity style={[m.typeBtn, type === 'CREDIT' && { borderColor: COLORS.green, backgroundColor: COLORS.green + '22' }]} onPress={() => setType('CREDIT')}>
              <Text style={[m.typeTxt, type === 'CREDIT' && { color: COLORS.green }]}>⬆️ Crédit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[m.typeBtn, type === 'DEBIT' && { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' }]} onPress={() => setType('DEBIT')}>
              <Text style={[m.typeTxt, type === 'DEBIT' && { color: COLORS.accent }]}>⬇️ Débit</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={m.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Montant (TND)" placeholderTextColor={COLORS.muted} />
          <TextInput style={[m.input, { minHeight: 60, textAlignVertical: 'top' }]} value={note} onChangeText={setNote} multiline placeholder="Note admin (motif)..." placeholderTextColor={COLORS.muted} />
          <View style={m.btns}>
            <TouchableOpacity style={m.cancel} onPress={onClose} disabled={loading}>
              <Text style={m.cancelTxt}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[m.confirm, { backgroundColor: type === 'CREDIT' ? COLORS.green : COLORS.accent }]} onPress={handle} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={m.confirmTxt}>{type === 'CREDIT' ? '+ Créditer' : '- Débiter'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeBtn: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  typeTxt: { color: COLORS.muted, fontWeight: '700' },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancel: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelTxt: { color: COLORS.muted, fontWeight: '600' },
  confirm: { flex: 1, borderRadius: 10, padding: 13, alignItems: 'center' },
  confirmTxt: { color: '#FFF', fontWeight: '700' },
});

export default function AdminUserWalletScreen({ route, navigation }) {
  const { userId, userName } = route.params || {};
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adjustModal, setAdjustModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/admin/users/${userId}/wallet`);
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions || []);
    } catch {
      setWallet({ balance: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleAdjust = async (type, amount, note) => {
    await api.post(`/api/admin/users/${userId}/wallet/adjust`, { type, amount, note });
    Alert.alert('Succès ✅', `${type === 'CREDIT' ? '+' : '-'}${amount} TND ${type === 'CREDIT' ? 'crédité' : 'débité'}.`);
    load();
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.green} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>💰 Wallet — {userName}</Text>
        </View>
        <TouchableOpacity style={s.adjustBtn} onPress={() => setAdjustModal(true)}>
          <Text style={s.adjustBtnTxt}>+ Ajuster</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item, i) => item.id || i.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />}
        ListHeaderComponent={
          <>
            {/* Balance */}
            <View style={s.balanceCard}>
              <Text style={s.balanceLabel}>Solde actuel</Text>
              <Text style={[s.balanceValue, { color: (wallet?.balance || 0) >= 0 ? COLORS.green : COLORS.accent }]}>
                {parseFloat(wallet?.balance || 0).toFixed(3)} TND
              </Text>
              {wallet?.totalCredited != null && (
                <View style={s.balanceMeta}>
                  <Text style={s.metaItem}>⬆️ Total crédité: {wallet.totalCredited.toFixed(3)} TND</Text>
                  <Text style={s.metaItem}>⬇️ Total débité: {(wallet.totalDebited || 0).toFixed(3)} TND</Text>
                </View>
              )}
            </View>

            <Text style={s.sectionTitle}>Historique des transactions</Text>
            {transactions.length === 0 && (
              <Text style={s.emptyTxt}>Aucune transaction.</Text>
            )}
          </>
        }
        renderItem={({ item }) => {
          const isCredit = ['CREDIT', 'REFUND', 'BONUS'].includes(item.type);
          const icon = TX_ICONS[item.type] || '•';
          return (
            <View style={s.txCard}>
              <View style={[s.txIcon, { backgroundColor: isCredit ? COLORS.green + '22' : COLORS.accent + '22' }]}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.txType}>{item.type}</Text>
                {item.note && <Text style={s.txNote}>{item.note}</Text>}
                <Text style={s.txDate}>{new Date(item.createdAt).toLocaleString('fr-TN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={[s.txAmount, { color: isCredit ? COLORS.green : COLORS.accent }]}>
                {isCredit ? '+' : '-'}{parseFloat(item.amount || 0).toFixed(3)} TND
              </Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <AdjustModal
        visible={adjustModal}
        userId={userId}
        onClose={() => setAdjustModal(false)}
        onConfirm={handleAdjust}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  adjustBtn: { backgroundColor: COLORS.green + '22', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.green },
  adjustBtnTxt: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  balanceCard: { backgroundColor: COLORS.surface, margin: 16, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  balanceLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  balanceValue: { fontSize: 36, fontWeight: '900', marginBottom: 8 },
  balanceMeta: { gap: 4 },
  metaItem: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 16, marginBottom: 8 },
  emptyTxt: { color: COLORS.muted, textAlign: 'center', marginTop: 20, fontSize: 13 },
  txCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txType: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  txNote: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  txDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});
