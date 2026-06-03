import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceIcon from '../../components/ServiceIcon';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  blue: '#1565C0', blueLight: '#42A5F5', bluePale: '#0D2137',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', accent: '#F5A623',
};

const FEATURES = [
  { emoji: '♿', title: 'Véhicules adaptés PMR', desc: 'Rampes d\'accès, espace fauteuil roulant, sangles de fixation certifiées.' },
  { emoji: '🧑‍🦽', title: 'Conducteurs formés', desc: 'Tous nos chauffeurs EasyAccess ont suivi une formation aide à la personne.' },
  { emoji: '🔉', title: 'Assistance vocale', desc: 'Interface vocale pour les personnes malvoyantes. Compatible avec lecteurs d\'écran.' },
  { emoji: '📞', title: 'Réservation simplifiée', desc: 'Assistance téléphonique disponible 24h/24 pour les réservations.' },
  { emoji: '⏰', title: 'Ponctualité garantie', desc: 'Engagement de ponctualité ou course offerte. Délai max 10 min.' },
  { emoji: '🏥', title: 'Transport médical', desc: 'Pour rendez-vous médicaux, dialyse, rééducation — prise en charge assurance.' },
];

const VEHICLE_TYPES = [
  {
    id: 'PMR_STD',
    name: 'Taxi PMR Standard',
    desc: 'Rampe manuelle, 1 fauteuil roulant',
    emoji: '🚐',
    price: '5.00 TND',
    perKm: '+ 1.80 TND/km',
    wait: '~8 min',
  },
  {
    id: 'PMR_VAN',
    name: 'Van PMR Électrique',
    desc: 'Rampe électrique, 2 fauteuils, silencieux',
    emoji: '🚌',
    price: '7.50 TND',
    perKm: '+ 2.20 TND/km',
    wait: '~12 min',
  },
  {
    id: 'MEDICAL',
    name: 'Transport Médical',
    desc: 'Civière, oxygène, aide soignant en option',
    emoji: '🏥',
    price: 'Sur devis',
    perKm: 'Forfait établissement',
    wait: '~20 min',
  },
];

const DRIVERS = [
  { name: 'Mohamed R.', rating: 4.9, trips: 820, cert: 'Auxiliaire de vie', available: true },
  { name: 'Hassen B.', rating: 5.0, trips: 1340, cert: 'Aide-soignant', available: true },
  { name: 'Karim A.', rating: 4.8, trips: 560, cert: 'Auxiliaire de vie', available: false },
];

