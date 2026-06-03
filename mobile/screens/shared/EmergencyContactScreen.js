import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', red: '#E74C3C', redDark: '#922B21',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', blue: '#3498DB',
};

const RELATIONS = ['Famille', 'Ami(e)', 'Collègue', 'Médecin', 'Autre'];

const MOCK_CONTACTS = [
  { id: 1, name: 'Sana Ben Ali', phone: '+216 20 123 456', relation: 'Famille', notify: true },
  { id: 2, name: 'Dr. Karim Meddeb', phone: '+216 71 234 567', relation: 'Médecin', notify: false },
];

export default function EmergencyContactScreen({ navigation }) {
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', relation: 'Famille', notify: true });

  const openEdit = (contact) => {
    setForm({ name: contact.name, phone: contact.phone, relation: contact.relation, notify: contact.notify });
    setEditId(contact.id);
    setShowForm(true);
  };

  const openAdd = () => {
    setForm({ name: '', phone: '', relation: 'Famille', notify: true });
    setEditId(null);
    setShowForm(true);
  };

  const saveContact = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Champs requis', 'Nom et numéro de téléphone obligatoires.');
      return;
    }
    try {
      if (editId) {
        setContacts(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
      } else {
        setContacts(prev => [...prev, { id: Date.now(), ...form }]);
      }
      // await api.post('/profile/emergency-contacts', { ...form, id: editId });
    } catch {}
    setShowForm(false);
  };

  const deleteContact = (id) => {
    Alert.alert('Supprimer', 'Supprimer ce contact d\'urgence ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setContacts(prev => prev.filter(c => c.id !== id)) },
    ]);
  };

  const callContact = (phone) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts d'urgence</Text>
        <TouchableOpacity onPress={openAdd}>
          <Text style={{ color: COLORS.accent, fontSize: 22, fontWeight: '700' }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoEmoji}>🆘</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Contacts SOS</Text>
            <Text style={styles.infoDesc}>Ces personnes seront alertées automatiquement si vous appuyez sur le bouton SOS pendant un trajet.</Text>
          </View>
        </View>

        {/* Contacts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes contacts ({contacts.length}/3)</Text>
          {contacts.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>👤</Text>
              <Text style={styles.emptyText}>Aucun contact d'urgence</Text>
              <TouchableOpacity style={styles.addFirstBtn} onPress={openAdd}>
                <Text style={styles.addFirstBtnText}>+ Ajouter un contact</Text>
              </TouchableOpacity>
            </View>
          )}
          {contacts.map((c) => (
            <View key={c.id} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <View style={[styles.relationBadge, { backgroundColor: c.relation === 'Médecin' ? '#08141A' : '#1A0A0A' }]}>
                    <Text style={[styles.relationText, { color: c.relation === 'Médecin' ? COLORS.blue : COLORS.red }]}>
                      {c.relation}
                    </Text>
                  </View>
                </View>
                <Text style={styles.contactPhone}>{c.phone}</Text>
                <View style={styles.notifyRow}>
                  <View style={[styles.notifyDot, { backgroundColor: c.notify ? COLORS.green : COLORS.muted }]} />
                  <Text style={styles.notifyText}>
                    {c.notify ? 'Alerté en cas de SOS' : 'Alertes désactivées'}
                  </Text>
                </View>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => callContact(c.phone)}>
                  <Text style={{ fontSize: 16 }}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(c)}>
                  <Text style={{ fontSize: 16 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnRed} onPress={() => deleteContact(c.id)}>
                  <Text style={{ fontSize: 16 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Official Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Numéros d'urgence officiels</Text>
          {[
            { label: 'Police secours', number: '197', icon: '🚔' },
            { label: 'SAMU', number: '190', icon: '🚑' },
            { label: 'Pompiers', number: '198', icon: '🚒' },
            { label: 'Garde nationale', number: '193', icon: '🛡️' },
          ].map((e) => (
            <TouchableOpacity
              key={e.number}
              style={styles.emergencyRow}
              onPress={() => Linking.openURL(`tel:${e.number}`)}
            >
              <Text style={styles.emergencyIcon}>{e.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyLabel}>{e.label}</Text>
              </View>
              <View style={styles.emergencyNumberBadge}>
                <Text style={styles.emergencyNumber}>{e.number}</Text>
              </View>
              <Text style={{ color: COLORS.accent, fontSize: 16, marginLeft: 8 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editId ? 'Modifier le contact' : 'Nouveau contact'}</Text>
            <Text style={styles.formLabel}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Sana Ben Ali"
              placeholderTextColor={COLORS.muted}
              value={form.name}
              onChangeText={(v) => setForm(p => ({ ...p, name: v }))}
            />
            <Text style={styles.formLabel}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+216 XX XXX XXX"
              placeholderTextColor={COLORS.muted}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => setForm(p => ({ ...p, phone: v }))}
            />
            <Text style={styles.formLabel}>Relation</Text>
            <View style={styles.relationsRow}>
              {RELATIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.relationChip, form.relation === r && styles.relationChipActive]}
                  onPress={() => setForm(p => ({ ...p, relation: r }))}
                >
                  <Text style={[styles.relationChipText, form.relation === r && { color: '#000' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.notifyToggle}
              onPress={() => setForm(p => ({ ...p, notify: !p.notify }))}
            >
              <Text style={styles.notifyToggleLabel}>🔔 Alerter lors d'un SOS</Text>
              <View style={[styles.toggle, form.notify && styles.toggleOn]}>
                <View style={[styles.toggleThumb, form.notify && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveContact}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
  infoBanner: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    margin: 16, backgroundColor: '#1A0A0A', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.red,
  },
  infoEmoji: { fontSize: 32 },
  infoTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  infoDesc: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.muted, fontSize: 14, marginBottom: 16 },
  addFirstBtn: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  addFirstBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  contactAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.border,
  },
  contactHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  contactName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  relationBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  relationText: { fontSize: 10, fontWeight: '700' },
  contactPhone: { color: COLORS.muted, fontSize: 12 },
  notifyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  notifyDot: { width: 7, height: 7, borderRadius: 4 },
  notifyText: { color: COLORS.muted, fontSize: 11 },
  contactActions: { flexDirection: 'column', gap: 6 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  actionBtnRed: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#1A0808', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.red,
  },
  emergencyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 10,
    padding: 14, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  emergencyIcon: { fontSize: 22 },
  emergencyLabel: { color: COLORS.white, fontSize: 14 },
  emergencyNumberBadge: {
    backgroundColor: '#1A0A0A', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.red,
  },
  emergencyNumber: { color: COLORS.red, fontSize: 15, fontWeight: '900' },
  formCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 18, borderWidth: 1, borderColor: COLORS.border,
  },
  formTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  formLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 14, paddingVertical: 12,
  },
  relationsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  relationChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border,
  },
  relationChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  relationChipText: { color: COLORS.white, fontSize: 12 },
  notifyToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, paddingVertical: 8,
  },
  notifyToggleLabel: { color: COLORS.white, fontSize: 14 },
  toggle: {
    width: 46, height: 26, borderRadius: 13,
    backgroundColor: COLORS.border, padding: 2, justifyContent: 'center',
  },
  toggleOn: { backgroundColor: COLORS.green },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  saveBtn: {
    flex: 2, paddingVertical: 13, borderRadius: 12,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
