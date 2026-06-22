import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#22C55E',
  red: '#EF4444',
};

export default function DriverStatusScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(false);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/provider/status')
      .then(r => {
        setIsOnline(r.data.isOnline ?? false);
        setTodayStats(r.data.todayStats ?? null);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (val) => {
    setToggling(true);
    try {
      await api.patch('/api/taxi/driver/toggle');
      setIsOnline(val);
    } catch {
      Alert.alert('Erreur', 'Impossible de changer votre statut. Vérifiez votre connexion.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon statut</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>
            Impossible de charger votre statut.
          </Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 14, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, isOnline && styles.cardGlowGreen]}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.statusLabel, { color: isOnline ? COLORS.green : COLORS.muted }]}>
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </Text>
                <Text style={styles.statusSub}>
                  {isOnline ? 'Vous recevez des courses' : 'Vous ne recevez pas de courses'}
                </Text>
              </View>
              {toggling ? (
                <ActivityIndicator color={COLORS.green} />
              ) : (
                <Switch
                  value={isOnline}
                  onValueChange={handleToggle}
                  trackColor={{ false: COLORS.border, true: COLORS.green }}
                  thumbColor={COLORS.text}
                />
              )}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Statistiques du jour</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayStats?.orders ?? 0}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{(todayStats?.revenue ?? 0).toFixed(2)} TND</Text>
              <Text style={styles.statLabel}>Revenus</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>⭐ {(todayStats?.rating ?? 5).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardGlowGreen: {
    borderColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSub: {
    color: COLORS.muted,
    fontSize: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
  },
});
