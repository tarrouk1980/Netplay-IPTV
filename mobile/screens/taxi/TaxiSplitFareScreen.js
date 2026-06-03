import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', purple: '#9B59B6',
};

const MOCK_RIDE = {
  rideId: 'TXI-20240603-7741',
  from: 'Av. Habib Bourguiba, Tunis',
  to: 'Aéroport Tunis-Carthage',
  totalFare: 16.50,
  distance: '12.4 km',
  date: '03/06/2024 à 14:28',
};

const QUICK_SPLIT = [2, 3, 4];

export default function TaxiSplitFareScreen({ navigation, route }) {
  const ride = route.params?.ride || MOCK_RIDE;
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Vous', phone: '', status: 'owner', share: 0 },
  ]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [splitMode, setSplitMode] = useState('equal');

  const totalFare = ride.totalFare;
  const count = participants.length;
  const equalShare = totalFare / count;

  const addParticipant = () => {
    if (!newName.trim()) return;
    setParticipants(prev => [
      ...prev,
      { id: Date.now(), name: newName.trim(), phone: newPhone.trim(), status: 'pending', share: 0 },
    ]);
    setNewName('');
    setNewPhone('');
  };

  const removeParticipant = (id) => {
    if (participants.length <= 1) return;
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const quickSplit = (n) => {
    const base = [...participants];
    while (base.length < n) base.push({ id: Date.now() + base.length, name: `Passager ${base.length}`, phone: '', status: 'pending', share: 0 });
    setParticipants(base.slice(0, n));
  };

  const shareRequest = async (participant) => {
    try {
      await Share.share({
        message: `Hey ${participant.name} ! Course EASYWAY partagée.\nTon part : ${equalShare.toFixed(2)} TND\nTrajet : ${ride.from} → ${ride.to}\nRéf : ${ride.rideId}`,
      });
    } catch {}
  };

  const confirmSplit = async () => {
    Alert.alert(
      'Partage confirmé',
      `${count} personnes · ${equalShare.toFixed(2)} TND chacune`,
      [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]
    );
  };

  const STATUS_COLOR = { owner: COLORS.accent, pending: COLORS.muted, paid: COLORS.green };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partager la course</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Ride Card */}
        <View style={styles.rideCard}>
          <View style={styles.rideRow}>
            <View style={styles.rideDotGreen} />
            <Text style={styles.rideAddr} numberOfLines={1}>{ride.from}</Text>
          </View>
          <View style={styles.rideConnector} />
          <View style={styles.rideRow}>
            <View style={styles.rideDotRed} />
            <Text style={styles.rideAddr} numberOfLines={1}>{ride.to}</Text>
          </View>
          <View style={styles.rideMeta}>
            <Text style={styles.rideMetaText}>{ride.distance}</Text>
            <Text style={styles.rideMetaText}>{ride.date}</Text>
            <Text style={[styles.rideMetaText, { color: COLORS.accent, fontWeight: '800' }]}>
              {totalFare.toFixed(2)} TND
            </Text>
          </View>
        </View>

        {/* Quick Split */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Partage rapide</Text>
          <View style={styles.quickRow}>
            {QUICK_SPLIT.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.quickChip, count === n && styles.quickChipActive]}
                onPress={() => quickSplit(n)}
              >
                <Text style={[styles.quickChipNum, count === n && { color: '#000' }]}>{n}</Text>
                <Text style={[styles.quickChipLabel, count === n && { color: '#000' }]}>
                  {n === 2 ? 'personnes' : n === 3 ? 'personnes' : 'personnes'}
                </Text>
                <Text style={[styles.quickChipPrice, count === n && { color: '#000' }]}>
                  {(totalFare / n).toFixed(2)} TND
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total course</Text>
            <Text style={styles.summaryValue}>{totalFare.toFixed(2)} TND</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Participants</Text>
            <Text style={styles.summaryValue}>{count} personne{count > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: COLORS.white, fontWeight: '700' }]}>Part par personne</Text>
            <Text style={[styles.summaryValue, { color: COLORS.accent, fontSize: 20, fontWeight: '900' }]}>
              {equalShare.toFixed(2)} TND
            </Text>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Participants ({count})</Text>
          {participants.map((p) => (
            <View key={p.id} style={styles.participantRow}>
              <View style={styles.participantAvatar}>
                <Text style={{ fontSize: 22 }}>{p.status === 'owner' ? '👤' : '👥'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.participantName}>{p.name}</Text>
                {p.phone ? <Text style={styles.participantPhone}>{p.phone}</Text> : null}
              </View>
              <Text style={[styles.participantShare, { color: STATUS_COLOR[p.status] || COLORS.muted }]}>
                {equalShare.toFixed(2)} TND
              </Text>
              {p.status !== 'owner' && (
                <View style={styles.participantActions}>
                  <TouchableOpacity onPress={() => shareRequest(p)}>
                    <Text style={{ fontSize: 18 }}>📤</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeParticipant(p.id)}>
                    <Text style={{ fontSize: 16, color: COLORS.border }}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Add Participant */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>➕ Ajouter un participant</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom du passager"
            placeholderTextColor={COLORS.muted}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Téléphone (optionnel)"
            placeholderTextColor={COLORS.muted}
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />
          <TouchableOpacity
            style={[styles.addBtn, !newName.trim() && styles.addBtnDisabled]}
            onPress={addParticipant}
            disabled={!newName.trim()}
          >
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareAllBtn} onPress={() => Share.share({ message: `Course EASYWAY partagée en ${count} · ${equalShare.toFixed(2)} TND chacun` })}>
          <Text style={styles.shareAllBtnText}>📤 Partager à tous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtn} onPress={confirmSplit}>
          <Text style={styles.confirmBtnText}>Confirmer le partage</Text>
        </TouchableOpacity>
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
  rideCard: {
    margin: 16, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  rideRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rideDotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  rideDotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.red },
  rideConnector: { width: 1, height: 16, backgroundColor: COLORS.border, marginLeft: 5, marginVertical: 3 },
  rideAddr: { color: COLORS.white, fontSize: 13, fontWeight: '600', flex: 1 },
  rideMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  rideMetaText: { color: COLORS.muted, fontSize: 12 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  quickChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  quickChipNum: { color: COLORS.white, fontSize: 22, fontWeight: '900' },
  quickChipLabel: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  quickChipPrice: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginTop: 4 },
  summaryCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: '#1A1408',
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.accent,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: COLORS.muted, fontSize: 14 },
  summaryValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  participantRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    marginBottom: 6, borderWidth: 1, borderColor: COLORS.border,
  },
  participantAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  participantName: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  participantPhone: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  participantShare: { fontSize: 14, fontWeight: '700', marginRight: 8 },
  participantActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.white, fontSize: 14, paddingHorizontal: 14, paddingVertical: 11,
  },
  addBtn: {
    marginTop: 10, backgroundColor: COLORS.surface, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent,
  },
  addBtnDisabled: { borderColor: COLORS.border },
  addBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  shareAllBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  shareAllBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  confirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  confirmBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
});
