import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
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

const CODES_INITIAUX = [
  {
    id: '1',
    code: 'BIENVENUE20',
    type: 'pourcentage',
    reduction: 20,
    utilisations: 145,
    limite: 500,
    expiration: '30 juin 2026',
    statut: 'Actif',
  },
  {
    id: '2',
    code: 'ETE150',
    type: 'fixe',
    reduction: 150,
    utilisations: 500,
    limite: 500,
    expiration: '1 juil 2026',
    statut: 'Épuisé',
  },
  {
    id: '3',
    code: 'FIDELE10',
    type: 'pourcentage',
    reduction: 10,
    utilisations: 89,
    limite: 1000,
    expiration: '31 déc 2026',
    statut: 'Actif',
  },
  {
    id: '4',
    code: 'FLASH200',
    type: 'fixe',
    reduction: 200,
    utilisations: 300,
    limite: 300,
    expiration: '15 mai 2026',
    statut: 'Expiré',
  },
  {
    id: '5',
    code: 'RAMADAN25',
    type: 'pourcentage',
    reduction: 25,
    utilisations: 412,
    limite: 600,
    expiration: '10 avr 2026',
    statut: 'Expiré',
  },
  {
    id: '6',
    code: 'VIP30',
    type: 'pourcentage',
    reduction: 30,
    utilisations: 22,
    limite: 100,
    expiration: '31 août 2026',
    statut: 'Actif',
  },
  {
    id: '7',
    code: 'NOUVEAU100',
    type: 'fixe',
    reduction: 100,
    utilisations: 0,
    limite: 200,
    expiration: '30 sept 2026',
    statut: 'Actif',
  },
  {
    id: '8',
    code: 'WEEK50',
    type: 'fixe',
    reduction: 50,
    utilisations: 200,
    limite: 200,
    expiration: '31 mars 2026',
    statut: 'Épuisé',
  },
];

const FILTRES = ['Actifs', 'Expirés', 'Épuisés'];

const couleurStatut = (statut) => {
  if (statut === 'Actif') return '#4CAF50';
  if (statut === 'Expiré') return '#F44336';
  if (statut === 'Épuisé') return '#FF9800';
  return '#8E8E9A';
};

