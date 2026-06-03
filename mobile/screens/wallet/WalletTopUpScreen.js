import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const MOCK_BALANCE = 127.50;

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

const PAYMENT_METHODS = [
  { id: 'card', emoji: '💳', label: 'Carte bancaire', subtitle: '' },
  { id: 'mobile', emoji: '📱', label: 'Paiement mobile', subtitle: 'D17, Paymee' },
  { id: 'bank', emoji: '🏦', label: 'Virement bancaire', subtitle: '' },
];

export default function WalletTopUpScreen({ navigation }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');

  const getAmount = () => {
    if (customAmount !== '') {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount || 0;
  };

  const amount = getAmount();
  const fees = 0.00;
  const total = amount + fees;

  const handleRecharge = () => {
    if (total <= 0) {
      Alert.alert("Erreur", "Veuillez sélectionner ou saisir un montant.");
      return;
    }
    Alert.alert("Succès", `Recharge de ${total.toFixed(2)} TND initiée avec succès !`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recharger mon portefeuille</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance */}
        <View style={styles.balanceBox}>
          <Text style={styles.balanceEmoji}>👛</Text>
          <Text style={styles.balanceLabel}>Solde actuel</Text>
          <Text style={styles.balanceAmount}>{MOCK_BALANCE.toFixed(2)} TND</Text>
        </View>

        {/* Quick Amounts */}
        <Text style={styles.sectionTitle}>Montant rapide</Text>
        <View style={styles.amountsGrid}>
          {QUICK_AMOUNTS.map(amt => (
            <TouchableOpacity
              key={amt}
              style={[
                styles.amountBtn,
                selectedAmount === amt && customAmount === '' && styles.amountBtnActive,
              ]}
              onPress={() => {
                setSelectedAmount(amt);
                setCustomAmount('');
              }}
            >
              <Text style={[
                styles.amountBtnText,
                selectedAmount === amt && customAmount === '' && styles.amountBtnTextActive,
              ]}>
                {amt} TND
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Amount */}
        <Text style={styles.sectionTitle}>Montant personnalisé</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entrer un montant..."
            placeholderTextColor={COLORS.muted}
            value={customAmount}
            onChangeText={(val) => {
              setCustomAmount(val);
              setSelectedAmount(null);
            }}
            keyboardType="numeric"
          />
          <Text style={styles.inputSuffix}>TND</Text>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Mode de paiement</Text>
        {PAYMENT_METHODS.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardActive,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Text style={styles.methodEmoji}>{method.emoji}</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodLabel}>{method.label}</Text>
              {method.subtitle !== '' && (
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              )}
            </View>
            {selectedMethod === method.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Montant</Text>
            <Text style={styles.summaryValue}>{amount.toFixed(2)} TND</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais</Text>
            <Text style={styles.summaryValue}>{fees.toFixed(2)} TND</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{total.toFixed(2)} TND</Text>
          </View>
        </View>

        {/* Recharge Button */}
        <TouchableOpacity style={styles.rechargeBtn} onPress={handleRecharge}>
          <Text style={styles.rechargeBtnText}>Recharger</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
    width: 36,
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  balanceBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  balanceEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  balanceLabel: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '800',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },
  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  amountBtn: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  amountBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#2A1F00',
  },
  amountBtnText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  amountBtnTextActive: {
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 14,
  },
  inputSuffix: {
    color: COLORS.muted,
    fontSize: 14,
    marginLeft: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodCardActive: {
    borderColor: COLORS.primary,
  },
  methodEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  methodSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 14,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryTotalValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  rechargeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  rechargeBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