export default function EasyAccessScreen({ navigation }) {
  const [tab, setTab] = useState('info');
  const [selectedVehicle, setSelectedVehicle] = useState('PMR_STD');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>♿ EasyAccess</Text>
          <Text style={styles.headerSub}>Transport adapté PMR & mobilité réduite</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={{ fontSize: 32 }}>♿</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Mobilité pour tous</Text>
          <Text style={styles.bannerSub}>Véhicules 100% adaptés · Conducteurs certifiés · Disponible 24h/24</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'info', label: '📋 Services' },
          { key: 'vehicules', label: '🚐 Véhicules' },
          { key: 'chauffeurs', label: '👨‍✈️ Équipe' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {tab === 'info' && (
          <View style={{ padding: 16, gap: 10 }}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
            <View style={styles.certBox}>
              <Text style={styles.certTitle}>🏆 Certifié Ministère du Transport</Text>
              <Text style={styles.certSub}>EASYWAY Access est agréé par le Ministère du Transport Tunisien pour le transport adapté aux personnes à mobilité réduite.</Text>
            </View>
          </View>
        )}

        {tab === 'vehicules' && (
          <View style={{ padding: 16, gap: 12 }}>
            {VEHICLE_TYPES.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.vehicleCard, selectedVehicle === v.id && styles.vehicleCardActive]}
                onPress={() => setSelectedVehicle(v.id)}
              >
                <View style={styles.vehicleTop}>
                  <Text style={{ fontSize: 36 }}>{v.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.vehicleName, selectedVehicle === v.id && { color: '#000' }]}>{v.name}</Text>
                    <Text style={[styles.vehicleDesc, selectedVehicle === v.id && { color: 'rgba(0,0,0,0.6)' }]}>{v.desc}</Text>
                  </View>
                  {selectedVehicle === v.id && (
                    <View style={styles.checkCircle}>
                      <Text style={{ color: COLORS.blue, fontSize: 16 }}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.vehicleFooter}>
                  <Text style={[styles.vehiclePrice, selectedVehicle === v.id && { color: '#000' }]}>{v.price}</Text>
                  <Text style={[styles.vehicleKm, selectedVehicle === v.id && { color: 'rgba(0,0,0,0.6)' }]}>{v.perKm}</Text>
                  <Text style={[styles.vehicleWait, selectedVehicle === v.id && { color: 'rgba(0,0,0,0.7)' }]}>⏱ {v.wait}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tab === 'chauffeurs' && (
          <View style={{ padding: 16, gap: 12 }}>
            <Text style={styles.teamNote}>Tous nos chauffeurs EasyAccess sont certifiés et régulièrement évalués.</Text>
            {DRIVERS.map((d, i) => (
              <View key={i} style={[styles.driverCard, !d.available && { opacity: 0.5 }]}>
                <View style={styles.driverAvatar}>
                  <Text style={{ fontSize: 28 }}>👨‍✈️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.driverName}>{d.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: d.available ? '#1A2A1A' : '#2A1A1A' }]}>
                      <Text style={{ color: d.available ? COLORS.green : COLORS.muted, fontSize: 11, fontWeight: '700' }}>
                        {d.available ? '● Disponible' : '○ En service'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.driverCert}>🏥 {d.cert}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    <Text style={styles.driverStat}>⭐ {d.rating}</Text>
                    <Text style={styles.driverStat}>{d.trips} courses</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('TaxiRequest', { taxiType: 'EASYACCESS' })}
        >
          <Text style={styles.bookBtnText}>♿ Réserver EasyAccess</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Alert.alert('Assistance', 'Appel du service EasyAccess : +216 XX XXX XXX\n(Disponible 24h/24)')}
        >
          <Text style={styles.callBtnText}>📞 Assistance téléphonique</Text>
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
    backgroundColor: COLORS.bluePale, margin: 16, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.blue,
  },
  bannerTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  bannerSub: { color: COLORS.blueLight, fontSize: 12, marginTop: 3 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.blueLight, borderColor: COLORS.blueLight },
  tabText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  featureCard: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  featureEmoji: { fontSize: 26 },
  featureTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  featureDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  certBox: {
    backgroundColor: COLORS.bluePale, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.blue, marginTop: 6,
  },
  certTitle: { color: COLORS.blueLight, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  certSub: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  vehicleCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  vehicleCardActive: { backgroundColor: COLORS.blueLight, borderColor: COLORS.blueLight },
  vehicleTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  vehicleName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  vehicleDesc: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  vehicleFooter: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  vehiclePrice: { color: COLORS.blue, fontSize: 16, fontWeight: '700' },
  vehicleKm: { color: COLORS.muted, fontSize: 12 },
  vehicleWait: { color: COLORS.muted, fontSize: 12, marginLeft: 'auto' },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  teamNote: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  driverCard: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  driverAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.bluePale, alignItems: 'center', justifyContent: 'center',
  },
  driverName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  driverCert: { color: COLORS.blueLight, fontSize: 12, marginTop: 3 },
  driverStat: { color: COLORS.muted, fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, gap: 10, backgroundColor: COLORS.bg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  bookBtn: {
    backgroundColor: COLORS.blue, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  bookBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  callBtn: {
    borderWidth: 1, borderColor: COLORS.blue, borderRadius: 14,
    paddingVertical: 12, alignItems: 'center',
  },
  callBtnText: { color: COLORS.blueLight, fontSize: 14, fontWeight: '600' },
});
