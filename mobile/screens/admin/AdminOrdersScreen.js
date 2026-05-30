import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import useAdminStore from '../../store/adminStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  accent: '#D32F2F',
  white: '#FFFFFF',
  muted: '#8A8A9A',
  border: '#2A2A3A',
  green: '#2E7D32',
  amber: '#F57C00',
  blue: '#1565C0',
  purple: '#6A1B9A',
};

const SERVICE_COLORS = {
  TAXI: '#1565C0',
  SOS: '#D32F2F',
  DELIVERY: '#F57C00',
  GROCERY: '#2E7D32',
};

const STATUS_COLORS = {
  PENDING: '#F57C00',
  ACCEPTED: '#1565C0',
  IN_PROGRESS: '#6A1B9A',
  COMPLETED: '#2E7D32',
  CANCELLED: '#8A8A9A',
  DISPUTED: '#D32F2F',
};

const TYPE_OPTIONS = [
  { key: '', label: 'Tous' },
  { key: 'TAXI', label: '🚕 Taxi' },
  { key: 'SOS', label: '🆘 SOS' },
  { key: 'DELIVERY', label: '📦 Livraison' },
  { key: 'GROCERY', label: '🛒 Courses' },
];

const STATUS_OPTIONS = [
  { key: '', label: 'Tous' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'ACCEPTED', label: 'Accepté' },
  { key: 'IN_PROGRESS', label: 'En cours' },
  { key: 'COMPLETED', label: 'Terminé' },
  { key: 'CANCELLED', label: 'Annulé' },
  { key: 'DISPUTED', label: 'Litige' },
];

function ChipBar({ options, selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[chips.chip, selected === opt.key && chips.active]}
          onPress={() => onSelect(opt.key)}
          activeOpacity={0.8}
        >
          <Text style={[chips.label, selected === opt.key && chips.activeLabel]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const chips = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  active: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '500' },
  activeLabel: { color: COLORS.white },
});

// ── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({ visible, order, onClose, onCancel }) {
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  if (!order) return null;
  const canCancel = !['CANCELLED', 'COMPLETED'].includes(order.status);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>Commande #{order.id?.slice(-8)}</Text>
          <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
            <Text style={modal.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={modal.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Status & type */}
          <View style={modal.row}>
            <View style={[modal.badge, { backgroundColor: SERVICE_COLORS[order.serviceType] + '22', borderColor: SERVICE_COLORS[order.serviceType] }]}>
              <Text style={[modal.badgeTxt, { color: SERVICE_COLORS[order.serviceType] }]}>{order.serviceType}</Text>
            </View>
            <View style={[modal.badge, { backgroundColor: STATUS_COLORS[order.status] + '22', borderColor: STATUS_COLORS[order.status] }]}>
              <Text style={[modal.badgeTxt, { color: STATUS_COLORS[order.status] }]}>{order.status}</Text>
            </View>
          </View>

          {/* Price */}
          {order.price ? (
            <View style={modal.infoRow}>
              <Text style={modal.infoLabel}>Montant</Text>
              <Text style={modal.infoValue}>{Number(order.price).toFixed(2)} TND</Text>
            </View>
          ) : null}

          {/* Client */}
          {order.client ? (
            <View style={modal.infoRow}>
              <Text style={modal.infoLabel}>Client</Text>
              <Text style={modal.infoValue}>{order.client.name} • {order.client.phone}</Text>
            </View>
          ) : null}

          {/* Provider */}
          {order.provider ? (
            <View style={modal.infoRow}>
              <Text style={modal.infoLabel}>Prestataire</Text>
              <Text style={modal.infoValue}>{order.provider.name} • {order.provider.phone}</Text>
            </View>
          ) : null}

          {/* Origin / Dest */}
          {order.originAddress ? (
            <View style={modal.infoRow}>
              <Text style={modal.infoLabel}>Origine</Text>
              <Text style={modal.infoValue} numberOfLines={2}>{order.originAddress}</Text>
            </View>
          ) : null}
          {order.destinationAddress ? (
            <View style={modal.infoRow}>
              <Text style={modal.infoLabel}>Destination</Text>
              <Text style={modal.infoValue} numberOfLines={2}>{order.destinationAddress}</Text>
            </View>
          ) : null}

          {/* Date */}
          <View style={modal.infoRow}>
            <Text style={modal.infoLabel}>Créée le</Text>
            <Text style={modal.infoValue}>{new Date(order.createdAt).toLocaleString('fr-TN')}</Text>
          </View>

          {/* Timeline */}
          {order.events?.length > 0 ? (
            <View style={modal.section}>
              <Text style={modal.sectionTitle}>Timeline</Text>
              {order.events.map((ev, idx) => (
                <View key={ev.id || idx} style={modal.eventRow}>
                  <View style={modal.eventDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={modal.eventType}>{ev.eventType}</Text>
                    <Text style={modal.eventTime}>{new Date(ev.createdAt).toLocaleString('fr-TN')}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {/* Cancel */}
          {canCancel ? (
            <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
              {!showCancelInput ? (
                <TouchableOpacity style={modal.cancelBtn} onPress={() => setShowCancelInput(true)}>
                  <Text style={modal.cancelBtnTxt}>🚫 Annuler cette commande</Text>
                </TouchableOpacity>
              ) : (
                <View>
                  <TextInput
                    style={modal.reasonInput}
                    placeholder="Raison de l'annulation..."
                    placeholderTextColor={COLORS.muted}
                    value={cancelReason}
                    onChangeText={setCancelReason}
                    multiline
                  />
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <TouchableOpacity style={[modal.cancelBtn, { flex: 1, backgroundColor: COLORS.surfaceAlt }]} onPress={() => { setShowCancelInput(false); setCancelReason(''); }}>
                      <Text style={[modal.cancelBtnTxt, { color: COLORS.muted }]}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[modal.cancelBtn, { flex: 1 }]}
                      onPress={() => onCancel(order.id, cancelReason, () => { setShowCancelInput(false); setCancelReason(''); onClose(); })}
                    >
                      <Text style={modal.cancelBtnTxt}>Confirmer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 6 },
  closeTxt: { color: COLORS.muted, fontSize: 20 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.muted, fontSize: 13 },
  infoValue: { color: COLORS.white, fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  section: { marginTop: 20 },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, marginTop: 4 },
  eventType: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
  eventTime: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  cancelBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  cancelBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  reasonInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    color: COLORS.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

// ── Order Item ───────────────────────────────────────────────────────────────
function OrderItem({ order, onPress }) {
  const svcColor = SERVICE_COLORS[order.serviceType] || COLORS.muted;
  const sttColor = STATUS_COLORS[order.status] || COLORS.muted;

  return (
    <TouchableOpacity style={oItem.card} onPress={onPress} activeOpacity={0.85}>
      <View style={oItem.left}>
        <View style={[oItem.typeBadge, { backgroundColor: svcColor + '22', borderColor: svcColor }]}>
          <Text style={[oItem.typeTxt, { color: svcColor }]}>{order.serviceType}</Text>
        </View>
        <View style={[oItem.statusBadge, { backgroundColor: sttColor + '22', borderColor: sttColor }]}>
          <Text style={[oItem.statusTxt, { color: sttColor }]}>{order.status}</Text>
        </View>
      </View>
      <View style={oItem.mid}>
        <Text style={oItem.clientName} numberOfLines={1}>{order.client?.name || '—'}</Text>
        <Text style={oItem.date}>{new Date(order.createdAt).toLocaleDateString('fr-TN')}</Text>
      </View>
      <View style={oItem.right}>
        {order.price ? (
          <Text style={oItem.price}>{Number(order.price).toFixed(2)}</Text>
        ) : (
          <Text style={oItem.noPrice}>— TND</Text>
        )}
        {order.price ? <Text style={oItem.currency}>TND</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const oItem = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 14,
    marginVertical: 5,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  left: { gap: 5, minWidth: 80 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  typeTxt: { fontSize: 10, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  statusTxt: { fontSize: 9, fontWeight: '600' },
  mid: { flex: 1 },
  clientName: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
  date: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  right: { alignItems: 'flex-end' },
  price: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  currency: { color: COLORS.muted, fontSize: 10 },
  noPrice: { color: COLORS.muted, fontSize: 12 },
});

// ── Screen ───────────────────────────────────────────────────────────────────
export default function AdminOrdersScreen({ navigation }) {
  const { orders, ordersTotal, ordersTotalPages, isLoading, fetchOrders, fetchOrderDetail, forceCancelOrder } =
    useAdminStore();

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const load = useCallback(
    (pg = 1) => {
      const filters = { page: pg, limit: 20 };
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;
      fetchOrders(filters);
      setPage(pg);
    },
    [typeFilter, statusFilter, fetchOrders]
  );

  useEffect(() => {
    load(1);
  }, [typeFilter, statusFilter]);

  const handleOpenDetail = async (order) => {
    setLoadingDetail(true);
    try {
      const full = await fetchOrderDetail(order.id);
      setSelectedOrder(full);
    } catch (e) {
      setSelectedOrder(order);
    } finally {
      setLoadingDetail(false);
      setDetailVisible(true);
    }
  };

  const handleForceCancel = async (orderId, reason, onDone) => {
    if (!reason.trim()) {
      Alert.alert('Erreur', 'La raison est obligatoire.');
      return;
    }
    try {
      await forceCancelOrder(orderId, reason);
      Alert.alert('Fait', 'Commande annulée.');
      if (onDone) onDone();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>📋 Commandes</Text>
          <Text style={styles.headerSub}>{ordersTotal} commandes</Text>
        </View>
        {loadingDetail ? <ActivityIndicator color={COLORS.accent} style={{ marginLeft: 'auto' }} /> : null}
      </View>

      <ChipBar options={TYPE_OPTIONS} selected={typeFilter} onSelect={setTypeFilter} />
      <ChipBar options={STATUS_OPTIONS} selected={statusFilter} onSelect={setStatusFilter} />

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={({ item: order }) => (
          <OrderItem order={order} onPress={() => handleOpenDetail(order)} />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading && orders.length === 0} onRefresh={() => load(1)} tintColor={COLORS.accent} />
        }
        onEndReached={() => { if (page < ordersTotalPages && !isLoading) load(page + 1); }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>Aucune commande</Text> : null}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <OrderDetailModal
        visible={detailVisible}
        order={selectedOrder}
        onClose={() => setDetailVisible(false)}
        onCancel={handleForceCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 14,
  },
  backBtn: { padding: 4 },
  backTxt: { color: COLORS.white, fontSize: 22 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 12, marginTop: 1 },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 40, fontSize: 14 },
});
