import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import api from '../services/api';

const DEMO_ALERTS = [
  {
    id: '1', origin: 'MAD', dest: 'CMN', date: '2026-08-15',
    targetPrice: 45, lastPrice: 38, currency: 'EUR', active: true,
    triggered: true,
  },
  {
    id: '2', origin: 'BCN', dest: 'ALG', date: '2026-07-20',
    targetPrice: 55, lastPrice: 62, currency: 'EUR', active: true,
    triggered: false,
  },
  {
    id: '3', origin: 'VLC', dest: 'TUN', date: '2026-09-01',
    targetPrice: 70, lastPrice: 68, currency: 'EUR', active: false,
    triggered: true,
  },
];

function AlertCard({ alert, onDelete, onToggle }) {
  const priceDiff = alert.lastPrice - alert.targetPrice;
  const triggered = alert.lastPrice <= alert.targetPrice;

  return (
    <View style={[s.card, triggered && s.cardTriggered]}>
      {triggered && (
        <View style={s.triggeredBanner}>
          <Text style={s.triggeredTxt}>🎉 Objectif atteint !</Text>
        </View>
      )}
      <View style={s.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.route}>{alert.origin} → {alert.dest}</Text>
          <Text style={s.dateTxt}>{alert.date}</Text>
        </View>
        <Switch
          value={alert.active}
          onValueChange={() => onToggle(alert.id)}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={alert.active ? '#fff' : COLORS.muted}
        />
      </View>

      <View style={s.priceRow}>
        <View style={s.priceBlock}>
          <Text style={s.priceLabel}>Objectif</Text>
          <Text style={s.priceTarget}>{alert.targetPrice}{alert.currency}</Text>
        </View>
        <View style={s.arrow}>
          <Text style={s.arrowTxt}>vs</Text>
        </View>
        <View style={s.priceBlock}>
          <Text style={s.priceLabel}>Actuel</Text>
          <Text style={[s.priceCurrent, { color: triggered ? COLORS.success : COLORS.danger }]}>
            {alert.lastPrice}{alert.currency}
          </Text>
        </View>
        <View style={[s.diffBadge, { backgroundColor: triggered ? '#065F46' : '#7F1D1D' }]}>
          <Text style={s.diffTxt}>
            {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(0)}{alert.currency}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={s.deleteBtn}
        onPress={() => Alert.alert('Supprimer', 'Supprimer cette alerte ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(alert.id) },
        ])}
      >
        <Text style={s.deleteTxt}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);

  useFocusEffect(useCallback(() => {
    loadAlerts();
  }, []));

  const loadAlerts = async () => {
    try {
      const res = await api.get('/api/flights/alerts');
      setAlerts(res.data.alerts || []);
    } catch {
      setAlerts(DEMO_ALERTS);
    }
  };

  const deleteAlert = async (id) => {
    try {
      await api.delete(`/api/flights/alerts/${id}`);
    } catch {}
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAlert = (id) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  };

  const triggered = alerts.filter((a) => a.lastPrice <= a.targetPrice);
  const waiting   = alerts.filter((a) => a.lastPrice > a.targetPrice);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🔔 Mes alertes prix</Text>
      </View>

      <FlatList
        data={[...triggered, ...waiting]}
        keyExtractor={(a) => a.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <AlertCard alert={item} onDelete={deleteAlert} onToggle={toggleAlert} />
        )}
        ListHeaderComponent={
          triggered.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>🎉 Prix atteints ({triggered.length})</Text>
            </View>
          )
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🔔</Text>
            <Text style={s.emptyTitle}>Pas d'alertes actives</Text>
            <Text style={s.emptySub}>
              Créez une alerte depuis la page d'un vol pour être notifié quand le prix baisse.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn:      { marginRight: 12, padding: 4 },
  backIcon:     { color: COLORS.accent, fontSize: 22 },
  headerTitle:  { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  list:         { padding: 16, paddingBottom: 32 },
  section:      { marginBottom: 8 },
  sectionTitle: { color: COLORS.success, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  card:         { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  cardTriggered:{ borderColor: COLORS.success },
  triggeredBanner: { backgroundColor: '#065F46', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, marginBottom: 12 },
  triggeredTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cardRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  route:        { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  dateTxt:      { color: COLORS.muted, fontSize: 12 },
  priceRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  priceBlock:   { alignItems: 'center' },
  priceLabel:   { color: COLORS.subtle, fontSize: 11, marginBottom: 2 },
  priceTarget:  { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  priceCurrent: { fontSize: 18, fontWeight: '800' },
  arrow:        { flex: 1, alignItems: 'center' },
  arrowTxt:     { color: COLORS.subtle, fontSize: 12 },
  diffBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  diffTxt:      { color: '#fff', fontSize: 13, fontWeight: '800' },
  deleteBtn:    { alignSelf: 'flex-end' },
  deleteTxt:    { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  empty:        { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyTitle:   { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub:     { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
