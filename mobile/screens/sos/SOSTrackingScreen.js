import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSosStore from '../../store/sosStore';
import useAuthStore from '../../store/authStore';
import socketService from '../../services/socket';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  sos: '#E74C3C',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
  green: '#27AE60',
  blue: '#2980B9',
  orange: '#F39C12',
};

// Derived status based on order state + quotes presence
function derivePhase(order, quotes) {
  if (!order) return 'PENDING';
  if (order.status === 'COMPLETED') return 'COMPLETED';
  if (order.status === 'CANCELLED') return 'CANCELLED';
  if (order.status === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (order.status === 'ACCEPTED') return 'ACCEPTED';
  if (order.status === 'PENDING' && quotes.length > 0) return 'QUOTE_RECEIVED';
  return 'PENDING';
}

const PHASE_CONFIG = {
  PENDING: { label: 'Recherche en cours…', color: COLORS.orange, description: 'Nous cherchons un dépanneur disponible près de vous.' },
  QUOTE_RECEIVED: { label: 'Devis reçu !', color: COLORS.blue, description: 'Choisissez le dépanneur qui vous convient.' },
  ACCEPTED: { label: 'Dépanneur en route', color: COLORS.green, description: 'Votre dépanneur est en route.' },
  IN_PROGRESS: { label: 'Intervention en cours', color: COLORS.sos, description: 'Le dépanneur est sur place.' },
  COMPLETED: { label: 'Terminé', color: COLORS.green, description: 'Intervention terminée. Merci d\'avoir utilisé EASYWAY SOS !' },
  CANCELLED: { label: 'Annulé', color: COLORS.sos, description: 'Cette demande SOS a été annulée.' },
};

export default function SOSTrackingScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const { user } = useAuthStore();
  const { currentSOSOrder, quotes, fetchOrder, acceptQuote, completeRide, cancelSOS, addQuote, updateOrderStatus } = useSosStore();

  const [localOrder, setLocalOrder] = useState(currentSOSOrder);
  const [localQuotes, setLocalQuotes] = useState(quotes || []);
  const [depanneurLocation, setDepanneurLocation] = useState(null);
  const radarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (orderId) fetchOrder(orderId);
  }, [orderId]);

  useEffect(() => {
    if (currentSOSOrder) {
      setLocalOrder(currentSOSOrder);
      setLocalQuotes(currentSOSOrder.metadata?.quotes || []);
    }
  }, [currentSOSOrder]);

  // Radar pulse
  useEffect(() => {
    const phase = derivePhase(localOrder, localQuotes);
    if (phase === 'PENDING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(radarAnim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
          Animated.timing(radarAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      radarAnim.setValue(1);
    }
  }, [localOrder?.status, localQuotes.length]);

  // Socket.io listeners
  useEffect(() => {
    if (!orderId) return;
    const socket = socketService.getSocket();
    if (!socket) return;

    const onQuoteReceived = (data) => {
      if (data.orderId === orderId && data.quote) {
        setLocalQuotes((prev) => {
          if (prev.find((q) => q.depanneurId === data.quote.depanneurId)) return prev;
          return [...prev, data.quote];
        });
        addQuote(data.quote);
      }
    };

    const onAccepted = (data) => {
      if (data.orderId === orderId) {
        setLocalOrder((prev) => prev ? { ...prev, status: 'ACCEPTED' } : prev);
        updateOrderStatus(orderId, { status: 'ACCEPTED' });
      }
    };

    const onArrived = (data) => {
      if (data.orderId === orderId) {
        setLocalOrder((prev) => prev ? { ...prev, status: 'IN_PROGRESS' } : prev);
        updateOrderStatus(orderId, { status: 'IN_PROGRESS' });
      }
    };

    const onCompleted = (data) => {
      if (data.orderId === orderId) {
        setLocalOrder((prev) => prev ? { ...prev, status: 'COMPLETED' } : prev);
        updateOrderStatus(orderId, { status: 'COMPLETED' });
        setTimeout(() => navigation.navigate('Home'), 3000);
      }
    };

    const onCancelled = (data) => {
      if (data.orderId === orderId) {
        setLocalOrder((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
        updateOrderStatus(orderId, { status: 'CANCELLED' });
      }
    };

    const onLocationUpdate = (data) => {
      if (data.userId === localOrder?.provider?.id) {
        setDepanneurLocation({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on('sos:quote_received', onQuoteReceived);
    socket.on('sos:quote_accepted', onAccepted);
    socket.on('sos:depanneur_arrived', onArrived);
    socket.on('sos:completed', onCompleted);
    socket.on('sos:cancelled', onCancelled);
    socket.on('location:update', onLocationUpdate);

    return () => {
      socket.off('sos:quote_received', onQuoteReceived);
      socket.off('sos:quote_accepted', onAccepted);
      socket.off('sos:depanneur_arrived', onArrived);
      socket.off('sos:completed', onCompleted);
      socket.off('sos:cancelled', onCancelled);
      socket.off('location:update', onLocationUpdate);
    };
  }, [orderId, localOrder?.provider?.id]);

  const phase = derivePhase(localOrder, localQuotes);
  const phaseConfig = PHASE_CONFIG[phase] || PHASE_CONFIG.PENDING;

  const handleAcceptQuote = async (quote) => {
    try {
      await acceptQuote(orderId, quote.depanneurId);
      setLocalOrder((prev) => prev ? { ...prev, status: 'ACCEPTED', providerId: quote.depanneurId } : prev);
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'accepter le devis.');
    }
  };

  const handleConfirmComplete = async () => {
    Alert.alert(
      'Confirmer la fin',
      'Confirmez-vous la fin de l\'intervention ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const { bothConfirmed } = await completeRide(orderId);
              if (!bothConfirmed) {
                Alert.alert('Confirmation envoyée', 'En attente de la confirmation du dépanneur.');
              }
            } catch (err) {
              Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de confirmer.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler la demande SOS',
      'Êtes-vous sûr de vouloir annuler ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSOS(orderId, 'Annulé par le client');
            } catch (err) {
              Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'annuler.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOS Remorquage</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status badge */}
        <View style={[styles.statusBadge, { borderColor: phaseConfig.color }]}>
          <View style={[styles.statusDot, { backgroundColor: phaseConfig.color }]} />
          <Text style={[styles.statusLabel, { color: phaseConfig.color }]}>{phaseConfig.label}</Text>
        </View>

        <Text style={styles.statusDescription}>{phaseConfig.description}</Text>

        {/* PENDING radar animation */}
        {phase === 'PENDING' && (
          <View style={styles.radarContainer}>
            <Animated.View style={[styles.radarRing, { transform: [{ scale: radarAnim }], opacity: radarAnim.interpolate({ inputRange: [1, 1.4], outputRange: [0.4, 0] }) }]} />
            <View style={styles.radarCenter}>
              <Text style={styles.radarEmoji}>🔧</Text>
            </View>
            <ActivityIndicator color={COLORS.sos} style={{ marginTop: 16 }} />
          </View>
        )}

        {/* QUOTE_RECEIVED: list of quotes */}
        {phase === 'QUOTE_RECEIVED' && localQuotes.length > 0 && (
          <View style={styles.quotesSection}>
            <Text style={styles.sectionTitle}>Devis reçus ({localQuotes.length})</Text>
            {localQuotes.map((quote) => (
              <View key={quote.depanneurId} style={styles.quoteCard}>
                <View style={styles.quoteHeader}>
                  <Text style={styles.quoteDepanneur}>🔧 Dépanneur</Text>
                  <Text style={styles.quoteTime}>⏱ {quote.estimatedArrivalMin} min</Text>
                </View>
                <Text style={styles.quotePrice}>{parseFloat(quote.price).toFixed(3)} TND</Text>
                {user?.role === 'CLIENT' && (
                  <TouchableOpacity
                    style={styles.acceptQuoteBtn}
                    onPress={() => handleAcceptQuote(quote)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.acceptQuoteBtnText}>✔ Accepter ce devis</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ACCEPTED / IN_PROGRESS: depanneur info */}
        {(phase === 'ACCEPTED' || phase === 'IN_PROGRESS') && (
          <View style={styles.depanneurCard}>
            <Text style={styles.sectionTitle}>Votre dépanneur</Text>
            <View style={styles.depanneurRow}>
              <Text style={styles.depanneurAvatar}>🔧</Text>
              <View style={styles.depanneurInfo}>
                <Text style={styles.depanneurName}>{localOrder?.provider?.name || 'Dépanneur'}</Text>
                {localOrder?.provider?.phone && (
                  <Text style={styles.depanneurPhone}>{localOrder.provider.phone}</Text>
                )}
              </View>
              {localOrder?.price && (
                <Text style={styles.depanneurPrice}>{parseFloat(localOrder.price).toFixed(3)} TND</Text>
              )}
            </View>

            {/* Live location placeholder */}
            <View style={styles.mapPlaceholder}>
              {depanneurLocation ? (
                <>
                  <Text style={styles.mapText}>📍 Position en direct</Text>
                  <Text style={styles.mapCoords}>{depanneurLocation.lat.toFixed(5)}, {depanneurLocation.lng.toFixed(5)}</Text>
                </>
              ) : (
                <Text style={styles.mapText}>📍 Localisation du dépanneur en temps réel</Text>
              )}
              <Text style={styles.mapHint}>Intégration Mapbox disponible</Text>
            </View>
          </View>
        )}

        {/* COMPLETED */}
        {phase === 'COMPLETED' && (
          <View style={[styles.depanneurCard, { borderColor: COLORS.green }]}>
            <Text style={[styles.sectionTitle, { color: COLORS.green }]}>✅ Intervention terminée</Text>
            {localOrder?.price && (
              <Text style={styles.finalPrice}>Prix final : {parseFloat(localOrder.price).toFixed(3)} TND</Text>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.green }]}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>🏠 Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CLIENT confirm completion */}
        {phase === 'IN_PROGRESS' && user?.role === 'CLIENT' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.green }]}
            onPress={handleConfirmComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>✅ Confirmer la fin d'intervention</Text>
          </TouchableOpacity>
        )}

        {/* Cancel button */}
        {['PENDING', 'QUOTE_RECEIVED', 'ACCEPTED'].includes(phase) && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.85}>
            <Text style={styles.cancelButtonText}>✖ Annuler la demande</Text>
          </TouchableOpacity>
        )}

        {phase === 'CANCELLED' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }]}
            onPress={() => navigation.navigate('SOSHome')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>🔄 Nouvelle demande SOS</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.sos },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginTop: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  statusDescription: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 20, maxWidth: 300 },
  radarContainer: { marginTop: 32, alignItems: 'center', justifyContent: 'center', width: 140, height: 140 },
  radarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: COLORS.sos,
  },
  radarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.sos,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarEmoji: { fontSize: 36 },
  quotesSection: { width: '100%', marginTop: 24 },
  sectionTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 12,
  },
  quoteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  quoteDepanneur: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  quoteTime: { fontSize: 13, color: COLORS.orange, fontWeight: '600' },
  quotePrice: { fontSize: 24, fontWeight: '900', color: COLORS.sos, marginBottom: 12 },
  acceptQuoteBtn: {
    backgroundColor: COLORS.sos,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptQuoteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  depanneurCard: {
    marginTop: 24,
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  depanneurRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  depanneurAvatar: { fontSize: 40 },
  depanneurInfo: { flex: 1 },
  depanneurName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  depanneurPhone: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  depanneurPrice: { fontSize: 18, fontWeight: '800', color: COLORS.sos },
  mapPlaceholder: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  mapText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  mapCoords: { fontSize: 11, color: COLORS.text, marginTop: 4 },
  mapHint: { fontSize: 10, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  finalPrice: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginBottom: 16, textAlign: 'center' },
  actionButton: {
    marginTop: 16,
    width: '100%',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: {
    marginTop: 12,
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.sos,
  },
  cancelButtonText: { color: COLORS.sos, fontSize: 14, fontWeight: '600' },
});
