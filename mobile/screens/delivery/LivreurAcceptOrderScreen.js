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
  merchantName: "Pizza Roma",
  merchantAddress: "Av. Bourguiba",
  clientZone: "Quartier ****",
  items: 4,
  deliveryFee: 8.00,
  distance: 2.1,
};

export default function LivreurAcceptOrderScreen({ navigation }) {
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (countdown <= 0) {
      Alert.alert("Livraison refusée", "Délai expiré.");
      navigation.goBack();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function handleAccept() {
    Alert.alert("Livraison acceptée !", "Bonne livraison !");
    navigation.goBack();
  }

  function handleRefuse() {
    Alert.alert("Livraison refusée", "Vous avez refusé la livraison.");
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Pulse circle */}
        <View style={styles.pulseOuter}>
          <View style={styles.pulseInner}>
            <Text style={styles.pulseIcon}>🛵</Text>
          </View>
        </View>

        <Text style={styles.title}>Nouvelle livraison !</Text>
        <Text style={styles.countdown}>Accepter dans {countdown}s</Text>

        {/* Merchant card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Récupération</Text>
          <View style={styles.infoRow}>
            <Text style={styles.merchantName}>{MOCK.merchantName}</Text>
          </View>
          <View style={styles.addressRow}>
            <View style={styles.dotGreen} />
            <Text style={styles.addressText}>{MOCK.merchantAddress}</Text>
          </View>
        </View>

        {/* Delivery card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Livraison</Text>
          <View style={styles.addressRow}>
            <View style={styles.dotOrange} />
            <Text style={styles.addressText}>{MOCK.clientZone}</Text>
          </View>
        </View>

        {/* Order details */}
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK.items}</Text>
              <Text style={styles.statLabel}>Articles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>
                {MOCK.deliveryFee.toFixed(2)} TND
              </Text>
              <Text style={styles.statLabel}>Frais livraison</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
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
  sectionTitle: {
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  infoRow: { marginBottom: 6 },
  merchantName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ECC71',
    marginRight: 10,
  },
  dotOrange: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  addressText: { fontSize: 15, color: COLORS.text, flex: 1 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
