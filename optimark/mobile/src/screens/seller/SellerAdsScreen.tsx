import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, TextInput, ScrollView, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

const AD_TYPES = [
  { key: 'PRODUCT_BOOST', label: 'Boost Produit', icon: '🚀', rate: '0.05 TND/clic' },
  { key: 'HOMEPAGE_BANNER', label: 'Bannière Accueil', icon: '🖼️', rate: '2.50 TND/jour' },
  { key: 'CATEGORY_SPOTLIGHT', label: 'Vedette Catégorie', icon: '⭐', rate: '1.00 TND/jour' },
  { key: 'SEARCH_PRIORITY', label: 'Priorité Recherche', icon: '🔍', rate: '0.08 TND/clic' },
];

const DURATION_OPTIONS = [3, 7, 14, 30];

export default function SellerAdsScreen() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ productId: '', type: 'PRODUCT_BOOST', budget: '', durationDays: 7 });
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/ads'),
      api.get('/ads/stats'),
      api.get('/vendors/products'),
    ])
      .then(([c, s, p]) => {
        setCampaigns(c.data?.data || []);
        setStats(s.data?.data);
        setProducts(p.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const createCampaign = async () => {
    if (!form.budget || Number(form.budget) <= 0) {
      Alert.alert('Erreur', 'Entrez un budget valide');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/ads', {
        productId: form.productId || undefined,
        type: form.type,
        budget: Number(form.budget),
        durationDays: form.durationDays,
      });
      setCampaigns(prev => [res.data.data, ...prev]);
      setModalVisible(false);
      setForm({ productId: '', type: 'PRODUCT_BOOST', budget: '', durationDays: 7 });
      Alert.alert('✅ Succès', 'Campagne lancée !');
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la campagne');
    } finally {
      setSaving(false);
    }
  };

  const toggleCampaign = async (id: string) => {
    try {
      const res = await api.patch(`/ads/${id}/toggle`);
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, isActive: res.data.data.isActive } : c));
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier');
    }
  };

  const deleteCampaign = (id: string) => {
    Alert.alert('Supprimer', 'Supprimer cette campagne ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await api.delete(`/ads/${id}`).catch(() => {});
          setCampaigns(prev => prev.filter(c => c.id !== id));
        },
      },
    ]);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#9f1239" />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Stats */}
        {stats && (
          <View style={styles.statsRow}>
            {[
              { label: 'Actives', value: stats.activeCampaigns, color: '#15803d' },
              { label: 'Budget', value: `${stats.totalBudget?.toFixed(0)} TND`, color: '#9f1239' },
              { label: 'Impressions', value: stats.totalImpressions, color: '#7e22ce' },
              { label: 'CTR', value: `${stats.ctr}%`, color: '#b45309' },
            ].map(item => (
              <View key={item.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Type cards */}
        <Text style={styles.sectionTitle}>Types de campagne</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {AD_TYPES.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setForm(f => ({ ...f, type: t.key }))}
              style={[styles.typeCard, form.type === t.key && styles.typeCardActive]}
            >
              <Text style={styles.typeIcon}>{t.icon}</Text>
              <Text style={styles.typeLabel}>{t.label}</Text>
              <Text style={styles.typeRate}>{t.rate}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Campaigns */}
        <Text style={styles.sectionTitle}>Mes campagnes</Text>
        {campaigns.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📣</Text>
            <Text style={styles.emptyText}>Aucune campagne</Text>
            <Text style={styles.emptySubText}>Boostez vos produits pour plus de visibilité</Text>
          </View>
        ) : (
          campaigns.map(c => {
            const type = AD_TYPES.find(t => t.key === c.type) || AD_TYPES[0];
            const isExpired = new Date(c.endsAt) < new Date();
            return (
              <View key={c.id} style={styles.campaignCard}>
                <View style={styles.campaignHeader}>
                  <Text style={styles.campaignIcon}>{type.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.campaignTitle}>{type.label}</Text>
                    {c.product && <Text style={styles.campaignProduct}>{c.product.title}</Text>}
                  </View>
                  <View style={[styles.badge, isExpired ? styles.badgeGray : c.isActive ? styles.badgeGreen : styles.badgeAmber]}>
                    <Text style={styles.badgeText}>{isExpired ? 'Expirée' : c.isActive ? 'Active' : 'Suspendue'}</Text>
                  </View>
                </View>
                <View style={styles.campaignStats}>
                  <Text style={styles.campaignStat}>Budget: <Text style={{ fontWeight: '700' }}>{c.budget?.toFixed(2)} TND</Text></Text>
                  <Text style={styles.campaignStat}>Impressions: <Text style={{ fontWeight: '700' }}>{c.impressions}</Text></Text>
                  <Text style={styles.campaignStat}>Clics: <Text style={{ fontWeight: '700' }}>{c.clicks}</Text></Text>
                </View>
                {!isExpired && (
                  <View style={styles.campaignActions}>
                    <TouchableOpacity onPress={() => toggleCampaign(c.id)}
                      style={[styles.actionBtn, c.isActive ? styles.actionBtnAmber : styles.actionBtnGreen]}>
                      <Text style={[styles.actionBtnText, { color: c.isActive ? '#b45309' : '#15803d' }]}>
                        {c.isActive ? 'Suspendre' : 'Activer'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteCampaign(c.id)} style={[styles.actionBtn, styles.actionBtnRed]}>
                      <Text style={[styles.actionBtnText, { color: '#9f1239' }]}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Nouvelle campagne</Text>
      </TouchableOpacity>

      {/* Create modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Créer une campagne</Text>

          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeGrid}>
            {AD_TYPES.map(t => (
              <TouchableOpacity key={t.key} onPress={() => setForm(f => ({ ...f, type: t.key }))}
                style={[styles.typeOption, form.type === t.key && styles.typeOptionActive]}>
                <Text>{t.icon} {t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Produit (optionnel)</Text>
          <View style={styles.productList}>
            <TouchableOpacity onPress={() => setForm(f => ({ ...f, productId: '' }))}
              style={[styles.productOption, !form.productId && styles.productOptionActive]}>
              <Text style={{ fontSize: 13 }}>— Boutique entière —</Text>
            </TouchableOpacity>
            {products.slice(0, 10).map((p: any) => (
              <TouchableOpacity key={p.id} onPress={() => setForm(f => ({ ...f, productId: p.id }))}
                style={[styles.productOption, form.productId === p.id && styles.productOptionActive]}>
                <Text style={{ fontSize: 13 }} numberOfLines={1}>{p.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Budget (TND)</Text>
          <TextInput value={form.budget} onChangeText={v => setForm(f => ({ ...f, budget: v }))}
            keyboardType="numeric" placeholder="Ex: 50 TND" style={styles.input} />

          <Text style={styles.fieldLabel}>Durée</Text>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map(d => (
              <TouchableOpacity key={d} onPress={() => setForm(f => ({ ...f, durationDays: d }))}
                style={[styles.durationBtn, form.durationDays === d && styles.durationBtnActive]}>
                <Text style={[styles.durationText, form.durationDays === d && { color: '#fff' }]}>{d}j</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={createCampaign} disabled={saving}>
            <Text style={styles.submitText}>{saving ? 'Lancement...' : 'Lancer la campagne'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, padding: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b', paddingHorizontal: 16, marginBottom: 8, marginTop: 8 },
  typeScroll: { paddingLeft: 16, marginBottom: 8 },
  typeCard: { width: 130, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginRight: 10, borderWidth: 2, borderColor: 'transparent' },
  typeCardActive: { borderColor: '#9f1239' },
  typeIcon: { fontSize: 24, marginBottom: 4 },
  typeLabel: { fontSize: 12, fontWeight: '700', color: '#1e293b' },
  typeRate: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#475569' },
  emptySubText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 4 },
  campaignCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 14, elevation: 2 },
  campaignHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  campaignIcon: { fontSize: 24 },
  campaignTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  campaignProduct: { fontSize: 12, color: '#64748b' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  badgeGreen: { backgroundColor: '#dcfce7' },
  badgeAmber: { backgroundColor: '#fef9c3' },
  badgeGray: { backgroundColor: '#f1f5f9' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#1e293b' },
  campaignStats: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  campaignStat: { fontSize: 12, color: '#64748b' },
  campaignActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  actionBtnGreen: { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' },
  actionBtnAmber: { borderColor: '#fde68a', backgroundColor: '#fffbeb' },
  actionBtnRed: { borderColor: '#fecdd3', backgroundColor: '#fff1f2' },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#9f1239', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  modal: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 20, marginTop: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 6, textTransform: 'uppercase' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0' },
  typeOptionActive: { borderColor: '#9f1239', backgroundColor: '#fff1f2' },
  productList: { gap: 4, marginBottom: 16 },
  productOption: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0' },
  productOptionActive: { borderColor: '#9f1239', backgroundColor: '#fff1f2' },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 16, color: '#1e293b' },
  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  durationBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center' },
  durationBtnActive: { backgroundColor: '#9f1239', borderColor: '#9f1239' },
  durationText: { fontWeight: '700', color: '#475569' },
  submitBtn: { backgroundColor: '#9f1239', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: '#64748b', fontWeight: '600' },
});
