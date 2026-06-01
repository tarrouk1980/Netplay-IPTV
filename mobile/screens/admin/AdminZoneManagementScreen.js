import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#27AE60',
  orange: '#F57C00',
  blue: '#1565C0',
};

const TN_WILAYAS = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul',
  'Zaghouan', 'Bizerte', 'Béja', 'Jendouba', 'Le Kef',
  'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax',
  'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kébili',
];

function EditZoneModal({ visible, zone, onClose, onSave }) {
  const [multiplier, setMultiplier] = useState(zone?.multiplier?.toString() || '1.0');
  const [surgeHours, setSurgeHours] = useState(zone?.surgeHours || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (zone) {
      setMultiplier(zone.multiplier?.toString() || '1.0');
      setSurgeHours(zone.surgeHours || '');
    }
  }, [zone]);

  const handle = async () => {
    const mult = parseFloat(multiplier);
    if (isNaN(mult) || mult < 0.5 || mult > 5) {
      Alert.alert('Erreur', 'Le multiplicateur doit être entre 0.5 et 5.0');
      return;
    }
    setLoading(true);
    try {
      await onSave(zone.name, mult, surgeHours.trim());
      onClose();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.card}>
          <Text style={m.title}>⚙️ {zone?.name}</Text>
          <Text style={m.label}>Multiplicateur de tarif</Text>
          <TextInput
            style={m.input}
            value={multiplier}
            onChangeText={setMultiplier}
            keyboardType="decimal-pad"
            placeholder="1.0"
            placeholderTextColor={COLORS.muted}
          />
          <Text style={m.hint}>
            {parseFloat(multiplier || 1) > 1
              ? `🔴 Surge ×${parseFloat(multiplier || 1).toFixed(1)} actif`
              : '🟢 Tarif normal'}
          </Text>
          <Text style={m.label}>Heures de pointe (ex: 7-9,18-22)</Text>
          <TextInput
            style={m.input}
            value={surgeHours}
            onChangeText={setSurgeHours}
            placeholder="7-9,18-22"
            placeholderTextColor={COLORS.muted}
          />
          <View style={m.btns}>
            <TouchableOpacity style={m.cancel} onPress={onClose} disabled={loading}>
              <Text style={m.cancelTxt}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={m.save} onPress={handle} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={m.saveTxt}>Enregistrer</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 14 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: COLORS.border, marginBottom: 4 },
  hint: { color: COLORS.muted, fontSize: 12, marginBottom: 12 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancel: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelTxt: { color: COLORS.muted, fontWeight: '600' },
  save: { flex: 1, backgroundColor: COLORS.blue, borderRadius: 10, padding: 13, alignItems: 'center' },
  saveTxt: { color: '#FFF', fontWeight: '700' },
});

