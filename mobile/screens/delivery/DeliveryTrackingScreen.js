import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDeliveryStore from '../../store/deliveryStore';
import socketService from '../../services/socket';
import StaticMap from '../../components/StaticMap';
import ChatModal from '../../components/ChatModal';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  green: '#27AE60',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2A2A3A',
  warning: '#F39C12',
};

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'ORDER_READY', 'IN_PROGRESS', 'COMPLETED'];

const STATUS_CONFIG = {
  PENDING: {
    label: 'En attente',
    message: 'En attente de confirmation du restaurant...',
    emoji: '⏳',
    color: COLORS.warning,
  },
  ACCEPTED: {
    label: 'Acceptée',
    message: 'Le restaurant prépare votre commande 👨‍🍳',
    emoji: '🍳',
    color: COLORS.green,
  },
  ORDER_READY: {
    label: 'Prête',
    message: 'Commande prête ! Le livreur arrive... 🛵',
    emoji: '🛵',
    color: COLORS.green,
  },
  IN_PROGRESS: {
    label: 'En route',
    message: 'Votre commande est en chemin !',
    emoji: '📦',
    color: COLORS.green,
  },
  COMPLETED: {
    label: 'Livrée',
    message: 'Livré ! Bon appétit 🎉',
    emoji: '🎉',
    color: COLORS.green,
  },
  CANCELLED: {
    label: 'Annulée',
    message: 'Cette commande a été annulée.',
    emoji: '❌',
    color: '#E74C3C',
  },
};

function getActiveStep(status) {
  const events = ['ORDER_READY'];
  if (events.includes(status)) return STATUS_STEPS.indexOf('ORDER_READY');
  return STATUS_STEPS.indexOf(status);
}

