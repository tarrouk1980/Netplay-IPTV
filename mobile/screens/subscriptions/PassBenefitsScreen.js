import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
  gold: '#FFD700', purple: '#8E44AD',
};

const PLANS = [
  {
    key: 'monthly',
    label: 'Mensuel',
    price: 29.900,
    priceLabel: '/ mois',
    badge: null,
    color: COLORS.accent,
  },
  {
    key: 'quarterly',
    label: 'Trimestriel',
    price: 79.900,
    priceLabel: '/ 3 mois',
    badge: '−11%',
    color: COLORS.purple,
  },
  {
    key: 'yearly',
    label: 'Annuel',
    price: 269.900,
    priceLabel: '/ an',
    badge: '−25%',
    color: COLORS.gold,
  },
];

const BENEFITS = [
  { emoji: '🚕', title: 'Tarifs réduits sur les taxis', desc: '15% de réduction sur toutes vos courses EasyTaxy' },
  { emoji: '📦', title: 'Livraisons prioritaires', desc: 'Votre commande passe en tête de file automatiquement' },
  { emoji: '🛒', title: 'Livraison courses gratuite', desc: 'Frais de livraison offerts pour toute commande > 20 TND' },
  { emoji: '🎁', title: 'Offres flash en avant-première', desc: 'Accès 2h avant tout le monde aux offres flash' },
  { emoji: '⭐', title: 'Points EasyPoints × 2', desc: 'Doublez vos points à chaque service utilisé' },
  { emoji: '📞', title: 'Support prioritaire 24/7', desc: 'Ligne dédiée, temps de réponse < 5 minutes' },
  { emoji: '🔄', title: 'Annulation gratuite', desc: 'Annulez sans frais jusqu\'à 5 min avant la course' },
  { emoji: '🏆', title: 'Badge Pass Premium', desc: 'Profil mis en avant pour les prestataires' },
];

const FAQS = [
  { q: 'Puis-je annuler mon abonnement ?', a: 'Oui, à tout moment depuis vos paramètres. L\'abonnement reste actif jusqu\'à la fin de la période payée.' },
  { q: 'Les avantages s\'appliquent à tous les services ?', a: 'Oui, les réductions s\'appliquent automatiquement sur Taxi, Livraison, SOS et Épicerie.' },
  { q: 'Puis-je partager mon Pass avec ma famille ?', a: 'L\'abonnement est lié à un compte. Un Pass Famille (multi-compte) est en cours de développement.' },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity style={styles.faqItem} onPress={() => setOpen(!open)} activeOpacity={0.8}>
      <View style={styles.faqRow}>
        <Text style={styles.faqQ}>{item.q}</Text>
        <Text style={{ color: COLORS.accent, fontSize: 18 }}>{open ? '∧' : '∨'}</Text>
      </View>
      {open && <Text style={styles.faqA}>{item.a}</Text>}
    </TouchableOpacity>
  );
}

export default function PassBenefitsScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const plan = PLANS.find((p) => p.key === selectedPlan);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⭐ EasyPass Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🌟</Text>
          <Text style={styles.heroTitle}>Passez Premium</Text>
          <Text style={styles.heroSub}>Profitez de tous les services EASYWAY au meilleur prix</Text>
        </View>

        {/* Plans */}
        <Text style={styles.sectionLabel}>Choisissez votre formule</Text>
        <View style={styles.plansRow}>
          {PLANS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.planCard, selectedPlan === p.key && { borderColor: p.color, backgroundColor: p.color + '11' }]}
              onPress={() => setSelectedPlan(p.key)}
            >
              {p.badge && (
                <View style={[styles.planBadge, { backgroundColor: p.color }]}>
                  <Text style={styles.planBadgeText}>{p.badge}</Text>
                </View>
              )}
              <Text style={styles.planLabel}>{p.label}</Text>
              <Text style={[styles.planPrice, { color: p.color }]}>{p.price.toFixed(3)}</Text>
              <Text style={styles.planPriceLabel}>TND {p.priceLabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits */}
        <Text style={styles.sectionLabel}>Avantages inclus</Text>
        {BENEFITS.map((b) => (
          <View key={b.title} style={styles.benefitRow}>
            <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.benefitTitle}>{b.title}</Text>
              <Text style={styles.benefitDesc}>{b.desc}</Text>
            </View>
            <Text style={{ color: COLORS.green, fontSize: 18 }}>✓</Text>
          </View>
        ))}

        {/* FAQ */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Questions fréquentes</Text>
        {FAQS.map((f, i) => <FAQItem key={i} item={f} />)}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: plan?.color || COLORS.accent }]}
          onPress={() => navigation.navigate('BuyPass', { plan: selectedPlan })}
        >
          <Text style={styles.ctaBtnText}>
            Souscrire — {plan?.price.toFixed(3)} TND {plan?.priceLabel}
          </Text>
        </TouchableOpacity>

        <Text style={styles.ctaNote}>Sans engagement · Annulable à tout moment</Text>
        <View style={{ height: 24 }} />
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  heroCard: {
    backgroundColor: '#1A1200', borderRadius: 20, padding: 28,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.accent, marginBottom: 20,
  },
  heroEmoji: { fontSize: 56, marginBottom: 10 },
  heroTitle: { color: COLORS.accent, fontSize: 26, fontWeight: '900', marginBottom: 6 },
  heroSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  plansRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  planCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: 14, alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute', top: 0, right: 0,
    borderBottomLeftRadius: 8, paddingHorizontal: 6, paddingVertical: 3,
  },
  planBadgeText: { color: '#000', fontSize: 10, fontWeight: '900' },
  planLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  planPrice: { fontSize: 22, fontWeight: '900' },
  planPriceLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  benefitRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8,
  },
  benefitTitle: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  benefitDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2, lineHeight: 17 },
  faqItem: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8,
  },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: '600', marginRight: 8 },
  faqA: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 10 },
  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  ctaBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  ctaNote: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 10 },
});
