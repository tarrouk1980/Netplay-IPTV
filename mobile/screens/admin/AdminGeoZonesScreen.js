import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

export default function AdminGeoZonesScreen({ navigation }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [editSurcharge, setEditSurcharge] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/api/admin/zones')
      .then(r => setZones(r.data?.zones || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase()));

  const toggleZone = async (zone) => {
    const previous = zones;
    const updated = zones.map(z => z.name === zone.name ? { ...z, enabled: !z.enabled } : z);
    setZones(updated);
    try {
      await api.patch(`/api/admin/zones/${encodeURIComponent(zone.name)}/toggle`, { enabled: !zone.enabled });
    } catch {
      setZones(previous);
      Alert.alert('Erreur', 'Impossible de mettre à jour la zone. Réessayer.');
    }
  };

  const saveSurcharge = async (zone) => {
    const val = parseFloat(editSurcharge);
    if (isNaN(val) || val < 0) { Alert.alert('Valeur invalide'); return; }
    const previous = zones;
    setZones(zones.map(z => z.name === zone.name ? { ...z, multiplier: val } : z));
    setSelected(null);
    try {
      await api.patch(`/api/admin/zones/${encodeURIComponent(zone.name)}`, { multiplier: val });
    } catch {
      setZones(previous);
      Alert.alert('Erreur', 'Impossible de sauvegarder le multiplicateur. Réessayer.');
    }
  };

  const stats = {
    active: zones.filter(z => z.enabled).length,
    highDemand: zones.filter(z => z.multiplier > 1).length,
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zones géographiques</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Zones actives</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.red }]}>{stats.highDemand}</Text>
          <Text style={styles.statLabel}>Forte demande</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Text style={{ color: COLORS.muted, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une zone..."
          placeholderTextColor={COLORS.muted}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 36 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 10, textAlign: 'center' }}>
            Impossible de récupérer les données des zones.
          </Text>
        </View>
      ) : (
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: COLORS.muted }}>Aucune zone trouvée</Text>
          </View>
        )}
        {filtered.map(zone => {
          const isSel = selected?.name === zone.name;
          return (
            <TouchableOpacity key={zone.name} style={[styles.card, !zone.enabled && { opacity: 0.6 }, isSel && { borderColor: COLORS.accent }]} onPress={() => setSelected(isSel ? null : zone)} activeOpacity={0.85}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Switch
                      value={!!zone.enabled}
                      onValueChange={() => toggleZone(zone)}
                      thumbColor={zone.enabled ? COLORS.green : COLORS.muted}
                      trackColor={{ false: COLORS.border, true: COLORS.green + '66' }}
                    />
                  </View>
                  <View style={styles.cardMeta}>
                    {zone.multiplier > 1 && <Text style={[styles.metaItem, { color: COLORS.orange }]}>x{zone.multiplier}</Text>}
                  </View>
                </View>
              </View>

              {isSel && (
                <View style={styles.editPanel}>
                  <Text style={styles.editLabel}>Multiplicateur tarifaire</Text>
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      defaultValue={String(zone.multiplier ?? 1)}
                      onChangeText={setEditSurcharge}
                      keyboardType="decimal-pad"
                      placeholder="1.0"
                      placeholderTextColor={COLORS.muted}
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={() => saveSurcharge(zone)}>
                      <Text style={styles.saveBtnText}>Sauvegarder</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  statsBar: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, margin: 12, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, paddingVertical: 12, color: COLORS.white, fontSize: 14 },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginTop: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  zoneName: { color: COLORS.white, fontSize: 14, fontWeight: '700', flex: 1 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  metaChip: { color: COLORS.muted, fontSize: 11 },
  demandBadge: { fontSize: 11, fontWeight: '700' },
  metaItem: { color: COLORS.muted, fontSize: 11 },
  editPanel: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  editLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  editRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  editInput: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 8, color: COLORS.white, fontSize: 14 },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  saveBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },
  mapBtn: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  mapBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
});