export default function DeliveryTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { currentOrder, fetchOrder, confirmReceipt, cancelDelivery } = useDeliveryStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [livreurLocation, setLivreurLocation] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const liveDotAnim = useRef(new Animated.Value(1)).current;
  const pollRef = useRef(null);

  const load = async () => {
    try {
      await fetchOrder(orderId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 10000);
    return () => clearInterval(pollRef.current);
  }, [orderId]);

  // Live dot pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(liveDotAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Socket.io listeners for real-time delivery updates
  useEffect(() => {
    if (!orderId) return;
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('join:order', orderId);

    const onAccepted = (data) => {
      if (data.orderId === orderId) load();
    };
    const onPickedUp = (data) => {
      if (data.orderId === orderId) load();
    };
    const onDelivered = (data) => {
      if (data.orderId === orderId) load();
    };
    const onLocationUpdate = (data) => {
      if (data.serviceType === 'DELIVERY') {
        setLivreurLocation({ lat: data.lat, lng: data.lng });
        setLastLocationUpdate(new Date());
      }
    };

    socket.on('delivery:accepted', onAccepted);
    socket.on('delivery:picked_up', onPickedUp);
    socket.on('delivery:delivered', onDelivered);
    socket.on('location:update', onLocationUpdate);

    return () => {
      socket.off('delivery:accepted', onAccepted);
      socket.off('delivery:picked_up', onPickedUp);
      socket.off('delivery:delivered', onDelivered);
      socket.off('location:update', onLocationUpdate);
    };
  }, [orderId]);

  const order = currentOrder?.id === orderId ? currentOrder : null;
  const status = order?.status || 'PENDING';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const meta = order?.metadata || {};
  const activeStep = getActiveStep(status);

  const handleConfirmReceipt = async () => {
    setActionLoading(true);
    try {
      await confirmReceipt(orderId);
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de confirmer la réception.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Annuler la commande', 'Êtes-vous sûr de vouloir annuler ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await cancelDelivery(orderId);
          } catch (err) {
            Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'annuler.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi commande</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { borderColor: config.color }]}>
          <Text style={styles.statusEmoji}>{config.emoji}</Text>
          <Text style={[styles.statusMessage, { color: config.color }]}>{config.message}</Text>
        </View>

        {/* Progress steps */}
        {status !== 'CANCELLED' && (
          <View style={styles.progressContainer}>
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= activeStep;
              const isCurrent = index === activeStep;
              return (
                <View key={step} style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressDot,
                      isActive && styles.progressDotActive,
                      isCurrent && styles.progressDotCurrent,
                    ]}
                  />
                  <Text style={[styles.progressLabel, isActive && styles.progressLabelActive]}>
                    {STATUS_CONFIG[step]?.label || step}
                  </Text>
                  {index < STATUS_STEPS.length - 1 && (
                    <View style={[styles.progressLine, isActive && styles.progressLineActive]} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre commande</Text>
          <Text style={styles.merchantName}>{meta.merchantName}</Text>
          <Text style={styles.deliveryAddress}>📍 {meta.deliveryAddress}</Text>
          {meta.note ? <Text style={styles.note}>💬 {meta.note}</Text> : null}

          {(meta.items || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}× {item.name}
              </Text>
              <Text style={styles.itemPrice}>{item.lineTotal?.toFixed(3)} TND</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Sous-total</Text>
            <Text style={styles.itemValue}>{meta.subtotal?.toFixed(3)} TND</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Frais de livraison</Text>
            <Text style={styles.itemValue}>{meta.deliveryFee?.toFixed(3)} TND</Text>
          </View>
          <View style={[styles.itemRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{meta.total?.toFixed(3)} TND</Text>
          </View>
        </View>

        {/* Actions */}
        {status === 'IN_PROGRESS' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmReceipt} disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryBtnText}>✓ Confirmer la réception</Text>
            )}
          </TouchableOpacity>
        )}

        {status === 'COMPLETED' && (
          <View style={styles.completedBlock}>
            <Text style={styles.completedText}>Merci d'avoir utilisé EASYWAY Delivery !</Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('DeliveryHome')}>
              <Text style={styles.secondaryBtnText}>Nouvelle commande</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'PENDING' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={actionLoading}>
            <Text style={styles.cancelBtnText}>Annuler la commande</Text>
          </TouchableOpacity>
        )}

        {/* Live location map */}
        {(status === 'ACCEPTED' || status === 'IN_PROGRESS') && (
          <View style={styles.liveMapCard}>
            <View style={styles.liveRow}>
              <Animated.View style={[styles.liveDot, { opacity: liveDotAnim }]} />
              <Text style={styles.liveText}>
                {livreurLocation ? 'Suivi en direct' : 'En attente du GPS livreur…'}
              </Text>
              {lastLocationUpdate && (
                <Text style={styles.liveTime}>
                  {lastLocationUpdate.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              )}
            </View>
            <StaticMap
              lat={livreurLocation?.lat}
              lng={livreurLocation?.lng}
              height={200}
              zoom={15}
            />
          </View>
        )}

        {/* Chat button */}
        {(status === 'ACCEPTED' || status === 'IN_PROGRESS') && (
          <TouchableOpacity style={styles.chatBtn} onPress={() => setShowChatModal(true)}>
            <Text style={styles.chatBtnText}>💬 Chat avec le livreur</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Chat Modal */}
      <ChatModal
        visible={showChatModal}
        orderId={orderId}
        onClose={() => setShowChatModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backArrow: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  content: { padding: 20, paddingBottom: 40 },
  statusBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusEmoji: { fontSize: 40, marginBottom: 10 },
  statusMessage: { fontSize: 16, textAlign: 'center', fontWeight: '500' },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  progressStep: { flex: 1, alignItems: 'center', position: 'relative' },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
    marginBottom: 6,
  },
  progressDotActive: { backgroundColor: COLORS.green },
  progressDotCurrent: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FFF' },
  progressLabel: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center' },
  progressLabelActive: { color: COLORS.green },
  progressLine: {
    position: 'absolute',
    top: 7,
    left: '60%',
    right: '-60%',
    height: 2,
    backgroundColor: COLORS.border,
    zIndex: -1,
  },
  progressLineActive: { backgroundColor: COLORS.green },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.green, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10 },
  merchantName: { color: COLORS.text, fontSize: 17, fontWeight: '600', marginBottom: 4 },
  deliveryAddress: { color: COLORS.textMuted, fontSize: 13, marginBottom: 4 },
  note: { color: COLORS.textMuted, fontSize: 13, fontStyle: 'italic', marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  itemName: { color: COLORS.text, fontSize: 14 },
  itemPrice: { color: COLORS.textMuted, fontSize: 14 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  itemLabel: { color: COLORS.textMuted, fontSize: 14 },
  itemValue: { color: COLORS.textMuted, fontSize: 14 },
  totalRow: { marginTop: 6 },
  totalLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  totalValue: { color: COLORS.green, fontSize: 16, fontWeight: '700' },
  primaryBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  completedBlock: { alignItems: 'center', marginBottom: 12 },
  completedText: { color: COLORS.textMuted, fontSize: 14, marginBottom: 16, textAlign: 'center' },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  secondaryBtnText: { color: COLORS.green, fontSize: 15, fontWeight: '600' },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  cancelBtnText: { color: '#E74C3C', fontSize: 15, fontWeight: '600' },
  liveMapCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  liveText: { fontSize: 12, color: COLORS.green, fontWeight: '600', flex: 1 },
  liveTime: { fontSize: 11, color: COLORS.textMuted },
  chatBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
