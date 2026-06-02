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
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const VALEURS_DEFAUT = {
  nomApp: 'EasyWay',
  langue: 'Français',
  devise: 'EUR (€)',
  delaiSession: '30 minutes',
  tentativesConnexion: '5 tentatives',
  notifPush: true,
  notifSMS: false,
  notifEmail: true,
  modeMaintenance: false,
};

export default function AdminPlatformSettingsScreen({ navigation }) {
  const [parametres, setParametres] = useState({ ...VALEURS_DEFAUT });

  const modifierTexte = (cle, labelActuel, valeurActuelle) => {
    Alert.alert(
      `Modifier — ${labelActuel}`,
      `Valeur actuelle : ${valeurActuelle}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Simuler modification',
          onPress: () => {
            setParametres((prev) => ({
              ...prev,
              [cle]: valeurActuelle + ' (modifié)',
            }));
          },
        },
      ]
    );
  };

  const reinitialiser = () => {
    Alert.alert(
      'Réinitialiser les paramètres',
      'Toutes les valeurs seront remises aux valeurs par défaut. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: () => setParametres({ ...VALEURS_DEFAUT }),
        },
      ]
    );
  };

  const toggleSwitch = (cle) => {
    setParametres((prev) => ({ ...prev, [cle]: !prev[cle] }));
  };

  const LigneTexte = ({ label, cleParam }) => (
    <View style={styles.ligne}>
      <View style={styles.ligneInfo}>
        <Text style={styles.ligneLabel}>{label}</Text>
        <Text style={styles.ligneValeur}>{parametres[cleParam]}</Text>
      </View>
      <TouchableOpacity
        style={styles.boutonModifier}
        onPress={() => modifierTexte(cleParam, label, parametres[cleParam])}
      >
        <Text style={styles.textModifier}>Modifier</Text>
      </TouchableOpacity>
    </View>
  );

  const LigneSwitch = ({ label, cleParam }) => (
    <View style={styles.ligne}>
      <View style={styles.ligneInfo}>
        <Text style={styles.ligneLabel}>{label}</Text>
        <Text style={styles.ligneValeur}>{parametres[cleParam] ? 'Activé' : 'Désactivé'}</Text>
      </View>
      <Switch
        value={parametres[cleParam]}
        onValueChange={() => toggleSwitch(cleParam)}
        trackColor={{ false: COULEURS.border, true: COULEURS.primary + '88' }}
        thumbColor={parametres[cleParam] ? COULEURS.primary : COULEURS.muted}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Text style={styles.textRetour}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>Paramètres de la plateforme</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contenu} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Général</Text>
          <View style={styles.carteSection}>
            <LigneTexte label="Nom de l'application" cleParam="nomApp" />
            <View style={styles.separateur} />
            <LigneTexte label="Langue par défaut" cleParam="langue" />
            <View style={styles.separateur} />
            <LigneTexte label="Devise" cleParam="devise" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Sécurité</Text>
          <View style={styles.carteSection}>
            <LigneTexte label="Délai de session" cleParam="delaiSession" />
            <View style={styles.separateur} />
            <LigneTexte label="Tentatives de connexion" cleParam="tentativesConnexion" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Notifications</Text>
          <View style={styles.carteSection}>
            <LigneSwitch label="Notifications push" cleParam="notifPush" />
            <View style={styles.separateur} />
            <LigneSwitch label="Notifications SMS" cleParam="notifSMS" />
            <View style={styles.separateur} />
            <LigneSwitch label="Notifications e-mail" cleParam="notifEmail" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Maintenance</Text>
          <View style={styles.carteSection}>
            <LigneSwitch label="Mode maintenance" cleParam="modeMaintenance" />
            {parametres.modeMaintenance && (
              <View style={styles.alerteMaintenance}>
                <Text style={styles.texteAlerteMaintenance}>
                  ⚠️ La plateforme est actuellement en maintenance. Les utilisateurs ne peuvent pas y accéder.
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.boutonReinitialiser} onPress={reinitialiser}>
          <Text style={styles.textReinitialiser}>Réinitialiser aux valeurs par défaut</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  boutonRetour: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRetour: {
    color: COULEURS.text,
    fontSize: 24,
  },
  titre: {
    color: COULEURS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  contenu: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  titreSection: {
    color: COULEURS.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  carteSection: {
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COULEURS.border,
    overflow: 'hidden',
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  ligneInfo: {
    flex: 1,
    marginRight: 12,
  },
  ligneLabel: {
    color: COULEURS.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  ligneValeur: {
    color: COULEURS.muted,
    fontSize: 12,
  },
  boutonModifier: {
    backgroundColor: COULEURS.primary + '22',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COULEURS.primary + '44',
  },
  textModifier: {
    color: COULEURS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.border,
    marginHorizontal: 16,
  },
  alerteMaintenance: {
    backgroundColor: '#F4433622',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F4433644',
  },
  texteAlerteMaintenance: {
    color: '#F44336',
    fontSize: 12,
    lineHeight: 18,
  },
  boutonReinitialiser: {
    backgroundColor: '#F4433622',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F4433644',
    marginTop: 8,
  },
  textReinitialiser: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '700',
  },
});
