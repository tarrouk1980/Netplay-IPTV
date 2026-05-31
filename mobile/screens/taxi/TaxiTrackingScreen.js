import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTaxiStore from '../../store/taxiStore';
import useAuthStore from '../../store/authStore';
import socketService from '../../services/socket';
import * as Location from 'expo-location';
import MapView from '../../components/MapView';
import RatingModal from '../../components/RatingModal';
import ChatModal from '../../components/ChatModal';

// TODO: Replace with Mapbox SDK — mapbox.com/pricing — free tier: 25,000 loads/month
// TODO: Heatmap layer — uses aggregated Redis demand data — no extra cost with Redis

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  header: '#F5A623',
  headerText: '#0A0A0F',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  red: '#D32F2F',
  green: '#4CAF50',
  blue: '#2196F3',
  border: '#2C2C3E',
};

const STATUS_CONFIG = {
  PENDING: {
    label: 'Recherche en cours…',
    color: COLORS.header,
    description: 'Nous recherchons un chauffeur disponible près de vous.',
  },
  ACCEPTED: {
    label: 'Chauffeur trouvé !',
    color: COLORS.green,
    description: 'Votre chauffeur est en route.',
  },
  IN_PROGRESS: {
    label: 'Course en cours',
    color: COLORS.blue,
    description: 'Vous êtes en route vers votre destination.',
  },
  COMPLETED: {
    label: 'Course terminée',
    color: COLORS.green,
    description: 'Merci d\'avoir utilisé EASYWAY Taxi !',
  },
  CANCELLED: {
    label: 'Course annulée',
    color: COLORS.red,
    description: 'Cette course a été annulée.',
  },
};

