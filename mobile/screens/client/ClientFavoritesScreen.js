import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const TABS = [
  { key: 'SHOPS', label: '🏪 Magasins' },
  { key: 'DRIVERS', label: '🚕 Chauffeurs' },
  { key: 'DISHES', label: '🍽️ Plats' },
];

export default function ClientFavoritesScreen({ navigation }) {
  const [tab, setTab] = useState('SHOPS');
  const [shops, setShops] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadFavorites = () => {
    setLoading(true);
    api.get('/api/client/favorites')
      .then(r => {
        setShops(r.data.shops || []);
        setDrivers(r.data.drivers || []);
        setDishes(r.data.dishes || []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFavorite = (type, id) => {
    Alert.alert('Retirer des favoris ?', '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer', style: 'destructive', onPress: () => {
          if (type === 'SHOPS') setShops(p => p.filter(s => s.id !== id));
          else if (type === 'DRIVERS') setDrivers(p => p.filter(d => d.id !== id));
          else setDishes(p => p.filter(f => f.id !== id));
          api.delete(`/api/client/favorites/${type.toLowerCase()}/${id}`).catch(() => {
            Alert.alert('Erreur', 'Impossible de retirer ce favori. Réessayez.');
          });
        },
      },
    ]);
  };

  const renderShop = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('GroceryShop', { shopId: item.id, shopName: item.name })}
      activeOpacity={0.85}
    >
      <View style={styles.cardIcon}>
        <Text style={{ fontSize: 28 }}>{item.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.category}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaRating}>★ {item.rating}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaTime}>{item.deliveryTime}</Text>
          {!item.open && <Text style={[styles.metaDot, { color: COLORS.red }]}>· Fermé</Text>}
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeFavorite('SHOPS', item.id)}>
        <Text style={{ fontSize: 20 }}>❤️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDriver = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardIcon}>
        <Text style={{ fontSize: 28 }}>{item.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.type}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaRating}>★ {item.rating}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaTime}>{item.rides} courses</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeFavorite('DRIVERS', item.id)}>
        <Text style={{ fontSize: 20 }}>❤️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDish = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardIcon}>
        <Text style={{ fontSize: 28 }}>{item.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>{item.shop}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaRating}>★ {item.rating}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={[styles.metaTime, { color: COLORS.accent }]}>{item.price.toFixed(3)} TND</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeFavorite('DISHES', item.id)}>
        <Text style={{ fontSize: 20 }}>❤️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const currentData = tab === 'SHOPS' ? shops : tab === 'DRIVERS' ? drivers : dishes;
  const renderItem = tab === 'SHOPS' ? renderShop : tab === 'DRIVERS' ? renderDriver : renderDish;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❤️ Favoris</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center', paddingHorizontal: 24 }}>
            Impossible de charger vos favoris. Réessayez.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 16, backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
            onPress={loadFavorites}
          >
            <Text style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40 }}>❤️</Text>
              <Text style={{ color: COLORS.muted, marginTop: 12 }}>Aucun favori dans cette catégorie</Text>
              <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 6 }}>Ajoutez-en depuis les pages de commande</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardIcon: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  cardSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  metaRating: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  metaDot: { color: COLORS.muted, fontSize: 12 },
  metaTime: { color: COLORS.muted, fontSize: 12 },
  removeBtn: { padding: 4 },
});
