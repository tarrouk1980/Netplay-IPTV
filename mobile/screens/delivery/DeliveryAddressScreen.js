import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ADRESSES_RECENTES = [
  { id: 1, label: '45 Rue de la Paix, Paris 2e', distance: '1.2 km' },
  { id: 2, label: '12 Avenue des Champs-Élysées, Paris 8e', distance: '3.5 km' },
  { id: 3, label: '8 Boulevard Haussmann, Paris 9e', distance: '2.1 km' },
];

const FAVORIS = [
  { id: 1, icone: '🏠', label: 'Maison', adresse: '14 Rue des Lilas, Paris 11e' },
  { id: 2, icone: '🏢', label: 'Bureau', adresse: '32 Rue du Faubourg Saint-Antoine, Paris 12e' },
  { id: 3, icone: '👩', label: 'Chez maman', adresse: '7 Impasse des Roses, Vincennes' },
  { id: 4, icone: '💪', label: 'Salle de sport', adresse: '19 Rue de la Roquette, Paris 11e' },
];

const GRILLE_COLS = 10;
const GRILLE_LIGNES = 6;

export default function DeliveryAddressScreen({ navigation }) {
  const [adresseDepart, setAdresseDepart] = useState('');
  const [adresseDestination, setAdresseDestination] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.titre}>Où livrer ?</Text>

        <View style={styles.carteSimulee}>
          {Array.from({ length: GRILLE_LIGNES }).map((_, li) => (
            <View key={li} style={styles.grilleRangee}>
              {Array.from({ length: GRILLE_COLS }).map((_, ci) => (
                <View key={ci} style={styles.grilleCell} />
              ))}
            </View>
          ))}
          <View style={[styles.pin, { top: '30%', left: '20%' }]}>
            <Text style={styles.pinTexte}>📍</Text>
          </View>
          <View style={[styles.pin, { top: '55%', left: '65%' }]}>
            <Text style={styles.pinTexte}>🏁</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.champContainer}>
            <Text style={styles.champIcone}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresse de récupération"
              placeholderTextColor="#8E8E9A"
              value={adresseDepart}
              onChangeText={setAdresseDepart}
            />
          </View>
          <View style={styles.separateurVertical} />
          <View style={styles.champContainer}>
            <Text style={styles.champIcone}>🏁</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresse de livraison"
              placeholderTextColor="#8E8E9A"
              value={adresseDestination}
              onChangeText={setAdresseDestination}
            />
          </View>
        </View>

        <Text style={styles.sousTitre}>Adresses récentes</Text>
        <View style={styles.section}>
          {ADRESSES_RECENTES.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.listeItem, index < ADRESSES_RECENTES.length - 1 && styles.listeItemBorder]}
              onPress={() => setAdresseDestination(item.label)}
            >
              <Text style={styles.horlogeIcone}>🕐</Text>
              <View style={styles.listeItemTextes}>
                <Text style={styles.listeItemLabel}>{item.label}</Text>
                <Text style={styles.listeItemSub}>{item.distance}</Text>
              </View>
              <Text style={styles.fleche}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sousTitre}>Favoris</Text>
        <View style={styles.favorisGrille}>
          {FAVORIS.map((fav) => (
            <TouchableOpacity
              key={fav.id}
              style={styles.favoriItem}
              onPress={() => setAdresseDestination(fav.adresse)}
            >
              <View style={styles.favoriIconeContainer}>
                <Text style={styles.favoriIcone}>{fav.icone}</Text>
              </View>
              <Text style={styles.favoriLabel}>{fav.label}</Text>
              <Text style={styles.favoriAdresse} numberOfLines={1}>{fav.adresse}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.boutonContainer}>
        <TouchableOpacity
          style={[styles.bouton, (!adresseDepart || !adresseDestination) && styles.boutonDisabled]}
          onPress={() => navigation.navigate('Merchant')}
          disabled={!adresseDepart || !adresseDestination}
        >
          <Text style={styles.boutonTexte}>Confirmer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    paddingBottom: 100,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  carteSimulee: {
    marginHorizontal: 20,
    height: 180,
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  grilleRangee: {
    flexDirection: 'row',
    flex: 1,
  },
  grilleCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#2C2C3A',
  },
  pin: {
    position: 'absolute',
  },
  pinTexte: {
    fontSize: 22,
  },
  section: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    overflow: 'hidden',
  },
  champContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  champIcone: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  separateurVertical: {
    height: 1,
    backgroundColor: '#2C2C3A',
    marginLeft: 50,
  },
  sousTitre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E9A',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listeItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3A',
  },
  horlogeIcone: {
    fontSize: 18,
    marginRight: 12,
  },
  listeItemTextes: {
    flex: 1,
  },
  listeItemLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listeItemSub: {
    fontSize: 12,
    color: '#8E8E9A',
    marginTop: 2,
  },
  fleche: {
    fontSize: 20,
    color: '#8E8E9A',
  },
  favorisGrille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
    gap: 12,
  },
  favoriItem: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    padding: 14,
    width: (width - 56) / 2,
  },
  favoriIconeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  favoriIcone: {
    fontSize: 20,
  },
  favoriLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  favoriAdresse: {
    fontSize: 11,
    color: '#8E8E9A',
  },
  boutonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#2C2C3A',
  },
  bouton: {
    backgroundColor: '#F5A623',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonDisabled: {
    opacity: 0.4,
  },
  boutonTexte: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0F',
  },
});
