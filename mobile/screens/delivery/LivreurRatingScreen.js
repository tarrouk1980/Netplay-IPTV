import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

function Etoiles({ note, taille = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: taille, color: i <= note ? COLORS.primary : COLORS.border }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function LivreurRatingScreen() {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!user?.id) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    api.get(`/api/reviews/${user.id}`)
      .then((res) => {
        setReviews(res.data?.reviews || []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const totalAvis = reviews.length;
  const noteMoyenne = totalAvis > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalAvis
    : 0;
  const pourcentage5etoiles = totalAvis > 0
    ? Math.round((reviews.filter((r) => r.rating === 5).length / totalAvis) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexte}>🛻</Text>
          </View>
          <View>
            <Text style={styles.nomLivreur}>{user?.name || 'Mes évaluations'}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 30 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTexte}>⚠️ Impossible de charger vos avis.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryTexte}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValeur}>{noteMoyenne.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Note moyenne</Text>
                <Etoiles note={Math.round(noteMoyenne)} taille={12} />
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValeur}>{totalAvis}</Text>
                <Text style={styles.statLabel}>Total avis</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValeur, { color: '#4CAF50' }]}>{pourcentage5etoiles}%</Text>
                <Text style={styles.statLabel}>Avis 5 ★</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitre}>Avis récents</Text>
              {totalAvis === 0 ? (
                <Text style={styles.videTexte}>Aucun avis pour le moment.</Text>
              ) : (
                reviews.map(avis => (
                  <View key={avis.id} style={styles.avisCard}>
                    <View style={styles.avisHeader}>
                      <View style={styles.clientBadge}>
                        <Text style={styles.clientTexte}>{avis.author}</Text>
                      </View>
                      <Etoiles note={avis.rating} taille={14} />
                      <Text style={styles.avisDate}>{avis.date}</Text>
                    </View>
                    {avis.comment && <Text style={styles.avisCommentaire}>{avis.comment}</Text>}
                  </View>
                ))
              )}
            </View>
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: 20,
  },
  profil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexte: {
    fontSize: 26,
  },
  nomLivreur: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 4,
  },
  statValeur: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitre: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  videTexte: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  avisCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  clientBadge: {
    backgroundColor: `${COLORS.primary}22`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  clientTexte: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  avisDate: {
    marginLeft: 'auto',
    fontSize: 12,
    color: COLORS.muted,
  },
  avisCommentaire: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  errorBox: {
    alignItems: 'center',
    marginTop: 30,
  },
  errorTexte: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryTexte: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
