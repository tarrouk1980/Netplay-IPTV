import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const PROVIDER_COLORS = {
  'Booking.com': '#003580',
  'Booking': '#003580',
  'Expedia': '#FFC72C',
  'Hotels.com': '#CC0000',
  'Airbnb': '#FF5A5F',
  'Direct': '#28A745',
};

function getProviderColor(provider) {
  for (const [key, color] of Object.entries(PROVIDER_COLORS)) {
    if (provider && provider.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return '#004E89';
}

export default function BookingRedirectScreen({ route, navigation }) {
  const { hotel, offer, checkIn, checkOut, guests } = route.params || {};
  const [cancelled, setCancelled] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Track click
    try {
      api.post('/api/cpc/click', {
        hotelId: hotel?.id,
        provider: offer?.provider,
        price: offer?.price || offer?.pricePerNight,
        checkIn,
        checkOut,
        guests,
      }).catch(() => {});
    } catch {}

    // Save to recent redirects
    saveRecentRedirect();

    // Fade in
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Progress bar (2s)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Animated dots
    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        ]),
      ])
    );
    dotLoop.start();

    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      if (!cancelled) {
        const url = offer?.deepLink || 'https://www.booking.com';
        Linking.openURL(url).catch(() => {
          Alert.alert('Erreur', 'Impossible d\'ouvrir le lien. Veuillez réessayer.');
        });
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      dotLoop.stop();
    };
  }, []);

  async function saveRecentRedirect() {
    try {
      const stored = await AsyncStorage.getItem('recent_redirects');
      const list = stored ? JSON.parse(stored) : [];
      const entry = {
        hotelId: hotel?.id,
        hotelName: hotel?.name,
        provider: offer?.provider,
        price: offer?.price || offer?.pricePerNight,
        timestamp: new Date().toISOString(),
      };
      const updated = [entry, ...list.filter(r => r.hotelId !== hotel?.id)].slice(0, 5);
      await AsyncStorage.setItem('recent_redirects', JSON.stringify(updated));
    } catch {}
  }

  const providerColor = getProviderColor(offer?.provider || '');
  const providerBgIsLight = offer?.provider?.toLowerCase().includes('expedia');

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#004E89', '#FF6B35']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Hotel info */}
        <View style={styles.hotelCard}>
          <Text style={styles.hotelName} numberOfLines={2}>{hotel?.name || 'Hôtel'}</Text>
          <Text style={styles.hotelCity}>{hotel?.city}, {hotel?.country}</Text>
        </View>

        {/* Provider badge + price */}
        <View style={[styles.providerBadge, { backgroundColor: providerColor }]}>
          <Text style={[styles.providerName, { color: providerBgIsLight ? '#333' : '#fff' }]}>
            {offer?.provider || 'Partenaire'}
          </Text>
          {(offer?.price || offer?.pricePerNight) && (
            <Text style={[styles.providerPrice, { color: providerBgIsLight ? '#333' : '#fff' }]}>
              {offer?.price || offer?.pricePerNight} TND / nuit
            </Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
        </View>

        {/* Animated dots */}
        <View style={styles.dotsRow}>
          <Text style={styles.redirectLabel}>Redirection en cours</Text>
          <Animated.Text style={[styles.dot, { opacity: dot1 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot2 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot3 }]}>.</Animated.Text>
        </View>

        <Text style={styles.subText}>
          Vous allez être redirigé vers {offer?.provider || 'notre partenaire'} pour finaliser votre réservation.
        </Text>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            setCancelled(true);
            navigation.goBack();
          }}
        >
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>

        {/* Commission notice */}
        <Text style={styles.commissionNote}>
          ℹ️  EasyHotels perçoit une commission de partenariat
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 32, width: '100%' },
  hotelCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  hotelName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 30,
  },
  hotelCity: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  providerBadge: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
    minWidth: 180,
  },
  providerName: { fontSize: 20, fontWeight: '900' },
  providerPrice: { fontSize: 14, fontWeight: '700', marginTop: 4, opacity: 0.9 },
  progressContainer: { width: '100%', marginBottom: 16 },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  redirectLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dot: { color: '#fff', fontSize: 22, fontWeight: '900', marginLeft: 2, lineHeight: 24 },
  subText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cancelText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  commissionNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
  },
});
