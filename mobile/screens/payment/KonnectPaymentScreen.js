import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', danger: '#E74C3C',
};

const PAYMENT_METHODS = [
  { key: 'KONNECT', label: 'Konnect', emoji: '💳', desc: 'Visa / Mastercard · paiement sécurisé', color: '#1976D2' },
  { key: 'FLOUCI', label: 'Flouci', emoji: '📱', desc: 'Paiement mobile Flouci', color: '#00BFA5' },
  { key: 'WALLET', label: 'Wallet EASYWAY', emoji: '👛', desc: 'Solde disponible', color: COLORS.accent },
  { key: 'CASH', label: 'Espèces', emoji: '💵', desc: 'À remettre au prestataire', color: '#7CB342' },
];

function AmountCard({ amount, currency = 'TND', description }) {
  return (
    <View style={styles.amountCard}>
      <Text style={styles.amountLabel}>{description || 'Montant à payer'}</Text>
      <Text style={styles.amountValue}>{amount}</Text>
      <Text style={styles.amountCurrency}>{currency}</Text>
    </View>
  );
}

function MethodCard({ method, selected, walletBalance, onSelect }) {
  const disabled = method.key === 'WALLET' && walletBalance < 1;
  return (
    <TouchableOpacity
      style={[styles.methodCard, selected && { borderColor: method.color }, disabled && styles.methodDisabled]}
      onPress={() => !disabled && onSelect(method.key)}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={[styles.methodIconBox, { backgroundColor: method.color + '20' }]}>
        <Text style={{ fontSize: 26 }}>{method.emoji}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={[styles.methodLabel, disabled && { color: COLORS.muted }]}>{method.label}</Text>
        <Text style={styles.methodDesc}>
          {method.key === 'WALLET' ? `Solde: ${walletBalance?.toFixed(2) || '0.00'} TND` : method.desc}
        </Text>
      </View>
      <View style={[styles.radioOuter, selected && { borderColor: method.color }]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: method.color }]} />}
      </View>
    </TouchableOpacity>
  );
}

function CardForm({ onSubmit, loading }) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const cardType = () => {
    const d = number.replace(/\s/g, '');
    if (d.startsWith('4')) return '💳 Visa';
    if (d.startsWith('5') || d.startsWith('2')) return '💳 Mastercard';
    return '💳';
  };

  const valid = number.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3 && name.trim();

  return (
    <View style={styles.cardForm}>
      <Text style={styles.fieldLabel}>Numéro de carte {number.length > 0 ? cardType() : ''}</Text>
      <TextInput
        style={styles.input}
        value={number}
        onChangeText={t => setNumber(formatCard(t))}
        placeholder="0000 0000 0000 0000"
        placeholderTextColor={COLORS.muted}
        keyboardType="numeric"
        maxLength={19}
      />

      <View style={styles.cardRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.fieldLabel}>Date d'expiration</Text>
          <TextInput
            style={styles.input}
            value={expiry}
            onChangeText={t => setExpiry(formatExpiry(t))}
            placeholder="MM/AA"
            placeholderTextColor={COLORS.muted}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>CVV</Text>
          <TextInput
            style={styles.input}
            value={cvv}
            onChangeText={t => setCvv(t.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            placeholderTextColor={COLORS.muted}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Nom sur la carte</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="MOHAMED BEN SALEM"
        placeholderTextColor={COLORS.muted}
        autoCapitalize="characters"
      />

      <View style={styles.secureRow}>
        <Text style={styles.secureText}>🔒 Paiement sécurisé SSL 256-bit</Text>
        <Text style={styles.secureText}>· Konnect</Text>
      </View>

      <TouchableOpacity
        style={[styles.payBtn, !valid && { opacity: 0.5 }]}
        onPress={() => valid && onSubmit({ number, expiry, cvv, name })}
        disabled={!valid || loading}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.payBtnText}>💳 Payer maintenant</Text>}
      </TouchableOpacity>
    </View>
  );
}

