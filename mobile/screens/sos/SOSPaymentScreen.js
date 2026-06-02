import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INTERVENTION = {
  typePanne: 'Crevaison',
  depanneur: 'Hassan Merbah',
  duree: '45 min',
  distance: '3,2 km',
};

const PRIX = {
  mainOeuvre: 1500,
  pieces: 800,
  deplacement: 400,
};

const MODES_PAIEMENT = [
  { id: 'wallet', label: 'Wallet', description: 'Solde disponible : 4 200 DA', icone: '👛' },
  { id: 'especes', label: 'Espèces', description: 'Payer en main propre', icone: '💵' },
  { id: 'carte', label: 'Carte bancaire', description: 'Visa / CIB / Edahabia', icone: '💳' },
];

export default function SOSPaymentScreen({ navigation }) {
  const [modePaiement, setModePaiement] = useState('wallet');
  const [note, setNote] = useState(0);

  const total = PRIX.mainOeuvre + PRIX.pieces + PRIX.deplacement;

  const confirmerPaiement = () => {
    const modeLabel = MODES_PAIEMENT.find(m => m.id === modePaiement)?.label || modePaiement;
    Alert.alert(
      'Confirmer le paiement',
      `Vous allez payer ${total.toLocaleString('fr-DZ')} DA via ${modeLabel}.\n\nConfirmer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => navigation.navigate('SOSRating'),
        },
      ]
    );
  };

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
              <Text style={styles.recapNom}>{INTERVENTION.depanneur}</Text>
              <Text style={styles.recapMuted}>Dépanneur</Text>
            </View>
          </View>
          <View style={styles.separateur} />
          <View style={styles.recapDetails}>
            <View style={styles.recapDetailItem}>
              <Text style={styles.recapDetailLabel}>Type de panne</Text>
              <Text style={styles.recapDetailValeur}>{INTERVENTION.typePanne}</Text>
            </View>
            <View style={styles.recapDetailItem}>
              <Text style={styles.recapDetailLabel}>Durée</Text>
              <Text style={styles.recapDetailValeur}>{INTERVENTION.duree}</Text>
            </View>
            <View style={styles.recapDetailItem}>
              <Text style={styles.recapDetailLabel}>Distance</Text>
              <Text style={styles.recapDetailValeur}>{INTERVENTION.distance}</Text>
            </View>
          </View>
        </View>

        <View style={styles.prixCard}>
          <Text style={styles.sectionTitre}>Décomposition du prix</Text>
          <View style={styles.lignesPrix}>
            <View style={styles.lignePrix}>
              <Text style={styles.lignePrixLabel}>Main d'œuvre</Text>
              <Text style={styles.lignePrixValeur}>{PRIX.mainOeuvre.toLocaleString('fr-DZ')} DA</Text>
            </View>
            <View style={styles.lignePrix}>
              <Text style={styles.lignePrixLabel}>Pièces</Text>
              <Text style={styles.lignePrixValeur}>{PRIX.pieces.toLocaleString('fr-DZ')} DA</Text>
            </View>
            <View style={styles.lignePrix}>
              <Text style={styles.lignePrixLabel}>Déplacement</Text>
              <Text style={styles.lignePrixValeur}>{PRIX.deplacement.toLocaleString('fr-DZ')} DA</Text>
            </View>
          </View>
          <View style={styles.separateur} />
          <View style={styles.ligneTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValeur}>{total.toLocaleString('fr-DZ')} DA</Text>
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

        <TouchableOpacity style={styles.btnConfirmer} onPress={confirmerPaiement}>
          <Text style={styles.btnConfirmerText}>Confirmer le paiement — {total.toLocaleString('fr-DZ')} DA</Text>
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
  lignesPrix: { gap: 10 },
  lignePrix: { flexDirection: 'row', justifyContent: 'space-between' },
  lignePrixLabel: { fontSize: 14, color: '#8E8E9A' },
  lignePrixValeur: { fontSize: 14, color: '#FFFFFF' },
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
