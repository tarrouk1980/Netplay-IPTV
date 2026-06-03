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
  orange: '#F59E0B',
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

const EQUIPMENT = [
  { label: 'Câble démarrage', status: 'ok', icon: '✅' },
  { label: 'Cric', status: 'ok', icon: '✅' },
  { label: 'Triangle', status: 'ok', icon: '✅' },
  { label: 'Extincteur', status: 'warn', icon: '⚠️' },
];

const ZONES = [
  'Tunis Centre',
  'La Marsa',
  'Ariana',
  'Ben Arous',
];

export default function DepanneurStatusScreen({ navigation }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(true);
  const [dayToggles, setDayToggles] = useState({
    lun: true,
    mar: true,
    mer: true,
    jeu: true,
    ven: true,
    sam: true,
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
        <Text style={styles.headerTitle}>Mon statut 🛻</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Available/Unavailable Toggle Card */}
        <View style={[styles.card, isAvailable && styles.cardGlowGreen]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.statusLabel, { color: isAvailable ? COLORS.green : COLORS.muted }]}>
                {isAvailable ? 'Disponible' : 'Indisponible'}
              </Text>
              <Text style={styles.statusSub}>
                {isAvailable
                  ? 'Vous recevez des demandes SOS'
                  : "Vous ne recevez pas de demandes SOS"}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: COLORS.border, true: COLORS.green }}
              thumbColor={COLORS.text}
            />
          </View>
        </View>

        {/* Stats Today */}
        <Text style={styles.sectionTitle}>Interventions du jour</Text>
        <View style={styles.statsRow}>
          {[
            { label: "Aujourd'hui", value: 5 },
            { label: 'En cours', value: 1 },
            { label: 'Terminées', value: 4 },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Current Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Votre position actuelle</Text>
          <Text style={styles.cardValue}>Rue Ibn Khaldoun, Tunis 1002</Text>
          <Text style={styles.cardSub}>Mise à jour il y a 1 min</Text>
        </View>

        {/* Equipment Checklist */}
        <Text style={styles.sectionTitle}>Vérification équipements</Text>
        <View style={styles.card}>
          {EQUIPMENT.map((item) => (
            <View key={item.label} style={styles.equipRow}>
              <Text style={styles.equipLabel}>{item.label}</Text>
              <Text style={styles.equipIcon}>{item.icon}</Text>
            </View>
          ))}
        </View>

        {/* Coverage Zones */}
        <Text style={styles.sectionTitle}>Zones de couverture actives</Text>
        <View style={styles.card}>
          {ZONES.map((zone) => (
            <View key={zone} style={styles.zoneRow}>
              <View style={styles.zoneDot} />
              <Text style={styles.zoneText}>{zone}</Text>
            </View>
          ))}
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

        {/* Earnings Today */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gains du jour</Text>
          <Text style={[styles.cardValue, { color: COLORS.primary, fontSize: 28 }]}>124,000 TND</Text>
          <Text style={styles.cardSub}>5 interventions effectuées</Text>
        </View>

        {/* Session Button */}
        <TouchableOpacity
          style={[styles.sessionBtn, { backgroundColor: sessionStarted ? COLORS.red : COLORS.primary }]}
          onPress={() => setSessionStarted(!sessionStarted)}
        >
          <Text style={styles.sessionBtnText}>
            {sessionStarted ? 'Terminer ma garde' : 'Démarrer ma garde'}
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
  equipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  equipLabel: {
    color: COLORS.text,
    fontSize: 15,
  },
  equipIcon: {
    fontSize: 18,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    marginRight: 10,
  },
  zoneText: {
    color: COLORS.text,
    fontSize: 15,
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
