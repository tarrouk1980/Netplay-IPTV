import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  gold: '#FFD700',
  green: '#27AE60',
  blue: '#3498DB',
  purple: '#9B59B6',
};

const PLANS = [
  {
    key: 'BASIC',
    name: 'EasyPass Basic',
    price: 9.9,
    period: 'mois',
    color: COLORS.blue,
    icon: '🔵',
    features: [
      '5% réduction sur chaque course taxi',
      'Support prioritaire',
      'Historique illimité',
      '2 courses taxi gratuites/mois',
    ],
    popular: false,
  },
  {
    key: 'PREMIUM',
    name: 'EasyPass Premium',
    price: 19.9,
    period: 'mois',
    color: COLORS.accent,
    icon: '⭐',
    features: [
      '15% réduction sur toutes les courses',
      '5 courses taxi gratuites/mois',
      '3 livraisons gratuites/mois',
      'Support 24/7 dédié',
      'Annulation gratuite',
      'EasyPoints x2',
    ],
    popular: true,
  },
  {
    key: 'GOLD',
    name: 'EasyPass Gold',
    price: 39.9,
    period: 'mois',
    color: COLORS.gold,
    icon: '👑',
    features: [
      '25% réduction sur tout',
      'Courses illimitées incluses*',
      'Livraisons illimitées incluses*',
      'SOS prioritaire < 10 min',
      'Conciergerie dédiée',
      'EasyPoints x5',
      'Accès fonctionnalités beta',
    ],
    popular: false,
    note: '* Jusqu\'à 30 trajets/mois, 15 km max',
  },
];

