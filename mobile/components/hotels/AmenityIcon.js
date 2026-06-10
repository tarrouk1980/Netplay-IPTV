import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AMENITY_ICON_MAP = {
  'wifi': 'wifi', 'piscine': 'water', 'spa': 'sparkles', 'gym': 'barbell',
  'sport': 'barbell', 'restaurant': 'restaurant', 'bar': 'wine', 'parking': 'car',
  'navette': 'airplane', 'plage': 'sunny', 'all-inclusive': 'gift', 'climatisation': 'thermometer',
  'room service': 'call', 'business': 'briefcase', 'animation': 'musical-notes',
  'enfants': 'happy', 'tennis': 'tennisball', 'aquapark': 'water', 'conciergerie': 'person',
  'jardin': 'leaf', 'kitchenette': 'fast-food', 'terrace': 'home', 'casiers': 'lock-closed',
  'excursion': 'map', 'casino': 'card', 'boutique': 'bag',
};

function getIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICON_MAP)) {
    if (lower.includes(key)) return icon + '-outline';
  }
  return 'checkmark-circle-outline';
}

export default function AmenityIcon({ amenity, size = 'md', showLabel = true, color = '#FF6B35' }) {
  const isSmall = size === 'sm';
  const iconSize = isSmall ? 16 : 22;
  const fontSize = isSmall ? 10 : 12;
  const padSize = isSmall ? 6 : 10;

  return (
    <View style={[styles.container, isSmall && styles.containerSm]}>
      <View style={[styles.iconBox, { padding: padSize, backgroundColor: '#FFF5F0' }]}>
        <Ionicons name={getIcon(amenity)} size={iconSize} color={color} />
      </View>
      {showLabel && (
        <Text style={[styles.label, { fontSize }]} numberOfLines={2}>{amenity}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '30%', gap: 6, marginBottom: 8 },
  containerSm: { width: 'auto', flexDirection: 'row', gap: 6, marginBottom: 4 },
  iconBox: { borderRadius: 10 },
  label: { color: '#4A5568', textAlign: 'center', lineHeight: 14 },
});
