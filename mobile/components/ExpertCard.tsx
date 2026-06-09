import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Expert } from '@/lib/api';
import { StarRating } from './StarRating';

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const avatarUrl = expert.user?.avatar_url || `https://i.pravatar.cc/150?u=${expert.id}`;
  const rating = expert.rating_avg || expert.rating_average || 0;
  const price = expert.hourly_rate || expert.session_price || 0;
  const currency = expert.currency || '€';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/experts/${expert.id}` as any)}
      activeOpacity={0.9}
    >
      {/* Avatar + verified badge */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          defaultSource={{ uri: `https://i.pravatar.cc/150?u=fallback-${expert.id}` }}
        />
        {expert.status === 'approved' && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{expert.user?.name}</Text>
          {expert.featured && <Text style={styles.featuredBadge}>★</Text>}
        </View>
        {expert.headline ? (
          <Text style={styles.headline} numberOfLines={1}>{expert.headline}</Text>
        ) : null}
        {expert.category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{expert.category.name}</Text>
          </View>
        ) : null}
      </View>

      {/* Rating & price */}
      <View style={styles.footer}>
        <StarRating rating={rating} count={expert.total_sessions} size={12} />
        <Text style={styles.price}>
          {price} {currency}<Text style={styles.priceUnit}>/h</Text>
        </Text>
      </View>

      {/* Book button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => router.push(`/experts/${expert.id}` as any)}
      >
        <Text style={styles.bookButtonText}>Réserver</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E7FF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#06B6D4',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  info: { marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', flex: 1 },
  featuredBadge: { fontSize: 12, color: '#F59E0B', backgroundColor: '#FEF3C7', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 6 },
  headline: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  categoryPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start' },
  categoryText: { fontSize: 11, color: '#4F46E5', fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  price: { fontSize: 16, fontWeight: '700', color: '#4F46E5' },
  priceUnit: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
  bookButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 99,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
