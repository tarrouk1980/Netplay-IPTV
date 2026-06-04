import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MY_CODES = [
  { code: 'REFERAL-SAMI5', discount: '5 TND', type: 'cash', used: false, expiry: '30 juin 2025', desc: 'Parrainage · Première course' },
  { code: 'WELCOME10', discount: '10%', type: 'pct', used: false, expiry: '31 déc. 2025', desc: 'Code de bienvenue' },
  { code: 'SUMMER2025', discount: '15%', type: 'pct', used: true, expiry: '15 juin 2025', desc: 'Promo été' },
];

export default function ClientPromoCodesScreen({ navigation }) {
  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [codes, setCodes] = useState(MY_CODES);

  const handleApply = async () => {
    if (!inputCode.trim()) { Alert.alert('Code requis', 'Saisissez un code promo.'); return; }
    setApplying(true);
    await new Promise(r => setTimeout(r, 800));
    const exists = codes.find(c => c.code === inputCode.trim().toUpperCase());
    if (exists) {
      Alert.alert('Déjà ajouté', 'Ce code est déjà dans votre liste.');
    } else {
      const newCode = {
        code: inputCode.trim().toUpperCase(),
        discount: '5 TND', type: 'cash', used: false,
        expiry: '31 déc. 2025', desc: 'Code ajouté manuellement',
      };
      setCodes(prev => [newCode, ...prev]);
      Alert.alert('✅ Code ajouté !', `Le code "${newCode.code}" a été ajouté à votre portefeuille.`);
      setInputCode('');
    }
    setApplying(false);
  };

  const handleCopy = (code) => {
    Clipboard.setString(code);
    Alert.alert('Copié', `"${code}" copié dans le presse-papier.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎟️ Codes promo</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Saisie */}
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Ajouter un code</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="ENTREZ-VOTRE-CODE"
              placeholderTextColor={COLORS.muted}
              value={inputCode}
              onChangeText={v => setInputCode(v.toUpperCase())}
              autoCapitalize="characters"
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.applyBtn, (!inputCode || applying) && { opacity: 0.5 }]}
              onPress={handleApply}
              disabled={!inputCode || applying}
            >
              <Text style={styles.applyBtnText}>{applying ? '...' : '✓'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>MES CODES ({codes.filter(c => !c.used).length} actifs)</Text>

        {codes.map(c => (
          <TouchableOpacity
            key={c.code}
            style={[styles.codeCard, c.used && styles.codeCardUsed]}
            onPress={() => !c.used && handleCopy(c.code)}
            activeOpacity={0.8}
          >
            <View style={styles.codeLeft}>
              <View style={[styles.discountBadge, { backgroundColor: c.used ? COLORS.border : c.type === 'cash' ? COLORS.green + '20' : COLORS.accent + '20' }]}>
                <Text style={[styles.discountText, { color: c.used ? COLORS.muted : c.type === 'cash' ? COLORS.green : COLORS.accent }]}>
                  -{c.discount}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.codeText, c.used && { color: COLORS.muted }]}>{c.code}</Text>
                <Text style={styles.codeDesc}>{c.desc}</Text>
                <Text style={styles.codeExpiry}>Expire le {c.expiry}</Text>
              </View>
            </View>
            {c.used ? (
              <Text style={styles.usedTag}>Utilisé</Text>
            ) : (
              <Text style={styles.copyIcon}>📋</Text>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Les codes promo sont appliqués automatiquement à votre prochaine commande. Appuyez sur un code pour le copier.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  inputCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  inputTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10 },
  codeInput: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, padding: 14,
    color: COLORS.accent, fontSize: 15, fontWeight: '700', letterSpacing: 1,
    borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  applyBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12, width: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { color: '#000', fontSize: 20, fontWeight: '900' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  codeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  codeCardUsed: { opacity: 0.5 },
  codeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  discountBadge: { borderRadius: 10, padding: 10, minWidth: 64, alignItems: 'center' },
  discountText: { fontSize: 14, fontWeight: '900' },
  codeText: { color: COLORS.text, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  codeDesc: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  codeExpiry: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  usedTag: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },
  copyIcon: { fontSize: 20 },
  infoBox: {
    backgroundColor: COLORS.blue + '10', borderRadius: 12, padding: 14, marginTop: 8,
    borderWidth: 1, borderColor: COLORS.blue + '30',
  },
  infoText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
