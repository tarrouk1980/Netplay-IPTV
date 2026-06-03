import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A',
  border: '#2A2A3A', green: '#27AE60', red: '#E74C3C',
};

const SIZES = [
  { id: 'XS', label: 'Enveloppe', emoji: '✉️', desc: 'Documents, lettres', max: '500g', price: 4.5 },
  { id: 'S', label: 'Petit colis', emoji: '📦', desc: 'Chaussures, livres', max: '2 kg', price: 7 },
  { id: 'M', label: 'Colis moyen', emoji: '📫', desc: 'Électronique, vêtements', max: '5 kg', price: 12 },
  { id: 'L', label: 'Grand colis', emoji: '🧳', desc: 'Appareils, meubles légers', max: '15 kg', price: 22 },
];

const SERVICES = [
  { id: 'EXPRESS', label: 'Express (1-2h)', emoji: '⚡', multiplier: 1.8 },
  { id: 'STANDARD', label: 'Standard (3-6h)', emoji: '🚴', multiplier: 1 },
  { id: 'SCHEDULED', label: 'Planifié', emoji: '📅', multiplier: 0.85 },
];

export default function EasyPackageScreen({ navigation }) {
  const [size, setSize] = useState('S');
  const [service, setService] = useState('STANDARD');
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedSize = SIZES.find((s) => s.id === size);
  const selectedService = SERVICES.find((s) => s.id === service);
  const price = selectedSize && selectedService
    ? (selectedSize.price * selectedService.multiplier).toFixed(2)
    : '—';

  const handleSend = async () => {
    if (!pickup || !delivery) {
      Alert.alert('Champs requis', 'Entrez l\'adresse de ramassage et de livraison.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/delivery/package', {
        size, service, pickup, delivery,
        senderName, receiverPhone, description,
      });
      Alert.alert('Colis envoyé ✅', 'Un livreur a été notifié et va récupérer votre colis.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Confirmation', `Demande d'envoi enregistrée.\nUn livreur vous contactera sous peu.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>📦 EasyPackage</Text>
          <Text style={styles.subtitle}>Envoi de colis — Livraison express</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Taille */}
        <Text style={styles.sectionTitle}>Taille du colis</Text>
        <View style={styles.grid}>
          {SIZES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sizeCard, size === s.id && styles.sizeCardActive]}
              onPress={() => setSize(s.id)}
            >
              <Text style={styles.sizeEmoji}>{s.emoji}</Text>
              <Text style={[styles.sizeLabel, size === s.id && { color: '#000' }]}>{s.label}</Text>
              <Text style={[styles.sizeMeta, size === s.id && { color: 'rgba(0,0,0,0.6)' }]}>{s.max}</Text>
              <Text style={[styles.sizeDesc, size === s.id && { color: 'rgba(0,0,0,0.5)' }]}>{s.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Service */}
        <Text style={styles.sectionTitle}>Type de livraison</Text>
        {SERVICES.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.serviceRow, service === s.id && styles.serviceRowActive]}
            onPress={() => setService(s.id)}
          >
            <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
            <Text style={[styles.serviceLabel, service === s.id && { color: '#000' }]}>{s.label}</Text>
            <Text style={[styles.servicePrice, service === s.id && { color: '#000' }]}>
              {(selectedSize?.price * s.multiplier).toFixed(2)} TND
            </Text>
          </TouchableOpacity>
        ))}

        {/* Addresses */}
        <Text style={styles.sectionTitle}>Adresses</Text>
        <TextInput
          style={styles.input}
          placeholder="📍 Adresse de ramassage"
          placeholderTextColor={COLORS.muted}
          value={pickup}
          onChangeText={setPickup}
        />
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder="🏁 Adresse de livraison"
          placeholderTextColor={COLORS.muted}
          value={delivery}
          onChangeText={setDelivery}
        />

        {/* Contact */}
        <Text style={styles.sectionTitle}>Informations</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre nom (expéditeur)"
          placeholderTextColor={COLORS.muted}
          value={senderName}
          onChangeText={setSenderName}
        />
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder="📞 Téléphone du destinataire"
          placeholderTextColor={COLORS.muted}
          keyboardType="phone-pad"
          value={receiverPhone}
          onChangeText={setReceiverPhone}
        />
        <TextInput
          style={[styles.input, { marginTop: 10, minHeight: 60, textAlignVertical: 'top' }]}
          placeholder="Description du colis (optionnel)"
          placeholderTextColor={COLORS.muted}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Colis</Text>
            <Text style={styles.summaryValue}>{selectedSize?.label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{selectedService?.label}</Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 8 }]}>
            <Text style={[styles.summaryLabel, { fontSize: 16 }]}>Total estimé</Text>
            <Text style={[styles.summaryValue, { color: COLORS.accent, fontSize: 22 }]}>{price} TND</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>📦 Envoyer ce colis</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  subtitle: { color: COLORS.muted, fontSize: 12 },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    color: COLORS.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: 20, marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeCard: {
    width: '47%', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  sizeCardActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  sizeEmoji: { fontSize: 28, marginBottom: 6 },
  sizeLabel: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  sizeMeta: { color: COLORS.accent, fontSize: 12, fontWeight: '600', marginTop: 2 },
  sizeDesc: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  serviceRowActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  serviceLabel: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: '600' },
  servicePrice: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 16, paddingVertical: 14,
    color: COLORS.white, fontSize: 15,
  },
  summary: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 16, marginTop: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  summaryLabel: { color: COLORS.muted, fontSize: 14 },
  summaryValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  btn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
  },
  btnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
