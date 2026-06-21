import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

export default function MerchantEarningsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/api/merchants/stats')
      .then(r => { setData(r.data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Mes revenus</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : error || !data ? (
        <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 30 }}>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
            Impossible de récupérer vos revenus. Vérifiez votre connexion et réessayez.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Revenus aujourd'hui</Text>
            <Text style={styles.balanceVal}>{data.todayRevenue.toFixed(3)} TND</Text>
            <View style={styles.commissionNote}>
              <Text style={styles.commissionText}>✅ EasyWay 0% commission — revenus 100% à vous</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.accent }]}>{data.monthRevenue.toFixed(0)}</Text>
              <Text style={styles.statSub}>TND ce mois</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.text }]}>{data.monthOrders}</Text>
              <Text style={styles.statSub}>Commandes ce mois</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.orange }]}>{data.pendingOrders}</Text>
              <Text style={styles.statSub}>En attente</Text>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Le versement des revenus est traité par l'équipe EASYWAY. Contactez le support pour le suivi de vos virements.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  balanceCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent + '30' },
  balanceLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  balanceVal: { color: COLORS.accent, fontSize: 34, fontWeight: '900', marginBottom: 10 },
  commissionNote: { backgroundColor: COLORS.green + '10', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.green + '30' },
  commissionText: { color: COLORS.green, fontSize: 11 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 18, fontWeight: '900' },
  statSub: { color: COLORS.muted, fontSize: 9, marginTop: 4, textAlign: 'center' },
  noteBox: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  noteText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
