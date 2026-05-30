import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useReferralStore from '../../store/referralStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
  success: '#27AE60',
  error: '#E74C3C',
};

export default function ReferralScreen({ navigation }) {
  const { code, stats, isLoading, fetchMyCode, fetchStats, applyCode, clearError } = useReferralStore();
  const [friendCode, setFriendCode] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchStats(); // also returns code
  }, []);

  const handleShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `Rejoins EASYWAY, l'app tunisienne tout-en-un ! Utilise mon code de parrainage : ${code} pour gagner 1 jour gratuit !\nTélécharge ici : https://easyway.app/join?ref=${code}`,
        url: `https://easyway.app/join?ref=${code}`,
        title: 'Inviter un ami sur EASYWAY',
      });
    } catch (err) {
      console.warn('[ReferralScreen] Share error:', err);
    }
  };

  const handleApplyCode = async () => {
    const trimmed = friendCode.trim().toUpperCase();
    if (!trimmed || trimmed.length < 4) {
      Alert.alert('Erreur', 'Veuillez entrer un code valide');
      return;
    }
    setApplying(true);
    const result = await applyCode(trimmed);
    setApplying(false);

    if (result.success) {
      Alert.alert('Succès !', result.message || 'Code appliqué avec succès !');
      setFriendCode('');
    } else {
      Alert.alert('Erreur', result.error || 'Code invalide');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎁</Text>
          <Text style={styles.headerTitle}>Parrainage</Text>
          <Text style={styles.headerSub}>Invitez vos amis à rejoindre EASYWAY</Text>
        </View>

        {/* Your code */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>VOTRE CODE DE PARRAINAGE</Text>
          {isLoading && !code ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} />
          ) : (
            <Text style={styles.codeText}>{code || '——'}</Text>
          )}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85} disabled={!code}>
            <Text style={styles.shareBtnText}>📤 Partager mon code</Text>
          </TouchableOpacity>
          <Text style={styles.shareHint}>Partagez EASYWAY et faites découvrir l'app à vos proches !</Text>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.referrals}</Text>
              <Text style={styles.statLabel}>Amis parrainés</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxAccent]}>
              <Text style={[styles.statValue, { color: COLORS.accent }]}>{stats.totalRewardsEarned}</Text>
              <Text style={styles.statLabel}>Amis invités</Text>
            </View>
          </View>
        )}

        {/* Apply friend code */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>UTILISER UN CODE D'AMI</Text>
          <TextInput
            style={styles.input}
            value={friendCode}
            onChangeText={setFriendCode}
            placeholder="Entrez le code de votre ami"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
            maxLength={8}
          />
          <TouchableOpacity
            style={[styles.applyBtn, applying && styles.applyBtnDisabled]}
            onPress={handleApplyCode}
            activeOpacity={0.85}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <Text style={styles.applyBtnText}>Valider le code</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>COMMENT ÇA MARCHE ?</Text>
          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepText}>Partagez votre code unique avec vos amis</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepText}>Votre ami s'inscrit et entre votre code</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>Votre ami découvre EASYWAY gratuitement !</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginBottom: 6 },
  headerSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 16,
  },
  shareBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  shareBtnText: { color: COLORS.background, fontWeight: '800', fontSize: 15 },
  shareHint: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBoxAccent: { borderColor: COLORS.accent },
  statValue: { fontSize: 36, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 12,
    textAlign: 'center',
  },
  applyBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyBtnDisabled: { opacity: 0.6 },
  applyBtnText: { color: COLORS.background, fontWeight: '800', fontSize: 15 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    color: COLORS.background,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 28,
  },
  stepText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 20 },
});
