import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EasywayLogo from '../../components/EasywayLogo';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  pink: '#E91E8C', pinkDark: '#AD1457', pinkLight: '#F48FB1',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', accent: '#F5A623',
};

const FEATURES = [
  { emoji: '👩‍✈️', title: 'Conductrices certifiées', desc: 'Toutes nos conductrices EasyLady sont vérifiées, formées et notées par nos clientes.' },
  { emoji: '🔒', title: 'Trajet 100% sécurisé', desc: 'Partage de trajet en temps réel avec un proche. Bouton SOS intégré.' },
  { emoji: '📱', title: 'Sans contact masculin', desc: 'De la commande à la destination — chauffeure, service client, tout au féminin.' },
  { emoji: '⭐', title: 'Noté 4.9/5', desc: 'Le service le mieux noté de la plateforme EASYWAY.' },
];

const DRIVERS = [
  { name: 'Fatma B.', zone: 'Tunis Centre', rating: 4.9, trips: 1240, vehicle: 'Clio 5 Blanche', available: true },
  { name: 'Sarra M.', zone: 'La Marsa', rating: 5.0, trips: 876, vehicle: 'Polo Grise', available: true },
  { name: 'Ines K.', zone: 'Ariana', rating: 4.8, trips: 2103, vehicle: 'Yaris Bleue', available: false },
  { name: 'Amira T.', zone: 'Menzah', rating: 4.9, trips: 567, vehicle: 'Clio 4 Rouge', available: true },
];

const TARIFS = [
  { label: 'Course standard', price: '3.50 TND', detail: '+ 1.50 TND/km' },
  { label: 'Course nuit (22h–6h)', price: '5.00 TND', detail: '+ 2.00 TND/km' },
  { label: 'Aéroport', price: 'Forfait 35 TND', detail: 'Tunis-Carthage inclus' },
  { label: 'EasyLady VIP', price: '8.00 TND', detail: 'Climatisation + eau offerte' },
];

export default function EasyLadyScreen({ navigation }) {
  const [tab, setTab] = useState('info');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>👩‍✈️ EasyLady</Text>
          <Text style={styles.headerSub}>Service taxi exclusivement féminin</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerEmoji}>♀️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Conductrices exclusivement féminines</Text>
          <Text style={styles.bannerSub}>Sécurité, confort et confiance — réservé aux femmes</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['info', 'conductrices', 'tarifs'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && { color: '#000' }]}>
              {t === 'info' ? '📋 Info' : t === 'conductrices' ? '👩‍✈️ Conductrices' : '💰 Tarifs'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {tab === 'info' && (
          <View style={{ padding: 16 }}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
            <View style={styles.statRow}>
              {[
                { n: '2 400+', l: 'Courses' },
                { n: '4.9', l: 'Note moy.' },
                { n: '98%', l: 'Satisfaction' },
                { n: '24/7', l: 'Disponible' },
              ].map((s, i) => (
                <View key={i} style={styles.statBox}>
                  <Text style={styles.statNum}>{s.n}</Text>
                  <Text style={styles.statLbl}>{s.l}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === 'conductrices' && (
          <View style={{ padding: 16, gap: 12 }}>
            {DRIVERS.map((d, i) => (
              <View key={i} style={styles.driverCard}>
                <View style={[styles.driverAvatar, { backgroundColor: d.available ? '#1A2A1A' : '#2A1A1A' }]}>
                  <Text style={{ fontSize: 30 }}>👩‍✈️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.driverHeader}>
                    <Text style={styles.driverName}>{d.name}</Text>
                    <View style={[styles.driverStatus, { backgroundColor: d.available ? '#1A2A1A' : '#2A1A1A' }]}>
                      <Text style={{ color: d.available ? COLORS.green : COLORS.muted, fontSize: 11, fontWeight: '700' }}>
                        {d.available ? '● Disponible' : '○ Occupée'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.driverZone}>📍 {d.zone}</Text>
                  <Text style={styles.driverVehicle}>🚗 {d.vehicle}</Text>
                  <View style={styles.driverMeta}>
                    <Text style={styles.driverRating}>⭐ {d.rating}</Text>
                    <Text style={styles.driverTrips}>{d.trips} courses</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === 'tarifs' && (
          <View style={{ padding: 16, gap: 10 }}>
            {TARIFS.map((t, i) => (
              <View key={i} style={styles.tarifRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tarifLabel}>{t.label}</Text>
                  <Text style={styles.tarifDetail}>{t.detail}</Text>
                </View>
                <Text style={styles.tarifPrice}>{t.price}</Text>
              </View>
            ))}
            <View style={styles.promoBox}>
              <Text style={styles.promoText}>🎁 Code promo premier trajet : <Text style={{ color: COLORS.pink, fontWeight: '700' }}>LADY10</Text></Text>
              <Text style={styles.promoSub}>-10% sur votre première course EasyLady</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('TaxiRequest', { taxiType: 'EASYLADY' })}
        >
          <Text style={styles.bookBtnText}>👩‍✈️ Réserver EasyLady</Text>
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
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1A0A12', margin: 16, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.pink,
  },
  bannerEmoji: { fontSize: 36 },
  bannerTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  bannerSub: { color: COLORS.pinkLight, fontSize: 12, marginTop: 3 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.pink, borderColor: COLORS.pink },
  tabText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  featureCard: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  featureEmoji: { fontSize: 28 },
  featureTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  featureDesc: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  statBox: {
    flex: 1, backgroundColor: '#1A0A12', borderRadius: 10,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.pink,
  },
  statNum: { color: COLORS.pink, fontSize: 20, fontWeight: '900' },
  statLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  driverCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  driverAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  driverHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  driverStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  driverZone: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  driverVehicle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  driverMeta: { flexDirection: 'row', gap: 10, marginTop: 6 },
  driverRating: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  driverTrips: { color: COLORS.muted, fontSize: 12 },
  tarifRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  tarifLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  tarifDetail: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  tarifPrice: { color: COLORS.pink, fontSize: 16, fontWeight: '700' },
  promoBox: {
    backgroundColor: '#1A0A12', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.pink, marginTop: 8,
  },
  promoText: { color: COLORS.white, fontSize: 14 },
  promoSub: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  bookBtn: {
    backgroundColor: COLORS.pink, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  bookBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
