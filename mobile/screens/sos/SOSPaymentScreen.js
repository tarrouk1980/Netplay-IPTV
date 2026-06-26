import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

export default function SOSPaymentScreen({ navigation, route }) {
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [modePaiement, setModePaiement] = useState('wallet');
  const [note, setNote] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    if (!orderId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([api.get(`/api/sos/${orderId}`), api.get('/api/users/me')])
      .then(([o, u]) => {
        setOrder(o.data.order);
        setWallet(Number(u.data.walletBalance || 0));
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const total = Number(order?.finalPrice ?? order?.price ?? 0);

  const MODES_PAIEMENT = [
    { id: 'wallet', label: 'Wallet', description: `Solde disponible : ${wallet.toFixed(2)} TND`, icone: '👛' },
    { id: 'especes', label: 'Espèces', description: 'Payer en main propre', icone: '💵' },
  ];

  const confirmerPaiement = () => {
    const modeLabel = MODES_PAIEMENT.find(m => m.id === modePaiement)?.label || modePaiement;
    Alert.alert(
      'Confirmer le paiement',
      `Vous allez payer ${total.toFixed(2)} TND via ${modeLabel}.\n\nConfirmer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: doConfirm },
      ]
    );
  };

  const doConfirm = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/sos/${orderId}/complete`);
      if (note > 0 && order?.provider?.id) {
        await api.post('/api/reviews', { targetId: order.provider.id, rating: note, orderId });
      }
      navigation.navigate('SOSHome');
    } catch (err) {
      console.error('[SOSPaymentScreen] payment confirmation failed', err);
      Alert.alert('Erreur', 'Impossible de confirmer le paiement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderId) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: '#8E8E9A', textAlign: 'center' }}>Aucune intervention à payer.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#F5A623" size="large" />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: '#8E8E9A', textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger l'intervention.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: '#F5A623', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const duree = order.completedAt
    ? `${Math.max(1, Math.round((new Date(order.completedAt) - new Date(order.createdAt)) / 60000))} min`
    : '—';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titre}>Paiement SOS</Text>
          <Text style={styles.sousTitre}>Récapitulatif de l'intervention</Text>
        </View>

        <View style={styles.recapCard}>
          <View style={styles.recapRow}>
            <Text style={styles.recapIcon}>🛻</Text>
            <View style={styles.recapInfo}>
              <Text style={styles.recapNom}>{order.provider?.name || 'Dépanneur'}</Text>
              <Text style={styles.recapMuted}>Dépanneur</Text>
            </View>
          </View>
          <View style={styles.separateur} />
          <View style={styles.recapDetails}>
            <View style={styles.recapDetailItem}>
              <Text style={styles.recapDetailLabel}>Type de panne</Text>
              <Text style={styles.recapDetailValeur}>{order.metadata?.panneType || order.description || '—'}</Text>
            </View>
            <View style={styles.recapDetailItem}>
              <Text style={styles.recapDetailLabel}>Durée</Text>
              <Text style={styles.recapDetailValeur}>{duree}</Text>
            </View>
          </View>
        </View>

        <View style={styles.prixCard}>
          <Text style={styles.sectionTitre}>Montant</Text>
          <View style={styles.ligneTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValeur}>{total.toFixed(2)} TND</Text>
          </View>
        </View>

        <View style={styles.paiementCard}>
          <Text style={styles.sectionTitre}>Mode de paiement</Text>
          {MODES_PAIEMENT.map(mode => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeItem, modePaiement === mode.id && styles.modeItemActif]}
              onPress={() => setModePaiement(mode.id)}
            >
              <View style={[styles.radio, modePaiement === mode.id && styles.radioActif]}>
                {modePaiement === mode.id && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.modeIcone}>{mode.icone}</Text>
              <View style={styles.modeTexte}>
                <Text style={[styles.modeLabel, modePaiement === mode.id && styles.modeLabelActif]}>
                  {mode.label}
                </Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.sectionTitre}>Satisfaction rapide</Text>
          <View style={styles.etoilesRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setNote(i)} style={styles.etoileBtn}>
                <Text style={[styles.etoile, note >= i && styles.etoileActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {note > 0 && (
            <Text style={styles.noteLabel}>
              {note === 1 ? 'Mauvais' : note === 2 ? 'Passable' : note === 3 ? 'Bien' : note === 4 ? 'Très bien' : 'Excellent'}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.btnConfirmer} onPress={confirmerPaiement} disabled={submitting}>
          {submitting
            ? <ActivityIndicator color="#0A0A0F" />
            : <Text style={styles.btnConfirmerText}>Confirmer le paiement — {total.toFixed(2)} TND</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 16, paddingBottom: 8 },
  titre: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  sousTitre: { fontSize: 14, color: '#8E8E9A', marginTop: 4 },
  recapCard: {
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  recapRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  recapIcon: { fontSize: 36, marginRight: 12 },
  recapInfo: { flex: 1 },
  recapNom: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  recapMuted: { fontSize: 13, color: '#8E8E9A', marginTop: 2 },
  separateur: { height: 1, backgroundColor: '#2C2C3A', marginVertical: 12 },
  recapDetails: { gap: 8 },
  recapDetailItem: { flexDirection: 'row', justifyContent: 'space-between' },
  recapDetailLabel: { fontSize: 14, color: '#8E8E9A' },
  recapDetailValeur: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  prixCard: {
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  sectionTitre: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  ligneTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  totalValeur: { fontSize: 22, fontWeight: '800', color: '#F5A623' },
  paiementCard: {
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    marginBottom: 10,
    backgroundColor: '#0A0A0F',
  },
  modeItemActif: { borderColor: '#F5A623', backgroundColor: '#1C1C28' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2C2C3A',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActif: { borderColor: '#F5A623' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5A623',
  },
  modeIcone: { fontSize: 22, marginRight: 10 },
  modeTexte: { flex: 1 },
  modeLabel: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  modeLabelActif: { color: '#F5A623' },
  modeDescription: { fontSize: 12, color: '#8E8E9A', marginTop: 2 },
  noteCard: {
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    alignItems: 'center',
  },
  etoilesRow: { flexDirection: 'row', gap: 8 },
  etoileBtn: { padding: 4 },
  etoile: { fontSize: 36, color: '#2C2C3A' },
  etoileActive: { color: '#F5A623' },
  noteLabel: { fontSize: 14, color: '#F5A623', marginTop: 8, fontWeight: '600' },
  btnConfirmer: {
    backgroundColor: '#F5A623',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  btnConfirmerText: { fontSize: 16, fontWeight: '800', color: '#0A0A0F' },
});
