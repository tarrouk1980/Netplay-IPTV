import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'PICKING_UP', 'IN_PROGRESS', 'COMPLETED'];
const STEP_LABELS = {
  PENDING: 'Commande confirmée',
  ACCEPTED: 'Livreur assigné',
  PICKING_UP: 'Préparation en cours',
  IN_PROGRESS: 'Livreur en route',
  COMPLETED: 'Livré',
};

export default function DeliveryLivreurTrackingScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!orderId) { setLoading(false); return; }
    api.get(`/api/orders/${orderId}`)
      .then((r) => { setOrder(r.data.order); setProvider(r.data.order?.provider || null); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!orderId) return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [orderId, load]);

  if (!orderId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Text style={{ color: '#8E8E9A', textAlign: 'center' }}>Aucune commande sélectionnée.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#F5A623" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: '#8E8E9A', textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger le suivi de livraison.
          </Text>
          <TouchableOpacity onPress={load} style={styles.btnAppeler}>
            <Text style={styles.btnAppelerText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(order.status);
  const initials = (provider?.name || '?').split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  const handleCall = () => {
    if (!provider?.phone) { Alert.alert('Indisponible', 'Numéro du livreur non disponible.'); return; }
    Linking.openURL(`tel:${provider.phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titre}>Suivi de livraison</Text>
          <View style={styles.etaBadge}>
            <Text style={styles.etaLabel}>Statut</Text>
            <Text style={styles.etaValeur}>{STEP_LABELS[order.status] || order.status}</Text>
          </View>
        </View>

        {provider ? (
          <View style={styles.livreurCard}>
            <View style={styles.livreurAvatar}>
              <Text style={styles.livreurAvatarText}>{initials}</Text>
            </View>
            <View style={styles.livreurInfo}>
              <Text style={styles.livreurNom}>{provider.name}</Text>
              {provider.avgRating != null && (
                <View style={styles.noteRow}>
                  <Text style={styles.etoile}>★</Text>
                  <Text style={styles.noteText}>{Number(provider.avgRating).toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View style={styles.livreurActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                <Text style={styles.actionIcon}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Chat', { orderId, otherName: provider.name, otherRole: 'Livreur' })}
              >
                <Text style={styles.actionIcon}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.livreurCard}>
            <Text style={{ color: '#8E8E9A' }}>En attente d'assignation d'un livreur…</Text>
          </View>
        )}

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitre}>Suivi de commande</Text>
          {STATUS_STEPS.map((statut, index) => {
            const etapeStatut = index < currentIdx ? 'done' : index === currentIdx ? 'active' : 'pending';
            return (
              <View key={statut} style={styles.timelineItem}>
                <View style={styles.timelineGauche}>
                  <View
                    style={[
                      styles.timelineDot,
                      etapeStatut === 'done' && styles.dotDone,
                      etapeStatut === 'active' && styles.dotActive,
                    ]}
                  >
                    {etapeStatut === 'done' && <Text style={styles.dotCheck}>✓</Text>}
                    {etapeStatut === 'active' && <Text style={styles.dotActiveInner}>●</Text>}
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View style={[styles.timelineLine, etapeStatut === 'done' && styles.lineDone]} />
                  )}
                </View>
                <View style={styles.timelineDroite}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      etapeStatut === 'pending' && styles.labelPending,
                      etapeStatut === 'active' && styles.labelActive,
                    ]}
                  >
                    {STEP_LABELS[statut]}
                    {etapeStatut === 'done' ? ' ✅' : etapeStatut === 'active' ? ' 🔄' : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.boutonsRow}>
          <TouchableOpacity style={styles.btnAppeler} onPress={handleCall}>
            <Text style={styles.btnAppelerText}>📞 Appeler le livreur</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnChat}
            onPress={() => navigation.navigate('Chat', { orderId, otherName: provider?.name || 'Livreur', otherRole: 'Livreur' })}
          >
            <Text style={styles.btnChatText}>💬 Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titre: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  etaBadge: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5A623',
  },
  etaLabel: { fontSize: 10, color: '#8E8E9A' },
  etaValeur: { fontSize: 14, fontWeight: '800', color: '#F5A623' },
  livreurCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  livreurAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  livreurAvatarText: { fontSize: 18, fontWeight: '700', color: '#0A0A0F' },
  livreurInfo: { flex: 1 },
  livreurNom: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  noteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  etoile: { color: '#F5A623', fontSize: 14 },
  noteText: { color: '#FFFFFF', fontSize: 13, marginLeft: 4, fontWeight: '600' },
  livreurActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  actionIcon: { fontSize: 20 },
  timelineCard: {
    backgroundColor: '#1C1C28',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  sectionTitre: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineGauche: { alignItems: 'center', width: 32, marginRight: 12 },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2C2C3A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2C2C3A',
  },
  dotDone: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  dotActive: { borderColor: '#F5A623', backgroundColor: '#1C1C28' },
  dotCheck: { color: '#0A0A0F', fontSize: 14, fontWeight: '800' },
  dotActiveInner: { color: '#F5A623', fontSize: 12 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#2C2C3A', marginVertical: 2, minHeight: 20 },
  lineDone: { backgroundColor: '#F5A623' },
  timelineDroite: { flex: 1, justifyContent: 'center', paddingVertical: 4 },
  timelineLabel: { fontSize: 14, color: '#FFFFFF', marginBottom: 16 },
  labelPending: { color: '#8E8E9A' },
  labelActive: { color: '#F5A623', fontWeight: '600' },
  boutonsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  btnAppeler: {
    flex: 1,
    backgroundColor: '#F5A623',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnAppelerText: { color: '#0A0A0F', fontSize: 15, fontWeight: '700' },
  btnChat: {
    flex: 1,
    backgroundColor: '#1C1C28',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  btnChatText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
