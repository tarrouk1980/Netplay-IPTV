import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_PROMOS = [
  { id: 'P1', type: 'percent', label: '-20% sur les pizzas', discount: 20, minOrder: 25, uses: 48, maxUses: 100, active: true, expiry: '10/06/2026' },
  { id: 'P2', type: 'fixed', label: 'Menu du jour -5 TND', discount: 5, minOrder: 20, uses: 12, maxUses: 50, active: true, expiry: '05/06/2026' },
  { id: 'P3', type: 'free_delivery', label: 'Livraison offerte', discount: 0, minOrder: 30, uses: 25, maxUses: 200, active: false, expiry: '30/06/2026' },
  { id: 'P4', type: 'percent', label: 'Happy Hour -15%', discount: 15, minOrder: 15, uses: 100, maxUses: 100, active: false, expiry: '01/06/2026' },
];

const TYPE_LABELS = { percent: 'Réduction %', fixed: 'Montant fixe', free_delivery: 'Livraison offerte' };
const TYPE_COLORS = { percent: COLORS.accent, fixed: COLORS.blue, free_delivery: COLORS.green };

export default function MerchantPromotionsScreen({ navigation }) {
  const [promos, setPromos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/merchant/promotions')
      .then(r => setPromos(r.data || MOCK_PROMOS))
      .catch(() => setPromos(MOCK_PROMOS))
      .finally(() => setLoading(false));
  }, []);

  const togglePromo = (id) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    const promo = promos.find(p => p.id === id);
    api.patch(`/api/merchant/promotions/${id}`, { active: !promo.active }).catch(() => {});
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette promotion ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: () => {
          setPromos(prev => prev.filter(p => p.id !== id));
          api.delete(`/api/merchant/promotions/${id}`).catch(() => {});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏷️ Mes Promotions</Text>
        <TouchableOpacity onPress={() => Alert.alert('Nouvelle promo', 'Formulaire de création à venir.')}>
          <Text style={styles.addBtn}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: COLORS.green }]}>{promos.filter(p => p.active).length}</Text>
              <Text style={styles.summaryLabel}>Actives</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: COLORS.muted }]}>{promos.filter(p => !p.active).length}</Text>
              <Text style={styles.summaryLabel}>Inactives</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryVal, { color: COLORS.accent }]}>{promos.reduce((s, p) => s + p.uses, 0)}</Text>
              <Text style={styles.summaryLabel}>Utilisations</Text>
            </View>
          </View>

          {promos.map(promo => {
            const fillPct = promo.maxUses > 0 ? Math.min((promo.uses / promo.maxUses) * 100, 100) : 0;
            const typeColor = TYPE_COLORS[promo.type] || COLORS.accent;
            return (
              <View key={promo.id} style={[styles.promoCard, !promo.active && { opacity: 0.6 }]}>
                <View style={styles.promoTop}>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.typeBadge, { backgroundColor: typeColor + '20', borderColor: typeColor + '40' }]}>
                      <Text style={[styles.typeText, { color: typeColor }]}>{TYPE_LABELS[promo.type]}</Text>
                    </View>
                    <Text style={styles.promoLabel}>{promo.label}</Text>
                    <Text style={styles.promoMeta}>
                      Min. commande: {promo.minOrder} TND · Expire: {promo.expiry}
                    </Text>
                  </View>
                  <Switch
                    value={promo.active}
                    onValueChange={() => togglePromo(promo.id)}
                    trackColor={{ false: COLORS.border, true: COLORS.green + '80' }}
                    thumbColor={promo.active ? COLORS.green : COLORS.muted}
                  />
                </View>

                <View style={styles.promoUsage}>
                  <View style={styles.usageBar}>
                    <View style={[styles.usageFill, { width: `${fillPct}%`, backgroundColor: fillPct >= 90 ? COLORS.red : COLORS.accent }]} />
                  </View>
                  <Text style={styles.usageText}>{promo.uses}/{promo.maxUses} utilisations</Text>
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(promo.id)}>
                  <Text style={styles.deleteBtnText}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity style={styles.createBtn} onPress={() => Alert.alert('Créer', 'Formulaire de création bientôt disponible.')}>
            <Text style={styles.createBtnText}>+ Créer une nouvelle promotion</Text>
          </TouchableOpacity>
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
  addBtn: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  summaryVal: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  promoCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  promoTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 6 },
  typeText: { fontSize: 10, fontWeight: '700' },
  promoLabel: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  promoMeta: { color: COLORS.muted, fontSize: 11 },
  promoUsage: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  usageBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  usageFill: { height: 6, borderRadius: 3 },
  usageText: { color: COLORS.muted, fontSize: 11, width: 100, textAlign: 'right' },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteBtnText: { color: COLORS.red, fontSize: 12, fontWeight: '600' },
  createBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  createBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
});
