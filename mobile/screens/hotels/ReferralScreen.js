import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, Animated, Share, Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REFERRAL_CODE = 'EASY-AHMED2026';

const STEPS = [
  { icon: '📤', title: 'Partagez votre code unique', desc: 'Envoyez votre code à vos amis via WhatsApp, SMS ou réseaux sociaux' },
  { icon: '👤', title: 'Votre ami s\'inscrit', desc: 'Votre ami télécharge EasyHotels et fait sa première recherche' },
  { icon: '🎁', title: 'Vous êtes tous les deux récompensés', desc: 'Vous recevez 20 TND, votre ami reçoit 10 TND de réduction' },
];

const SHARE_OPTIONS = [
  { icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366' },
  { icon: 'logo-facebook', label: 'Facebook', color: '#1877F2' },
  { icon: 'logo-instagram', label: 'Instagram', color: '#E1306C' },
  { icon: 'chatbubble-outline', label: 'SMS', color: '#8E8E9A' },
  { icon: 'copy-outline', label: 'Copier', color: '#004E89' },
];

const MOCK_REFERRALS = [
  { id: '1', name: 'Sami Ben Ali', date: '12 Juin 2026', status: 'Validé', reward: '20 TND' },
  { id: '2', name: 'Fatma Trabelsi', date: '5 Juin 2026', status: 'Validé', reward: '20 TND' },
  { id: '3', name: 'Youssef Miled', date: '1 Juin 2026', status: 'En attente', reward: '—' },
];

function Confetti({ anim }) {
  const COLORS = ['#FF6B35', '#004E89', '#FFD700', '#25D366', '#E1306C'];
  const confettiItems = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 380,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 400,
      size: 6 + Math.random() * 6,
      anim: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    confettiItems.forEach(item => {
      Animated.sequence([
        Animated.delay(item.delay),
        Animated.timing(item.anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confettiItems.map((item, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: item.x,
            top: 0,
            width: item.size,
            height: item.size,
            borderRadius: item.size / 4,
            backgroundColor: item.color,
            opacity: item.anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{
              translateY: item.anim.interpolate({ inputRange: [0, 1], outputRange: [0, 300 + Math.random() * 200] }),
            }, {
              rotate: item.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 * (Math.random() > 0.5 ? 1 : -1)}deg`] }),
            }],
          }}
        />
      ))}
    </View>
  );
}

export default function ReferralScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(confettiAnim, { toValue: 1, duration: 1200, useNativeDriver: false }).start();
  }, []);

  function copyCode() {
    Clipboard.setString(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare(option) {
    if (option === 'Copier') { copyCode(); return; }
    try {
      await Share.share({ message: `Rejoignez EasyHotels et économisez sur votre prochain séjour ! Utilisez mon code parrainage : **${REFERRAL_CODE}** pour recevoir 10 TND de réduction sur votre première réservation. Téléchargez l'app : https://easyhotels.tn` });
    } catch {}
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />
      <Confetti anim={confettiAnim} />

      <LinearGradient colors={['#004E89', '#1a6eac', '#FF6B35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 10 }]}>
        <View style={styles.heroHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Parrainage</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroIllustration}>
          <Text style={{ fontSize: 60 }}>🎁</Text>
          <View style={styles.heroPersons}>
            <Text style={{ fontSize: 36 }}>👤</Text>
            <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
        </View>

        <Text style={styles.heroSubtitle}>Invitez vos amis,{'\n'}gagnez des récompenses</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Amis invités</Text>
          </View>
          <View style={[styles.statCard, { borderLeftWidth: 1, borderLeftColor: '#E2E8F0' }]}>
            <Text style={[styles.statValue, { color: '#FF6B35' }]}>60 TND</Text>
            <Text style={styles.statLabel}>Récompenses gagnées</Text>
          </View>
        </View>

        {/* Referral Code Box */}
        <View style={styles.codeSection}>
          <Text style={styles.codeSectionLabel}>Votre code de parrainage</Text>
          <View style={styles.codeBox}>
            <LinearGradient colors={['#004E89', '#1a6eac']} style={styles.codeGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={20} color="#fff" />
                <Text style={styles.copyBtnText}>{copied ? 'Copié !' : 'Copier'}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          <Text style={styles.codeHint}>Votre ami reçoit 10 TND · Vous recevez 20 TND</Text>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIconBox}>
                <Text style={{ fontSize: 24 }}>{step.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.stepNumberRow}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i + 1}</Text></View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Share options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partager via</Text>
          <View style={styles.shareGrid}>
            {SHARE_OPTIONS.map((opt, i) => (
              <TouchableOpacity key={i} style={styles.shareOption} onPress={() => handleShare(opt.label)}>
                <View style={[styles.shareIconBox, { backgroundColor: opt.color + '20' }]}>
                  <Ionicons name={opt.icon} size={26} color={opt.color} />
                </View>
                <Text style={styles.shareLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Referral list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes parrainages</Text>
          {MOCK_REFERRALS.map((ref) => (
            <View key={ref.id} style={styles.referralRow}>
              <View style={styles.referralAvatar}>
                <Ionicons name="person" size={18} color="#004E89" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.referralName}>{ref.name}</Text>
                <Text style={styles.referralDate}>{ref.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={[styles.statusBadge, ref.status === 'Validé' ? styles.statusValid : styles.statusPending]}>
                  <Text style={[styles.statusText, ref.status === 'Validé' ? styles.statusTextValid : styles.statusTextPending]}>{ref.status}</Text>
                </View>
                {ref.reward !== '—' && <Text style={styles.rewardText}>{ref.reward}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Pending rewards */}
        <View style={[styles.section, { marginHorizontal: 16 }]}>
          <View style={styles.pendingBox}>
            <Text style={styles.pendingEmoji}>⏳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingTitle}>Récompense en attente</Text>
              <Text style={styles.pendingDesc}>Youssef Miled doit faire sa première recherche pour valider votre récompense.</Text>
            </View>
          </View>
        </View>

        {/* Withdraw button */}
        <TouchableOpacity style={styles.withdrawBtn} onPress={() => navigation.navigate('Wallet')} activeOpacity={0.85}>
          <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.withdrawGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="wallet-outline" size={20} color="#fff" />
            <Text style={styles.withdrawText}>Retirer mes récompenses · 60 TND</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 30, paddingHorizontal: 16 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroIllustration: { alignItems: 'center', marginBottom: 12 },
  heroPersons: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  heroSubtitle: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', lineHeight: 30 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: -16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statValue: { fontSize: 26, fontWeight: '900', color: '#004E89' },
  statLabel: { fontSize: 12, color: '#718096', marginTop: 3, fontWeight: '500' },
  codeSection: { margin: 16, marginTop: 24 },
  codeSectionLabel: { fontSize: 14, fontWeight: '700', color: '#4A5568', marginBottom: 10 },
  codeBox: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  codeGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20 },
  codeText: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  copyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  codeHint: { textAlign: 'center', fontSize: 12, color: '#718096', marginTop: 8 },
  section: { marginTop: 8, paddingHorizontal: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C', paddingHorizontal: 16, marginBottom: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  stepIconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFF5F0', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FDBA74' },
  stepNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  stepNumber: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748', flex: 1 },
  stepDesc: { fontSize: 12, color: '#718096', lineHeight: 18 },
  shareGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, flexWrap: 'wrap' },
  shareOption: { alignItems: 'center', gap: 6, minWidth: 56 },
  shareIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  shareLabel: { fontSize: 11, color: '#4A5568', fontWeight: '600' },
  referralRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, gap: 12 },
  referralAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center' },
  referralName: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  referralDate: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusValid: { backgroundColor: '#F0FFF4' },
  statusPending: { backgroundColor: '#FEFCBF' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextValid: { color: '#276749' },
  statusTextPending: { color: '#975A16' },
  rewardText: { fontSize: 13, fontWeight: '800', color: '#FF6B35', marginTop: 3 },
  pendingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEFCBF', borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: '#F6E05E' },
  pendingEmoji: { fontSize: 28 },
  pendingTitle: { fontSize: 13, fontWeight: '700', color: '#975A16', marginBottom: 3 },
  pendingDesc: { fontSize: 12, color: '#744210', lineHeight: 17 },
  withdrawBtn: { margin: 16, borderRadius: 14, overflow: 'hidden' },
  withdrawGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  withdrawText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
