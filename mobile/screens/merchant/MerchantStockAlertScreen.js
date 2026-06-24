import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', orange: '#FF9800',
};

export default function MerchantStockAlertScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [restockingId, setRestockingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/api/merchants/me/low-stock');
      setItems(res.data?.items || []);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const critical = items.filter(i => i.critical).length;

  const handleRestock = (item) => {
    Alert.alert(
      'Commander du stock',
      `Remettre le stock de "${item.name}" au niveau minimum (${item.minStock}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Commander', onPress: () => doRestock(item) },
      ]
    );
  };

  const doRestock = async (item) => {
    setRestockingId(item.id);
    try {
      await api.patch(`/api/merchants/me/products/${item.id}`, { stock: item.minStock });
      Alert.alert('Stock mis à jour', `Le stock de "${item.name}" a été réapprovisionné.`);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le stock. Réessayez.');
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚠️ Alertes de stock</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{items.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : error ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>Impossible de charger les alertes de stock</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.restockText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {critical > 0 && (
            <View style={styles.criticalBanner}>
              <Text style={styles.criticalText}>🔴 {critical} produit{critical > 1 ? 's' : ''} en rupture de stock totale</Text>
            </View>
          )}

          {items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>Aucune alerte de stock</Text>
            </View>
          ) : (
            items.map(item => (
              <View key={item.id} style={[styles.itemCard, item.stock === 0 && styles.itemCardCritical]}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>{item.category}</Text>
                  </View>
                  <View style={[styles.stockBadge, { backgroundColor: item.stock === 0 ? COLORS.red + '20' : COLORS.orange + '20' }]}>
                    <Text style={[styles.stockText, { color: item.stock === 0 ? COLORS.red : COLORS.orange }]}>
                      {item.stock === 0 ? 'Rupture' : `${item.stock} restants`}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressRow}>
                  <View style={styles.progressBg}>
                    <View style={[
                      styles.progressFill,
                      {
                        width: `${Math.min((item.stock / item.minStock) * 100, 100)}%`,
                        backgroundColor: item.stock === 0 ? COLORS.red : COLORS.orange,
                      }
                    ]} />
                  </View>
                  <Text style={styles.progressLabel}>Min: {item.minStock}</Text>
                </View>

                <TouchableOpacity
                  style={styles.restockBtn}
                  onPress={() => handleRestock(item)}
                  disabled={restockingId === item.id}
                >
                  <Text style={styles.restockText}>
                    {restockingId === item.id ? 'Mise à jour...' : '📦 Commander du stock'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  badge: {
    backgroundColor: COLORS.red, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  content: { padding: 16, paddingBottom: 40 },
  criticalBanner: {
    backgroundColor: COLORS.red + '20', borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.red + '50',
  },
  criticalText: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20,
    borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  itemCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  itemCardCritical: { borderColor: COLORS.red + '60' },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  itemMeta: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  stockBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  stockText: { fontSize: 12, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  progressBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, minWidth: 4 },
  progressLabel: { color: COLORS.muted, fontSize: 10, width: 50 },
  restockBtn: {
    backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  restockText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
});
