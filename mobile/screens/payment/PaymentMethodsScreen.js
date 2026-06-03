import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#E74C3C',
};

const METHODS = [
  { id: 'WALLET', emoji: '💳', label: 'Portefeuille EasyWay', desc: 'Rechargez et payez instantanément', type: 'digital' },
  { id: 'CASH', emoji: '💵', label: 'Espèces', desc: 'Paiement au chauffeur/livreur', type: 'cash' },
  { id: 'KONNECT', emoji: '🔵', label: 'Konnect', desc: 'Paiement en ligne sécurisé', type: 'gateway' },
  { id: 'D17', emoji: '🟠', label: 'D17 / Carte bancaire', desc: 'Visa, Mastercard, CIB', type: 'card' },
  { id: 'POSTEPAY', emoji: '🟡', label: 'PostePay', desc: 'Paiement via La Poste Tunisienne', type: 'gateway' },
];

export default function PaymentMethodsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [defaultMethod, setDefaultMethod] = useState('WALLET');
  const [savedCards] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '09/26' },
  ]);
  const [autoPay, setAutoPay] = useState(true);

  const handleSetDefault = (id) => {
    setDefaultMethod(id);
    Alert.alert('Mis à jour', `"${METHODS.find((m) => m.id === id)?.label}" est maintenant votre méthode par défaut.`);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💳 Moyens de paiement</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Wallet balance */}
        <View style={styles.walletCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.walletLabel}>Solde Portefeuille</Text>
            <Text style={styles.walletBalance}>{(user?.walletBalance ?? 0).toFixed(2)} TND</Text>
          </View>
          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={() => navigation.navigate('WalletRecharge')}
          >
            <Text style={styles.rechargeBtnText}>+ Recharger</Text>
          </TouchableOpacity>
        </View>

        {/* Auto-pay toggle */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Paiement automatique</Text>
            <Text style={styles.rowSub}>Débiter automatiquement à la fin de chaque course</Text>
          </View>
          <Switch
            value={autoPay}
            onValueChange={setAutoPay}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={autoPay ? '#000' : '#888'}
          />
        </View>

        {/* Méthodes */}
        <Text style={styles.sectionTitle}>Choisir méthode par défaut</Text>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodRow, defaultMethod === m.id && styles.methodRowActive]}
            onPress={() => handleSetDefault(m.id)}
          >
            <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.methodLabel, defaultMethod === m.id && { color: '#000' }]}>{m.label}</Text>
              <Text style={[styles.methodDesc, defaultMethod === m.id && { color: 'rgba(0,0,0,0.6)' }]}>{m.desc}</Text>
            </View>
            {defaultMethod === m.id && (
              <View style={styles.checkBadge}>
                <Text style={{ color: COLORS.accent, fontSize: 16 }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Cartes enregistrées */}
        {savedCards.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cartes enregistrées</Text>
            {savedCards.map((card) => (
              <View key={card.id} style={styles.cardRow}>
                <Text style={{ fontSize: 22 }}>
                  {card.brand === 'Visa' ? '💳' : '🏧'}
                </Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardLabel}>{card.brand} •••• {card.last4}</Text>
                  <Text style={styles.cardExp}>Expire {card.expiry}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert('Supprimer', 'Supprimer cette carte ?', [
                    { text: 'Annuler' },
                    { text: 'Supprimer', style: 'destructive' },
                  ])}
                >
                  <Text style={{ color: COLORS.red, fontSize: 13 }}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Add card */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('KonnectPayment', { amount: 0, mode: 'ADD_CARD' })}
        >
          <Text style={styles.addBtnText}>+ Ajouter une carte bancaire</Text>
        </TouchableOpacity>

        {/* Sécurité */}
        <View style={styles.securityNote}>
          <Text style={styles.securityText}>🔒 Vos données de paiement sont chiffrées et sécurisées. EASYWAY ne stocke jamais vos numéros de carte complets.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  walletCard: {
    backgroundColor: '#1A2A1A', borderRadius: 14,
    padding: 18, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.green, marginBottom: 16,
  },
  walletLabel: { color: COLORS.muted, fontSize: 12 },
  walletBalance: { color: COLORS.green, fontSize: 28, fontWeight: '700', marginTop: 4 },
  rechargeBtn: {
    backgroundColor: COLORS.green, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  rechargeBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 16, marginBottom: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  rowLabel: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  rowSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  sectionTitle: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 20, marginBottom: 10,
  },
  methodRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  methodRowActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  methodLabel: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  methodDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  checkBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  cardExp: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  addBtn: {
    borderWidth: 1, borderColor: COLORS.accent, borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  addBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  securityNote: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10,
    padding: 14, marginTop: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  securityText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
