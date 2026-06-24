import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
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

const POSITIONS_DEPANNEUR = [
  { x: 30, y: 60 },
  { x: 38, y: 53 },
  { x: 45, y: 47 },
  { x: 53, y: 42 },
  { x: 60, y: 38 },
  { x: 67, y: 33 },
  { x: 72, y: 28 },
];

const ETAPES = [
  { label: 'Confirmé', icone: '✅' },
  { label: 'En route', icone: '🔄' },
  { label: 'Arrivé', icone: '🏁' },
];

const DUREE_INITIALE = 12 * 60;

export default function SOSLiveTrackingScreen({ route, navigation }) {
  const { orderId } = route?.params || {};
  const [secondesRestantes, setSecondesRestantes] = useState(DUREE_INITIALE);
  const [indexPosition, setIndexPosition] = useState(0);
  const [etapeActive, setEtapeActive] = useState(0);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const posAnim = useRef(new Animated.ValueXY({ x: POSITIONS_DEPANNEUR[0].x, y: POSITIONS_DEPANNEUR[0].y })).current;

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      setErrorMsg('Identifiant de la demande manquant.');
      return;
    }
    try {
      const res = await api.get(`/api/sos/${orderId}`);
      const o = res.data?.order || res.data;
      setOrder(o);
      setErrorMsg(null);
      const STATUS_TO_ETAPE = { PENDING: 0, ACCEPTED: 1, IN_PROGRESS: 2, COMPLETED: 2 };
      if (STATUS_TO_ETAPE[o?.status] !== undefined) setEtapeActive(STATUS_TO_ETAPE[o.status]);
    } catch (e) {
      setErrorMsg(e?.response?.data?.error || "Impossible de récupérer le suivi de l'intervention.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    const poll = setInterval(loadOrder, 10000);
    return () => clearInterval(poll);
  }, [loadOrder]);

  useEffect(() => {
    const timerCompte = setInterval(() => {
      setSecondesRestantes((prev) => {
        if (prev <= 0) {
          clearInterval(timerCompte);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerCompte);
  }, []);

  useEffect(() => {
    const timerPos = setInterval(() => {
      setIndexPosition((prev) => {
        const prochainIndex = Math.min(prev + 1, POSITIONS_DEPANNEUR.length - 1);
        const prochainePos = POSITIONS_DEPANNEUR[prochainIndex];
        Animated.timing(posAnim, {
          toValue: { x: prochainePos.x, y: prochainePos.y },
          duration: 1800,
          useNativeDriver: false,
        }).start();
        return prochainIndex;
      });
    }, 2000);
    return () => clearInterval(timerPos);
  }, []);

  const formatTemps = (secondes) => {
    const m = Math.floor(secondes / 60).toString().padStart(2, '0');
    const s = (secondes % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const provider = order?.provider;

  const appelerDepanneur = () => {
    if (!provider?.phone) {
      Alert.alert('Indisponible', "Le numéro du dépanneur n'est pas encore disponible.");
      return;
    }
    Linking.openURL(`tel:${provider.phone}`).catch(() =>
      Alert.alert('Erreur', "Impossible de lancer l'appel.")
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COULEURS.primaire} size="large" />
      </SafeAreaView>
    );
  }

  if (errorMsg && !order) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COULEURS.discret, textAlign: 'center', marginBottom: 16 }}>{errorMsg}</Text>
        <TouchableOpacity onPress={() => { setLoading(true); loadOrder(); }} style={{ backgroundColor: COULEURS.primaire, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titreEcran}>Suivi en temps réel</Text>
        <View style={styles.etaBloc}>
          <Text style={styles.etaLabel}>Arrivée dans</Text>
          <Text style={[styles.etaTimer, secondesRestantes < 60 && styles.etaUrgent]}>
            {formatTemps(secondesRestantes)}
          </Text>
        </View>
      </View>

      <View style={styles.carteSimulee}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.grilleLigne, { top: `${(i + 1) * 14}%` }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.grilleColonne, { left: `${(i + 1) * 14}%` }]} />
        ))}

        <View style={[styles.pinClient, { left: '72%', top: '20%' }]}>
          <Text style={styles.pinEmoji}>📍</Text>
          <Text style={styles.pinLabel}>Vous</Text>
        </View>

        <Animated.View
          style={[
            styles.pinDepanneur,
            {
              left: posAnim.x.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              top: posAnim.y.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <Text style={styles.pinEmoji}>🛻</Text>
          <Text style={styles.pinLabel}>Dépanneur</Text>
        </Animated.View>
      </View>

      <View style={styles.progressionBloc}>
        {ETAPES.map((etape, index) => (
          <View key={etape.label} style={styles.etapeRangee}>
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

      <View style={styles.depanneurCarte}>
        <View style={styles.depanneurAvatar}>
          <Text style={styles.avatarTexte}>
            {provider?.name ? provider.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : '??'}
          </Text>
        </View>
        <View style={styles.depanneurInfo}>
          <Text style={styles.depanneurNom}>{provider?.name || 'Dépanneur en attente d\'attribution'}</Text>
          <View style={styles.depanneurMeta}>
            {provider?.avgRating != null && <Text style={styles.depanneurNote}>⭐ {Number(provider.avgRating).toFixed(1)}</Text>}
            {provider?.phone && <Text style={styles.depanneurPlaque}>📞 {provider.phone}</Text>}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.boutonAppel} onPress={appelerDepanneur} activeOpacity={0.85}>
        <Text style={styles.boutonAppelTexte}>📞  Appeler le dépanneur</Text>
      </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  etaBloc: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 11,
    color: COULEURS.discret,
    marginBottom: 2,
  },
  etaTimer: {
    fontSize: 22,
    fontWeight: '800',
    color: COULEURS.primaire,
    fontVariant: ['tabular-nums'],
  },
  etaUrgent: {
    color: '#F44336',
  },
  carteSimulee: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#0F2027',
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    overflow: 'hidden',
    position: 'relative',
  },
  grilleLigne: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  grilleColonne: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pinClient: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinDepanneur: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinEmoji: {
    fontSize: 20,
  },
  pinLabel: {
    fontSize: 9,
    color: COULEURS.texte,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  progressionBloc: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 0,
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
  depanneurCarte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COULEURS.surface,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    gap: 14,
    marginBottom: 16,
  },
  depanneurAvatar: {
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
  depanneurInfo: {
    flex: 1,
  },
  depanneurNom: {
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.texte,
    marginBottom: 2,
  },
  depanneurSpecialite: {
    fontSize: 13,
    color: COULEURS.discret,
    marginBottom: 6,
  },
  depanneurMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  depanneurNote: {
    fontSize: 13,
    color: COULEURS.texte,
  },
  depanneurPlaque: {
    fontSize: 13,
    color: COULEURS.texte,
  },
  boutonAppel: {
    marginHorizontal: 16,
    backgroundColor: COULEURS.primaire,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  boutonAppelTexte: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
