import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useReferralStore from '../../store/referralStore';
import EasywayLogo from '../../components/EasywayLogo';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
};

export default function ShareAppScreen({ navigation }) {
  const { code, isLoading, fetchMyCode } = useReferralStore();

  useEffect(() => {
    fetchMyCode();
  }, []);

  const handleShare = async () => {
    let message = 'Rejoins EASYWAY, l\'app tunisienne tout-en-un ! Télécharge ici : https://easyway.app/download';
    if (code) {
      message += `\nUtilise mon code de parrainage : ${code} pour gagner 1 jour gratuit !`;
    }

    try {
      await Share.share({
        message,
        url: 'https://easyway.app/download',
        title: 'Découvrez EASYWAY',
      });
    } catch (err) {
      console.warn('[ShareAppScreen] Share error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Logo placeholder */}
        <View style={styles.logoContainer}>
          <EasywayLogo size={90} showTagline={false} />
          <Text style={styles.appName}>EASY<Text style={{ color: '#D32F2F' }}>WAY</Text></Text>
          <Text style={styles.tagline}>L'app tunisienne tout-en-un</Text>
          <Text style={styles.taglineSub}>Taxi • Livraison • SOS • Courses</Text>
        </View>

        {/* Referral code */}
        {code && (
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>VOTRE CODE PARRAIN</Text>
            <Text style={styles.codeText}>{code}</Text>
            <Text style={styles.codeHint}>Vos amis gagnent 1 jour gratuit en utilisant ce code</Text>
          </View>
        )}

        {isLoading && !code && (
          <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} />
        )}

        {/* Share button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
          <Text style={styles.shareBtnText}>📤 Inviter mes amis</Text>
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Pourquoi EASYWAY ?</Text>
          {[
            { emoji: '🚕', text: 'Taxi à la demande partout en Tunisie' },
            { emoji: '📦', text: 'Livraison rapide de vos commerces préférés' },
            { emoji: '🔧', text: 'SOS Dépannage — disponible 24h/24' },
            { emoji: '🛒', text: 'Courses à domicile en quelques minutes' },
          ].map((feat, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{feat.emoji}</Text>
              <Text style={styles.featureText}>{feat.text}</Text>
            </View>
          ))}
        </View>

        {/* Navigate to referral */}
        <TouchableOpacity
          style={styles.referralLink}
          onPress={() => navigation.navigate('Referral')}
          activeOpacity={0.85}
        >
          <Text style={styles.referralLinkText}>🎁 Voir mes statistiques de parrainage →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 28, paddingTop: 12 },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: { fontSize: 48, fontWeight: '900', color: COLORS.background },
  appName: { fontSize: 30, fontWeight: '900', color: COLORS.text, letterSpacing: 2 },
  tagline: { fontSize: 16, color: COLORS.accent, fontWeight: '700', marginTop: 6 },
  taglineSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  codeCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  codeText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 6,
    marginBottom: 8,
  },
  codeHint: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  shareBtn: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareBtnText: { color: COLORS.background, fontWeight: '900', fontSize: 17 },
  featuresCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  featuresTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  featureEmoji: { fontSize: 22 },
  featureText: { fontSize: 14, color: COLORS.text, flex: 1 },
  referralLink: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  referralLinkText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
});
