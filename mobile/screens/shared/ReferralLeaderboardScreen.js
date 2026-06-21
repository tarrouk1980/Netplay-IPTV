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

function RankColor(rank) {
  if (rank === 1) return COLORS.gold;
  if (rank === 2) return COLORS.silver;
  if (rank === 3) return COLORS.bronze;
  return COLORS.muted;
}

export default function ReferralLeaderboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [myRank, setMyRank] = useState({ rank: 0, referrals: 0, points: 0 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/referral/leaderboard');
        setLeaders(res.data?.leaders || []);
        setMyRank(res.data?.myRank || { rank: 0, referrals: 0, points: 0 });
        setError(false);
      } catch {
        setError(true);
      } finally {
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
          <Text style={styles.myRankNum}>#{myRank.rank || '-'}</Text>
          <Text style={styles.myRankLabel}>Mon rang</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <Text style={styles.myName}>{user?.name || 'Moi'}</Text>
          <Text style={styles.myStats}>{myRank.referrals} filleuls · {myRank.points} jour{myRank.points === 1 ? '' : 's'} de pass gagnés</Text>
        </View>
        <TouchableOpacity style={styles.inviteBtn} onPress={handleShare}>
          <Text style={styles.inviteBtnText}>Inviter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {loading ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginTop: 30 }} />
          ) : error ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
                Impossible de récupérer le classement. Vérifiez votre connexion et réessayez.
              </Text>
            </View>
          ) : leaders.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: COLORS.muted, fontSize: 14 }}>Aucun classement disponible.</Text>
            </View>
          ) : (
            leaders.map((l) => (
              <View key={l.rank} style={[styles.leaderRow, l.rank <= 3 && styles.leaderRowTop]}>
                <View style={[styles.rankBox, { borderColor: RankColor(l.rank) }]}>
                  <Text style={[styles.rankNum, { color: RankColor(l.rank) }]}>
                    #{l.rank}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.leaderName}>{l.name}</Text>
                  <Text style={styles.leaderCity}>{l.referrals} filleuls</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.leaderPoints, { color: l.rank <= 3 ? RankColor(l.rank) : COLORS.accent }]}>
                    {l.points}
                  </Text>
                  <Text style={styles.leaderPtsLabel}>jours de pass</Text>
                </View>
              </View>
            ))
          )}
        </View>
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
  inviteBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  inviteBtnText: { color: '#000', fontSize: 13, fontWeight: '700' },
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
});
