import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_PROMO = {
  code: 'EASY2026',
  discount: 15,
  type: 'percentage',
  expiresAt: '30/06/2026',
  maxUses: 500,
  usedCount: 187,
  minOrder: 10,
};

const MOCK_PROMOS = [
  { code: 'BIENVENUE10', discount: 10, type: 'percentage', status: 'active', uses: 320, expires: '01/09/2026' },
  { code: 'SOSOFF20', discount: 20, type: 'percentage', status: 'active', uses: 88, expires: '31/07/2026' },
  { code: 'DELIVERY5', discount: 5, type: 'fixed', status: 'expired', uses: 500, expires: '01/01/2026' },
  { code: 'EASYPASS50', discount: 50, type: 'percentage', status: 'active', uses: 44, expires: '31/12/2026' },
];

export default function PromoCodesClientScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const applyCode = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError('Entrez un code promo'); shake(); return; }
    if (trimmed === MOCK_PROMO.code) {
      setApplied(MOCK_PROMO);
      setError('');
    } else {
      setError('Code invalide ou expiré');
      setApplied(null);
      shake();
    }
  };

  const removeCode = () => { setApplied(null); setCode(''); setError(''); };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Codes promo</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Apply Code */}
        <View style={styles.applyCard}>
          <Text style={styles.applyTitle}>🎟️ Saisir un code promo</Text>
          <Animated.View style={[styles.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
            <TextInput
              style={[styles.input, error && { borderColor: COLORS.red }]}
              placeholder="Ex : EASY2026"
              placeholderTextColor={COLORS.muted}
              value={code}
              onChangeText={t => { setCode(t); setError(''); }}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={applyCode}>
              <Text style={styles.applyBtnText}>Appliquer</Text>
            </TouchableOpacity>
          </Animated.View>
          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}
          {applied && (
            <View style={styles.successBanner}>
              <View>
                <Text style={styles.successTitle}>
                  ✅ -{applied.discount}{applied.type === 'percentage' ? '%' : ' TND'} appliqué
                </Text>
                <Text style={styles.successSub}>
                  Code : {applied.code} · Expire le {applied.expiresAt}
                </Text>
                <Text style={styles.successSub}>
                  Commande min. {applied.minOrder} TND · {applied.maxUses - applied.usedCount} utilisations restantes
                </Text>
              </View>
              <TouchableOpacity onPress={removeCode}>
                <Text style={{ color: COLORS.red, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Active promos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 Promotions disponibles</Text>
          {MOCK_PROMOS.map((p) => {
            const isActive = p.status === 'active';
            return (
              <TouchableOpacity
                key={p.code}
                style={[styles.promoCard, !isActive && styles.promoCardExpired]}
                onPress={() => { if (isActive) { setCode(p.code); setError(''); } }}
                activeOpacity={isActive ? 0.8 : 1}
              >
                <View style={styles.promoLeft}>
                  <View style={[styles.discountBadge, !isActive && { backgroundColor: COLORS.surfaceAlt }]}>
                    <Text style={[styles.discountText, !isActive && { color: COLORS.muted }]}>
                      -{p.discount}{p.type === 'percentage' ? '%' : ' TND'}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.promoTop}>
                    <Text style={[styles.promoCode, !isActive && { color: COLORS.muted }]}>{p.code}</Text>
                    <View style={[styles.statusChip, { backgroundColor: isActive ? COLORS.green + '22' : COLORS.border }]}>
                      <Text style={{ color: isActive ? COLORS.green : COLORS.muted, fontSize: 10, fontWeight: '700' }}>
                        {isActive ? 'Actif' : 'Expiré'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.promoExpire}>Expire : {p.expires}</Text>
                  <View style={styles.usesRow}>
                    <View style={styles.usesBarWrap}>
                      <View style={[styles.usesBar, { width: `${Math.min((p.uses / 500) * 100, 100)}%`, backgroundColor: isActive ? COLORS.accent : COLORS.muted }]} />
                    </View>
                    <Text style={styles.usesText}>{p.uses} utilisations</Text>
                  </View>
                </View>
                {isActive && (
                  <Text style={{ color: COLORS.accent, fontSize: 16 }}>›</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Conditions d'utilisation</Text>
          <Text style={styles.infoText}>· Un seul code par commande</Text>
          <Text style={styles.infoText}>· Non cumulable avec d'autres offres</Text>
          <Text style={styles.infoText}>· Valable sur les services éligibles uniquement</Text>
          <Text style={styles.infoText}>· EASYWAY se réserve le droit d'annuler tout code en cas d'abus</Text>
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  applyCard: {
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  applyTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.white, fontSize: 14, fontWeight: '700', letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  errorText: { color: COLORS.red, fontSize: 12, marginTop: 8 },
  successBanner: {
    marginTop: 12, backgroundColor: '#0D2E0D', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: COLORS.green, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  successTitle: { color: COLORS.green, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  successSub: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  promoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  promoCardExpired: { opacity: 0.55 },
  promoLeft: { alignItems: 'center', justifyContent: 'center' },
  discountBadge: {
    backgroundColor: COLORS.accent + '22', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.accent + '44',
  },
  discountText: { color: COLORS.accent, fontSize: 16, fontWeight: '900' },
  promoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  promoCode: { color: COLORS.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  promoExpire: { color: COLORS.muted, fontSize: 11, marginBottom: 6 },
  usesRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  usesBarWrap: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  usesBar: { height: '100%', borderRadius: 2 },
  usesText: { color: COLORS.muted, fontSize: 10, width: 80, textAlign: 'right' },
  infoBox: {
    marginHorizontal: 16, marginBottom: 20, backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  infoTitle: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  infoText: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
});
