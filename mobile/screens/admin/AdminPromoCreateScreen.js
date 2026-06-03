import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#D32F2F',
};

const SERVICES = ['TOUS', 'TAXI', 'LIVRAISON', 'SOS', 'EPICERIE', 'PASS'];
const DISCOUNT_TYPES = [
  { key: 'percent', label: '% Pourcentage' },
  { key: 'fixed',   label: 'TND Montant fixe' },
  { key: 'free_delivery', label: '🚚 Livraison gratuite' },
];

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function AdminPromoCreateScreen({ navigation }) {
  const [code, setCode]               = useState(generateCode());
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [service, setService]         = useState('TOUS');
  const [maxUses, setMaxUses]         = useState('');
  const [minOrder, setMinOrder]       = useState('');
  const [expiryDate, setExpiryDate]   = useState('');
  const [isActive, setIsActive]       = useState(true);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const canSave = code.trim().length >= 4 && (discountType === 'free_delivery' || discountValue);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/admin/promo-codes', {
        code: code.trim().toUpperCase(),
        discountType, discountValue: parseFloat(discountValue) || 0,
        service, maxUses: maxUses ? parseInt(maxUses) : null,
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        expiryDate: expiryDate || null,
        isActive, description,
      });
      Alert.alert('✅ Code créé !', `Le code "${code.toUpperCase()}" est prêt.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le code. Peut-être déjà existant ?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>➕ Nouveau code promo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Code */}
        <Text style={styles.label}>Code promo *</Text>
        <View style={styles.codeRow}>
          <TextInput
            style={[styles.input, { flex: 1, letterSpacing: 3, fontSize: 18, fontWeight: '900', color: COLORS.accent }]}
            value={code} onChangeText={v => setCode(v.toUpperCase())}
            autoCapitalize="characters" maxLength={16}
          />
          <TouchableOpacity style={styles.genBtn} onPress={() => setCode(generateCode())}>
            <Text style={styles.genBtnText}>🎲 Générer</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Ex : -20% pour les nouveaux utilisateurs" placeholderTextColor={COLORS.muted} maxLength={100} />

        {/* Discount type */}
        <Text style={styles.label}>Type de remise *</Text>
        {DISCOUNT_TYPES.map(t => (
          <TouchableOpacity key={t.key} style={[styles.optionRow, discountType === t.key && styles.optionRowActive]} onPress={() => setDiscountType(t.key)}>
            <View style={[styles.radio, discountType === t.key && styles.radioActive]}>
              {discountType === t.key && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.optionText, discountType === t.key && { color: COLORS.white }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}

        {discountType !== 'free_delivery' && (
          <>
            <Text style={styles.label}>Valeur {discountType === 'percent' ? '(%)' : '(TND)'} *</Text>
            <TextInput style={styles.input} value={discountValue} onChangeText={setDiscountValue} placeholder={discountType === 'percent' ? 'Ex : 20' : 'Ex : 5.000'} placeholderTextColor={COLORS.muted} keyboardType="decimal-pad" />
          </>
        )}

        {/* Service */}
        <Text style={styles.label}>Service applicable</Text>
        <View style={styles.serviceGrid}>
          {SERVICES.map(s => (
            <TouchableOpacity key={s} style={[styles.serviceBtn, service === s && styles.serviceBtnActive]} onPress={() => setService(s)}>
              <Text style={[styles.serviceText, service === s && { color: '#000' }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Min order */}
        <Text style={styles.label}>Commande minimum (TND)</Text>
        <TextInput style={styles.input} value={minOrder} onChangeText={setMinOrder} placeholder="0 = pas de minimum" placeholderTextColor={COLORS.muted} keyboardType="decimal-pad" />

        {/* Max uses */}
        <Text style={styles.label}>Nombre d'utilisations maximum</Text>
        <TextInput style={styles.input} value={maxUses} onChangeText={setMaxUses} placeholder="Vide = illimité" placeholderTextColor={COLORS.muted} keyboardType="number-pad" />

        {/* Expiry */}
        <Text style={styles.label}>Date d'expiration (JJ/MM/AAAA)</Text>
        <TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} placeholder="Ex : 31/01/2025" placeholderTextColor={COLORS.muted} maxLength={10} />

        {/* Active */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Code actif immédiatement</Text>
          <Switch value={isActive} onValueChange={setIsActive} trackColor={{ false: COLORS.border, true: COLORS.green }} thumbColor={isActive ? COLORS.white : COLORS.muted} />
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Aperçu</Text>
          <Text style={styles.previewCode}>{code || '—'}</Text>
          <Text style={styles.previewDesc}>
            {discountType === 'percent' ? `-${discountValue || '?'}%` : discountType === 'fixed' ? `-${discountValue || '?'} TND` : '🚚 Livraison gratuite'}
            {' · '}{service}
            {minOrder ? ` · Min. ${minOrder} TND` : ''}
          </Text>
        </View>

        <TouchableOpacity style={[styles.saveBtn, !canSave && { opacity: 0.4 }]} onPress={handleCreate} disabled={!canSave || submitting}>
          {submitting ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.saveBtnText}>Créer le code promo</Text>}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16 },
  label: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.white, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  codeRow: { flexDirection: 'row', gap: 10 },
  genBtn: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, justifyContent: 'center' },
  genBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 13, marginBottom: 8 },
  optionRowActive: { borderColor: COLORS.accent, backgroundColor: '#1A1200' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.accent },
  optionText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  serviceBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  serviceText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, paddingVertical: 14, marginTop: 14 },
  switchLabel: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  preview: { backgroundColor: '#1A1200', borderRadius: 12, borderWidth: 1, borderColor: COLORS.accent + '66', padding: 16, alignItems: 'center', marginTop: 16 },
  previewTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  previewCode: { color: COLORS.accent, fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 6 },
  previewDesc: { color: COLORS.muted, fontSize: 13 },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
