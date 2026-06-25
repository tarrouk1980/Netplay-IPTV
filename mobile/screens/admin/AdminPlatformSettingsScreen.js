import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
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

// Champs réellement supportés par le backend (GET/PUT /api/admin/settings,
// backé par appSettingsStore — voir backend/src/routes/admin.js).
const VALEURS_DEFAUT = {
  taxiBaseFare: 2,
  taxiPerKm: 0.8,
  sosCalloutFee: 10,
  deliveryBaseFee: 3,
  deliveryPerKm: 0.5,
  commissionRate: 0,
  taxiEnabled: true,
  sosEnabled: true,
  deliveryEnabled: true,
  groceryEnabled: true,
  newRegistrations: true,
  maxOrderRadius: 15,
  driverIdleTimeout: 10,
  maintenanceMode: false,
  appVersion: '1.0.0',
  minAppVersion: '1.0.0',
};

export default function AdminPlatformSettingsScreen({ navigation }) {
  const [parametres, setParametres] = useState({ ...VALEURS_DEFAUT });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erreurChargement, setErreurChargement] = useState(null);

  const chargerParametres = useCallback(async () => {
    setLoading(true);
    setErreurChargement(null);
    try {
      const res = await api.get('/api/admin/settings');
      setParametres((prev) => ({ ...prev, ...(res.data || {}) }));
    } catch (err) {
      console.error('[AdminPlatformSettingsScreen] chargerParametres', err);
      setErreurChargement(
        err.response?.data?.error || 'Impossible de charger les paramètres de la plateforme.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerParametres();
  }, [chargerParametres]);

  const sauvegarder = async (patch) => {
    setSaving(true);
    try {
      const res = await api.put('/api/admin/settings', patch);
      setParametres((prev) => ({ ...prev, ...(res.data || patch) }));
      return true;
    } catch (err) {
      console.error('[AdminPlatformSettingsScreen] sauvegarder', err);
      Alert.alert(
        'Erreur',
        err.response?.data?.error || 'La mise à jour des paramètres a échoué.'
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const modifierNombre = (cle, label, valeurActuelle) => {
    Alert.prompt
      ? Alert.prompt(
          `Modifier — ${label}`,
          `Valeur actuelle : ${valeurActuelle}`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Enregistrer',
              onPress: async (saisie) => {
                const valeur = parseFloat(saisie);
                if (Number.isNaN(valeur)) {
                  Alert.alert('Valeur invalide', 'Veuillez saisir un nombre.');
                  return;
                }
                await sauvegarder({ [cle]: valeur });
              },
            },
          ],
          'plain-text',
          String(valeurActuelle)
        )
      : Alert.alert(
          'Non disponible',
          'La saisie de texte n\'est pas disponible sur cette plateforme.'
        );
  };

  const toggleSwitch = async (cle) => {
    const nouvelleValeur = !parametres[cle];
    const ok = await sauvegarder({ [cle]: nouvelleValeur });
    if (!ok) return; // garder l'état précédent en cas d'échec
  };

  const LigneNombre = ({ label, cleParam, suffixe = '' }) => (
    <View style={styles.ligne}>
      <View style={styles.ligneInfo}>
        <Text style={styles.ligneLabel}>{label}</Text>
        <Text style={styles.ligneValeur}>{parametres[cleParam]}{suffixe}</Text>
      </View>
      <TouchableOpacity
        style={styles.boutonModifier}
        onPress={() => modifierNombre(cleParam, label, parametres[cleParam])}
        disabled={saving}
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
        value={!!parametres[cleParam]}
        onValueChange={() => toggleSwitch(cleParam)}
        disabled={saving}
        trackColor={{ false: COULEURS.border, true: COULEURS.primary + '88' }}
        thumbColor={parametres[cleParam] ? COULEURS.primary : COULEURS.muted}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COULEURS.primary} />
        <Text style={styles.loaderTxt}>Chargement des paramètres...</Text>
      </SafeAreaView>
    );
  }

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

        {erreurChargement && (
          <View style={styles.alerteErreur}>
            <Text style={styles.texteAlerteErreur}>⚠️ {erreurChargement}</Text>
            <TouchableOpacity onPress={chargerParametres} style={styles.boutonReessayer}>
              <Text style={styles.textReessayer}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.titreSection}>Tarification</Text>
          <View style={styles.carteSection}>
            <LigneNombre label="Tarif de base Taxi (TND)" cleParam="taxiBaseFare" />
            <View style={styles.separateur} />
            <LigneNombre label="Tarif Taxi / km (TND)" cleParam="taxiPerKm" />
            <View style={styles.separateur} />
            <LigneNombre label="Frais d'intervention SOS (TND)" cleParam="sosCalloutFee" />
            <View style={styles.separateur} />
            <LigneNombre label="Tarif de base Livraison (TND)" cleParam="deliveryBaseFee" />
            <View style={styles.separateur} />
            <LigneNombre label="Tarif Livraison / km (TND)" cleParam="deliveryPerKm" />
            <View style={styles.separateur} />
            <LigneNombre label="Taux de commission (%)" cleParam="commissionRate" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Services</Text>
          <View style={styles.carteSection}>
            <LigneSwitch label="Service Taxi" cleParam="taxiEnabled" />
            <View style={styles.separateur} />
            <LigneSwitch label="Service SOS" cleParam="sosEnabled" />
            <View style={styles.separateur} />
            <LigneSwitch label="Service Livraison" cleParam="deliveryEnabled" />
            <View style={styles.separateur} />
            <LigneSwitch label="Service Épicerie" cleParam="groceryEnabled" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Inscriptions & opérations</Text>
          <View style={styles.carteSection}>
            <LigneSwitch label="Nouvelles inscriptions" cleParam="newRegistrations" />
            <View style={styles.separateur} />
            <LigneNombre label="Rayon max. de commande (km)" cleParam="maxOrderRadius" />
            <View style={styles.separateur} />
            <LigneNombre label="Délai d'inactivité chauffeur (min)" cleParam="driverIdleTimeout" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Versions de l'application</Text>
          <View style={styles.carteSection}>
            <LigneNombre label="Version actuelle" cleParam="appVersion" />
            <View style={styles.separateur} />
            <LigneNombre label="Version minimale requise" cleParam="minAppVersion" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Maintenance</Text>
          <View style={styles.carteSection}>
            <LigneSwitch label="Mode maintenance" cleParam="maintenanceMode" />
            {parametres.maintenanceMode && (
              <View style={styles.alerteMaintenance}>
                <Text style={styles.texteAlerteMaintenance}>
                  ⚠️ La plateforme est actuellement en maintenance. Les utilisateurs ne peuvent pas y accéder.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.titreSection}>Non disponible</Text>
          <View style={styles.carteSection}>
            <View style={styles.ligne}>
              <Text style={styles.texteIndisponible}>
                Les paramètres généraux (nom de l'app, langue, devise), de sécurité (délai de
                session, tentatives de connexion) et de notifications (push/SMS/e-mail) ne sont
                pas encore pris en charge par l'API backend. Aucune fonctionnalité n'a été
                simulée ici — contactez l'équipe backend pour exposer ces réglages.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderTxt: {
    color: COULEURS.muted,
    fontSize: 14,
    marginTop: 12,
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
  alerteErreur: {
    backgroundColor: '#F4433622',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F4433644',
    marginBottom: 16,
  },
  texteAlerteErreur: {
    color: '#F44336',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  boutonReessayer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F4433644',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textReessayer: {
    color: COULEURS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  texteIndisponible: {
    color: COULEURS.muted,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
