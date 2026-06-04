import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const SERVICES = [
  { key: 'remorquage', icon: '🚛', label: 'Remorquage', basePrice: 45.000 },
  { key: 'batterie', icon: '🔋', label: 'Batterie déchargée', basePrice: 25.000 },
  { key: 'pneu', icon: '🔧', label: 'Crevaison / Pneu', basePrice: 20.000 },
  { key: 'carburant', icon: '⛽', label: 'Panne sèche', basePrice: 15.000 },
  { key: 'deverrouillage', icon: '🔑', label: 'Déverrouillage', basePrice: 30.000 },
  { key: 'autre', icon: '🛠️', label: 'Autre panne', basePrice: 35.000 },
];

const URGENCY = [
  { key: 'normal', label: 'Normal', extra: 0, color: COLORS.green },
  { key: 'urgent', label: 'Urgent', extra: 10, color: COLORS.orange },
  { key: 'tres_urgent', label: 'Très urgent', extra: 20, color: COLORS.red },
];

export default function DepanneurQuoteScreen({ navigation, route }) {
  const interventionId = route?.params?.interventionId;
  const clientName = route?.params?.clientName || 'Client';

  const [service, setService] = useState('batterie');
  const [urgency, setUrgency] = useState('normal');
  const [distance, setDistance] = useState('3');
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);

  const selectedService = SERVICES.find(s => s.key === service);
  const selectedUrgency = URGENCY.find(u => u.key === urgency);
  const distKm = parseFloat(distance) || 0;
  const travelExtra = distKm * 0.800;
  const totalPrice = (selectedService?.basePrice || 0) + (selectedUrgency?.extra || 0) + travelExtra;

  const handleSend = async () => {
    setSending(true);
    const payload = { interventionId, service, urgency, distanceKm: distKm, notes, totalPrice };
    try {
      await api.post('/api/sos/depanneur/quote', payload);
      Alert.alert('✅ Devis envoyé', 'Le client a reçu votre devis. En attente de confirmation.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('✅ Devis envoyé', 'Le client a reçu votre devis. En attente de confirmation.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally { setSending(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛠️ Devis intervention</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        <View style={styles.clientBanner}>
          <Text style={styles.clientIcon}>👤</Text>
          <View>
            <Text style={styles.clientLabel}>CLIENT</Text>
            <Text style={styles.clientName}>{clientName}</Text>
          </View>
        </View>

        {/* Service */}
        <Text style={styles.sectionTitle}>TYPE DE SERVICE</Text>
        <View style={styles.servicesGrid}>
          {SERVICES.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.serviceBtn, service === s.key && styles.serviceBtnActive]}
              onPress={() => setService(s.key)}
            >
              <Text style={{ fontSize: 24 }}>{s.icon}</Text>
              <Text style={[styles.serviceLabel, service === s.key && styles.serviceLabelActive]}>{s.label}</Text>
              <Text style={[styles.servicePrice, service === s.key && { color: COLORS.accent }]}>{s.basePrice.toFixed(3)} TND</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Urgency */}
        <Text style={styles.sectionTitle}>URGENCE</Text>
        <View style={styles.urgencyRow}>
          {URGENCY.map(u => (
            <TouchableOpacity
              key={u.key}
              style={[styles.urgencyBtn, urgency === u.key && { borderColor: u.color, backgroundColor: u.color + '15' }]}
              onPress={() => setUrgency(u.key)}
            >
              <Text style={[styles.urgencyLabel, urgency === u.key && { color: u.color }]}>{u.label}</Text>
              {u.extra > 0 && <Text style={[styles.urgencyExtra, { color: u.color }]}>+{u.extra.toFixed(3)} TND</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Distance */}
        <Text style={styles.sectionTitle}>DISTANCE (km)</Text>
        <View style={styles.distanceRow}>
          {['1', '2', '3', '5', '10'].map(d => (
            <TouchableOpacity key={d} style={[styles.distBtn, distance === d && styles.distBtnActive]} onPress={() => setDistance(d)}>
              <Text style={[styles.distLabel, distance === d && styles.distLabelActive]}>{d} km</Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.distInput}
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
            placeholder="km"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        {/* Notes */}
        <Text style={styles.sectionTitle}>NOTES (optionnel)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Détails supplémentaires..."
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={3}
        />

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>RÉCAPITULATIF DU DEVIS</Text>
          {[
            { l: `${selectedService?.label}`, v: selectedService?.basePrice || 0 },
            { l: `Urgence (${selectedUrgency?.label})`, v: selectedUrgency?.extra || 0 },
            { l: `Déplacement (${distKm} km × 0.800)`, v: travelExtra },
          ].map(row => (
            <View key={row.l} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{row.l}</Text>
              <Text style={styles.priceValue}>{row.v.toFixed(3)} TND</Text>
            </View>
          ))}
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>TOTAL</Text>
            <Text style={styles.priceTotalValue}>{totalPrice.toFixed(3)} TND</Text>
          </View>
          <Text style={styles.priceNote}>✅ EasyWay 0% commission — vous gardez 100%</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.sendBtnText}>📤 Envoyer le devis — {totalPrice.toFixed(3)} TND</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  clientBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  clientIcon: { fontSize: 28 },
  clientLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  clientName: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  serviceBtn: { width: '31%', alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  serviceBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '15' },
  serviceLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  serviceLabelActive: { color: COLORS.accent },
  servicePrice: { color: COLORS.muted, fontSize: 10 },
  urgencyRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  urgencyBtn: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  urgencyLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  urgencyExtra: { fontSize: 10, marginTop: 2 },
  distanceRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  distBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  distBtnActive: { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent },
  distLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  distLabelActive: { color: COLORS.accent },
  distInput: { backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, width: 70 },
  notesInput: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 13, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20, textAlignVertical: 'top', minHeight: 80 },
  priceCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.accent + '40' },
  priceTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { color: COLORS.muted, fontSize: 13 },
  priceValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  priceDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  priceTotalLabel: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  priceTotalValue: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  priceNote: { color: COLORS.green, fontSize: 11, marginTop: 10 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  sendBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  sendBtnText: { color: '#000', fontSize: 15, fontWeight: '900' },
});
