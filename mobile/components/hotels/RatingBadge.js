import React from 'react';
import { View, Text } from 'react-native';

function getRatingInfo(score) {
  if (score >= 9) return { label: 'Exceptionnel', color: '#1a7f37' };
  if (score >= 8) return { label: 'Excellent', color: '#2e7d32' };
  if (score >= 7) return { label: 'Très bien', color: '#388e3c' };
  if (score >= 6) return { label: 'Bien', color: '#f57c00' };
  return { label: 'Correct', color: '#d32f2f' };
}

export default function RatingBadge({ score, size = 'md', showLabel = true }) {
  const { label, color } = getRatingInfo(score);
  const isSmall = size === 'sm';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{
        backgroundColor: color,
        borderRadius: isSmall ? 6 : 8,
        paddingHorizontal: isSmall ? 6 : 8,
        paddingVertical: isSmall ? 3 : 5,
      }}>
        <Text style={{
          color: '#fff',
          fontWeight: '800',
          fontSize: isSmall ? 12 : 15,
        }}>{score?.toFixed(1)}</Text>
      </View>
      {showLabel && (
        <Text style={{ color, fontWeight: '600', fontSize: isSmall ? 11 : 13 }}>{label}</Text>
      )}
    </View>
  );
}
