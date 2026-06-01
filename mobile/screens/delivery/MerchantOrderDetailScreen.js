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
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#27AE60',
  orange: '#F5A623',
  red: '#E74C3C',
  blue: '#3498DB',
};

const STATUS_FLOW = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];

const STATUS_CONFIG = {
  PENDING:     { label: 'Nouvelle commande', color: COLORS.blue,   icon: '🔔', next: 'ACCEPTED',  nextLabel: 'Accepter' },
  ACCEPTED:    { label: 'Acceptée',           color: COLORS.accent, icon: '✅', next: 'PREPARING', nextLabel: 'Commencer préparation' },
  PREPARING:   { label: 'En préparation',     color: COLORS.orange, icon: '👨‍🍳', next: 'READY',     nextLabel: 'Marquer prête' },
  READY:       { label: 'Prête',              color: '#9B59B6',     icon: '📦', next: 'PICKED_UP', nextLabel: 'Livreur récupéré' },
  PICKED_UP:   { label: 'Récupérée',          color: COLORS.orange, icon: '🛵', next: null,        nextLabel: null },
  DELIVERED:   { label: 'Livrée',             color: COLORS.accent, icon: '🏁', next: null,        nextLabel: null },
  CANCELLED:   { label: 'Annulée',            color: COLORS.red,    icon: '❌', next: null,        nextLabel: null },
};

const MOCK_ORDER = {
  id: 'ord_mock01',
  status: 'PENDING',
  totalAmount: 23.5,
  createdAt: new Date().toISOString(),
  deliveryAddress: '12 Rue de la Liberté, Tunis',
  note: 'Sans oignons sur la pizza',
  client: { name: 'Salim Baccar', phone: '+21622334455' },
  items: [
    { name: 'Pizza Margherita', quantity: 2, price: 8.5 },
    { name: 'Coca-Cola 33cl', quantity: 2, price: 2.0 },
    { name: 'Fraise Tagine', quantity: 1, price: 4.5 },
  ],
  provider: null,
};

