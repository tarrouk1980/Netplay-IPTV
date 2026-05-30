import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * BadgeChip component
 * Props: type (string), size ('sm' | 'md')
 *
 * Types: VERIFIED, TOP_DRIVER, BEST_MONTH, VIP, NEW,
 *        BEST_SELLER, PROMO, PARTNER, FREE_TRIAL
 */

const BADGE_CONFIG = {
  VERIFIED: {
    label: '✓ Vérifié',
    bg: '#27AE60',
    text: '#FFFFFF',
    gradient: null,
  },
  TOP_DRIVER: {
    label: '⭐ Top Chauffeur',
    bg: '#F5A623',
    text: '#0A0A0F',
    gradient: null,
  },
  BEST_MONTH: {
    label: '🏆 du Mois',
    bg: '#8E44AD',
    text: '#FFFFFF',
    gradient: null,
  },
  VIP: {
    label: '💎 VIP',
    bg: null,
    text: '#FFFFFF',
    gradient: ['#F5A623', '#D32F2F'],
  },
  NEW: {
    label: '🆕 Nouveau',
    bg: '#2196F3',
    text: '#FFFFFF',
    gradient: null,
  },
  BEST_SELLER: {
    label: '🔥 Best Seller',
    bg: '#E74C3C',
    text: '#FFFFFF',
    gradient: null,
  },
  PROMO: {
    label: '% Promo',
    bg: '#27AE60',
    text: '#FFFFFF',
    gradient: null,
  },
  PARTNER: {
    label: '⭐ Partenaire',
    bg: '#F5A623',
    text: '#0A0A0F',
    gradient: null,
  },
  FREE_TRIAL: {
    label: '0 TND',
    bg: '#27AE60',
    text: '#FFFFFF',
    gradient: null,
    strikethrough: true,
  },
};

export default function BadgeChip({ type, size = 'md' }) {
  const config = BADGE_CONFIG[type];

  if (!config) return null;

  const isSm = size === 'sm';

  // For VIP gradient, use a two-color approximation with border
  const backgroundColor = config.gradient
    ? config.gradient[0] // fallback for non-LinearGradient environments
    : config.bg;

  return (
    <View
      style={[
        styles.badge,
        isSm ? styles.badgeSm : styles.badgeMd,
        { backgroundColor },
        config.gradient && styles.vipBadge,
      ]}
    >
      {config.strikethrough ? (
        <View style={styles.freeTrial}>
          <Text style={[styles.label, isSm ? styles.labelSm : styles.labelMd, { color: config.text }]}>
            0 TND
          </Text>
          <Text style={[styles.strikePrice, isSm ? styles.labelSm : styles.labelMd]}>
            {' '}gratuit
          </Text>
        </View>
      ) : (
        <Text style={[styles.label, isSm ? styles.labelSm : styles.labelMd, { color: config.text }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  vipBadge: {
    // Gold-red gradient approximation via border
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelMd: {
    fontSize: 12,
  },
  labelSm: {
    fontSize: 10,
  },
  freeTrial: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikePrice: {
    color: '#FFFFFF',
    fontSize: 11,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
});
