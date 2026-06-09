import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, FlatList, Image, StatusBar, SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api, Expert, Category, Paginated } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ExpertCard } from '@/components/ExpertCard';

const CATEGORY_ICONS: Record<string, string> = {
  default: '💼', tech: '💻', marketing: '📈', design: '🎨',
  finance: '💰', coaching: '🎯', legal: '⚖️', health: '🏥',
};

export default function HomeScreen() {
  const [search, setSearch] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
  });

  const { data: featuredExperts } = useQuery({
    queryKey: ['featured-experts-mobile'],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Expert>>('/experts', {
        params: { sort: 'rating_avg', direction: 'desc', per_page: 6 },
      });
      return data.data.slice(0, 6);
    },
  });

  function handleSearch() {
    if (search.trim()) {
      router.push(`/experts?q=${encodeURIComponent(search)}` as any);
    } else {
      router.push('/experts' as any);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#3730A3" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero gradient */}
        <LinearGradient
          colors={['#1E1B4B', '#4338CA', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.heroTitle}>Trouvez votre{'\n'}expert idéal</Text>
          <Text style={styles.heroSub}>500+ experts vérifiés disponibles maintenant</Text>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              placeholder="SEO, finance, coaching..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Trust bar */}
        <View style={styles.trustBar}>
          <View style={styles.trustItem}>
            <Text style={styles.trustNum}>⭐ 4.9</Text>
            <Text style={styles.trustLabel}>satisfaction</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNum}>500+</Text>
            <Text style={styles.trustLabel}>experts</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNum}>50K+</Text>
            <Text style={styles.trustLabel}>sessions</Text>
          </View>
        </View>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Domaines</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.chip}
                  onPress={() => router.push(`/experts?category_id=${cat.id}` as any)}
                >
                  <Text style={styles.chipIcon}>{CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default}</Text>
                  <Text style={styles.chipText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured experts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experts en vedette</Text>
            <TouchableOpacity onPress={() => router.push('/experts' as any)}>
              <Text style={styles.seeAll}>Voir tous →</Text>
            </TouchableOpacity>
          </View>

          {featuredExperts && featuredExperts.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {featuredExperts.map((expert) => (
                <View key={expert.id} style={styles.horizontalCard}>
                  <ExpertCard expert={expert} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.loadingPlaceholder}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          )}
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment ça marche</Text>
          <View style={styles.stepsContainer}>
            {[
              { num: '01', icon: '🔍', title: 'Recherchez', desc: 'Parcourez nos experts vérifiés par domaine ou spécialité.' },
              { num: '02', icon: '📅', title: 'Réservez', desc: 'Choisissez un créneau et payez en toute sécurité.' },
              { num: '03', icon: '🚀', title: 'Progressez', desc: 'Échangez avec votre expert et repartez avec un plan d\'action.' },
            ].map((step) => (
              <View key={step.num} style={styles.stepCard}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                  <Text style={styles.stepNum}>{step.num}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <LinearGradient
          colors={['#1E1B4B', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaBanner}
        >
          <Text style={styles.ctaTitle}>Prêt à partager votre expertise ?</Text>
          <Text style={styles.ctaDesc}>Rejoignez notre réseau d&apos;experts vérifiés</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/register' as any)}>
            <Text style={styles.ctaButtonText}>Commencer gratuitement</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  hero: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  greeting: { color: '#A5B4FC', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '800', lineHeight: 40, marginBottom: 8 },
  heroSub: { color: '#C7D2FE', fontSize: 13, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 99, paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  trustBar: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  trustItem: { alignItems: 'center', flex: 1 },
  trustNum: { fontSize: 14, fontWeight: '700', color: '#1E1B4B' },
  trustLabel: { fontSize: 10, color: '#6B7280', marginTop: 1 },
  trustDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E1B4B', marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  chipsScroll: { marginBottom: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  chipIcon: { fontSize: 16 },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  horizontalScroll: { marginHorizontal: -4 },
  horizontalCard: { width: 280, paddingHorizontal: 4 },
  loadingPlaceholder: { height: 100, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9CA3AF', fontSize: 14 },
  stepsContainer: { gap: 12 },
  stepCard: {
    flexDirection: 'row', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  stepIconContainer: { width: 52, height: 52, backgroundColor: '#EEF2FF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  stepIcon: { fontSize: 24 },
  stepNum: { position: 'absolute', bottom: -4, right: -4, fontSize: 10, fontWeight: '800', color: '#C7D2FE', backgroundColor: '#EEF2FF', lineHeight: 14 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
  stepDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  ctaBanner: { margin: 16, borderRadius: 20, padding: 24 },
  ctaTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  ctaDesc: { color: '#C7D2FE', fontSize: 13, marginBottom: 16 },
  ctaButton: { backgroundColor: '#fff', borderRadius: 99, paddingVertical: 12, paddingHorizontal: 24, alignSelf: 'flex-start' },
  ctaButtonText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },
});
