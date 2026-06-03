import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#0A0A0F",
  surface: "#1C1C28",
  primary: "#F5A623",
  text: "#FFFFFF",
  muted: "#8E8E9A",
  border: "#2C2C3A",
};

const VEHICLE_TYPES = [
  { id: "eco", label: "Économique", icon: "🚗", price: 8.5, desc: "Confort basique" },
  { id: "comfort", label: "Confort", icon: "🚙", price: 12.0, desc: "Plus spacieux" },
  { id: "premium", label: "Premium", icon: "🚘", price: 18.0, desc: "Berline haut de gamme" },
];

const TIME_SLOTS = [];
for (let h = 6; h <= 23; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 23) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}
TIME_SLOTS.push("23:30");

function getDays() {
  const days = [];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: i === 0 ? "Auj." : dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
      full: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
    });
  }
  return days;
}

const DAYS = getDays();

export default function TaxiScheduleScreen({ navigation }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [selectedVehicle, setSelectedVehicle] = useState("eco");
  const [depart, setDepart] = useState("12 Rue de Carthage, Tunis");
  const [destination, setDestination] = useState("Aéroport Tunis-Carthage, Terminal 1");

  const vehicle = VEHICLE_TYPES.find((v) => v.id === selectedVehicle);

  const handleConfirm = () => {
    Alert.alert(
      "Réservation confirmée",
      `Course réservée pour ${DAYS[selectedDay].full} à ${selectedTime} !`,
      [{ text: "OK", onPress: () => navigation && navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{"Réserver à l'avance"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir la date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
            {DAYS.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.dayCard, selectedDay === idx && styles.dayCardActive]}
                onPress={() => setSelectedDay(idx)}
              >
                <Text style={[styles.dayName, selectedDay === idx && styles.dayTextActive]}>{day.label}</Text>
                <Text style={[styles.dayNum, selectedDay === idx && styles.dayTextActive]}>{day.date}</Text>
                <Text style={[styles.dayMonth, selectedDay === idx && styles.dayTextActive]}>{day.month}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir l'heure</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.timeChip, selectedTime === slot && styles.timeChipActive]}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={[styles.timeChipText, selectedTime === slot && styles.timeChipTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajet</Text>
          <View style={styles.card}>
            <View style={styles.addressRow}>
              <Text style={styles.addressDot}>🟢</Text>
              <View style={styles.addressInputWrap}>
                <Text style={styles.addressLabel}>Départ</Text>
                <TextInput
                  style={styles.addressInput}
                  value={depart}
                  onChangeText={setDepart}
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.addressRow}>
              <Text style={styles.addressDot}>🔴</Text>
              <View style={styles.addressInputWrap}>
                <Text style={styles.addressLabel}>Destination</Text>
                <TextInput
                  style={styles.addressInput}
                  value={destination}
                  onChangeText={setDestination}
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de véhicule</Text>
          {VEHICLE_TYPES.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.vehicleCard, selectedVehicle === v.id && styles.vehicleCardActive]}
              onPress={() => setSelectedVehicle(v.id)}
            >
              <Text style={styles.vehicleIcon}>{v.icon}</Text>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>{v.label}</Text>
                <Text style={styles.vehicleDesc}>{v.desc}</Text>
              </View>
              <Text style={styles.vehiclePrice}>{v.price.toFixed(2)} TND</Text>
              {selectedVehicle === v.id && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>📅 Date</Text>
              <Text style={styles.summaryVal}>{DAYS[selectedDay].full}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>🕐 Heure</Text>
              <Text style={styles.summaryVal}>{selectedTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>📍 Trajet</Text>
              <Text style={styles.summaryValSmall} numberOfLines={1}>{depart}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>   → Vers</Text>
              <Text style={styles.summaryValSmall} numberOfLines={1}>{destination}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>🚗 Véhicule</Text>
              <Text style={styles.summaryVal}>{vehicle ? vehicle.label : ""}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalKey}>💰 Prix estimé</Text>
              <Text style={styles.summaryTotalVal}>{vehicle ? vehicle.price.toFixed(2) : "0.00"} TND</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirmer la réservation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 22,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  dayScroll: {
    flexDirection: "row",
  },
  dayCard: {
    width: 64,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  dayCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#2A1F0A",
  },
  dayName: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  dayMonth: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  dayTextActive: {
    color: COLORS.primary,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#2A1F0A",
  },
  timeChipText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  timeChipTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  addressDot: {
    fontSize: 14,
    marginRight: 10,
  },
  addressInputWrap: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 2,
  },
  addressInput: {
    fontSize: 14,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
    marginLeft: 24,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  vehicleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#1A1508",
  },
  vehicleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  vehicleDesc: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  vehiclePrice: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
    marginRight: 8,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryTotal: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  summaryKey: {
    fontSize: 13,
    color: COLORS.muted,
  },
  summaryVal: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "600",
  },
  summaryValSmall: {
    fontSize: 12,
    color: COLORS.text,
    maxWidth: 180,
  },
  summaryTotalKey: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
  },
  summaryTotalVal: {
    fontSize: 17,
    color: COLORS.primary,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0F",
  },
});