function StatusStepper({ currentStatus }) {
  const activeIdx = STATUS_FLOW.indexOf(currentStatus);
  return (
    <View style={styles.stepper}>
      {STATUS_FLOW.map((s, i) => {
        const cfg = STATUS_CONFIG[s] || {};
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, done && styles.stepDone, active && styles.stepActive]}>
                <Text style={styles.stepIcon}>{done ? '✓' : cfg.icon}</Text>
              </View>
              <Text style={[styles.stepLabel, active && { color: COLORS.accent }]} numberOfLines={1}>
                {cfg.label || s}
              </Text>
            </View>
            {i < STATUS_FLOW.length - 1 && (
              <View style={[styles.stepLine, done && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default function MerchantOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/merchant/orders/${orderId}`);
      setOrder(res.data?.order || res.data);
    } catch {
      setOrder(MOCK_ORDER);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const advanceStatus = async () => {
    const cfg = STATUS_CONFIG[order.status];
    if (!cfg?.next) return;
    setUpdating(true);
    try {
      await api.patch(`/api/merchant/orders/${orderId}/status`, { status: cfg.next });
      setOrder(o => ({ ...o, status: cfg.next }));
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Mise à jour échouée');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { Alert.alert('Motif requis'); return; }
    setUpdating(true);
    try {
      await api.patch(`/api/merchant/orders/${orderId}/status`, { status: 'CANCELLED', reason: cancelReason.trim() });
      setOrder(o => ({ ...o, status: 'CANCELLED' }));
      setCancelModal(false);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Annulation échouée');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );
  if (!order) return null;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const isTerminal = ['DELIVERED', 'CANCELLED', 'PICKED_UP'].includes(order.status);
  const timeStr = new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const subtotal = (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commande #{order.id?.slice(-6)}</Text>
        <View style={[styles.statusPill, { backgroundColor: cfg.color + '22', borderColor: cfg.color }]}>
          <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Stepper */}
        {order.status !== 'CANCELLED' && <StatusStepper currentStatus={order.status} />}

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.clientRow}>
            <View style={styles.clientAvatar}><Text style={styles.clientAvatarText}>👤</Text></View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{order.client?.name || '—'}</Text>
              <Text style={styles.clientPhone}>{order.client?.phone || '—'}</Text>
            </View>
            <Text style={styles.clientTime}>{timeStr}</Text>
          </View>
          {order.deliveryAddress && (
            <View style={styles.addrRow}>
              <Text style={styles.addrIcon}>📍</Text>
              <Text style={styles.addrText}>{order.deliveryAddress}</Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Articles commandés</Text>
          {(order.items || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemQtyBadge}>
                <Text style={styles.itemQty}>{item.quantity}x</Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(3)} TND</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total commande</Text>
            <Text style={styles.totalValue}>{(order.totalAmount || subtotal).toFixed(3)} TND</Text>
          </View>
          {order.note && (
            <View style={styles.noteBox}>
              <Text style={styles.noteIcon}>📝</Text>
              <Text style={styles.noteText}>{order.note}</Text>
            </View>
          )}
        </View>

        {/* Livreur */}
        {order.provider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Livreur assigné</Text>
            <View style={styles.clientRow}>
              <View style={[styles.clientAvatar, { backgroundColor: COLORS.accent + '22' }]}><Text style={styles.clientAvatarText}>🛵</Text></View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{order.provider.name}</Text>
                <Text style={styles.clientPhone}>⭐ {order.provider.rating?.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        {!isTerminal && (
          <View style={styles.actionsBox}>
            {cfg.next && (
              <TouchableOpacity
                style={[styles.advanceBtn, { backgroundColor: cfg.color }]}
                onPress={advanceStatus}
                disabled={updating}
              >
                {updating ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={styles.advanceBtnText}>{cfg.icon} {cfg.nextLabel}</Text>
                )}
              </TouchableOpacity>
            )}
            {order.status === 'PENDING' && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCancelModal(true)}
                disabled={updating}
              >
                <Text style={styles.cancelBtnText}>❌ Refuser la commande</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Cancel modal */}
      <Modal visible={cancelModal} animationType="slide" transparent onRequestClose={() => setCancelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Motif du refus</Text>
            <TextInput
              style={styles.modalInput}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Ex: rupture de stock, fermeture exceptionnelle..."
              placeholderTextColor={COLORS.muted}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setCancelModal(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCancel} disabled={updating}>
                {updating ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <Text style={styles.modalConfirmText}>Refuser</Text>
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
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: '700' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  scroll: { padding: 16 },
  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
    flexWrap: 'nowrap', overflow: 'hidden',
  },
  stepItem: { alignItems: 'center', width: 44 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  stepDone: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  stepActive: { backgroundColor: COLORS.orange + '22', borderColor: COLORS.orange },
  stepIcon: { fontSize: 11 },
  stepLabel: { color: COLORS.muted, fontSize: 7, textAlign: 'center', fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginBottom: 14 },
  stepLineDone: { backgroundColor: COLORS.accent },
  section: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  clientAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  clientAvatarText: { fontSize: 20 },
  clientInfo: { flex: 1 },
  clientName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  clientPhone: { color: COLORS.muted, fontSize: 12 },
  clientTime: { color: COLORS.muted, fontSize: 12 },
  addrRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 6, backgroundColor: COLORS.bg, borderRadius: 8, padding: 10 },
  addrIcon: { fontSize: 14 },
  addrText: { color: COLORS.text, fontSize: 13, flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemQtyBadge: { backgroundColor: COLORS.accent + '22', borderRadius: 8, width: 30, height: 24, alignItems: 'center', justifyContent: 'center' },
  itemQty: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  itemName: { flex: 1, color: COLORS.text, fontSize: 13 },
  itemPrice: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  totalLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  totalValue: { color: COLORS.orange, fontSize: 16, fontWeight: '900' },
  noteBox: { flexDirection: 'row', gap: 8, backgroundColor: COLORS.bg, borderRadius: 8, padding: 10, marginTop: 10 },
  noteIcon: { fontSize: 14 },
  noteText: { color: COLORS.muted, fontSize: 13, flex: 1, fontStyle: 'italic' },
  actionsBox: { gap: 10 },
  advanceBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  advanceBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  cancelBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.red + '18', borderWidth: 1, borderColor: COLORS.red },
  cancelBtnText: { color: COLORS.red, fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  modalInput: {
    backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, fontSize: 14, padding: 12, minHeight: 80, textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  modalCancelText: { color: COLORS.muted, fontWeight: '600' },
  modalConfirm: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.red },
  modalConfirmText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
