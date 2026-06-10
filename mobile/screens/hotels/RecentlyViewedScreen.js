import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  StatusBar, Alert, SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@hotel_recently_viewed';

export function recordHotelView(hotel) {
  AsyncStorage.getItem(STORAGE_KEY).then(raw => {
    let list = [];
    try { list = JSON.parse(raw || '[]'); } catch {}
    // Remove existing entry
    list = list.filter(h => h.id !== hotel.id);
    // Add at front
    list.unshift({ ...hotel, viewedAt: new Date().toISOString() });
    // Keep only 10
    list = list.slice(0, 10);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }).catch(() => {});
}

function groupByDate(items) {
  const groups = {};
  items.forEach(item => {
    const date = item.viewedAt ? item.viewedAt.split('T')[0] : 'Inconnu';
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let label = date;
    if (date === today) label = 'Aujourd\'hui';
    else if (date === yesterday) label = 'Hier';
    else {
      const d = new Date(date);
      label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return Object.entries(groups).map(([title, data]) => ({ title, data: [data] }));
}

export default function RecentlyViewedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list = JSON.parse(raw || '[]');
      setHistory(list);
    } catch {}
    setLoading(false);
  }

  async function clearHistory() {
    Alert.alert('Effacer l\'historique', 'Voulez-vous supprimer tous les hôtels consultés?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Effacer', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setHistory([]);
        }
      }
    ]);
  }

  async function removeItem(id) {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  const sections = groupByDate(history);

  if (!loading && history.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#004E89', '#1a6eac']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Récemment consultés</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={60} color="#CBD5E0" />
          <Text style={styles.emptyTitle}>Aucun hôtel consulté</Text>
          <Text style={styles.emptySub}>Les hôtels que vous consultez apparaîtront ici</Text>
          <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('HotelSearch')}>
            <Text style={styles.searchBtnText}>Rechercher des hôtels</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#004E89', '#1a6eac']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Récemment consultés</Text>
          <Text style={styles.headerSub}>{history.length} hôtel{history.length > 1 ? 's' : ''}</Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
            <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `section-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionDate}>{title}</Text>
        )}
        renderItem={({ item: hotelGroup }) => (
          <FlatList
            data={hotelGroup}
            horizontal={false}
            keyExtractor={h => h.id}
            renderItem={({ item: hotel }) => (
              <TouchableOpacity
                style={styles.hotelCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('HotelDetail', { hotelId: hotel.id })}
              >
                <Image source={{ uri: hotel.mainImage }} style={styles.hotelImage} />
                <View style={styles.hotelContent}>
                  <Text style={styles.hotelName} numberOfLines={2}>{hotel.name}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
                      <Ionicons key={i} name="star" size={11} color="#F5A623" />
                    ))}
                  </View>
                  <View style={styles.priceRow}>
                    <Ionicons name="pricetag-outline" size={12} color="#A0AEC0" />
                    <Text style={styles.priceText}>
                      {hotel.bestPrice ? `${hotel.bestPrice} TND` : 'Prix non disponible'}
                    </Text>
                  </View>
                  <Text style={styles.viewedTime}>
                    Consulté à {hotel.viewedAt ? new Date(hotel.viewedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(hotel.id)}>
                  <Ionicons name="close" size={16} color="#A0AEC0" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  clearBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 },
  sectionDate: { fontSize: 14, fontWeight: '700', color: '#718096', marginBottom: 10, marginTop: 8 },
  hotelCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  hotelImage: { width: 100, height: 100 },
  hotelContent: { flex: 1, padding: 12 },
  hotelName: { fontSize: 14, fontWeight: '800', color: '#1A202C', marginBottom: 4, lineHeight: 19 },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  priceText: { fontSize: 13, fontWeight: '700', color: '#FF6B35' },
  viewedTime: { fontSize: 11, color: '#A0AEC0' },
  removeBtn: { padding: 10, alignSelf: 'flex-start' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#2D3748' },
  emptySub: { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 20 },
  searchBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13, marginTop: 8 },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