export default function KonnectPaymentScreen({ route, navigation }) {
  const { amount = 25, description = 'Paiement EASYWAY', orderId, serviceType, onSuccess } = route.params || {};
  const [method, setMethod] = useState('KONNECT');
  const [loading, setLoading] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState(null);
  const [walletBalance] = useState(47.5);

  const handlePay = async (cardData) => {
    setLoading(true);
    try {
      if (method === 'KONNECT') {
        const res = await api.post('/api/payments/konnect/init', {
          amount, description, orderId, cardData,
        });
        if (res.data?.payUrl) {
          setWebviewUrl(res.data.payUrl);
        } else if (res.data?.success) {
          handleSuccess();
        }
      } else if (method === 'FLOUCI') {
        const res = await api.post('/api/payments/flouci/init', { amount, orderId });
        if (res.data?.link) setWebviewUrl(res.data.link);
      } else if (method === 'WALLET') {
        await api.post('/api/wallet/pay', { amount, orderId });
        handleSuccess();
      } else {
        handleSuccess();
      }
    } catch {
      Alert.alert('Erreur', 'Paiement impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setWebviewUrl(null);
    Alert.alert(
      '✅ Paiement confirmé',
      `${amount} TND payé avec succès.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleWebviewNav = (e) => {
    const url = e.url;
    if (url.includes('success') || url.includes('payment_success') || url.includes('return_url')) {
      handleSuccess();
    } else if (url.includes('cancel') || url.includes('fail')) {
      setWebviewUrl(null);
      Alert.alert('Paiement annulé', 'Votre paiement n\'a pas été effectué.');
    }
  };

  if (webviewUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={() => setWebviewUrl(null)} style={styles.backBtn}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.webviewTitle}>🔒 Paiement sécurisé</Text>
          <View style={{ width: 36 }} />
        </View>
        <WebView
          source={{ uri: webviewUrl }}
          onNavigationStateChange={handleWebviewNav}
          style={{ flex: 1 }}
          startInLoadingState
          renderLoading={() => <ActivityIndicator style={{ flex: 1 }} color={COLORS.accent} />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <AmountCard amount={amount} description={description} />

          <Text style={styles.sectionTitle}>Moyen de paiement</Text>
          <View style={styles.methodsList}>
            {PAYMENT_METHODS.map(m => (
              <MethodCard
                key={m.key}
                method={m}
                selected={method === m.key}
                walletBalance={walletBalance}
                onSelect={setMethod}
              />
            ))}
          </View>

          {method === 'KONNECT' && (
            <CardForm onSubmit={handlePay} loading={loading} />
          )}

          {method === 'FLOUCI' && (
            <View style={styles.flouciBox}>
              <Text style={styles.flouciText}>📱 Vous serez redirigé vers l'interface Flouci pour finaliser le paiement.</Text>
              <TouchableOpacity style={styles.payBtn} onPress={() => handlePay({})} disabled={loading} activeOpacity={0.85}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.payBtnText}>Payer avec Flouci</Text>}
              </TouchableOpacity>
            </View>
          )}

          {method === 'WALLET' && (
            <View style={styles.walletBox}>
              <View style={styles.walletRow}>
                <Text style={styles.walletLabel}>Solde disponible</Text>
                <Text style={styles.walletBalance}>{walletBalance.toFixed(2)} TND</Text>
              </View>
              <View style={styles.walletRow}>
                <Text style={styles.walletLabel}>Montant à déduire</Text>
                <Text style={[styles.walletBalance, { color: COLORS.danger }]}>-{amount} TND</Text>
              </View>
              <View style={[styles.walletRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 }]}>
                <Text style={styles.walletLabel}>Solde après paiement</Text>
                <Text style={[styles.walletBalance, { color: COLORS.green }]}>{(walletBalance - amount).toFixed(2)} TND</Text>
              </View>
              <TouchableOpacity style={styles.payBtn} onPress={() => handlePay({})} disabled={loading} activeOpacity={0.85}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.payBtnText}>👛 Payer depuis le wallet</Text>}
              </TouchableOpacity>
            </View>
          )}

          {method === 'CASH' && (
            <View style={styles.cashBox}>
              <Text style={styles.cashEmoji}>💵</Text>
              <Text style={styles.cashTitle}>Paiement en espèces</Text>
              <Text style={styles.cashText}>Préparez <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{amount} TND</Text> en espèces. Remettez le montant directement au prestataire à l'arrivée.</Text>
              <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#7CB342' }]} onPress={() => handlePay({})} disabled={loading} activeOpacity={0.85}>
                <Text style={styles.payBtnText}>✅ Confirmer commande</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.white, fontSize: 28 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  webviewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  webviewTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  amountCard: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 20, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  amountLabel: { color: COLORS.muted, fontSize: 14, marginBottom: 8 },
  amountValue: { color: COLORS.accent, fontSize: 52, fontWeight: '800' },
  amountCurrency: { color: COLORS.muted, fontSize: 16, marginTop: 4 },
  sectionTitle: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginHorizontal: 16, marginBottom: 10,
  },
  methodsList: { paddingHorizontal: 16, gap: 8 },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: COLORS.border,
  },
  methodDisabled: { opacity: 0.45 },
  methodIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  methodDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  cardForm: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  fieldLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 15, paddingHorizontal: 14, paddingVertical: 12,
    letterSpacing: 1,
  },
  cardRow: { flexDirection: 'row' },
  secureRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, marginBottom: 6, gap: 4 },
  secureText: { color: COLORS.muted, fontSize: 11 },
  payBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 16 },
  payBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  flouciBox: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  flouciText: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  walletBox: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between' },
  walletLabel: { color: COLORS.muted, fontSize: 14 },
  walletBalance: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  cashBox: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cashEmoji: { fontSize: 48, marginBottom: 12 },
  cashTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  cashText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
});
