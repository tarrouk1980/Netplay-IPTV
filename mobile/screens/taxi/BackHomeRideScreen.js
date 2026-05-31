import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2A2A3A',
  success: '#27AE60',
  danger: '#D32F2F',
};

function StarRating({ value = 0 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={{ color: i <= value ? COLORS.accent : COLORS.border, fontSize: 13 }}>★</Text>
    );
  }
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
}

// ─── CLIENT VIEW ───────────────────────────────────────────────
function ClientView({ navigation }) {
  const [destination, setDestination] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchRides = useCallback(async () => {
    if (!destination.trim()) {
      Alert.alert('Destination requise', 'Veuillez entrer votre destination.');
      return;
    }
    setSearching(true);
    try {
      // Simple coords fallback — in production use geocoding API
      const res = await api.get('/api/taxi/backhome', {
        params: { destLat: 36.8, destLng: 10.18 },
      });
      setRides(res.data || []);
      if ((res.data || []).length === 0) {
        Alert.alert('Aucun trajet', 'Aucun chauffeur disponible sur ce trajet pour l\'instant.');
      }
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible de chercher les trajets.');
    } finally {
      setSearching(false);
    }
  }, [destination]);

  const joinRide = useCallback(async (rideId) => {
    setLoading(true);
    try {
      await api.post(`/api/taxi/backhome/${rideId}/join`);
      Alert.alert('Succès !', 'Vous avez rejoint le Back Home Ride. Le chauffeur sera notifié.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible de rejoindre ce trajet.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  return (
    <ScrollView style={styles.tabContent} keyboardShouldPersistTaps="handled">
      <View style={styles.searchSection}>
        <Text style={styles.label}>Où allez-vous ?</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre destination..."
          placeholderTextColor={COLORS.textMuted}
          value={destination}
          onChangeText={setDestination}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={searchRides} disabled={searching}>
          {searching
            ? <ActivityIndicator color={COLORS.background} />
            : <Text style={styles.searchBtnText}>Chercher un trajet</Text>
          }
        </TouchableOpacity>
      </View>

      {rides.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Trajets disponibles</Text>
          {rides.map((ride) => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{ride.driver?.name || 'Chauffeur'}</Text>
                  <StarRating value={Math.round(ride.driver?.avgRating || 0)} />
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{ride.price} TND</Text>
                </View>
              </View>
              <Text style={styles.rideDetail}>
                📍 Destination : {ride.destAddress || `${ride.destLat?.toFixed(4)}, ${ride.destLng?.toFixed(4)}`}
              </Text>
              <Text style={styles.rideDetail}>
                💺 Places restantes : {ride.seatsLeft} / {ride.seatsTotal}
              </Text>
              <TouchableOpacity
                style={[styles.joinBtn, (loading || ride.seatsLeft === 0) && styles.btnDisabled]}
                onPress={() => joinRide(ride.id)}
                disabled={loading || ride.seatsLeft === 0}
              >
                <Text style={styles.joinBtnText}>
                  {ride.seatsLeft === 0 ? 'Complet' : 'Rejoindre ce trajet'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─── DRIVER VIEW ───────────────────────────────────────────────
function DriverView() {
  const [destAddress, setDestAddress] = useState('');
  const [seats, setSeats] = useState('2');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const suggestPrice = useCallback(() => {
    // Simple suggestion: 3 TND base per seat
    const suggested = (parseInt(seats, 10) || 1) * 3;
    setPrice(String(suggested));
  }, [seats]);

  useEffect(() => {
    suggestPrice();
  }, [seats]);

  const toggleAvailability = useCallback(async (value) => {
    if (value && !destAddress.trim()) {
      Alert.alert('Destination requise', 'Entrez votre destination avant d\'activer.');
      return;
    }
    if (value) {
      setLoading(true);
      try {
        await api.post('/api/taxi/backhome', {
          destLat: 36.8,
          destLng: 10.18,
          destAddress,
          seats: parseInt(seats, 10) || 1,
          price: parseFloat(price) || 0,
        });
        setActive(true);
        Alert.alert('Activé !', 'Votre Back Home Ride est maintenant visible par les clients.');
      } catch (err) {
        Alert.alert('Erreur', err.message || 'Impossible d\'activer le Back Home Ride.');
      } finally {
        setLoading(false);
      }
    } else {
      setActive(false);
    }
  }, [destAddress, seats, price]);

  return (
    <ScrollView style={styles.tabContent} keyboardShouldPersistTaps="handled">
      <View style={styles.searchSection}>
        <Text style={styles.label}>Je rentre à :</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre adresse de destination..."
          placeholderTextColor={COLORS.textMuted}
          value={destAddress}
          onChangeText={setDestAddress}
        />

        <Text style={styles.label}>Nombre de places (1–3)</Text>
        <View style={styles.seatsRow}>
          {['1', '2', '3'].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.seatBtn, seats === n && styles.seatBtnActive]}
              onPress={() => setSeats(n)}
            >
              <Text style={[styles.seatBtnText, seats === n && styles.seatBtnTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Prix suggéré (TND)</Text>
        <TextInput
          style={styles.input}
          placeholder="Prix par passager..."
          placeholderTextColor={COLORS.textMuted}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Proposer Back Home Ride</Text>
            <Text style={styles.toggleSub}>
              {active ? 'Visible par les clients' : 'Inactif'}
            </Text>
          </View>
          {loading
            ? <ActivityIndicator color={COLORS.accent} />
            : (
              <Switch
                value={active}
                onValueChange={toggleAvailability}
                trackColor={{ false: COLORS.border, true: COLORS.accent + '88' }}
                thumbColor={active ? COLORS.accent : COLORS.textMuted}
              />
            )
          }
        </View>
      </View>

      {requests.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Demandes reçues</Text>
          {requests.map((req, i) => (
            <View key={i} style={styles.rideCard}>
              <Text style={styles.driverName}>{req.client?.name || 'Client'}</Text>
              <Text style={styles.rideDetail}>📍 {req.destAddress || 'Destination inconnue'}</Text>
            </View>
          ))}
        </View>
      )}

      {active && requests.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⏳</Text>
          <Text style={styles.emptyText}>En attente de demandes clients...</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── MAIN SCREEN ───────────────────────────────────────────────
export default function BackHomeRideScreen({ navigation }) {
  const [mode, setMode] = useState('CLIENT'); // 'CLIENT' | 'DRIVER'

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏠 Back Home Ride</Text>
        <View style={{ width: 70 }} />
      </View>

      <Text style={styles.headerSub}>
        Covoiturage économique sur le trajet retour du chauffeur
      </Text>

      {/* Toggle CLIENT / DRIVER */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleTab, mode === 'CLIENT' && styles.toggleTabActive]}
          onPress={() => setMode('CLIENT')}
        >
          <Text style={[styles.toggleTabText, mode === 'CLIENT' && styles.toggleTabTextActive]}>
            Je cherche un trajet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleTab, mode === 'DRIVER' && styles.toggleTabActive]}
          onPress={() => setMode('DRIVER')}
        >
          <Text style={[styles.toggleTabText, mode === 'DRIVER' && styles.toggleTabTextActive]}>
            Je propose un trajet
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'CLIENT' ? <ClientView navigation={navigation} /> : <DriverView />}
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
    paddingTop: 12,
    paddingBottom: 4,
  },
  backBtn: { padding: 4 },
  backBtnText: { color: COLORS.accent, fontSize: 14 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleTabActive: { backgroundColor: COLORS.accent },
  toggleTabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  toggleTabTextActive: { color: COLORS.background },
  tabContent: { flex: 1 },
  searchSection: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  label: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#12121C',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  searchBtnText: { color: COLORS.background, fontWeight: '700', fontSize: 15 },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  rideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  rideCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  driverName: { color: COLORS.text, fontWeight: '700', fontSize: 15, marginBottom: 2 },
  priceTag: {
    backgroundColor: COLORS.accent + '22',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  priceText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
  rideDetail: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  joinBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  joinBtnText: { color: COLORS.background, fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  seatsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  seatBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#12121C',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  seatBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  seatBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 16 },
  seatBtnTextActive: { color: COLORS.accent },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  toggleLabel: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  toggleSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
