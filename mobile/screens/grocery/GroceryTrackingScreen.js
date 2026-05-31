import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { useGroceryStore } from '../../store/groceryStore';
import socketService from '../../services/socket';
import StaticMap from '../../components/StaticMap';
import ChatModal from '../../components/ChatModal';

const VIOLET = '#8E44AD';
const BG = '#0A0A0F';
const CARD_BG = '#16161E';
const TEXT = '#FFFFFF';
const SUBTEXT = '#9B9BAA';
const BORDER = '#2A2A3A';
const GREEN = '#27AE60';

const STATUS_CONFIG = {
  PENDING: { icon: '🔍', title: 'Recherche d\'un livreur...', subtitle: 'Nous cherchons un livreur disponible près de chez vous.', color: '#F5A623', step: 1 },
  ACCEPTED: { icon: '🛒', title: 'Le livreur fait vos courses', subtitle: 'Votre livreur est en train de faire vos courses.', color: VIOLET, step: 2 },
  IN_PROGRESS: { icon: '🛵', title: 'En route vers vous !', subtitle: 'Le livreur arrive avec vos courses.', color: '#3498DB', step: 3 },
  COMPLETED: { icon: '🎉', title: 'Livré !', subtitle: 'Vos courses ont été livrées. Bonne dégustation !', color: GREEN, step: 4 },
  CANCELLED: { icon: '❌', title: 'Commande annulée', subtitle: 'Votre commande a été annulée.', color: '#E74C3C', step: 0 },
};

const STEPS = ['Commande', 'Livreur trouvé', 'Courses faites', 'Livré'];

export default function GroceryTrackingScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  const { currentOrder, cancelGrocery, confirmReceipt } = useGroceryStore();
  const [livreurLocation, setLivreurLocation] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const liveDotAnim = useRef(new Animated.Value(1)).current;

  const order = currentOrder?.id === orderId ? currentOrder : null;
  const status = order?.status || 'PENDING';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  // Live dot pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(liveDotAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Socket.io real-time listeners
  useEffect(() => {
    if (!orderId) return;
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('join:order', orderId);

    const onLocationUpdate = (data) => {
      if (data.serviceType === 'GROCERY' || data.orderId === orderId) {
        setLivreurLocation({ lat: data.lat, lng: data.lng });
        setLastLocationUpdate(new Date());
      }
    };

    socket.on('location:update', onLocationUpdate);
    socket.on('grocery:accepted', () => {});
    socket.on('grocery:in_progress', () => {});
    socket.on('grocery:delivered', () => {});

    return () => {
      socket.off('location:update', onLocationUpdate);
      socket.off('grocery:accepted');
      socket.off('grocery:in_progress');
      socket.off('grocery:delivered');
    };
  }, [orderId]);

  const handleCancel = async () => {
    try { await cancelGrocery(orderId); } catch (err) { console.warn('Cancel failed', err); }
  };

  const handleConfirm = async () => {
    try { await confirmReceipt(orderId); } catch (err) { console.warn('Confirm failed', err); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de commande</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Status card */}
        <View style={[styles.statusCard, { borderColor: config.color }]}>
          <Text style={styles.statusIcon}>{config.icon}</Text>
          <Text style={[styles.statusTitle, { color: config.color }]}>{config.title}</Text>
          <Text style={styles.statusSubtitle}>{config.subtitle}</Text>
          {status === 'PENDING' && <ActivityIndicator color={config.color} style={{ marginTop: 12 }} />}
        </View>

        {/* Progress steps */}
        {status !== 'CANCELLED' && (
          <View style={styles.stepsContainer}>
            {STEPS.map((step, idx) => {
              const stepNum = idx + 1;
              const isActive = config.step >= stepNum;
              const isCurrent = config.step === stepNum;
              return (
                <View key={step} style={styles.stepRow}>
                  <View style={[styles.stepDot, isActive && styles.stepDotActive, isCurrent && { backgroundColor: config.color, borderColor: config.color }]}>
                    <Text style={styles.stepDotText}>{isActive ? '✓' : stepNum}</Text>
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View style={[styles.stepLine, isActive && styles.stepLineActive]} />
                  )}
                  <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Order info */}
        {order && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoTitle}>Détails commande</Text>
            <Text style={styles.orderInfoText}>
              {order.metadata?.items?.length || 0} article(s) — {parseFloat(order.price || 0).toFixed(3)} TND
            </Text>
            {order.metadata?.deliveryAddress && (
              <Text style={styles.orderInfoText}>📍 {order.metadata.deliveryAddress}</Text>
            )}
          </View>
        )}

        {/* Live map — livreur en route */}
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
            <StaticMap lat={livreurLocation?.lat} lng={livreurLocation?.lng} height={200} zoom={15} />
          </View>
        )}

        {/* Chat button */}
        {(status === 'ACCEPTED' || status === 'IN_PROGRESS') && (
          <TouchableOpacity style={styles.chatBtn} onPress={() => setShowChat(true)} activeOpacity={0.85}>
            <Text style={styles.chatBtnText}>💬 Chat avec le livreur</Text>
          </TouchableOpacity>
        )}

        {/* Actions */}
        {status === 'IN_PROGRESS' && (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>✓ Confirmer la réception</Text>
          </TouchableOpacity>
        )}
        {status === 'PENDING' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Annuler la commande</Text>
          </TouchableOpacity>
        )}
        {status === 'COMPLETED' && (
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('GroceryHome')}>
            <Text style={styles.homeBtnText}>Nouvelle commande</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ChatModal visible={showChat} orderId={orderId} onClose={() => setShowChat(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: VIOLET, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { marginRight: 12 },
  backText: { color: TEXT, fontSize: 22 },
  headerTitle: { color: TEXT, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  container: { padding: 16, paddingBottom: 32 },
  statusCard: { backgroundColor: CARD_BG, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, marginBottom: 16 },
  statusIcon: { fontSize: 48, marginBottom: 12 },
  statusTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  statusSubtitle: { color: SUBTEXT, fontSize: 13, textAlign: 'center' },
  stepsContainer: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: BORDER, borderWidth: 2, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  stepDotActive: { backgroundColor: GREEN, borderColor: GREEN },
  stepDotText: { color: TEXT, fontSize: 11, fontWeight: '700' },
  stepLine: { position: 'absolute', left: 13, top: 28, width: 2, height: 16, backgroundColor: BORDER },
  stepLineActive: { backgroundColor: GREEN },
  stepLabel: { color: SUBTEXT, fontSize: 13 },
  stepLabelActive: { color: TEXT, fontWeight: '600' },
  orderInfo: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  orderInfoTitle: { color: SUBTEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  orderInfoText: { color: TEXT, fontSize: 13, marginBottom: 4 },
  liveMapCard: { backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  liveText: { fontSize: 12, color: GREEN, fontWeight: '600', flex: 1 },
  liveTime: { fontSize: 11, color: SUBTEXT },
  chatBtn: { backgroundColor: '#1C1C28', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: VIOLET },
  chatBtnText: { color: VIOLET, fontSize: 15, fontWeight: '700' },
  confirmBtn: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: TEXT, fontSize: 15, fontWeight: '700' },
  cancelBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#E74C3C' },
  cancelBtnText: { color: '#E74C3C', fontSize: 14, fontWeight: '600' },
  homeBtn: { backgroundColor: VIOLET, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  homeBtnText: { color: TEXT, fontSize: 15, fontWeight: '700' },
});
