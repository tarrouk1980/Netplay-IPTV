import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
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
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    api.get(`/api/users/provider/${userId}/profile`)
      .then((res) => setProvider(res.data))
      .catch((err) => {
        console.warn('[ProviderProfileScreen] Failed to load:', err?.message);
        Alert.alert('Erreur', 'Impossible de charger le profil.');
      })
      .finally(() => setLoading(false));

    api.get(`/api/users/provider/${userId}/reviews`)
      .then((r) => setReviews(r.data || []))
      .catch(() => {});
  }, [userId]);

  const handleCall = () => {
    if (provider?.phone) {
      Linking.openURL(`tel:${provider.phone}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil prestataire</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : !provider ? (
        <View style={styles.errorState}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>Profil introuvable</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>
                {provider.role === 'CHAUFFEUR' ? '🚕' : provider.role === 'LIVREUR' ? '🛵' : provider.role === 'DEPANNEUR' ? '🛻' : '🏪'}
              </Text>
            </View>
            <Text style={styles.providerName}>{provider.name}</Text>
            <View style={styles.roleRow}>
              <Text style={styles.roleLabel}>{ROLE_LABELS[provider.role] || provider.role}</Text>
              {provider.kycStatus === 'APPROVED' && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Vérifié</Text>
                </View>
              )}
            </View>
            <StarRating rating={provider.rating || 0} />
            <Text style={styles.ratingText}>{(provider.rating || 0).toFixed(1)} / 5.0</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{provider.completedOrders || 0}</Text>
              <Text style={styles.statLabel}>Courses{'\n'}complétées</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{(provider.rating || 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Note{'\n'}moyenne</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {provider.createdAt ? Math.max(1, new Date().getFullYear() - new Date(provider.createdAt).getFullYear()) : 1}
              </Text>
              <Text style={styles.statLabel}>Année(s){'\n'}d'expérience</Text>
            </View>
          </View>

          {/* Vehicle info (CHAUFFEUR/LIVREUR) */}
          {(provider.role === 'CHAUFFEUR' || provider.role === 'LIVREUR') && provider.vehicleInfo && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>🚗 Véhicule</Text>
              <Text style={styles.infoValue}>{provider.vehicleInfo}</Text>
            </View>
          )}

          {/* City */}
          {provider.city && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📍 Zone de service</Text>
              <Text style={styles.infoValue}>{provider.city}</Text>
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Avis clients ({reviews.length})</Text>
              {reviews.slice(0, 5).map((r, i) => (
                <View key={i} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{r.clientName || 'Client anonyme'}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Text key={s} style={{ color: s <= (r.rating || 5) ? '#F5A623' : '#333', fontSize: 12 }}>★</Text>
                      ))}
                    </View>
                  </View>
                  {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          {provider.phone && (
            <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.85}>
              <Text style={styles.callBtnText}>📞 Appeler {provider.name?.split(' ')[0]}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  backText: { color: COLORS.text, fontSize: 28, lineHeight: 30 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },

  // Hero card
  heroCard: { alignItems: 'center', padding: 24, backgroundColor: '#1C1C28', borderBottomWidth: 1, borderBottomColor: '#2C2C3A' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5A62322', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#F5A62344' },
  avatarEmoji: { fontSize: 40 },
  providerName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  roleLabel: { color: '#8E8E9A', fontSize: 14 },
  verifiedBadge: { backgroundColor: '#27AE6022', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#27AE6044' },
  verifiedText: { color: '#27AE60', fontSize: 11, fontWeight: '700' },
  ratingText: { color: '#8E8E9A', fontSize: 13, marginTop: 4 },

  // Stars (used by StarRating component)
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  star: { fontSize: 22 },

  // Stats row
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  statBox: { flex: 1, backgroundColor: '#1C1C28', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2C2C3A' },
  statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#8E8E9A', fontSize: 10, textAlign: 'center', marginTop: 4, lineHeight: 14 },

  // Info cards
  infoCard: { backgroundColor: '#1C1C28', borderRadius: 14, marginHorizontal: 16, marginBottom: 8, padding: 16, borderWidth: 1, borderColor: '#2C2C3A' },
  infoTitle: { color: '#8E8E9A', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  infoValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },

  // Reviews
  reviewsSection: { marginHorizontal: 16, marginTop: 8 },
  sectionTitle: { color: '#8E8E9A', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  reviewCard: { backgroundColor: '#1C1C28', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2C2C3A' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewAuthor: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  reviewComment: { color: '#8E8E9A', fontSize: 12, lineHeight: 17, marginTop: 4 },

  // Call button
  callBtn: { backgroundColor: '#F5A623', borderRadius: 14, paddingVertical: 16, marginHorizontal: 16, marginTop: 12, alignItems: 'center' },
  callBtnText: { color: '#0A0A0F', fontSize: 15, fontWeight: '700' },

  // Error state
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: '#8E8E9A', fontSize: 16 },
});
