import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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

const FILTRES = ['Tous', 'Terminé', 'En cours', 'Annulé'];

const STATUT_LABEL = {
  COMPLETED: 'Terminé',
  IN_PROGRESS: 'En cours',
  ACCEPTED: 'En cours',
  PENDING: 'En cours',
  CANCELLED: 'Annulé',
};

const couleurStatut = (statut) => {
  if (statut === 'Terminé') return '#4CAF50';
  if (statut === 'En cours') return '#F5A623';
  if (statut === 'Annulé') return '#F44336';
  return '#8E8E9A';
};

export default function ClientSOSHistoryScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/users/me/orders')
      .then((r) => {
        const orders = (r.data.orders || []).filter((o) => o.serviceType === 'SOS');
        setDemandes(orders.map((o) => ({
          id: o.id,
          type: o.description || 'Dépannage',
          depanneur: o.provider?.name || 'En recherche...',
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          duree: o.completedAt && o.createdAt
            ? `${Math.round((new Date(o.completedAt) - new Date(o.createdAt)) / 60000)} min`
            : '-',
          prix: Number(o.finalPrice ?? o.price ?? 0),
          statut: STATUT_LABEL[o.status] || o.status,
        })));
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const demandesFiltrees =
    filtreActif === 'Tous'
      ? demandes
      : demandes.filter((d) => d.statut === filtreActif);

  const totalDepense = demandes.filter((d) => d.statut === 'Terminé').reduce(
    (acc, d) => acc + d.prix,
    0
  );

  const nombreInterventions = demandes.filter(
    (d) => d.statut === 'Terminé'
  ).length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.carte}
      onPress={() => navigation.navigate('SOSOrderDetail', { orderId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.carteEntete}>
        <View style={styles.carteGauche}>
          <Text style={styles.emoji}>🛻</Text>
          <View>
            <Text style={styles.typeText}>{item.type}</Text>
            <Text style={styles.depanneurText}>{item.depanneur}</Text>
          </View>
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
      <View style={styles.cartePied}>
        <Text style={styles.metaText}>{item.date}</Text>
        <Text style={styles.metaText}>⏱ {item.duree}</Text>
        <Text style={styles.prixText}>
          {item.prix > 0 ? `${item.prix} DA` : '-'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COULEURS.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.conteneur, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ color: COULEURS.muted, textAlign: 'center', marginBottom: 16 }}>
          Impossible de charger l'historique.
        </Text>
        <TouchableOpacity onPress={load} style={{ backgroundColor: COULEURS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Historique SOS</Text>
      </View>

      <View style={styles.resume}>
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{nombreInterventions}</Text>
          <Text style={styles.resumeLabel}>Interventions</Text>
        </View>
        <View style={styles.separateur} />
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{totalDepense} DA</Text>
          <Text style={styles.resumeLabel}>Total dépensé</Text>
        </View>
      </View>

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

      <FlatList
        data={demandesFiltrees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Text style={styles.videTexte}>Aucune demande trouvée</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.bg,
  },
  entete: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
    color: COULEURS.text,
  },
  resume: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  resumeItem: {
    alignItems: 'center',
  },
  resumeValeur: {
    fontSize: 22,
    fontWeight: '700',
    color: COULEURS.primary,
  },
  resumeLabel: {
    fontSize: 13,
    color: COULEURS.muted,
    marginTop: 4,
  },
  separateur: {
    width: 1,
    height: 40,
    backgroundColor: COULEURS.border,
  },
  filtres: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filtreBouton: {
    paddingHorizontal: 14,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  carteGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 26,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COULEURS.text,
  },
  depanneurText: {
    fontSize: 13,
    color: COULEURS.muted,
    marginTop: 2,
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
  cartePied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COULEURS.border,
    paddingTop: 10,
  },
  metaText: {
    fontSize: 12,
    color: COULEURS.muted,
  },
  prixText: {
    fontSize: 14,
    fontWeight: '700',
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
