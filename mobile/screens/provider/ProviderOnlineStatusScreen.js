import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
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
  green: '#27AE60',
  accent: '#D32F2F',
  orange: '#F57C00',
};

const ROLE_CONFIG = {
  CHAUFFEUR: { icon: '🚕', label: 'Chauffeur', togglePath: '/api/taxi/driver/toggle', dashScreen: 'DriverDashboard' },
  LIVREUR: { icon: '🛵', label: 'Livreur', togglePath: '/api/delivery/livreur/toggle', dashScreen: 'LivreurDashboard' },
  DEPANNEUR: { icon: '🛻', label: 'Dépanneur', togglePath: '/api/sos/depanneur/toggle', dashScreen: 'DepanneurDashboard' },
  MARCHAND: { icon: '🏪', label: 'Marchand', togglePath: '/api/merchants/me/toggle', dashScreen: 'MerchantDashboard' },
};

function StatTile({ label, value, color }) {
  return (
    <View style={s.tile}>
      <Text style={[s.tileValue, { color: color || COLORS.text }]}>{value}</Text>
      <Text style={s.tileLabel}>{label}</Text>
    </View>
  );
}

export default function ProviderOnlineStatusScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayStats, setTodayStats] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/provider/status');
      setProfile(res.data.profile);
      setIsOnline(res.data.isOnline ?? false);
      setTodayStats(res.data.todayStats ?? null);
    } catch {
      setProfile({ role: 'CHAUFFEUR', name: 'Prestataire' });
      setTodayStats({ orders: 0, revenue: 0, rating: 5.0, hoursOnline: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (val) => {
    const cfg = ROLE_CONFIG[profile?.role];
    if (!cfg) return;
    setToggling(true);
    try {
      await api.patch(cfg.togglePath);
      setIsOnline(val);
    } catch {
      Alert.alert('Erreur', 'Impossible de changer le statut.');
    } finally {
      setToggling(false);
    }
  };

  const goToDashboard = () => {
    const cfg = ROLE_CONFIG[profile?.role];
    if (cfg?.dashScreen) navigation.navigate(cfg.dashScreen);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  const cfg = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.CHAUFFEUR;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>{cfg.icon} Statut en ligne</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Main toggle */}
        <View style={[s.mainCard, { borderColor: isOnline ? COLORS.green : COLORS.border }]}>
          <View style={s.mainLeft}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>{cfg.icon}</Text>
            <Text style={s.mainName}>{profile?.name || cfg.label}</Text>
            <Text style={s.mainRole}>{cfg.label}</Text>
          </View>
          <View style={s.mainRight}>
            <View style={[s.statusIndicator, { backgroundColor: isOnline ? COLORS.green : COLORS.muted }]} />
            <Text style={[s.statusText, { color: isOnline ? COLORS.green : COLORS.muted }]}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
            {toggling ? (
              <ActivityIndicator color={COLORS.green} style={{ marginTop: 8 }} />
            ) : (
              <Switch
                value={isOnline}
                onValueChange={handleToggle}
                trackColor={{ false: COLORS.border, true: COLORS.green }}
                thumbColor="#FFF"
                style={{ marginTop: 8 }}
              />
            )}
          </View>
        </View>

        {/* Today stats */}
        {todayStats && (
          <>
            <Text style={s.sectionTitle}>Aujourd'hui</Text>
            <View style={s.tilesRow}>
              <StatTile label="Courses" value={todayStats.orders ?? 0} />
              <StatTile label="Revenus" value={`${(todayStats.revenue ?? 0).toFixed(0)} TND`} color={COLORS.green} />
              <StatTile label="Note" value={`⭐ ${(todayStats.rating ?? 5).toFixed(1)}`} color="#F5A623" />
              <StatTile label="En ligne" value={`${(todayStats.hoursOnline ?? 0).toFixed(1)}h`} color={COLORS.orange} />
            </View>
          </>
        )}

        {/* Mode info */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>{isOnline ? '✅ Vous recevez des missions' : '😴 Mode repos actif'}</Text>
          <Text style={s.infoBody}>
            {isOnline
              ? 'Les clients peuvent vous trouver et vous envoyer des demandes. Restez connecté pour maximiser vos gains.'
              : "Activez le bouton ci-dessus pour commencer à recevoir des missions. Votre position ne sera pas partagée."}
          </Text>
        </View>

        {/* Tips */}
        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>💡 Conseils pour gagner plus</Text>
          {[
            'Soyez en ligne aux heures de pointe (7h-9h, 12h-14h, 18h-22h)',
            'Maintenez une note ≥ 4.5 pour être mis en avant',
            'Acceptez rapidement les demandes pour améliorer votre taux',
            'Complétez votre profil KYC pour débloquer plus de missions',
          ].map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <Text style={s.tipBullet}>•</Text>
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Go to dashboard */}
        <TouchableOpacity style={s.dashBtn} onPress={goToDashboard}>
          <Text style={s.dashBtnTxt}>Aller au tableau de bord →</Text>
        </TouchableOpacity>
      </ScrollView>
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
  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  mainLeft: { alignItems: 'center' },
  mainName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  mainRole: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  mainRight: { alignItems: 'center' },
  statusIndicator: { width: 14, height: 14, borderRadius: 7, marginBottom: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 16, marginBottom: 8 },
  tilesRow: { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 16 },
  tile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tileValue: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  tileLabel: { color: COLORS.muted, fontSize: 9, textAlign: 'center' },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  infoTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  infoBody: { color: COLORS.muted, fontSize: 13, lineHeight: 20 },
  tipsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  tipsTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  tipText: { color: COLORS.muted, fontSize: 13, flex: 1, lineHeight: 18 },
  dashBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 14,
    alignItems: 'center',
  },
  dashBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
