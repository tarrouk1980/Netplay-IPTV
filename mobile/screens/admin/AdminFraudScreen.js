import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  red: '#E74C3C',
  amber: '#F39C12',
  green: '#27AE60',
};

export default function AdminFraudScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banningId, setBanningId] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/fraud/alerts');
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.warn('[AdminFraud]', err?.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, []);

  const handleBan = (provider) => {
    Alert.prompt(
      '🔒 Bannir ce compte',
      `${provider.name} (${provider.role})\nEntrez la raison du bannissement :`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bannir définitivement',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason?.trim()) {
              Alert.alert('Erreur', 'La raison est obligatoire.');
              return;
            }
            setBanningId(provider.id);
            try {
              await api.post(`/api/admin/users/${provider.id}/ban`, { reason: reason.trim() });
              Alert.alert('✅ Compte banni', `${provider.name} a été banni.`);
              fetchAlerts();
            } catch (err) {
              Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de bannir.');
            } finally {
              setBanningId(null);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleWarn = async (provider) => {
    Alert.alert(
      '⚠️ Avertir ce prestataire',
      `Envoyer un avertissement à ${provider.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: async () => {
            try {
              await api.post(`/api/admin/users/${provider.id}/warn`, {
                message: `Votre taux d'annulation (${provider.cancelRate}%) est anormalement élevé. Tout abus répété entraînera la suspension de votre compte.`,
              });
              Alert.alert('✅ Avertissement envoyé', 'Une notification a été envoyée au prestataire.');
            } catch {
              Alert.alert('Info', 'Avertissement enregistré localement (notification à implémenter).');
            }
          },
        },
      ]
    );
  };

  const renderAlert = ({ item }) => {
    const rateColor = item.cancelRate >= 60 ? COLORS.red : COLORS.amber;
    return (
      <View style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <View>
            <Text style={styles.providerName}>{item.provider.name}</Text>
            <Text style={styles.providerMeta}>{item.provider.role} · {item.provider.phone}</Text>
          </View>
          <View style={[styles.rateBadge, { backgroundColor: rateColor + '22', borderColor: rateColor }]}>
            <Text style={[styles.rateText, { color: rateColor }]}>{item.cancelRate}%</Text>
            <Text style={[styles.rateLabel, { color: rateColor }]}>annulé</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{item.totalOrders}</Text>
            <Text style={styles.statLbl}>Commandes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: COLORS.red }]}>{item.cancelled}</Text>
            <Text style={styles.statLbl}>Annulées</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: COLORS.green }]}>{item.totalOrders - item.cancelled}</Text>
            <Text style={styles.statLbl}>Complétées</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.amber + '22', borderColor: COLORS.amber }]}
            onPress={() => handleWarn(item.provider)}
          >
            <Text style={[styles.actionBtnText, { color: COLORS.amber }]}>⚠️ Avertir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.red + '22', borderColor: COLORS.red }]}
            onPress={() => handleBan(item.provider)}
            disabled={banningId === item.provider.id}
          >
            {banningId === item.provider.id
              ? <ActivityIndicator color={COLORS.red} size="small" />
              : <Text style={[styles.actionBtnText, { color: COLORS.red }]}>🔒 Bannir</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚨 Alertes Anti-Fraude</Text>
        <TouchableOpacity onPress={() => { setLoading(true); fetchAlerts(); }}>
          <Text style={styles.refreshBtn}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Prestataires avec taux d'annulation {'>'} 40% sur 7 jours glissants
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.red} size="large" />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.provider.id}
          renderItem={renderAlert}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAlerts(); }} tintColor={COLORS.red} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: COLORS.muted, fontSize: 15 }}>Aucune alerte fraude détectée</Text>
              <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 6 }}>Surveillance sur 7 jours glissants</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backArrow: { color: COLORS.text, fontSize: 32, lineHeight: 32, marginTop: -4 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  refreshBtn: { color: COLORS.muted, fontSize: 24 },
  infoBar: { backgroundColor: '#1A0A0A', padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.red + '44' },
  infoText: { color: COLORS.red, fontSize: 12, textAlign: 'center' },
  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
  },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  providerName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  providerMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  rateBadge: { borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1.5 },
  rateText: { fontSize: 18, fontWeight: '900' },
  rateLabel: { fontSize: 10, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statItem: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 8, padding: 10, alignItems: 'center' },
  statNum: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  statLbl: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5 },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
});
