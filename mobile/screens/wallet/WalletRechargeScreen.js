import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator, StatusBar,
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
  accent: '#D32F2F',
  flouci: '#F5A623',
  d17: '#2196F3',
};

const PRESET_AMOUNTS = [5, 10, 20, 30, 50, 100];

const METHODS = [
  {
    key: 'FLOUCI',
    label: 'Flouci',
    subtitle: 'Paiement mobile rapide',
    color: COLORS.flouci,
    icon: '📲',
  },
  {
    key: 'D17',
    label: 'D17',
    subtitle: 'Portefeuille postal Tunisien',
    color: COLORS.d17,
    icon: '🏦',
  },
  {
    key: 'CASH',
    label: 'Espèces',
    subtitle: 'Rechargement en agence',
    color: COLORS.green,
    icon: '💵',
  },
];

export default function WalletRechargeScreen({ navigation }) {
  const [method, setMethod] = useState('FLOUCI');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select'); // select | confirm | processing | done

  useEffect(() => {
    api.get('/api/wallet/balance')
      .then(r => setWalletBalance(r.data.walletBalance ?? 0))
      .catch(() => {});
  }, []);

  const finalAmount = customAmount ? parseFloat(customAmount) : (amount ? parseFloat(amount) : 0);

  const handleContinue = () => {
    if (!finalAmount || finalAmount < 1) {
      Alert.alert('Montant invalide', 'Veuillez entrer un montant minimum de 1 TND.');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setStep('processing');
    setLoading(true);
    try {
      const res = await api.post('/api/wallet/recharge', {
        amount: finalAmount,
        method,
      });

      if (res.data?.paymentUrl) {
        // Flouci/D17 redirect
        const { Linking } = require('react-native');
        await Linking.openURL(res.data.paymentUrl);
        setStep('done');
      } else if (res.data?.success || res.data?.message) {
        setStep('done');
      } else {
        setStep('confirm');
        Alert.alert('Erreur', res.data?.error || 'Recharge échouée.');
      }
    } catch (err) {
      setStep('confirm');
      Alert.alert('Erreur', err?.response?.data?.error || 'Connexion impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = METHODS.find(m => m.key === method);

  if (step === 'done') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.doneBox}>
          <Text style={styles.doneIcon}>✅</Text>
          <Text style={styles.doneTitle}>Demande envoyée !</Text>
          <Text style={styles.doneSub}>
            {method === 'CASH'
              ? 'Présentez-vous en agence avec votre numéro de téléphone.'
              : 'Votre paiement est en cours de traitement. Le solde sera mis à jour sous peu.'}
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>Retour au wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'processing') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.doneBox}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.processingText}>Traitement en cours…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 'confirm' ? setStep('select') : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'confirm' ? 'Confirmer la recharge' : 'Recharger le wallet'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Current balance */}
        {walletBalance !== null && (
          <View style={styles.balancePill}>
            <Text style={styles.balancePillLabel}>Solde actuel</Text>
            <Text style={styles.balancePillAmount}>{Number(walletBalance).toFixed(2)} TND</Text>
          </View>
        )}

        {step === 'select' && (
          <>
            {/* Method selection */}
            <Text style={styles.sectionLabel}>MÉTHODE DE PAIEMENT</Text>
            {METHODS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.methodCard, method === m.key && { borderColor: m.color, backgroundColor: m.color + '15' }]}
                onPress={() => setMethod(m.key)}
                activeOpacity={0.85}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodLabel, method === m.key && { color: m.color }]}>{m.label}</Text>
                  <Text style={styles.methodSub}>{m.subtitle}</Text>
                </View>
                <View style={[styles.radio, method === m.key && { borderColor: m.color }]}>
                  {method === m.key && <View style={[styles.radioDot, { backgroundColor: m.color }]} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Amount presets */}
            <Text style={styles.sectionLabel}>MONTANT (TND)</Text>
            <View style={styles.presetGrid}>
              {PRESET_AMOUNTS.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[styles.presetBtn, amount === String(a) && customAmount === '' && { backgroundColor: selectedMethod?.color || COLORS.green, borderColor: selectedMethod?.color || COLORS.green }]}
                  onPress={() => { setAmount(String(a)); setCustomAmount(''); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetBtnText, amount === String(a) && customAmount === '' && { color: '#FFF' }]}>
                    {a} TND
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.orLabel}>ou entrez un montant personnalisé</Text>
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Ex: 45"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={(v) => { setCustomAmount(v); setAmount(''); }}
              />
              <Text style={styles.tndLabel}>TND</Text>
            </View>

            {finalAmount > 0 && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Résumé</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Montant</Text>
                  <Text style={styles.summaryVal}>{finalAmount.toFixed(2)} TND</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Méthode</Text>
                  <Text style={styles.summaryVal}>{selectedMethod?.label}</Text>
                </View>
                {walletBalance !== null && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Nouveau solde</Text>
                    <Text style={[styles.summaryVal, { color: COLORS.green }]}>
                      {(walletBalance + finalAmount).toFixed(2)} TND
                    </Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: selectedMethod?.color || COLORS.green }, (!finalAmount || finalAmount < 1) && { opacity: 0.5 }]}
              onPress={handleContinue}
              disabled={!finalAmount || finalAmount < 1}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnText}>Continuer →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'confirm' && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmIcon}>{selectedMethod?.icon}</Text>
            <Text style={styles.confirmAmount}>{finalAmount.toFixed(2)} TND</Text>
            <Text style={styles.confirmMethod}>via {selectedMethod?.label}</Text>

            {method === 'CASH' && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>
                  💡 Rendez-vous dans une agence EASYWAY et communiquez votre numéro de téléphone enregistré.
                </Text>
              </View>
            )}
            {method === 'FLOUCI' && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>
                  📲 Vous serez redirigé vers l'application Flouci pour valider le paiement.
                </Text>
              </View>
            )}
            {method === 'D17' && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>
                  🏦 Vous serez redirigé vers D17 (La Poste Tunisienne) pour valider le paiement.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: selectedMethod?.color || COLORS.green, marginTop: 24 }]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnText}>✓ Confirmer la recharge</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('select')}>
              <Text style={styles.cancelBtnText}>Modifier</Text>
            </TouchableOpacity>
          </View>
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
  balancePill: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  balancePillLabel: { color: COLORS.muted, fontSize: 13 },
  balancePillAmount: { color: COLORS.green, fontSize: 20, fontWeight: '800' },
  sectionLabel: {
    color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
  },
  methodCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border, gap: 12,
  },
  methodIcon: { fontSize: 28 },
  methodInfo: { flex: 1 },
  methodLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  methodSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  presetBtn: {
    paddingHorizontal: 18, paddingVertical: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
  },
  presetBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '700' },
  orLabel: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginBottom: 10 },
  customInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: 16, marginBottom: 20,
  },
  customInput: { flex: 1, color: COLORS.text, fontSize: 20, fontWeight: '700', paddingVertical: 14 },
  tndLabel: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
  summaryBox: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  summaryLabel: { color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryKey: { color: COLORS.muted, fontSize: 13 },
  summaryVal: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  ctaBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: COLORS.muted, fontSize: 14 },
  confirmBox: { alignItems: 'center', paddingTop: 20 },
  confirmIcon: { fontSize: 56, marginBottom: 16 },
  confirmAmount: { color: COLORS.text, fontSize: 48, fontWeight: '900', marginBottom: 4 },
  confirmMethod: { color: COLORS.muted, fontSize: 16, marginBottom: 20 },
  infoAlert: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, width: '100%' },
  infoAlertText: { color: COLORS.muted, fontSize: 13, lineHeight: 20 },
  doneBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneIcon: { fontSize: 64, marginBottom: 20 },
  doneTitle: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 10 },
  doneSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 32 },
  doneBtn: { backgroundColor: COLORS.green, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40 },
  doneBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  processingText: { color: COLORS.muted, fontSize: 15, marginTop: 20 },
});
