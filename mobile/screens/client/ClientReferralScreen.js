import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Share, Clipboard, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_DATA = {
  code: 'EASY-KARIM7',
  totalInvited: 8,
  totalEarned: 24.000,
  pendingEarned: 6.000,
  rewardPerReferral: 3.000,
  referrals: [
    { id: 'R1', name: 'Sana T.', joined: '12 Jan 2025', status: 'active', reward: 3.000 },
    { id: 'R2', name: 'Nabil R.', joined: '28 Jan 2025', status: 'active', reward: 3.000 },
    { id: 'R3', name: 'Rim H.', joined: '05 Fév 2025', status: 'pending', reward: 3.000 },
    { id: 'R4', name: 'Hedi B.', joined: '18 Mar 2025', status: 'active', reward: 3.000 },
  ],
};

const STATUS_COLORS = { active: COLORS.green, pending: COLORS.orange };

export default function ClientReferralScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/api/client/referral')
      .then(r => setData(r.data || MOCK_DATA))
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    Clipboard.setString(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🚖 Utilise mon code EasyWay et gagne 3 TND sur ta première course !\nCode: ${data.code}\nTélécharge l'app: https://easyway.tn`,
        title: 'Inviter un ami sur EasyWay',
      });
    } catch {}
  };

  const handleWithdraw = () => {
    if (!data || data.totalEarned < 5) {
      Alert.alert('Solde insuffisant', 'Minimum 5 TND requis pour retirer.');
      return;
    }
    Alert.alert('Retrait des gains', `${data.totalEarned.toFixed(3)} TND seront crédités sur votre portefeuille EasyWay.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () => Alert.alert('✅ Crédité !', 'Vos gains ont été ajoutés à votre portefeuille.') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎁 Parrainage</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          {/* Hero */}
          <View style={styles.heroCard}>
            <Text style={styles.heroIcon}>🎉</Text>
            <Text style={styles.heroTitle}>Invite tes amis, gagne de l'argent</Text>
            <Text style={styles.heroSub}>Toi et ton filleul recevez chacun <Text style={{ color: COLORS.accent, fontWeight: '900' }}>3 TND</Text> après sa première course.</Text>
          </View>

          {/* Code */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>TON CODE DE PARRAINAGE</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{data.code}</Text>
              <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnDone]} onPress={handleCopy}>
                <Text style={[styles.copyBtnText, copied && { color: COLORS.green }]}>{copied ? '✅ Copié' : '📋 Copier'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📤 Partager l'invitation</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.accent }]}>{data.totalEarned.toFixed(3)}</Text>
              <Text style={styles.statSub}>TND gagnés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.text }]}>{data.totalInvited}</Text>
              <Text style={styles.statSub}>Invités</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.orange }]}>{data.pendingEarned.toFixed(3)}</Text>
              <Text style={styles.statSub}>TND en attente</Text>
            </View>
          </View>

          {data.totalEarned > 0 && (
            <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
              <Text style={styles.withdrawBtnText}>💰 Retirer {data.totalEarned.toFixed(3)} TND</Text>
            </TouchableOpacity>
          )}

          {/* How it works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMMENT ÇA MARCHE</Text>
            {[
              { n: '1', t: 'Partage ton code', d: 'Envoie ton code unique à tes amis.' },
              { n: '2', t: 'Ils s\'inscrivent', d: 'Ils créent un compte avec ton code.' },
              { n: '3', t: 'Première course', d: 'Dès qu\'ils complètent leur 1ère course.' },
              { n: '4', t: 'Vous gagnez tous les deux', d: '3 TND chacun, automatiquement crédités.' },
            ].map(step => (
              <View key={step.n} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{step.n}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.t}</Text>
                  <Text style={styles.stepDesc}>{step.d}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Referral list */}
          {data.referrals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MES FILLEULS</Text>
              {data.referrals.map(r => (
                <View key={r.id} style={styles.referralCard}>
                  <View style={styles.refAvatar}><Text style={{ fontSize: 18 }}>👤</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.refName}>{r.name}</Text>
                    <Text style={styles.refDate}>Inscrit le {r.joined}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.refReward, { color: r.status === 'active' ? COLORS.green : COLORS.orange }]}>
                      {r.status === 'active' ? '+' : '⏳'}{r.reward.toFixed(3)} TND
                    </Text>
                    <Text style={[styles.refStatus, { color: STATUS_COLORS[r.status] }]}>{r.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  heroCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  heroIcon: { fontSize: 48, marginBottom: 10 },
  heroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  heroSub: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  codeCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.accent + '40', marginBottom: 16 },
  codeLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  codeText: { color: COLORS.accent, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  copyBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.accent + '50' },
  copyBtnDone: { borderColor: COLORS.green + '50', backgroundColor: COLORS.green + '20' },
  copyBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  shareBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  shareBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 18, fontWeight: '900' },
  statSub: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  withdrawBtn: { backgroundColor: COLORS.green, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  withdrawBtnText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  section: { marginBottom: 20 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.accent + '20', borderWidth: 1, borderColor: COLORS.accent + '50', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: COLORS.accent, fontSize: 13, fontWeight: '900' },
  stepTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  stepDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  referralCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  refAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  refName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  refDate: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  refReward: { fontSize: 13, fontWeight: '900' },
  refStatus: { fontSize: 10, fontWeight: '700', marginTop: 2 },
});
