import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
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
  green: '#22C55E',
  red: '#EF4444',
};

const DAYS = [
  { key: 'lun', label: 'Lun' },
  { key: 'mar', label: 'Mar' },
  { key: 'mer', label: 'Mer' },
  { key: 'jeu', label: 'Jeu' },
  { key: 'ven', label: 'Ven' },
  { key: 'sam', label: 'Sam' },
  { key: 'dim', label: 'Dim' },
];

const STATS = [
  { label: 'Acceptées', value: 12 },
  { label: 'Refusées', value: 2 },
  { label: "Taux d'acceptation", value: '86%' },
];

export default function DriverStatusScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(true);
  const [dayToggles, setDayToggles] = useState({
    lun: true,
    mar: true,
    mer: true,
    jeu: true,
    ven: true,
    sam: false,
    dim: false,
  });

  const toggleDay = (key) => {
    setDayToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon statut</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Online/Offline Toggle Card */}
        <View style={[styles.card, isOnline && styles.cardGlowGreen]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.statusLabel, { color: isOnline ? COLORS.green : COLORS.muted }]}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </Text>
              <Text style={styles.statusSub}>
                {isOnline ? 'Vous recevez des courses' : 'Vous ne recevez pas de courses'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: COLORS.border, true: COLORS.green }}
              thumbColor={COLORS.text}
            />
          </View>
        </View>

        {/* Stats Today */}
        <Text style={styles.sectionTitle}>Statistiques du jour</Text>
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Current Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Votre position actuelle</Text>
          <Text style={styles.cardValue}>Avenue Habib Bourguiba, Tunis 1001</Text>
          <Text style={styles.cardSub}>Mise à jour il y a 2 min</Text>
        </View>

        {/* Earnings Today */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gains du jour</Text>
          <Text style={[styles.cardValue, { color: COLORS.primary, fontSize: 28 }]}>87,500 TND</Text>
          <Text style={styles.cardSub}>12 courses effectuées</Text>
        </View>

        {/* Availability Schedule */}
        <Text style={styles.sectionTitle}>Planning de disponibilité</Text>
        <View style={styles.card}>
          <View style={styles.daysGrid}>
            {DAYS.map((day) => (
              <View key={day.key} style={styles.dayItem}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Switch
                  value={dayToggles[day.key]}
                  onValueChange={() => toggleDay(day.key)}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.text}
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Vehicle Status */}
        <Text style={styles.sectionTitle}>État du véhicule</Text>
        <View style={styles.card}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleItem}>
              <Text style={styles.vehicleLabel}>Carburant estimé</Text>
              <View style={[styles.badge, { backgroundColor: '#F59E0B22' }]}>
                <Text style={[styles.badgeText, { color: '#F59E0B' }]}>⛽ Medium</Text>
              </View>
            </View>
            <View style={styles.vehicleItem}>
              <Text style={styles.vehicleLabel}>Dernière révision</Text>
              <Text style={styles.vehicleValue}>il y a 2 mois</Text>
            </View>
          </View>
        </View>

        {/* Session Button */}
        <TouchableOpacity
          style={[styles.sessionBtn, { backgroundColor: sessionStarted ? COLORS.red : COLORS.primary }]}
          onPress={() => setSessionStarted(!sessionStarted)}
        >
          <Text style={styles.sessionBtnText}>
            {sessionStarted ? 'Terminer ma journée' : 'Démarrer ma journée'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardGlowGreen: {
    borderColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSub: {
    color: COLORS.muted,
    fontSize: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  cardTitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSub: {
    color: COLORS.muted,
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    width: '13%',
  },
  dayLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  vehicleItem: {
    flex: 1,
  },
  vehicleLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  vehicleValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sessionBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  sessionBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
