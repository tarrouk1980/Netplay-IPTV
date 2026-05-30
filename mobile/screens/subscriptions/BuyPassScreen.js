import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import usePassStore from '../../store/passStore';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  green: '#27AE60',
  error: '#E74C3C',
};

// Pictos SVG-like en Text stylé — pas d'emoji système
const PassIcon = ({ type, selected }) => {
  const configs = {
    FREE:    { bg: '#1A2A1A', icon: '🎁', accent: '#27AE60' },
    DAILY:   { bg: '#1A1A10', icon: '🌅', accent: '#F5A623' },
    SEMAINE: { bg: '#0E1A2E', icon: '📆', accent: '#3498DB' },
    MENSUEL: { bg: '#1A0E2E', icon: '🗃️', accent: '#9B59B6' },
    PRO:     { bg: '#1A0E0E', icon: '👑', accent: '#E74C3C' },
  };
  const c = configs[type] || configs.DAILY;
  return (
    <View style={[styles.passIconBox, { backgroundColor: selected ? c.accent + '33' : c.bg, borderColor: selected ? c.accent : 'transparent' }]}>
      <Text style={styles.passIconText}>{c.icon}</Text>
    </View>
  );
};

const PLANS = [
  {
    key: 'DAILY',
    label: 'Pass Journalier',
    price: '1 TND',
    priceSub: '/ jour',
    description: 'Illimité, accès complet pour 24h',
    badge: null,
    accent: '#F5A623',
  },
  {
    key: 'SEMAINE',
    label: 'Pass Semaine',
    price: '6 TND',
    priceSub: '/ semaine',
    description: '7 jours d\'accès illimité',
    badge: '+1 jour offert',
    badgeColor: '#27AE60',
    accent: '#3498DB',
  },
  {
    key: 'MENSUEL',
    label: 'Pass Mensuel',
    price: '30 TND',
    priceSub: '/ mois',
    description: '30 jours d\'accès illimité',
    badge: '+5 jours offerts',
    badgeColor: '#9B59B6',
    accent: '#9B59B6',
  },
  {
    key: 'PRO',
    label: 'Pass Pro',
    price: '75 TND',
    priceSub: '/ 3 mois',
    description: '90 jours · Priorité · Support dédié',
    badge: '+15 jours offerts',
    badgeColor: '#E74C3C',
    accent: '#E74C3C',
  },
];