export default function TaxiTrackingScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const { user } = useAuthStore();
  const { currentOrder, cancelOrder, confirmArrival } = useTaxiStore();

  const [driverLocation, setDriverLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [localOrder, setLocalOrder] = useState(currentOrder);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const liveDotAnim = useRef(new Animated.Value(1)).current;

  // Récupérer la position utilisateur au montage
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch {
        // non-critique
      }
    })();
  }, []);

  // Pulse animation for PENDING state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Live dot pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(liveDotAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (localOrder?.status === 'PENDING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [localOrder?.status]);

  // Update local order from store changes
  useEffect(() => {
    if (currentOrder && currentOrder.id === orderId) {
      setLocalOrder(currentOrder);
    }
  }, [currentOrder]);

  // Listen to Socket.io events for real-time updates
  useEffect(() => {
    if (!orderId) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    const onAccepted = (data) => {
      if (data.orderId === orderId) {
        setLocalOrder((prev) => ({
          ...prev,
          status: 'ACCEPTED',
          driver: data.driver,
        }));
      }
    };

    const onStarted = (data) => {
      if (data.orderId === orderId) {
        setLocalOrder((prev) => ({ ...prev, status: 'IN_PROGRESS' }));
      }
    };

    const onCompleted = (data) => {
      if (data.orderId === orderId) {
        setLocalOrder((prev) => ({ ...prev, status: 'COMPLETED' }));
        setShowRatingModal(true);
      }
    };

    const onCancelled = (data) => {
      if (data.orderId === orderId) {
        setLocalOrder((prev) => ({ ...prev, status: 'CANCELLED' }));
      }
    };

    const onLocationUpdate = (data) => {
      if (data.userId === localOrder?.driver?.id) {
        setDriverLocation({ lat: data.lat, lng: data.lng });
        setLastLocationUpdate(new Date());
      }
    };

    socket.on('taxi:accepted', onAccepted);
    socket.on('taxi:started', onStarted);
    socket.on('taxi:completed', onCompleted);
    socket.on('taxi:cancelled', onCancelled);
    socket.on('location:update', onLocationUpdate);

    return () => {
      socket.off('taxi:accepted', onAccepted);
      socket.off('taxi:started', onStarted);
      socket.off('taxi:completed', onCompleted);
      socket.off('taxi:cancelled', onCancelled);
      socket.off('location:update', onLocationUpdate);
    };
  }, [orderId, localOrder?.driver?.id]);

  const status = localOrder?.status || 'PENDING';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const handleCancel = () => {
    Alert.alert(
      'Annuler la course',
      'Êtes-vous sûr de vouloir annuler ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId);
            } catch (err) {
              Alert.alert('Erreur', err?.message || 'Impossible d\'annuler.');
            }
          },
        },
      ]
    );
  };

  const handleConfirmArrival = async () => {
    try {
      await confirmArrival(orderId);
      Alert.alert('Confirmation envoyée', 'En attente de la confirmation du chauffeur.');
    } catch (err) {
      Alert.alert('Erreur', err?.message || 'Impossible de confirmer.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.header} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suivi de course</Text>
      </View>

      <View style={styles.content}>
        {/* Status badge */}
        <View style={[styles.statusBadge, { borderColor: statusConfig.color }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Pulse animation while searching */}
        {status === 'PENDING' && (
          <View style={styles.pulseContainer}>
            <Animated.View
              style={[
                styles.pulseOuter,
                { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.18], outputRange: [0.3, 0] }) },
              ]}
            />
            <View style={styles.pulseInner}>
              <Text style={styles.pulseEmoji}>🚕</Text>
            </View>
            <ActivityIndicator style={styles.searchSpinner} color={COLORS.header} />
          </View>
        )}

        {/* Description */}
        <Text style={styles.statusDescription}>{statusConfig.description}</Text>

        {/* Driver info (when ACCEPTED or IN_PROGRESS) */}
        {(status === 'ACCEPTED' || status === 'IN_PROGRESS') && localOrder?.driver && (
          <View style={styles.driverCard}>
            <Text style={styles.driverCardTitle}>Votre chauffeur</Text>
            <View style={styles.driverRow}>
              <Text style={styles.driverAvatar}>🧑‍✈️</Text>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{localOrder.driver.name || 'Chauffeur'}</Text>
                {localOrder.driver.phone && (
                  <Text style={styles.driverPhone}>{localOrder.driver.phone}</Text>
                )}
              </View>
              {localOrder.driver.phone && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${localOrder.driver.phone}`)}
                >
                  <Text style={styles.callBtnText}>📞 Appeler</Text>
                </TouchableOpacity>
              )}
            </View>
            {localOrder.driver.plate && (
              <View style={styles.plateRow}>
                <Text style={styles.plateLabel}>Plaque : </Text>
                <Text style={styles.plateValue}>{localOrder.driver.plate}</Text>
              </View>
            )}

            {/* Driver live location map */}
            <View style={{ marginTop: 12 }}>
              <View style={styles.liveRow}>
                <Animated.View style={[styles.liveDot, { opacity: liveDotAnim }]} />
                <Text style={styles.liveText}>
                  {driverLocation ? 'Suivi en direct' : 'En attente du GPS chauffeur…'}
                </Text>
                {lastLocationUpdate && (
                  <Text style={styles.liveTime}>
                    {lastLocationUpdate.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </Text>
                )}
              </View>
              <MapView
                driverLocation={driverLocation}
                userLocation={userLocation}
                height={220}
              />
            </View>
          </View>
        )}

        {/* Client confirmation button — IN_PROGRESS */}
        {status === 'IN_PROGRESS' && user?.role === 'CLIENT' && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmArrival}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>✅ Confirmer l'arrivée</Text>
          </TouchableOpacity>
        )}

        {/* Cancel button — only if PENDING or ACCEPTED */}
        {['PENDING', 'ACCEPTED'].includes(status) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelButtonText}>✖ Annuler la course</Text>
          </TouchableOpacity>
        )}

        {/* Completed state */}
        {status === 'COMPLETED' && (
          <View style={{ width: '100%', gap: 10 }}>
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => setShowRatingModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.rateButtonText}>⭐ Noter la course</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rateButton, { borderColor: COLORS.blue }]}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.85}
            >
              <Text style={styles.rateButtonText}>🏠 Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancelled state */}
        {status === 'CANCELLED' && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => navigation.navigate('TaxiHome')}
            activeOpacity={0.85}
          >
            <Text style={styles.rateButtonText}>🔄 Nouvelle demande</Text>
          </TouchableOpacity>
        )}
        {/* Chat button — only when driver is assigned */}
        {(status === 'ACCEPTED' || status === 'IN_PROGRESS') && localOrder?.driver && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => setShowChatModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.chatButtonText}>💬 Chat avec le chauffeur</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        orderId={orderId}
        onClose={() => setShowRatingModal(false)}
        onSubmitted={() => setTimeout(() => navigation.navigate('Home'), 1000)}
      />

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
  header: {
    backgroundColor: COLORS.header,
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.headerText },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginTop: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  pulseContainer: { marginTop: 32, alignItems: 'center', justifyContent: 'center', width: 120, height: 120 },
  pulseOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.header,
  },
  pulseInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.header,
  },
  pulseEmoji: { fontSize: 36 },
  searchSpinner: { marginTop: 12 },
  statusDescription: {
    marginTop: 20,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  driverCard: {
    marginTop: 24,
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  driverCardTitle: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: { fontSize: 40 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  driverPhone: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  callBtn: { backgroundColor: '#27AE60', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginLeft: 8 },
  callBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  plateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  plateLabel: { fontSize: 13, color: COLORS.textMuted },
  plateValue: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  mapPlaceholder: {
    marginTop: 14,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  mapPlaceholderText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  mapCoords: { fontSize: 12, color: COLORS.text, marginTop: 4 },
  mapHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  confirmButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: {
    marginTop: 12,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.red,
  },
  cancelButtonText: { color: COLORS.red, fontSize: 14, fontWeight: '600' },
  rateButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rateButtonText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  liveText: { fontSize: 12, color: COLORS.green, fontWeight: '600', flex: 1 },
  liveTime: { fontSize: 11, color: COLORS.textMuted },
  chatButton: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#1565C0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  chatButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
