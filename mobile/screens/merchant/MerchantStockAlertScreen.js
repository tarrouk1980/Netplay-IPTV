import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', orange: '#FF9800',
};

const STOCK_ITEMS = [
  { id: '1', name: 'Eau Safia 1.5L', sku: 'SKU001', stock: 2, minStock: 10, category: 'Boissons', critical: true },
  { id: '2', name: 'Pain de mie Harry\'s', sku: 'SKU008', stock: 5, minStock: 20, category: 'Boulangerie', critical: false },
  { id: '3', name: 'Lait Délice 1L', sku: 'SKU012', stock: 0, minStock: 15, category: 'Produits laitiers', critical: true },
  { id: '4', name: 'Chips Bonito 100g', sku: 'SKU019', stock: 8, minStock: 30, category: 'Snacks', critical: false },
  { id: '5', name: 'Jus Rania 1L', sku: 'SKU031', stock: 3, minStock: 12, category: 'Boissons', critical: true },
];

export default function MerchantStockAlertScreen({ navigation }) {
  const [dismissed, setDismissed] = useState([]);

  const visible = STOCK_ITEMS.filter(i => !dismissed.includes(i.id));
  const critical = visible.filter(i => i.critical).length;

  const handleRestock = (item) => {
    Alert.alert(
      'Commander du stock',
      `Envoyer une demande de réapprovisionnement pour "${item.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Commander', onPress: () => {
          Alert.alert('Demande envoyée', `Une commande pour "${item.name}" a été transmise.`);
          setDismissed(prev => [...prev, item.id]);
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚠️ Alertes de stock</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{visible.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {critical > 0 && (
          <View style={styles.criticalBanner}>
            <Text style={styles.criticalText}>🔴 {critical} produit{critical > 1 ? 's' : ''} en rupture de stock totale</Text>
          </View>
        )}

        {visible.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>Aucune alerte de stock</Text>
          </View>
        ) : (
          visible.map(item => (
            <View key={item.id} style={[styles.itemCard, item.stock === 0 && styles.itemCardCritical]}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.sku} · {item.category}</Text>
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

              <TouchableOpacity style={styles.restockBtn} onPress={() => handleRestock(item)}>
                <Text style={styles.restockText}>📦 Commander du stock</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
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
