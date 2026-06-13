import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

export default function PriceAlertsScreen({ navigation, route }: any) {
  const { productId: initProductId, productTitle, currentPrice } = route?.params || {};
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(!!initProductId);
  const [targetPrice, setTargetPrice] = useState(initProductId && currentPrice ? String((currentPrice * 0.9).toFixed(2)) : '');
  const [creating, setCreating] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/price-alerts')
      .then(r => setAlerts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const createAlert = async () => {
    if (!initProductId) return;
    setCreating(true);
    try {
      await api.post('/price-alerts', { productId: initProductId, targetPrice: parseFloat(targetPrice) || null });
      Alert.alert('✅', 'Alerte créée ! Vous serez notifié quand le prix baisse.');
      setShowCreate(false);
      // reload alerts
      const r = await api.get('/price-alerts');
      setAlerts(r.data.data || []);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Impossible de créer l\'alerte');
    } finally {
      setCreating(false);
    }
  };

  const remove = (productId: string) => {
    Alert.alert('Supprimer l\'alerte', 'Retirer cette alerte de prix ?', [
      { text: 'Annuler' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/price-alerts/${productId}`);
          setAlerts(prev => prev.filter(a => a.productId !== productId));
        } catch {
          Alert.alert('Erreur', 'Impossible de supprimer l\'alerte');
        }
      }},
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#9f1239" />;

  return (
    <View style={s.container}>
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>🔔 Créer une alerte</Text>
            {productTitle && <Text style={s.modalProduct} numberOfLines={2}>{productTitle}</Text>}
            {currentPrice && <Text style={s.modalCurrentPrice}>Prix actuel : {Number(currentPrice).toFixed(2)} TND</Text>}
            <Text style={s.modalLabel}>Prix cible (optionnel)</Text>
            <TextInput
              style={s.modalInput}
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
              placeholder="ex: 49.99"
              placeholderTextColor="#94a3b8"
            />
            <Text style={s.modalHint}>Laissez vide pour être alerté à chaque baisse de prix.</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#f1f5f9' }]} onPress={() => { setShowCreate(false); navigation.goBack(); }}>
                <Text style={{ color: '#64748b', fontWeight: '700' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { flex: 2, backgroundColor: '#9f1239' }]} onPress={createAlert} disabled={creating}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{creating ? 'Création...' : 'Créer l\'alerte'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={s.title}>🔔 Alertes de prix</Text>
      {alerts.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
          <Text style={s.emptyTitle}>Aucune alerte active</Text>
          <Text style={s.emptySub}>Activez une alerte sur une fiche produit pour être notifié quand le prix baisse.</Text>
          <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Home')}>
            <Text style={s.btnText}>Parcourir les produits</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={a => a.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              {item.product?.images?.[0] ? (
                <Image source={{ uri: item.product.images[0] }} style={s.img} />
              ) : (
                <View style={[s.img, s.imgPlaceholder]}>
                  <Text style={{ fontSize: 24 }}>📦</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.prodTitle} numberOfLines={2}>{item.product?.title || '—'}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  <Text style={s.price}>{item.product?.promoPrice ?? item.product?.price ?? '—'} TND</Text>
                  {item.targetPrice && (
                    <Text style={s.target}>Cible : {item.targetPrice} TND</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => remove(item.productId)} style={s.delBtn}>
                <Text style={{ color: '#ef4444', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  emptySub: { fontSize: 13, color: '#64748b', textAlign: 'center', paddingHorizontal: 24 },
  btn: { marginTop: 16, backgroundColor: '#9f1239', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  img: { width: 60, height: 60, borderRadius: 12 },
  imgPlaceholder: { backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  prodTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  price: { fontSize: 13, fontWeight: '900', color: '#9f1239' },
  target: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  delBtn: { padding: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  modalProduct: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 4 },
  modalCurrentPrice: { fontSize: 16, fontWeight: '900', color: '#9f1239', marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 6, textTransform: 'uppercase' },
  modalInput: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#0f172a', marginBottom: 4 },
  modalHint: { fontSize: 12, color: '#94a3b8' },
  modalBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
});
