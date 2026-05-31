import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#27AE60',
  star: '#F5A623',
};

const ROLE_LABELS = {
  CHAUFFEUR: 'Chauffeur',
  DEPANNEUR: 'Dépanneur',
  LIVREUR: 'Livreur',
  MARCHAND: 'Marchand',
};

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={[styles.star, { color: i <= full ? COLORS.star : '#3A3A4A' }]}>★</Text>
    );
  }
  return <View style={styles.starsRow}>{stars}</View>;
}

export default function ProviderProfileScreen({ route, navigation }) {
  const { userId } = route.params || {};
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    api.get(`/api/users/provider/${userId}/profile`)
      .then((res) => setProvider(res.data))
      .catch((err) => {
        console.warn('[ProviderProfileScreen] Failed to load:', err?.message);
        Alert.alert('Erreur', 'Impossible de charger le profil.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleCall = () => {
    if (provider?.phone) {
      Linking.openURL(`tel:${provider.phone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profil introuvable</Text>
      </View>
    );
  }

  const initials = (provider.name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil prestataire</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{provider.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{ROLE_LABELS[provider.role] || provider.role}</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Note moyenne</Text>
          <StarRating rating={provider.rating || 0} />
          <Text style={styles.ratingNum}>{(provider.rating || 0).toFixed(1)} / 5</Text>
          <Text style={styles.totalRides}>{provider.totalRides || 0} courses effectuées</Text>
        </View>

        {/* Vehicle */}
        {provider.vehicleType && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Véhicule</Text>
            <Text style={styles.cardValue}>
              {provider.vehicleType}
              {provider.vehicleMake ? ` — ${provider.vehicleMake}` : ''}
              {provider.vehicleModel ? ` ${provider.vehicleModel}` : ''}
            </Text>
          </View>
        )}

        {/* Call button */}
        {provider.phone && (
          <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.85}>
            <Text style={styles.callBtnText}>📞 Appeler</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  errorText: { color: COLORS.textMuted, fontSize: 15 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  backTxt: { color: COLORS.text, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  content: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#000' },
  name: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  roleBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleText: { color: COLORS.textMuted, fontSize: 13 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cardTitle: { color: COLORS.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  cardValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  star: { fontSize: 30 },
  ratingNum: { color: COLORS.primary, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  totalRides: { color: COLORS.textMuted, fontSize: 13 },
  callBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
