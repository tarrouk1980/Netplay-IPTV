import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TAILLE = 8;

function genererGrille(seed) {
  const grille = [];
  for (let i = 0; i < TAILLE; i++) {
    const rangee = [];
    for (let j = 0; j < TAILLE; j++) {
      const val = ((Math.sin(seed + i * 3.7 + j * 1.3) + 1) / 2);
      rangee.push(Math.max(0.1, Math.min(1.0, val)));
    }
    grille.push(rangee);
  }
  return grille;
}

const DONNEES = {
  Taxi: genererGrille(1),
  Livraison: genererGrille(5),
  SOS: genererGrille(9),
};

const STATS = {
  Taxi: { zone: 'Centre-ville Nord', heure: '08h00 - 10h00', total: 1247 },
  Livraison: { zone: 'Quartier Commercial Est', heure: '12h00 - 14h00', total: 893 },
  SOS: { zone: 'Zone Périphérique Sud', heure: '22h00 - 00h00', total: 156 },
};

const TOGGLES = ['Taxi', 'Livraison', 'SOS'];

function couleurCellule(intensite) {
  if (intensite >= 0.75) return '#F5A623';
  if (intensite >= 0.5) return '#F5A623';
  if (intensite >= 0.25) return '#F5A623';
  return '#F5A623';
}

export default function AdminHeatmapScreen() {
  const [actif, setActif] = useState('Taxi');

  const grille = useMemo(() => DONNEES[actif], [actif]);
  const stats = STATS[actif];

  const cellSize = Math.floor((width - 40) / TAILLE);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titre}>Carte de densité</Text>

        <View style={styles.toggleContainer}>
          {TOGGLES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, actif === t && styles.toggleBtnActif]}
              onPress={() => setActif(t)}
            >
              <Text style={[styles.toggleTexte, actif === t && styles.toggleTexteActif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.carteContainer}>
          {grille.map((rangee, i) => (
            <View key={i} style={styles.rangee}>
              {rangee.map((intensite, j) => (
                <View
                  key={j}
                  style={[
                    styles.cellule,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: couleurCellule(intensite),
                      opacity: intensite,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.legende}>
          <Text style={styles.legendeTitre}>Intensité</Text>
          <View style={styles.legendeItems}>
            {[
              { label: 'Faible', opacite: 0.15 },
              { label: 'Moyen', opacite: 0.4 },
              { label: 'Élevé', opacite: 0.7 },
              { label: 'Très élevé', opacite: 1.0 },
            ].map((item) => (
              <View key={item.label} style={styles.legendeItem}>
                <View style={[styles.legendeCarre, { opacity: item.opacite }]} />
                <Text style={styles.legendeLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sousTitre}>Résumé statistique</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcone}>📍</Text>
            <View style={styles.statTextes}>
              <Text style={styles.statLabel}>Zone la plus active</Text>
              <Text style={styles.statValeur}>{stats.zone}</Text>
            </View>
          </View>
          <View style={styles.separateur} />
          <View style={styles.statItem}>
            <Text style={styles.statIcone}>⏰</Text>
            <View style={styles.statTextes}>
              <Text style={styles.statLabel}>Heure de pointe</Text>
              <Text style={styles.statValeur}>{stats.heure}</Text>
            </View>
          </View>
          <View style={styles.separateur} />
          <View style={styles.statItem}>
            <Text style={styles.statIcone}>📊</Text>
            <View style={styles.statTextes}>
              <Text style={styles.statLabel}>Total interventions</Text>
              <Text style={styles.statValeur}>{stats.total.toLocaleString('fr-FR')}</Text>
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
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    paddingBottom: 40,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActif: {
    backgroundColor: '#F5A623',
  },
  toggleTexte: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E9A',
  },
  toggleTexteActif: {
    color: '#0A0A0F',
  },
  carteContainer: {
    marginHorizontal: 20,
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    marginBottom: 20,
    overflow: 'hidden',
  },
  rangee: {
    flexDirection: 'row',
  },
  cellule: {
    borderWidth: 1,
    borderColor: '#0A0A0F',
  },
  legende: {
    marginHorizontal: 20,
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  legendeTitre: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E9A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendeItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendeItem: {
    alignItems: 'center',
    gap: 6,
  },
  legendeCarre: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F5A623',
  },
  legendeLabel: {
    fontSize: 11,
    color: '#8E8E9A',
    textAlign: 'center',
  },
  sousTitre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E9A',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statsContainer: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    overflow: 'hidden',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  statIcone: {
    fontSize: 22,
  },
  statTextes: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E9A',
    marginBottom: 4,
  },
  statValeur: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separateur: {
    height: 1,
    backgroundColor: '#2C2C3A',
    marginLeft: 52,
  },
});
