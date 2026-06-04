import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_VEHICLES = [
  {
    id: 1, driver: 'Achraf B.', plate: 'TUN-2234', model: 'Renault Clio 5',
    lastInspection: '12/03/2025', nextInspection: '12/03/2026', status: 'valid',
    score: 95, issues: [],
  },
  {
    id: 2, driver: 'Mohamed S.', plate: 'ARI-7712', model: 'Peugeot 208',
    lastInspection: '01/11/2024', nextInspection: '01/11/2025', status: 'expired',
    score: 52, issues: ['Vignette technique expirée', 'Pneus usés (avant gauche)'],
  },
  {
    id: 3, driver: 'Amine K.', plate: 'SFX-4401', model: 'Dacia Logan',
    lastInspection: '20/05/2025', nextInspection: '20/05/2026', status: 'warning',
    score: 78, issues: ['Assurance expire dans 15 jours'],
  },
  {
    id: 4, driver: 'Sami T.', plate: 'BIZ-9902', model: 'Volkswagen Polo',
    lastInspection: '15/01/2025', nextInspection: '15/01/2026', status: 'valid',
    score: 100, issues: [],
  },
];

const STATUS_META = {
  valid:   { label: 'Conforme',  color: COLORS.green,  bg: '#0D2E0D' },
  warning: { label: 'Attention', color: COLORS.orange, bg: '#1A100A' },
  expired: { label: 'Expiré',   color: COLORS.red,    bg: '#1A0808' },
};

export default function AdminVehicleInspectionScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = MOCK_VEHICLES.filter(v => {
    const matchSearch = !search ||
      v.driver.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    valid: MOCK_VEHICLES.filter(v => v.status === 'valid').length,
    warning: MOCK_VEHICLES.filter(v => v.status === 'warning').length,
    expired: MOCK_VEHICLES.filter(v => v.status === 'expired').length,
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection véhicules</Text>
        <TouchableOpacity>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Row */}
      <View style={styles.kpiRow}>
        {[
          { label: 'Conformes', count: stats.valid, color: COLORS.green },
          { label: 'Attention', count: stats.warning, color: COLORS.orange },
          { label: 'Expirés', count: stats.expired, color: COLORS.red },
        ].map((k) => (
          <View key={k.label} style={[styles.kpiCard, { borderColor: k.color + '44' }]}>
            <Text style={[styles.kpiNum, { color: k.color }]}>{k.count}</Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={{ color: COLORS.muted }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Chauffeur ou plaque..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {[['all', 'Tous'], ['valid', 'Conformes'], ['warning', 'Attention'], ['expired', 'Expirés']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.filterChip, filterStatus === val && styles.filterChipActive]}
            onPress={() => setFilterStatus(val)}
          >
            <Text style={[styles.filterText, filterStatus === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {filtered.map((v) => {
          const meta = STATUS_META[v.status];
          const isSelected = selected === v.id;
          return (
            <TouchableOpacity
              key={v.id}
              style={[styles.card, { borderColor: meta.color + '55' }]}
              onPress={() => setSelected(isSelected ? null : v.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.driverName}>{v.driver}</Text>
                  <Text style={styles.vehicleInfo}>{v.model} · {v.plate}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              {/* Score bar */}
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Score</Text>
                <View style={styles.scoreBarWrap}>
                  <View style={[
                    styles.scoreBar,
                    { width: `${v.score}%`, backgroundColor: v.score >= 90 ? COLORS.green : v.score >= 70 ? COLORS.orange : COLORS.red }
                  ]} />
                </View>
                <Text style={[styles.scoreNum, { color: meta.color }]}>{v.score}%</Text>
              </View>

              <View style={styles.inspectionDates}>
                <Text style={styles.dateText}>Dernière : {v.lastInspection}</Text>
                <Text style={[styles.dateText, v.status === 'expired' && { color: COLORS.red }]}>
                  Prochaine : {v.nextInspection}
                </Text>
              </View>

              {isSelected && (
                <View style={styles.detailPanel}>
                  {v.issues.length > 0 ? (
                    <>
                      <Text style={styles.issuesTitle}>⚠️ Problèmes détectés :</Text>
                      {v.issues.map((issue, i) => (
                        <Text key={i} style={styles.issueItem}>· {issue}</Text>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.noIssues}>✅ Aucun problème détecté</Text>
                  )}
                  <View style={styles.actionBtns}>
                    <TouchableOpacity style={styles.notifyBtn}>
                      <Text style={styles.notifyBtnText}>📩 Notifier chauffeur</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.suspendBtn}>
                      <Text style={styles.suspendBtnText}>🚫 Suspendre</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  kpiRow: { flexDirection: 'row', gap: 8, padding: 16 },
  kpiCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1,
  },
  kpiNum: { fontSize: 22, fontWeight: '900' },
  kpiLabel: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  driverName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  vehicleInfo: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  scoreLabel: { color: COLORS.muted, fontSize: 12, width: 40 },
  scoreBarWrap: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  scoreBar: { height: '100%', borderRadius: 3 },
  scoreNum: { fontSize: 13, fontWeight: '800', width: 36, textAlign: 'right' },
  inspectionDates: { flexDirection: 'row', justifyContent: 'space-between' },
  dateText: { color: COLORS.muted, fontSize: 11 },
  detailPanel: {
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  issuesTitle: { color: COLORS.orange, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  issueItem: { color: COLORS.muted, fontSize: 12, marginBottom: 3 },
  noIssues: { color: COLORS.green, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  actionBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  notifyBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.blue + '22', borderWidth: 1, borderColor: COLORS.blue,
  },
  notifyBtnText: { color: COLORS.blue, fontSize: 12, fontWeight: '600' },
  suspendBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.red + '22', borderWidth: 1, borderColor: COLORS.red,
  },
  suspendBtnText: { color: COLORS.red, fontSize: 12, fontWeight: '600' },
});
