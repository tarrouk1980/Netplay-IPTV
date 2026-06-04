import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentLocationWithAddress } from '../../utils/locationUtils';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  blue: '#2196F3', green: '#27AE60',
};

const DRIVERS = [
  { id: 'D1', name: 'Mourad Cherif', rating: 4.9, trips: 520, eta: '6 min', distance: 1.1, vehicle: 'Mercedes Vito PMR', capacity: 1, certified: true },
  { id: 'D2', name: 'Habib Nasr', rating: 4.8, trips: 310, eta: '10 min', distance: 1.8, vehicle: 'Renault Trafic PMR', capacity: 2, certified: true },
];

const FEATURES = [
  { icon: '♿', text: 'Rampe d\'accès fauteuil roulant' },
  { icon: '🔒', text: 'Ancrages certifiés pour fauteuils' },
  { icon: '👨‍⚕️', text: 'Chauffeurs formés en aide à la mobilité' },
  { icon: '📐', text: 'Espace adapté PMR · jusqu\'à 2 fauteuils' },
  { icon: '🚗', text: 'Véhicules homologués ANTT' },
];

export default function EasyAccessScreen({ navigation }) {
  const [originText, setOriginText] = useState('');
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [wheelchairCount, setWheelchairCount] = useState(1);

  const detect = async () => {
    setLocating(true);
    const r = await getCurrentLocationWithAddress();
    if (r) setOriginText(r.address);
    setLocating(false);
  };

  const handleBook = () => {
    navigation.navigate('TaxiRequest', {
      taxiType: 'EASYACCESS',
      prefilledDest: '',
      scheduledMode: false,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>♿ EasyAccess</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={{ fontSize: 52 }}>♿</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>EasyAccess</Text>
            <Text style={styles.heroSub}>Véhicules adaptés PMR · Chauffeurs certifiés</Text>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>🏅 ANTT</Text></View>
              <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>♿ PMR</Text></View>
              <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>✅ Certifié</Text></View>
            </View>
          </View>
        </View>

        {/* Fauteuils */}
        <View style={styles.countRow}>
          <Text style={styles.countLabel}>Nombre de fauteuils roulants</Text>
          <View style={styles.counter}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => setWheelchairCount(Math.max(1, wheelchairCount - 1))}>
              <Text style={styles.counterBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterVal}>{wheelchairCount}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => setWheelchairCount(Math.min(2, wheelchairCount + 1))}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Position */}
        <TouchableOpacity style={styles.locBtn} onPress={detect} disabled={locating}>
          {locating
            ? <ActivityIndicator color={COLORS.blue} size="small" />
            : <Text style={styles.locBtnText}>{originText || '📍 Détecter ma position'}</Text>
          }
        </TouchableOpacity>

        {/* Véhicules */}
        <Text style={styles.sectionTitle}>VÉHICULES DISPONIBLES</Text>
        {DRIVERS.filter(d => d.capacity >= wheelchairCount).map(d => (
          <TouchableOpacity
            key={d.id}
            style={[styles.driverCard, selected === d.id && styles.driverCardSelected]}
            onPress={() => setSelected(d.id)}
            activeOpacity={0.85}
          >
            <View style={styles.driverAvatar}>
              <Text style={{ fontSize: 26 }}>🚐</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>{d.name}</Text>
              <Text style={styles.vehicleName}>{d.vehicle}</Text>
              <Text style={styles.driverMeta}>⭐ {d.rating} · ♿ {d.capacity} fauteuil{d.capacity > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.etaBox}>
              <Text style={styles.etaVal}>{d.eta}</Text>
              <Text style={styles.etaLabel}>d'arrivée</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Équipements */}
        <Text style={styles.sectionTitle}>ÉQUIPEMENTS INCLUS</Text>
        <View style={styles.featuresCard}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={{ fontSize: 20 }}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Text style={styles.bookBtnText}>♿ Réserver EasyAccess</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.blue, fontSize: 17, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.blue + '15', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.blue + '30' },
  heroTitle: { color: COLORS.blue, fontSize: 20, fontWeight: '900' },
  heroSub: { color: COLORS.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  heroBadge: { backgroundColor: COLORS.blue + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  heroBadgeText: { color: COLORS.blue, fontSize: 10, fontWeight: '700' },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  countLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  counterBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.blue + '20', borderWidth: 1, borderColor: COLORS.blue + '40', alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { color: COLORS.blue, fontSize: 18, fontWeight: '900' },
  counterVal: { color: COLORS.text, fontSize: 20, fontWeight: '900', minWidth: 24, textAlign: 'center' },
  locBtn: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  locBtnText: { color: COLORS.text, fontSize: 14 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  driverCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  driverCardSelected: { borderColor: COLORS.blue, backgroundColor: COLORS.blue + '10' },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.blue + '20', alignItems: 'center', justifyContent: 'center' },
  driverName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  vehicleName: { color: COLORS.blue, fontSize: 11, marginTop: 1 },
  driverMeta: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  etaBox: { alignItems: 'center' },
  etaVal: { color: COLORS.blue, fontSize: 16, fontWeight: '900' },
  etaLabel: { color: COLORS.muted, fontSize: 9 },
  featuresCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border + '60' },
  featureText: { color: COLORS.text, fontSize: 13, flex: 1 },
  bookBtn: { backgroundColor: COLORS.blue, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
