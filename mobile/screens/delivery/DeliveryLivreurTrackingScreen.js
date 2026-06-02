import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const LIVREUR = {
  nom: 'Karim Benzali',
  note: 4.8,
  vehicule: 'Moto Honda CB500',
  avatar: 'KB',
  telephone: '+213 555 123 456',
};

const TIMELINE = [
  { label: 'Commande confirmée', statut: 'done' },
  { label: 'Préparation en cours', statut: 'done' },
  { label: 'Livreur en route', statut: 'active' },
  { label: 'Livré', statut: 'pending' },
];

export default function DeliveryLivreurTrackingScreen({ navigation }) {
  const livreurX = useRef(new Animated.Value(40)).current;
  const livreurY = useRef(new Animated.Value(80)).current;
  const [secondsLeft, setSecondsLeft] = useState(18 * 60);

  useEffect(() => {
    const deplacer = () => {
      Animated.parallel([
        Animated.timing(livreurX, {
          toValue: Math.random() * (width - 100) + 20,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(livreurY, {
          toValue: Math.random() * 100 + 30,
          duration: 1800,
          useNativeDriver: false,
        }),
      ]).start();
    };
    deplacer();
    const interval = setInterval(deplacer, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatETA = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titre}>Suivi de livraison</Text>
          <View style={styles.etaBadge}>
            <Text style={styles.etaLabel}>Arrivée dans</Text>
            <Text style={styles.etaValeur}>{formatETA(secondsLeft)}</Text>
          </View>
        </View>

        <View style={styles.carte}>
          <View style={styles.carteInner}>
            <View style={styles.routeH1} />
            <View style={styles.routeH2} />
            <View style={styles.routeV1} />
            <View style={styles.destination}>
              <Text style={styles.destinationIcon}>📍</Text>
            </View>
            <Animated.View style={[styles.livreurPoint, { left: livreurX, top: livreurY }]}>
              <Text style={styles.livreurEmoji}>🏍️</Text>
            </Animated.View>
          </View>
          <Text style={styles.carteLegende}>Position en temps réel</Text>
        </View>

        <View style={styles.livreurCard}>
          <View style={styles.livreurAvatar}>
            <Text style={styles.livreurAvatarText}>{LIVREUR.avatar}</Text>
          </View>
          <View style={styles.livreurInfo}>
            <Text style={styles.livreurNom}>{LIVREUR.nom}</Text>
            <Text style={styles.livreurVehicule}>{LIVREUR.vehicule}</Text>
            <View style={styles.noteRow}>
              <Text style={styles.etoile}>★</Text>
              <Text style={styles.noteText}>{LIVREUR.note}</Text>
            </View>
          </View>
          <View style={styles.livreurActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert('Appel', `Appel vers ${LIVREUR.telephone}`)}
            >
              <Text style={styles.actionIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.actionIcon}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitre}>Suivi de commande</Text>
          {TIMELINE.map((etape, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineGauche}>
                <View
                  style={[
                    styles.timelineDot,
                    etape.statut === 'done' && styles.dotDone,
                    etape.statut === 'active' && styles.dotActive,
                  ]}
                >
                  {etape.statut === 'done' && <Text style={styles.dotCheck}>✓</Text>}
                  {etape.statut === 'active' && <Text style={styles.dotActiveInner}>●</Text>}
                </View>
                {index < TIMELINE.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      etape.statut === 'done' && styles.lineDone,
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineDroite}>
                <Text
                  style={[
                    styles.timelineLabel,
                    etape.statut === 'pending' && styles.labelPending,
                    etape.statut === 'active' && styles.labelActive,
                  ]}
                >
                  {etape.label}
                  {etape.statut === 'done' ? ' ✅' : etape.statut === 'active' ? ' 🔄' : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.boutonsRow}>
          <TouchableOpacity
            style={styles.btnAppeler}
            onPress={() => Alert.alert('Appel', `Appel vers ${LIVREUR.telephone}`)}
          >
            <Text style={styles.btnAppelerText}>📞 Appeler le livreur</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnChat}
            onPress={() => navigation.navigate('Chat')}
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
  etaValeur: { fontSize: 20, fontWeight: '800', color: '#F5A623' },
  carte: { marginHorizontal: 16, marginBottom: 16 },
  carteInner: {
    height: 180,
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C3A',
    position: 'relative',
  },
  routeH1: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2C2C3A',
  },
  routeH2: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2C2C3A',
  },
  routeV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: width / 2 - 26,
    width: 2,
    backgroundColor: '#2C2C3A',
  },
  destination: {
    position: 'absolute',
    right: 30,
    top: 60,
  },
  destinationIcon: { fontSize: 28 },
  livreurPoint: {
    position: 'absolute',
  },
  livreurEmoji: { fontSize: 24 },
  carteLegende: {
    textAlign: 'center',
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 6,
  },
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
  livreurVehicule: { fontSize: 13, color: '#8E8E9A', marginTop: 2 },
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
