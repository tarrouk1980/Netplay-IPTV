import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

function Etoiles({ note }) {
  return (
    <View style={styles.etoilesContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.etoile, { color: i <= Math.round(note) ? '#F5A623' : '#2C2C3A' }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function MerchantProfileScreen({ navigation, route }) {
  const merchantId = route?.params?.merchantId || route?.params?.id;
  const [merchant, setMerchant] = useState(null);
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!merchantId) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/api/merchants/${merchantId}`);
      const m = res.data?.merchant;
      if (!m) throw new Error('not found');
      setMerchant(m);

      try {
        const revRes = await api.get(`/api/reviews/${m.userId || merchantId}`);
        setAvis(revRes.data?.reviews || []);
      } catch {
        setAvis([]);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const avgNote = avis.length
    ? avis.reduce((s, a) => s + (a.rating || 0), 0) / avis.length
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator color="#F5A623" size="large" />
      </SafeAreaView>
    );
  }

  if (error || !merchant) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <Text style={styles.errorText}>Impossible de charger ce commerçant.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryBtnText}>Réessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: '#8E8E9A' }}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const initiales = (merchant.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const metadata = merchant.metadata || {};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.banniere, { backgroundColor: '#2C1654' }]}>
          <View style={styles.banniereDecor1} />
          <View style={styles.banniereDecor2} />
          <TouchableOpacity style={styles.boutonRetour} onPress={() => navigation.goBack()}>
            <Text style={styles.boutonRetourTexte}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profilHeaderContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoInitiales}>{initiales}</Text>
          </View>
          <View style={styles.profilInfos}>
            <Text style={styles.nomMarchand}>{merchant.name}</Text>
            <Text style={styles.categorie}>{merchant.category}</Text>
            <View style={styles.noteRow}>
              <Etoiles note={avgNote} />
              <Text style={styles.noteTexte}>{avgNote ? avgNote.toFixed(1) : '—'}</Text>
              <Text style={styles.nbAvis}>({avis.length} avis)</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Statut</Text>
            <Text style={styles.infoCardValeur}>{merchant.isOpen ? 'Ouvert' : 'Fermé'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Frais</Text>
            <Text style={styles.infoCardValeur}>{metadata.fraisLivraison || '—'}</Text>
          </View>
          <View style={[styles.infoCard, { borderRightWidth: 0 }]}>
            <Text style={styles.infoCardLabel}>Note</Text>
            <Text style={styles.infoCardValeur}>{avgNote ? `${avgNote.toFixed(1)} / 5` : '—'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Informations</Text>
          {metadata.heures ? (
            <View style={styles.infoLigne}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoTexte}>{metadata.heures}</Text>
            </View>
          ) : null}
          <View style={styles.infoLigne}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoTexte}>{merchant.address}</Text>
          </View>
          {metadata.telephone ? (
            <View style={styles.infoLigne}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.infoTexte}>{metadata.telephone}</Text>
            </View>
          ) : null}
        </View>

        {metadata.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitre}>À propos</Text>
            <Text style={styles.description}>{metadata.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Avis clients</Text>
          {avis.length === 0 ? (
            <Text style={styles.description}>Aucun avis pour le moment.</Text>
          ) : (
            avis.map((a) => (
              <View key={a.id} style={styles.avisCard}>
                <View style={styles.avisHeader}>
                  <View style={styles.avisAvatar}>
                    <Text style={styles.avisAvatarTexte}>{(a.author || '?')[0]}</Text>
                  </View>
                  <View style={styles.avisInfos}>
                    <Text style={styles.avisAuteur}>{a.author}</Text>
                    <View style={styles.avisNoteRow}>
                      <Etoiles note={a.rating} />
                      <Text style={styles.avisDate}>{a.date}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.avisCommentaire}>{a.comment}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.espaceFond} />
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.boutonCommander}
          onPress={() => navigation.navigate('Merchant', { merchantId })}
        >
          <Text style={styles.boutonCommanderTexte}>Commander</Text>
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#8E8E9A',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryBtnText: {
    color: '#0A0A0F',
    fontWeight: '700',
  },
  banniere: {
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  banniereDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(245,166,35,0.15)',
    top: -60,
    right: -40,
  },
  banniereDecor2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245,166,35,0.08)',
    bottom: -30,
    left: 40,
  },
  boutonRetour: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonRetourTexte: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  profilHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0A0A0F',
  },
  logoInitiales: {
    color: '#0A0A0F',
    fontSize: 24,
    fontWeight: '800',
  },
  profilInfos: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 4,
  },
  nomMarchand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  categorie: {
    color: '#8E8E9A',
    fontSize: 13,
    marginTop: 2,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  etoilesContainer: {
    flexDirection: 'row',
  },
  etoile: {
    fontSize: 14,
    marginRight: 1,
  },
  noteTexte: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  nbAvis: {
    color: '#8E8E9A',
    fontSize: 12,
    marginLeft: 4,
  },
  infoCardsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#2C2C3A',
  },
  infoCardLabel: {
    color: '#8E8E9A',
    fontSize: 11,
    marginBottom: 4,
  },
  infoCardValeur: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitre: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoLigne: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  infoTexte: {
    color: '#8E8E9A',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  description: {
    color: '#8E8E9A',
    fontSize: 14,
    lineHeight: 22,
  },
  avisCard: {
    backgroundColor: '#1C1C28',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C3A',
  },
  avisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avisAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2C2C3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisAvatarTexte: {
    color: '#F5A623',
    fontSize: 16,
    fontWeight: '700',
  },
  avisInfos: {
    marginLeft: 10,
    flex: 1,
  },
  avisAuteur: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  avisNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  avisDate: {
    color: '#8E8E9A',
    fontSize: 11,
    marginLeft: 8,
  },
  avisCommentaire: {
    color: '#8E8E9A',
    fontSize: 13,
    lineHeight: 19,
  },
  espaceFond: {
    height: 100,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0A0A0F',
    borderTopWidth: 1,
    borderTopColor: '#2C2C3A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
  },
  boutonCommander: {
    backgroundColor: '#F5A623',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  boutonCommanderTexte: {
    color: '#0A0A0F',
    fontSize: 16,
    fontWeight: '800',
  },
});
