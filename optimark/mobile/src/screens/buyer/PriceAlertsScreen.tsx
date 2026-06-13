import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

export default function PriceAlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/price-alerts')
      .then(r => setAlerts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

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
});
