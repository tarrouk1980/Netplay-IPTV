import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F', purple: '#8E44AD',
};

const ACTIVE_PROMOS = [
  { id: 'P1', code: 'FLASH30', desc: '-30% sur EasyTaxy', discount: 30, type: 'percent', expiresAt: 'Ce soir 23h59', usesLeft: 1 },
  { id: 'P2', code: 'BIENVENUE', desc: 'Bienvenue − 5 TND', discount: 5, type: 'fixed', expiresAt: '31/01/2025', usesLeft: 1 },
];

const SUGGESTIONS = [
  { code: 'EASY10', desc: '-10% code ami', emoji: '🎁' },
  { code: 'WEEKEND', desc: '-15% week-end', emoji: '🎉' },
  { code: 'PASS50', desc: 'Pass Premium -50%', emoji: '⭐' },
];

export default function TaxiPromoScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedPromos, setAppliedPromos] = useState(ACTIVE_PROMOS);

  const handleApply = async (code) => {
    const trimmed = (code || input).trim().toUpperCase();
    if (!trimmed || trimmed.length < 3) { Alert.alert('Erreur', 'Code invalide'); return; }
    if (appliedPromos.find(p => p.code === trimmed)) {
      Alert.alert('Info', 'Ce code est déjà appliqué !'); return;
    }
    setApplying(true);
    try {
      const res = await api.post('/api/promo/apply', { code: trimmed, service: 'TAXI' });
      const promo = res.data?.promo || {
        id: `P${Date.now()}`, code: trimmed,
        desc: `Code ${trimmed} appliqué`, discount: 10, type: 'percent',
        expiresAt: 'Bientôt', usesLeft: 1,
      };
      setAppliedPromos(prev => [promo, ...prev]);
      setInput('');
      Alert.alert('✅ Code appliqué !', promo.desc);
    } catch {
      Alert.alert('Erreur', 'Code invalide ou expiré.');
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = (id) => {
    setAppliedPromos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎟️ Codes Promo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Entrez un code promo"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="characters"
            maxLength={16}
          />
          <TouchableOpacity
            style={[styles.applyBtn, (!input.trim() || applying) && { opacity: 0.5 }]}
            onPress={() => handleApply()}
            disabled={!input.trim() || applying}
          >
            {applying ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.applyBtnText}>Valider</Text>}
          </TouchableOpacity>
        </View>

        {/* Active promos */}
        {appliedPromos.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Codes actifs</Text>
            {appliedPromos.map(p => (
              <View key={p.id} style={styles.promoCard}>
                <View style={styles.promoLeft}>
                  <Text style={styles.promoCode}>{p.code}</Text>
                  <Text style={styles.promoDesc}>{p.desc}</Text>
                  <Text style={styles.promoExpiry}>Expire : {p.expiresAt} · {p.usesLeft} utilisation(s)</Text>
                </View>
                <View style={styles.promoRight}>
                  <Text style={styles.promoDiscount}>
                    {p.type === 'percent' ? `-${p.discount}%` : `-${p.discount} TND`}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemove(p.id)}>
                    <Text style={{ color: COLORS.red, fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Suggestions */}
        <Text style={styles.sectionLabel}>Codes populaires</Text>
        {SUGGESTIONS.map(s => (
          <TouchableOpacity key={s.code} style={styles.suggRow} onPress={() => handleApply(s.code)}>
            <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.suggCode}>{s.code}</Text>
              <Text style={styles.suggDesc}>{s.desc}</Text>
            </View>
            <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '700' }}>Appliquer</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>💡 Les codes promo sont appliqués automatiquement lors de votre prochaine course EasyTaxy.</Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  applyBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, justifyContent: 'center' },
  applyBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  sectionLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  promoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1A0A', borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.green, padding: 14, marginBottom: 10 },
  promoLeft: { flex: 1 },
  promoCode: { color: COLORS.green, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  promoDesc: { color: COLORS.white, fontSize: 13, marginTop: 3 },
  promoExpiry: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  promoRight: { alignItems: 'center', gap: 8 },
  promoDiscount: { color: COLORS.green, fontSize: 20, fontWeight: '900' },
  suggRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8 },
  suggCode: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  suggDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  infoBox: { backgroundColor: '#1A1200', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.accent + '44', marginTop: 8 },
  infoText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
