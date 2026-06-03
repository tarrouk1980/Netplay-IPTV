import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', blue: '#1565C0',
};

const MOCK_STEPS = [
  { key: 'created',    label: 'Colis enregistré',           time: '09:00', done: true },
  { key: 'picked_up',  label: 'Collecté par le livreur',    time: '09:45', done: true },
  { key: 'in_transit', label: 'En transit vers la destination', time: '10:30', done: true },
  { key: 'out',        label: 'En cours de livraison',      time: '11:15', done: false, current: true },
  { key: 'delivered',  label: 'Livré au destinataire',      time: '—',     done: false },
];

const MOCK_PKG = {
  id: 'PKG-00892',
  from: 'Tarek M. — Menzah 6, Tunis',
  to: 'Salma R. — Sfax Centre',
  weight: '1.2 kg',
  type: 'Standard',
  estimatedArrival: 'Aujourd\'hui 12h30 – 13h00',
  livreur: { name: 'Nabil K.', phone: '+216 55 123 456', rating: 4.8 },
};

export default function PackageTrackingScreen({ navigation, route }) {
  const packageId = route?.params?.packageId || MOCK_PKG.id;
  const [pkg, setPkg] = useState(MOCK_PKG);
  const [steps, setSteps] = useState(MOCK_STEPS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/packages/${packageId}/track`);
        if (res.data?.package) setPkg(res.data.package);
        if (res.data?.steps) setSteps(res.data.steps);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [packageId]);

  const currentStep = steps.find((s) => s.current);
  const progress = steps.filter((s) => s.done).length / steps.length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📦 Suivi colis</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Package ID + status */}
          <View style={styles.statusCard}>
            <Text style={styles.pkgId}>{pkg.id}</Text>
            {currentStep && (
              <View style={styles.currentStep}>
                <View style={styles.currentDot} />
                <Text style={styles.currentLabel}>{currentStep.label}</Text>
              </View>
            )}
            <Text style={styles.eta}>🕐 Livraison estimée : {pkg.estimatedArrival}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          {/* Steps timeline */}
          <Text style={styles.sectionLabel}>Étapes</Text>
          <View style={styles.timeline}>
            {steps.map((step, idx) => (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepDot,
                    step.done && styles.stepDotDone,
                    step.current && styles.stepDotCurrent,
                  ]}>
                    {step.done && !step.current && <Text style={{ color: '#000', fontSize: 10, fontWeight: '900' }}>✓</Text>}
                    {step.current && <View style={styles.stepDotInner} />}
                  </View>
                  {idx < steps.length - 1 && (
                    <View style={[styles.stepLine, step.done && styles.stepLineDone]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepLabel, !step.done && !step.current && { color: COLORS.muted }]}>
                    {step.label}
                  </Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Package info */}
          <Text style={styles.sectionLabel}>Informations colis</Text>
          <View style={styles.infoCard}>
            {[
              { icon: '📤', label: 'Expéditeur', value: pkg.from },
              { icon: '📥', label: 'Destinataire', value: pkg.to },
              { icon: '⚖️', label: 'Poids', value: pkg.weight },
              { icon: '📋', label: 'Type', value: pkg.type },
            ].map((row) => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={{ fontSize: 18 }}>{row.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Livreur */}
          {pkg.livreur && (
            <>
              <Text style={styles.sectionLabel}>Votre livreur</Text>
              <View style={styles.livreurCard}>
                <View style={styles.livreurAvatar}>
                  <Text style={{ fontSize: 28 }}>🛵</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.livreurName}>{pkg.livreur.name}</Text>
                  <Text style={styles.livreurRating}>⭐ {pkg.livreur.rating} · Livreur certifié</Text>
                </View>
                <TouchableOpacity style={styles.callBtn}>
                  <Text style={{ fontSize: 20 }}>📞</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  statusCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.accent, padding: 18, marginBottom: 16,
  },
  pkgId: { color: COLORS.accent, fontSize: 20, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  currentStep: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  currentDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  currentLabel: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  eta: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  timeline: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 16 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepLeft: { alignItems: 'center', width: 24 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  stepDotDone: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  stepDotCurrent: { borderColor: COLORS.accent, backgroundColor: 'transparent' },
  stepDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  stepLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  stepLineDone: { backgroundColor: COLORS.green },
  stepContent: { flex: 1, paddingBottom: 20 },
  stepLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  stepTime: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  infoValue: { color: COLORS.white, fontSize: 13, marginTop: 2, fontWeight: '600' },
  livreurCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  livreurAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: COLORS.accent + '22', alignItems: 'center', justifyContent: 'center',
  },
  livreurName: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  livreurRating: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  callBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.green + '22', alignItems: 'center', justifyContent: 'center',
  },
});
