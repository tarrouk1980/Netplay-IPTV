import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const COURSE = {
  depart: '12 Rue de la Paix, Alger Centre',
  destination: '47 Boulevard Mohamed V, Hydra',
  prixEstime: '850 DA',
  typeVehicule: 'Berline Standard',
};

export default function TaxiWaitingScreen({ navigation }) {
  const [points, setPoints] = useState('');
  const [secondes, setSecondes] = useState(0);
  const [pulse, setPulse] = useState(0);
  const intervalPoints = useRef(null);
  const intervalTimer = useRef(null);
  const intervalPulse = useRef(null);

  useEffect(() => {
    intervalPoints.current = setInterval(() => {
      setPoints(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    intervalTimer.current = setInterval(() => {
      setSecondes(prev => prev + 1);
    }, 1000);

    intervalPulse.current = setInterval(() => {
      setPulse(prev => (prev + 1) % 3);
    }, 800);

    return () => {
      clearInterval(intervalPoints.current);
      clearInterval(intervalTimer.current);
      clearInterval(intervalPulse.current);
    };
  }, []);

  const formatTemps = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleAnnuler = () => {
    Alert.alert(
      'Annuler la demande',
      'Êtes-vous sûr de vouloir annuler votre demande de taxi ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const rayons = [120, 90, 60, 30];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titre}>Recherche d'un chauffeur{points}</Text>
          <Text style={styles.timer}>{formatTemps(secondes)}</Text>
        </View>

        <View style={styles.carteContainer}>
          <View style={styles.carte}>
            {rayons.map((rayon, index) => (
              <View
                key={index}
                style={[
                  styles.cercle,
                  {
                    width: rayon * 2,
                    height: rayon * 2,
                    borderRadius: rayon,
                    borderColor: index === pulse
                      ? COLORS.primary
                      : `${COLORS.primary}33`,
                    borderWidth: index === pulse ? 2 : 1,
                    opacity: index === pulse ? 1 : 0.4,
                  },
                ]}
              />
            ))}
            <View style={styles.pointCentre} />
            <View style={styles.taxiEmoji}>
              <Text style={styles.taxiEmojiText}>📍</Text>
            </View>
          </View>
          <Text style={styles.legende}>Rayon de recherche : 5 km</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitre}>Détails de la course</Text>

          <View style={styles.ligneInfo}>
            <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
            <View style={styles.infoTexte}>
              <Text style={styles.infoLabel}>Départ</Text>
              <Text style={styles.infoValeur}>{COURSE.depart}</Text>
            </View>
          </View>

          <View style={styles.separateurVertical} />

          <View style={styles.ligneInfo}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <View style={styles.infoTexte}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValeur}>{COURSE.destination}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.lignePrix}>
            <View style={styles.prixItem}>
              <Text style={styles.prixLabel}>Prix estimé</Text>
              <Text style={styles.prixValeur}>{COURSE.prixEstime}</Text>
            </View>
            <View style={styles.prixItem}>
              <Text style={styles.prixLabel}>Véhicule</Text>
              <Text style={styles.prixValeur}>{COURSE.typeVehicule}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <Text style={styles.statusTexte}>Connexion aux chauffeurs disponibles...</Text>
        </View>

        <TouchableOpacity style={styles.btnAnnuler} onPress={handleAnnuler} activeOpacity={0.8}>
          <Text style={styles.btnAnnulerTexte}>Annuler la demande</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titre: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  timer: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  carteContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  carte: {
    width: 260,
    height: 260,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cercle: {
    position: 'absolute',
    alignSelf: 'center',
  },
  pointCentre: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    position: 'absolute',
  },
  taxiEmoji: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  taxiEmojiText: {
    fontSize: 24,
  },
  legende: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.muted,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardTitre: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  ligneInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 12,
  },
  infoTexte: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 2,
  },
  infoValeur: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  separateurVertical: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  lignePrix: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prixItem: {
    flex: 1,
  },
  prixLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },
  prixValeur: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  statusTexte: {
    fontSize: 13,
    color: COLORS.muted,
  },
  btnAnnuler: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FF4444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnAnnulerTexte: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4444',
  },
});
