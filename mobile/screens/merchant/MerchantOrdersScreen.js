import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#4CAF50',
  red: '#F44336',
  orange: '#FF9800',
};

const TABS = ['Nouvelles', 'En préparation', 'Prêtes', 'Historique'];

const STATUT = {
  nouvelle: 'Nouvelles',
  preparation: 'En préparation',
  prete: 'Prêtes',
  historique: 'Historique',
};

const MOCK_ORDERS = [
  {
    id: 'CMD-2401',
    statut: 'nouvelle',
    heureRecue: '14:32',
    client: 'Client ****li',
    items: '2x Burger Classic, 1x Frites, 1x Coca',
    total: 28.5,
    timer: 180,
  },
  {
    id: 'CMD-2400',
    statut: 'nouvelle',
    heureRecue: '14:28',
    client: 'Client ****ma',
    items: '1x Pizza Margherita, 2x Jus Orange',
    total: 19.9,
    timer: 420,
  },
  {
    id: 'CMD-2398',
    statut: 'preparation',
    heureRecue: '14:10',
    client: 'Client ****ss',
    items: '3x Sandwich Thon, 1x Salade César',
    total: 33.0,
    timer: null,
  },
  {
    id: 'CMD-2395',
    statut: 'prete',
    heureRecue: '13:55',
    client: 'Client ****ad',
    items: '1x Couscous Agneau, 1x Lben',
    total: 22.5,
    timer: null,
  },
  {
    id: 'CMD-2390',
    statut: 'historique',
    heureRecue: '13:20',
    client: 'Client ****ne',
    items: '2x Merguez, 1x Frites, 2x Eau',
    total: 25.0,
    timer: null,
  },
];

function formatTimer(seconds) {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function StatBadge({ label, count, color }) {
  return (
    <View style={styles.statBadge}>
      <View style={[styles.statDot, { backgroundColor: color }]}>
        <Text style={styles.statCount}>{count}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function OrderCard({ order, onAccepter, onRefuser, onPret }) {
  const [timerSec, setTimerSec] = useState(order.timer || 0);

  useEffect(() => {
    if (order.statut !== 'nouvelle' || !order.timer) return;
    const interval = setInterval(() => {
      setTimerSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.statut, order.timer]);

  const timerUrgent = timerSec < 60 && timerSec > 0;

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderTime}>Reçue à {order.heureRecue}</Text>
        </View>
        {order.statut === 'nouvelle' && (
          <View style={[styles.timerBadge, timerUrgent && styles.timerBadgeUrgent]}>
            <Text style={[styles.timerText, timerUrgent && styles.timerTextUrgent]}>
              ⏱ {formatTimer(timerSec)}
            </Text>
          </View>
        )}
        {order.statut === 'preparation' && (
          <View style={styles.statutBadgePrep}>
            <Text style={styles.statutBadgePrepText}>En préparation</Text>
          </View>
        )}
        {order.statut === 'prete' && (
          <View style={styles.statutBadgePrete}>
            <Text style={styles.statutBadgePreteText}>Prête ✓</Text>
          </View>
        )}
        {order.statut === 'historique' && (
          <View style={styles.statutBadgeHisto}>
            <Text style={styles.statutBadgeHistoText}>Livrée</Text>
          </View>
        )}
      </View>

      <View style={styles.orderDivider} />

      <View style={styles.orderBody}>
        <Text style={styles.orderClient}>{order.client}</Text>
        <Text style={styles.orderItems}>{order.items}</Text>
        <Text style={styles.orderTotal}>{order.total.toFixed(2)} TND</Text>
      </View>

      {order.statut === 'nouvelle' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.refuserBtn} onPress={() => onRefuser(order.id)}>
            <Text style={styles.refuserBtnText}>✕ Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accepterBtn} onPress={() => onAccepter(order.id)}>
            <Text style={styles.accepterBtnText}>✓ Accepter</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.statut === 'preparation' && (
        <TouchableOpacity style={styles.pretBtn} onPress={() => onPret(order.id)}>
          <Text style={styles.pretBtnText}>Marquer comme Prête</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MerchantOrdersScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Nouvelles');
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const handleAccepter = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, statut: 'preparation', timer: null } : o))
    );
  };

  const handleRefuser = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handlePret = (id) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, statut: 'prete' } : o))
    );
  };

  const filteredOrders = orders.filter((o) => STATUT[o.statut] === activeTab);

  const countByStatut = (statut) => orders.filter((o) => o.statut === statut).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes commandes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <StatBadge label="En attente" count={countByStatut('nouvelle')} color={COLORS.red} />
        <StatBadge label="Préparation" count={countByStatut('preparation')} color={COLORS.orange} />
        <StatBadge label="Prêtes" count={countByStatut('prete')} color={COLORS.green} />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders list */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Aucune commande dans cette catégorie</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccepter={handleAccepter}
              onRefuser={handleRefuser}
              onPret={handlePret}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { color: COLORS.text, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statDot: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  statCount: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  statLabel: { color: COLORS.muted, fontSize: 12 },

  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },

  scroll: { flex: 1, padding: 16 },

  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
  },
  orderId: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  orderTime: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

  timerBadge: {
    backgroundColor: '#1A2A1A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timerBadgeUrgent: { backgroundColor: '#2A1010' },
  timerText: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  timerTextUrgent: { color: COLORS.red },

  statutBadgePrep: {
    backgroundColor: '#2A200A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statutBadgePrepText: { color: COLORS.orange, fontSize: 12, fontWeight: '600' },

  statutBadgePrete: {
    backgroundColor: '#0A2A10',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statutBadgePreteText: { color: COLORS.green, fontSize: 12, fontWeight: '600' },

  statutBadgeHisto: {
    backgroundColor: '#16162A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statutBadgeHistoText: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },

  orderDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },

  orderBody: { padding: 14 },
  orderClient: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  orderItems: { color: COLORS.text, fontSize: 14, marginBottom: 6, lineHeight: 20 },
  orderTotal: { color: COLORS.primary, fontSize: 16, fontWeight: '800' },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    paddingTop: 0,
  },
  refuserBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.red,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  refuserBtnText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  accepterBtn: {
    flex: 2,
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  accepterBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },

  pretBtn: {
    backgroundColor: COLORS.primary,
    margin: 14,
    marginTop: 0,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pretBtnText: { color: COLORS.background, fontSize: 14, fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