export default function AdminZoneManagementScreen({ navigation }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editZone, setEditZone] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [stats, setStats] = useState(null);

  const buildDefaultZones = useCallback((serverZones) => {
    const zoneMap = Object.fromEntries((serverZones || []).map((z) => [z.name, z]));
    return TN_WILAYAS.map((name) => ({
      name,
      enabled: true,
      multiplier: 1.0,
      surgeHours: '',
      activeProviders: 0,
      todayOrders: 0,
      ...zoneMap[name],
    }));
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/zones');
      setZones(buildDefaultZones(res.data.zones));
      setStats(res.data.stats);
    } catch {
      setZones(buildDefaultZones([]));
      setStats({ totalActive: 0, surgeZones: 0, disabledZones: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildDefaultZones]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (zoneName, val) => {
    setToggling(zoneName);
    try {
      await api.patch(`/api/admin/zones/${encodeURIComponent(zoneName)}/toggle`, { enabled: val });
      setZones((prev) => prev.map((z) => z.name === zoneName ? { ...z, enabled: val } : z));
    } catch {
      Alert.alert('Erreur', 'Impossible de changer le statut de la zone.');
    } finally {
      setToggling(null);
    }
  };

  const handleSave = async (zoneName, multiplier, surgeHours) => {
    await api.patch(`/api/admin/zones/${encodeURIComponent(zoneName)}`, { multiplier, surgeHours });
    setZones((prev) => prev.map((z) => z.name === zoneName ? { ...z, multiplier, surgeHours } : z));
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.blue} size="large" />
      </View>
    );
  }

  const activeCount = zones.filter((z) => z.enabled).length;
  const surgeCount = zones.filter((z) => z.enabled && z.multiplier > 1).length;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🗺 Zones de service</Text>
      </View>

      <FlatList
        data={zones}
        keyExtractor={(item) => item.name}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.blue} />}
        ListHeaderComponent={
          <View style={s.statsRow}>
            {[
              { label: 'Zones actives', value: activeCount, color: COLORS.green },
              { label: 'Zones surge', value: surgeCount, color: COLORS.orange },
              { label: 'Désactivées', value: zones.length - activeCount, color: COLORS.accent },
            ].map((k, i) => (
              <View key={i} style={s.statCard}>
                <Text style={[s.statValue, { color: k.color }]}>{k.value}</Text>
                <Text style={s.statLabel}>{k.label}</Text>
              </View>
            ))}
          </View>
        }
        renderItem={({ item: zone }) => {
          const hasSurge = zone.enabled && zone.multiplier > 1;
          const borderColor = !zone.enabled ? COLORS.border : hasSurge ? COLORS.orange : COLORS.green;
          return (
            <View style={[s.zoneCard, { borderLeftColor: borderColor }]}>
              <View style={{ flex: 1 }}>
                <View style={s.zoneTop}>
                  <Text style={[s.zoneName, !zone.enabled && { color: COLORS.muted }]}>{zone.name}</Text>
                  {hasSurge && (
                    <View style={s.surgeBadge}>
                      <Text style={s.surgeTxt}>×{zone.multiplier.toFixed(1)}</Text>
                    </View>
                  )}
                  {zone.activeProviders > 0 && (
                    <Text style={s.providerCount}>{zone.activeProviders} 🟢</Text>
                  )}
                </View>
                {zone.surgeHours ? (
                  <Text style={s.surgeHours}>⏰ Pointe: {zone.surgeHours}</Text>
                ) : null}
                {zone.todayOrders > 0 && (
                  <Text style={s.todayOrders}>{zone.todayOrders} commandes aujourd'hui</Text>
                )}
              </View>
              <View style={s.zoneActions}>
                <TouchableOpacity style={s.editBtn} onPress={() => setEditZone(zone)}>
                  <Text style={s.editBtnTxt}>⚙️</Text>
                </TouchableOpacity>
                {toggling === zone.name ? (
                  <ActivityIndicator color={COLORS.green} size="small" />
                ) : (
                  <Switch
                    value={zone.enabled}
                    onValueChange={(val) => handleToggle(zone.name, val)}
                    trackColor={{ false: COLORS.border, true: COLORS.green }}
                    thumbColor="#FFF"
                    style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                  />
                )}
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
      />

      <EditZoneModal
        visible={!!editZone}
        zone={editZone}
        onClose={() => setEditZone(null)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 12, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  zoneCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
  },
  zoneTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  zoneName: { color: COLORS.text, fontSize: 14, fontWeight: '600', flex: 1 },
  surgeBadge: { backgroundColor: COLORS.orange + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.orange },
  surgeTxt: { color: COLORS.orange, fontSize: 11, fontWeight: '700' },
  providerCount: { color: COLORS.green, fontSize: 11 },
  surgeHours: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  todayOrders: { color: COLORS.muted, fontSize: 11 },
  zoneActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: { width: 34, height: 34, backgroundColor: COLORS.surfaceAlt, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  editBtnTxt: { fontSize: 16 },
});