export default function AdminPromoCodesV2Screen() {
  const [codes, setCodes] = useState(CODES_INITIAUX);
  const [filtreActif, setFiltreActif] = useState('Actifs');

  const codesFiltres = codes.filter((c) => {
    if (filtreActif === 'Actifs') return c.statut === 'Actif';
    if (filtreActif === 'Expirés') return c.statut === 'Expiré';
    if (filtreActif === 'Épuisés') return c.statut === 'Épuisé';
    return true;
  });

  const codesActifs = codes.filter((c) => c.statut === 'Actif').length;
  const utilisationsMois = 1668;
  const economies = 24350;

  const toggleStatut = (id) => {
    setCodes((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, statut: c.statut === 'Actif' ? 'Expiré' : 'Actif' };
      })
    );
  };

  const supprimerCode = (id, code) => {
    Alert.alert(
      'Supprimer le code',
      `Voulez-vous supprimer le code "${code}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setCodes((prev) => prev.filter((c) => c.id !== id)),
        },
      ]
    );
  };

  const copierCode = (code) => {
    Alert.alert('Code copié', `Le code "${code}" a été copié dans le presse-papiers.`);
  };

  const creerCode = () => {
    Alert.alert(
      'Créer un code promo',
      'Fonctionnalité disponible prochainement.\n\nChamps : Code, Réduction (% ou fixe), Limite, Date expiration.',
      [{ text: 'Fermer' }]
    );
  };

  const renderCode = ({ item }) => (
    <View style={styles.carte}>
      <View style={styles.carteEntete}>
        <View>
          <Text style={styles.codeTexte}>{item.code}</Text>
          <Text style={styles.reductionTexte}>
            {item.type === 'pourcentage'
              ? `-${item.reduction}%`
              : `-${item.reduction} DA`}
          </Text>
        </View>
        <View
          style={[
            styles.badgeStatut,
            { backgroundColor: couleurStatut(item.statut) + '22' },
          ]}
        >
          <Text
            style={[styles.textStatut, { color: couleurStatut(item.statut) }]}
          >
            {item.statut}
          </Text>
        </View>
      </View>

      <View style={styles.infoRangee}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Utilisations</Text>
          <Text style={styles.infoValeur}>
            {item.utilisations}/{item.limite}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Expiration</Text>
          <Text style={styles.infoValeur}>{item.expiration}</Text>
        </View>
      </View>

      <View style={styles.progression}>
        <View
          style={[
            styles.progressionBarre,
            {
              width: `${Math.min(
                (item.utilisations / item.limite) * 100,
                100
              )}%`,
              backgroundColor: couleurStatut(item.statut),
            },
          ]}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnToggle]}
          onPress={() => toggleStatut(item.id)}
        >
          <Text style={styles.actionBtnTexte}>
            {item.statut === 'Actif' ? 'Désactiver' : 'Activer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnCopier]}
          onPress={() => copierCode(item.code)}
        >
          <Text style={styles.actionBtnTexte}>Copier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSuppr]}
          onPress={() => supprimerCode(item.id, item.code)}
        >
          <Text style={[styles.actionBtnTexte, { color: '#F44336' }]}>
            Supprimer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Codes Promo</Text>
        <TouchableOpacity style={styles.btnCreer} onPress={creerCode}>
          <Text style={styles.btnCreerTexte}>+ Créer un code</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        style={styles.statsScrollView}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statValeur}>{codesActifs}</Text>
          <Text style={styles.statLabel}>Codes actifs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValeur}>{utilisationsMois}</Text>
          <Text style={styles.statLabel}>Utilisations ce mois</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValeur}>{economies} DA</Text>
          <Text style={styles.statLabel}>Économies générées</Text>
        </View>
      </ScrollView>

      <View style={styles.filtres}>
        {FILTRES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtreBouton,
              filtreActif === f && styles.filtreBoutonActif,
            ]}
            onPress={() => setFiltreActif(f)}
          >
            <Text
              style={[
                styles.filtreTexte,
                filtreActif === f && styles.filtreTexteActif,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={codesFiltres}
        keyExtractor={(item) => item.id}
        renderItem={renderCode}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Text style={styles.videTexte}>Aucun code dans cette catégorie</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.text,
  },
  btnCreer: {
    backgroundColor: COULEURS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnCreerTexte: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  statsScrollView: {
    marginBottom: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    minWidth: 140,
    borderWidth: 1,
    borderColor: COULEURS.border,
    alignItems: 'center',
  },
  statValeur: {
    fontSize: 20,
    fontWeight: '700',
    color: COULEURS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COULEURS.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  filtres: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filtreBouton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  filtreBoutonActif: {
    backgroundColor: COULEURS.primary,
    borderColor: COULEURS.primary,
  },
  filtreTexte: {
    fontSize: 13,
    color: COULEURS.muted,
    fontWeight: '500',
  },
  filtreTexteActif: {
    color: '#000',
    fontWeight: '700',
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  carteEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  codeTexte: {
    fontSize: 18,
    fontWeight: '700',
    color: COULEURS.text,
    letterSpacing: 1,
  },
  reductionTexte: {
    fontSize: 14,
    color: COULEURS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  badgeStatut: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  textStatut: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRangee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {},
  infoLabel: {
    fontSize: 11,
    color: COULEURS.muted,
  },
  infoValeur: {
    fontSize: 13,
    color: COULEURS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  progression: {
    height: 4,
    backgroundColor: COULEURS.border,
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressionBarre: {
    height: '100%',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COULEURS.border,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnToggle: {
    backgroundColor: COULEURS.primary + '22',
  },
  actionBtnCopier: {
    backgroundColor: COULEURS.border,
  },
  actionBtnSuppr: {
    backgroundColor: '#F4433622',
  },
  actionBtnTexte: {
    fontSize: 12,
    fontWeight: '600',
    color: COULEURS.primary,
  },
  vide: {
    alignItems: 'center',
    marginTop: 60,
  },
  videTexte: {
    fontSize: 15,
    color: COULEURS.muted,
  },
});
