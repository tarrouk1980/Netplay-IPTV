import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FEATURES = [
  { feature: 'Recherche illimitée', free: true, pro: true },
  { feature: 'Comparaison prix', free: true, pro: true },
  { feature: 'Alertes prix', free: '2 max', pro: '✅ Illimité' },
  { feature: 'Offres flash early access', free: false, pro: '+24h avant' },
  { feature: 'Cashback sur clics', free: false, pro: '2%' },
  { feature: 'Publicités', free: true, pro: false },
  { feature: 'Support prioritaire', free: false, pro: true },
  { feature: 'Historique 12 mois', free: false, pro: true },
  { feature: 'Filtres avancés', free: false, pro: true },
  { feature: 'Mode hors ligne', free: false, pro: true },
];

function FeatureCell({ value, isPro }) {
  if (value === true) return <Ionicons name="checkmark-circle" size={20} color={isPro ? '#FF6B35' : '#38A169'} />;
  if (value === false) return <Ionicons name="close-circle" size={20} color="#E2E8F0" />;
  return <Text style={[styles.featureVal, isPro && styles.featureValPro]}>{value}</Text>;
}

export default function EasyHotelsProScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState('annual'); // 'monthly' | 'annual'

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A1A' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A1A', '#1A1A3E', '#004E89']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EasyHotels PRO ⚡</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Hero */}
        <LinearGradient colors={['#1A1A3E', '#004E89', '#1a6eac']} style={styles.heroSection}>
          <View style={styles.crownBadge}>
            <Text style={{ fontSize: 52 }}>👑</Text>
            <LinearGradient colors={['#FFD700', '#F5A623']} style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Débloquez l'expérience premium</Text>
          <Text style={styles.heroSub}>Accédez aux meilleures offres avant tout le monde, sans publicité et avec cashback.</Text>
          <View style={styles.socialProof}>
            <Text style={styles.socialProofText}>🌟 +2 400 membres PRO actifs en Maghreb</Text>
          </View>
        </LinearGradient>

        {/* Plan toggle */}
        <View style={styles.planToggleWrapper}>
          <View style={styles.planToggle}>
            <TouchableOpacity style={[styles.planOption, plan === 'monthly' && styles.planOptionActive]} onPress={() => setPlan('monthly')}>
              <Text style={[styles.planOptionText, plan === 'monthly' && styles.planOptionTextActive]}>Mensuel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.planOption, plan === 'annual' && styles.planOptionActive]} onPress={() => setPlan('annual')}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.planOptionText, plan === 'annual' && styles.planOptionTextActive]}>Annuel</Text>
                <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>-33%</Text></View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing cards */}
        <View style={styles.pricingRow}>
          {/* Free */}
          <View style={styles.pricingCardFree}>
            <Text style={styles.pricingPlanName}>Gratuit</Text>
            <Text style={styles.pricingPrice}>0 TND</Text>
            <Text style={styles.pricingPer}>/mois</Text>
            <View style={styles.pricingDivider} />
            <Text style={styles.pricingDesc}>Accès aux fonctionnalités de base</Text>
          </View>
          {/* Pro */}
          <LinearGradient colors={['#004E89', '#1a6eac', '#FF6B35']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pricingCardPro}>
            <View style={styles.proTag}><Text style={styles.proTagText}>⚡ PRO</Text></View>
            <Text style={styles.pricingPlanNamePro}>{plan === 'annual' ? 'Annuel' : 'Mensuel'}</Text>
            <Text style={styles.pricingPricePro}>
              {plan === 'annual' ? '120' : '15'}
              <Text style={{ fontSize: 16 }}> TND</Text>
            </Text>
            <Text style={styles.pricingPerPro}>/{plan === 'annual' ? 'an' : 'mois'}</Text>
            {plan === 'annual' && <Text style={styles.annualSaving}>Soit 10 TND/mois · Économisez 60 TND</Text>}
          </LinearGradient>
        </View>

        {/* Feature comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comparaison des fonctionnalités</Text>
          <View style={styles.compTable}>
            <View style={styles.compTableHeader}>
              <Text style={[styles.compHeaderCell, { flex: 2 }]}>Fonctionnalité</Text>
              <Text style={styles.compHeaderCell}>Gratuit</Text>
              <Text style={[styles.compHeaderCell, { color: '#FF6B35' }]}>PRO ⚡</Text>
            </View>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.compRow, i % 2 === 0 && styles.compRowEven]}>
                <Text style={[styles.compCell, styles.compCellLabel, { flex: 2 }]}>{f.feature}</Text>
                <View style={styles.compCell}><FeatureCell value={f.free} isPro={false} /></View>
                <View style={[styles.compCell, styles.compCellPro]}><FeatureCell value={f.pro} isPro={true} /></View>
              </View>
            ))}
          </View>
        </View>

        {/* PRO benefits highlight */}
        <View style={[styles.section, { paddingHorizontal: 16 }]}>
          <LinearGradient colors={['#1A1A3E', '#004E89']} style={styles.benefitsHighlight}>
            <Text style={styles.benefitsTitle}>Pourquoi choisir PRO ?</Text>
            {[
              { icon: '⚡', text: 'Accédez aux offres flash 24h avant tout le monde' },
              { icon: '💸', text: '2% de cashback sur chaque clic sponsorisé' },
              { icon: '🚫', text: 'Expérience 100% sans publicité' },
              { icon: '🎯', text: 'Filtres ultra-précis : halal, piscine séparée, animation...' },
              { icon: '📶', text: 'Consultez vos favoris et résultats hors ligne' },
            ].map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Text style={{ fontSize: 20 }}>{b.icon}</Text>
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Trial CTA */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity activeOpacity={0.85}>
            <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.trialBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.trialBtnText}>Commencer l'essai gratuit · 7 jours</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.trialNote}>Aucun paiement requis pendant l'essai • Annulez à tout moment</Text>

          <TouchableOpacity style={styles.laterBtn}>
            <Text style={styles.laterBtnText}>Continuer avec la version gratuite</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSection: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  crownBadge: { alignItems: 'center', marginBottom: 12 },
  proBadge: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 5, marginTop: -8 },
  proBadgeText: { color: '#0A0A1A', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  socialProof: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  socialProofText: { color: '#FFD700', fontWeight: '700', fontSize: 13 },
  planToggleWrapper: { alignItems: 'center', marginVertical: 20 },
  planToggle: { flexDirection: 'row', backgroundColor: '#1A1A3E', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: '#2D3748' },
  planOption: { paddingHorizontal: 28, paddingVertical: 10, borderRadius: 10, alignItems: 'center', minWidth: 110 },
  planOptionActive: { backgroundColor: '#FF6B35' },
  planOptionText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 14 },
  planOptionTextActive: { color: '#fff' },
  saveBadge: { backgroundColor: '#FFD700', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, marginTop: 2 },
  saveBadgeText: { color: '#0A0A1A', fontSize: 9, fontWeight: '900' },
  pricingRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  pricingCardFree: { flex: 1, backgroundColor: '#1A1A3E', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2D3748' },
  pricingPlanName: { color: '#A0AEC0', fontWeight: '700', fontSize: 13, marginBottom: 6 },
  pricingPrice: { color: '#fff', fontSize: 30, fontWeight: '900' },
  pricingPer: { color: '#718096', fontSize: 12 },
  pricingDivider: { width: '100%', height: 1, backgroundColor: '#2D3748', marginVertical: 12 },
  pricingDesc: { color: '#A0AEC0', fontSize: 11, textAlign: 'center' },
  pricingCardPro: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  proTag: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  proTagText: { color: '#FFD700', fontWeight: '900', fontSize: 11 },
  pricingPlanNamePro: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13, marginBottom: 6 },
  pricingPricePro: { color: '#fff', fontSize: 30, fontWeight: '900' },
  pricingPerPro: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  annualSaving: { color: '#FFD700', fontSize: 10, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', paddingHorizontal: 16, marginBottom: 14 },
  compTable: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#2D3748' },
  compTableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A3E', paddingVertical: 12, paddingHorizontal: 4 },
  compHeaderCell: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '800', color: '#A0AEC0' },
  compRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: '#1A1A3E' },
  compRowEven: { backgroundColor: '#12122A' },
  compCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  compCellLabel: { fontSize: 12, color: '#CBD5E0', paddingHorizontal: 8 },
  compCellPro: { borderLeftWidth: 1, borderLeftColor: '#2D3748' },
  featureVal: { fontSize: 11, color: '#A0AEC0', textAlign: 'center', fontWeight: '600' },
  featureValPro: { color: '#FF6B35', fontWeight: '700' },
  benefitsHighlight: { borderRadius: 16, padding: 20, gap: 12 },
  benefitsTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1, lineHeight: 18 },
  trialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14 },
  trialBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  trialNote: { textAlign: 'center', color: '#718096', fontSize: 11, marginTop: 10 },
  laterBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 12 },
  laterBtnText: { color: '#718096', fontSize: 13, fontWeight: '600' },
});
