import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Share, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', accentDark: '#C47D0E',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', purple: '#9B59B6',
};

const MOCK = {
  code: 'TAREK2024',
  totalReferrals: 12,
  pendingReferrals: 3,
  confirmedReferrals: 9,
  totalEarned: 54.00,
  pendingEarned: 18.00,
  rewardPerRef: 6.00,
  referees: [
    { name: 'Sana B.', date: '01/06/2024', status: 'confirmed', reward: 6.00 },
    { name: 'Karim M.', date: '29/05/2024', status: 'confirmed', reward: 6.00 },
    { name: 'Ines K.', date: '27/05/2024', status: 'pending', reward: 6.00 },
    { name: 'Amira T.', date: '25/05/2024', status: 'confirmed', reward: 6.00 },
    { name: 'Youssef L.', date: '20/05/2024', status: 'pending', reward: 6.00 },
  ],
};

const STATUS_MAP = {
  confirmed: { label: 'Confirmé', color: COLORS.green, bg: '#0D2E0D' },
  pending: { label: 'En attente', color: COLORS.accent, bg: '#2A1E0A' },
};

export default function ReferralDashboardScreen({ navigation }) {
  const [copied, setCopied] = useState(false);
  const data = MOCK;

  const copyCode = () => {
    Clipboard.setString(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Rejoins EASYWAY avec mon code et gagne 6 TND sur ta première course ! Code : ${data.code}\nhttps://easyway.tn/download`,
      });
    } catch {}
  };

  const progressPct = Math.min((data.confirmedReferrals / 15) * 100, 100);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parrainage</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>Parrainez, Gagnez !</Text>
          <Text style={styles.heroSub}>
            Invitez un ami et gagnez tous les deux <Text style={{ color: COLORS.accent, fontWeight: '800' }}>6 TND</Text> sur votre prochain trajet.
          </Text>
        </View>

        {/* Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Votre code de parrainage</Text>
          <Text style={styles.codeValue}>{data.code}</Text>
          <View style={styles.codeActions}>
            <TouchableOpacity
              style={[styles.codeBtn, copied && { borderColor: COLORS.green }]}
              onPress={copyCode}
            >
              <Text style={[styles.codeBtnText, copied && { color: COLORS.green }]}>
                {copied ? '✓ Copié !' : '📋 Copier'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.codeBtn, styles.codeBtnShare]} onPress={shareCode}>
              <Text style={styles.codeBtnShareText}>📤 Partager</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{data.totalReferrals}</Text>
            <Text style={styles.statLabel}>Total invités</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.green }]}>{data.confirmedReferrals}</Text>
            <Text style={styles.statLabel}>Confirmés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.accent }]}>{data.pendingReferrals}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsRow}>
            <View>
              <Text style={styles.earningsLabel}>Total gagné</Text>
              <Text style={styles.earningsTotal}>{data.totalEarned.toFixed(2)} TND</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.earningsLabel}>En attente</Text>
              <Text style={[styles.earningsTotal, { color: COLORS.accent, fontSize: 18 }]}>
                +{data.pendingEarned.toFixed(2)} TND
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {data.confirmedReferrals}/15 filleuls pour le bonus VIP ⭐
            </Text>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Comment ça marche</Text>
          {[
            { n: '1', text: 'Partagez votre code unique avec un ami' },
            { n: '2', text: "L'ami s'inscrit et effectue sa 1ère course" },
            { n: '3', text: 'Vous recevez tous les deux 6 TND de crédit' },
          ].map((s) => (
            <View key={s.n} style={styles.howRow}>
              <View style={styles.howNum}>
                <Text style={styles.howNumText}>{s.n}</Text>
              </View>
              <Text style={styles.howText}>{s.text}</Text>
            </View>
          ))}
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Mes filleuls</Text>
          {data.referees.map((r, i) => {
            const sc = STATUS_MAP[r.status];
            return (
              <View key={i} style={styles.refereeCard}>
                <View style={styles.refereeAvatar}>
                  <Text style={{ fontSize: 22 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.refereeName}>{r.name}</Text>
                  <Text style={styles.refereeDate}>{r.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.refereeReward, { color: sc.color }]}>+{r.reward.toFixed(2)} TND</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  heroCard: {
    alignItems: 'center', margin: 16, backgroundColor: '#1A0E00', borderRadius: 16,
    padding: 24, borderWidth: 1, borderColor: COLORS.accent,
  },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: { color: COLORS.white, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  heroSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  codeCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  codeLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  codeValue: {
    color: COLORS.accent, fontSize: 32, fontWeight: '900', letterSpacing: 4, marginBottom: 16,
  },
  codeActions: { flexDirection: 'row', gap: 10, width: '100%' },
  codeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  codeBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  codeBtnShare: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  codeBtnShareText: { color: '#000', fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statNum: { color: COLORS.white, fontSize: 24, fontWeight: '900' },
  statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 4, textAlign: 'center' },
  earningsCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: '#1A0E00',
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.accent,
  },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  earningsLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  earningsTotal: { color: COLORS.green, fontSize: 24, fontWeight: '900' },
  progressContainer: {},
  progressBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  progressLabel: { color: COLORS.muted, fontSize: 11 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  howNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1A0E00', borderWidth: 2, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  howNumText: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  howText: { color: COLORS.white, fontSize: 14, flex: 1 },
  refereeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  refereeAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  refereeName: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  refereeDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  refereeReward: { fontSize: 15, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
