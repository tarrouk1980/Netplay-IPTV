import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

export default function TaxiActiveRideScreen({ navigation, route }) {
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!orderId) { setLoading(false); return; }
    setLoading(true);
    api.get(`/api/taxi/${orderId}`)
      .then((r) => { setOrder(r.data.order); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const appelChauffeur = () => {
    const phone = order?.provider?.phone;
    if (!phone) return;
    Alert.alert(
      'Appeler le chauffeur',
      `Voulez-vous appeler ${order.provider.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => Linking.openURL(`tel:${phone}`) },
      ]
    );
  };

  const alertSOS = () => {
    Alert.alert(
      '🚨 Urgence SOS',
      'Votre position sera partagée avec les services d\'urgence. Confirmer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer SOS',
          style: 'destructive',
          onPress: () => navigation.navigate('SOSHome'),
        },
      ]
    );
  };

  if (!orderId) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COULEURS.muted, textAlign: 'center' }}>Aucune course active.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COULEURS.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COULEURS.muted, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger la course.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: COULEURS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const vehicle = Array.isArray(order.provider?.vehicle) ? order.provider.vehicle[0] : order.provider?.vehicle;
  const initiales = order.provider?.name
    ? order.provider.name.split(' ').map((p) => p[0]).slice(0, 2).join('')
    : '?';

  return (
    <SafeAreaView style={styles.conteneur}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.carteSimulee}>
          <View style={styles.carteInterieur}>
            <Text style={styles.carteEta}>
              {order.status === 'IN_PROGRESS' ? 'Course en cours' : order.status === 'ACCEPTED' ? 'Chauffeur en route' : 'En attente'}
            </Text>
          </View>
        </View>

        <View style={styles.carteInfo}>
          <View style={styles.chauffeurEntete}>
            <View style={styles.avatarConteneur}>
              <Text style={styles.avatarInitiales}>{initiales}</Text>
            </View>
            <View style={styles.chauffeurTexte}>
              <Text style={styles.chauffeurNom}>{order.provider?.name || 'Chauffeur'}</Text>
              <View style={styles.noteConteneur}>
                <Text style={styles.etoile}>★</Text>
                <Text style={styles.noteTexte}>{Number(order.provider?.rating || 0).toFixed(1)}</Text>
              </View>
            </View>
            <View style={styles.prixBadge}>
              <Text style={styles.prixLabel}>Estimé</Text>
              <Text style={styles.prixValeur}>{Number(order.finalPrice ?? order.price ?? 0).toFixed(2)} TND</Text>
            </View>
          </View>

          {vehicle && (
            <>
              <View style={styles.separateur} />
              <View style={styles.vehiculeInfo}>
                <View style={styles.vehiculeLigne}>
                  <Text style={styles.vehiculeLabel}>Véhicule</Text>
                  <Text style={styles.vehiculeValeur}>{vehicle.make} {vehicle.model}</Text>
                </View>
                <View style={styles.vehiculeLigne}>
                  <Text style={styles.vehiculeLabel}>Plaque</Text>
                  <Text style={styles.vehiculeValeur}>{vehicle.plate}</Text>
                </View>
                {vehicle.color && (
                  <View style={styles.vehiculeLigne}>
                    <Text style={styles.vehiculeLabel}>Couleur</Text>
                    <Text style={styles.vehiculeValeur}>{vehicle.color}</Text>
                  </View>
                )}
              </View>
            </>
          )}

          <View style={styles.separateur} />

          <View style={styles.trajetInfo}>
            <View style={styles.trajetLigne}>
              <View style={styles.pointVert} />
              <Text style={styles.trajetTexte} numberOfLines={1}>{order.originAddress || '—'}</Text>
            </View>
            <View style={styles.traitVertical} />
            <View style={styles.trajetLigne}>
              <View style={styles.pointPrimary} />
              <Text style={styles.trajetTexte} numberOfLines={1}>{order.destinationAddress || '—'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsConteneur}>
          <TouchableOpacity style={styles.boutonAction} onPress={appelChauffeur}>
            <Text style={styles.boutonActionIcone}>📞</Text>
            <Text style={styles.boutonActionTexte}>Appeler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boutonAction}
            onPress={() => navigation.navigate('Chat', { chauffeurNom: order.provider?.name })}
          >
            <Text style={styles.boutonActionIcone}>💬</Text>
            <Text style={styles.boutonActionTexte}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.boutonAction, styles.boutonSOS]} onPress={alertSOS}>
            <Text style={styles.boutonActionIcone}>🚨</Text>
            <Text style={[styles.boutonActionTexte, styles.sosTexte]}>SOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  carteSimulee: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#12121E',
    height: 140,
  },
  carteInterieur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carteEta: {
    color: COULEURS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  carteInfo: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  chauffeurEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarConteneur: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COULEURS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitiales: {
    color: COULEURS.bg,
    fontSize: 18,
    fontWeight: '800',
  },
  chauffeurTexte: {
    flex: 1,
  },
  chauffeurNom: {
    color: COULEURS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteConteneur: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etoile: {
    color: COULEURS.primary,
    fontSize: 14,
    marginRight: 4,
  },
  noteTexte: {
    color: COULEURS.muted,
    fontSize: 14,
  },
  prixBadge: {
    alignItems: 'flex-end',
  },
  prixLabel: {
    color: COULEURS.muted,
    fontSize: 11,
    marginBottom: 2,
  },
  prixValeur: {
    color: COULEURS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.border,
    marginVertical: 12,
  },
  vehiculeInfo: {
    gap: 8,
  },
  vehiculeLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehiculeLabel: {
    color: COULEURS.muted,
    fontSize: 14,
  },
  vehiculeValeur: {
    color: COULEURS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  trajetInfo: {
    gap: 4,
  },
  trajetLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointVert: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  pointPrimary: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COULEURS.primary,
  },
  traitVertical: {
    width: 2,
    height: 16,
    backgroundColor: COULEURS.border,
    marginLeft: 4,
  },
  trajetTexte: {
    color: COULEURS.text,
    fontSize: 13,
    flex: 1,
  },
  actionsConteneur: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  boutonAction: {
    flex: 1,
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  boutonSOS: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.1)',
  },
  boutonActionIcone: {
    fontSize: 22,
    marginBottom: 6,
  },
  boutonActionTexte: {
    color: COULEURS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sosTexte: {
    color: '#FF3B30',
  },
});
