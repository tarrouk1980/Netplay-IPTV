import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const PERIODES = [
  { label: 'Aujourd\'hui', value: 'today' },
  { label: 'Semaine', value: 'week' },
  { label: 'Mois', value: 'month' },
];

const MAX_BARRE_DEFAULT = 1;
const HAUTEUR_MAX = 100;

function dayLabel(date) {
  return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][new Date(date).getDay()];
}

export default function TaxiDriverEarningsScreen({ navigation }) {
  const [periodeActive, setPeriodeActive] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [solde, setSolde] = useState(0);
  const [courses, setCourses] = useState([]);
  const [barres, setBarres] = useState([]);

  const periodeLabel = PERIODES.find((p) => p.value === periodeActive)?.label || '';

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/api/taxi/driver/history?period=${periodeActive}`);
      const rides = res.data?.rides || [];
      const summary = res.data?.summary || {};
      setSolde(Number(summary.revenue || 0));
      setCourses(rides.map((r) => ({
        id: r.id,
        heure: new Date(r.createdAt).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' }),
        distance: r.metadata?.distance ? `${Number(r.metadata.distance).toFixed(1)} km` : '—',
        montant: Number(r.price || 0),
      })));

      // Build last-7-days bar chart from the raw rides (independent of selected period filter)
      const byDay = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toDateString();
        byDay[key] = { jour: dayLabel(d), montant: 0 };
      }
      rides.forEach((r) => {
        const key = new Date(r.createdAt).toDateString();
        if (byDay[key]) byDay[key].montant += Number(r.price || 0);
      });
      setBarres(Object.values(byDay));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [periodeActive]);

  useEffect(() => { load(); }, [load]);

  const handleRetirer = () => {
    Alert.alert(
      'Retrait de fonds',
      'Le retrait vers votre compte bancaire n\'est pas encore disponible dans l\'application. Contactez le support EasyWay pour organiser un virement.',
      [{ text: 'OK' }]
    );
  };

  const maxBarre = Math.max(MAX_BARRE_DEFAULT, ...barres.map((b) => b.montant));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titre}>Mes gains</Text>

        <View style={styles.toggleRow}>
          {PERIODES.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.toggleBtn, periodeActive === p.value && styles.toggleActif]}
              onPress={() => setPeriodeActive(p.value)}
            >
              <Text style={[styles.toggleTexte, periodeActive === p.value && styles.toggleTexteActif]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#F5A623" size="large" style={{ marginVertical: 30 }} />
        ) : error ? (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Text style={{ color: '#8E8E9A', marginBottom: 12 }}>Impossible de charger vos gains.</Text>
            <TouchableOpacity onPress={load} style={styles.retirerBtn}>
              <Text style={styles.retirerTexte}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.soldeCard}>
              <Text style={styles.soldeLabel}>Gains — {periodeLabel}</Text>
              <Text style={styles.soldeValeur}>{solde.toFixed(2)} TND</Text>
              <TouchableOpacity style={styles.retirerBtn} onPress={handleRetirer}>
                <Text style={styles.retirerTexte}>Retirer</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitre}>7 derniers jours</Text>
            <View style={styles.grapheContainer}>
              {barres.map((item, i) => {
                const hauteur = maxBarre > 0 ? Math.round((item.montant / maxBarre) * HAUTEUR_MAX) : 0;
                return (
                  <View key={`${item.jour}-${i}`} style={styles.barreColonne}>
                    <Text style={styles.barreValeur}>{item.montant.toFixed(0)}</Text>
                    <View style={styles.barreWrapper}>
                      <View style={[styles.barre, { height: Math.max(2, hauteur) }]} />
                    </View>
                    <Text style={styles.barreJour}>{item.jour}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.sectionTitre}>Dernières courses</Text>
            {courses.length === 0 && (
              <Text style={{ color: '#8E8E9A', marginBottom: 10 }}>Aucune course sur cette période.</Text>
            )}
            {courses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.courseGauche}>
                  <Text style={styles.courseHeure}>{course.heure}</Text>
                  <View style={styles.courseInfoRow}>
                    <Text style={styles.courseMeta}>{course.distance}</Text>
                  </View>
                </View>
                <Text style={styles.courseMontant}>+{course.montant.toFixed(2)} TND</Text>
              </View>
            ))}
          </>
        )}
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
    padding: 20,
    paddingBottom: 40,
  },
  titre: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActif: {
    backgroundColor: '#F5A623',
  },
  toggleTexte: {
    color: '#8E8E9A',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTexteActif: {
    color: '#0A0A0F',
  },
  soldeCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  soldeLabel: {
    color: '#8E8E9A',
    fontSize: 14,
    marginBottom: 8,
  },
  soldeValeur: {
    color: '#F5A623',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 20,
  },
  retirerBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  retirerTexte: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitre: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  grapheContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  barreColonne: {
    alignItems: 'center',
    flex: 1,
  },
  barreValeur: {
    color: '#8E8E9A',
    fontSize: 9,
    marginBottom: 4,
  },
  barreWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  barre: {
    width: 22,
    backgroundColor: '#F5A623',
    borderRadius: 4,
  },
  barreJour: {
    color: '#8E8E9A',
    fontSize: 11,
    fontWeight: '600',
  },
  courseCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  courseGauche: {
    gap: 4,
  },
  courseHeure: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  courseInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseMeta: {
    color: '#8E8E9A',
    fontSize: 13,
  },
  courseSep: {
    color: '#2C2C3A',
    fontSize: 13,
  },
  courseMontant: {
    color: '#F5A623',
    fontSize: 18,
    fontWeight: '700',
  },
});
