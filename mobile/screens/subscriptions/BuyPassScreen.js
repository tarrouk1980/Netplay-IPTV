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
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3E',
  success: '#27AE60',
  error: '#E74C3C',
};

const PLANS = [
  {
    key: 'DAILY',
    label: 'Pass Journalier',
    price: '1 TND / jour',
    description: 'Accès complet pour 24h',
    emoji: '☀️',
  },
  {
    key: 'DECOUVERTE',
    label: 'Découverte',
    price: '5 TND',
    description: '5 courses incluses, valable 7 jours',
    emoji: '🌟',
  },
  {
    key: 'SEMAINE',
    label: 'Pass Semaine',
    price: '15 TND',
    description: 'Illimité pendant 7 jours',
    emoji: '📅',
  },
  {
    key: 'MENSUEL',
    label: 'Pass Mensuel',
    price: '40 TND',
    description: 'Illimité pendant 30 jours',
    emoji: '🗓',
  },
  {
    key: 'PRO',
    label: 'Pass Pro',
    price: '100 TND',
    description: 'Illimité + priorité pendant 90 jours',
    emoji: '⚡',
  },
];

export default function BuyPassScreen({ navigation }) {
  const { user } = useAuthStore();
  const { isLoading, claimTrial, buyPass, fetchPassStatus } = usePassStore();
  const [selectedPlan, setSelectedPlan] = useState('DAILY');
  const [trialEligible, setTrialEligible] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    checkTrialEligibility();
  }, []);

  const checkTrialEligibility = async () => {
    if (!user?.createdAt) return;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userCreated = new Date(user.createdAt);
    if (userCreated >= sevenDaysAgo) {
      setTrialEligible(true);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      let result;
      if (selectedPlan === 'FREE_TRIAL') {
        result = await claimTrial();
      } else {
        result = await buyPass(selectedPlan);
      }

      if (result.success) {
        await fetchPassStatus();
        Alert.alert(
          'Pass activé !',
          result.data?.message || 'Votre pass a été activé avec succès.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'activer le pass.');
      }
    } finally {
      setActivating(false);
    }
  };

  const renderPlanCard = (plan, isFree = false) => {
    const isSelected = selectedPlan === (isFree ? 'FREE_TRIAL' : plan.key);
    return (
      <TouchableOpacity
        key={isFree ? 'FREE_TRIAL' : plan.key}
        style={[styles.planCard, isSelected && styles.planCardSelected]}
        onPress={() => setSelectedPlan(isFree ? 'FREE_TRIAL' : plan.key)}
        activeOpacity={0.85}
      >
        <View style={styles.planLeft}>
          <Text style={styles.planEmoji}>{isFree ? '🎁' : plan.emoji}</Text>
          <View>
            <Text style={styles.planName}>{isFree ? 'Essai Gratuit 1 jour' : plan.label}</Text>
            <Text style={styles.planDesc}>{isFree ? 'Offert pour les nouveaux comptes' : plan.description}</Text>
          </View>
        </View>
        <View style={styles.planPriceContainer}>
          {isFree ? (
            <View style={styles.freeContainer}>
              <Text style={styles.planPriceStrike}>1 TND</Text>
              <Text style={[styles.planPrice, { color: COLORS.success }]}>0 TND</Text>
            </View>
          ) : (
            <Text style={[styles.planPrice, isSelected && { color: COLORS.accent }]}>{plan.price}</Text>
          )}
          {isSelected && <View style={styles.selectedDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Passer Premium</Text>
          <Text style={styles.headerSub}>Choisissez un pass pour continuer à travailler</Text>
        </View>

        {/* Plans */}
        <Text style={styles.sectionLabel}>CHOISISSEZ UN PASS</Text>

        {/* Free trial first if eligible */}
        {trialEligible && renderPlanCard(null, true)}

        {PLANS.map((plan) => renderPlanCard(plan))}

        {/* Activate button */}
        <TouchableOpacity
          style={[styles.activateBtn, activating && styles.activateBtnDisabled]}
          onPress={handleActivate}
          activeOpacity={0.85}
          disabled={activating}
        >
          {activating ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.activateBtnText}>
              {selectedPlan === 'FREE_TRIAL' ? '🎁 Activer l\'essai gratuit' : '⚡ Activer le pass'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          En activant un pass, vous acceptez les conditions d'utilisation EASYWAY.
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginBottom: 6 },
  headerSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  sectionLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: '#1F1800',
  },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  planEmoji: { fontSize: 28 },
  planName: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  planDesc: { fontSize: 12, color: COLORS.textMuted },
  planPriceContainer: { alignItems: 'flex-end', gap: 4 },
  planPrice: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  freeContainer: { alignItems: 'flex-end' },
  planPriceStrike: {
    fontSize: 12,
    color: COLORS.error,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    alignSelf: 'flex-end',
  },
  activateBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  activateBtnDisabled: { opacity: 0.6 },
  activateBtnText: { color: COLORS.background, fontWeight: '900', fontSize: 16 },
  disclaimer: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 16 },
});
