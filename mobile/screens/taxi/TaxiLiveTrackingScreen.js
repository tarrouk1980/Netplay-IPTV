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
  fond: '#0A0A0F',
  surface: '#1C1C28',
  primaire: '#F5A623',
  texte: '#FFFFFF',
  discret: '#8E8E9A',
  bordure: '#2C2C3A',
};

const ETAPES = [
  { key: 'ACCEPTED', label: 'Confirmé', icone: '✅' },
  { key: 'IN_PROGRESS', label: 'En route', icone: '🚕' },
  { key: 'COMPLETED', label: 'Arrivé', icone: '🏁' },
];

export default function TaxiLiveTrackingScreen({ navigation, route }) {
  const { orderId } = route?.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!orderId) { setLoading(false); return; }
    api.get(`/api/taxi/${orderId}`)
      .then((r) => { setOrder(r.data.order); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (order?.status === 'COMPLETED') {
      navigation?.replace?.('TaxiRating', { orderId, driverName: order.provider?.name });
    }
  }, [order?.status]);

  const appelerChauffeur = () => {
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

  const envoyerMessage = () => {
    navigation?.navigate?.('Chat', { chauffeurNom: order?.provider?.name });
  };

  const annulerCourse = () => {
    Alert.alert(
      'Annuler la course',
      "Des frais d'annulation peuvent s'appliquer. Confirmer l'annulation ?",
      [
        { text: 'Retour', style: 'cancel' },
        {
          text: 'Annuler la course',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/api/taxi/${orderId}/cancel`, { reason: 'Annulé par le client' });
              navigation?.goBack?.();
            } catch (e) {
              Alert.alert('Erreur', e?.response?.data?.error || "Impossible d'annuler la course.");
            }
          },
        },
      ]
    );
  };

  if (!orderId) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COULEURS.discret, textAlign: 'center' }}>Aucune course active.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COULEURS.primaire} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COULEURS.discret, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger la course.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: COULEURS.primaire, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const vehicle = Array.isArray(order.provider?.vehicle) ? order.provider.vehicle[0] : order.provider?.vehicle;
  const etapeActive = order.status === 'IN_PROGRESS' ? 1 : order.status === 'COMPLETED' ? 2 : 0;
  const initiales = order.provider?.name
    ? order.provider.name.split(' ').map((p) => p[0]).slice(0, 2).join('')
    : '?';

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titreEcran}>
          {order.status === 'ACCEPTED' ? 'Votre chauffeur arrive' : order.status === 'IN_PROGRESS' ? 'Course en cours' : 'En attente'}
        </Text>
      </View>

      {/* Stepper */}
      <View style={styles.progressionBloc}>
        {ETAPES.map((etape, index) => (
          <View key={etape.key} style={styles.etapeRangee}>
            <View style={styles.etapeGauche}>
              <View
                style={[
                  styles.etapeCercle,
                  index <= etapeActive && styles.etapeCercleActif,
                ]}
              >
                <Text style={styles.etapeIcone}>{etape.icone}</Text>
              </View>
              {index < ETAPES.length - 1 && (
                <View
                  style={[
                    styles.etapeTiret,
                    index < etapeActive && styles.etapeTiretActif,
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.etapeLabel,
                index <= etapeActive && styles.etapeLabelActif,
              ]}
            >
              {etape.label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.carteDefilement} showsVerticalScrollIndicator={false}>
        {/* Statut */}
        <View style={styles.statutBandeau}>
          <Text style={styles.statutTexte}>🚕  {order.provider?.name ? 'Votre chauffeur est en route' : "Recherche d'un chauffeur..."}</Text>
        </View>

        {/* Infos chauffeur */}
        {order.provider && (
          <View style={styles.chauffeurCarte}>
            <View style={styles.chauffeurAvatar}>
              <Text style={styles.avatarTexte}>{initiales}</Text>
            </View>
            <View style={styles.chauffeurInfo}>
              <Text style={styles.chauffeurNom}>{order.provider.name}</Text>
              {vehicle && (
                <Text style={styles.chauffeurVoiture}>{vehicle.make} {vehicle.model}{vehicle.color ? ` · ${vehicle.color}` : ''}</Text>
              )}
              <View style={styles.chauffeurMeta}>
                <Text style={styles.chauffeurNote}>⭐ {Number(order.provider.rating || 0).toFixed(1)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Plaque d'immatriculation */}
        {vehicle?.plate && (
          <View style={styles.plaqueConteneur}>
            <Text style={styles.plaqueEtiquette}>Plaque d'immatriculation</Text>
            <View style={styles.plaqueAffichage}>
              <Text style={styles.plaqueTexte}>{vehicle.plate}</Text>
            </View>
            <Text style={styles.plaqueConseil}>Vérifiez la plaque avant de monter dans le véhicule</Text>
          </View>
        )}

        {/* Boutons actions */}
        <View style={styles.boutonsRangee}>
          <TouchableOpacity style={styles.boutonAction} onPress={appelerChauffeur} activeOpacity={0.85}>
            <Text style={styles.boutonActionEmoji}>📞</Text>
            <Text style={styles.boutonActionTexte}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boutonAction} onPress={envoyerMessage} activeOpacity={0.85}>
            <Text style={styles.boutonActionEmoji}>💬</Text>
            <Text style={styles.boutonActionTexte}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton annulation */}
        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
          <TouchableOpacity style={styles.boutonAnnuler} onPress={annulerCourse} activeOpacity={0.85}>
            <Text style={styles.boutonAnnulerTexte}>✕  Annuler (frais applicables)</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.fond,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  titreEcran: {
    fontSize: 20,
    fontWeight: '700',
    color: COULEURS.texte,
    flex: 1,
    marginRight: 12,
  },
  progressionBloc: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  etapeRangee: {
    alignItems: 'center',
    flex: 1,
  },
  etapeGauche: {
    alignItems: 'center',
    width: '100%',
  },
  etapeCercle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COULEURS.surface,
    borderWidth: 2,
    borderColor: COULEURS.bordure,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etapeCercleActif: {
    borderColor: COULEURS.primaire,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
  },
  etapeIcone: {
    fontSize: 14,
  },
  etapeTiret: {
    position: 'absolute',
    left: '50%',
    top: 17,
    right: '-50%',
    height: 2,
    backgroundColor: COULEURS.bordure,
  },
  etapeTiretActif: {
    backgroundColor: COULEURS.primaire,
  },
  etapeLabel: {
    fontSize: 11,
    color: COULEURS.discret,
    marginTop: 6,
    textAlign: 'center',
  },
  etapeLabelActif: {
    color: COULEURS.primaire,
    fontWeight: '600',
  },
  carteDefilement: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statutBandeau: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statutTexte: {
    fontSize: 14,
    fontWeight: '600',
    color: COULEURS.primaire,
  },
  chauffeurCarte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    gap: 14,
    marginBottom: 12,
  },
  chauffeurAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COULEURS.primaire,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexte: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  chauffeurInfo: {
    flex: 1,
  },
  chauffeurNom: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.texte,
    marginBottom: 2,
  },
  chauffeurVoiture: {
    fontSize: 13,
    color: COULEURS.discret,
    marginBottom: 6,
  },
  chauffeurMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  chauffeurNote: {
    fontSize: 13,
    color: COULEURS.texte,
  },
  plaqueConteneur: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    marginBottom: 12,
    alignItems: 'center',
  },
  plaqueEtiquette: {
    fontSize: 12,
    color: COULEURS.discret,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  plaqueAffichage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: '#003399',
    marginBottom: 10,
  },
  plaqueTexte: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 3,
    fontVariant: ['tabular-nums'],
  },
  plaqueConseil: {
    fontSize: 11,
    color: COULEURS.discret,
    textAlign: 'center',
  },
  boutonsRangee: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  boutonAction: {
    flex: 1,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  boutonActionEmoji: {
    fontSize: 22,
  },
  boutonActionTexte: {
    fontSize: 13,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  boutonAnnuler: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  boutonAnnulerTexte: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '500',
  },
});
