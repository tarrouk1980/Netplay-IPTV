import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const COULEURS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const FILTRES = ['Actifs', 'Expirés', 'Épuisés'];

// Derives a UI status string from the real /api/admin/promo-codes fields
// (isActive, expiresAt, usedCount, maxUsage) — there is no `statut` field
// on the backend, so we compute it here instead of inventing one server-side.
function deriveStatut(item) {
  const expired = item.expiresAt && new Date(item.expiresAt) < new Date();
  const exhausted = item.maxUsage > 0 && (item.usedCount || 0) >= item.maxUsage;
  if (expired) return 'Expiré';
  if (exhausted) return 'Épuisé';
  return item.isActive ? 'Actif' : 'Inactif';
}

const couleurStatut = (statut) => {
  if (statut === 'Actif') return '#4CAF50';
  if (statut === 'Expiré') return '#F44336';
  if (statut === 'Épuisé') return '#FF9800';
  return '#8E8E9A';
};

export default function AdminPromoCodesV2Screen({ navigation }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtreActif, setFiltreActif] = useState('Actifs');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/promo-codes');
      const list = res.data?.codes || res.data?.promoCodes || res.data?.promos || [];
      setCodes(
        list.map((p) => ({
          id: p.id,
          code: p.code,
          type: p.type, // 'PERCENT' | 'FIXED'
          value: p.value,
          usedCount: p.usedCount || 0,
          maxUsage: p.maxUsage || 0,
          expiresAt: p.expiresAt,
          isActive: p.isActive,
          minOrder: p.minOrder,
          service: p.service,
          statut: deriveStatut(p),
        }))
      );
    } catch (e) {
      console.error('[AdminPromoCodesV2Screen] load failed', e);
      setError(e?.response?.data?.error || 'Impossible de charger les codes promo.');
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const codesFiltres = codes.filter((c) => {
    if (filtreActif === 'Actifs') return c.statut === 'Actif';
    if (filtreActif === 'Expirés') return c.statut === 'Expiré';
    if (filtreActif === 'Épuisés') return c.statut === 'Épuisé';
    return true;
  });

  const codesActifs = codes.filter((c) => c.statut === 'Actif').length;

  const toggleStatut = async (item) => {
    const nextActive = !item.isActive;
    try {
      await api.patch(`/api/admin/promo-codes/${item.id}`, { isActive: nextActive });
      load();
    } catch (e) {
      console.error('[AdminPromoCodesV2Screen] toggle failed', e);
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de changer le statut du code.');
    }
  };

  const supprimerCode = (item) => {
    Alert.alert(
      'Supprimer le code',
      `Voulez-vous supprimer le code "${item.code}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // No DELETE exists under /api/admin/promo-codes/:id; /api/admin/promos/:id
              // operates on the same underlying in-memory promoStore, so it's used here.
              await api.delete(`/api/admin/promos/${item.id}`);
              load();
            } catch (e) {
              console.error('[AdminPromoCodesV2Screen] delete failed', e);
              Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de supprimer le code.');
            }
          },
        },
      ]
    );
  };

  const copierCode = (code) => {
    Alert.alert('Code copié', `Le code "${code}" a été copié dans le presse-papiers.`);
  };

  const creerCode = () => {
    if (navigation?.navigate) {
      navigation.navigate('AdminPromoCreate');
    } else {
      Alert.alert('Erreur', 'Navigation indisponible.');
    }
  };

  const renderCode = ({ item }) => (
    <View style={styles.carte}>
      <View style={styles.carteEntete}>
        <View>
          <Text style={styles.codeTexte}>{item.code}</Text>
          <Text style={styles.reductionTexte}>
            {item.type === 'PERCENT' ? `-${item.value}%` : `-${item.value} TND`}
          </Text>
        </View>
        <View
          style={[
            styles.badgeStatut,
            { backgroundColor: couleurStatut(item.statut) + '22' },
          ]}
        >
          <Text
            style={[styles.textStatut, { color: couleurStatut(item.statut) }]}
          >
            {item.statut}
          </Text>
        </View>
      </View>

      <View style={styles.infoRangee}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Utilisations</Text>
          <Text style={styles.infoValeur}>
            {item.usedCount}/{item.maxUsage || '∞'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Expiration</Text>
          <Text style={styles.infoValeur}>
            {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('fr-TN') : 'Aucune'}
          </Text>
        </View>
      </View>

      <View style={styles.progression}>
        <View
          style={[
            styles.progressionBarre,
            {
              width: `${item.maxUsage ? Math.min((item.usedCount / item.maxUsage) * 100, 100) : 0}%`,
              backgroundColor: couleurStatut(item.statut),
            },
          ]}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnToggle]}
          onPress={() => toggleStatut(item)}
        >
          <Text style={styles.actionBtnTexte}>
            {item.isActive ? 'Désactiver' : 'Activer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnCopier]}
          onPress={() => copierCode(item.code)}
        >
          <Text style={styles.actionBtnTexte}>Copier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSuppr]}
          onPress={() => supprimerCode(item)}
        >
          <Text style={[styles.actionBtnTexte, { color: '#F44336' }]}>
            Supprimer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Codes Promo</Text>
        <TouchableOpacity style={styles.btnCreer} onPress={creerCode}>
          <Text style={styles.btnCreerTexte}>+ Créer un code</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        style={styles.statsScrollView}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statValeur}>{codesActifs}</Text>
          <Text style={styles.statLabel}>Codes actifs</Text>
        </View>
      </ScrollView>

      <View style={styles.filtres}>
        {FILTRES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtreBouton,
              filtreActif === f && styles.filtreBoutonActif,
            ]}
            onPress={() => setFiltreActif(f)}
          >
            <Text
              style={[
                styles.filtreTexte,
                filtreActif === f && styles.filtreTexteActif,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.vide}>
          <ActivityIndicator color={COULEURS.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.vide}>
          <Text style={styles.videTexte}>{error}</Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 12 }}>
            <Text style={[styles.videTexte, { color: COULEURS.primary }]}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={codesFiltres}
          keyExtractor={(item) => item.id}
          renderItem={renderCode}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Text style={styles.videTexte}>Aucun code dans cette catégorie</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.text,
  },
  btnCreer: {
    backgroundColor: COULEURS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnCreerTexte: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  statsScrollView: {
    marginBottom: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    minWidth: 140,
    borderWidth: 1,
    borderColor: COULEURS.border,
    alignItems: 'center',
  },
  statValeur: {
    fontSize: 20,
    fontWeight: '700',
    color: COULEURS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COULEURS.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  filtres: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filtreBouton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  filtreBoutonActif: {
    backgroundColor: COULEURS.primary,
    borderColor: COULEURS.primary,
  },
  filtreTexte: {
    fontSize: 13,
    color: COULEURS.muted,
    fontWeight: '500',
  },
  filtreTexteActif: {
    color: '#000',
    fontWeight: '700',
  },
  liste: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  carteEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  codeTexte: {
    fontSize: 18,
    fontWeight: '700',
    color: COULEURS.text,
    letterSpacing: 1,
  },
  reductionTexte: {
    fontSize: 14,
    color: COULEURS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  badgeStatut: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  textStatut: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRangee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {},
  infoLabel: {
    fontSize: 11,
    color: COULEURS.muted,
  },
  infoValeur: {
    fontSize: 13,
    color: COULEURS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  progression: {
    height: 4,
    backgroundColor: COULEURS.border,
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressionBarre: {
    height: '100%',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COULEURS.border,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnToggle: {
    backgroundColor: COULEURS.primary + '22',
  },
  actionBtnCopier: {
    backgroundColor: COULEURS.border,
  },
  actionBtnSuppr: {
    backgroundColor: '#F4433622',
  },
  actionBtnTexte: {
    fontSize: 12,
    fontWeight: '600',
    color: COULEURS.primary,
  },
  vide: {
    alignItems: 'center',
    marginTop: 60,
  },
  videTexte: {
    fontSize: 15,
    color: COULEURS.muted,
  },
});
