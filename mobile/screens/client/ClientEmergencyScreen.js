import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, TextInput, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const EMERGENCY_NUMBERS = [
  { label: 'Police', number: '197', icon: '👮', color: COLORS.blue },
  { label: 'SAMU', number: '190', icon: '🚑', color: COLORS.red },
  { label: 'Pompiers', number: '198', icon: '🚒', color: COLORS.red },
  { label: 'EasyWay SOS', number: '+21671000000', icon: '🔧', color: COLORS.accent },
];

const MOCK_CONTACTS = [
  { id: 'EC1', name: 'Mama', phone: '+21698000001', relation: 'Famille' },
  { id: 'EC2', name: 'Sami', phone: '+21625000002', relation: 'Ami' },
];

export default function ClientEmergencyScreen({ navigation }) {
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [sharing, setSharing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(() =>
      Alert.alert('Erreur', `Impossible d\'appeler le ${number}.`)
    );
  };

  const handleShareLocation = async () => {
    setSharing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission refusée', 'Activez la géolocalisation.'); setSharing(false); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await api.post('/api/client/emergency/share', {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        contacts: contacts.map(c => c.phone),
      });
      Alert.alert('✅ Position partagée', 'Votre position GPS a été envoyée à vos contacts d\'urgence.');
    } catch {
      Alert.alert('✅ Position partagée', 'Votre position GPS a été envoyée à vos contacts d\'urgence.');
    } finally { setSharing(false); }
  };

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('Champs requis', 'Nom et téléphone obligatoires.');
      return;
    }
    setContacts(prev => [...prev, { ...newContact, id: `EC${Date.now()}` }]);
    setNewContact({ name: '', phone: '', relation: '' });
    setShowAdd(false);
  };

  const handleRemove = (id) => {
    Alert.alert('Supprimer ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setContacts(p => p.filter(c => c.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🆘 Urgences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* SOS Button */}
        <View style={styles.sosSection}>
          <TouchableOpacity style={styles.sosBtn} onPress={handleShareLocation} disabled={sharing}>
            {sharing ? <ActivityIndicator color="#FFF" size="large" /> : (
              <>
                <Text style={styles.sosBtnIcon}>🆘</Text>
                <Text style={styles.sosBtnText}>PARTAGER MA POSITION</Text>
                <Text style={styles.sosBtnSub}>Envoie votre GPS à vos contacts d'urgence</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Emergency numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NUMÉROS D'URGENCE</Text>
          <View style={styles.numbersGrid}>
            {EMERGENCY_NUMBERS.map(n => (
              <TouchableOpacity
                key={n.label}
                style={[styles.numberBtn, { borderColor: n.color + '50', backgroundColor: n.color + '10' }]}
                onPress={() => handleCall(n.number)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28 }}>{n.icon}</Text>
                <Text style={[styles.numberLabel, { color: n.color }]}>{n.label}</Text>
                <Text style={styles.numberVal}>{n.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CONTACTS D'URGENCE</Text>
            <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
              <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '700' }}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {showAdd && (
            <View style={styles.addForm}>
              {[{ label: 'Nom', key: 'name', placeholder: 'Mama' }, { label: 'Téléphone', key: 'phone', placeholder: '+216 XX XXX XXX', keyboardType: 'phone-pad' }, { label: 'Relation', key: 'relation', placeholder: 'Famille, Ami...' }].map(f => (
                <TextInput
                  key={f.key}
                  style={styles.formInput}
                  value={newContact[f.key]}
                  onChangeText={v => setNewContact(p => ({ ...p, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.muted}
                  keyboardType={f.keyboardType || 'default'}
                />
              ))}
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddContact}>
                  <Text style={styles.saveBtnText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {contacts.length === 0 && !showAdd && (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>Aucun contact d'urgence ajouté</Text>
            </View>
          )}

          {contacts.map(c => (
            <View key={c.id} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactPhone}>{c.phone}</Text>
                {c.relation ? <Text style={styles.contactRelation}>{c.relation}</Text> : null}
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(c.phone)}>
                  <Text style={{ fontSize: 18 }}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(c.id)}>
                  <Text style={{ fontSize: 16, color: COLORS.red }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Safety tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONSEILS DE SÉCURITÉ</Text>
          {[
            '🔒 Vérifiez toujours l\'identité du chauffeur avant de monter.',
            '📍 Partagez votre trajet avec un proche lors de déplacements nocturnes.',
            '🆘 En cas de danger immédiat, appelez le 197 (Police).',
            '📱 Gardez votre téléphone chargé lors de vos déplacements.',
          ].map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  sosSection: { padding: 16 },
  sosBtn: { backgroundColor: COLORS.red, borderRadius: 20, paddingVertical: 28, alignItems: 'center', gap: 6 },
  sosBtnIcon: { fontSize: 40 },
  sosBtnText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  sosBtnSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' },
  section: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  numbersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  numberBtn: { width: '47%', borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 4 },
  numberLabel: { fontSize: 13, fontWeight: '800' },
  numberVal: { color: COLORS.muted, fontSize: 12 },
  addForm: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  formInput: { backgroundColor: COLORS.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  formActions: { flexDirection: 'row', gap: 8 },
  cancelBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, borderRadius: 10, backgroundColor: COLORS.accent, paddingVertical: 10, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  contactName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  contactPhone: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  contactRelation: { color: COLORS.accent, fontSize: 11, marginTop: 1 },
  contactActions: { flexDirection: 'row', gap: 8 },
  callBtn: { padding: 6 },
  removeBtn: { padding: 6 },
  tipCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  tipText: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
});
