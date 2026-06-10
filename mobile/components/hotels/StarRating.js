import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StarRating({ stars, size = 14, color = '#F5A623', showCount = true }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < stars ? 'star' : 'star-outline'}
          size={size}
          color={i < stars ? color : '#CBD5E0'}
        />
      ))}
      {showCount && <Text style={{ fontSize: size - 2, color: '#718096', marginLeft: 4 }}>{stars}★</Text>}
    </View>
  );
}
