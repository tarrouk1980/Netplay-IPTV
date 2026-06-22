import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', blue: '#1565C0',
};

const STEP_ORDER = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
const STEP_META = {
  PENDING: 'Commande enregistrée',
  ACCEPTED: 'Acceptée par le livreur',
  IN_PROGRESS: 'En cours de livraison',
  COMPLETED: 'Livré au destinataire',
};

export default function PackageTrackingScreen({ navigation, route }) {
  const packageId = route?.params?.packageId;
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!packageId) { setError(true); setLoading(false); return; }
    setLoading(true);
    api.get(`/api/orders/${packageId}`)
      .then(r => { setPkg(r.data.order); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [packageId]);

  useEffect(() => { load(); }, [load]);

  const currentIdx = pkg ? STEP_ORDER.indexOf(pkg.status === 'CANCELLED' ? 'PENDING' : pkg.status) : 0;
  const progress = pkg && pkg.status !== 'CANCELLED' ? (currentIdx + 1) / STEP_ORDER.length : 0;

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
      ) : error || !pkg ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>
            Impossible de charger le suivi de ce colis.
          </Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 14, backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <View style={styles.statusCard}>
            <Text style={styles.pkgId}>#{pkg.id}</Text>
            <View style={styles.currentStep}>
              <View style={styles.currentDot} />
              <Text style={styles.currentLabel}>
                {pkg.status === 'CANCELLED' ? 'Commande annulée' : STEP_META[pkg.status] || pkg.status}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Étapes</Text>
          <View style={styles.timeline}>
            {STEP_ORDER.map((key, idx) => {
              const done = pkg.status !== 'CANCELLED' && idx < currentIdx;
              const current = pkg.status !== 'CANCELLED' && idx === currentIdx;
              return (
                <View key={key} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepDot, done && styles.stepDotDone, current && styles.stepDotCurrent]}>
                      {done && <Text style={{ color: '#000', fontSize: 10, fontWeight: '900' }}>✓</Text>}
                      {current && <View style={styles.stepDotInner} />}
                    </View>
                    {idx < STEP_ORDER.length - 1 && (
                      <View style={[styles.stepLine, done && styles.stepLineDone]} />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, !done && !current && { color: COLORS.muted }]}>
                      {STEP_META[key]}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Informations colis</Text>
          <View style={styles.infoCard}>
            {[
              { icon: '📤', label: 'Adresse de collecte', value: pkg.originAddress || '—' },
              { icon: '📥', label: 'Adresse de livraison', value: pkg.destinationAddress || '—' },
              { icon: '💰', label: 'Montant', value: `${Number(pkg.finalPrice ?? pkg.price ?? 0).toFixed(3)} TND` },
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

          {pkg.provider && (
            <>
              <Text style={styles.sectionLabel}>Votre livreur</Text>
              <View style={styles.livreurCard}>
                <View style={styles.livreurAvatar}>
                  <Text style={{ fontSize: 28 }}>🛵</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.livreurName}>{pkg.provider.name}</Text>
                  {pkg.provider.avgRating != null && (
                    <Text style={styles.livreurRating}>⭐ {pkg.provider.avgRating.toFixed(1)}</Text>
                  )}
                </View>
                {pkg.provider.phone && (
                  <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${pkg.provider.phone}`)}>
                    <Text style={{ fontSize: 20 }}>📞</Text>
                  </TouchableOpacity>
                )}
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
