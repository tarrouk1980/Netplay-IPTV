import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  border: '#2A2A3A', text: '#FFFFFF', muted: '#8A8A9A',
  orange: '#F57C00', green: '#27AE60', gold: '#FFD700',
};

const MOCK_RECEIPT = {
  id: 'TXI-20260601-4821',
  date: new Date().toISOString(),
  from: 'Avenue Habib Bourguiba, Tunis',
  to: 'Aéroport Tunis-Carthage',
  distance: 12.4,
  duration: 22,
  baseFare: 3.5,
  distanceFare: 18.6,
  waitFare: 0,
  promoCode: null,
  promoDiscount: 0,
  total: 22.1,
  driver: { name: 'Karim Bouzid', vehicle: 'Volkswagen Polo Grise', rating: 4.8 },
  paymentMethod: 'WALLET',
  paid: true,
};

function Stars({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map((i) => (
        <Text key={i} style={{ fontSize: 12, color: i <= Math.round(rating) ? COLORS.gold : COLORS.border }}>★</Text>
      ))}
    </View>
  );
}

const PAY_LABELS = { WALLET: '💳 Portefeuille EasyWay', CASH: '💵 Espèces', CARD: '💳 Carte bancaire' };

export default function TaxiReceiptScreen({ navigation, route }) {
  const receipt = route?.params?.receipt || MOCK_RECEIPT;
  const d = new Date(receipt.date);
  const dateStr = d.toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });

  const handleDownload = () => {
    Alert.alert('Téléchargement PDF', 'Cette fonctionnalité sera disponible dans la prochaine mise à jour.');
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🧾 Reçu de course</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <View style={s.brandCard}>
          <Text style={s.brandName}>EASY<Text style={{ color: '#D32F2F' }}>WAY</Text></Text>
          <Text style={s.brandSub}>Reçu de course taxi</Text>
          <Text style={s.rideId}>{receipt.id}</Text>
          <Text style={s.rideDate}>{dateStr} à {timeStr}</Text>
        </View>

        <View style={s.tripCard}>
          <View style={s.tripRow}>
            <View style={s.tripDotGreen} />
            <View style={{ flex: 1 }}>
              <Text style={s.tripLabel}>Départ</Text>
              <Text style={s.tripAddr}>{receipt.from}</Text>
            </View>
          </View>
          <View style={s.tripLine} />
          <View style={s.tripRow}>
            <View style={s.tripDotOrange} />
            <View style={{ flex: 1 }}>
              <Text style={s.tripLabel}>Arrivée</Text>
              <Text style={s.tripAddr}>{receipt.to}</Text>
            </View>
          </View>
          <View style={s.tripStats}>
            <Text style={s.tripStat}>📍 {receipt.distance} km</Text>
            <Text style={s.tripStat}>⏱ {receipt.duration} min</Text>
          </View>
        </View>

        <View style={s.fareCard}>
          <Text style={s.fareTitle}>Détail tarifaire</Text>
          <View style={s.fareRow}>
            <Text style={s.fareLabel}>Prix de base</Text>
            <Text style={s.fareVal}>{receipt.baseFare.toFixed(3)} TND</Text>
          </View>
          <View style={s.fareRow}>
            <Text style={s.fareLabel}>Distance ({receipt.distance} km)</Text>
            <Text style={s.fareVal}>{receipt.distanceFare.toFixed(3)} TND</Text>
          </View>
          {receipt.waitFare > 0 && (
            <View style={s.fareRow}>
              <Text style={s.fareLabel}>Temps d'attente</Text>
              <Text style={s.fareVal}>{receipt.waitFare.toFixed(3)} TND</Text>
            </View>
          )}
          {receipt.promoDiscount > 0 && (
            <View style={s.fareRow}>
              <Text style={[s.fareLabel, { color: COLORS.green }]}>Code promo ({receipt.promoCode})</Text>
              <Text style={[s.fareVal, { color: COLORS.green }]}>−{receipt.promoDiscount.toFixed(3)} TND</Text>
            </View>
          )}
          <View style={s.fareDivider} />
          <View style={s.fareRow}>
            <Text style={s.fareTotalLabel}>Total</Text>
            <Text style={s.fareTotalVal}>{receipt.total.toFixed(3)} TND</Text>
          </View>
        </View>

        <View style={s.driverCard}>
          <Text style={{ fontSize: 28, marginBottom: 6 }}>🚕</Text>
          <Text style={s.driverName}>{receipt.driver.name}</Text>
          <Text style={s.driverVehicle}>{receipt.driver.vehicle}</Text>
          <Stars rating={receipt.driver.rating} />
          <Text style={s.driverRating}>{receipt.driver.rating}/5</Text>
        </View>

        <View style={s.payCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={s.payMethod}>{PAY_LABELS[receipt.paymentMethod] || receipt.paymentMethod}</Text>
            <View style={s.paidBadge}>
              <Text style={s.paidTxt}>✅ PAYÉ</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.downloadBtn} onPress={handleDownload}>
          <Text style={s.downloadBtnTxt}>📥 Télécharger PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.rideAgainBtn} onPress={() => navigation.navigate('TaxiHome')}>
          <Text style={s.rideAgainBtnTxt}>🚕 Commander à nouveau</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  brandCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  brandName: { color: COLORS.text, fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  brandSub: { color: COLORS.muted, fontSize: 12, marginTop: 2, marginBottom: 8 },
  rideId: { color: COLORS.orange, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  rideDate: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  tripCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  tripRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tripDotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.green, marginTop: 3 },
  tripDotOrange: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.orange, marginTop: 3 },
  tripLine: { width: 2, height: 20, backgroundColor: COLORS.border, marginLeft: 5, marginVertical: 4 },
  tripLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  tripAddr: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginTop: 2 },
  tripStats: { flexDirection: 'row', gap: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  tripStat: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  fareCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  fareTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  fareLabel: { color: COLORS.muted, fontSize: 13 },
  fareVal: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  fareDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  fareTotalLabel: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  fareTotalVal: { color: COLORS.orange, fontSize: 20, fontWeight: '900' },
  driverCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  driverName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  driverVehicle: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  driverRating: { color: COLORS.gold, fontSize: 12, fontWeight: '700', marginTop: 4 },
  payCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  payMethod: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  paidBadge: { backgroundColor: COLORS.green + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.green },
  paidTxt: { color: COLORS.green, fontSize: 11, fontWeight: '800' },
  downloadBtn: { backgroundColor: COLORS.surfaceAlt, borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  downloadBtnTxt: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  rideAgainBtn: { backgroundColor: COLORS.orange, borderRadius: 14, padding: 15, alignItems: 'center' },
  rideAgainBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
