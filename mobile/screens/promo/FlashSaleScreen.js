import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
  purple: '#8E44AD', blue: '#1565C0',
};

const NOW = Date.now();

const MOCK_DEALS = [
  {
    id: '1', emoji: '🚕', title: '-30% sur EasyTaxy', service: 'EASYTAXY',
    code: 'FLASH30', discount: 30, type: 'percent',
    endsAt: NOW + 2 * 3600 * 1000, totalSlots: 100, usedSlots: 67,
    color: COLORS.accent, minOrder: 0,
  },
  {
    id: '2', emoji: '🛒', title: 'Livraison gratuite courses', service: 'GROCERY',
    code: 'FREEDELIV', discount: 100, type: 'delivery',
    endsAt: NOW + 5 * 3600 * 1000, totalSlots: 50, usedSlots: 12,
    color: COLORS.purple, minOrder: 30,
  },
  {
    id: '3', emoji: '🛻', title: 'SOS -20% dépannage', service: 'SOS',
    code: 'SOS20', discount: 20, type: 'percent',
    endsAt: NOW + 1 * 3600 * 1000 + 24 * 60 * 1000, totalSlots: 30, usedSlots: 28,
    color: COLORS.red, minOrder: 0,
  },
  {
    id: '4', emoji: '📦', title: '5 TND offerts livraison', service: 'DELIVERY',
    code: 'LIVR5', discount: 5, type: 'fixed',
    endsAt: NOW + 8 * 3600 * 1000, totalSlots: 200, usedSlots: 43,
    color: COLORS.green, minOrder: 15,
  },
  {
    id: '5', emoji: '⭐', title: 'Pass Premium -50%', service: 'PASS',
    code: 'PASS50', discount: 50, type: 'percent',
    endsAt: NOW + 24 * 3600 * 1000, totalSlots: 20, usedSlots: 8,
    color: COLORS.blue, minOrder: 0,
  },
];

function Countdown({ endsAt }) {
  const [remaining, setRemaining] = useState(Math.max(0, endsAt - Date.now()));

  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.max(0, endsAt - Date.now());
      setRemaining(r);
      if (r === 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  if (remaining === 0) return <Text style={styles.expired}>Expiré</Text>;

  return (
    <View style={styles.countdownRow}>
      {[[h, 'h'], [m, 'm'], [s, 's']].map(([val, unit], i) => (
        <View key={i} style={styles.countdownBlock}>
          <Text style={styles.countdownNum}>{String(val).padStart(2, '0')}</Text>
          <Text style={styles.countdownUnit}>{unit}</Text>
        </View>
      ))}
    </View>
  );
}

function DealCard({ deal, onClaim }) {
  const slotsLeft = deal.totalSlots - deal.usedSlots;
  const pct = deal.usedSlots / deal.totalSlots;
  const urgent = slotsLeft <= 5;

  return (
    <View style={[styles.dealCard, { borderColor: deal.color }]}>
      <View style={[styles.dealHeader, { backgroundColor: deal.color + '22' }]}>
        <Text style={{ fontSize: 32 }}>{deal.emoji}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.dealTitle, { color: deal.color }]}>{deal.title}</Text>
          <Text style={styles.dealService}>{deal.service}</Text>
        </View>
        <View style={[styles.discountBadge, { backgroundColor: deal.color }]}>
          <Text style={styles.discountText}>
            {deal.type === 'percent' ? `-${deal.discount}%`
              : deal.type === 'fixed' ? `-${deal.discount} TND`
              : '🚚 Gratuit'}
          </Text>
        </View>
      </View>

      <View style={styles.dealBody}>
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>⏰ Expire dans</Text>
          <Countdown endsAt={deal.endsAt} />
        </View>

        <View style={styles.slotsRow}>
          <Text style={[styles.slotsText, urgent && { color: COLORS.red }]}>
            {urgent ? `🔥 Plus que ${slotsLeft} place${slotsLeft > 1 ? 's' : ''} !` : `${slotsLeft} places restantes`}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: pct > 0.8 ? COLORS.red : deal.color }]} />
        </View>

        {deal.minOrder > 0 && (
          <Text style={styles.minOrder}>Min. commande : {deal.minOrder} TND</Text>
        )}

        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>Code :</Text>
          <Text style={[styles.codeValue, { color: deal.color }]}>{deal.code}</Text>
        </View>

        <TouchableOpacity
          style={[styles.claimBtn, { backgroundColor: deal.color }, slotsLeft === 0 && styles.claimBtnDisabled]}
          onPress={() => onClaim(deal)}
          disabled={slotsLeft === 0}
        >
          <Text style={styles.claimBtnText}>
            {slotsLeft === 0 ? 'Épuisé' : 'Utiliser cette offre →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FlashSaleScreen({ navigation }) {
  const { user } = useAuthStore();
  const [deals, setDeals] = useState(MOCK_DEALS);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/promo/flash');
        if (res.data?.deals?.length) setDeals(res.data.deals);
      } catch {}
    })();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleClaim = (deal) => {
    const screens = {
      EASYTAXY: 'TaxiHome', SOS: 'SOSHome', DELIVERY: 'DeliveryHome',
      GROCERY: 'GroceryHome', PASS: 'BuyPass',
    };
    Alert.alert(
      `🎉 Code copié : ${deal.code}`,
      `Le code ${deal.code} sera automatiquement appliqué à votre prochaine commande ${deal.service}.`,
      [
        { text: 'OK' },
        { text: `Aller vers ${deal.service}`, onPress: () => navigation.navigate(screens[deal.service] || 'Home') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={styles.headerTitle}>⚡ Offres Flash</Text>
        </Animated.View>
        <Text style={styles.headerCount}>{deals.length} actives</Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>🔥 Offres à durée limitée — Profitez-en avant qu'elles expirent !</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onClaim={handleClaim} />
        ))}
        <View style={styles.footer}>
          <Text style={styles.footerText}>💡 De nouvelles offres flash sont publiées chaque jour à 9h, 13h et 18h.</Text>
        </View>
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
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  headerCount: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  banner: {
    backgroundColor: '#1A1200', margin: 12, borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: COLORS.accent,
  },
  bannerText: { color: COLORS.accent, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  list: { padding: 12, gap: 14, paddingBottom: 30 },
  dealCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1.5, overflow: 'hidden',
  },
  dealHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  dealTitle: { fontSize: 15, fontWeight: '800' },
  dealService: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  discountBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  discountText: { color: COLORS.white, fontSize: 13, fontWeight: '900' },
  dealBody: { padding: 14 },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  timerLabel: { color: COLORS.muted, fontSize: 12 },
  countdownRow: { flexDirection: 'row', gap: 6 },
  countdownBlock: { alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  countdownNum: { color: COLORS.white, fontSize: 16, fontWeight: '900' },
  countdownUnit: { color: COLORS.muted, fontSize: 9 },
  expired: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
  slotsRow: { marginBottom: 6 },
  slotsText: { color: COLORS.muted, fontSize: 12 },
  progressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: 4, borderRadius: 2 },
  minOrder: { color: COLORS.muted, fontSize: 11, marginBottom: 8 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  codeLabel: { color: COLORS.muted, fontSize: 13 },
  codeValue: { fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  claimBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  claimBtnDisabled: { opacity: 0.4 },
  claimBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
