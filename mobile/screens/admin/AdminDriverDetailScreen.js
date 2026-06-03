import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22', purple: '#9B59B6',
};

const MOCK_DRIVER = {
  id: 'DRV-0087',
  name: 'Achraf Bouaziz',
  phone: '+216 20 444 555',
  email: 'achraf.b@easyway.tn',
  status: 'online',
  verifiedKYC: true,
  joinedAt: '12/01/2024',
  serviceType: 'TAXI',
  zone: 'Tunis Centre',
  vehicle: { make: 'Renault', model: 'Clio 5', color: 'Grise', plate: 'TUN-2234', year: 2022 },
  rating: 4.9,
  totalRides: 1240,
  totalEarnings: 8420.50,
  thisMonth: 1604.50,
  cancelRate: '2.1%',
  completionRate: '97.9%',
  avgResponseTime: '4s',
  incidents: 1,
  warnings: 0,
  lastRide: '03/06/2024 à 14:28',
  documents: [
    { label: 'CIN', status: 'valid' },
    { label: 'Permis B', status: 'valid' },
    { label: 'Assurance', status: 'expiring' },
    { label: 'Carte grise', status: 'valid' },
    { label: 'Visite technique', status: 'valid' },
  ],
};

const DOC_STATUS = {
  valid: { label: 'Valide', color: COLORS.green, bg: '#0D2E0D' },
  expiring: { label: 'Expire bientôt', color: COLORS.orange, bg: '#2A1A08' },
  expired: { label: 'Expiré', color: COLORS.red, bg: '#1A0808' },
  missing: { label: 'Manquant', color: COLORS.red, bg: '#1A0808' },
};

const DRIVER_STATUS = {
  online: { label: 'En ligne', color: COLORS.green, bg: '#0D2E0D' },
  offline: { label: 'Hors ligne', color: COLORS.muted, bg: COLORS.surfaceAlt },
  on_ride: { label: 'En course', color: COLORS.accent, bg: '#2A1E0A' },
  suspended: { label: 'Suspendu', color: COLORS.red, bg: '#1A0808' },
};

export default function AdminDriverDetailScreen({ navigation, route }) {
  const driver = route.params?.driver || MOCK_DRIVER;
  const [tab, setTab] = useState('info');

  const ds = DRIVER_STATUS[driver.status] || DRIVER_STATUS.offline;

  const handleAction = (action) => {
    Alert.alert(
      action,
      `Confirmer : ${action} pour ${driver.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', style: action.includes('Suspend') ? 'destructive' : 'default', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil chauffeur</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Driver Identity */}
      <View style={styles.identityCard}>
        <View style={styles.driverAvatar}>
          <Text style={{ fontSize: 32 }}>🧔</Text>
          {driver.verifiedKYC && (
            <View style={styles.kycBadge}>
              <Text style={{ fontSize: 10 }}>✓</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverId}>{driver.id} · {driver.serviceType}</Text>
          <Text style={styles.driverPhone}>{driver.phone}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <View style={[styles.statusBadge, { backgroundColor: ds.bg }]}>
            <Text style={[styles.statusText, { color: ds.color }]}>● {ds.label}</Text>
          </View>
          <Text style={styles.ratingText}>⭐ {driver.rating}</Text>
        </View>
      </View>

      {/* KPI Row */}
      <View style={styles.kpiRow}>
        {[
          { v: driver.totalRides, l: 'Courses' },
          { v: `${driver.totalEarnings.toFixed(0)} TND`, l: 'Gains total' },
          { v: driver.completionRate, l: 'Complétion' },
          { v: driver.cancelRate, l: 'Annulation' },
        ].map((k, i) => (
          <View key={i} style={styles.kpiCard}>
            <Text style={styles.kpiVal}>{k.v}</Text>
            <Text style={styles.kpiLbl}>{k.l}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { id: 'info', label: '📋 Infos' },
          { id: 'docs', label: '📄 Documents' },
          { id: 'actions', label: '⚙️ Actions' },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, tab === t.id && styles.tabActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabText, tab === t.id && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {tab === 'info' && (
          <View style={styles.tabContent}>
            {/* Vehicle */}
            <Text style={styles.groupTitle}>🚗 Véhicule</Text>
            <View style={styles.infoCard}>
              {[
                ['Marque / Modèle', `${driver.vehicle.make} ${driver.vehicle.model}`],
                ['Couleur', driver.vehicle.color],
                ['Plaque', driver.vehicle.plate],
                ['Année', String(driver.vehicle.year)],
              ].map(([l, v]) => (
                <View key={l} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{l}</Text>
                  <Text style={styles.infoValue}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Stats */}
            <Text style={styles.groupTitle}>📊 Statistiques</Text>
            <View style={styles.infoCard}>
              {[
                ['Zone de travail', driver.zone],
                ['Temps de réponse', driver.avgResponseTime],
                ['Incidents signalés', String(driver.incidents)],
                ['Avertissements', String(driver.warnings)],
                ['Gains ce mois', `${driver.thisMonth.toFixed(2)} TND`],
                ['Dernière course', driver.lastRide],
                ['Membre depuis', driver.joinedAt],
              ].map(([l, v]) => (
                <View key={l} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{l}</Text>
                  <Text style={[styles.infoValue, l === 'Incidents signalés' && driver.incidents > 0 && { color: COLORS.orange }]}>
                    {v}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === 'docs' && (
          <View style={styles.tabContent}>
            {driver.documents.map((doc) => {
              const ds2 = DOC_STATUS[doc.status];
              return (
                <View key={doc.label} style={styles.docRow}>
                  <Text style={styles.docLabel}>📄 {doc.label}</Text>
                  <View style={[styles.docBadge, { backgroundColor: ds2.bg }]}>
                    <Text style={[styles.docStatus, { color: ds2.color }]}>{ds2.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {tab === 'actions' && (
          <View style={styles.tabContent}>
            {[
              { label: '💬 Envoyer un message', color: COLORS.blue, action: 'Message' },
              { label: '⚠️ Envoyer un avertissement', color: COLORS.orange, action: 'Avertissement' },
              { label: '🔒 Suspendre le compte', color: COLORS.red, action: 'Suspension' },
              { label: '✅ Activer / Réactiver', color: COLORS.green, action: 'Activation' },
              { label: '🗑 Supprimer le compte', color: COLORS.red, action: 'Suppression' },
            ].map((a) => (
              <TouchableOpacity
                key={a.action}
                style={[styles.actionBtn, { borderColor: a.color + '55' }]}
                onPress={() => handleAction(a.action)}
              >
                <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
                <Text style={{ color: a.color, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  identityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  driverAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent,
  },
  kycBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.bg,
  },
  driverName: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  driverId: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  driverPhone: { color: COLORS.muted, fontSize: 12, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  ratingText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  kpiRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12,
  },
  kpiCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  kpiVal: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  kpiLbl: { color: COLORS.muted, fontSize: 9, marginTop: 3, textAlign: 'center' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  tabContent: { paddingHorizontal: 16, paddingTop: 8 },
  groupTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  infoCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.muted, fontSize: 13 },
  infoValue: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  docRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  docLabel: { color: COLORS.white, fontSize: 14 },
  docBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  docStatus: { fontSize: 12, fontWeight: '700' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    marginBottom: 8, borderWidth: 1,
  },
  actionLabel: { fontSize: 14, fontWeight: '600' },
});
