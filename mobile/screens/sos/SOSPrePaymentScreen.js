import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  red: '#D32F2F', redLight: '#FF5252', redPale: '#1A0505',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', amber: '#F57C00',
};

const PAYMENT_METHODS = [
  { id: 'WALLET', emoji: '💳', label: 'Portefeuille EasyWay', desc: 'Débit immédiat' },
  { id: 'CASH', emoji: '💵', label: 'Espèces au dépanneur', desc: 'Paiement à l\'intervention' },
  { id: 'KONNECT', emoji: '🔵', label: 'Konnect', desc: 'Paiement en ligne' },
];

export default function SOSPrePaymentScreen({ route, navigation }) {
  const {
    breakdownType, breakdownLabel, breakdownEmoji,
    address, lat, lng, depanneur, estimatedPrice,
  } = route?.params || {};

  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const basePrice = estimatedPrice?.base || 35;
  const laborPrice = estimatedPrice?.labor || 25;
  const partPrice = estimatedPrice?.parts || 0;
  const total = basePrice + laborPrice + partPrice;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post('/api/sos/orders', {
        breakdownType,
        lat, lng, address,
        depanneurId: depanneur?.id,
        paymentMethod,
        estimatedTotal: total,
        notes,
      });
      navigation.replace('SOSTracking', {
        breakdownType,
        depanneurName: depanneur?.name || 'Dépanneur',
        estimatedArrival: depanneur?.eta || 15,
      });
    } catch {
      // Fallback: proceed anyway in dev
      navigation.replace('SOSTracking', {
        breakdownType,
        depanneurName: depanneur?.name || 'Dépanneur assigné',
        estimatedArrival: 12,
      });
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
        <Text style={styles.title}>💰 Confirmer & Payer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Breakdown summary */}
        <View style={styles.breakdownCard}>
          <Text style={{ fontSize: 36 }}>{breakdownEmoji || '🛻'}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.breakdownLabel}>{breakdownLabel || 'Dépannage'}</Text>
            <Text style={styles.breakdownAddr} numberOfLines={2}>{address || 'Votre position actuelle'}</Text>
          </View>
        </View>

        {/* Dépanneur */}
        {depanneur && (
          <View style={styles.depanneurCard}>
            <Text style={{ fontSize: 28 }}>🛻</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.depanneurName}>{depanneur.name}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={styles.depanneurMeta}>⭐ {depanneur.rating || '4.8'}</Text>
                <Text style={styles.depanneurMeta}>⏱ {depanneur.eta || 12} min</Text>
                <Text style={styles.depanneurMeta}>{depanneur.distance || '2.1 km'}</Text>
              </View>
            </View>
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>{depanneur.eta || 12} min</Text>
            </View>
          </View>
        )}

        {/* Prix estimé */}
        <Text style={styles.sectionTitle}>Estimation tarifaire</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Déplacement</Text>
            <Text style={styles.priceValue}>{basePrice.toFixed(2)} TND</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Main d'œuvre (estimé)</Text>
            <Text style={styles.priceValue}>{laborPrice.toFixed(2)} TND</Text>
          </View>
          {partPrice > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Pièces (estimé)</Text>
              <Text style={styles.priceValue}>{partPrice.toFixed(2)} TND</Text>
            </View>
          )}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total estimé</Text>
            <Text style={styles.priceTotalValue}>{total.toFixed(2)} TND</Text>
          </View>
          <Text style={styles.priceNote}>⚠️ Prix final fixé après diagnostic sur place par le dépanneur.</Text>
        </View>

        {/* Méthode paiement */}
        <Text style={styles.sectionTitle}>Méthode de paiement</Text>
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.payRow, paymentMethod === m.id && styles.payRowActive]}
            onPress={() => setPaymentMethod(m.id)}
          >
            <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.payLabel, paymentMethod === m.id && { color: '#000' }]}>{m.label}</Text>
              <Text style={[styles.payDesc, paymentMethod === m.id && { color: 'rgba(0,0,0,0.55)' }]}>{m.desc}</Text>
            </View>
            {paymentMethod === m.id && (
              <Text style={{ color: COLORS.red, fontSize: 20 }}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Garanties */}
        <View style={styles.guaranteeBox}>
          <Text style={styles.guaranteeTitle}>🛡️ Garanties EASYWAY SOS</Text>
          {[
            'Dépanneur vérifié et assuré',
            'Prix encadré — pas de surprise',
            'Paiement sécurisé après intervention',
            'Support 24h/24 en cas de litige',
          ].map((g, i) => (
            <Text key={i} style={styles.guaranteeItem}>✓ {g}</Text>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Estimation</Text>
          <Text style={styles.footerTotalValue}>{total.toFixed(2)} TND</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>🚨 Confirmer l'intervention</Text>
          }
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 120 },
  breakdownCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.redPale, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.red, marginBottom: 12,
  },
  breakdownLabel: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  breakdownAddr: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  depanneurCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  depanneurName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  depanneurMeta: { color: COLORS.muted, fontSize: 12 },
  etaBadge: { backgroundColor: COLORS.green, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  etaText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  sectionTitle: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 16, marginBottom: 10,
  },
  priceCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 4,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  priceLabel: { color: COLORS.muted, fontSize: 14 },
  priceValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  priceDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  priceTotalLabel: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  priceTotalValue: { color: COLORS.accent, fontSize: 20, fontWeight: '900' },
  priceNote: { color: COLORS.amber, fontSize: 11, marginTop: 10, lineHeight: 16 },
  payRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  payRowActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  payLabel: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  payDesc: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  guaranteeBox: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12,
    padding: 14, marginTop: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  guaranteeTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  guaranteeItem: { color: COLORS.muted, fontSize: 13, marginBottom: 5, lineHeight: 18 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, padding: 16,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  footerTotal: { alignItems: 'center' },
  footerTotalLabel: { color: COLORS.muted, fontSize: 11 },
  footerTotalValue: { color: COLORS.accent, fontSize: 20, fontWeight: '900' },
  confirmBtn: {
    flex: 1, backgroundColor: COLORS.red, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  confirmBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
