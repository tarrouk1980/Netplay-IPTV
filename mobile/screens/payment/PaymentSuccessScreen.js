import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  success: '#34C759',
};

const MOCK_PAYMENT = {
  amount: '34.50',
  currency: 'TND',
  transactionId: 'TXN-2025-84721',
  service: "Taxi — Av. Bourguiba → Aéroport",
  date: '03/06/2025',
  heure: '14:32',
  method: 'Carte bancaire',
};

export default function PaymentSuccessScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Circle */}
        <View style={styles.circleOuter}>
          <View style={styles.circleInner}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        <Text style={styles.title}>Paiement réussi !</Text>
        <Text style={styles.subtitle}>Votre transaction a été traitée avec succès.</Text>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Montant payé</Text>
          <Text style={styles.amount}>{MOCK_PAYMENT.amount} {MOCK_PAYMENT.currency}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Référence</Text>
            <Text style={styles.rowValue}>{MOCK_PAYMENT.transactionId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Service</Text>
            <Text style={[styles.rowValue, styles.rowValueWrap]}>{MOCK_PAYMENT.service}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowValue}>{MOCK_PAYMENT.date}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Heure</Text>
            <Text style={styles.rowValue}>{MOCK_PAYMENT.heure}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Méthode</Text>
            <Text style={styles.rowValue}>{MOCK_PAYMENT.method}</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.outlinedButton} onPress={() => {}}>
          <Text style={styles.outlinedButtonText}>Voir le reçu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.primaryButtonText}>Retour à l'accueil</Text>
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
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  circleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  circleInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 28,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  amountLabel: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 4,
  },
  amount: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.muted,
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  rowValueWrap: {
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  outlinedButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  outlinedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0F',
  },
});
