import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
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

const FILTRES = ['Tous', 'Ce mois', 'Cette semaine', 'En cours'];

const STATUT_LABELS = {
  PENDING: 'En attente',
  ACCEPTED: 'En cours',
  IN_PROGRESS: 'En cours',
  PICKED_UP: 'En cours',
  COMPLETED: 'Livré',
  CANCELLED: 'Annulé',
};

const mapStatut = (status) => STATUT_LABELS[status] || status || '-';

const mapCommande = (order) => {
  const metadata = order.metadata || {};
  const items = Array.isArray(metadata.items)
    ? metadata.items.map((it) => `${it.name || it.label || 'Article'}${it.qty ? ` x${it.qty}` : ''}`).join(', ')
    : (metadata.articles || '');
  return {
    id: order.id,
    restaurant: metadata.merchantName || metadata.restaurant || order.destinationAddress || 'Commande',
    articles: items || '-',
    prixTotal: Number(order.finalPrice ?? order.price ?? 0),
    date: (order.createdAt || '').slice(0, 10),
    statut: mapStatut(order.status),
    livreur: (order.provider && (order.provider.name || order.provider.fullName)) || metadata.livreur || 'Non assigné',
  };
};

const couleurStatut = (statut) => {
  if (statut === 'Livré') return '#4CAF50';
  if (statut === 'En cours') return '#F5A623';
  if (statut === 'Annulé') return '#F44336';
  return COULEURS.muted;
};

const filtrerCommandes = (commandes, filtre) => {
  if (filtre === 'Tous') return commandes;
  if (filtre === 'En cours') return commandes.filter((c) => c.statut === 'En cours');
  const maintenant = new Date();
  if (filtre === 'Cette semaine') {
    const debutSemaine = new Date(maintenant);
    debutSemaine.setDate(maintenant.getDate() - 7);
    return commandes.filter((c) => c.date && new Date(c.date) >= debutSemaine);
  }
  if (filtre === 'Ce mois') {
    const moisCourant = maintenant.toISOString().slice(0, 7);
    return commandes.filter((c) => c.date && c.date.startsWith(moisCourant));
  }
  return commandes;
};

const restaurantFavori = (commandes) => {
  const comptes = {};
  commandes.forEach((c) => {
    comptes[c.restaurant] = (comptes[c.restaurant] || 0) + 1;
  });
  return Object.entries(comptes).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
};

export default function ClientDeliveryHistoryScreen({ navigation }) {
  const [filtreActif, setFiltreActif] = useState('Tous');
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(false);

  const charger = useCallback(() => {
    setLoading(true);
    setErreur(false);
    api
      .get('/api/delivery/history')
      .then((r) => {
        const orders = r.data?.orders || [];
        setCommandes(orders.map(mapCommande));
      })
      .catch(() => {
        setCommandes([]);
        setErreur(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const commandesFiltrees = filtrerCommandes(commandes, filtreActif);
  const totalDepense = commandes.filter((c) => c.statut === 'Livré').reduce(
    (acc, c) => acc + c.prixTotal,
    0
  );
  const nombreCommandes = commandes.length;
  const favori = restaurantFavori(commandes.filter((c) => c.statut === 'Livré'));

  const renderCommande = ({ item }) => (
    <TouchableOpacity
      style={styles.carte}
      onPress={() => navigation.navigate('DeliveryOrderDetail', { orderId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.carteEntete}>
        <Text style={styles.restaurant}>{item.restaurant}</Text>
        <View style={[styles.badgeStatut, { backgroundColor: couleurStatut(item.statut) + '22' }]}>
          <Text style={[styles.textStatut, { color: couleurStatut(item.statut) }]}>
            {item.statut}
          </Text>
        </View>
      </View>
      <Text style={styles.articles} numberOfLines={1}>{item.articles}</Text>
      <View style={styles.carteInfos}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.livreur}>🛻 {item.livreur}</Text>
        <Text style={styles.prix}>{item.prixTotal.toFixed(2)} €</Text>
      </View>
      <TouchableOpacity
        style={styles.boutonCommander}
        onPress={() => navigation.navigate('Merchant')}
        activeOpacity={0.8}
      >
        <Text style={styles.textBoutonCommander}>Commander à nouveau</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Text style={styles.textRetour}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titre}>Historique des livraisons</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.resume}>
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{totalDepense.toFixed(0)} €</Text>
          <Text style={styles.resumeLabel}>Total dépensé</Text>
        </View>
        <View style={styles.separateurResume} />
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur}>{nombreCommandes}</Text>
          <Text style={styles.resumeLabel}>Commandes</Text>
        </View>
        <View style={styles.separateurResume} />
        <View style={styles.resumeItem}>
          <Text style={styles.resumeValeur} numberOfLines={1}>{favori}</Text>
          <Text style={styles.resumeLabel}>Favori</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtresContainer}
      >
        {FILTRES.map((filtre) => (
          <TouchableOpacity
            key={filtre}
            style={[styles.filtre, filtreActif === filtre && styles.filtreActif]}
            onPress={() => setFiltreActif(filtre)}
          >
            <Text style={[styles.textFiltre, filtreActif === filtre && styles.textFiltreActif]}>
              {filtre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={COULEURS.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={commandesFiltrees}
          keyExtractor={(item) => item.id}
          renderItem={renderCommande}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Text style={styles.texteVide}>
                {erreur ? 'Impossible de charger les commandes' : 'Aucune commande trouvée'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COULEURS.bg,
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
    fontSize: 18,
    fontWeight: '700',
  },
  resume: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COULEURS.border,
  },
  resumeItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumeValeur: {
    color: COULEURS.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  resumeLabel: {
    color: COULEURS.muted,
    fontSize: 11,
  },
  separateurResume: {
    width: 1,
    backgroundColor: COULEURS.border,
    marginVertical: 4,
  },
  filtresContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filtre: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.border,
    marginRight: 8,
  },
  filtreActif: {
    backgroundColor: COULEURS.primary,
    borderColor: COULEURS.primary,
  },
  textFiltre: {
    color: COULEURS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  textFiltreActif: {
    color: COULEURS.bg,
  },
  liste: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.border,
    marginBottom: 12,
  },
  carteEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  restaurant: {
    color: COULEURS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  badgeStatut: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  textStatut: {
    fontSize: 12,
    fontWeight: '600',
  },
  articles: {
    color: COULEURS.muted,
    fontSize: 13,
    marginBottom: 10,
  },
  carteInfos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    color: COULEURS.muted,
    fontSize: 12,
  },
  livreur: {
    color: COULEURS.muted,
    fontSize: 12,
  },
  prix: {
    color: COULEURS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  boutonCommander: {
    backgroundColor: COULEURS.primary + '22',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COULEURS.primary + '55',
  },
  textBoutonCommander: {
    color: COULEURS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  vide: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  texteVide: {
    color: COULEURS.muted,
    fontSize: 15,
  },
});
