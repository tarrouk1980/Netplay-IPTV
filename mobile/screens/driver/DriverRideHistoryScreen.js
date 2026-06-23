import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#22C55E',
  red: '#EF4444',
};

const FILTERS = ['Tout', 'Complétées', 'Annulées'];

export default function DriverRideHistoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/api/users/me/orders')
      .then((r) => {
        const taxiOrders = (r.data.orders || []).filter((o) => o.serviceType === 'TAXI');
        setRides(taxiOrders.map((o) => {
          const d = new Date(o.createdAt);
          const duree = o.completedAt
            ? `${Math.max(1, Math.round((new Date(o.completedAt) - d) / 60000))} min`
            : '—';
          return {
            id: o.id,
            date: d.toLocaleDateString('fr-FR'),
            heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            depart: o.originAddress || '—',
            arrivee: o.destinationAddress || '—',
            duree,
            montant: Number(o.finalPrice ?? o.price ?? 0),
            statut: o.status === 'CANCELLED' ? 'Annulée' : o.status === 'COMPLETED' ? 'Complétée' : 'En cours',
          };
        }));
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredRides = rides.filter((ride) => {
    if (activeFilter === 'Tout') return true;
    if (activeFilter === 'Complétées') return ride.statut === 'Complétée';
    if (activeFilter === 'Annulées') return ride.statut === 'Annulée';
    return true;
  });

  const handleCardPress = (ride) => {
    Alert.alert(
      "Détail de la course",
      `Date : ${ride.date} à ${ride.heure}\nDépart : ${ride.depart}\nArrivée : ${ride.arrivee}\nDurée : ${ride.duree}\nMontant : ${ride.montant.toFixed(2)} TND\nStatut : ${ride.statut}`,
      [{ text: 'Fermer', style: 'cancel' }]
    );
  };

  const renderRide = ({ item }) => {
    const isCompleted = item.statut === 'Complétée';
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{item.date} — {item.heure}</Text>
          <View style={[styles.badge, { backgroundColor: isCompleted ? COLORS.green + '22' : COLORS.red + '22' }]}>
            <Text style={[styles.badgeText, { color: isCompleted ? COLORS.green : COLORS.red }]}>{item.statut}</Text>
          </View>
        </View>
        <View style={styles.trajet}>
          <View style={styles.trajetRow}>
            <Text style={styles.dotGreen}>●</Text>
            <Text style={styles.trajetText} numberOfLines={1}>{item.depart}</Text>
          </View>
          <View style={styles.trajetLine} />
          <View style={styles.trajetRow}>
            <Text style={styles.dotOrange}>▼</Text>
            <Text style={styles.trajetText} numberOfLines={1}>{item.arrivee}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>⏱ {item.duree}</Text>
          <Text style={styles.montant}>{item.montant.toFixed(2)} TND</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historique des courses</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 16 }}>
            Impossible de charger l'historique.
          </Text>
          <TouchableOpacity onPress={load} style={{ backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.totalCount}>{filteredRides.length} courses au total</Text>

          <View style={styles.tabs}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.tab, activeFilter === f && styles.tabActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.tabText, activeFilter === f && styles.tabTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredRides}
            keyExtractor={(item) => item.id}
            renderItem={renderRide}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 30 }}>Aucune course trouvée</Text>}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 32,
  },
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  totalCount: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardDate: {
    color: COLORS.muted,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trajet: {
    marginBottom: 10,
  },
  trajetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotGreen: {
    fontSize: 10,
    color: COLORS.green,
    width: 14,
    textAlign: 'center',
  },
  dotOrange: {
    fontSize: 10,
    color: COLORS.primary,
    width: 14,
    textAlign: 'center',
  },
  trajetText: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
  },
  trajetLine: {
    width: 1,
    height: 8,
    backgroundColor: COLORS.border,
    marginLeft: 6,
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
    flex: 1,
  },
  montant: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
