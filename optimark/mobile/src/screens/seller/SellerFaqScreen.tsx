import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  Alert, StyleSheet, Modal, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api';

export default function SellerFaqScreen() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/store-faq/my')
      .then(r => setFaqs(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const openCreate = () => {
    setEditingId(null);
    setForm({ question: '', answer: '' });
    setShowModal(true);
  };

  const openEdit = (faq: any) => {
    setEditingId(faq.id);
    setForm({ question: faq.question, answer: faq.answer });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.patch(`/store-faq/${editingId}`, form);
        setFaqs(prev => prev.map(f => f.id === editingId ? res.data.data : f));
      } else {
        const res = await api.post('/store-faq', form);
        setFaqs(prev => [...prev, res.data.data]);
      }
      setShowModal(false);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.message || 'Impossible de sauvegarder.');
    } finally { setSaving(false); }
  };

  const remove = (id: string) => {
    Alert.alert('Supprimer', 'Supprimer cette FAQ ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await api.delete(`/store-faq/${id}`).catch(() => {});
        setFaqs(prev => prev.filter(f => f.id !== id));
      }},
    ]);
  };

  if (loading) return <ActivityIndicator color="#9f1239" size="large" style={{ flex: 1, marginTop: 80 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <FlatList
        data={faqs}
        keyExtractor={f => f.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 80 }}
        ListHeaderComponent={
          <TouchableOpacity style={s.createBtn} onPress={openCreate}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>+ Nouvelle FAQ</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40 }}>❓</Text>
            <Text style={{ color: '#64748b', fontWeight: '600', marginTop: 12 }}>Aucune FAQ</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 6, textAlign: 'center' }}>Ajoutez des Q&A pour rassurer vos clients.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <View style={s.numBadge}><Text style={s.numText}>{index + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.question}>{item.question}</Text>
                <Text style={s.answer} numberOfLines={2}>{item.answer}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity onPress={() => openEdit(item)} style={s.editBtn}>
                  <Text style={{ color: '#9f1239', fontSize: 14 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item.id)} style={s.editBtn}>
                  <Text style={{ color: '#ef4444', fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>{editingId ? 'Modifier la FAQ' : 'Nouvelle FAQ'}</Text>
            <Text style={s.modalLabel}>Question *</Text>
            <TextInput
              style={s.input}
              value={form.question}
              onChangeText={v => setForm(f => ({ ...f, question: v }))}
              placeholder="Ex: Faites-vous la livraison express ?"
              placeholderTextColor="#94a3b8"
            />
            <Text style={s.modalLabel}>Réponse *</Text>
            <TextInput
              style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={form.answer}
              onChangeText={v => setForm(f => ({ ...f, answer: v }))}
              placeholder="Oui, nous livrons en 24h..."
              placeholderTextColor="#94a3b8"
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#f1f5f9', flex: 1 }]} onPress={() => setShowModal(false)}>
                <Text style={{ color: '#64748b', fontWeight: '700' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: '#9f1239', flex: 2 }, (saving || !form.question.trim() || !form.answer.trim()) && { opacity: 0.5 }]}
                onPress={save}
                disabled={saving || !form.question.trim() || !form.answer.trim()}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>{saving ? 'Sauvegarde...' : editingId ? 'Mettre à jour' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  createBtn: { backgroundColor: '#9f1239', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  numBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff5f7', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  numText: { fontSize: 11, fontWeight: '800', color: '#9f1239' },
  question: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  answer: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  editBtn: { padding: 6, borderRadius: 8, backgroundColor: '#f8fafc' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
  modalLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  modalBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
});
