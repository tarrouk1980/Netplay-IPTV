import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAdStore } from '../store/adStore';

const GOLD = '#F5A623';
const BG_CARD = '#16161E';
const TEXT = '#FFFFFF';
const SUBTEXT = '#9B9BAA';

export default function SponsoredCard({ merchant, onPress }) {
  const { trackImpression, adsByPlacement } = useAdStore();

  useEffect(() => {
    const ads = Object.values(adsByPlacement).flat();
    const merchantAd = ads.find((ad) => ad.merchantId === merchant.id && ad.type === 'SPONSORED_CARD');
    if (merchantAd) {
      trackImpression(merchantAd.id);
    }
  }, [merchant.id]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⭐ SPONSORISÉ</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{merchant.name}</Text>
        <Text style={styles.category}>{merchant.category}</Text>
        {merchant.rating && <Text style={styles.rating}>⭐ {merchant.rating}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BG_CARD,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  badgeRow: { marginBottom: 8 },
  badge: {
    backgroundColor: GOLD,
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: '#000', fontSize: 11, fontWeight: '700' },
  info: {},
  name: { color: TEXT, fontSize: 16, fontWeight: '700' },
  category: { color: SUBTEXT, fontSize: 13, marginTop: 2 },
  rating: { color: GOLD, fontSize: 13, marginTop: 4 },
});