export default function BuyPassScreen({ navigation }) {
  const { user } = useAuthStore();
  const { claimTrial, buyPass, fetchPassStatus } = usePassStore();
  const [selectedPlan, setSelectedPlan] = useState('DAILY');
  const [trialEligible, setTrialEligible] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (user?.createdAt) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      setTrialEligible(new Date(user.createdAt) >= sevenDaysAgo);
    }
  }, [user?.createdAt]);

  const handleActivate = async () => {
    setActivating(true);
    try {
      const result = selectedPlan === 'FREE_TRIAL'
        ? await claimTrial()
        : await buyPass(selectedPlan);

      if (result.success) {
        await fetchPassStatus();
        const plan = PLANS.find((p) => p.key === selectedPlan);
        Alert.alert(
          'Pass activé ! ✅',
          result.data?.message || `${plan?.label || 'Pass'} activé avec succès.`,
          [{ text: 'Super !', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'activer le pass.');
      }
    } finally {
      setActivating(false);
    }
  };

  const selectedAccent = selectedPlan === 'FREE_TRIAL'
    ? '#27AE60'
    : (PLANS.find((p) => p.key === selectedPlan)?.accent || '#F5A623');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Activer un Pass</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.heroBox}>
          <Text style={styles.heroTitle}>Travaillez sans limites</Text>
          <Text style={styles.heroSub}>Choisissez la formule qui vous convient{'\n'}et commencez à recevoir des commandes.</Text>
        </View>

        <Text style={styles.sectionLabel}>CHOISISSEZ VOTRE FORMULE</Text>

        {/* Essai gratuit */}
        {trialEligible && (
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'FREE_TRIAL' && { borderColor: '#27AE60', backgroundColor: '#0A1F0A' }]}
            onPress={() => setSelectedPlan('FREE_TRIAL')}
            activeOpacity={0.85}
          >
            <PassIcon type="FREE" selected={selectedPlan === 'FREE_TRIAL'} />
            <View style={styles.planInfo}>
              <View style={styles.planNameRow}>
                <Text style={styles.planName}>Essai gratuit</Text>
                <View style={[styles.badge, { backgroundColor: '#27AE60' }]}>
                  <Text style={styles.badgeText}>NOUVEAU COMPTE</Text>
                </View>
              </View>
              <Text style={styles.planDesc}>1 jour offert pour découvrir EASYWAY</Text>
            </View>
            <View style={styles.planPriceCol}>
              <Text style={[styles.planPrice, { color: '#27AE60' }]}>0 TND</Text>
              <Text style={styles.planPriceSub}>gratuit</Text>
            </View>
          </TouchableOpacity>
        )}

        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.key;
          return (
            <TouchableOpacity
              key={plan.key}
              style={[styles.planCard, isSelected && { borderColor: plan.accent, backgroundColor: plan.accent + '11' }]}
              onPress={() => setSelectedPlan(plan.key)}
              activeOpacity={0.85}
            >
              <PassIcon type={plan.key} selected={isSelected} />
              <View style={styles.planInfo}>
                <View style={styles.planNameRow}>
                  <Text style={[styles.planName, isSelected && { color: plan.accent }]}>{plan.label}</Text>
                  {plan.badge && (
                    <View style={[styles.badge, { backgroundColor: plan.badgeColor }]}>
                      <Text style={styles.badgeText}>{plan.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.planDesc}>{plan.description}</Text>
              </View>
              <View style={styles.planPriceCol}>
                <Text style={[styles.planPrice, isSelected && { color: plan.accent }]}>{plan.price}</Text>
                <Text style={styles.planPriceSub}>{plan.priceSub}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Comparatif économies */}
        <View style={styles.savingsBox}>
          <Text style={styles.savingsTitle}>💰 Économies vs quotidien</Text>
          <View style={styles.savingsRow}><Text style={styles.savingsLabel}>Pass Semaine</Text><Text style={styles.savingsValue}>+1 jour offert (valeur 1 TND)</Text></View>
          <View style={styles.savingsRow}><Text style={styles.savingsLabel}>Pass Mensuel</Text><Text style={styles.savingsValue}>+5 jours offerts (valeur 5 TND)</Text></View>
          <View style={styles.savingsRow}><Text style={styles.savingsLabel}>Pass Pro</Text><Text style={styles.savingsValue}>+15 jours + priorité commandes</Text></View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bouton fixe en bas */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.activateBtn, { backgroundColor: selectedAccent }, activating && { opacity: 0.6 }]}
          onPress={handleActivate}
          activeOpacity={0.85}
          disabled={activating}
        >
          {activating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.activateBtnText}>
              {selectedPlan === 'FREE_TRIAL' ? '🎁 Activer l\'essai gratuit' : 'Activer le pass'}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.disclaimer}>En activant, vous acceptez les conditions EASYWAY.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { color: COLORS.text, fontSize: 32, lineHeight: 32, marginTop: -4 },
  topTitle: { flex: 1, textAlign: 'center', color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  heroBox: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 8 },
  heroTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  heroSub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  passIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
  },
  passIconText: { fontSize: 24 },
  planInfo: { flex: 1 },
  planNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  planName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  planDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17 },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  planPriceCol: { alignItems: 'flex-end', flexShrink: 0 },
  planPrice: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  planPriceSub: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },
  savingsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  savingsTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 10 },
  savingsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  savingsLabel: { color: COLORS.textMuted, fontSize: 12 },
  savingsValue: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  activateBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  activateBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  disclaimer: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center' },
});
