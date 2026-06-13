import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../lib/api';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', APPROVED: 'Approuvé', PAID: 'Payé', REJECTED: 'Rejeté',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', APPROVED: '#3b82f6', PAID: '#22c55e', REJECTED: '#f43f5e',
};

export default function SellerPayoutsScreen() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: '', bankName: '', rib: '', accountHolder: '' });
  const [showForm, setShowForm] = useState(false);

  useFocusEffect(useCallback(() => {
    api.get('/payouts/my')
      .then(r => setPayouts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const submit = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { Alert.alert('Erreur', 'Montant invalide.'); return; }
    if (!form.rib || !form.bankName || !form.accountHolder) { Alert.alert('Erreur', 'Remplissez tous les champs.'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/payouts', {
        amount,
        bankInfo: { bankName: form.bankName, rib: form.rib, accountHolder: form.accountHolder },
      });
      setPayouts(prev => [res.data.data, ...prev]);
      setForm({ amount: '', bankName: '', rib: '', accountHolder: '' });
      setShowForm(false);
      Alert.alert('✅ Succès', 'Demande de virement soumise !');
    } catch {
      Alert.alert('Erreur', 'Impossible de soumettre la demande.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.title}>💸 Demandes de virement</Text>

        {/* Toggle form button */}
        <TouchableOpacity style={s.newBtn} onPress={() => setShowForm(v => !v)}>
          <Text style={s.newBtnText}>{showForm ? '✕ Annuler' : '+ Nouvelle demande'}</Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>Informations de virement</Text>
            {[
              { key: 'amount', label: 'Montant (TND)', placeholder: '500.00', keyboardType: 'numeric' as const },
              { key: 'bankName', label: 'Banque', placeholder: 'STB, BNA, Attijari...', keyboardType: 'default' as const },
              { key: 'rib', label: 'RIB', placeholder: '20-018-0000000000-00', keyboardType: 'default' as const },
              { key: 'accountHolder', label: 'Titulaire', placeholder: 'Nom complet', keyboardType: 'default' as const },
            ].map(field => (
              <View key={field.key} style={{ marginBottom: 12 }}>
                <Text style={s.label}>{field.label}</Text>
                <TextInput
                  value={(form as any)[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder={field.placeholder}
                  keyboardType={field.keyboardType}
                  style={s.input}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            ))}
            <TouchableOpacity style={s.submitBtn} onPress={submit} disabled={submitting}>
              <Text style={s.submitBtnText}>{submitting ? 'Envoi...' : 'Soumettre la demande'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* History */}
        <Text style={s.sectionTitle}>Historique</Text>
        {loading ? (
          <ActivityIndicator color="#9f1239" style={{ marginTop: 20 }} />
        ) : payouts.length === 0 ? (
          <Text style={s.empty}>Aucune demande pour l&apos;instant</Text>
        ) : (
          payouts.map(p => (
            <View key={p.id} style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.amount}>{Number(p.amount).toFixed(2)} TND</Text>
                <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[p.status] + '22' }]}>
                  <Text style={[s.statusText, { color: STATUS_COLORS[p.status] }]}>{STATUS_LABELS[p.status] || p.status}</Text>
                </View>
              </View>
              <Text style={s.bankInfo}>🏦 {p.bankInfo?.bankName} — {p.bankInfo?.rib}</Text>
              {p.adminNote && <Text style={s.note}>Note : {p.adminNote}</Text>}
              <Text style={s.date}>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  newBtn: { backgroundColor: '#9f1239', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
  newBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  formTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a', backgroundColor: '#fff' },
  submitBtn: { backgroundColor: '#9f1239', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  empty: { color: '#94a3b8', textAlign: 'center', paddingVertical: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  amount: { fontSize: 18, fontWeight: '900', color: '#9f1239' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '900' },
  bankInfo: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  note: { fontSize: 11, color: '#3b82f6', fontStyle: 'italic', marginBottom: 4 },
  date: { fontSize: 11, color: '#94a3b8' },
});
