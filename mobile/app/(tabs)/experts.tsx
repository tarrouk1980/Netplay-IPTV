import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api, Expert, Category, Paginated } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { ExpertCard } from '@/components/ExpertCard';

export default function ExpertsScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['experts', debouncedSearch, selectedCategory, page],
    queryFn: async () => {
      const params: Record<string, string> = { page: String(page), per_page: '10' };
      if (debouncedSearch) params.q = debouncedSearch;
      if (selectedCategory) params.category_id = selectedCategory;
      const { data } = await api.get<Paginated<Expert>>('/experts', { params });
      return data;
    },
  });

  const experts = data?.data ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Experts</Text>
        <Text style={styles.headerSub}>Trouvez votre expert idéal</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1); }}
            placeholder="Rechercher un expert..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setPage(1); }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category chips */}
      {categories && (
        <View style={styles.chipsWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 0, name: 'Tous', slug: '' }, ...(categories || [])]}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.chipsContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { setSelectedCategory(String(item.id === 0 ? '' : item.id)); setPage(1); }}
                style={[styles.chip, selectedCategory === String(item.id === 0 ? '' : item.id) && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedCategory === String(item.id === 0 ? '' : item.id) && styles.chipTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Result count */}
      {data && (
        <Text style={styles.resultCount}>
          {data.total ?? experts.length} expert{(data.total ?? experts.length) > 1 ? 's' : ''} trouvé{(data.total ?? experts.length) > 1 ? 's' : ''}
        </Text>
      )}

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : experts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Aucun expert trouvé</Text>
          <Text style={styles.emptyDesc}>Essayez de modifier vos critères</Text>
        </View>
      ) : (
        <FlatList
          data={experts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ExpertCard expert={item} />}
          ListFooterComponent={
            data && data.last_page > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  disabled={page <= 1}
                  onPress={() => setPage(p => Math.max(1, p - 1))}
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                >
                  <Text style={styles.pageBtnText}>← Précédent</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>{page} / {data.last_page}</Text>
                <TouchableOpacity
                  disabled={page >= data.last_page}
                  onPress={() => setPage(p => p + 1)}
                  style={[styles.pageBtn, page >= data.last_page && styles.pageBtnDisabled]}
                >
                  <Text style={styles.pageBtnText}>Suivant →</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1E1B4B', marginBottom: 2 },
  headerSub: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 99, paddingHorizontal: 14, paddingVertical: 10, gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E1B4B' },
  chipsWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  chipsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#fff' },
  resultCount: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 12, color: '#6B7280' },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B' },
  emptyDesc: { fontSize: 13, color: '#6B7280' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  pageBtn: { backgroundColor: '#fff', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  pageInfo: { fontSize: 13, color: '#6B7280' },
});
