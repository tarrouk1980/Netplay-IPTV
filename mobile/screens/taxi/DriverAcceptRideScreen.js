import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#2ECC71',
  red: '#E74C3C',
};

const MOCK = {
  clientName: "M. ****",
  rating: 4.2,
  from: "Av. de la Liberté, Tunis",
  to: "Gare de Tunis",
  distance: 3.2,
  fare: 12.50,
  duration: 8,
};

export default function DriverAcceptRideScreen({ navigation }) {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (countdown <= 0) {
      Alert.alert("Course refusée", "Délai expiré.");
      navigation.goBack();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function handleAccept() {
    Alert.alert("Course acceptée !", "Bonne route !");
    navigation.goBack();
  }

  function handleRefuse() {
    Alert.alert("Course refusée", "Vous avez refusé la course.");
    navigation.goBack();
  }

  const initials = "M";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Pulse circle */}
        <View style={styles.pulseOuter}>
          <View style={styles.pulseInner}>
            <Text style={styles.pulseIcon}>🚕</Text>
          </View>
        </View>

        <Text style={styles.title}>Nouvelle course !</Text>
        <Text style={styles.countdown}>Accepter dans {countdown}s</Text>

        {/* Client card */}
        <View style={styles.card}>
          <View style={styles.clientRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{MOCK.clientName}</Text>
              <Text style={styles.clientRating}>⭐ {MOCK.rating}</Text>
            </View>
          </View>
        </View>

        {/* Trip details */}
        <View style={styles.card}>
          <View style={styles.tripRow}>
            <View style={styles.dotGreen} />
            <View style={styles.tripTextBlock}>
              <Text style={styles.tripLabel}>Départ</Text>
              <Text style={styles.tripAddress}>{MOCK.from}</Text>
            </View>
          </View>
          <View style={styles.tripDivider} />
          <View style={styles.tripRow}>
            <View style={styles.dotOrange} />
            <View style={styles.tripTextBlock}>
              <Text style={styles.tripLabel}>Destination</Text>
              <Text style={styles.tripAddress}>{MOCK.to}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>
                {MOCK.fare.toFixed(2)} TND
              </Text>
              <Text style={styles.statLabel}>Tarif estimé</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>~{MOCK.duration} min</Text>
              <Text style={styles.statLabel}>Durée</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.btnAccept} onPress={handleAccept}>
          <Text style={styles.btnAcceptText}>✅ Accepter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnRefuse} onPress={handleRefuse}>
          <Text style={styles.btnRefuseText}>✗ Refuser</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, alignItems: 'center' },
  pulseOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.9,
  },
  pulseInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseIcon: { fontSize: 36 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  countdown: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#000' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  clientRating: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  tripRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ECC71',
    marginTop: 4,
    marginRight: 10,
  },
  dotOrange: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    marginRight: 10,
  },
  tripTextBlock: { flex: 1 },
  tripLabel: { fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' },
  tripAddress: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  tripDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  btnAccept: {
    width: '100%',
    backgroundColor: '#2ECC71',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnAcceptText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  btnRefuse: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E74C3C',
    marginBottom: 20,
  },
  btnRefuseText: { fontSize: 18, fontWeight: '700', color: '#E74C3C' },
});
