import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COULEURS = {
  fond: '#0A0A0F',
  surface: '#1C1C28',
  primaire: '#F5A623',
  texte: '#FFFFFF',
  discret: '#8E8E9A',
  bordure: '#2C2C3A',
};

const CONFIG_INITIALE = {
  taxi: {
    label: 'Taxi',
    icone: '🚕',
    actif: true,
    tarifBase: 250,
    commission: 15,
    rayon: 10,
    delaiMax: 20,
  },
  livraison: {
    label: 'Livraison',
    icone: '📦',
    actif: true,
    tarifBase: 180,
    commission: 18,
    rayon: 8,
    delaiMax: 45,
  },
  sos: {
    label: 'SOS Dépannage',
    icone: '🛻',
    actif: true,
    tarifBase: 1500,
    commission: 10,
    rayon: 25,
    delaiMax: 60,
  },
  epicerie: {
    label: 'Épicerie',
    icone: '🛒',
    actif: false,
    tarifBase: 100,
    commission: 20,
    rayon: 5,
    delaiMax: 30,
  },
};

function LigneConfig({ libelle, valeur, unite }) {
  return (
    <View style={styles.ligneConfig}>
      <Text style={styles.ligneLabel}>{libelle}</Text>
      <View style={styles.ligneValeurBloc}>
        <Text style={styles.ligneValeur}>{valeur}</Text>
        {unite ? <Text style={styles.ligneUnite}>{unite}</Text> : null}
      </View>
    </View>
  );
}

function SectionAccordeon({ cle, config, ouvert, onToggleOuvert, onToggleActif }) {
  return (
    <View style={styles.accordeon}>
      <TouchableOpacity
        style={styles.accordeonEntete}
        onPress={() => onToggleOuvert(cle)}
        activeOpacity={0.75}
      >
        <View style={styles.accordeonGauche}>
          <Text style={styles.accordeonIcone}>{config.icone}</Text>
          <Text style={styles.accordeonTitre}>{config.label}</Text>
        </View>
        <View style={styles.accordeonDroite}>
          <Switch
            value={config.actif}
            onValueChange={() => onToggleActif(cle)}
            trackColor={{ false: COULEURS.bordure, true: COULEURS.primaire }}
            thumbColor={config.actif ? '#FFFFFF' : COULEURS.discret}
          />
          <Text style={styles.chevron}>{ouvert ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {ouvert && (
        <View style={styles.accordeonCorps}>
          <View style={styles.separateur} />
          <LigneConfig libelle="Tarif de base" valeur={config.tarifBase} unite="DA" />
          <LigneConfig libelle="Commission plateforme" valeur={config.commission} unite="%" />
          <LigneConfig libelle="Rayon de recherche" valeur={config.rayon} unite="km" />
          <LigneConfig libelle="Délai max d'attente" valeur={config.delaiMax} unite="min" />
          <View style={styles.statutLigne}>
            <View
              style={[
                styles.statutIndicateur,
                config.actif ? styles.actifVert : styles.inactifRouge,
              ]}
            />
            <Text style={styles.statutTexte}>
              {config.actif ? 'Service activé' : 'Service désactivé'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function AdminServiceConfigScreen() {
  const [configs, setConfigs] = useState(CONFIG_INITIALE);
  const [sections, setSections] = useState({ taxi: false, livraison: false, sos: false, epicerie: false });

  const toggleSection = (cle) => {
    setSections((prev) => ({ ...prev, [cle]: !prev[cle] }));
  };

  const toggleActif = (cle) => {
    setConfigs((prev) => ({
      ...prev,
      [cle]: { ...prev[cle], actif: !prev[cle].actif },
    }));
  };

  const sauvegarder = () => {
    Alert.alert(
      'Confirmer la sauvegarde',
      'Voulez-vous appliquer ces paramètres de configuration à tous les services ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: () =>
            Alert.alert('Succès', 'La configuration a été sauvegardée avec succès.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.conteneur}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.entete}>
          <Text style={styles.titreEcran}>Configuration des services</Text>
          <Text style={styles.sousTitre}>Paramètres opérationnels de la plateforme</Text>
        </View>

        <View style={styles.listeAccordeons}>
          {Object.entries(configs).map(([cle, config]) => (
            <SectionAccordeon
              key={cle}
              cle={cle}
              config={config}
              ouvert={sections[cle]}
              onToggleOuvert={toggleSection}
              onToggleActif={toggleActif}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.boutonSauvegarder} onPress={sauvegarder} activeOpacity={0.85}>
          <Text style={styles.boutonTexte}>Sauvegarder</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.fond,
  },
  scroll: {
    paddingBottom: 40,
  },
  entete: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  titreEcran: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.texte,
    marginBottom: 4,
  },
  sousTitre: {
    fontSize: 14,
    color: COULEURS.discret,
  },
  listeAccordeons: {
    paddingHorizontal: 16,
    gap: 12,
  },
  accordeon: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    overflow: 'hidden',
  },
  accordeonEntete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordeonGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accordeonIcone: {
    fontSize: 22,
  },
  accordeonTitre: {
    fontSize: 16,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  accordeonDroite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevron: {
    fontSize: 11,
    color: COULEURS.discret,
  },
  accordeonCorps: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.bordure,
    marginBottom: 14,
  },
  ligneConfig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  ligneLabel: {
    fontSize: 14,
    color: COULEURS.discret,
  },
  ligneValeurBloc: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  ligneValeur: {
    fontSize: 15,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  ligneUnite: {
    fontSize: 12,
    color: COULEURS.discret,
  },
  statutLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  statutIndicateur: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actifVert: {
    backgroundColor: '#4CAF50',
  },
  inactifRouge: {
    backgroundColor: '#F44336',
  },
  statutTexte: {
    fontSize: 13,
    color: COULEURS.discret,
  },
  boutonSauvegarder: {
    margin: 16,
    marginTop: 24,
    backgroundColor: COULEURS.primaire,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  boutonTexte: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
