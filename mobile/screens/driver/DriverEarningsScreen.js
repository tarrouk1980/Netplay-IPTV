import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const TRIPS = [
  { id: '1', heure: '08:12', from: 'Lac 1', to: 'Centre-ville', distance: '4.2 km', duree: '14 min', montant: 12.5 },
  { id: '2', heure: '09:45', from: 'Menzah 5', to: "Cité l'Amirale", distance: '6.8 km', duree: '22 min', montant: 18.0 },
  { id: '3', heure: '11:30', from: 'Ariana', to: 'Tunis Belvédère', distance: '9.1 km', duree: '31 min', montant: 24.5 },
  { id: '4', heure: '13:05', from: 'La Marsa', to: 'Carthage', distance: '3.5 km', duree: '11 min', montant: 9.5 },
  { id: '5', heure: '14:50', from: 'El Menzah 6', to: 'Cité Olympique', distance: '7.3 km', duree: '25 min', montant: 19.5 },
  { id: '6', heure: '16:20', from: 'Bardo', to: 'El Omrane', distance: '2.9 km', duree: '9 min', montant: 8.0 },
  { id: '7', heure: '18:00', from: 'Ennasr', to: 'Lac 2', distance: '5.6 km', duree: '18 min', montant: 15.5 },
  { id: '8', heure: '19:45', from: 'Montplaisir', to: 'Les Berges du Lac', distance: '8.2 km', duree: '28 min', montant: 22.0 },
];

const SUMMARY = {
  aujourdhui: 127.5,
  semaine: 623.0,
  mois: 2415.0,
};

const PERIODS = ["Aujourd'hui", 'Semaine', 'Mois'];

export default function DriverEarningsScreen({ navigation }) {
  const [activePeriod, setActivePeriod] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes gains</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{"Aujourd'hui"}</Text>
            <Text style={styles.summaryValue}>127,50</Text>
            <Text style={styles.summaryUnit}>TND</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Cette semaine</Text>
            <Text style={styles.summaryValue}>623,00</Text>
            <Text style={styles.summaryUnit}>TND</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Ce mois</Text>
            <Text style={styles.summaryValue}>2 415,00</Text>
            <Text style={styles.summaryUnit}>TND</Text>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {PERIODS.map((p, i) => (
            <TouchableOpacity
              key={p}
              style={[styles.tab, activePeriod === i && styles.tabActive]}
              onPress={() => setActivePeriod(i)}
            >
              <Text style={[styles.tabText, activePeriod === i && styles.tabTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Courses récentes</Text>
        {TRIPS.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripLeft}>
              <Text style={styles.tripTime}>{trip.heure}</Text>
              <Text style={styles.tripRoute}>{trip.from} → {trip.to}</Text>
              <Text style={styles.tripMeta}>{trip.distance} · {trip.duree}</Text>
            </View>
            <View style={styles.tripRight}>
              <Text style={styles.tripAmount}>{trip.montant.toFixed(2)}</Text>
              <Text style={styles.tripAmountUnit}>TND</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.withdrawBtn}>
          <Text style={styles.withdrawBtnText}>Retirer mes gains</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: COLORS.text, fontSize: 22 },
  headerTitle: { flex: 1, color: COLORS.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerRight: { width: 36 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 4, textAlign: 'center' },
  summaryValue: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  summaryUnit: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#000000' },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  tripCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tripLeft: { flex: 1 },
  tripTime: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  tripRoute: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  tripMeta: { color: COLORS.muted, fontSize: 12 },
  tripRight: { alignItems: 'flex-end' },
  tripAmount: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  tripAmountUnit: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  withdrawBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  withdrawBtnText: { color: '#000000', fontSize: 16, fontWeight: '700' },
});
