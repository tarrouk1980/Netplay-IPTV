import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  surfaceAlt: '#16161F',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  orange: '#F57C00',
  green: '#27AE60',
  accent: '#D32F2F',
  gold: '#FFD700',
};

const MOCK_PROMOS = [
  { id: 'p1', code: 'BIENVENUE20', description: '20% de réduction sur votre première course', discount: '20%', minOrder: 10, expiresAt: '2026-12-31', isNew: true },
  { id: 'p2', code: 'WEEKEND10', description: '10% de réduction le week-end', discount: '10%', minOrder: 15, expiresAt: '2026-09-30', isNew: false },
  { id: 'p3', code: 'FIDELITE5', description: '5 TND offerts sur votre prochaine course', discount: '5 TND', minOrder: 20, expiresAt: '2026-06-30', isNew: false },
];

export default function TaxiPromoScreen({ navigation }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/taxi/promos');
      setPromos(res.data.promos || MOCK_PROMOS);
    } catch {
      setPromos(MOCK_PROMOS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const applyCode = async () => {
    if (!code.trim()) return;
    setApplying(true);
    try {
      const res = await api.post('/api/promo/validate', { code: code.trim().toUpperCase(), serviceType: 'TAXI' });
      setApplied(res.data.promo);
      Alert.alert('✅ Code appliqué !', `Réduction de ${res.data.promo?.discount || code} appliquée à votre prochaine course.`);
    } catch (e) {
      Alert.alert('Code invalide', e?.response?.data?.error || 'Ce code promo n\'est pas valide ou a expiré.');
    } finally {
      setApplying(false);
    }
  };

  const copyCode = (c) => {
    Clipboard.setString(c);
    setCode(c);
    Alert.alert('Copié !', `Code "${c}" copié et prêt à utiliser.`);
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.orange} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🎫 Codes promo taxi</Text>
      </View>

      {/* Code input */}
      <View style={s.inputCard}>
        <Text style={s.inputLabel}>Entrer un code promo</Text>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder="EX: BIENVENUE20"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="characters"
            maxLength={20}
          />
          <TouchableOpacity
            style={[s.applyBtn, (!code.trim() || applying) && { opacity: 0.5 }]}
            onPress={applyCode}
            disabled={!code.trim() || applying}
          >
            {applying
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={s.applyBtnTxt}>Appliquer</Text>
            }
          </TouchableOpacity>
        </View>
        {applied && (
          <View style={s.appliedBadge}>
            <Text style={s.appliedTxt}>✅ Code "{applied.code}" appliqué — {applied.discount} de réduction</Text>
          </View>
        )}
      </View>

      <Text style={s.sectionTitle}>Offres disponibles</Text>

      <FlatList
        data={promos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={s.promoCard}>
            {item.isNew && (
              <View style={s.newBadge}><Text style={s.newBadgeTxt}>NOUVEAU</Text></View>
            )}
            <View style={s.promoTop}>
              <View style={s.discountBubble}>
                <Text style={s.discountTxt}>{item.discount}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.promoDesc}>{item.description}</Text>
                <Text style={s.promoMin}>Commande min. {item.minOrder} TND</Text>
                <Text style={s.promoExpiry}>Expire le {new Date(item.expiresAt).toLocaleDateString('fr-TN')}</Text>
              </View>
            </View>
            <View style={s.promoBottom}>
              <View style={s.codePill}>
                <Text style={s.codePillTxt}>{item.code}</Text>
              </View>
              <TouchableOpacity style={s.copyBtn} onPress={() => copyCode(item.code)}>
                <Text style={s.copyBtnTxt}>📋 Copier & utiliser</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🎫</Text>
            <Text style={s.emptyTitle}>Aucune offre disponible</Text>
            <Text style={s.emptySub}>Revenez bientôt pour de nouvelles promotions.</Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  inputCard: { backgroundColor: COLORS.surface, margin: 16, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  inputLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, padding: 12, color: COLORS.text, fontSize: 14, fontWeight: '700', borderWidth: 1, borderColor: COLORS.border, letterSpacing: 1 },
  applyBtn: { backgroundColor: COLORS.orange, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  applyBtnTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  appliedBadge: { backgroundColor: COLORS.green + '22', borderRadius: 8, padding: 10, marginTop: 10, borderWidth: 1, borderColor: COLORS.green },
  appliedTxt: { color: COLORS.green, fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginHorizontal: 16, marginBottom: 10 },
  promoCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  newBadge: { backgroundColor: COLORS.gold, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 8 },
  newBadgeTxt: { color: COLORS.bg, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  promoTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  discountBubble: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.orange + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.orange },
  discountTxt: { color: COLORS.orange, fontSize: 14, fontWeight: '800' },
  promoDesc: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 3 },
  promoMin: { color: COLORS.muted, fontSize: 11 },
  promoExpiry: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  promoBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  codePill: { backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.orange },
  codePillTxt: { color: COLORS.orange, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  copyBtn: { backgroundColor: COLORS.orange + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.orange },
  copyBtnTxt: { color: COLORS.orange, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
