import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../lib/api';

const AMOUNTS = [10, 20, 50, 100, 200];

export default function GiftCardsScreen() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [purchased, setPurchased] = useState<any>(null);
  const [checkCode, setCheckCode] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useFocusEffect(useCallback(() => {
    api.get('/gift-cards/my')
      .then(r => setCards(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const buy = async (amount: number) => {
    Alert.alert('Acheter une carte cadeau', `Confirmer l'achat de ${amount} TND ?`, [
      { text: 'Annuler' },
      { text: 'Confirmer', onPress: async () => {
        setPurchasing(amount);
        try {
          const res = await api.post('/gift-cards/purchase', { amount });
          const card = res.data.data;
          setPurchased(card);
          setCards(prev => [card, ...prev]);
          Alert.alert('🎉 Carte créée !', `Code : ${card.code}`);
        } catch (e: any) {
          Alert.alert('Erreur', e.response?.data?.message || 'Erreur');
        } finally {
          setPurchasing(null);
        }
      }},
    ]);
  };

  const check = async () => {
    if (!checkCode.trim()) return;
    setChecking(true);
    try {
      const res = await api.post('/gift-cards/validate', { code: checkCode.trim().toUpperCase() });
      setCheckResult({ ok: true, balance: res.data.data.balance });
    } catch (e: any) {
      setCheckResult({ ok: false, msg: e.response?.data?.message || 'Code invalide' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.title}>🎁 Cartes cadeaux</Text>

      {/* Buy amounts */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Acheter une carte cadeau</Text>
        <View style={s.amountGrid}>
          {AMOUNTS.map(amount => (
            <TouchableOpacity key={amount} style={s.amountBtn} onPress={() => buy(amount)} disabled={!!purchasing}>
              <Text style={s.amountBtnText}>{purchasing === amount ? '...' : `${amount} TND`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Check code */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Vérifier un code</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={checkCode}
            onChangeText={v => { setCheckCode(v.toUpperCase()); setCheckResult(null); }}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            style={[s.input, { flex: 1 }]}
            placeholderTextColor="#94a3b8"
            autoCapitalize="characters"
          />
          <TouchableOpacity style={s.checkBtn} onPress={check} disabled={checking}>
            <Text style={s.checkBtnText}>{checking ? '...' : 'OK'}</Text>
          </TouchableOpacity>
        </View>
        {checkResult && (
          checkResult.ok ? (
            <View style={s.checkSuccess}>
              <Text style={s.checkSuccessText}>✓ Solde : {Number(checkResult.balance).toFixed(2)} TND</Text>
            </View>
          ) : (
            <Text style={s.checkError}>{checkResult.msg}</Text>
          )
        )}
      </View>

      {/* My cards */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Mes cartes</Text>
        {loading ? (
          <ActivityIndicator color="#9f1239" />
        ) : cards.length === 0 ? (
          <Text style={s.empty}>Aucune carte achetée</Text>
        ) : (
          cards.map(c => (
            <View key={c.id} style={s.cardItem}>
              <Text style={s.cardCode}>{c.code}</Text>
              <View style={s.cardMeta}>
                <Text style={s.cardAmount}>{c.amount} TND</Text>
                <Text style={[s.cardBalance, { color: c.isActive ? '#22c55e' : '#94a3b8' }]}>
                  Solde : {Number(c.balance).toFixed(2)} TND
                </Text>
                <View style={[s.cardStatus, { backgroundColor: c.isActive ? '#f0fdf4' : '#f8fafc' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: c.isActive ? '#16a34a' : '#94a3b8' }}>
                    {c.isActive ? 'Actif' : 'Épuisé'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amountBtn: { borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, minWidth: '30%', alignItems: 'center' },
  amountBtnText: { fontWeight: '900', color: '#0f172a', fontSize: 15 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0f172a', fontFamily: 'monospace' },
  checkBtn: { backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  checkBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  checkSuccess: { backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10, marginTop: 8 },
  checkSuccessText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  checkError: { color: '#dc2626', fontSize: 12, marginTop: 8, fontWeight: '600' },
  empty: { color: '#94a3b8', textAlign: 'center', paddingVertical: 16 },
  cardItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  cardCode: { fontFamily: 'monospace', fontSize: 14, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardAmount: { fontSize: 12, color: '#64748b' },
  cardBalance: { fontSize: 12, fontWeight: '700' },
  cardStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
});
