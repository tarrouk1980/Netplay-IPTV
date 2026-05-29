import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';

/**
 * ServiceCard component
 * Props: color, emoji, title, subtitle, onPress, disabled
 */
export default function ServiceCard({ color, emoji, title, subtitle, onPress, disabled = false }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[
          styles.card,
          { borderTopColor: color, borderTopWidth: 3 },
          disabled && styles.cardDisabled,
        ]}
        onPress={!disabled ? onPress : undefined}
        onPressIn={!disabled ? handlePressIn : undefined}
        onPressOut={!disabled ? handlePressOut : undefined}
      >
        {/* Color accent line */}
        <View style={[styles.accentDot, { backgroundColor: color }]} />

        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}

        {disabled && (
          <View style={styles.disabledOverlay}>
            <Text style={styles.disabledText}>Indisponible</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '47%',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    padding: 16,
    minHeight: 120,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  accentDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  subtitle: {
    color: '#8E8E9A',
    fontSize: 11,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  disabledText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
