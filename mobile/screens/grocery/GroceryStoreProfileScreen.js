import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

export default function GroceryStoreProfileScreen({ navigation, route }) {
  const storeId = route?.params?.storeId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!storeId) {
      setError(true);
      setLoading(false);
      return;
    }
    api.get(`/api/merchants/${storeId}`)
      .then(r => setData(r.data?.merchant))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [storeId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Profil boutique</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : error || !data ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
            Impossible de charger les informations de la boutique. Veuillez réessayer plus tard.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}><Text style={{ fontSize: 48 }}>🏪</Text></View>
            <Text style={styles.heroName}>{data.name}</Text>
            <Text style={styles.heroCategory}>{data.category}</Text>
            <View style={styles.heroMeta}>
              {(data.rating != null || data.reviews != null) && (
                <Text style={styles.heroMetaItem}>⭐ {data.rating ?? '—'} ({data.reviews ?? 0})</Text>
              )}
              {data.distance != null && <Text style={styles.heroMetaItem}>📏 {data.distance} km</Text>}
              <Text style={[styles.heroMetaItem, { color: data.open ? COLORS.green : COLORS.red }]}>
                {data.open ? '🟢 Ouvert' : '🔴 Fermé'}
              </Text>
            </View>
            {Array.isArray(data.badges) && data.badges.length > 0 && (
              <View style={styles.badgesRow}>
                {data.badges.map(b => (
                  <View key={b} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoVal}>{data.deliveryTime ?? '—'}</Text>
              <Text style={styles.infoLabel}>Livraison</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💰</Text>
              <Text style={styles.infoVal}>{Number(data.deliveryFee ?? 0).toFixed(3)}</Text>
              <Text style={styles.infoLabel}>TND livraison</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🛒</Text>
              <Text style={styles.infoVal}>{data.minOrder ?? '—'} TND</Text>
              <Text style={styles.infoLabel}>Min. commande</Text>
            </View>
          </View>

          <View style={{ padding: 16 }}>
            {Array.isArray(data.categories) && data.categories.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>CATÉGORIES</Text>
                <View style={styles.categoriesGrid}>
                  {data.categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.catCard}
                      onPress={() => navigation.navigate('GroceryShop', { storeId, categoryId: cat.id })}
                    >
                      <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                      <Text style={styles.catName}>{cat.name}</Text>
                      <Text style={styles.catCount}>{cat.count} produits</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {Array.isArray(data.reviews_sample) && data.reviews_sample.length > 0 && (
              <Text style={styles.sectionTitle}>AVIS CLIENTS</Text>
            )}
            {(data.reviews_sample ?? []).map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewAuthor}>{r.author}</Text>
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
                <Text style={styles.reviewStars}>{'⭐'.repeat(r.rating)}</Text>
                <Text style={styles.reviewText}>{r.comment}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('GroceryShop', { storeId })}
        >
          <Text style={styles.shopBtnText}>🛒 Commencer mes courses →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  heroCard: { backgroundColor: COLORS.surface, padding: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  heroName: { color: COLORS.text, fontSize: 18, fontWeight: '900', marginBottom: 4, textAlign: 'center' },
  heroCategory: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  heroMeta: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  heroMetaItem: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  badge: { backgroundColor: COLORS.blue + '20', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.blue + '40' },
  badgeText: { color: COLORS.blue, fontSize: 11, fontWeight: '700' },
  infoRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoCard: { flex: 1, padding: 16, alignItems: 'center', gap: 4 },
  infoIcon: { fontSize: 20 },
  infoVal: { color: COLORS.text, fontSize: 14, fontWeight: '900' },
  infoLabel: { color: COLORS.muted, fontSize: 10 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catCard: { width: '30%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border },
  catName: { color: COLORS.text, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  catCount: { color: COLORS.muted, fontSize: 9 },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewAuthor: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  reviewDate: { color: COLORS.muted, fontSize: 11 },
  reviewStars: { fontSize: 12, marginBottom: 6 },
  reviewText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  shopBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  shopBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
});
