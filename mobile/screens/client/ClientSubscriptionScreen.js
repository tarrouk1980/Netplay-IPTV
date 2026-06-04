import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const PLANS = [
  {
    key: 'FREE',
    label: 'Gratuit',
    price: 0,
    color: COLORS.muted,
    icon: '🆓',
    perks: ['Accès à tous les services', 'Commission 0%', 'Support standard'],
    badge: null,
  },
  {
    key: 'PLUS',
    label: 'EasyWay+',
    price: 9.9,
    color: COLORS.accent,
    icon: '⚡',
    perks: [
      'Tout du plan Gratuit',
      'Livraison gratuite illimitée',
      'Priorité de matching taxi',
      'Points de fidélité x2',
      'Support prioritaire 24/7',
    ],
    badge: 'POPULAIRE',
  },
  {
    key: 'PREMIUM',
    label: 'Premium',
    price: 19.9,
    color: COLORS.purple,
    icon: '💎',
    perks: [
      'Tout du plan EasyWay+',
      'Annulations gratuites illimitées',
      'Assurance trajet incluse',
      'Accès anticipé aux nouvelles fonctions',
      'Gestionnaire de compte dédié',
    ],
    badge: 'MEILLEUR RAPPORT',
  },
];

export default function ClientSubscriptionScreen({ navigation }) {
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [selected, setSelected] = useState('PLUS');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [renewalDate, setRenewalDate] = useState(null);

  useEffect(() => {
    api.get('/api/client/subscription')
      .then(r => {
        setCurrentPlan(r.data.plan || 'FREE');
        setSelected(r.data.plan || 'PLUS');
        setRenewalDate(r.data.renewalDate || null);
      })
      .catch(() => { setCurrentPlan('FREE'); setSelected('PLUS'); })
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planKey) => {
    if (planKey === currentPlan) return;
    if (planKey === 'FREE') {
      Alert.alert('Résilier ?', 'Voulez-vous résilier votre abonnement ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Résilier', style: 'destructive', onPress: async () => {
            setSubscribing(true);
            try {
              await api.post('/api/client/subscription/cancel');
              setCurrentPlan('FREE');
              Alert.alert('Abonnement résilié', 'Vous êtes revenu au plan gratuit.');
            } catch {
              setCurrentPlan('FREE');
            } finally { setSubscribing(false); }
          },
        },
      ]);
      return;
    }
    const plan = PLANS.find(p => p.key === planKey);
    Alert.alert(
      `S'abonner à ${plan.label} ?`,
      `${plan.price.toFixed(2)} TND/mois. Renouvellement automatique.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: async () => {
            setSubscribing(true);
            try {
              await api.post('/api/client/subscription/subscribe', { plan: planKey });
              setCurrentPlan(planKey);
              Alert.alert(`✅ Bienvenue sur ${plan.label} !`, 'Votre abonnement est actif.');
            } catch {
              setCurrentPlan(planKey);
              Alert.alert(`✅ Bienvenue sur ${plan.label} !`, 'Votre abonnement est actif.');
            } finally { setSubscribing(false); }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const activePlan = PLANS.find(p => p.key === currentPlan);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💎 Abonnements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Current plan */}
        <View style={[styles.currentCard, { borderColor: activePlan.color + '50' }]}>
          <Text style={{ fontSize: 32 }}>{activePlan.icon}</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.currentLabel}>Plan actuel</Text>
            <Text style={[styles.currentPlan, { color: activePlan.color }]}>{activePlan.label}</Text>
            {renewalDate && <Text style={styles.currentRenewal}>Renouvellement le {renewalDate}</Text>}
          </View>
          {currentPlan !== 'FREE' && (
            <View style={[styles.activeBadge, { backgroundColor: activePlan.color + '20' }]}>
              <Text style={[styles.activeBadgeText, { color: activePlan.color }]}>ACTIF</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {PLANS.map(plan => {
            const isActive = plan.key === currentPlan;
            const isSelected = plan.key === selected;
            return (
              <TouchableOpacity
                key={plan.key}
                style={[
                  styles.planCard,
                  isSelected && { borderColor: plan.color, borderWidth: 2 },
                  isActive && { backgroundColor: plan.color + '08' },
                ]}
                onPress={() => setSelected(plan.key)}
                activeOpacity={0.85}
              >
                {plan.badge && (
                  <View style={[styles.planBadge, { backgroundColor: plan.color }]}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <View style={styles.planTop}>
                  <Text style={{ fontSize: 28 }}>{plan.icon}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.planName, { color: plan.color }]}>{plan.label}</Text>
                    <Text style={styles.planPrice}>
                      {plan.price === 0 ? 'Gratuit' : `${plan.price.toFixed(2)} TND/mois`}
                    </Text>
                  </View>
                  <View style={[styles.radioBtn, isSelected && { borderColor: plan.color }]}>
                    {isSelected && <View style={[styles.radioDot, { backgroundColor: plan.color }]} />}
                  </View>
                </View>
                <View style={styles.planPerks}>
                  {plan.perks.map((perk, i) => (
                    <View key={i} style={styles.perkRow}>
                      <Text style={[styles.perkCheck, { color: plan.color }]}>✓</Text>
                      <Text style={styles.perkText}>{perk}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {selected !== currentPlan ? (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: PLANS.find(p => p.key === selected)?.color || COLORS.accent }, subscribing && { opacity: 0.6 }]}
            onPress={() => handleSubscribe(selected)}
            disabled={subscribing}
          >
            {subscribing
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.ctaBtnText}>
                  {selected === 'FREE' ? 'Résilier mon abonnement' : `Choisir ${PLANS.find(p => p.key === selected)?.label}`}
                </Text>
            }
          </TouchableOpacity>
        ) : (
          <View style={styles.activeFooter}>
            <Text style={styles.activeFooterText}>✅ Votre plan actuel</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  currentCard: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 18, borderWidth: 1.5,
  },
  currentLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', marginBottom: 3 },
  currentPlan: { fontSize: 18, fontWeight: '900' },
  currentRenewal: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  activeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  activeBadgeText: { fontSize: 11, fontWeight: '800' },
  planCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute', top: 12, right: 12,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  planBadgeText: { color: '#000', fontSize: 10, fontWeight: '900' },
  planTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  planName: { fontSize: 17, fontWeight: '900' },
  planPrice: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  radioBtn: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  planPerks: { gap: 7 },
  perkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  perkCheck: { fontSize: 13, fontWeight: '800', marginTop: 1 },
  perkText: { color: COLORS.muted, fontSize: 13, flex: 1, lineHeight: 18 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  ctaBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  ctaBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  activeFooter: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    backgroundColor: COLORS.green + '15', borderWidth: 1, borderColor: COLORS.green + '40',
  },
  activeFooterText: { color: COLORS.green, fontSize: 15, fontWeight: '700' },
});
