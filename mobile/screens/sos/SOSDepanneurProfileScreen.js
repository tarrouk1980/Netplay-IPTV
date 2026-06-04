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

const MOCK = {
  name: 'Karim SOS Express',
  avatar: '🔧',
  rating: 4.8,
  totalJobs: 934,
  joinDate: 'Mars 2023',
  phone: '+216 55 771 229',
  zone: 'Grand Tunis',
  status: 'online',
  vehicle: 'Dépanneuse Renault Master',
  plate: 'TUN-8821',
  specialities: ['Crevaison', 'Panne batterie', 'Accident', 'Remorquage'],
  badges: ['⚡ Réponse rapide', '🏆 Expert certifié', '🔒 Vérifié'],
  avgResponse: '6 min',
  completionRate: 97.4,
  reviews: [
    { client: 'Sana B.', rating: 5, comment: 'Arrivé en 7 minutes, très professionnel.', date: 'Auj.' },
    { client: 'Youssef T.', rating: 5, comment: 'Excellent service, prix correct.', date: 'Hier' },
    { client: 'Ines K.', rating: 4, comment: 'Bon dépannage, léger retard.', date: '01/06' },
  ],
  tariffs: [
    { service: 'Crevaison', price: '35 – 60 TND' },
    { service: 'Panne batterie', price: '45 – 80 TND' },
    { service: 'Remorquage (< 10 km)', price: '80 – 120 TND' },
    { service: 'Remorquage (10-30 km)', price: '120 – 200 TND' },
  ],
};

export default function SOSDepanneurProfileScreen({ navigation, route }) {
  const dep = MOCK;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil dépanneur</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            <Text style={{ fontSize: 52 }}>{dep.avatar}</Text>
            <View style={[styles.onlineDot, { backgroundColor: dep.status === 'online' ? COLORS.green : COLORS.muted }]} />
          </View>
          <Text style={styles.depName}>{dep.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingBig}>⭐ {dep.rating}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.jobsCount}>{dep.totalJobs.toLocaleString()} interventions</Text>
          </View>
          <Text style={styles.joinDate}>Actif depuis {dep.joinDate}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={[styles.statVal, { color: COLORS.green }]}>{dep.avgResponse}</Text>
              <Text style={styles.statLbl}>Réponse moy.</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={[styles.statVal, { color: COLORS.blue }]}>{dep.completionRate}%</Text>
              <Text style={styles.statLbl}>Complétion</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: dep.status === 'online' ? COLORS.green + '22' : COLORS.border }]}>
              <Text style={[styles.statVal, { color: dep.status === 'online' ? COLORS.green : COLORS.muted }]}>
                {dep.status === 'online' ? 'EN LIGNE' : 'HORS LIGNE'}
              </Text>
              <Text style={styles.statLbl}>Statut</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            {dep.badges.map(b => (
              <View key={b} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>
            ))}
          </View>
        </View>

        {/* Specialities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Spécialités</Text>
          <View style={styles.specsRow}>
            {dep.specialities.map(s => (
              <View key={s} style={styles.specChip}>
                <Text style={styles.specText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Vehicle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚛 Véhicule d'intervention</Text>
          <View style={styles.vehicleCard}>
            <Text style={styles.vehicleInfo}>{dep.vehicle}</Text>
            <Text style={[styles.vehicleInfo, { color: COLORS.accent }]}>{dep.plate}</Text>
            <Text style={styles.vehicleZone}>📍 Zone : {dep.zone}</Text>
          </View>
        </View>

        {/* Tariffs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Tarifs indicatifs</Text>
          {dep.tariffs.map(t => (
            <View key={t.service} style={styles.tariffRow}>
              <Text style={styles.tariffService}>{t.service}</Text>
              <Text style={styles.tariffPrice}>{t.price}</Text>
            </View>
          ))}
          <Text style={styles.tariffNote}>* Les prix finaux peuvent varier selon la situation.</Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Avis clients</Text>
          {dep.reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewClient}>{r.client}</Text>
                <Text style={styles.reviewDate}>{r.date}</Text>
                <Text style={{ fontSize: 12 }}>{'⭐'.repeat(r.rating)}</Text>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${dep.phone}`)}
        >
          <Text style={styles.callBtnText}>📞 Appeler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sosBtn}
          onPress={() => navigation.navigate('SOSRequest', { depanneurId: dep.id })}
        >
          <Text style={styles.sosBtnText}>🆘 Demander intervention</Text>
        </TouchableOpacity>
      </View>
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
  heroCard: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: COLORS.bg },
  depName: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  ratingBig: { color: COLORS.accent, fontSize: 18, fontWeight: '800' },
  dot: { color: COLORS.border },
  jobsCount: { color: COLORS.muted, fontSize: 14 },
  joinDate: { color: COLORS.muted, fontSize: 12, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statChip: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 90, borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  statLbl: { color: COLORS.muted, fontSize: 9 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border },
  badgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  specsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specChip: { backgroundColor: COLORS.orange + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.orange + '55' },
  specText: { color: COLORS.orange, fontSize: 12, fontWeight: '700' },
  vehicleCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  vehicleInfo: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  vehicleZone: { color: COLORS.muted, fontSize: 13 },
  tariffRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  tariffService: { color: COLORS.white, fontSize: 13 },
  tariffPrice: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
  tariffNote: { color: COLORS.muted, fontSize: 11, marginTop: 6 },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reviewClient: { color: COLORS.white, fontSize: 13, fontWeight: '700', flex: 1 },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  reviewComment: { color: COLORS.muted, fontSize: 13 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  callBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.green },
  callBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  sosBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.accent },
  sosBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
