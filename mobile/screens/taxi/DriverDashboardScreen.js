import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';
import usePassStore from '../../store/passStore';
import useTaxiStore from '../../store/taxiStore';
import api from '../../services/api';
import socketService from '../../services/socket';
import * as Location from 'expo-location';
import PassAlertBanner from '../../components/PassAlertBanner';

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
  online: '#4CAF50',
  offline: '#8E8E9A',
};

export default function DriverDashboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const { subscription, passStatus, fetchSubscription, fetchPassStatus } = usePassStore();
  const { currentOrder, acceptOrder, completeRide } = useTaxiStore();

  const [isOnline, setIsOnline] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [earnings, setEarnings] = useState({ today: 0, rides: 0 });
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);

  useEffect(() => {
    fetchSubscription();
    fetchPassStatus();
    fetchTodayEarnings();
  }, []);

  // Listen for incoming taxi requests via Socket.io
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const onNewRequest = (data) => {
      setIncomingRequests((prev) => {
        // Avoid duplicates
        if (prev.find((r) => r.orderId === data.orderId)) return prev;
        return [data, ...prev].slice(0, 10); // keep last 10
      });
    };

    const onCancelled = (data) => {
      setIncomingRequests((prev) => prev.filter((r) => r.orderId !== data.orderId));
    };

    socket.on('taxi:new_request', onNewRequest);
    socket.on('taxi:cancelled', onCancelled);

    return () => {
      socket.off('taxi:new_request', onNewRequest);
      socket.off('taxi:cancelled', onCancelled);
    };
  }, []);

  const fetchTodayEarnings = async () => {
    // In production: fetch completed orders for today from API
    // For now using placeholder calculation
    try {
      const response = await api.get('/taxi/nearby?lat=36.8&lng=10.1&radius=5').catch(() => null);
      // Earnings summary would come from a dedicated endpoint
      setEarnings({ today: 0, rides: 0 });
    } catch {
      // non-critical
    }
  };

  const startLocationTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'La localisation est requise pour être en ligne.');
      return false;
    }

    const interval = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await api.post('/geo/update', {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          serviceType: 'TAXI',
        });
      } catch (err) {
        console.warn('[DriverDashboard] Location update failed:', err?.response?.data || err.message);
      }
    }, 10000); // every 10 seconds

    setLocationInterval(interval);
    return true;
  }, []);

  const stopLocationTracking = useCallback(() => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  }, [locationInterval]);

  const handleToggleOnline = async (value) => {
    setTogglingOnline(true);
    try {
      if (value) {
        const ok = await startLocationTracking();
        if (ok) {
          setIsOnline(true);
          // Join TAXI socket room to receive incoming requests
          const socket = socketService.getSocket();
          if (socket) socket.emit('join:service', 'TAXI');
        }
      } else {
        stopLocationTracking();
        setIsOnline(false);
        const socket = socketService.getSocket();
        if (socket) socket.emit('leave:service', 'TAXI');
        setIncomingRequests([]);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de changer le statut.');
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      await acceptOrder(request.orderId);
      setIncomingRequests((prev) => prev.filter((r) => r.orderId !== request.orderId));
    } catch (err) {
      Alert.alert('Erreur', err?.message || 'Impossible d\'accepter la course.');
    }
  };

  const handleRejectRequest = (request) => {
    setIncomingRequests((prev) => prev.filter((r) => r.orderId !== request.orderId));
  };

  const handleStartRide = async () => {
    if (!currentOrder) return;
    try {
      await api.post(`/taxi/${currentOrder.id}/start`);
    } catch (err) {
      Alert.alert('Erreur', err?.message || 'Impossible de démarrer la course.');
    }
  };

  const handleCompleteRide = async () => {
    if (!currentOrder) return;
    Alert.alert(
      'Terminer la course',
      'Confirmez-vous la fin de la course ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await completeRide(currentOrder.id);
              setEarnings((prev) => ({
                today: prev.today + (parseFloat(currentOrder.price) || 0),
                rides: prev.rides + 1,
              }));
            } catch (err) {
              Alert.alert('Erreur', err?.message || 'Impossible de terminer.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.header} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Chauffeur</Text>
        <Text style={styles.headerSubtitle}>{user?.name}</Text>
      </View>

      <PassAlertBanner
        hasActivePass={passStatus?.hasActivePass ?? true}
        daysLeft={passStatus?.daysLeft ?? 99}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Online/Offline toggle */}
        <View style={styles.onlineCard}>
          <View style={styles.onlineLeft}>
            <View style={[styles.onlineDot, { backgroundColor: isOnline ? COLORS.online : COLORS.offline }]} />
            <View>
              <Text style={styles.onlineStatus}>{isOnline ? 'En ligne' : 'Hors ligne'}</Text>
              <Text style={styles.onlineHint}>
                {isOnline ? 'Vous recevez des demandes' : 'Activez pour recevoir des courses'}
              </Text>
            </View>
          </View>
          {togglingOnline
            ? <ActivityIndicator color={COLORS.header} />
            : (
              <Switch
                value={isOnline}
                onValueChange={handleToggleOnline}
                trackColor={{ false: COLORS.border, true: COLORS.online + '88' }}
                thumbColor={isOnline ? COLORS.online : COLORS.textMuted}
              />
            )}
        </View>

        {/* Pass status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pass Abonnement</Text>
          <View style={styles.passCard}>
            {subscription ? (
              <>
                <Text style={styles.passType}>{subscription.planType}</Text>
                <View style={styles.passStats}>
                  <View style={styles.passStat}>
                    <Text style={styles.passStatValue}>{subscription.ridesRemaining}</Text>
                    <Text style={styles.passStatLabel}>Courses restantes</Text>
                  </View>
                  <View style={styles.passDivider} />
                  <View style={styles.passStat}>
                    <Text style={styles.passStatValue}>{subscription.ridesConsumed}</Text>
                    <Text style={styles.passStatLabel}>Consommées</Text>
                  </View>
                  <View style={styles.passDivider} />
                  <View style={styles.passStat}>
                    <Text style={[styles.passStatValue, { color: subscription.status === 'ACTIVE' ? COLORS.green : COLORS.red }]}>
                      {subscription.status}
                    </Text>
                    <Text style={styles.passStatLabel}>Statut</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noPass}>
                <Text style={styles.noPassText}>Aucun pass actif</Text>
                <TouchableOpacity
                  style={styles.buyPassBtn}
                  onPress={() => navigation.navigate('BuyPass')}
                >
                  <Text style={styles.buyPassBtnText}>Acheter un pass</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Active ride */}
        {currentOrder && ['ACCEPTED', 'IN_PROGRESS'].includes(currentOrder.status) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course active</Text>
            <View style={styles.activeRideCard}>
              <View style={styles.rideStatusRow}>
                <View style={[styles.rideStatusBadge, {
                  backgroundColor: currentOrder.status === 'IN_PROGRESS' ? COLORS.blue + '22' : COLORS.green + '22',
                }]}>
                  <Text style={[styles.rideStatusText, {
                    color: currentOrder.status === 'IN_PROGRESS' ? COLORS.blue : COLORS.green,
                  }]}>
                    {currentOrder.status === 'IN_PROGRESS' ? '🚕 En cours' : '✅ Acceptée'}
                  </Text>
                </View>
              </View>

              {currentOrder.price && (
                <Text style={styles.ridePrice}>{parseFloat(currentOrder.price).toFixed(3)} TND</Text>
              )}

              <View style={styles.rideActions}>
                {currentOrder.status === 'ACCEPTED' && (
                  <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
                    <Text style={styles.startButtonText}>▶ Démarrer</Text>
                  </TouchableOpacity>
                )}
                {currentOrder.status === 'IN_PROGRESS' && (
                  <TouchableOpacity style={styles.completeButton} onPress={handleCompleteRide}>
                    <Text style={styles.completeButtonText}>🏁 Terminer la course</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Incoming requests */}
        {isOnline && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Demandes entrantes {incomingRequests.length > 0 ? `(${incomingRequests.length})` : ''}
            </Text>
            {incomingRequests.length === 0 ? (
              <View style={styles.emptyRequests}>
                <Text style={styles.emptyEmoji}>⏳</Text>
                <Text style={styles.emptyText}>En attente de demandes…</Text>
              </View>
            ) : (
              incomingRequests.map((req) => (
                <View key={req.orderId} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestType}>
                      {req.taxiType === 'EASYLADY' ? '🚺' : req.taxiType === 'EASYACCESS' ? '♿' : '🚕'}{' '}
                      {req.taxiType}
                    </Text>
                    <Text style={styles.requestMode}>Mode {req.mode}</Text>
                  </View>
                  {req.originAddress && (
                    <Text style={styles.requestOrigin}>📍 {req.originAddress}</Text>
                  )}
                  {req.estimatedFare && (
                    <Text style={styles.requestFare}>≈ {parseFloat(req.estimatedFare).toFixed(3)} TND</Text>
                  )}
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAcceptRequest(req)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.acceptBtnText}>✔ Accepter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleRejectRequest(req)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.rejectBtnText}>✖ Refuser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Earnings summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gains aujourd'hui</Text>
          <View style={styles.earningsCard}>
            <View style={styles.earningsStat}>
              <Text style={styles.earningsValue}>{earnings.today.toFixed(3)} TND</Text>
              <Text style={styles.earningsLabel}>Revenus</Text>
            </View>
            <View style={styles.passDivider} />
            <View style={styles.earningsStat}>
              <Text style={styles.earningsValue}>{earnings.rides}</Text>
              <Text style={styles.earningsLabel}>Courses</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.header,
    padding: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.headerText },
  headerSubtitle: { fontSize: 13, color: COLORS.headerText + 'AA', marginTop: 2 },
  scroll: { flex: 1 },
  onlineCard: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  onlineDot: { width: 12, height: 12, borderRadius: 6 },
  onlineStatus: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  onlineHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 10 },
  passCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passType: { fontSize: 14, fontWeight: '700', color: COLORS.header, marginBottom: 12 },
  passStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  passStat: { alignItems: 'center' },
  passStatValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  passStatLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  passDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  noPass: { alignItems: 'center', gap: 12 },
  noPassText: { color: COLORS.textMuted, fontSize: 14 },
  buyPassBtn: { backgroundColor: COLORS.header, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  buyPassBtnText: { color: COLORS.headerText, fontWeight: '700' },
  activeRideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.blue + '44',
  },
  rideStatusRow: { marginBottom: 10 },
  rideStatusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  rideStatusText: { fontSize: 13, fontWeight: '600' },
  ridePrice: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  rideActions: { gap: 10 },
  startButton: { backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  startButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  completeButton: { backgroundColor: COLORS.red, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  completeButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyRequests: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.header + '44',
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  requestType: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  requestMode: { fontSize: 12, color: COLORS.textMuted },
  requestOrigin: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  requestFare: { fontSize: 16, fontWeight: '700', color: COLORS.header, marginBottom: 10 },
  requestActions: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, backgroundColor: COLORS.green, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: 'transparent', borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.red },
  rejectBtnText: { color: COLORS.red, fontWeight: '600' },
  earningsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  earningsStat: { alignItems: 'center' },
  earningsValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  earningsLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
});
