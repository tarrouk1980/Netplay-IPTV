import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  expiringSoon: '#B7500C',
  expiringSoonBg: '#3D1F00',
  expired: '#8B0000',
  expiredBg: '#2D0000',
  text: '#FFFFFF',
};

export default function PassAlertBanner({ hasActivePass, daysLeft }) {
  const navigation = useNavigation();

  if (hasActivePass && daysLeft > 2) return null;

  const isExpired = !hasActivePass;
  const backgroundColor = isExpired ? COLORS.expiredBg : COLORS.expiringSoonBg;
  const borderColor = isExpired ? '#E74C3C' : '#F5A623';
  const message = isExpired
    ? '🔴 Pass expiré — Activez un pass pour continuer'
    : `⚠️ Votre pass expire bientôt ! (${daysLeft} jour${daysLeft !== 1 ? 's' : ''} restant${daysLeft !== 1 ? 's' : ''})`;

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor, borderColor }]}
      onPress={() => navigation.navigate('BuyPass')}
      activeOpacity={0.85}
    >
      <Text style={styles.bannerText}>{message}</Text>
      <Text style={styles.bannerCta}>Activer →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  bannerText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap',
  },
  bannerCta: {
    color: '#F5A623',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 8,
  },
});
