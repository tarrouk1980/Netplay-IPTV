import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_DRIVER = {
  name: 'Achraf Belhaj',
  avatar: '🧔',
  rating: 4.9,
  totalRides: 1842,
  joinDate: 'Janvier 2023',
  vehicle: 'Renault Clio 5 Grise',
  plate: 'TUN-2234',
  phone: '+216 55 441 990',
  zone: 'Tunis Centre',
  status: 'online',
  badges: ['⚡ Top Vitesse', '⭐ 500+ courses', '🔒 Vérifié'],
  reviews: [
    { client: 'Sana B.', rating: 5, comment: 'Très professionnel, voiture propre.', date: 'Auj.' },
    { client: 'Karim L.', rating: 5, comment: 'Rapide et sympa, je recommande !', date: 'Hier' },
    { client: 'Ines M.', rating: 4, comment: 'Bonne course, légèrement en retard.', date: '02/06' },
  ],
  stats: {
    completionRate: 98.2,
    onTimeRate: 94.5,
    cancelRate: 1.8,
    avgResponse: '2 min',
  },
};

export default function TaxiDriverProfileScreen({ navigation, route }) {
  const driver = MOCK_DRIVER;

  const call = () => Linking.openURL(`tel:${driver.phone}`);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil chauffeur</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            <Text style={{ fontSize: 52 }}>{driver.avatar}</Text>
            <View style={[styles.onlineDot, { backgroundColor: driver.status === 'online' ? COLORS.green : COLORS.muted }]} />
          </View>
          <Text style={styles.driverName}>{driver.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingBig}>⭐ {driver.rating}</Text>
            <Text style={styles.ratingDot}>·</Text>
            <Text style={styles.ridesCount}>{driver.totalRides.toLocaleString()} courses</Text>
          </View>
          <Text style={styles.joinDate}>Chauffeur depuis {driver.joinDate}</Text>
          <View style={styles.badgeRow}>
            {driver.badges.map(b => (
              <View key={b} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Vehicle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Véhicule</Text>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Modèle</Text>
              <Text style={styles.vehicleVal}>{driver.vehicle}</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Plaque</Text>
              <Text style={[styles.vehicleVal, { color: COLORS.accent }]}>{driver.plate}</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Zone</Text>
              <Text style={styles.vehicleVal}>{driver.zone}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistiques</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Taux complétion', value: `${driver.stats.completionRate}%`, color: COLORS.green },
              { label: 'Ponctualité', value: `${driver.stats.onTimeRate}%`, color: COLORS.blue },
              { label: 'Taux annulation', value: `${driver.stats.cancelRate}%`, color: COLORS.muted },
              { label: 'Temps réponse', value: driver.stats.avgResponse, color: COLORS.accent },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Avis récents</Text>
          {driver.reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewClient}>{r.client}</Text>
                <Text style={styles.reviewDate}>{r.date}</Text>
                <Text style={styles.reviewRating}>{'⭐'.repeat(r.rating)}</Text>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callBtn} onPress={call}>
              <Text style={styles.callBtnText}>📞 Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Chat', { name: driver.name, avatar: driver.avatar })}
            >
              <Text style={styles.chatBtnText}>💬 Message</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.reportBtn}>
            <Text style={styles.reportBtnText}>🚩 Signaler ce chauffeur</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  heroCard: {
    alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2, width: 14, height: 14,
    borderRadius: 7, borderWidth: 2, borderColor: COLORS.bg,
  },
  driverName: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  ratingBig: { color: COLORS.accent, fontSize: 18, fontWeight: '800' },
  ratingDot: { color: COLORS.border },
  ridesCount: { color: COLORS.muted, fontSize: 14 },
  joinDate: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border },
  badgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  vehicleCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  vehicleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  vehicleLabel: { color: COLORS.muted, fontSize: 13 },
  vehicleVal: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reviewClient: { color: COLORS.white, fontSize: 13, fontWeight: '700', flex: 1 },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  reviewRating: { fontSize: 12 },
  reviewComment: { color: COLORS.muted, fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  callBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: COLORS.green,
  },
  callBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  chatBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: COLORS.blue,
  },
  chatBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  reportBtn: {
    paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.red + '55', backgroundColor: COLORS.red + '11',
  },
  reportBtnText: { color: COLORS.red, fontSize: 13, fontWeight: '600' },
});
