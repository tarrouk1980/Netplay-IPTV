import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const RECENT_CONTACTS = [
  { id: 1, name: 'Sana Ben Ali', phone: '+216 20 123 456', avatar: '👩' },
  { id: 2, name: 'Karim Meddeb', phone: '+216 25 987 654', avatar: '👨' },
  { id: 3, name: 'Amira Trabelsi', phone: '+216 50 111 222', avatar: '👩' },
];

const MOCK_BALANCE = 147.50;

export default function WalletTransferScreen({ navigation, route }) {
  const balance = route.params?.balance ?? MOCK_BALANCE;
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const canProceedStep1 = phone.length >= 8 || recipient;
  const canProceedStep2 = numAmount >= 1 && numAmount <= balance;

  const lookupRecipient = () => {
    if (!phone.trim()) return;
    // Mock lookup
    setRecipient({ name: 'Utilisateur EASYWAY', phone, avatar: '👤', verified: true });
    setStep(2);
  };

  const selectContact = (c) => {
    setPhone(c.phone);
    setRecipient({ name: c.name, phone: c.phone, avatar: c.avatar, verified: true });
    setStep(2);
  };

  const confirmTransfer = async () => {
    if (!canProceedStep2) return;
    try {
      // await api.post('/wallet/transfer', { phone: recipient.phone, amount: numAmount, note });
      setRefId('TRF-' + Math.random().toString(36).slice(2, 8).toUpperCase());
      setDone(true);
    } catch {
      Alert.alert('Erreur', 'Le virement a échoué. Vérifiez le numéro et réessayez.');
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.doneContainer}>
          <View style={styles.doneCircle}><Text style={{ fontSize: 40 }}>✓</Text></View>
          <Text style={styles.doneTitle}>Virement envoyé !</Text>
          <Text style={styles.doneSub}>
            {numAmount.toFixed(2)} TND envoyé à {recipient?.name}
          </Text>
          <View style={styles.doneCard}>
            <View style={styles.doneRow}>
              <Text style={styles.doneLbl}>Destinataire</Text>
              <Text style={styles.doneVal}>{recipient?.name}</Text>
            </View>
            <View style={styles.doneRow}>
              <Text style={styles.doneLbl}>Montant</Text>
              <Text style={[styles.doneVal, { color: COLORS.accent }]}>{numAmount.toFixed(2)} TND</Text>
            </View>
            {note ? (
              <View style={styles.doneRow}>
                <Text style={styles.doneLbl}>Note</Text>
                <Text style={styles.doneVal}>{note}</Text>
              </View>
            ) : null}
            <View style={styles.doneRow}>
              <Text style={styles.doneLbl}>Référence</Text>
              <Text style={[styles.doneVal, { color: COLORS.accent, letterSpacing: 1 }]}>{refId}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Retour au portefeuille</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Envoyer de l'argent</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        {['Destinataire', 'Montant', 'Confirmer'].map((s, i) => {
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <React.Fragment key={s}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, done && styles.stepDone, active && styles.stepActive]}>
                  <Text style={[styles.stepNum, (done || active) && { color: done ? COLORS.white : '#000' }]}>
                    {done ? '✓' : i + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, active && { color: COLORS.white }]}>{s}</Text>
              </View>
              {i < 2 && <View style={[styles.stepConnector, done && { backgroundColor: COLORS.green }]} />}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Balance */}
        <View style={styles.balanceBar}>
          <Text style={styles.balanceLbl}>Solde disponible</Text>
          <Text style={styles.balanceVal}>{balance.toFixed(2)} TND</Text>
        </View>

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>📱 Numéro de téléphone</Text>
            <View style={styles.phoneRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>🇹🇳 +216</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="XX XXX XXX"
                placeholderTextColor={COLORS.muted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            <TouchableOpacity
              style={[styles.lookupBtn, !phone.trim() && styles.lookupBtnDisabled]}
              onPress={lookupRecipient}
              disabled={!phone.trim()}
            >
              <Text style={styles.lookupBtnText}>Rechercher</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>👥 Contacts récents</Text>
            {RECENT_CONTACTS.map((c) => (
              <TouchableOpacity key={c.id} style={styles.contactRow} onPress={() => selectContact(c)}>
                <View style={styles.contactAvatar}>
                  <Text style={{ fontSize: 24 }}>{c.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactPhone}>{c.phone}</Text>
                </View>
                <Text style={{ color: COLORS.accent, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && recipient && (
          <View style={styles.stepContent}>
            {/* Recipient confirmed */}
            <View style={styles.recipientCard}>
              <Text style={styles.recipientAvatar}>{recipient.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.recipientName}>{recipient.name}</Text>
                <Text style={styles.recipientPhone}>{recipient.phone}</Text>
              </View>
              {recipient.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Vérifié</Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>💵 Montant</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={COLORS.muted}
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
              <Text style={styles.amountCurrency}>TND</Text>
            </View>
            <View style={styles.quickRow}>
              {[5, 10, 20, 50].map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.quickChip, parseFloat(amount) === q && styles.quickChipActive]}
                  onPress={() => setAmount(String(q))}
                  disabled={q > balance}
                >
                  <Text style={[styles.quickText, q > balance && { color: COLORS.border }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {numAmount > balance && <Text style={styles.errorNote}>⚠️ Solde insuffisant</Text>}
            {numAmount > 0 && numAmount < 1 && <Text style={styles.errorNote}>⚠️ Minimum 1 TND</Text>}

            <Text style={styles.sectionTitle}>📝 Note (optionnel)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Ex: remboursement restaurant..."
              placeholderTextColor={COLORS.muted}
              value={note}
              onChangeText={setNote}
              maxLength={100}
            />
          </View>
        )}

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step === 1 && (
          <TouchableOpacity
            style={[styles.nextBtn, !canProceedStep1 && styles.nextBtnDisabled]}
            onPress={() => canProceedStep1 && lookupRecipient()}
            disabled={!canProceedStep1}
          >
            <Text style={styles.nextBtnText}>Continuer</Text>
          </TouchableOpacity>
        )}
        {step === 2 && (
          <TouchableOpacity
            style={[styles.nextBtn, !canProceedStep2 && styles.nextBtnDisabled]}
            onPress={confirmTransfer}
            disabled={!canProceedStep2}
          >
            <Text style={styles.nextBtnText}>
              {canProceedStep2 ? `Envoyer ${numAmount.toFixed(2)} TND` : 'Entrez un montant valide'}
            </Text>
          </TouchableOpacity>
        )}
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 20,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDone: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  stepActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  stepNum: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  stepLabel: { color: COLORS.muted, fontSize: 10 },
  stepConnector: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 6, marginBottom: 14 },
  balanceBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 16, backgroundColor: '#0A1A0A',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.green,
  },
  balanceLbl: { color: COLORS.muted, fontSize: 13 },
  balanceVal: { color: COLORS.green, fontSize: 20, fontWeight: '900' },
  stepContent: { paddingHorizontal: 16 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  prefix: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, paddingVertical: 13, justifyContent: 'center',
  },
  prefixText: { color: COLORS.white, fontSize: 13 },
  phoneInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 16, paddingHorizontal: 14, paddingVertical: 12,
  },
  lookupBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 20,
  },
  lookupBtnDisabled: { backgroundColor: COLORS.surface },
  lookupBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  contactAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  contactName: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  contactPhone: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  recipientCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0D2E0D', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.green, marginBottom: 16,
  },
  recipientAvatar: { fontSize: 32 },
  recipientName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  recipientPhone: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  verifiedBadge: {
    backgroundColor: '#0D2E0D', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.green,
  },
  verifiedText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 16, marginBottom: 10,
  },
  amountInput: { flex: 1, color: COLORS.white, fontSize: 30, fontWeight: '800', paddingVertical: 12 },
  amountCurrency: { color: COLORS.muted, fontSize: 16, fontWeight: '600' },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  quickChip: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  quickChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  quickText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  errorNote: { color: COLORS.red, fontSize: 12, marginBottom: 8 },
  noteInput: {
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 14, paddingVertical: 12,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  nextBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: COLORS.surface },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  doneCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#0A1A0A', borderWidth: 3, borderColor: COLORS.green,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  doneTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 10 },
  doneSub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  doneCard: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 32,
  },
  doneRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  doneLbl: { color: COLORS.muted, fontSize: 13 },
  doneVal: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  doneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingHorizontal: 40, paddingVertical: 16,
  },
  doneBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
