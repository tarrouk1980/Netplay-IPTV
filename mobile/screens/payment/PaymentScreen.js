import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import api from '../../services/api';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  accent: '#D32F2F',
  accentOrange: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2A2A3A',
  success: '#27AE60',
};

const METHODS = [
  { key: 'FLOUCI', label: 'Flouci', icon: '💳', color: '#5B5BD6', description: 'Wallet mobile tunisien' },
  { key: 'D17', label: 'D17', icon: '📱', color: '#00BFA5', description: 'Paiement mobile D17' },
  { key: 'CASH', label: 'Espèces', icon: '💵', color: '#F5A623', description: 'Paiement en espèces' },
];

/**
 * PaymentScreen
 * Props: route.params = { orderId, amount, onSuccess, onCancel }
 * Or passed directly as props for embedding.
 */
export default function PaymentScreen({ navigation, route }) {
  const { orderId, amount, onSuccess, onCancel } = route?.params || {};

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!selectedMethod) {
      Alert.alert('Méthode requise', 'Veuillez sélectionner une méthode de paiement.');
      return;
    }

    if ((selectedMethod === 'FLOUCI' || selectedMethod === 'D17') && !phone.trim()) {
      Alert.alert('Numéro requis', `Entrez votre numéro ${selectedMethod}.`);
      return;
    }

    setLoading(true);
    try {
      let res;
      if (selectedMethod === 'FLOUCI') {
        res = await api.post('/api/payment/flouci', { orderId, amount, phone });
      } else if (selectedMethod === 'D17') {
        res = await api.post('/api/payment/d17', { orderId, amount, phone });
      } else {
        res = await api.post('/api/payment/cash', { orderId, amount });
      }

      Alert.alert(
        'Paiement réussi !',
        selectedMethod === 'CASH'
          ? 'Remettez le montant exact au prestataire.'
          : `Transaction ID : ${res.data.transactionId || 'N/A'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) onSuccess(res.data);
              else navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Échec du paiement', err.response?.data?.error || err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Montant à payer</Text>
          <Text style={styles.amountValue}>{amount ? `${amount} TND` : '—'}</Text>
          {orderId && <Text style={styles.orderRef}>Commande #{orderId?.slice(-8)?.toUpperCase()}</Text>}
        </View>

        {/* Method selection */}
        <Text style={styles.sectionTitle}>Choisissez votre méthode</Text>

        {METHODS.map((method) => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.methodCard,
              selectedMethod === method.key && { borderColor: method.color, borderWidth: 2 },
            ]}
            onPress={() => setSelectedMethod(method.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIcon, { backgroundColor: method.color + '22' }]}>
              <Text style={{ fontSize: 24 }}>{method.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodLabel}>{method.label}</Text>
              <Text style={styles.methodDesc}>{method.description}</Text>
            </View>
            <View style={[
              styles.radio,
              selectedMethod === method.key && { backgroundColor: method.color, borderColor: method.color },
            ]} />
          </TouchableOpacity>
        ))}

        {/* Phone input for Flouci / D17 */}
        {(selectedMethod === 'FLOUCI' || selectedMethod === 'D17') && (
          <View style={styles.phoneSection}>
            <Text style={styles.phoneLabel}>
              Numéro {selectedMethod === 'FLOUCI' ? 'Flouci' : 'D17'}
            </Text>
            <TextInput
              style={styles.phoneInput}
              placeholder={selectedMethod === 'FLOUCI' ? 'Ex: 2X XXX XXX' : 'Ex: 5X XXX XXX'}
              placeholderTextColor={COLORS.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
        )}

        {/* Cash note */}
        {selectedMethod === 'CASH' && (
          <View style={styles.cashNote}>
            <Text style={styles.cashNoteIcon}>💡</Text>
            <Text style={styles.cashNoteText}>
              Remettez le montant exact au prestataire à la fin du service.
            </Text>
          </View>
        )}

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payBtn, (!selectedMethod || loading) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={!selectedMethod || loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.text} />
            : (
              <Text style={styles.payBtnText}>
                {selectedMethod === 'CASH'
                  ? 'Confirmer (espèces)'
                  : `Payer ${amount ? `${amount} TND` : ''}`}
              </Text>
            )
          }
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelBtn: { padding: 4 },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 14 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  amountCard: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
  },
  amountLabel: { color: COLORS.textMuted, fontSize: 13 },
  amountValue: { color: COLORS.accent, fontSize: 40, fontWeight: '900', marginVertical: 6 },
  orderRef: { color: COLORS.textMuted, fontSize: 11 },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  methodDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  phoneSection: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  phoneLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 6 },
  phoneInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    letterSpacing: 1,
  },
  cashNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5A62322',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F5A62344',
    marginTop: 4,
  },
  cashNoteIcon: { fontSize: 18 },
  cashNoteText: { color: COLORS.accentOrange, fontSize: 13, flex: 1, lineHeight: 18 },
  payBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
  },
  payBtnDisabled: { opacity: 0.45 },
  payBtnText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
});
