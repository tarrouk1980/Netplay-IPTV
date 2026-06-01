import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
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
  green: '#27AE60',
  accent: '#D32F2F',
  orange: '#F57C00',
  blue: '#1565C0',
};

const AMOUNTS = [5, 10, 20, 50, 100];

const METHODS = [
  { key: 'KONNECT', label: 'Konnect', icon: '💳', color: '#1565C0', sublabel: 'Carte bancaire' },
  { key: 'FLOUCI', label: 'Flouci', icon: '📱', color: '#9C27B0', sublabel: 'Paiement mobile' },
  { key: 'D17', label: 'D17', icon: '🏦', color: '#00838F', sublabel: 'Compte D17' },
  { key: 'CASH', label: 'Agence', icon: '🏪', color: COLORS.orange, sublabel: 'Dépôt en espèces' },
];

export default function WalletTopUpScreen({ navigation }) {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('KONNECT');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get('/api/wallet/balance').then((res) => {
      setBalance(res.data.balance ?? 0);
    }).catch(() => setBalance(0)).finally(() => setLoading(false));
  }, []);

  const handleTopUp = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 1) { Alert.alert('Montant invalide', 'Le montant minimum est 1 TND.'); return; }
    if (num > 500) { Alert.alert('Montant trop élevé', 'Maximum 500 TND par rechargement.'); return; }

    setProcessing(true);
    try {
      if (method === 'KONNECT' || method === 'FLOUCI') {
        const res = await api.post(`/api/payments/${method.toLowerCase()}/initiate`, { amount: num, type: 'WALLET_TOPUP' });
        navigation.navigate('KonnectPayment', {
          paymentUrl: res.data.payUrl || res.data.redirectUrl,
          amount: num,
          onSuccess: () => navigation.replace('Wallet'),
        });
      } else {
        const res = await api.post('/api/wallet/topup', { amount: num, method });
        if (method === 'CASH') {
          Alert.alert('Demande enregistrée ✅', `Votre demande de ${num} TND a été soumise. Rendez-vous en agence avec le code : ${res.data.code || 'TOPUP-XXXX'}`);
        } else {
          Alert.alert('Succès ✅', `${num} TND ajoutés à votre wallet.`);
          navigation.goBack();
        }
      }
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible d\'effectuer le rechargement.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.green} size="large" /></View>;

  const selectedMethod = METHODS.find((m) => m.key === method);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>💰 Recharger le wallet</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 16 }}>

        {/* Balance card */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Solde actuel</Text>
          <Text style={s.balanceValue}>{parseFloat(balance).toFixed(3)} TND</Text>
          {amount && parseFloat(amount) > 0 && !isNaN(parseFloat(amount)) && (
            <Text style={s.newBalance}>→ Après rechargement : {(parseFloat(balance) + parseFloat(amount)).toFixed(3)} TND</Text>
          )}
        </View>

        {/* Quick amounts */}
        <Text style={s.sectionLabel}>Montant rapide</Text>
        <View style={s.amountsRow}>
          {AMOUNTS.map((a) => (
            <TouchableOpacity
              key={a}
              style={[s.amountBtn, amount === a.toString() && s.amountBtnActive]}
              onPress={() => setAmount(a.toString())}
            >
              <Text style={[s.amountTxt, amount === a.toString() && s.amountTxtActive]}>{a} TND</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom amount */}
        <Text style={s.sectionLabel}>Montant personnalisé</Text>
        <View style={s.inputRow}>
          <TextInput
            style={s.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.000"
            placeholderTextColor={COLORS.muted}
          />
          <Text style={s.tndLabel}>TND</Text>
        </View>

        {/* Payment method */}
        <Text style={s.sectionLabel}>Mode de paiement</Text>
        <View style={s.methodsGrid}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[s.methodCard, method === m.key && { borderColor: m.color, backgroundColor: m.color + '11' }]}
              onPress={() => setMethod(m.key)}
            >
              <Text style={{ fontSize: 26, marginBottom: 6 }}>{m.icon}</Text>
              <Text style={[s.methodLabel, method === m.key && { color: m.color }]}>{m.label}</Text>
              <Text style={s.methodSub}>{m.sublabel}</Text>
              {method === m.key && (
                <View style={[s.methodCheck, { backgroundColor: m.color }]}>
                  <Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info box */}
        <View style={s.infoBox}>
          <Text style={s.infoTxt}>
            {method === 'CASH'
              ? '🏪 Rendez-vous dans une agence EasyWay partenaire avec le code généré.'
              : method === 'D17'
              ? '🏦 Le montant sera débité de votre compte D17. Assurez-vous d\'avoir un solde suffisant.'
              : '🔒 Paiement sécurisé. Vos données bancaires ne sont jamais stockées.'}
          </Text>
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={s.ctaContainer}>
        <TouchableOpacity
          style={[s.ctaBtn, { backgroundColor: selectedMethod?.color || COLORS.green }, (!amount || parseFloat(amount) < 1 || processing) && s.ctaDisabled]}
          onPress={handleTopUp}
          disabled={!amount || parseFloat(amount) < 1 || processing || isNaN(parseFloat(amount))}
        >
          {processing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={s.ctaTxt}>
              {method === 'CASH' ? '📋 Générer le code' : `${selectedMethod?.icon || ''} Recharger ${amount ? parseFloat(amount).toFixed(3) : '0.000'} TND`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  balanceCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, marginTop: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginBottom: 20 },
  balanceLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 4 },
  balanceValue: { color: COLORS.green, fontSize: 32, fontWeight: '900' },
  newBalance: { color: COLORS.muted, fontSize: 13, marginTop: 8 },
  sectionLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  amountsRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  amountBtn: { flex: 1, minWidth: '17%', backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  amountBtnActive: { borderColor: COLORS.green, backgroundColor: COLORS.green + '22' },
  amountTxt: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  amountTxtActive: { color: COLORS.green },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, marginBottom: 20 },
  amountInput: { flex: 1, color: COLORS.text, fontSize: 22, fontWeight: '700', paddingVertical: 14 },
  tndLabel: { color: COLORS.muted, fontSize: 16, fontWeight: '600' },
  methodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  methodCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
  },
  methodLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  methodSub: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  methodCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  infoBox: { backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  infoTxt: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  ctaContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  ctaBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  ctaDisabled: { opacity: 0.4 },
  ctaTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
