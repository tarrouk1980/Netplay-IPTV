import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, StatusBar, Linking, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60',
};

function RequestCard({ order, onQuote }) {
  const [price, setPrice] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const value = parseFloat(price);
    if (!value || value <= 0) {
      Alert.alert('Prix invalide', 'Entrez un montant valide.');
      return;
    }
    setSending(true);
    await onQuote(order.id, value);
    setSending(false);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardClient}>{order.client?.name || 'Client'}</Text>
      <Text style={styles.cardDesc}>{order.metadata?.description}</Text>
      {order.metadata?.consultationMode === 'VIDEO' && (
        <Text style={styles.videoBadge}>📹 Consultation vidéo</Text>
      )}
      <Text style={styles.cardAddress}>📍 {order.originAddress}</Text>
      <View style={styles.quoteRow}>
        <TextInput
          style={styles.priceInput}
          value={price}
          onChangeText={setPrice}
          placeholder="Prix (TND)"
          placeholderTextColor={COLORS.muted}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity style={styles.quoteBtn} onPress={submit} disabled={sending}>
          {sending ? <ActivityIndicator color="#000" /> : <Text style={styles.quoteBtnText}>Envoyer devis</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AssignmentCard({ order }) {
  const videoUrl = order.metadata?.videoCallUrl;
  return (
    <View style={styles.card}>
      <Text style={styles.cardClient}>{order.client?.name || 'Client'}</Text>
      <Text style={styles.cardDesc}>{order.metadata?.description}</Text>
      <Text style={styles.cardAddress}>📍 {order.originAddress}</Text>
      {videoUrl && (
        <TouchableOpacity style={styles.joinBtn} onPress={() => Linking.openURL(videoUrl)}>
          <Text style={styles.joinBtnText}>📹 Rejoindre l'appel vidéo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function EasyServicesProviderScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      api.get('/api/homeservices/requests').catch(() => ({ data: { orders: [] } })),
      api.get('/api/homeservices/assignments').catch(() => ({ data: { orders: [] } })),
    ]).then(([reqRes, assignRes]) => {
      setRequests(reqRes.data.orders || []);
      setAssignments(assignRes.data.orders || []);
    }).finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleQuote = async (orderId, price) => {
    try {
      await api.post(`/api/homeservices/${orderId}/quote`, { price });
      setRequests((prev) => prev.filter((r) => r.id !== orderId));
      Alert.alert('Devis envoyé', 'Le client a été notifié de votre proposition.');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer le devis.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧰 EasyServices Pro</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />}
        >
          <Text style={styles.sectionTitle}>MES INTERVENTIONS EN COURS ({assignments.length})</Text>
          {assignments.length === 0 && (
            <Text style={styles.emptyText}>Aucune intervention en cours.</Text>
          )}
          {assignments.map((o) => <AssignmentCard key={o.id} order={o} />)}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>NOUVELLES DEMANDES ({requests.length})</Text>
          {requests.length === 0 && (
            <Text style={styles.emptyText}>Aucune demande pour le moment.</Text>
          )}
          {requests.map((o) => <RequestCard key={o.id} order={o} onQuote={handleQuote} />)}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  scroll: { padding: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  emptyText: { color: COLORS.muted, fontSize: 13, marginBottom: 16 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardClient: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  cardDesc: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  cardAddress: { color: COLORS.muted, fontSize: 12, marginTop: 8 },
  videoBadge: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginTop: 6 },
  quoteRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  priceInput: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    color: COLORS.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  quoteBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  quoteBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  joinBtn: { backgroundColor: COLORS.green, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  joinBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
