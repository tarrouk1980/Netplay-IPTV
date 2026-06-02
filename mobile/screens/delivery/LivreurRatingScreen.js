import React from 'react';
import {
  View,
  Text,
  StyleSheet,
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

const LIVREUR = {
  nom: 'Karim B.',
  vehicule: '🛻 Pickup — Alger',
  noteMoyenne: 4.6,
  totalAvis: 248,
  pourcentage5etoiles: 72,
};

const DIMENSIONS_RADAR = [
  { label: 'Rapidité', valeur: 0.88 },
  { label: 'Ponctualité', valeur: 0.92 },
  { label: 'Amabilité', valeur: 0.95 },
  { label: 'Présentation', valeur: 0.78 },
  { label: 'Communication', valeur: 0.85 },
];

const AVIS = [
  { id: '1', client: 'C****i', note: 5, commentaire: 'Livraison rapide et soignée, livreur très poli.', date: '01/06/2026' },
  { id: '2', client: 'N****r', note: 4, commentaire: 'Correct dans l\'ensemble, quelques minutes de retard.', date: '31/05/2026' },
  { id: '3', client: 'A****a', note: 5, commentaire: 'Parfait ! Emballage intact et souriant.', date: '30/05/2026' },
  { id: '4', client: 'M****d', note: 3, commentaire: 'Livraison OK mais difficile à joindre par téléphone.', date: '29/05/2026' },
  { id: '5', client: 'S****h', note: 5, commentaire: 'Excellent livreur, je recommande.', date: '28/05/2026' },
  { id: '6', client: 'Y****s', note: 4, commentaire: 'Bonne prestation, véhicule propre.', date: '27/05/2026' },
];

const RAYON = 80;
const CENTRE = RAYON + 10;
const TAILLE_SVG = (RAYON + 10) * 2;
const N = DIMENSIONS_RADAR.length;

function getPoint(index, fraction, rayon) {
  const angle = (Math.PI * 2 * index) / N - Math.PI / 2;
  return {
    x: CENTRE + rayon * fraction * Math.cos(angle),
    y: CENTRE + rayon * fraction * Math.sin(angle),
  };
}

function Etoiles({ note, taille = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: taille, color: i <= note ? COLORS.primary : COLORS.border }}>
          ★
        </Text>
      ))}
    </View>
  );
}

function RadarChart() {
  const niveaux = [0.25, 0.5, 0.75, 1.0];

  const pointsValeurs = DIMENSIONS_RADAR.map((d, i) => getPoint(i, d.valeur, RAYON));

  return (
    <View style={styles.radarWrapper}>
      <View style={[styles.radarSvg, { width: TAILLE_SVG, height: TAILLE_SVG }]}>
        {niveaux.map((niveau, ni) => (
          <View key={ni} style={StyleSheet.absoluteFill}>
            {DIMENSIONS_RADAR.map((_, i) => {
              const p1 = getPoint(i, niveau, RAYON);
              const p2 = getPoint((i + 1) % N, niveau, RAYON);
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const longueur = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: p1.x,
                    top: p1.y,
                    width: longueur,
                    height: 1,
                    backgroundColor: COLORS.border,
                    transformOrigin: 'left center',
                    transform: [{ rotate: `${angle}deg` }],
                  }}
                />
              );
            })}
          </View>
        ))}

        {DIMENSIONS_RADAR.map((_, i) => {
          const p = getPoint(i, 1, RAYON);
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: CENTRE,
                top: CENTRE,
                width: p.x - CENTRE,
                height: 1,
                backgroundColor: COLORS.border,
                transformOrigin: 'left center',
                transform: [
                  { rotate: `${Math.atan2(p.y - CENTRE, p.x - CENTRE) * (180 / Math.PI)}deg` },
                ],
              }}
            />
          );
        })}

        {pointsValeurs.map((p, i) => {
          const p2 = pointsValeurs[(i + 1) % N];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const longueur = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                width: longueur,
                height: 2,
                backgroundColor: COLORS.primary,
                opacity: 0.9,
                transformOrigin: 'left center',
                transform: [{ rotate: `${angle}deg` }],
              }}
            />
          );
        })}

        {pointsValeurs.map((p, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x - 4,
              top: p.y - 4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: COLORS.primary,
            }}
          />
        ))}

        {DIMENSIONS_RADAR.map((d, i) => {
          const p = getPoint(i, 1.3, RAYON);
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: p.x - 36,
                top: p.y - 8,
                width: 72,
                alignItems: 'center',
              }}
            >
              <Text style={styles.radarLabel}>{d.label}</Text>
              <Text style={styles.radarPourcent}>{Math.round(d.valeur * 100)}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function LivreurRatingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexte}>🛻</Text>
          </View>
          <View>
            <Text style={styles.nomLivreur}>{LIVREUR.nom}</Text>
            <Text style={styles.vehicule}>{LIVREUR.vehicule}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValeur}>{LIVREUR.noteMoyenne}</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
            <Etoiles note={Math.round(LIVREUR.noteMoyenne)} taille={12} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValeur}>{LIVREUR.totalAvis}</Text>
            <Text style={styles.statLabel}>Total avis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValeur, { color: '#4CAF50' }]}>{LIVREUR.pourcentage5etoiles}%</Text>
            <Text style={styles.statLabel}>Avis 5 ★</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Performance détaillée</Text>
          <View style={styles.radarCard}>
            <RadarChart />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Avis récents</Text>
          {AVIS.map(avis => (
            <View key={avis.id} style={styles.avisCard}>
              <View style={styles.avisHeader}>
                <View style={styles.clientBadge}>
                  <Text style={styles.clientTexte}>{avis.client}</Text>
                </View>
                <Etoiles note={avis.note} taille={14} />
                <Text style={styles.avisDate}>{avis.date}</Text>
              </View>
              <Text style={styles.avisCommentaire}>{avis.commentaire}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 30 }} />
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
  },
  profil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexte: {
    fontSize: 26,
  },
  nomLivreur: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  vehicule: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 4,
  },
  statValeur: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitre: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  radarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  radarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  radarSvg: {
    position: 'relative',
  },
  radarLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  radarPourcent: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  avisCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  clientBadge: {
    backgroundColor: `${COLORS.primary}22`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  clientTexte: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  avisDate: {
    marginLeft: 'auto',
    fontSize: 12,
    color: COLORS.muted,
  },
  avisCommentaire: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});
