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

const DELIVERIES = [
  { id: '1', heure: '08:30', marchand: 'Pizza Roma', adresse: "Rue de l'Indépendance, Tunis", distance: '3.1 km', montant: 8.5, bonus: null },
  { id: '2', heure: '09:55', marchand: 'Burger House', adresse: 'Avenue Habib Bourguiba, Lac 1', distance: '5.2 km', montant: 11.0, bonus: 'Bonus rush' },
  { id: '3', heure: '11:10', marchand: 'Sushi Express', adresse: 'Cité El Khadra, Tunis', distance: '7.8 km', montant: 16.5, bonus: null },
  { id: '4', heure: '12:40', marchand: 'Chez Mounir', adresse: 'Ariana Soghra', distance: '4.5 km', montant: 9.5, bonus: null },
  { id: '5', heure: '14:15', marchand: 'Green Garden', adresse: 'Menzah 9, Tunis', distance: '6.3 km', montant: 13.0, bonus: 'Bonus fidélité' },
  { id: '6', heure: '16:00', marchand: 'Tacos Nation', adresse: 'La Marsa Centre', distance: '2.8 km', montant: 7.0, bonus: null },
  { id: '7', heure: '17:30', marchand: 'Café Orient', adresse: 'Ennasr 2, Ariana', distance: '5.0 km', montant: 10.5, bonus: null },
  { id: '8', heure: '19:20', marchand: 'Le Gourmet', adresse: 'Les Berges du Lac 2', distance: '8.5 km', montant: 18.0, bonus: 'Bonus soirée' },
];

const PERIODS = ["Aujourd'hui", 'Semaine', 'Mois'];

export default function LivreurEarningsScreen({ navigation }) {
  const [activePeriod, setActivePeriod] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes gains livraison</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{"Aujourd'hui"}</Text>
            <Text style={styles.summaryValue}>93,50</Text>
            <Text style={styles.summaryUnit}>TND</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Cette semaine</Text>
            <Text style={styles.summaryValue}>487,00</Text>
            <Text style={styles.summaryUnit}>TND</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Ce mois</Text>
            <Text style={styles.summaryValue}>1 920,00</Text>
            <Text style={styles.summaryUnit}>TND</Text>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📦</Text>
            <Text style={styles.statValue}>142</Text>
            <Text style={styles.statLabel}>Livraisons réussies</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Taux acceptation</Text>
          </View>
        </View>

        {/* Period Tabs */}
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

        {/* Deliveries List */}
        <Text style={styles.sectionTitle}>Livraisons récentes</Text>
        {DELIVERIES.map((d) => (
          <View key={d.id} style={styles.deliveryCard}>
            <View style={styles.deliveryLeft}>
              <Text style={styles.deliveryTime}>{d.heure}</Text>
              <Text style={styles.deliveryRoute}>{d.marchand} → client</Text>
              <Text style={styles.deliveryAddress} numberOfLines={1}>{d.adresse}</Text>
              <Text style={styles.deliveryMeta}>{d.distance}</Text>
            </View>
            <View style={styles.deliveryRight}>
              <Text style={styles.deliveryAmount}>{d.montant.toFixed(2)}</Text>
              <Text style={styles.deliveryAmountUnit}>TND</Text>
              {d.bonus && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusBadgeText}>{d.bonus}</Text>
                </View>
              )}
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
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
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
  summaryValue: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  summaryUnit: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statValue: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
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
  deliveryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deliveryLeft: { flex: 1, marginRight: 8 },
  deliveryTime: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  deliveryRoute: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  deliveryAddress: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  deliveryMeta: { color: COLORS.muted, fontSize: 12 },
  deliveryRight: { alignItems: 'flex-end' },
  deliveryAmount: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  deliveryAmountUnit: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  bonusBadge: {
    backgroundColor: '#1A3A1A',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  bonusBadgeText: { color: '#2ECC71', fontSize: 10, fontWeight: '600' },
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
