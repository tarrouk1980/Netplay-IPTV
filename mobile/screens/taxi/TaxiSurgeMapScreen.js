import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
};

// 24 Tunisian wilayas with approximate grid positions
const WILAYAS = [
  { name: 'Tunis', row: 1, col: 3 },
  { name: 'Ariana', row: 0, col: 3 },
  { name: 'Ben Arous', row: 2, col: 3 },
  { name: 'Manouba', row: 1, col: 2 },
  { name: 'Nabeul', row: 1, col: 4 },
  { name: 'Zaghouan', row: 2, col: 4 },
  { name: 'Bizerte', row: 0, col: 2 },
  { name: 'Béja', row: 0, col: 1 },
  { name: 'Jendouba', row: 0, col: 0 },
  { name: 'Le Kef', row: 1, col: 1 },
  { name: 'Siliana', row: 1, col: 2 },
  { name: 'Sousse', row: 3, col: 4 },
  { name: 'Monastir', row: 4, col: 4 },
  { name: 'Mahdia', row: 5, col: 4 },
  { name: 'Sfax', row: 6, col: 3 },
  { name: 'Kairouan', row: 3, col: 3 },
  { name: 'Kasserine', row: 3, col: 2 },
  { name: 'Sidi Bouzid', row: 4, col: 3 },
  { name: 'Gabès', row: 7, col: 3 },
  { name: 'Medenine', row: 8, col: 4 },
  { name: 'Tataouine', row: 9, col: 4 },
  { name: 'Gafsa', row: 5, col: 2 },
  { name: 'Tozeur', row: 6, col: 1 },
  { name: 'Kébili', row: 7, col: 2 },
];

const MOCK_SURGE = {
  Tunis: 2.1,
  Ariana: 1.8,
  'Ben Arous': 1.5,
  Sousse: 1.6,
  Sfax: 1.3,
  Monastir: 1.2,
  Nabeul: 1.9,
};

function surgeColor(mult) {
  if (!mult || mult <= 1.0) return '#1A3A2A';
  if (mult <= 1.3) return '#27AE60';
  if (mult <= 1.6) return '#F57C00';
  if (mult <= 2.0) return '#E65100';
  return '#B71C1C';
}

function surgeLabel(mult) {
  if (!mult || mult <= 1.0) return '×1.0';
  return `×${mult.toFixed(1)}`;
}

export default function TaxiSurgeMapScreen({ navigation }) {
  const [surgeData, setSurgeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/taxi/surge');
      setSurgeData(res.data.surge || MOCK_SURGE);
    } catch {
      setSurgeData(MOCK_SURGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build grid
  const maxRow = Math.max(...WILAYAS.map((w) => w.row));
  const maxCol = Math.max(...WILAYAS.map((w) => w.col));
  const grid = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(null));
  WILAYAS.forEach((w) => { grid[w.row][w.col] = w; });

  const activeZones = WILAYAS.filter((w) => (surgeData[w.name] || 0) > 1.0).length;
  const maxSurge = Math.max(...Object.values(surgeData), 1);

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>🗺 Zones de tarification</Text>
          <Text style={s.sub}>{activeZones} zone{activeZones !== 1 ? 's' : ''} en surcharge</Text>
        </View>
        <TouchableOpacity onPress={load}>
          <Text style={s.refresh}>↺</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Legend */}
        <View style={s.legendRow}>
          {[
            { label: 'Normal', color: '#1A3A2A' },
            { label: '×1.3', color: COLORS.green },
            { label: '×1.6', color: COLORS.orange },
            { label: '×2.0', color: '#E65100' },
            { label: '×2.0+', color: '#B71C1C' },
          ].map((l) => (
            <View key={l.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: l.color }]} />
              <Text style={s.legendLbl}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Grid map */}
        <View style={s.mapCard}>
          {grid.map((row, ri) => (
            <View key={ri} style={s.gridRow}>
              {row.map((cell, ci) => (
                <TouchableOpacity
                  key={ci}
                  style={[
                    s.cell,
                    cell ? { backgroundColor: surgeColor(surgeData[cell.name]) } : s.cellEmpty,
                    selected?.name === cell?.name && s.cellSelected,
                  ]}
                  onPress={() => cell && setSelected(selected?.name === cell.name ? null : cell)}
                  disabled={!cell}
                  activeOpacity={cell ? 0.7 : 1}
                >
                  {cell && (
                    <>
                      <Text style={s.cellName} numberOfLines={1}>{cell.name.split(' ')[0]}</Text>
                      {surgeData[cell.name] > 1.0 && (
                        <Text style={s.cellMult}>{surgeLabel(surgeData[cell.name])}</Text>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Selected zone detail */}
        {selected && (
          <View style={s.detailCard}>
            <Text style={s.detailTitle}>📍 {selected.name}</Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <View>
                <Text style={s.detailLbl}>Multiplicateur actuel</Text>
                <Text style={[s.detailVal, { color: surgeColor(surgeData[selected.name]) === '#1A3A2A' ? COLORS.green : surgeColor(surgeData[selected.name]) }]}>
                  {surgeLabel(surgeData[selected.name] || 1)}
                </Text>
              </View>
              <View>
                <Text style={s.detailLbl}>Tarif base taxi</Text>
                <Text style={s.detailVal}>{((surgeData[selected.name] || 1) * 0.5).toFixed(2)} TND/km</Text>
              </View>
            </View>
            {(surgeData[selected.name] || 1) > 1.5 && (
              <Text style={s.surgeWarn}>⚠️ Zone en forte demande. Les courses sont plus chères.</Text>
            )}
          </View>
        )}

        {/* Top surge zones list */}
        <Text style={s.sectionTitle}>Zones les plus actives</Text>
        {Object.entries(surgeData)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, mult]) => (
            <View key={name} style={s.zoneRow}>
              <Text style={s.zoneName}>📍 {name}</Text>
              <View style={s.zoneBar}>
                <View style={[s.zoneBarFill, { width: `${((mult - 1) / (maxSurge - 1)) * 100}%`, backgroundColor: surgeColor(mult) }]} />
              </View>
              <Text style={[s.zoneMult, { color: surgeColor(mult) }]}>{surgeLabel(mult)}</Text>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  refresh: { color: COLORS.orange, fontSize: 22, fontWeight: '300' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLbl: { color: COLORS.muted, fontSize: 10 },
  mapCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  gridRow: { flexDirection: 'row', gap: 3, marginBottom: 3 },
  cell: { flex: 1, height: 44, borderRadius: 6, alignItems: 'center', justifyContent: 'center', padding: 2 },
  cellEmpty: { backgroundColor: 'transparent' },
  cellSelected: { borderWidth: 2, borderColor: COLORS.orange },
  cellName: { color: '#FFF', fontSize: 8, fontWeight: '600', textAlign: 'center' },
  cellMult: { color: '#FFD700', fontSize: 8, fontWeight: '800' },
  detailCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.orange + '66' },
  detailTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  detailLbl: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  detailVal: { fontSize: 18, fontWeight: '800' },
  surgeWarn: { color: COLORS.orange, fontSize: 11, marginTop: 8 },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  zoneName: { color: COLORS.text, fontSize: 12, width: 80 },
  zoneBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  zoneBarFill: { height: '100%', borderRadius: 3 },
  zoneMult: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
});
