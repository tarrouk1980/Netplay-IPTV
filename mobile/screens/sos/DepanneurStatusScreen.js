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
  orange: '#F59E0B',
};

export default function DepanneurStatusScreen({ navigation }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [stats, setStats] = useState({ interventions: 0, revenue: 0, rating: 5 });
  const [hasActive, setHasActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/sos/depanneur/dashboard')
      .then((r) => {
        setIsAvailable(!!r.data.isOnline);
        setHasActive(!!r.data.activeIntervention);
        setStats(r.data.stats || { interventions: 0, revenue: 0, rating: 5 });
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleAvailable = async (value) => {
    setToggling(true);
    try {
      const r = await api.patch('/api/sos/depanneur/toggle', { online: value });
      setIsAvailable(!!r.data.isOnline);
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de changer votre statut. Réessayez.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger votre statut.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon statut 🛻</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isAvailable && styles.cardGlowGreen]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.statusLabel, { color: isAvailable ? COLORS.green : COLORS.muted }]}>
                {isAvailable ? 'Disponible' : 'Indisponible'}
              </Text>
              <Text style={styles.statusSub}>
                {isAvailable
                  ? 'Vous recevez des demandes SOS'
                  : "Vous ne recevez pas de demandes SOS"}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailable}
              disabled={toggling}
              trackColor={{ false: COLORS.border, true: COLORS.green }}
              thumbColor={COLORS.text}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Interventions du jour</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'En cours', value: hasActive ? 1 : 0 },
            { label: 'Terminées', value: stats.interventions },
            { label: 'Note', value: Number(stats.rating).toFixed(1) },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gains du jour</Text>
          <Text style={[styles.cardValue, { color: COLORS.primary, fontSize: 28 }]}>{Number(stats.revenue).toFixed(2)} TND</Text>
          <Text style={styles.cardSub}>{stats.interventions} intervention{stats.interventions === 1 ? '' : 's'} terminée{stats.interventions === 1 ? '' : 's'}</Text>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  cardTitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSub: {
    color: COLORS.muted,
    fontSize: 12,
  },
});
