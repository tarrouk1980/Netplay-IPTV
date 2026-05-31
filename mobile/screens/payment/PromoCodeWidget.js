import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import api from '../../services/api';

const COLORS = {
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  accent: '#F5A623',
  success: '#27AE60',
  danger: '#E74C3C',
};

/**
 * PromoCodeWidget — à inclure dans n'importe quel écran de paiement.
 * Props:
 *   serviceType: 'TAXI' | 'SOS' | 'DELIVERY' | 'GROCERY'
 *   amount: number (prix original)
 *   onDiscount: (discountAmount, promoCode) => void
 */
export default function PromoCodeWidget({ serviceType, amount, onDiscount }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null); // { code, discount, label }
  const [error, setError] = useState('');

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/promo/apply', {
        code: trimmed,
        serviceType,
        amount,
      });
      const { discount, label, finalAmount } = res.data;
      setApplied({ code: trimmed, discount, label, finalAmount });
      onDiscount?.(discount, trimmed);
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide ou expiré.');
      setApplied(null);
      onDiscount?.(0, null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    setError('');
    onDiscount?.(0, null);
  };

  if (applied) {
    return (
      <View style={styles.appliedBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.appliedLabel}>Code promo appliqué 🎉</Text>
          <Text style={styles.appliedCode}>{applied.code}</Text>
          <Text style={styles.appliedDesc}>{applied.label}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text style={styles.discountAmount}>-{applied.discount.toFixed(3)} TND</Text>
          <TouchableOpacity onPress={handleRemove}>
            <Text style={styles.removeBtn}>Retirer ✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Code promo</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre code"
          placeholderTextColor={COLORS.textMuted}
          value={code}
          onChangeText={(v) => { setCode(v); setError(''); }}
          autoCapitalize="characters"
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={handleApply}
        />
        <TouchableOpacity
          style={[styles.applyBtn, (!code.trim() || loading) && styles.applyBtnDisabled]}
          onPress={handleApply}
          disabled={!code.trim() || loading}
        >
          {loading
            ? <ActivityIndicator color="#000" size="small" />
            : <Text style={styles.applyBtnText}>Appliquer</Text>
          }
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4 },
  label: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: '#12121C',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
    letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  applyBtnDisabled: { opacity: 0.4 },
  applyBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  error: { color: COLORS.danger, fontSize: 12, marginTop: 6 },
  appliedBox: {
    backgroundColor: COLORS.success + '15',
    borderRadius: 12, padding: 14, marginVertical: 4,
    borderWidth: 1, borderColor: COLORS.success,
    flexDirection: 'row', alignItems: 'center',
  },
  appliedLabel: { color: COLORS.success, fontWeight: '700', fontSize: 13 },
  appliedCode: { color: COLORS.text, fontWeight: '800', fontSize: 16, marginTop: 2, letterSpacing: 1 },
  appliedDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  discountAmount: { color: COLORS.success, fontWeight: '800', fontSize: 16 },
  removeBtn: { color: COLORS.textMuted, fontSize: 12 },
});
