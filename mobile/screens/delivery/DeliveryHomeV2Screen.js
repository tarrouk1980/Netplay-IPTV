import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  border: '#2A2A3A', text: '#FFFFFF', muted: '#8A8A9A',
  orange: '#F57C00', green: '#27AE60', teal: '#00838F',
  accent: '#D32F2F', gold: '#FFD700',
};

const CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burger', emoji: '🍔' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'asian', label: 'Asiatique', emoji: '🍜' },
  { id: 'salad', label: 'Salade', emoji: '🥗' },
  { id: 'dessert', label: 'Desserts', emoji: '🍰' },
];

const BANNERS = [
  { id: 'b1', title: 'Livraison gratuite', sub: 'Sur votre première commande', color: COLORS.teal },
  { id: 'b2', title: '-20% ce soir', sub: 'Code : SOIR20', color: COLORS.orange },
  { id: 'b3', title: 'Nouveau restaurant', sub: 'Pizza Roma est arrivé !', color: '#7B1FA2' },
];

const MOCK_RESTAURANTS = [
  { id: 'r1', name: 'Pizza Roma', cuisine: 'Italienne', rating: 4.8, time: '25-35 min', fee: 0, badge: 'Populaire', emoji: '🍕' },
  { id: 'r2', name: 'Burger House', cuisine: 'Américaine', rating: 4.6, time: '20-30 min', fee: 1.5, badge: 'Nouveau', emoji: '🍔' },
  { id: 'r3', name: 'Sushi Bar', cuisine: 'Japonaise', rating: 4.9, time: '30-45 min', fee: 2, badge: null, emoji: '🍱' },
  { id: 'r4', name: 'Tacos Factory', cuisine: 'Mexicaine', rating: 4.5, time: '15-25 min', fee: 0, badge: 'Populaire', emoji: '🌮' },
  { id: 'r5', name: 'Green Bowl', cuisine: 'Végétarien', rating: 4.7, time: '20-30 min', fee: 1, badge: null, emoji: '🥗' },
  { id: 'r6', name: 'Sweet Dreams', cuisine: 'Pâtisserie', rating: 4.8, time: '25-35 min', fee: 0, badge: 'Nouveau', emoji: '🍰' },
];

const FILTERS = ['Tous', 'Ouvert', 'Gratuit', 'Mieux noté'];

function Stars({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1,2,3,4,5].map((i) => (
        <Text key={i} style={{ fontSize: 10, color: i <= Math.round(rating) ? COLORS.gold : COLORS.border }}>★</Text>
      ))}
    </View>
  );
}

export default function DeliveryHomeV2Screen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = MOCK_RESTAURANTS.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'Gratuit' && r.fee > 0) return false;
    if (activeFilter === 'Mieux noté' && r.rating < 4.7) return false;
    return true;
  });

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.header}>
          <Text style={s.headerTitle}>🛵 Livraison</Text>
          <Text style={s.headerSub}>Que voulez-vous manger ?</Text>
        </View>

        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un restaurant ou plat..."
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 12 }}>
          {BANNERS.map((b) => (
            <View key={b.id} style={[s.banner, { backgroundColor: b.color }]}>
              <Text style={s.bannerTitle}>{b.title}</Text>
              <Text style={s.bannerSub}>{b.sub}</Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 4 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[s.catChip, activeCategory === cat.id && { borderColor: COLORS.teal, backgroundColor: COLORS.teal + '22' }]}
              onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            >
              <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
              <Text style={[s.catLabel, activeCategory === cat.id && { color: COLORS.teal }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, activeFilter === f && s.filterBtnActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[s.filterTxt, activeFilter === f && { color: COLORS.teal }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionTitle}>{filtered.length} restaurants</Text>

        {filtered.map((r) => (
          <TouchableOpacity key={r.id} style={s.restCard} onPress={() => navigation.navigate('Merchant', { merchantId: r.id })}>
            <View style={s.restImage}>
              <Text style={{ fontSize: 40 }}>{r.emoji}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={s.restName}>{r.name}</Text>
                {r.badge && (
                  <View style={[s.badge, { backgroundColor: r.badge === 'Nouveau' ? COLORS.teal + '22' : COLORS.orange + '22', borderColor: r.badge === 'Nouveau' ? COLORS.teal : COLORS.orange }]}>
                    <Text style={[s.badgeTxt, { color: r.badge === 'Nouveau' ? COLORS.teal : COLORS.orange }]}>{r.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={s.restCuisine}>{r.cuisine}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Stars rating={r.rating} />
                <Text style={s.restRating}>{r.rating}</Text>
                <Text style={s.restDot}>·</Text>
                <Text style={s.restTime}>{r.time}</Text>
                <Text style={s.restDot}>·</Text>
                <Text style={[s.restFee, { color: r.fee === 0 ? COLORS.green : COLORS.muted }]}>
                  {r.fee === 0 ? 'Gratuit' : `${r.fee.toFixed(3)} TND`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900' },
  headerSub: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  searchRow: { paddingHorizontal: 16, marginBottom: 4 },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  banner: { borderRadius: 14, padding: 16, width: 220, justifyContent: 'center' },
  bannerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  catChip: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, minWidth: 70 },
  catLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '600', marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { borderColor: COLORS.teal, backgroundColor: COLORS.teal + '22' },
  filterTxt: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginHorizontal: 16, marginBottom: 10 },
  restCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  restImage: { width: 64, height: 64, backgroundColor: COLORS.surfaceAlt, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  restName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  restCuisine: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  restRating: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  restDot: { color: COLORS.muted, fontSize: 11 },
  restTime: { color: COLORS.muted, fontSize: 11 },
  restFee: { fontSize: 11, fontWeight: '600' },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  badgeTxt: { fontSize: 9, fontWeight: '800' },
});
