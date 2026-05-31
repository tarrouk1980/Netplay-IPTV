import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, StatusBar, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  green: '#27AE60',
  accent: '#F5A623',
  error: '#E74C3C',
  purple: '#9B59B6',
};

const SUGGESTED_CODES = [
  { code: 'BIENVENUE', desc: '20% sur la première commande', icon: '🎉' },
  { code: 'TAXI10', desc: '10% sur les courses taxi', icon: '🚕' },
  { code: 'SOS15', desc: '15% sur interventions SOS', icon: '🚨' },
  { code: 'LIVRAISON5', desc: '-5% livraisons', icon: '🛵' },
];

export default function PromoCodeScreen({ navigation, route }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    api.get('/api/promo/my-codes')
      .then(r => setHistory(r.data?.codes || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleApply = async (codeToApply) => {
    const c = (codeToApply || code).trim().toUpperCase();
    if (!c) {
      Alert.alert('Code requis', 'Veuillez saisir un code promo.');
      return;
    }
    setLoading(true);
    setApplied(null);
    try {
      const res = await api.post('/api/promo/apply', { code: c });
      const d = res.data;
      setApplied({ ...d, code: c });
      if (d.walletCredit) {
        setHistory(prev => [{ code: c, appliedAt: new Date().toISOString(), reward: d.label || d.type }, ...prev]);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Code invalide ou expiré.';
      Alert.alert('Code non valide', msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (text?.trim()) setCode(text.trim().toUpperCase());
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Code promo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Input zone */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>ENTREZ VOTRE CODE</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="Ex: BIENVENUE"
              placeholderTextColor={COLORS.muted}
              value={code}
              onChangeText={v => { setCode(v.toUpperCase()); setApplied(null); }}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteFromClipboard}>
              <Text style={styles.pasteBtnText}>Coller</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.applyBtn, (!code.trim() || loading) && { opacity: 0.5 }]}
            onPress={() => handleApply()}
            disabled={!code.trim() || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.applyBtnText}>Appliquer le code</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result banner */}
        {applied && (
          <View style={styles.successBanner}>
            <Text style={styles.successIcon}>🎊</Text>
            <View style={styles.successInfo}>
              <Text style={styles.successTitle}>{applied.label || 'Code appliqué !'}</Text>
              {applied.discountPercent && (
                <Text style={styles.successDetail}>-{applied.discountPercent}% sur votre prochaine commande</Text>
              )}
              {applied.walletCredit && (
                <Text style={styles.successDetail}>+{Number(applied.walletCredit).toFixed(2)} TND crédité sur votre wallet</Text>
              )}
              {applied.freePass && (
                <Text style={styles.successDetail}>1 pass journalier offert</Text>
              )}
            </View>
          </View>
        )}

        {/* Suggested codes */}
        <Text style={styles.sectionLabel}>CODES DISPONIBLES</Text>
        {SUGGESTED_CODES.map(s => (
          <TouchableOpacity
            key={s.code}
            style={styles.suggCard}
            onPress={() => { setCode(s.code); handleApply(s.code); }}
            activeOpacity={0.8}
          >
            <Text style={styles.suggIcon}>{s.icon}</Text>
            <View style={styles.suggInfo}>
              <Text style={styles.suggCode}>{s.code}</Text>
              <Text style={styles.suggDesc}>{s.desc}</Text>
            </View>
            <Text style={styles.suggArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* History */}
        {!loadingHistory && history.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>MES CODES UTILISÉS</Text>
            {history.map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <View style={styles.historyDot} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyCode}>{h.code}</Text>
                  <Text style={styles.historyReward}>{h.reward || 'Réduction appliquée'}</Text>
                </View>
                <Text style={styles.historyDate}>
                  {h.appliedAt ? new Date(h.appliedAt).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short' }) : ''}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  inputCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  inputLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  codeInput: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    color: COLORS.text, fontSize: 18, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 13,
    letterSpacing: 2,
  },
  pasteBtn: {
    backgroundColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center',
  },
  pasteBtnText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  applyBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 15, alignItems: 'center',
  },
  applyBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0D2A1A', borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1.5, borderColor: COLORS.green,
  },
  successIcon: { fontSize: 36 },
  successInfo: { flex: 1 },
  successTitle: { color: COLORS.green, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  successDetail: { color: '#A0DFC0', fontSize: 13 },
  sectionLabel: {
    color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
  },
  suggCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  suggIcon: { fontSize: 28 },
  suggInfo: { flex: 1 },
  suggCode: { color: COLORS.text, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  suggDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  suggArrow: { color: COLORS.muted, fontSize: 22 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green },
  historyInfo: { flex: 1 },
  historyCode: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  historyReward: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  historyDate: { color: COLORS.muted, fontSize: 12 },
});
