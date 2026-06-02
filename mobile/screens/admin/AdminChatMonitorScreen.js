import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const CONVERSATIONS = [
  { id: '1', client: 'Amina B.', agent: 'Chauffeur Yacine K.', dernierMessage: 'Je suis devant l\'entrée principale', heure: '14:32', statut: 'Actif' },
  { id: '2', client: 'Omar M.', agent: 'Livreur Farid D.', dernierMessage: 'Votre colis est en route', heure: '14:18', statut: 'Actif' },
  { id: '3', client: 'Soraya H.', agent: 'Chauffeur Bilal T.', dernierMessage: 'Langage inapproprié dans ce chat', heure: '13:55', statut: 'Signalé' },
  { id: '4', client: 'Mehdi R.', agent: 'Livreur Nassim A.', dernierMessage: 'Merci, à bientôt !', heure: '13:30', statut: 'Fermé' },
  { id: '5', client: 'Lila C.', agent: 'Chauffeur Hamza B.', dernierMessage: 'Combien de temps encore ?', heure: '13:12', statut: 'Actif' },
  { id: '6', client: 'Rami F.', agent: 'Livreur Khaled S.', dernierMessage: 'Comportement suspect signalé', heure: '12:47', statut: 'Signalé' },
  { id: '7', client: 'Nadia O.', agent: 'Chauffeur Samir Z.', dernierMessage: 'Course terminée, merci', heure: '11:58', statut: 'Fermé' },
  { id: '8', client: 'Tarek W.', agent: 'Livreur Mourad L.', dernierMessage: 'Je ne trouve pas l\'adresse', heure: '11:20', statut: 'Actif' },
];

function couleurStatut(statut) {
  if (statut === 'Actif') return '#4CAF50';
  if (statut === 'Signalé') return '#F44336';
  return COULEURS.muted;
}

function optionsConversation(item) {
  Alert.alert(
    `Conversation ${item.id}`,
    `${item.client} ↔ ${item.agent}`,
    [
      { text: 'Voir', onPress: () => {} },
      { text: 'Fermer', onPress: () => {} },
      { text: 'Bannir utilisateur', style: 'destructive', onPress: () => {} },
      { text: 'Annuler', style: 'cancel' },
    ]
  );
}

export default function AdminChatMonitorScreen() {
  const total = CONVERSATIONS.length;
  const actives = CONVERSATIONS.filter(c => c.statut === 'Actif').length;
  const signalees = CONVERSATIONS.filter(c => c.statut === 'Signalé').length;

  function renderItem({ item }) {
    const signale = item.statut === 'Signalé';
    return (
      <TouchableOpacity
        style={[styles.card, signale && styles.cardSignalee]}
        onPress={() => optionsConversation(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View style={styles.participants}>
            <Text style={styles.nomParticipant}>{item.client}</Text>
            <Text style={styles.fleche}>↔</Text>
            <Text style={styles.nomAgent}>{item.agent}</Text>
          </View>
          <View style={styles.droite}>
            <Text style={styles.heure}>{item.heure}</Text>
            <View style={[styles.badgeStatut, { backgroundColor: couleurStatut(item.statut) }]}>
              {signale && <Text style={styles.badgePoint}>●</Text>}
              <Text style={styles.badgeTexte}>{item.statut}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.dernierMessage} numberOfLines={1}>{item.dernierMessage}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.titre}>Supervision des Chats</Text>

      <View style={styles.compteurs}>
        <View style={styles.compteurCard}>
          <Text style={styles.compteurValeur}>{total}</Text>
          <Text style={styles.compteurLabel}>Total</Text>
        </View>
        <View style={styles.compteurCard}>
          <Text style={[styles.compteurValeur, { color: '#4CAF50' }]}>{actives}</Text>
          <Text style={styles.compteurLabel}>Actives</Text>
        </View>
        <View style={styles.compteurCard}>
          <Text style={[styles.compteurValeur, { color: '#F44336' }]}>{signalees}</Text>
          <Text style={styles.compteurLabel}>Signalées</Text>
        </View>
      </View>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  titre: {
    fontSize: 22,
    fontWeight: '700',
    color: COULEURS.text,
    padding: 20,
    paddingBottom: 12,
  },
  compteurs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  compteurCard: {
    flex: 1,
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  compteurValeur: {
    fontSize: 24,
    fontWeight: '800',
    color: COULEURS.primary,
  },
  compteurLabel: {
    fontSize: 12,
    color: COULEURS.muted,
    marginTop: 2,
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
  card: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  cardSignalee: {
    borderColor: '#F44336',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  participants: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginRight: 8,
  },
  nomParticipant: {
    fontSize: 14,
    fontWeight: '600',
    color: COULEURS.text,
  },
  fleche: {
    fontSize: 13,
    color: COULEURS.muted,
  },
  nomAgent: {
    fontSize: 13,
    color: COULEURS.muted,
  },
  droite: {
    alignItems: 'flex-end',
    gap: 4,
  },
  heure: {
    fontSize: 12,
    color: COULEURS.muted,
  },
  badgeStatut: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  badgePoint: {
    fontSize: 8,
    color: '#FFFFFF',
  },
  badgeTexte: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dernierMessage: {
    fontSize: 13,
    color: COULEURS.muted,
    fontStyle: 'italic',
  },
});
