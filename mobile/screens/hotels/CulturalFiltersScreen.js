import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, StatusBar, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import hotelAPI from '../../services/hotelService';

const STORAGE_KEY = '@cultural_filters';

const FILTER_SECTIONS = [
  {
    title: 'Valeurs Islamiques',
    icon: 'moon',
    color: '#004E89',
    filters: [
      { key: 'isAlcoholFree', label: 'Sans Alcool', desc: "Aucun alcool servi dans l'établissement", icon: 'ban' },
      { key: 'isHalalCertified', label: 'Cuisine Halal Certifiée', desc: 'Certification halal officielle', icon: 'leaf' },
      { key: 'hasPrayerRoom', label: 'Salle de Prière', desc: 'Mosquée ou salle de prière disponible', icon: 'home' },
      { key: 'hasRamadanServices', label: 'Services Ramadan', desc: 'Iftar, Suhour, ambiance Ramadan', icon: 'moon' },
    ],
  },
  {
    title: 'Famille & Pudeur',
    icon: 'people',
    color: '#27AE60',
    filters: [
      { key: 'isBurkiniAccepted', label: 'Burkini Accepté', desc: 'Port du burkini autorisé à la piscine', icon: 'shirt' },
      { key: 'hasSeparatePool', label: 'Piscine Séparée', desc: 'Espaces baignade séparés hommes/femmes', icon: 'water' },
      { key: 'isFamilyConservative', label: 'Famille Conservatrice', desc: 'Spectacles et animations respectueux', icon: 'people' },
    ],
  },
  {
    title: 'Occasions Spéciales',
    icon: 'gift',
    color: '#8E44AD',
    filters: [
      { key: 'isHoneymoonPackage', label: 'Package Lune de Miel', desc: 'Chambre romantique, dîner privé halal', icon: 'heart' },
      { key: 'isMedicalTourism', label: 'Tourisme Médical', desc: 'Proche centres médicaux et thalasso', icon: 'medkit' },
    ],
  },
  {
    title: 'Praticité',
    icon: 'airplane',
    color: '#FF6B35',
    filters: [
      { key: 'hasAirportShuttle', label: 'Navette Aéroport', desc: 'Service transfert aéroport inclus', icon: 'bus' },
      { key: 'isBeachfront', label: 'Bord de mer', desc: 'Accès direct plage ou mer', icon: 'umbrella' },
    ],
  },
];

const DEFAULT_FILTERS = {
  isAlcoholFree: false,
  isBurkiniAccepted: false,
  isHalalCertified: false,
  hasRamadanServices: false,
  hasPrayerRoom: false,
  hasSeparatePool: false,
  isFamilyConservative: false,
  isMedicalTourism: false,
  isHoneymoonPackage: false,
  hasAirportShuttle: false,
  isBeachfront: false,
};

export default function CulturalFiltersScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { checkIn = '', checkOut = '', guests = 2, destination = '' } = route.params || {};

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) {
        try { setFilters(JSON.parse(val)); } catch {}
      }
    });
  }, []);

  useEffect(() => {
    computeMatchCount();
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filters)).catch(() => {});
  }, [filters]);

  async function computeMatchCount() {
    setLoading(true);
    try {
      const activeFilters = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) activeFilters[k] = 'true'; });
      const params = { ...activeFilters, page: 1, limit: 100 };
      const res = await hotelAPI.search(params);
      setMatchCount(res.data?.meta?.total || res.data?.data?.length || 0);
    } catch {
      setMatchCount(0);
    } finally {
      setLoading(false);
    }
  }

  function toggleFilter(key) {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS);
  }

  function handleSearch() {
    const activeFilters = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) activeFilters[k] = 'true'; });
    navigation.navigate('HotelResults', { destination, checkIn, checkOut, guests, ...activeFilters });
  }

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#004E89', '#1a6eac']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Filtres Culturels & Familiaux</Text>
          <Text style={styles.headerSubtitle}>Trouvez l'hôtel qui correspond à vos valeurs</Text>
        </View>
        {activeCount > 0 && (
          <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Effacer ({activeCount})</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {FILTER_SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
                <Ionicons name={section.icon} size={18} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.filters.map(filter => (
              <View key={filter.key} style={styles.filterRow}>
                <View style={[styles.filterIconWrap, { backgroundColor: section.color + '15' }]}>
                  <Ionicons name={filter.icon + '-outline'} size={20} color={section.color} />
                </View>
                <View style={styles.filterInfo}>
                  <Text style={styles.filterLabel}>{filter.label}</Text>
                  <Text style={styles.filterDesc}>{filter.desc}</Text>
                </View>
                <Switch
                  value={filters[filter.key]}
                  onValueChange={() => toggleFilter(filter.key)}
                  trackColor={{ false: '#E2E8F0', true: '#FF6B35' }}
                  thumbColor={filters[filter.key] ? '#fff' : '#A0AEC0'}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
          <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.searchBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.searchBtnText}>
                  Voir les hôtels correspondants ({matchCount})
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 6 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  clearBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  clearBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  section: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  sectionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F7FAFC', gap: 12 },
  filterIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterInfo: { flex: 1 },
  filterLabel: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  filterDesc: { fontSize: 12, color: '#718096', marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingHorizontal: 16, paddingTop: 12 },
  searchBtn: { borderRadius: 14, overflow: 'hidden' },
  searchBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
