import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
}

export function StarRating({ rating, count, size = 14 }: StarRatingProps) {
  const filled = Math.round(rating);
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={[styles.star, { fontSize: size, color: star <= filled ? '#F59E0B' : '#D1D5DB' }]}>
          ★
        </Text>
      ))}
      {count !== undefined && (
        <Text style={[styles.count, { fontSize: size - 2 }]}>{rating.toFixed(1)} ({count})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { lineHeight: 20 },
  count: { marginLeft: 4, color: '#6B7280' },
});
