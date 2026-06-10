import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  card: '#22223A',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  primary: '#1565C0',
  accent: '#42A5F5',
  success: '#27AE60',
  warning: '#F5A623',
  danger: '#E74C3C',
  border: '#2E2E3F',
};

function AlertCard({ alert, onDelete, onView }) {
  const isTriggered = alert.triggered;
  const diff = alert.currentPrice && alert.targetPrice
    ? Math.round((alert.currentPrice - alert.targetPrice) * 10) / 10
    : null;

  return (
    <View style={[styles.card, isTriggered && styles.cardTriggered]}>
      {isTriggered && (
        <View style={styles.triggeredBanner}>
          <Text style={styles.triggeredText}>🎉 Prix atteint !</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.route}>{alert.origin} → {alert.dest}</Text>
          <Text style={styles.routeSub}>
            {alert.originInfo?.city || alert.origin} → {alert.destInfo?.city || alert.dest}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(alert.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Votre alerte</Text>
          <Text style={styles.priceTarget}>≤ {alert.targetPrice} {alert.currency}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Prix actuel</Text>
          <Text style={[
            styles.priceCurrent,
            { color: isTriggered ? COLORS.success : COLORS.warning },
          ]}>
            {alert.currentPrice ? `${alert.currentPrice} ${alert.currency}` : 'N/D'}
          </Text>
        </View>
        {diff !== null && (
          <>
            <View style={styles.priceDivider} />
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>Écart</Text>
              <Text style={[styles.priceDiff, { color: diff <= 0 ? COLORS.success : COLORS.danger }]}>
                {diff > 0 ? '+' : ''}{diff} {alert.currency}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>📅 {alert.date}</Text>
        <Text style={styles.meta}>👤 {alert.passengers} pax</Text>
        <Text style={styles.meta}>
          🕐 {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <TouchableOpacity style={styles.viewBtn} onPress={() => onView(alert)}>
        <Text style={styles.viewBtnText}>Voir les vols disponibles →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FlightAlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get('/api/flights/alerts');
      setAlerts(res.data.alerts || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAlerts(); }, [fetchAlerts]));

  const handleDelete = (id) => {
    Alert.alert('Supprimer l\'alerte', 'Voulez-vous supprimer cette alerte de prix ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/flights/alerts/${id}`);
            fetchAlerts();
          } catch {}
        },
      },
    ]);
  };

  const handleView = (alert) => {
    navigation.navigate('FlightResults', {
      search: {
        origin: alert.origin, dest: alert.dest,
        date: alert.date, passengers: alert.passengers, tripType: 'ONE_WAY',
      },
      origin: alert.originInfo || { code: alert.origin, city: alert.origin },
      dest: alert.destInfo || { code: alert.dest, city: alert.dest },
      tripType: 'ONE_WAY',
    });
  };

  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const normalAlerts = alerts.filter((a) => !a.triggered);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes alertes prix</Text>
        {alerts.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{alerts.length}</Text>
          </View>
        )}
      </View>

      {triggeredAlerts.length > 0 && (
        <View style={styles.triggeredSection}>
          <Text style={styles.sectionLabel}>🎉 Prix atteints</Text>
          {triggeredAlerts.map((a) => (
            <AlertCard key={a.id} alert={a} onDelete={handleDelete} onView={handleView} />
          ))}
        </View>
      )}

      <FlatList
        data={normalAlerts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAlerts(); }} tintColor={COLORS.accent} />
        }
        ListHeaderComponent={normalAlerts.length > 0 ? <Text style={styles.sectionLabel}>En attente</Text> : null}
        renderItem={({ item }) => (
          <AlertCard alert={item} onDelete={handleDelete} onView={handleView} />
        )}
        ListEmptyComponent={
          !loading && triggeredAlerts.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>Aucune alerte active</Text>
              <Text style={styles.emptyText}>
                Créez une alerte depuis la fiche d'un vol pour être notifié quand le prix baisse.
              </Text>
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={() => navigation.navigate('EasyFlightHome')}
              >
                <Text style={styles.searchBtnText}>Rechercher un vol</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, marginRight: 12 },
  backIcon: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  countBadge: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  triggeredSection: { paddingHorizontal: 16, paddingTop: 12 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 16 },
  list: { padding: 16, paddingTop: 4 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  cardTriggered: { borderColor: COLORS.success + '66' },
  triggeredBanner: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: COLORS.success + '22', padding: 6, alignItems: 'center',
  },
  triggeredText: { color: COLORS.success, fontSize: 12, fontWeight: '700' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8, marginBottom: 14 },
  route: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  routeSub: { color: COLORS.muted, fontSize: 12 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { color: COLORS.danger, fontSize: 16, fontWeight: '700' },
  priceRow: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 12 },
  priceBlock: { flex: 1, alignItems: 'center' },
  priceLabel: { color: COLORS.muted, fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
  priceTarget: { color: COLORS.accent, fontSize: 16, fontWeight: '800' },
  priceCurrent: { fontSize: 16, fontWeight: '800' },
  priceDiff: { fontSize: 14, fontWeight: '700' },
  priceDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 4 },
  metaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 12 },
  meta: { color: COLORS.muted, fontSize: 12 },
  viewBtn: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center' },
  viewBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: COLORS.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  searchBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