function CheckItem({ text }) {
  return (
    <View style={styles.checkItem}>
      <Text style={styles.checkIcon}>✓</Text>
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

function PlanCard({ plan, isActive, onSelect }) {
  return (
    <View style={[styles.planCard, { borderColor: plan.color }, isActive && styles.planCardActive]}>
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
          <Text style={styles.popularText}>⭐ Populaire</Text>
        </View>
      )}
      {isActive && (
        <View style={[styles.activeBadge, { backgroundColor: COLORS.green }]}>
          <Text style={styles.activeBadgeText}>✅ Actif</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={styles.planIcon}>{plan.icon}</Text>
        <View style={styles.planTitleGroup}>
          <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
          <View style={styles.planPriceRow}>
            <Text style={styles.planPrice}>{plan.price.toFixed(1)}</Text>
            <Text style={styles.planCurrency}> TND / {plan.period}</Text>
          </View>
        </View>
      </View>

      <View style={styles.planFeatures}>
        {plan.features.map((f, i) => <CheckItem key={i} text={f} />)}
      </View>

      {plan.note && <Text style={styles.planNote}>{plan.note}</Text>}

      <TouchableOpacity
        style={[styles.planBtn, { backgroundColor: isActive ? COLORS.surface : plan.color }]}
        onPress={() => onSelect(plan)}
        disabled={isActive}
      >
        <Text style={[styles.planBtnText, isActive && { color: COLORS.muted }]}>
          {isActive ? 'Abonnement en cours' : 'Choisir ce plan'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function EasyPassScreen({ navigation }) {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/subscriptions/me');
      setSubscription(res.data?.subscription || null);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSelect = (plan) => {
    Alert.alert(
      `Souscrire à ${plan.name}`,
      `${plan.price.toFixed(1)} TND / mois. Le montant sera prélevé de votre wallet EASYWAY.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setBuying(true);
            try {
              const res = await api.post('/api/subscriptions/subscribe', { plan: plan.key });
              setSubscription(res.data?.subscription);
              Alert.alert('✅ Succès', `Bienvenue sur ${plan.name} !`);
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || 'Souscription échouée');
            } finally {
              setBuying(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler mon abonnement',
      'Votre abonnement restera actif jusqu\'à la fin de la période en cours.',
      [
        { text: 'Garder', style: 'cancel' },
        {
          text: 'Annuler quand même', style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/api/subscriptions/cancel');
              setSubscription(s => ({ ...s, cancelAtPeriodEnd: true }));
            } catch {
              Alert.alert('Erreur', 'Annulation échouée');
            }
          },
        },
      ],
    );
  };

  if (loading) return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );

  const activePlan = subscription?.plan;
  const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⭐ EasyPass</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Voyagez sans limites</Text>
          <Text style={styles.heroSub}>Abonnements sans engagement. Résiliez à tout moment.</Text>
        </View>

        {/* Active subscription banner */}
        {subscription && !subscription.cancelAtPeriodEnd && (
          <View style={styles.activeBanner}>
            <Text style={styles.activeBannerTitle}>✅ Abonnement actif</Text>
            <Text style={styles.activeBannerSub}>
              {PLANS.find(p => p.key === activePlan)?.name || activePlan}
              {expiresAt ? ` · Expire le ${expiresAt}` : ''}
            </Text>
            <TouchableOpacity style={styles.cancelSubBtn} onPress={handleCancel}>
              <Text style={styles.cancelSubText}>Annuler l'abonnement</Text>
            </TouchableOpacity>
          </View>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <View style={[styles.activeBanner, { borderColor: COLORS.muted }]}>
            <Text style={styles.activeBannerTitle}>⚠️ Résiliation planifiée</Text>
            <Text style={styles.activeBannerSub}>Votre abonnement prend fin le {expiresAt}</Text>
          </View>
        )}

        {/* Plan cards */}
        {buying && (
          <View style={styles.buyingOverlay}>
            <ActivityIndicator color={COLORS.accent} />
            <Text style={styles.buyingText}>Souscription en cours…</Text>
          </View>
        )}

        {PLANS.map(plan => (
          <PlanCard
            key={plan.key}
            plan={plan}
            isActive={activePlan === plan.key && !subscription?.cancelAtPeriodEnd}
            onSelect={handleSelect}
          />
        ))}

        {/* FAQ */}
        <View style={styles.faqBox}>
          <Text style={styles.faqTitle}>Questions fréquentes</Text>
          {[
            ['Comment fonctionne la facturation ?', 'Le montant est prélevé depuis votre wallet EASYWAY au début de chaque période.'],
            ['Puis-je changer de plan ?', 'Oui, le changement est immédiat. La différence est calculée au prorata.'],
            ['Y a-t-il un engagement ?', 'Non, vous pouvez résilier à tout moment. Aucun frais de résiliation.'],
          ].map(([q, a], i) => (
            <View key={i} style={styles.faqItem}>
              <Text style={styles.faqQ}>{q}</Text>
              <Text style={styles.faqA}>{a}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingBox: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  hero: { alignItems: 'center', paddingVertical: 24 },
  heroTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  heroSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },
  activeBanner: {
    backgroundColor: '#0D2A0D', borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.green,
  },
  activeBannerTitle: { color: COLORS.green, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  activeBannerSub: { color: COLORS.muted, fontSize: 13 },
  cancelSubBtn: { marginTop: 10, alignSelf: 'flex-start' },
  cancelSubText: { color: COLORS.muted, fontSize: 12, textDecorationLine: 'underline' },
  buyingOverlay: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: COLORS.surface, borderRadius: 10, marginBottom: 12 },
  buyingText: { color: COLORS.muted, fontSize: 13 },
  planCard: {
    backgroundColor: COLORS.surface, borderRadius: 18,
    borderWidth: 2, padding: 20, marginBottom: 16, position: 'relative',
  },
  planCardActive: { shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  popularBadge: {
    position: 'absolute', top: -12, left: 20,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  popularText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  activeBadge: {
    position: 'absolute', top: -12, right: 20,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  activeBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 8 },
  planIcon: { fontSize: 30 },
  planTitleGroup: { flex: 1 },
  planName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline' },
  planPrice: { color: COLORS.text, fontSize: 26, fontWeight: '900' },
  planCurrency: { color: COLORS.muted, fontSize: 13 },
  planFeatures: { marginBottom: 12 },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  checkIcon: { color: COLORS.green, fontWeight: '800', fontSize: 14 },
  checkText: { color: COLORS.text, fontSize: 13, flex: 1 },
  planNote: { color: COLORS.muted, fontSize: 11, marginBottom: 12, fontStyle: 'italic' },
  planBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  planBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  faqBox: { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginTop: 8 },
  faqTitle: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  faqItem: { marginBottom: 14 },
  faqQ: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  faqA: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
