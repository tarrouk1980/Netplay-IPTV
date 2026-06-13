import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

export default function FollowedSellersScreen({ navigation }: any) {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/vendors/following/my')
      .then(r => setSellers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const unfollow = (sellerId: string, name: string) => {
    Alert.alert('Se désabonner', `Se désabonner de ${name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se désabonner', style: 'destructive', onPress: async () => {
        await api.post(`/vendors/${sellerId}/follow`).catch(() => {});
        setSellers(prev => prev.filter(s => s.sellerId !== sellerId));
      }},
    ]);
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <FlatList
      data={sellers}
      keyExtractor={s => s.sellerId}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>🔔</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>Aucune boutique suivie</Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center', paddingHorizontal: 32 }}>Suivez vos boutiques préférées pour ne manquer aucune promotion.</Text>
          <TouchableOpacity style={s.discoverBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Découvrir des boutiques</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'B'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.name}</Text>
            {item.description ? <Text style={s.desc} numberOfLines={1}>{item.description}</Text> : null}
          </View>
          <View style={s.actions}>
            <TouchableOpacity style={s.visitBtn} onPress={() => navigation.navigate('SellerStore', { sellerId: item.sellerId })}>
              <Text style={{ color: '#9f1239', fontWeight: '700', fontSize: 12 }}>Visiter</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => unfollow(item.sellerId, item.name)}>
              <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>Se désabonner</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#9f1239', alignItems: 'center', justifyContent: 'center', shrink: 0 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  name: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  desc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  actions: { alignItems: 'flex-end', gap: 6 },
  visitBtn: { backgroundColor: '#fff1f2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#fecdd3' },
  discoverBtn: { backgroundColor: '#9f1239', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
});
