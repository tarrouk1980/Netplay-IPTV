import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#4CAF50',
  red: '#F44336',
};

const MOCK_DEPANNEUR = {
  id: '1',
  nom: 'Ahmed T.',
  initiales: 'AT',
  badge: '🛻 Dépanneur certifié',
  note: 4.9,
  nbAvis: 247,
  interventions: 247,
  tauxReussite: 98,
  tempsMoyenReponse: '12 min',
  vehicule: {
    type: 'Camion plateau',
    plaque: '123 TUN 456',
    equipements: ['Treuil électrique', 'Triangle de signalisation', 'Kit de premiers secours', 'Câble de remorquage'],
  },
  zones: ['Tunis Centre', 'La Marsa', 'Carthage', 'Sidi Bou Saïd', 'Le Bardo', 'Ariana'],
  avis: [
    {
      id: '1',
      client: 'Client ****an',
      note: 5,
      commentaire: "Très rapide et professionnel. Mon véhicule a été pris en charge en moins de 15 minutes. Je recommande vivement !",
      date: '15 mai 2025',
    },
    {
      id: '2',
      client: 'Client ****me',
      note: 5,
      commentaire: "Excellent service, Ahmed est très compétent. Il a résolu le problème sur place sans avoir besoin de remorquage.",
      date: '03 mai 2025',
    },
    {
      id: '3',
      client: 'Client ****ss',
      note: 4,
      commentaire: "Bon service, ponctuel et courtois. Petit bémol sur le prix mais la qualité était au rendez-vous.",
      date: '21 avr. 2025',
    },
  ],
  repartitionNotes: [
    { etoiles: 5, pourcentage: 88 },
    { etoiles: 4, pourcentage: 8 },
    { etoiles: 3, pourcentage: 2 },
    { etoiles: 2, pourcentage: 1 },
    { etoiles: 1, pourcentage: 1 },
  ],
};

function EtoilesRow({ note, taille = 16 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: taille, color: i <= Math.round(note) ? '#F5A623' : '#2C2C3A' }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function DepanneurProfileScreen() {
  const navigation = useNavigation();
  const d = MOCK_DEPANNEUR;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil du dépanneur</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{d.initiales}</Text>
          </View>
          <Text style={styles.heroName}>{d.nom}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeText}>{d.badge}</Text>
          </View>
          <View style={styles.heroNoteRow}>
            <Text style={styles.heroNote}>⭐ {d.note}</Text>
            <Text style={styles.heroNbAvis}>({d.nbAvis} avis)</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{d.interventions}</Text>
            <Text style={styles.statLabel}>Interventions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{d.tauxReussite}%</Text>
            <Text style={styles.statLabel}>Taux réussite</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{d.tempsMoyenReponse}</Text>
            <Text style={styles.statLabel}>Tps moyen</Text>
          </View>
        </View>

        {/* Répartition des notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Évaluation détaillée</Text>
          <View style={styles.ratingCard}>
            <View style={styles.ratingLeft}>
              <Text style={styles.bigNote}>{d.note}</Text>
              <EtoilesRow note={d.note} taille={18} />
              <Text style={styles.ratingNbAvis}>{d.nbAvis} avis</Text>
            </View>
            <View style={styles.ratingBars}>
              {d.repartitionNotes.map((r) => (
                <View key={r.etoiles} style={styles.barRow}>
                  <Text style={styles.barLabel}>{r.etoiles}★</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${r.pourcentage}%` }]} />
                  </View>
                  <Text style={styles.barPct}>{r.pourcentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Véhicule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations véhicule</Text>
          <View style={styles.card}>
            <View style={styles.vehiculeRow}>
              <Text style={styles.vehiculeLabel}>Type</Text>
              <Text style={styles.vehiculeValue}>{d.vehicule.type}</Text>
            </View>
            <View style={styles.vehiculeRow}>
              <Text style={styles.vehiculeLabel}>Plaque</Text>
              <Text style={styles.vehiculeValue}>{d.vehicule.plaque}</Text>
            </View>
            <Text style={[styles.vehiculeLabel, { marginTop: 10, marginBottom: 6 }]}>Équipements</Text>
            {d.vehicule.equipements.map((eq, i) => (
              <View key={i} style={styles.equipRow}>
                <Text style={styles.equipDot}>✓</Text>
                <Text style={styles.equipText}>{eq}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Zone de couverture */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone de couverture</Text>
          <View style={styles.card}>
            <View style={styles.zonesWrap}>
              {d.zones.map((zone, i) => (
                <View key={i} style={styles.zoneTag}>
                  <Text style={styles.zoneTagText}>{zone}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Avis récents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avis récents</Text>
          {d.avis.map((avis) => (
            <View key={avis.id} style={styles.avisCard}>
              <View style={styles.avisHeader}>
                <Text style={styles.avisClient}>{avis.client}</Text>
                <View style={styles.avisNoteRow}>
                  <EtoilesRow note={avis.note} taille={13} />
                  <Text style={styles.avisDate}>{avis.date}</Text>
                </View>
              </View>
              <Text style={styles.avisComment}>{avis.commentaire}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.contactBtn} onPress={() => {}}>
          <Text style={styles.contactBtnText}>Contacter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.choisirBtn}
          onPress={() => navigation.navigate('SOSRequest', { depanneurId: d.id })}
        >
          <Text style={styles.choisirBtnText}>Choisir ce dépanneur</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { color: COLORS.text, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },

  heroCard: {
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { color: COLORS.background, fontSize: 32, fontWeight: '800' },
  heroName: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  badgeRow: {
    backgroundColor: '#1A2A1A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 10,
  },
  badgeText: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },
  heroNoteRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroNote: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  heroNbAvis: { color: COLORS.muted, fontSize: 14 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.primary, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: COLORS.muted, fontSize: 11, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },

  section: { marginHorizontal: 16, marginBottom: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },

  ratingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
  },
  ratingLeft: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  bigNote: { color: COLORS.primary, fontSize: 42, fontWeight: '800', lineHeight: 48 },
  ratingNbAvis: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  ratingBars: { flex: 1, justifyContent: 'space-between' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  barLabel: { color: COLORS.muted, fontSize: 11, width: 22 },
  barTrack: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  barPct: { color: COLORS.muted, fontSize: 11, width: 30, textAlign: 'right' },

  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16 },
  vehiculeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  vehiculeLabel: { color: COLORS.muted, fontSize: 14 },
  vehiculeValue: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  equipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  equipDot: { color: COLORS.green, fontSize: 14 },
  equipText: { color: COLORS.text, fontSize: 14 },

  zonesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  zoneTag: {
    backgroundColor: '#16162A',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  zoneTagText: { color: COLORS.text, fontSize: 13 },

  avisCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  avisHeader: { marginBottom: 8 },
  avisClient: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  avisNoteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avisDate: { color: COLORS.muted, fontSize: 12 },
  avisComment: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },

  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  contactBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  choisirBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  choisirBtnText: { color: COLORS.background, fontSize: 15, fontWeight: '800' },
});
