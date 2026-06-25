import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', purple: '#9B59B6',
};

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

export default function ClientLoyaltyScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [redeeming, setRedeeming] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/loyalty/balance')
      .then(r => { setData(r.data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRedeem = (reward) => {
    if ((data?.points || 0) < reward.points) {
      Alert.alert('Points insuffisants', `Il vous manque ${reward.points - (data?.points || 0)} points pour cette récompense.`);
      return;
    }
    Alert.alert(
      'Échanger des points',
      `Échanger ${reward.points} points contre "${reward.label}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setRedeeming(reward.id);
            try {
              await api.post('/api/loyalty/redeem', { rewardId: reward.id });
              Alert.alert('✅ Récompense activée', `"${reward.label}" a été ajoutée à votre compte.`);
              load();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || "Impossible d'échanger ces points pour le moment.");
            } finally {
              setRedeeming(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>
            Impossible de récupérer votre programme fidélité.
          </Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 16, backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { points, level, levelColor, nextLevel, pointsToNext, rewards = [] } = data;
  const progress = nextLevel ? Math.max(0, Math.min(100, 100 - (pointsToNext / Math.max(points + pointsToNext, 1)) * 100)) : 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⭐ Programme fidélité</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={[styles.statusCard, { borderColor: (levelColor || COLORS.accent) + '50' }]}>
          <Text style={{ fontSize: 48 }}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tierName, { color: levelColor || COLORS.accent }]}>{level}</Text>
            <Text style={styles.pointsVal}>{points.toLocaleString()} pts</Text>
            {nextLevel && (
              <>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: levelColor || COLORS.accent }]} />
                </View>
                <Text style={styles.progressNote}>
                  {pointsToNext.toLocaleString()} pts pour {nextLevel}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Rewards */}
        <Text style={styles.sectionTitle}>RÉCOMPENSES DISPONIBLES</Text>
        {rewards.length === 0 ? (
          <Text style={{ color: COLORS.muted, fontSize: 13, marginBottom: 16 }}>Aucune récompense disponible pour le moment.</Text>
        ) : rewards.map(r => (
          <TouchableOpacity
            key={r.id}
            style={[styles.rewardCard, points < r.points && { opacity: 0.5 }]}
            onPress={() => handleRedeem(r)}
            disabled={redeeming === r.id}
          >
            <Text style={{ fontSize: 26 }}>{r.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardLabel}>{r.label}</Text>
              <Text style={styles.rewardDesc}>{r.description}</Text>
            </View>
            {redeeming === r.id ? (
              <ActivityIndicator color={COLORS.accent} />
            ) : (
              <Text style={styles.rewardPts}>{r.points} pts</Text>
            )}
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
  tierName: { fontSize: 18, fontWeight: '900', marginBottom: 2 },
  pointsVal: { color: COLORS.text, fontSize: 28, fontWeight: '900' },
  progressBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressNote: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  rewardLabel: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  rewardDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  rewardPts: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
});
