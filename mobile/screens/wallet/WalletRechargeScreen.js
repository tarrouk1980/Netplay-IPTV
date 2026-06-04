import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const AMOUNTS = [10, 20, 50, 100, 200, 500];

const METHODS = [
  { key: 'CARD', label: 'Carte bancaire', icon: '💳', desc: 'Visa / Mastercard' },
  { key: 'VIREMENT', label: 'Virement bancaire', icon: '🏦', desc: 'Banques tunisiennes' },
  { key: 'CASH', label: 'Paiement cash', icon: '💵', desc: 'Chez un partenaire' },
  { key: 'D17', label: 'D17 / eDinar', icon: '📱', desc: 'Paiement mobile' },
];

export default function WalletRechargeScreen({ navigation }) {
  const [amount, setAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);

  const finalAmount = (amount ?? parseFloat(customAmount)) || 0;

  const handleRecharge = async () => {
    if (finalAmount < 5) { Alert.alert('Montant minimum', 'Le montant minimum est de 5 TND.'); return; }
    if (finalAmount > 1000) { Alert.alert('Montant maximum', 'Le montant maximum par recharge est de 1000 TND.'); return; }

    setLoading(true);
    try {
      const res = await api.post('/api/wallet/recharge', { amount: finalAmount, method });
      if (res.data?.paymentUrl) {
        Alert.alert('Redirection', 'Vous allez être redirigé vers la page de paiement.');
      } else {
        Alert.alert('✅ Demande envoyée', `Votre recharge de ${finalAmount} TND a été initiée.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de traiter la recharge.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recharger le wallet</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <Text style={styles.section}>💰 Choisir un montant</Text>
        <View style={styles.amountsGrid}>
          {AMOUNTS.map(a => (
            <TouchableOpacity
              key={a}
              style={[styles.amountChip, amount === a && styles.amountChipActive]}
              onPress={() => { setAmount(a); setCustomAmount(''); }}
            >
              <Text style={[styles.amountText, amount === a && { color: '#000' }]}>{a} TND</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.orText}>— ou entrez un montant —</Text>
        <View style={styles.customAmountWrap}>
          <TextInput
            style={styles.customAmountInput}
            value={customAmount}
            onChangeText={v => { setCustomAmount(v); setAmount(null); }}
            placeholder="Montant personnalisé"
            placeholderTextColor={COLORS.muted}
            keyboardType="decimal-pad"
          />
          <Text style={styles.tndLabel}>TND</Text>
        </View>

        {finalAmount > 0 && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Montant à recharger</Text>
            <Text style={styles.summaryAmount}>{finalAmount.toFixed(2)} TND</Text>
          </View>
        )}

        <Text style={[styles.section, { marginTop: 24 }]}>💳 Mode de paiement</Text>
        {METHODS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.methodCard, method === m.key && { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '11' }]}
            onPress={() => setMethod(m.key)}
          >
            <Text style={{ fontSize: 24 }}>{m.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodLabel}>{m.label}</Text>
              <Text style={styles.methodDesc}>{m.desc}</Text>
            </View>
            <View style={[styles.radio, method === m.key && { borderColor: COLORS.accent }]}>
              {method === m.key && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.rechargeBtn, (finalAmount < 5 || loading) && { opacity: 0.5 }]}
          onPress={handleRecharge}
          disabled={finalAmount < 5 || loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : (
            <Text style={styles.rechargeBtnText}>
              ⚡ Recharger {finalAmount > 0 ? `${finalAmount.toFixed(2)} TND` : ''}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.secureNote}>🔒 Paiement sécurisé — Vos données sont protégées</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  section: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  amountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  amountChip: { width: '30%', paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  amountChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  amountText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  orText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginVertical: 12 },
  customAmountWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, marginBottom: 12 },
  customAmountInput: { flex: 1, paddingVertical: 14, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  tndLabel: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  summaryBox: { backgroundColor: COLORS.accent + '15', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.accent + '44', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryAmount: { color: COLORS.accent, fontSize: 22, fontWeight: '900' },
  methodCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  methodLabel: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  methodDesc: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  rechargeBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  rechargeBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  secureNote: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginTop: 14 },
});
