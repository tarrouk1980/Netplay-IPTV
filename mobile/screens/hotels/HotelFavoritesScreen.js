import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import HotelCard from '../../components/hotels/HotelCard';
import hotelAPI from '../../services/hotelService';

export default function HotelFavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useFocusEffect(useCallback(() => { loadFavorites(); }, []));

  async function loadFavorites() {
    setLoading(true);
    try {
      const res = await hotelAPI.getFeatured(); // Use featured as mock favorites
      const data = res.data?.data || [];
      setFavorites(data);
      setFavoriteIds(new Set(data.map(h => h.id)));
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  function removeFavorite(hotelId) {
    setFavorites(f => f.filter(h => h.id !== hotelId));
    setFavoriteIds(s => { const n = new Set(s); n.delete(hotelId); return n; });
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#004E89', '#1a6eac']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mes favoris</Text>
          <Text style={styles.headerSub}>{favorites.length} hôtel{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}</Text>
        </View>
        <Ionicons name="heart" size={24} color="#FF6B35" />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#CBD5E0" />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>Ajoutez des hôtels à vos favoris pour les retrouver facilement ici.</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('HotelSearch')}>
            <Text style={styles.exploreBtnText}>Explorer les hôtels</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={h => h.id}
          renderItem={({ item }) => (
            <HotelCard
              hotel={{ ...item, bestOffer: item.bestOffer || item.bestPrice ? { discountedPrice: item.bestPrice, providerName: 'Booking.com', providerLogo: 'B', providerColor: '#003580' } : undefined }}
              isFavorite
              onFavorite={() => removeFavorite(item.id)}
              onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id, checkIn: today, checkOut: tomorrow, guests: 2 })}
            />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  backBtn: { padding: 6 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#2D3748', marginTop: 20, marginBottom: 10 },
  emptyText: { fontSize: 15, color: '#718096', textAlign: 'center', lineHeight: 22 },
  exploreBtn: { marginTop: 28, backgroundColor: '#FF6B35', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
