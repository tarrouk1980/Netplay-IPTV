import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  accent: '#D32F2F',
  green: '#27AE60',
  blue: '#1565C0',
  orange: '#F57C00',
};

const ROLE_ICON = {
  CHAUFFEUR: '🚕',
  LIVREUR: '🛵',
  DEPANNEUR: '🛻',
  MARCHAND: '🏪',
};

const ROLE_LABEL = {
  CHAUFFEUR: 'Chauffeur',
  LIVREUR: 'Livreur',
  DEPANNEUR: 'Dépanneur',
  MARCHAND: 'Marchand',
};

const ROLE_COLOR = {
  CHAUFFEUR: COLORS.orange,
  LIVREUR: COLORS.green,
  DEPANNEUR: COLORS.accent,
  MARCHAND: '#00838F',
};

const SERVICE_SCREEN = {
  CHAUFFEUR: 'TaxiHome',
  LIVREUR: 'DeliveryHome',
  DEPANNEUR: 'SOSHome',
  MARCHAND: 'GroceryHome',
};

function FavoriteCard({ item, onRemove, onBook }) {
  const roleColor = ROLE_COLOR[item.role] || COLORS.muted;
  const roleIcon = ROLE_ICON[item.role] || '👤';

  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={[s.avatar, { borderColor: roleColor }]}>
          <Text style={{ fontSize: 26 }}>{roleIcon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.role}>{ROLE_LABEL[item.role] || item.role}</Text>
          {item.phone && <Text style={s.phone}>{item.phone}</Text>}
          <View style={s.metaRow}>
            {item.rating != null && (
              <Text style={s.rating}>⭐ {parseFloat(item.rating).toFixed(1)}</Text>
            )}
            {item.totalOrders != null && (
              <Text style={s.rides}>{item.totalOrders} courses</Text>
            )}
          </View>
        </View>
      </View>
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.bookBtn, { backgroundColor: roleColor }]}
          onPress={() => onBook(item)}
        >
          <Text style={s.bookTxt}>Réserver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.removeBtn} onPress={() => onRemove(item.id)}>
          <Text style={s.removeTxt}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ClientFavoriteProvidersScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/clients/favorites');
      setFavorites(res.data.favorites || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRemove = (providerId) => {
    Alert.alert('Retirer des favoris ?', 'Ce prestataire sera retiré de votre liste.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/clients/favorites/${providerId}`);
            setFavorites((prev) => prev.filter((f) => f.id !== providerId));
          } catch {
            Alert.alert('Erreur', 'Impossible de retirer.');
          }
        },
      },
    ]);
  };

  const handleBook = (provider) => {
    const screen = SERVICE_SCREEN[provider.role];
    if (screen) {
      navigation.navigate(screen, { preferredProviderId: provider.id });
    } else {
      Alert.alert('Info', 'Réservation directe non disponible pour ce type.');
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>❤️ Mes prestataires favoris</Text>
        <Text style={s.count}>{favorites.length}</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>💔</Text>
          <Text style={s.emptyTitle}>Aucun favori</Text>
          <Text style={s.emptySub}>
            Ajoutez des prestataires à vos favoris après une course pour les retrouver ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FavoriteCard item={item} onRemove={handleRemove} onBook={handleBook} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.green} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={
            <Text style={s.listHint}>
              Appuyez sur "Réserver" pour démarrer une nouvelle course avec ce prestataire.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backArrow: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  count: {
    color: COLORS.muted,
    fontSize: 13,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listHint: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  name: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  role: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  phone: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: 10 },
  rating: { color: '#F5A623', fontSize: 12, fontWeight: '600' },
  rides: { color: COLORS.muted, fontSize: 12 },
  actions: { gap: 8, alignItems: 'center' },
  bookBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  bookTxt: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeTxt: { color: COLORS.muted, fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
