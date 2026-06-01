import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Modal, TextInput,
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
  green: '#2E7D32',
  amber: '#F57C00',
  blue: '#1565C0',
};

const ROLE_CONFIG = {
  CLIENT:    { label: 'Client',      color: COLORS.blue,   icon: '👤' },
  CHAUFFEUR: { label: 'Chauffeur',   color: COLORS.amber,  icon: '🚕' },
  LIVREUR:   { label: 'Livreur',     color: COLORS.green,  icon: '🛵' },
  DEPANNEUR: { label: 'Dépanneur',   color: COLORS.accent, icon: '🛻' },
  MARCHAND:  { label: 'Marchand',    color: '#7B1FA2',     icon: '🏪' },
  ADMIN:     { label: 'Admin',       color: '#B71C1C',     icon: '⚙️' },
};

const KYC_CONFIG = {
  PENDING:      { label: 'En attente', color: COLORS.amber },
  APPROVED:     { label: 'Approuvé',  color: COLORS.green },
  REJECTED:     { label: 'Rejeté',    color: COLORS.accent },
  NOT_REQUIRED: { label: 'Non requis', color: COLORS.muted },
};

const STATUS_COLORS = {
  COMPLETED: '#2E7D32', CANCELLED: '#B71C1C',
  IN_PROGRESS: '#F57C00', PENDING: '#1565C0', SCHEDULED: '#6A1B9A',
};

const SERVICE_ICONS = { TAXI: '🚕', DELIVERY: '🛵', SOS: '🛻', GROCERY: '🛒' };

const MOCK_USER = {
  id: 'u_mock01', name: 'Tarek Ben Salah', phone: '+21699123456', email: 'tarek@test.tn',
  role: 'CLIENT', kycStatus: 'NOT_REQUIRED', isOnline: false, isBanned: false,
  walletBalance: 14.750, rating: 4.6, createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  totalOrders: 12, completedOrders: 10,
};
const MOCK_ORDERS = [
  { id: 'ord1', serviceType: 'TAXI', status: 'COMPLETED', totalAmount: 4.5, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'ord2', serviceType: 'DELIVERY', status: 'COMPLETED', totalAmount: 8.0, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'ord3', serviceType: 'TAXI', status: 'CANCELLED', totalAmount: 0, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
];
const MOCK_TXS = [
  { id: 't1', type: 'RECHARGE', amount: 20, description: 'Recharge Flouci', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 't2', type: 'DEBIT',    amount: 4.5, description: 'Course taxi #ord1', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, valueStyle }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
  );
}

