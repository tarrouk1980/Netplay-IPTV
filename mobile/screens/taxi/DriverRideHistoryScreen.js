import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
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
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
};

const PERIODS = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'all', label: 'Tout' },
];

export default function DriverRideHistoryScreen({ navigation }) {
  const [period, setPeriod] = useState('week');
  const [rides, setRides] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/taxi/driver/history?period=${period}`);
      setRides(res.data.rides || []);
      setSummary(res.data.summary || null);
    } catch {
      setRides([]);
      setSummary({ total: 0, revenue: 0, avgRating: 0, totalKm: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const exportCSV = async () => {
    if (!rides.length) return;
    setExporting(true);
    try {
      const header = 'ID,Date,Client,Départ,Destination,Montant,Note,Durée\n';
      const rows = rides.map((r) => {
        const meta = r.metadata || {};
        return `${r.id},${r.createdAt},${r.client?.name || ''},${meta.pickupAddress || ''},${meta.deliveryAddress || ''},${r.price || 0},${r.rating || ''},${meta.duration || ''}`;
      }).join('\n');
      const uri = FileSystem.documentDirectory + 'courses.csv';
      await FileSystem.writeAsStringAsync(uri, header + rows, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exporter les courses' });
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  };

  const renderRide = ({ item }) => {
    const meta = item.metadata || {};
    const stars = item.rating ? '★'.repeat(Math.round(item.rating)) + '☆'.repeat(5 - Math.round(item.rating)) : null;
    return (
      <TouchableOpacity
        style={s.rideCard}
        onPress={() => navigation.navigate('Invoice', { orderId: item.id })}
      >
        <View style={s.rideTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.clientName}>{item.client?.name || 'Client'}</Text>
            <Text style={s.rideDate}>
              {new Date(item.createdAt).toLocaleString('fr-TN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={s.rideAmount}>{parseFloat(item.price || 0).toFixed(3)} TND</Text>
        </View>
        {meta.pickupAddress && (
          <View style={s.routeRow}>
            <Text style={s.dot}>●</Text>
            <Text style={s.addressTxt} numberOfLines={1}>{meta.pickupAddress}</Text>
          </View>
        )}
        {meta.deliveryAddress && (
          <View style={s.routeRow}>
            <Text style={[s.dot, { color: COLORS.accent }]}>●</Text>
            <Text style={s.addressTxt} numberOfLines={1}>{meta.deliveryAddress}</Text>
          </View>
        )}
        <View style={s.rideMeta}>
          {meta.distance && <Text style={s.metaChip}>📍 {meta.distance} km</Text>}
          {meta.duration && <Text style={s.metaChip}>⏱ {meta.duration} min</Text>}
          {item.tip > 0 && <Text style={[s.metaChip, { color: COLORS.orange }]}>🎁 +{parseFloat(item.tip).toFixed(3)} TND</Text>}
          {stars && <Text style={[s.metaChip, { color: '#F5A623' }]}>{stars}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.orange} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🚕 Historique des courses</Text>
        <TouchableOpacity onPress={exportCSV} disabled={exporting}>
          {exporting ? (
            <ActivityIndicator color={COLORS.orange} size="small" />
          ) : (
            <Text style={s.csvBtn}>CSV</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Period tabs */}
      <View style={s.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[s.tab, period === p.key && s.tabActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[s.tabTxt, period === p.key && s.tabTxtActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      {summary && (
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryValue}>{summary.total ?? 0}</Text>
            <Text style={s.summaryLabel}>Courses</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryValue, { color: COLORS.green }]}>{(summary.revenue ?? 0).toFixed(0)} TND</Text>
            <Text style={s.summaryLabel}>Revenus</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryValue, { color: '#F5A623' }]}>⭐ {(summary.avgRating ?? 0).toFixed(1)}</Text>
            <Text style={s.summaryLabel}>Moyenne</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryValue}>{(summary.totalKm ?? 0).toFixed(0)} km</Text>
            <Text style={s.summaryLabel}>Distance</Text>
          </View>
        </View>
      )}

      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={renderRide}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.orange} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 44, marginBottom: 10 }}>🏁</Text>
            <Text style={s.emptyTitle}>Aucune course</Text>
            <Text style={s.emptySub}>Aucune course terminée sur cette période.</Text>
          </View>
        }
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
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  csvBtn: { color: COLORS.orange, fontSize: 13, fontWeight: '700', borderWidth: 1, borderColor: COLORS.orange, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  periodRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  tabActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '22' },
  tabTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  tabTxtActive: { color: COLORS.orange },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  summaryValue: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 3 },
  summaryLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  rideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  clientName: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  rideDate: { color: COLORS.muted, fontSize: 11 },
  rideAmount: { color: COLORS.green, fontSize: 15, fontWeight: '700' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { color: COLORS.green, fontSize: 10 },
  addressTxt: { color: COLORS.muted, fontSize: 12, flex: 1 },
  rideMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  metaChip: { color: COLORS.muted, fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13 },
});
