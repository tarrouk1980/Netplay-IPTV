import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useAdStore } from '../store/adStore';

export default function AdBanner({ placement, style }) {
  const { adsByPlacement, fetchAds, trackImpression, trackClick } = useAdStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAds(placement);
  }, [placement]);

  const ads = adsByPlacement[placement] || [];
  const bannerAds = ads.filter((ad) => ad.type === 'BANNER_TOP' || ad.type === 'BANNER_INLINE');

  useEffect(() => {
    if (bannerAds.length > 0) {
      trackImpression(bannerAds[currentIndex].id);
    }
  }, [currentIndex, bannerAds.length]);

  if (bannerAds.length === 0) return null;

  const ad = bannerAds[currentIndex];

  const handlePress = async () => {
    trackClick(ad.id);
    if (ad.targetUrl) {
      const supported = await Linking.canOpenURL(ad.targetUrl);
      if (supported) Linking.openURL(ad.targetUrl);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, style]} activeOpacity={0.9}>
      <Image
        source={{ uri: ad.imageUrl }}
        style={ad.type === 'BANNER_TOP' ? styles.bannerTop : styles.bannerInline}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerTop: {
    width: '100%',
    height: 80,
  },
  bannerInline: {
    width: '100%',
    height: 140,
  },
});
