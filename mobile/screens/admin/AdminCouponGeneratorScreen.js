import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#D32F2F', accentLight: '#FF5252', white: '#FFFFFF',
  muted: '#8A8A9A', border: '#2A2A3A', green: '#2E7D32',
  amber: '#F57C00', blue: '#1565C0',
};

const SERVICES = ['TOUS', 'TAXI', 'SOS', 'DELIVERY', 'GROCERY'];
const DISCOUNT_TYPES = ['PERCENT', 'FIXED'];

function Label({ text }) {
  return <Text style={styles.label}>{text}</Text>;
}

function ChipGroup({ options, selected, onSelect, multi = false }) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => {
        const active = multi ? selected.includes(o) : selected === o;
        return (
          <TouchableOpacity
            key={o}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => {
              if (multi) {
                onSelect(
                  selected.includes(o)
                    ? selected.filter((s) => s !== o)
                    : [...selected, o]
                );
              } else {
                onSelect(o);
              }
            }}
          >
            <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function GeneratedCodeRow({ code, onCopy }) {
  return (
    <TouchableOpacity style={styles.codeRow} onPress={() => onCopy(code)} activeOpacity={0.7}>
      <Text style={styles.codeText}>{code}</Text>
      <Text style={styles.codeCopy}>copier</Text>
    </TouchableOpacity>
  );
}

function generateCode(prefix, length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return prefix ? `${prefix}-${s}` : s;
}

export default function AdminCouponGeneratorScreen({ navigation }) {
  const [prefix, setPrefix] = useState('EASY');
  const [count, setCount] = useState('10');
  const [discountType, setDiscountType] = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState('15');
  const [maxUses, setMaxUses] = useState('1');
  const [services, setServices] = useState(['TOUS']);
  const [expiryDays, setExpiryDays] = useState('30');
  const [minOrder, setMinOrder] = useState('');
  const [singleUse, setSingleUse] = useState(true);
  const [codes, setCodes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = () => {
    const n = Math.min(parseInt(count, 10) || 1, 200);
    const generated = Array.from({ length: n }, () => generateCode(prefix.trim().toUpperCase()));
    setCodes(generated);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!codes.length) { Alert.alert('Générez d\'abord des codes.'); return; }
    setSaving(true);
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (parseInt(expiryDays, 10) || 30));
      await api.post('/api/admin/promo-codes/bulk', {
        codes,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        maxUses: singleUse ? 1 : (parseInt(maxUses, 10) || 1),
        services: services.includes('TOUS') ? [] : services,
        expiresAt: expiry.toISOString(),
        minOrderAmount: parseFloat(minOrder) || null,
      });
      setSaved(true);
      Alert.alert('✅ Enregistré', `${codes.length} codes enregistrés en base.`);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer les codes.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = async () => {
    if (!codes.length) { Alert.alert('Générez d\'abord des codes.'); return; }
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (parseInt(expiryDays, 10) || 30));
    const header = 'code,discountType,discountValue,maxUses,services,expiresAt,minOrder\n';
    const rows = codes
      .map((c) =>
        `${c},${discountType},${discountValue},${singleUse ? 1 : maxUses},${services.join('|')},${expiry.toISOString().slice(0, 10)},${minOrder || ''}`
      )
      .join('\n');
    const csv = header + rows;
    const path = FileSystem.documentDirectory + `codes_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Exporter les codes promo' });
  };

  const handleCopy = (code) => {
    Alert.alert('Copié', code);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Générateur de codes promo</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Config section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>

          <Label text="Préfixe du code" />
          <TextInput
            style={styles.input}
            value={prefix}
            onChangeText={(t) => setPrefix(t.replace(/[^A-Za-z0-9]/g, '').slice(0, 8))}
            placeholder="EASY"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="characters"
          />

          <Label text="Nombre de codes (max 200)" />
          <TextInput
            style={styles.input}
            value={count}
            onChangeText={setCount}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor={COLORS.muted}
          />

          <Label text="Type de remise" />
          <ChipGroup options={DISCOUNT_TYPES} selected={discountType} onSelect={setDiscountType} />

          <Label text={discountType === 'PERCENT' ? 'Remise (%)' : 'Remise (TND)'} />
          <TextInput
            style={styles.input}
            value={discountValue}
            onChangeText={setDiscountValue}
            keyboardType="decimal-pad"
            placeholder={discountType === 'PERCENT' ? '15' : '5'}
            placeholderTextColor={COLORS.muted}
          />

          <Label text="Services ciblés" />
          <ChipGroup options={SERVICES} selected={services} onSelect={setServices} multi />

          <Label text="Validité (jours)" />
          <TextInput
            style={styles.input}
            value={expiryDays}
            onChangeText={setExpiryDays}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor={COLORS.muted}
          />

          <Label text="Commande minimum (TND, optionnel)" />
          <TextInput
            style={styles.input}
            value={minOrder}
            onChangeText={setMinOrder}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={COLORS.muted}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Usage unique par utilisateur</Text>
            <Switch
              value={singleUse}
              onValueChange={setSingleUse}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.white}
            />
          </View>

          {!singleUse && (
            <>
              <Label text="Utilisations max par code" />
              <TextInput
                style={styles.input}
                value={maxUses}
                onChangeText={setMaxUses}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={COLORS.muted}
              />
            </>
          )}
        </View>

        {/* Generate button */}
        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.85}>
          <Text style={styles.generateBtnText}>🎲 Générer {count || '?'} codes</Text>
        </TouchableOpacity>

        {/* Preview */}
        {codes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.previewHeader}>
              <Text style={styles.sectionTitle}>{codes.length} codes générés</Text>
              <View style={[styles.discountBadge, discountType === 'PERCENT' ? styles.badgeBlue : styles.badgeGreen]}>
                <Text style={styles.discountBadgeText}>
                  -{discountValue}{discountType === 'PERCENT' ? '%' : ' TND'}
                </Text>
              </View>
            </View>

            {/* Preview first 20 */}
            {codes.slice(0, 20).map((c, i) => (
              <GeneratedCodeRow key={i} code={c} onCopy={handleCopy} />
            ))}
            {codes.length > 20 && (
              <Text style={styles.moreText}>+ {codes.length - 20} autres codes…</Text>
            )}

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { flex: 1, marginRight: 6 }]}
                onPress={handleExportCSV}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>📥 Exporter CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { flex: 1, marginLeft: 6, backgroundColor: saved ? COLORS.green : COLORS.accent }]}
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.actionBtnText}>{saved ? '✅ Enregistré' : '💾 Enregistrer'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Summary info */}
        {codes.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Récapitulatif</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Codes générés</Text>
              <Text style={styles.summaryValue}>{codes.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remise</Text>
              <Text style={styles.summaryValue}>
                {discountValue}{discountType === 'PERCENT' ? '%' : ' TND'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Services</Text>
              <Text style={styles.summaryValue}>{services.join(', ')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expire dans</Text>
              <Text style={styles.summaryValue}>{expiryDays} jours</Text>
            </View>
            {minOrder ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Commande min.</Text>
                <Text style={styles.summaryValue}>{minOrder} TND</Text>
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Usage max</Text>
              <Text style={styles.summaryValue}>{singleUse ? '1 / utilisateur' : maxUses + ' / code'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  section: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  label: { color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceAlt,
  },
  chipActive: { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent },
  chipTxt: { color: COLORS.muted, fontSize: 13 },
  chipTxtActive: { color: COLORS.accentLight, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  switchLabel: { color: COLORS.white, fontSize: 14 },
  generateBtn: {
    backgroundColor: COLORS.accent, marginHorizontal: 16, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  generateBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  discountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeBlue: { backgroundColor: COLORS.blue + '33', borderWidth: 1, borderColor: COLORS.blue },
  badgeGreen: { backgroundColor: COLORS.green + '33', borderWidth: 1, borderColor: COLORS.green },
  discountBadgeText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  codeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  codeText: { color: COLORS.white, fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 },
  codeCopy: { color: COLORS.muted, fontSize: 12 },
  moreText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 8 },
  actionRow: { flexDirection: 'row', marginTop: 12 },
  actionBtn: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  actionBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  summaryCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryTitle: { color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryValue: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});
