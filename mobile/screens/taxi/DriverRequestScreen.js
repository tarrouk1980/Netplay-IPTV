import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import MapView from '../../components/MapView';

const TIMER_SECONDS = 30;

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  header: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  red: '#D32F2F',
  green: '#4CAF50',
  border: '#2C2C3E',
};

/**
 * DriverRequestScreen — Plein écran d'acceptation / refus de course
 *
 * Paramètres de route (route.params.request):
 *   { orderId, pickup, destination, distanceKm, estimatedPrice, clientName }
 *
 * pickup      / destination: { lat, lng, label }
 */
export default function DriverRequestScreen({ route, navigation }) {
  const request = route?.params?.request || {};
  const {
    orderId,
    pickup,
    destination,
    distanceKm,
    estimatedPrice,
    clientName,
  } = request;

  // Timer animé (1 → 0 en TIMER_SECONDS secondes)
  const timerAnim = useRef(new Animated.Value(1)).current;
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const countRef = useRef(null);
  const autoRejected = useRef(false);

  useEffect(() => {
    // Lancer la barre de progression
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: TIMER_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

    // Compteur secondes
    countRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(countRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    // Refus automatique après TIMER_SECONDS
    timerRef.current = setTimeout(() => {
      if (!autoRejected.current) {
        autoRejected.current = true;
        handleReject(true);
      }
    }, TIMER_SECONDS * 1000);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countRef.current);
    };
  }, []);

  const stopTimer = () => {
    clearTimeout(timerRef.current);
    clearInterval(countRef.current);
    timerAnim.stopAnimation();
  };

  const handleAccept = async () => {
    if (loading) return;
    stopTimer();
    setLoading(true);
    try {
      await api.post(`/taxi/${orderId}/accept`);
      navigation.replace('DriverDashboard');
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible d\'accepter.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (auto = false) => {
    if (loading) return;
    stopTimer();
    if (!auto) setLoading(true);
    try {
      await api.post(`/taxi/${orderId}/reject`).catch(() => null);
    } finally {
      if (!auto) setLoading(false);
      navigation.replace('DriverDashboard');
    }
  };

  // Polyline simple pickup → destination
  const route_ =
    pickup && destination
      ? [
          { lat: pickup.lat, lng: pickup.lng },
          { lat: destination.lat, lng: destination.lng },
        ]
      : null;

  const barWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const barColor = timerAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [COLORS.red, '#FF9800', COLORS.green],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Barre timer en haut */}
      <View style={styles.timerTrack}>
        <Animated.View style={[styles.timerBar, { width: barWidth, backgroundColor: barColor }]} />
      </View>

      {/* Compteur secondes */}
      <View style={styles.timerRow}>
        <Text style={styles.timerLabel}>Répondez dans</Text>
        <Text style={[styles.timerSeconds, secondsLeft <= 10 && { color: COLORS.red }]}>
          {secondsLeft}s
        </Text>
      </View>

      {/* Titre */}
      <View style={styles.titleRow}>
        <Text style={styles.titleEmoji}>🚕</Text>
        <View>
          <Text style={styles.title}>Nouvelle course</Text>
          {clientName ? <Text style={styles.clientName}>Client : {clientName}</Text> : null}
        </View>
      </View>

      {/* Carte */}
      {(pickup || destination) && (
        <View style={styles.mapContainer}>
          <MapView
            userLocation={pickup}
            destination={destination}
            route={route_}
            height={180}
          />
        </View>
      )}

      {/* Infos course */}
      <View style={styles.infoCard}>
        {pickup?.label && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Départ</Text>
              <Text style={styles.infoValue}>{pickup.label}</Text>
            </View>
          </View>
        )}
        {destination?.label && (
          <View style={[styles.infoRow, { marginTop: 10 }]}>
            <Text style={styles.infoIcon}>🏁</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValue}>{destination.label}</Text>
            </View>
          </View>
        )}

        <View style={styles.statsRow}>
          {distanceKm != null && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{parseFloat(distanceKm).toFixed(1)} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          )}
          {distanceKm != null && estimatedPrice != null && (
            <View style={styles.statDivider} />
          )}
          {estimatedPrice != null && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.header }]}>
                {parseFloat(estimatedPrice).toFixed(3)} TND
              </Text>
              <Text style={styles.statLabel}>Prix estimé</Text>
            </View>
          )}
        </View>
      </View>

      {/* Boutons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.acceptBtn, loading && { opacity: 0.6 }]}
          onPress={handleAccept}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.acceptBtnText}>✔ ACCEPTER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleReject(false)}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.rejectBtnText}>✖ Refuser</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const HEADER = '#F5A623';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Timer barre
  timerTrack: {
    height: 5,
    backgroundColor: COLORS.border,
    width: '100%',
  },
  timerBar: {
    height: 5,
    borderRadius: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  timerLabel: { fontSize: 13, color: COLORS.textMuted },
  timerSeconds: { fontSize: 22, fontWeight: '800', color: COLORS.green },

  // Titre
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  titleEmoji: { fontSize: 36 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  clientName: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  // Carte
  mapContainer: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },

  // Infos
  infoCard: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoIcon: { fontSize: 18, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '600', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.border },

  // Boutons
  actions: { paddingHorizontal: 16, gap: 10, marginTop: 4 },
  acceptBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  rejectBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rejectBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});
