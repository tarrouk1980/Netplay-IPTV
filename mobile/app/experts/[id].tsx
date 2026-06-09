import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, Expert } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StarRating } from '@/components/StarRating';

export default function ExpertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  const { data: expert, isLoading } = useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const { data } = await api.get<Expert>(`/experts/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const bookMutation = useMutation({
    mutationFn: async (startDatetime: string) => {
      const startDate = new Date(startDatetime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const { data } = await api.post('/bookings', {
        expert_id: Number(id),
        slot_datetime_start: startDate.toISOString().slice(0, 19).replace('T', ' '),
        slot_datetime_end: endDate.toISOString().slice(0, 19).replace('T', ' '),
      });
      return data as { id: number };
    },
    onSuccess: (booking) => {
      Alert.alert('Succès!', 'Votre réservation a été confirmée.', [
        { text: 'Voir mes séances', onPress: () => router.push('/bookings' as any) },
      ]);
    },
    onError: () => {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!expert) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Expert introuvable</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUrl = expert.user?.avatar_url || `https://i.pravatar.cc/150?u=${expert.id}`;
  const rating = expert.rating_avg || expert.rating_average || 0;
  const price = expert.hourly_rate || expert.session_price || 0;
  const currency = expert.currency || '€';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={['#1E1B4B', '#4338CA', '#7C3AED']}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              {expert.status === 'approved' && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.expertName}>{expert.user?.name}</Text>
              {expert.headline && <Text style={styles.expertHeadline}>{expert.headline}</Text>}
              {expert.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{expert.category.name}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{expert.total_sessions ?? 0}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{price}</Text>
              <Text style={styles.statLabel}>{currency}/h</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Rating */}
          <View style={styles.ratingSection}>
            <StarRating rating={rating} count={expert.total_sessions} size={16} />
          </View>

          {/* Bio */}
          {expert.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.bio}>{expert.bio}</Text>
            </View>
          ) : null}

          {/* Specializations */}
          {expert.specializations && expert.specializations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Spécialisations</Text>
              <View style={styles.specsContainer}>
                {expert.specializations.map((spec) => (
                  <View key={spec} style={styles.specPill}>
                    <Text style={styles.specText}>{spec}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky book button */}
      <View style={styles.stickyBottom}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>À partir de</Text>
          <Text style={styles.price}>{price} {currency}<Text style={styles.priceUnit}>/h</Text></Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={styles.bookButtonText}>Réserver maintenant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 16, color: '#6B7280' },
  backButton: { backgroundColor: '#4F46E5', borderRadius: 99, paddingHorizontal: 20, paddingVertical: 10 },
  backButtonText: { color: '#fff', fontWeight: '600' },
  hero: { paddingTop: 12, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { marginBottom: 16, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  profileSection: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#06B6D4', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  profileInfo: { flex: 1, justifyContent: 'center' },
  expertName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  expertHeadline: { color: '#C7D2FE', fontSize: 13, marginBottom: 8 },
  categoryBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 },
  stat: { alignItems: 'center', flex: 1 },
  statNum: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#A5B4FC', fontSize: 10, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { padding: 16 },
  ratingSection: { marginBottom: 16 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E1B4B', marginBottom: 10 },
  bio: { fontSize: 14, color: '#374151', lineHeight: 22 },
  specsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specPill: { backgroundColor: '#EEF2FF', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  specText: { color: '#4F46E5', fontSize: 12, fontWeight: '600' },
  stickyBottom: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  priceInfo: { flex: 1 },
  priceLabel: { fontSize: 11, color: '#9CA3AF' },
  price: { fontSize: 20, fontWeight: '800', color: '#1E1B4B' },
  priceUnit: { fontSize: 13, fontWeight: '400', color: '#9CA3AF' },
  bookButton: { backgroundColor: '#4F46E5', borderRadius: 99, paddingHorizontal: 24, paddingVertical: 14 },
  bookButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
