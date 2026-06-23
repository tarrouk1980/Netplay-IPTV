import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceLight: '#2A2A3A',
  primary: '#6C63FF',
  success: '#00C896',
  warning: '#FFB020',
  danger: '#FF4D4D',
  text: '#FFFFFF',
  textSecondary: '#9999BB',
  border: '#2E2E42',
};

export default function GroceryStoreAnalyticsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setError(false);
    try {
      const { data: stats } = await api.get('/api/merchants/stats');
      setData(stats);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytique boutique</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.commissionBanner}>
        <Text style={styles.commissionText}>✓ Commission EasyWay : 0% — Vous gardez 100% de vos ventes</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>⚠️ Impossible de charger les statistiques.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.todayRevenue.toFixed(1)} TND</Text>
              <Text style={styles.kpiLabel}>Chiffre d'affaires aujourd'hui</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.todayOrders}</Text>
              <Text style={styles.kpiLabel}>Commandes aujourd'hui</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.monthRevenue.toFixed(1)} TND</Text>
              <Text style={styles.kpiLabel}>Chiffre d'affaires (mois)</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.monthOrders}</Text>
              <Text style={styles.kpiLabel}>Commandes (mois)</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.pendingOrders}</Text>
              <Text style={styles.kpiLabel}>Commandes en attente</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{data.rating?.toFixed(1) ?? '—'} ⭐</Text>
              <Text style={styles.kpiLabel}>Note moyenne</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚧 Bientôt disponible</Text>
            <Text style={styles.comingSoonText}>
              Le top des produits vendus et les heures de pointe seront disponibles prochainement.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: COLORS.text },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  commissionBanner: {
    backgroundColor: COLORS.success + '22',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  commissionText: { color: COLORS.success, fontSize: 12, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  errorText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 14 },
  retryBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  retryBtnText: { color: COLORS.text, fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 8,
  },
  kpiCard: {
    width: '47%',
    margin: '1.5%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  kpiLabel: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  comingSoonText: { fontSize: 13, color: COLORS.textSecondary },
});
