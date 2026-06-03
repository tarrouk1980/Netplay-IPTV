import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
  gold: '#FFD700', silver: '#C0C0C0', bronze: '#CD7F32',
};

const MOCK_LEADERS = [
  { rank: 1, name: 'Ahmed B.', city: 'Tunis', referrals: 47, points: 2350, avatar: '🏆' },
  { rank: 2, name: 'Sonia M.', city: 'Sfax', referrals: 39, points: 1950, avatar: '🥈' },
  { rank: 3, name: 'Khaled R.', city: 'Sousse', referrals: 34, points: 1700, avatar: '🥉' },
  { rank: 4, name: 'Fatma K.', city: 'Nabeul', referrals: 28, points: 1400, avatar: '👤' },
  { rank: 5, name: 'Mohamed T.', city: 'Bizerte', referrals: 22, points: 1100, avatar: '👤' },
  { rank: 6, name: 'Ines H.', city: 'Tunis', referrals: 18, points: 900, avatar: '👤' },
  { rank: 7, name: 'Yassine A.', city: 'Monastir', referrals: 15, points: 750, avatar: '👤' },
  { rank: 8, name: 'Rania B.', city: 'Gafsa', referrals: 12, points: 600, avatar: '👤' },
];

const REWARDS = [
  { threshold: 5, reward: 'Course gratuite', emoji: '🚕', points: 500 },
  { threshold: 10, reward: 'Pass mensuel -50%', emoji: '🎫', points: 1000 },
  { threshold: 20, reward: 'Mois gratuit EasyPass', emoji: '⭐', points: 2000 },
  { threshold: 50, reward: 'Tablette offerte', emoji: '📱', points: 5000 },
];

function RankColor(rank) {
  if (rank === 1) return COLORS.gold;
  if (rank === 2) return COLORS.silver;
  if (rank === 3) return COLORS.bronze;
  return COLORS.muted;
}

export default function ReferralLeaderboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const [leaders, setLeaders] = useState(MOCK_LEADERS);
  const [loading, setLoading] = useState(false);
  const [myRank, setMyRank] = useState({ rank: 23, referrals: 3, points: 150 });
  const [tab, setTab] = useState('classement');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/referral/leaderboard');
        if (res.data?.leaders) setLeaders(res.data.leaders);
        if (res.data?.myRank) setMyRank(res.data.myRank);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎉 Rejoins EASYWAY avec mon code parrainage et gagne des points ! Code: ${user?.referralCode || 'EASY123'}\nTélécharge l'app : https://easyway.tn`,
        title: 'Parrainage EASYWAY',
      });
    } catch {}
  };

  const myNextReward = REWARDS.find((r) => r.threshold > myRank.referrals);
  const progress = myNextReward ? myRank.referrals / myNextReward.threshold : 1;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 Classement Parrainage</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={{ fontSize: 18 }}>🔗</Text>
        </TouchableOpacity>
      </View>

      {/* My stats */}
      <View style={styles.myCard}>
        <View style={styles.myRankBadge}>
          <Text style={styles.myRankNum}>#{myRank.rank}</Text>
          <Text style={styles.myRankLabel}>Mon rang</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <Text style={styles.myName}>{user?.name || 'Moi'}</Text>
          <Text style={styles.myStats}>{myRank.referrals} filleuls · {myRank.points} pts</Text>
          {myNextReward && (
            <>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
              </View>
              <Text style={styles.progressLabel}>
                {myNextReward.threshold - myRank.referrals} filleuls pour : {myNextReward.emoji} {myNextReward.reward}
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity style={styles.inviteBtn} onPress={handleShare}>
          <Text style={styles.inviteBtnText}>Inviter</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'classement', label: '🏆 Classement' },
          { key: 'recompenses', label: '🎁 Récompenses' },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && { color: '#000' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {tab === 'classement' && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            {loading ? (
              <ActivityIndicator color={COLORS.accent} style={{ marginTop: 30 }} />
            ) : (
              leaders.map((l) => (
                <View key={l.rank} style={[styles.leaderRow, l.rank <= 3 && styles.leaderRowTop]}>
                  <View style={[styles.rankBox, { borderColor: RankColor(l.rank) }]}>
                    <Text style={[styles.rankNum, { color: RankColor(l.rank) }]}>
                      {l.rank <= 3 ? l.avatar : `#${l.rank}`}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.leaderName}>{l.name}</Text>
                    <Text style={styles.leaderCity}>📍 {l.city} · {l.referrals} filleuls</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.leaderPoints, { color: l.rank <= 3 ? RankColor(l.rank) : COLORS.accent }]}>
                      {l.points.toLocaleString()}
                    </Text>
                    <Text style={styles.leaderPtsLabel}>points</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {tab === 'recompenses' && (
          <View style={{ padding: 16, gap: 12 }}>
            <Text style={styles.rewardNote}>Invitez des amis et débloquez des récompenses exclusives !</Text>
            {REWARDS.map((r, i) => {
              const unlocked = myRank.referrals >= r.threshold;
              return (
                <View key={i} style={[styles.rewardCard, unlocked && styles.rewardCardUnlocked]}>
                  <Text style={{ fontSize: 32 }}>{r.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.rewardTitle, unlocked && { color: COLORS.green }]}>{r.reward}</Text>
                    <Text style={styles.rewardThreshold}>{r.threshold} filleuls · {r.points} pts</Text>
                    {unlocked && <Text style={styles.rewardUnlocked}>✅ Débloqué !</Text>}
                  </View>
                  <View style={[styles.rewardBadge, { backgroundColor: unlocked ? COLORS.green : COLORS.surface }]}>
                    <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '700' }}>
                      {unlocked ? '✓' : `${r.threshold}×`}
                    </Text>
                  </View>
                </View>
              );
            })}
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Mon code parrainage</Text>
              <TouchableOpacity
                style={styles.codeBtn}
                onPress={() => Alert.alert('Code copié !', `Votre code : ${user?.referralCode || 'EASY123'}`)}
              >
                <Text style={styles.codeText}>{user?.referralCode || 'EASY123'}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>Appuyer pour copier</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  shareBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  myCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A0A', margin: 16, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.accent,
  },
  myRankBadge: { alignItems: 'center' },
  myRankNum: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  myRankLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  myName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  myStats: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  progressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginTop: 8 },
  progressFill: { height: 4, backgroundColor: COLORS.accent, borderRadius: 2 },
  progressLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  inviteBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  inviteBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  leaderRowTop: { borderColor: COLORS.accent },
  rankBox: { width: 40, height: 40, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: 14, fontWeight: '900' },
  leaderName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  leaderCity: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  leaderPoints: { fontSize: 16, fontWeight: '900' },
  leaderPtsLabel: { color: COLORS.muted, fontSize: 10 },
  rewardNote: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  rewardCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  rewardCardUnlocked: { borderColor: COLORS.green, backgroundColor: '#0A1A0A' },
  rewardTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  rewardThreshold: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  rewardUnlocked: { color: COLORS.green, fontSize: 12, marginTop: 3, fontWeight: '600' },
  rewardBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  codeBox: {
    backgroundColor: '#1A1A0A', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.accent, marginTop: 6, alignItems: 'center',
  },
  codeLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  codeBtn: { alignItems: 'center' },
  codeText: { color: COLORS.accent, fontSize: 28, fontWeight: '900', letterSpacing: 4 },
});
