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
  TextInput,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';
import useSosStore from '../../store/sosStore';
import usePassStore from '../../store/passStore';
import api from '../../services/api';
import socketService from '../../services/socket';
import * as Location from 'expo-location';
import PassAlertBanner from '../../components/PassAlertBanner';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  sos: '#E74C3C',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
  green: '#27AE60',
  blue: '#2980B9',
  online: '#27AE60',
  offline: '#8E8E9A',
};

export default function DepanneurDashboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const { nearbyRequests, currentSOSOrder, fetchNearbyRequests, submitQuote, confirmArrival, completeRide, updateOrderStatus } = useSosStore();
  const { passStatus, fetchPassStatus } = usePassStore();

  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [quoteModal, setQuoteModal] = useState(null); // { orderId, request }
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteEta, setQuoteEta] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => {
    fetchPassStatus();
    if (isOnline) fetchNearbyRequests();
  }, [isOnline]);

  // Socket.io listeners
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const onNewRequest = (data) => {
      setIncomingRequests((prev) => {
        if (prev.find((r) => r.orderId === data.orderId)) return prev;
        return [data, ...prev].slice(0, 15);
      });
    };

    const onCancelled = (data) => {
      setIncomingRequests((prev) => prev.filter((r) => r.orderId !== data.orderId));
    };

    const onQuoteAccepted = (data) => {
      setIncomingRequests((prev) => prev.filter((r) => r.orderId !== data.orderId));
    };

    const onQuoteRejected = (data) => {
      setIncomingRequests((prev) => prev.filter((r) => r.orderId !== data.orderId));
    };

    socket.on('sos:new_request', onNewRequest);
    socket.on('sos:cancelled', onCancelled);
    socket.on('sos:quote_accepted', onQuoteAccepted);
    socket.on('sos:quote_rejected', onQuoteRejected);

    return () => {
      socket.off('sos:new_request', onNewRequest);
      socket.off('sos:cancelled', onCancelled);
      socket.off('sos:quote_accepted', onQuoteAccepted);
      socket.off('sos:quote_rejected', onQuoteRejected);
    };
  }, []);

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
          serviceType: 'SOS',
        });
      } catch (err) {
        console.warn('[DepanneurDashboard] Location update failed:', err?.message);
      }
    }, 10000);

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
          const socket = socketService.getSocket();
          if (socket) socket.emit('join:service', 'SOS');
        }
      } else {
        stopLocationTracking();
        setIsOnline(false);
        const socket = socketService.getSocket();
        if (socket) socket.emit('leave:service', 'SOS');
        setIncomingRequests([]);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de changer le statut.');
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleOpenQuoteModal = (request) => {
    setQuoteModal(request);
    setQuotePrice('');
    setQuoteEta('');
  };

  const handleSubmitQuote = async () => {
    const price = parseFloat(quotePrice);
    const eta = parseInt(quoteEta);
    if (isNaN(price) || price <= 0) { Alert.alert('Erreur', 'Prix invalide.'); return; }
    if (isNaN(eta) || eta <= 0) { Alert.alert('Erreur', 'Délai d\'arrivée invalide.'); return; }

    setSubmittingQuote(true);
    try {
      await submitQuote(quoteModal.orderId, price, eta);
      setQuoteModal(null);
      setIncomingRequests((prev) => prev.filter((r) => r.orderId !== quoteModal.orderId));
      Alert.alert('Devis envoyé', 'Le client va recevoir votre devis.');
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'envoyer le devis.');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleConfirmArrival = async () => {
    if (!currentSOSOrder) return;
    try {
      await confirmArrival(currentSOSOrder.id);
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de marquer l\'arrivée.');
    }
  };

  const handleCompleteIntervention = async () => {
    if (!currentSOSOrder) return;
    Alert.alert(
      'Terminer l\'intervention',
      'Confirmez-vous la fin de l\'intervention ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const { bothConfirmed } = await completeRide(currentSOSOrder.id);
              if (!bothConfirmed) Alert.alert('Confirmation envoyée', 'En attente de la confirmation du client.');
            } catch (err) {
              Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de terminer.');
            }
          },
        },
      ]
    );
  };

  const sosTypeLabel = (type) => {
    const map = { REMORQUAGE: '🚗 Remorquage', PANNE: '🔋 Panne', ACCIDENT: '💥 Accident' };
    return map[type] || type;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Dépanneur</Text>
        <Text style={styles.headerSubtitle}>{user?.name}</Text>
      </View>

      <PassAlertBanner
        hasActivePass={passStatus?.hasActivePass ?? true}
        daysLeft={passStatus?.daysLeft ?? 99}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Online toggle */}
        <View style={styles.onlineCard}>
          <View style={styles.onlineLeft}>
            <View style={[styles.onlineDot, { backgroundColor: isOnline ? COLORS.online : COLORS.offline }]} />
            <View>
              <Text style={styles.onlineStatus}>{isOnline ? 'En ligne' : 'Hors ligne'}</Text>
              <Text style={styles.onlineHint}>
                {isOnline ? 'Vous recevez des demandes SOS' : 'Activez pour recevoir des interventions'}
              </Text>
            </View>
          </View>
          {togglingOnline
            ? <ActivityIndicator color={COLORS.sos} />
            : (
              <Switch
                value={isOnline}
                onValueChange={handleToggleOnline}
                trackColor={{ false: COLORS.border, true: COLORS.sos + '88' }}
                thumbColor={isOnline ? COLORS.sos : COLORS.textMuted}
              />
            )}
        </View>

        {/* Active intervention */}
        {currentSOSOrder && ['ACCEPTED', 'IN_PROGRESS'].includes(currentSOSOrder.status) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intervention active</Text>
            <View style={[styles.activeCard, { borderColor: COLORS.sos + '44' }]}>
              <View style={[styles.statusBadge, {
                backgroundColor: currentSOSOrder.status === 'IN_PROGRESS' ? COLORS.sos + '22' : COLORS.green + '22',
              }]}>
                <Text style={[styles.statusBadgeText, {
                  color: currentSOSOrder.status === 'IN_PROGRESS' ? COLORS.sos : COLORS.green,
                }]}>
                  {currentSOSOrder.status === 'IN_PROGRESS' ? '🚛 En cours' : '✅ Acceptée'}
                </Text>
              </View>

              {currentSOSOrder.price && (
                <Text style={styles.activePrice}>{parseFloat(currentSOSOrder.price).toFixed(3)} TND</Text>
              )}

              {currentSOSOrder.metadata?.vehicleInfo && (
                <Text style={styles.vehicleSummary}>
                  {currentSOSOrder.metadata.vehicleInfo.brand} {currentSOSOrder.metadata.vehicleInfo.model} — {currentSOSOrder.metadata.vehicleInfo.licensePlate}
                </Text>
              )}

              <View style={styles.activeActions}>
                {currentSOSOrder.status === 'ACCEPTED' && (
                  <TouchableOpacity style={styles.arrivalButton} onPress={handleConfirmArrival}>
                    <Text style={styles.arrivalButtonText}>📍 Je suis sur place</Text>
                  </TouchableOpacity>
                )}
                {currentSOSOrder.status === 'IN_PROGRESS' && (
                  <TouchableOpacity style={styles.completeButton} onPress={handleCompleteIntervention}>
                    <Text style={styles.completeButtonText}>🏁 Terminer l'intervention</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Incoming SOS requests */}
        {isOnline && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Demandes SOS proches {incomingRequests.length > 0 ? `(${incomingRequests.length})` : ''}
            </Text>
            {incomingRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📡</Text>
                <Text style={styles.emptyText}>En attente de demandes SOS…</Text>
              </View>
            ) : (
              incomingRequests.map((req) => (
                <View key={req.orderId} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestType}>{sosTypeLabel(req.sosType)}</Text>
                    <Text style={styles.requestMode}>{req.mode === 'INSURANCE' ? '🔒 Assurance' : '🚛 Indépendant'}</Text>
                  </View>

                  {req.vehicleInfo && (
                    <Text style={styles.requestVehicle}>
                      🚗 {req.vehicleInfo.brand} {req.vehicleInfo.model} — {req.vehicleInfo.licensePlate}
                    </Text>
                  )}

                  {req.vehicleState && (
                    <View style={styles.stateFlags}>
                      {req.vehicleState.accident && <View style={styles.flag}><Text style={styles.flagText}>💥 Accident</Text></View>}
                      {req.vehicleState.battery && <View style={styles.flag}><Text style={styles.flagText}>🔋 Batterie</Text></View>}
                      {req.vehicleState.fuel && <View style={styles.flag}><Text style={styles.flagText}>⛽ Carburant</Text></View>}
                      {req.vehicleState.keysLocked && <View style={styles.flag}><Text style={styles.flagText}>🔒 Clés</Text></View>}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.quoteBtn}
                    onPress={() => handleOpenQuoteModal(req)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.quoteBtnText}>💬 Soumettre un devis</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Earnings link */}
        <TouchableOpacity
          style={styles.earningsLinkBtn}
          onPress={() => navigation.navigate('ProviderEarnings')}
          activeOpacity={0.75}
        >
          <Text style={styles.earningsLinkText}>📊 Voir l'analyse complète de mes gains →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Quote modal */}
      <Modal visible={!!quoteModal} transparent animationType="slide" onRequestClose={() => setQuoteModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Soumettre un devis</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prix (TND) *</Text>
              <TextInput
                style={styles.input}
                value={quotePrice}
                onChangeText={setQuotePrice}
                placeholder="Ex: 45.000"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Délai d'arrivée (minutes) *</Text>
              <TextInput
                style={styles.input}
                value={quoteEta}
                onChangeText={setQuoteEta}
                placeholder="Ex: 20"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setQuoteModal(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitQuote}
                activeOpacity={0.85}
                disabled={submittingQuote}
              >
                {submittingQuote
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalSubmitText}>Envoyer le devis</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.sos },
  headerSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
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
  activeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  activePrice: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginBottom: 6 },
  vehicleSummary: { fontSize: 13, color: COLORS.textMuted, marginBottom: 14 },
  activeActions: { gap: 10 },
  arrivalButton: { backgroundColor: COLORS.green, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  arrivalButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  completeButton: { backgroundColor: COLORS.sos, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  completeButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyCard: {
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.sos + '44',
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  requestType: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  requestMode: { fontSize: 12, color: COLORS.textMuted },
  requestVehicle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  stateFlags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  flag: { backgroundColor: COLORS.sos + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  flagText: { fontSize: 10, color: COLORS.sos, fontWeight: '700' },
  quoteBtn: {
    backgroundColor: COLORS.sos,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quoteBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.sos, marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.textMuted, fontWeight: '600' },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: COLORS.sos,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSubmitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  earningsLinkBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  earningsLinkText: { color: COLORS.sos, fontSize: 13, fontWeight: '600' },
});
