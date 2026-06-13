import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share, Clipboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

export default function ReferralScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/referral/my-code')
      .then(r => setData(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const copy = () => {
    if (!data?.code) return;
    Clipboard.setString(data.code);
    Alert.alert('✓ Copié !', 'Code de parrainage copié dans le presse-papiers.');
  };

  const share = () => {
    if (!data) return;
    Share.share({
      message: data.shareText || `Rejoins OPTIMARK avec mon code de parrainage ${data.code} et profite d'avantages exclusifs !`,
      title: 'Code de parrainage OPTIMARK',
    });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#9f1239" />;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero */}
      <View style={s.hero}>
        <Text style={{ fontSize: 56, marginBottom: 12 }}>🤝</Text>
        <Text style={s.heroTitle}>Programme de parrainage</Text>
        <Text style={s.heroSub}>Invitez vos amis, gagnez des points ensemble</Text>
      </View>

      {/* Code card */}
      <View style={s.codeCard}>
        <Text style={s.codeLabel}>Votre code de parrainage</Text>
        <View style={s.codeRow}>
          <Text style={s.code}>{data?.code || '—'}</Text>
          <TouchableOpacity style={s.copyBtn} onPress={copy}>
            <Text style={s.copyBtnText}>Copier</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.shareBtn} onPress={share}>
          <Text style={s.shareBtnText}>🔗 Partager le lien</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statNum}>{data?.referredCount ?? 0}</Text>
          <Text style={s.statLabel}>Amis parrainés</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statNum, { color: '#9f1239' }]}>{(data?.referredCount ?? 0) * (data?.pointsPerReferral ?? 200)}</Text>
          <Text style={s.statLabel}>Points gagnés</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statNum}>{data?.pointsPerReferral ?? 200}</Text>
          <Text style={s.statLabel}>Pts/parrainage</Text>
        </View>
      </View>

      {/* How it works */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Comment ça marche ?</Text>
        {[
          { step: '1', icon: '📤', title: 'Partagez votre code', desc: 'Envoyez votre code à vos amis via WhatsApp, email ou réseaux sociaux.' },
          { step: '2', icon: '✍️', title: 'Votre ami s\'inscrit', desc: 'Votre ami crée son compte en utilisant votre code de parrainage.' },
          { step: '3', icon: '🛒', title: 'Premier achat', desc: 'Dès que votre filleul effectue sa première commande, les points sont crédités.' },
          { step: '4', icon: '⭐', title: 'Gagnez des points', desc: `Vous recevez ${data?.pointsPerReferral ?? 200} points fidélité par parrainage réussi.` },
        ].map(item => (
          <View key={item.step} style={s.stepRow}>
            <View style={s.stepNum}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{item.step}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.stepIcon}>{item.icon} <Text style={s.stepTitle}>{item.title}</Text></Text>
              <Text style={s.stepDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Reward info */}
      <View style={[s.card, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
        <Text style={[s.cardTitle, { color: '#92400e' }]}>💰 Valeur des points</Text>
        <View style={s.rewardRow}>
          <View style={s.rewardItem}>
            <Text style={[s.rewardNum, { color: '#d97706' }]}>{data?.pointsPerReferral ?? 200}</Text>
            <Text style={s.rewardLabel}>Points par parrainage</Text>
          </View>
          <Text style={{ color: '#94a3b8', fontSize: 20 }}>=</Text>
          <View style={s.rewardItem}>
            <Text style={[s.rewardNum, { color: '#9f1239' }]}>{((data?.pointsPerReferral ?? 200) * 0.01).toFixed(2)}</Text>
            <Text style={s.rewardLabel}>TND de réduction</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: '#b45309', textAlign: 'center', marginTop: 8 }}>100 points = 1 TND · À utiliser sur votre prochaine commande</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  hero: { backgroundColor: '#9f1239', alignItems: 'center', paddingVertical: 40, paddingTop: 56 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', paddingHorizontal: 24 },
  codeCard: { margin: 16, marginBottom: 0, backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  codeLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  codeRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#9f1239', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  code: { flex: 1, fontSize: 22, fontWeight: '900', color: '#1e293b', textAlign: 'center', padding: 14, letterSpacing: 3, fontFamily: 'monospace' },
  copyBtn: { backgroundColor: '#9f1239', paddingHorizontal: 16, alignSelf: 'stretch', justifyContent: 'center' },
  copyBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  shareBtn: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 13, alignItems: 'center' },
  shareBtnText: { color: '#1e293b', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', margin: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  statNum: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  statLabel: { fontSize: 10, color: '#64748b', fontWeight: '600', textAlign: 'center', marginTop: 2 },
  card: { margin: 16, marginTop: 0, marginBottom: 12, backgroundColor: '#fff', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  stepRow: { flexDirection: 'row', gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#9f1239', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  stepIcon: { fontSize: 14, color: '#1e293b' },
  stepTitle: { fontWeight: '800', color: '#1e293b' },
  stepDesc: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  rewardItem: { alignItems: 'center' },
  rewardNum: { fontSize: 32, fontWeight: '900' },
  rewardLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textAlign: 'center' },
});
