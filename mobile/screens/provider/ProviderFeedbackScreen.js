import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const FILTRES = ['Tous', '5★', '4★', '≤3★'];

function maskName(name) {
  if (!name) return 'Client anonyme';
  if (name.length <= 1) return name;
  return `${name[0]}***${name[name.length - 1]}`;
}

function compterParNote(avis, note) {
  return avis.filter((a) => Math.round(a.note) === note).length;
}

function Etoiles({ note, taille = 14 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: taille, color: i <= note ? '#F5A623' : '#2C2C3A' }}>
          ★
        </Text>
      ))}
    </View>
  );
}

function BarreNote({ note, count, total }) {
  const pourcentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={styles.barreRangee}>
      <Text style={styles.barreLabel}>{note}★</Text>
      <View style={styles.barreTrack}>
        <View style={[styles.barreFill, { width: `${pourcentage}%` }]} />
      </View>
      <Text style={styles.barreCount}>{count}</Text>
    </View>
  );
}

export default function ProviderFeedbackScreen() {
  const [filtre, setFiltre] = useState('Tous');
  const [avis, setAvis] = useState([]);
  const [noteGlobale, setNoteGlobale] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get('/api/provider/reviews');
      const reviews = res.data?.reviews || [];
      const mapped = reviews.map((r) => ({
        id: r.id,
        nom: maskName(r.clientName),
        note: r.rating || 0,
        commentaire: r.comment || '',
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' })
          : '',
      }));
      setAvis(mapped);
      const total = mapped.length;
      const avg = total > 0 ? mapped.reduce((s, a) => s + a.note, 0) / total : 0;
      setNoteGlobale(avg);
    } catch (err) {
      console.error('[ProviderFeedbackScreen] load failed:', err?.message || err);
      setError('Impossible de charger vos avis.');
      setAvis([]);
      setNoteGlobale(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalAvis = avis.length;

  const avisFiltres = avis.filter((a) => {
    if (filtre === 'Tous') return true;
    if (filtre === '5★') return Math.round(a.note) === 5;
    if (filtre === '4★') return Math.round(a.note) === 4;
    if (filtre === '≤3★') return Math.round(a.note) <= 3;
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#F5A623" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#F5A623" />
        }
      >
        <Text style={styles.titre}>Mes avis reçus</Text>

        {error && (
          <View style={styles.erreurContainer}>
            <Text style={styles.erreurTexte}>{error}</Text>
          </View>
        )}

        <View style={styles.noteGlobaleContainer}>
          <Text style={styles.noteGlobaleChiffre}>{noteGlobale.toFixed(1)}</Text>
          <Etoiles note={Math.round(noteGlobale)} taille={28} />
          <Text style={styles.noteGlobaleSub}>{totalAvis} avis au total</Text>
        </View>

        <View style={styles.distributionContainer}>
          <Text style={styles.distributionTitre}>Distribution des notes</Text>
          {[5, 4, 3, 2, 1].map((n) => (
            <BarreNote key={n} note={n} count={compterParNote(avis, n)} total={totalAvis} />
          ))}
        </View>

        <View style={styles.filtreContainer}>
          {FILTRES.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtreBtn, filtre === f && styles.filtreBtnActif]}
              onPress={() => setFiltre(f)}
            >
              <Text style={[styles.filtreTexte, filtre === f && styles.filtreTexteActif]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listeContainer}>
          {avisFiltres.map((a, index) => (
            <View
              key={a.id}
              style={[styles.avisItem, index < avisFiltres.length - 1 && styles.avisItemBorder]}
            >
              <View style={[styles.avatar, { backgroundColor: '#3498DB' }]}>
                <Text style={styles.avatarTexte}>{(a.nom || '?').slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={styles.avisContenu}>
                <View style={styles.avisEnTete}>
                  <Text style={styles.avisNom}>{a.nom}</Text>
                  <Text style={styles.avisDate}>{a.date}</Text>
                </View>
                <Etoiles note={a.note} taille={13} />
                {a.commentaire ? (
                  <Text style={styles.avisCommentaire}>{a.commentaire}</Text>
                ) : (
                  <Text style={[styles.avisCommentaire, { fontStyle: 'italic' }]}>Aucun commentaire</Text>
                )}
              </View>
            </View>
          ))}
          {avisFiltres.length === 0 && (
            <View style={styles.vide}>
              <Text style={styles.videTexte}>Aucun avis pour ce filtre</Text>
            </View>
          )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  erreurContainer: {
    backgroundColor: '#E74C3C22',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  erreurTexte: {
    color: '#E74C3C',
    fontSize: 13,
    textAlign: 'center',
  },
  noteGlobaleContainer: {
    backgroundColor: '#1C1C28',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  noteGlobaleChiffre: {
    fontSize: 56,
    fontWeight: '800',
    color: '#F5A623',
    lineHeight: 64,
  },
  noteGlobaleSub: {
    fontSize: 13,
    color: '#8E8E9A',
    marginTop: 8,
  },
  distributionContainer: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  distributionTitre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E9A',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barreRangee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  barreLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    width: 24,
    textAlign: 'right',
  },
  barreTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#2C2C3A',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barreFill: {
    height: '100%',
    backgroundColor: '#F5A623',
    borderRadius: 5,
  },
  barreCount: {
    fontSize: 13,
    color: '#8E8E9A',
    width: 20,
    textAlign: 'right',
  },
  filtreContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filtreBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#1C1C28',
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  filtreBtnActif: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  filtreTexte: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E9A',
  },
  filtreTexteActif: {
    color: '#0A0A0F',
  },
  listeContainer: {
    backgroundColor: '#1C1C28',
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    overflow: 'hidden',
  },
  avisItem: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  avisItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3A',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarTexte: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avisContenu: {
    flex: 1,
    gap: 6,
  },
  avisEnTete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avisNom: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avisDate: {
    fontSize: 12,
    color: '#8E8E9A',
  },
  avisCommentaire: {
    fontSize: 13,
    color: '#8E8E9A',
    lineHeight: 19,
  },
  vide: {
    padding: 32,
    alignItems: 'center',
  },
  videTexte: {
    fontSize: 14,
    color: '#8E8E9A',
  },
});
