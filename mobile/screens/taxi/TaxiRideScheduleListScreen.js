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
  Alert,
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
  blue: '#1565C0',
};

const STATUS_CONFIG = {
  SCHEDULED: { color: COLORS.blue, label: 'Planifiée', icon: '📅' },
  CONFIRMED: { color: COLORS.green, label: 'Confirmée', icon: '✅' },
  IN_PROGRESS: { color: COLORS.orange, label: 'En cours', icon: '🚕' },
  COMPLETED: { color: COLORS.muted, label: 'Terminée', icon: '🏁' },
  CANCELLED: { color: COLORS.accent, label: 'Annulée', icon: '❌' },
};

const MOCK_RIDES = [
  {
    id: 'sched-001',
    status: 'SCHEDULED',
    scheduledAt: new Date(Date.now() + 2 * 3600000).toISOString(),
    pickup: 'Aéroport Tunis-Carthage, Terminal 1',
    destination: 'Hôtel Africa, Avenue Bourguiba',
    price: 22,
    vehicleType: 'SEDAN',
    provider: null,
  },
  {
    id: 'sched-002',
    status: 'CONFIRMED',
    scheduledAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    pickup: 'Gare de Tunis, Place Barcelone',
    destination: 'Lac 2, Tunis',
    price: 15,
    vehicleType: 'SEDAN',
    provider: { name: 'Sami Ben Youssef' },
  },
  {
    id: 'sched-003',
    status: 'COMPLETED',
    scheduledAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    pickup: 'Marsa Plage',
    destination: 'Centre Ville, Tunis',
    price: 18,
    vehicleType: 'SUV',
    provider: { name: 'Khalil Amara' },
  },
];

function timeUntil(isoDate) {
  const diff = new Date(isoDate) - Date.now();
  if (diff < 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `Dans ${h}h${m > 0 ? ` ${m}min` : ''}`;
  return `Dans ${m} min`;
}

export default function TaxiRideScheduleListScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('UPCOMING');

  const load = useCallback(async (silent = false) => {
    try {
      const res = await api.get('/api/taxi/scheduled');
      setRides(res.data.rides || []);
    } catch {
      if (!silent) setRides(MOCK_RIDES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upcoming = rides.filter((r) => ['SCHEDULED', 'CONFIRMED'].includes(r.status));
  const past = rides.filter((r) => ['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(r.status));
  const displayed = tab === 'UPCOMING' ? upcoming : past;

  const handleCancel = (rideId) => {
    Alert.alert(
      'Annuler la course',
      'Voulez-vous vraiment annuler cette course planifiée ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/api/taxi/scheduled/${rideId}/cancel`);
              load(true);
            } catch {
              Alert.alert('Erreur', 'Impossible d\'annuler cette course.');
            }
          },
        },
      ]
    );
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>📅 Courses planifiées</Text>
        <TouchableOpacity
          style={s.newBtn}
          onPress={() => navigation.navigate('TaxiScheduleRide')}
        >
          <Text style={s.newBtnTxt}>+ Planifier</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tab, tab === 'UPCOMING' && s.tabActive]}
          onPress={() => setTab('UPCOMING')}
        >
          <Text style={[s.tabTxt, tab === 'UPCOMING' && s.tabTxtActive]}>
            À venir ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'PAST' && s.tabActive]}
          onPress={() => setTab('PAST')}
        >
          <Text style={[s.tabTxt, tab === 'PAST' && s.tabTxtActive]}>
            Historique ({past.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={COLORS.orange}
          />
        }
        renderItem={({ item }) => {
          const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.SCHEDULED;
          const countdown = timeUntil(item.scheduledAt);
          const dateStr = new Date(item.scheduledAt).toLocaleString('fr-TN', {
            weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          });
          return (
            <View style={[s.card, { borderLeftColor: st.color }]}>
              <View style={s.cardTop}>
                <Text style={{ fontSize: 20 }}>{st.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                    <View style={[s.statusBadge, { backgroundColor: st.color + '22', borderColor: st.color }]}>
                      <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                  <Text style={s.dateStr}>{dateStr}</Text>
                </View>
                <Text style={[s.price, { color: COLORS.orange }]}>{parseFloat(item.price).toFixed(0)} TND</Text>
              </View>

              <View style={s.routeRow}>
                <View style={s.routeDot} />
                <Text style={s.routeTxt} numberOfLines={1}>{item.pickup}</Text>
              </View>
              <View style={[s.routeRow, { marginTop: 4 }]}>
                <View style={[s.routeDot, { backgroundColor: COLORS.green }]} />
                <Text style={s.routeTxt} numberOfLines={1}>{item.destination}</Text>
              </View>

              {item.provider ? (
                <Text style={s.providerTxt}>🚕 {item.provider.name}</Text>
              ) : item.status === 'SCHEDULED' ? (
                <Text style={[s.providerTxt, { color: COLORS.orange }]}>⏳ En attente d'un chauffeur</Text>
              ) : null}

              {countdown && (
                <View style={s.countdownBox}>
                  <Text style={s.countdownTxt}>⏱ {countdown}</Text>
                </View>
              )}

              {item.status === 'SCHEDULED' && (
                <TouchableOpacity style={s.cancelBtn} onPress={() => handleCancel(item.id)}>
                  <Text style={s.cancelBtnTxt}>Annuler la course</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
            <Text style={s.emptyTitle}>{tab === 'UPCOMING' ? 'Aucune course planifiée' : 'Aucun historique'}</Text>
            <Text style={s.emptySub}>
              {tab === 'UPCOMING'
                ? 'Planifiez une course à l\'avance pour ne plus attendre.'
                : 'Vos courses passées apparaîtront ici.'}
            </Text>
            {tab === 'UPCOMING' && (
              <TouchableOpacity style={s.newBtnLarge} onPress={() => navigation.navigate('TaxiScheduleRide')}>
                <Text style={s.newBtnLargeTxt}>+ Planifier une course</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  newBtn: { backgroundColor: COLORS.orange + '22', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.orange },
  newBtnTxt: { color: COLORS.orange, fontSize: 13, fontWeight: '700' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  tabActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '22' },
  tabTxt: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabTxtActive: { color: COLORS.orange },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  orderId: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  dateStr: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.orange },
  routeTxt: { color: COLORS.muted, fontSize: 12, flex: 1 },
  providerTxt: { color: COLORS.muted, fontSize: 12, marginTop: 8 },
  countdownBox: { backgroundColor: COLORS.blue + '22', borderRadius: 8, padding: 8, marginTop: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.blue + '44' },
  countdownTxt: { color: COLORS.blue, fontSize: 12, fontWeight: '700' },
  cancelBtn: { backgroundColor: COLORS.accent + '11', borderRadius: 8, padding: 10, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '44' },
  cancelBtnTxt: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  newBtnLarge: { backgroundColor: COLORS.orange, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  newBtnLargeTxt: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
