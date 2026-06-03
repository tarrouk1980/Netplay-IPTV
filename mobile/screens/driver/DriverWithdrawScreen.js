import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', accentDark: '#C47D0E',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const METHODS = [
  { id: 'bank', icon: '🏦', label: 'Virement bancaire', detail: 'IBAN TN · 1–3 jours ouvrés' },
  { id: 'postale', icon: '📮', label: 'Carte Postale', detail: 'CCP ou e-DINAR · Immédiat' },
  { id: 'd17', icon: '📱', label: 'D17', detail: 'Wallet D17 · Immédiat' },
  { id: 'flouci', icon: '💛', label: 'Flouci', detail: 'Wallet Flouci · Immédiat' },
];

const QUICK_AMOUNTS = [50, 100, 200, 500];

const MOCK_BALANCE = { available: 347.50, pending: 62.00, total: 409.50 };

export default function DriverWithdrawScreen({ navigation, route }) {
  const balance = route.params?.balance || MOCK_BALANCE;
  const [method, setMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [iban, setIban] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const isValid = method && numAmount >= 20 && numAmount <= balance.available;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      // await api.post('/driver/withdraw', { method, amount: numAmount, iban });
      setRefId('WD-' + Math.random().toString(36).slice(2, 8).toUpperCase());
      setSubmitted(true);
    } catch {
      Alert.alert('Erreur', 'Impossible de traiter le retrait. Réessayez plus tard.');
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.doneContainer}>
          <View style={styles.doneCircle}>
            <Text style={{ fontSize: 40 }}>✓</Text>
          </View>
          <Text style={styles.doneTitle}>Retrait demandé !</Text>
          <Text style={styles.doneSub}>
            Votre demande de retrait de {numAmount.toFixed(2)} TND a été soumise.
          </Text>
          <View style={styles.doneRefCard}>
            <Text style={styles.doneRefLabel}>Référence</Text>
            <Text style={styles.doneRefValue}>{refId}</Text>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Retour au tableau de bord</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retrait de gains</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceNum}>{balance.available.toFixed(2)} TND</Text>
              <Text style={styles.balanceLabel}>Disponible</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={[styles.balanceNum, { color: COLORS.muted }]}>{balance.pending.toFixed(2)} TND</Text>
              <Text style={styles.balanceLabel}>En attente</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={[styles.balanceNum, { color: COLORS.blue }]}>{balance.total.toFixed(2)} TND</Text>
              <Text style={styles.balanceLabel}>Total</Text>
            </View>
          </View>
          <Text style={styles.balanceNote}>⚠️ Minimum de retrait : 20 TND</Text>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💵 Montant du retrait</Text>
          <View style={styles.amountInputRow}>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.muted}
              value={amount}
              onChangeText={setAmount}
            />
            <Text style={styles.amountCurrency}>TND</Text>
          </View>
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.quickChip, parseFloat(amount) === q && styles.quickChipActive]}
                onPress={() => setAmount(String(q))}
                disabled={q > balance.available}
              >
                <Text style={[styles.quickChipText, q > balance.available && { color: COLORS.border }]}>
                  {q} TND
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.quickChip, parseFloat(amount) === balance.available && styles.quickChipActive]}
              onPress={() => setAmount(String(balance.available))}
            >
              <Text style={styles.quickChipText}>Tout</Text>
            </TouchableOpacity>
          </View>
          {numAmount > 0 && numAmount > balance.available && (
            <Text style={styles.errorText}>⚠️ Solde insuffisant</Text>
          )}
          {numAmount > 0 && numAmount < 20 && (
            <Text style={styles.errorText}>⚠️ Minimum 20 TND</Text>
          )}
        </View>

        {/* Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏦 Méthode de retrait</Text>
          <View style={styles.methodList}>
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodCard, method === m.id && styles.methodCardActive]}
                onPress={() => setMethod(m.id)}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  <Text style={styles.methodDetail}>{m.detail}</Text>
                </View>
                <View style={[styles.radio, method === m.id && styles.radioActive]}>
                  {method === m.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* IBAN (if bank) */}
        {method === 'bank' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔢 IBAN tunisien</Text>
            <TextInput
              style={styles.ibanInput}
              placeholder="TN59 XXXX XXXX XXXX XXXX XX"
              placeholderTextColor={COLORS.muted}
              value={iban}
              onChangeText={setIban}
              autoCapitalize="characters"
            />
          </View>
        )}

        {/* Summary */}
        {isValid && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Récapitulatif</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Montant demandé</Text>
              <Text style={styles.summaryValue}>{numAmount.toFixed(2)} TND</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de retrait</Text>
              <Text style={[styles.summaryValue, { color: COLORS.green }]}>GRATUIT</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: COLORS.white, fontWeight: '700' }]}>Vous recevrez</Text>
              <Text style={[styles.summaryValue, { color: COLORS.accent, fontSize: 18, fontWeight: '900' }]}>
                {numAmount.toFixed(2)} TND
              </Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid}
        >
          <Text style={styles.submitBtnText}>
            {!method ? 'Choisissez une méthode' :
             numAmount < 20 ? 'Minimum 20 TND' :
             numAmount > balance.available ? 'Solde insuffisant' :
             `Retirer ${numAmount.toFixed(2)} TND`}
          </Text>
        </TouchableOpacity>
      </View>
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
  balanceCard: {
    margin: 16, backgroundColor: '#0A1A0A', borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.green, padding: 16,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  balanceItem: { alignItems: 'center' },
  balanceNum: { color: COLORS.green, fontSize: 20, fontWeight: '900' },
  balanceLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  balanceDivider: { width: 1, backgroundColor: COLORS.border },
  balanceNote: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  amountInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 16, paddingVertical: 4,
  },
  amountInput: {
    flex: 1, color: COLORS.white, fontSize: 28, fontWeight: '800', paddingVertical: 12,
  },
  amountCurrency: { color: COLORS.muted, fontSize: 16, fontWeight: '600' },
  quickAmounts: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  quickChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  quickChipActive: { borderColor: COLORS.accent, backgroundColor: '#2A1E0A' },
  quickChipText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  errorText: { color: COLORS.red, fontSize: 12, marginTop: 6 },
  methodList: { gap: 8 },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  methodCardActive: { borderColor: COLORS.accent, backgroundColor: '#1A1408' },
  methodIcon: { fontSize: 24 },
  methodLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  methodDetail: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  ibanInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 15, padding: 14, letterSpacing: 1,
  },
  summaryCard: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  summaryTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: COLORS.muted, fontSize: 14 },
  summaryValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: COLORS.surface },
  submitBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '800' },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  doneCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#0A1A0A', borderWidth: 3, borderColor: COLORS.green,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  doneTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 10 },
  doneSub: { color: COLORS.muted, fontSize: 15, textAlign: 'center', marginBottom: 24 },
  doneRefCard: {
    backgroundColor: COLORS.surface, borderRadius: 10, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: 32,
  },
  doneRefLabel: { color: COLORS.muted, fontSize: 12 },
  doneRefValue: { color: COLORS.accent, fontSize: 18, fontWeight: '800', marginTop: 4, letterSpacing: 2 },
  doneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingHorizontal: 40, paddingVertical: 16,
  },
  doneBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: '800' },
});