export default function AdminUserDetailScreen({ route, navigation }) {
  const { userId } = route.params || {};
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  const [walletOp, setWalletOp] = useState('CREDIT');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');

  const load = useCallback(async () => {
    try {
      const [uRes, oRes, tRes] = await Promise.all([
        api.get(`/api/admin/users/${userId}`),
        api.get(`/api/admin/users/${userId}/orders`),
        api.get(`/api/admin/users/${userId}/transactions`),
      ]);
      setUser(uRes.data?.user || uRes.data);
      setOrders(oRes.data?.orders || MOCK_ORDERS);
      setTransactions(tRes.data?.transactions || MOCK_TXS);
    } catch {
      setUser(MOCK_USER);
      setOrders(MOCK_ORDERS);
      setTransactions(MOCK_TXS);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const toggleBan = () => {
    const action = user?.isBanned ? 'débannir' : 'bannir';
    Alert.alert(
      `${user?.isBanned ? 'Débannir' : 'Bannir'} l'utilisateur`,
      `Voulez-vous ${action} ${user?.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await api.post(`/api/admin/users/${userId}/${user?.isBanned ? 'unban' : 'ban'}`);
              setUser(u => ({ ...u, isBanned: !u.isBanned }));
            } catch {
              Alert.alert('Erreur', 'Action échouée');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleWalletAdjust = async () => {
    const amt = parseFloat(walletAmount);
    if (!amt || amt <= 0) { Alert.alert('Erreur', 'Montant invalide'); return; }
    setActionLoading(true);
    try {
      await api.post(`/api/admin/wallets/${userId}/adjust`, {
        operation: walletOp,
        amount: amt,
        reason: walletReason || 'Ajustement admin',
      });
      setUser(u => ({
        ...u,
        walletBalance: walletOp === 'CREDIT' ? u.walletBalance + amt : u.walletBalance - amt,
      }));
      setWalletModal(false);
      setWalletAmount('');
      setWalletReason('');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Ajustement échoué');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );

  if (!user) return null;

  const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.CLIENT;
  const kycCfg = KYC_CONFIG[user.kycStatus] || KYC_CONFIG.NOT_REQUIRED;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fiche utilisateur</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.avatar, { backgroundColor: roleCfg.color + '33' }]}>
            <Text style={styles.avatarText}>{roleCfg.icon}</Text>
          </View>
          <Text style={styles.heroName}>{user.name}</Text>
          <View style={styles.heroRow}>
            <View style={[styles.roleBadge, { backgroundColor: roleCfg.color + '22', borderColor: roleCfg.color }]}>
              <Text style={[styles.roleBadgeText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
            </View>
            {user.isBanned && (
              <View style={styles.bannedBadge}>
                <Text style={styles.bannedText}>🚫 BANNI</Text>
              </View>
            )}
            {user.isOnline && (
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineText}>● En ligne</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroSince}>Membre depuis {formatDate(user.createdAt)}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>{user.walletBalance?.toFixed(3)}</Text>
            <Text style={styles.statLbl}>Wallet (TND)</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>{user.totalOrders || orders.length}</Text>
            <Text style={styles.statLbl}>Commandes</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={[styles.statNum, { color: COLORS.green }]}>⭐ {user.rating?.toFixed(1) || '—'}</Text>
            <Text style={styles.statLbl}>Note</Text>
          </View>
        </View>

        {/* Info */}
        <Section title="Informations">
          <InfoRow label="Téléphone" value={user.phone} />
          <InfoRow label="Email" value={user.email || '—'} />
          <InfoRow label="KYC" value={kycCfg.label} valueStyle={{ color: kycCfg.color, fontWeight: '700' }} />
          <InfoRow label="ID" value={user.id?.slice(-12)} valueStyle={{ fontFamily: 'monospace', fontSize: 12 }} />
        </Section>

        {/* Recent orders */}
        <Section title={`Commandes récentes (${orders.length})`}>
          {orders.slice(0, 5).map(o => (
            <View key={o.id} style={styles.orderRow}>
              <Text style={styles.orderIcon}>{SERVICE_ICONS[o.serviceType] || '📦'}</Text>
              <View style={styles.orderInfo}>
                <Text style={styles.orderType}>{o.serviceType} · #{o.id?.slice(-6)}</Text>
                <Text style={styles.orderDate}>{formatDate(o.createdAt)}</Text>
              </View>
              <View>
                <View style={[styles.orderStatus, { backgroundColor: (STATUS_COLORS[o.status] || COLORS.muted) + '22' }]}>
                  <Text style={[styles.orderStatusText, { color: STATUS_COLORS[o.status] || COLORS.muted }]}>{o.status}</Text>
                </View>
                {o.totalAmount > 0 && <Text style={styles.orderAmount}>{o.totalAmount?.toFixed(3)} TND</Text>}
              </View>
            </View>
          ))}
          {orders.length === 0 && <Text style={styles.emptyText}>Aucune commande</Text>}
        </Section>

        {/* Recent transactions */}
        <Section title="Transactions récentes">
          {transactions.slice(0, 5).map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'DEBIT' ? COLORS.accent : COLORS.green }]}>
                {tx.type === 'DEBIT' ? '-' : '+'}{tx.amount?.toFixed(3)} TND
              </Text>
            </View>
          ))}
          {transactions.length === 0 && <Text style={styles.emptyText}>Aucune transaction</Text>}
        </Section>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#0D2A0D', borderColor: COLORS.green }]}
            onPress={() => setWalletModal(true)}
          >
            <Text style={[styles.actionBtnText, { color: COLORS.green }]}>💰 Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: user.isBanned ? '#0D2A0D' : '#2A0D0D', borderColor: user.isBanned ? COLORS.green : COLORS.accent }]}
            onPress={toggleBan}
            disabled={actionLoading}
          >
            {actionLoading ? <ActivityIndicator color={COLORS.accent} size="small" /> : (
              <Text style={[styles.actionBtnText, { color: user.isBanned ? COLORS.green : COLORS.accent }]}>
                {user.isBanned ? '✅ Débannir' : '🚫 Bannir'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Wallet modal */}
      <Modal visible={walletModal} animationType="slide" transparent onRequestClose={() => setWalletModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ajustement wallet</Text>
            <Text style={styles.modalSub}>Solde actuel: {user.walletBalance?.toFixed(3)} TND</Text>

            <View style={styles.opRow}>
              {['CREDIT', 'DEBIT'].map(op => (
                <TouchableOpacity
                  key={op}
                  style={[styles.opBtn, walletOp === op && styles.opBtnActive]}
                  onPress={() => setWalletOp(op)}
                >
                  <Text style={[styles.opBtnText, walletOp === op && { color: op === 'CREDIT' ? COLORS.green : COLORS.accent }]}>
                    {op === 'CREDIT' ? '+ Crédit' : '- Débit'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              value={walletAmount}
              onChangeText={setWalletAmount}
              placeholder="Montant (TND)"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.modalInput, { marginTop: 8 }]}
              value={walletReason}
              onChangeText={setWalletReason}
              placeholder="Motif (optionnel)"
              placeholderTextColor={COLORS.muted}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setWalletModal(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: walletOp === 'CREDIT' ? COLORS.green : COLORS.accent }]}
                onPress={handleWalletAdjust}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <Text style={styles.modalConfirmText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingBox: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  heroCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 32 },
  heroName: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  heroRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  roleBadgeText: { fontSize: 12, fontWeight: '700' },
  bannedBadge: { backgroundColor: '#2A0D0D', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.accent },
  bannedText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  onlineBadge: { backgroundColor: '#0D2A0D', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  onlineText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  heroSince: { color: COLORS.muted, fontSize: 12 },
  statsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
  },
  statChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  section: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.muted, fontSize: 13 },
  infoValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  orderIcon: { fontSize: 20 },
  orderInfo: { flex: 1 },
  orderType: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  orderDate: { color: COLORS.muted, fontSize: 11 },
  orderStatus: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignItems: 'center' },
  orderStatusText: { fontSize: 10, fontWeight: '700' },
  orderAmount: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginTop: 2 },
  txRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  txInfo: { flex: 1 },
  txDesc: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  txDate: { color: COLORS.muted, fontSize: 11 },
  txAmount: { fontSize: 13, fontWeight: '800' },
  emptyText: { color: COLORS.muted, fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  actionBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1,
  },
  actionBtnText: { fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  modalSub: { color: COLORS.muted, fontSize: 13, marginBottom: 16 },
  opRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  opBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  opBtnActive: { borderColor: COLORS.accent },
  opBtnText: { color: COLORS.muted, fontWeight: '700' },
  modalInput: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, fontSize: 14, padding: 12,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.muted, fontWeight: '600' },
  modalConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
