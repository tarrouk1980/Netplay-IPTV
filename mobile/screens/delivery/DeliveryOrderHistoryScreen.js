import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const MOCK_ORDERS = [
  {
    id: '1',
    marchand: "Pizza Palace",
    emoji: '🍕',
    date: '03 Jun 2026',
    heure: '20:15',
    articles: 3,
    total: 38.50,
    statut: 'Livrée',
  },
  {
    id: '2',
    marchand: "Burger Express",
    emoji: '🍔',
    date: '02 Jun 2026',
    heure: '13:00',
    articles: 2,
    total: 22.00,
    statut: 'En cours',
  },
  {
    id: '3',
    marchand: "Sushi Tokyo",
    emoji: '🍣',
    date: '31 Mai 2026',
    heure: '19:45',
    articles: 5,
    total: 61.00,
    statut: 'Livrée',
  },
  {
    id: '4',
    marchand: "Tacos Fiesta",
    emoji: '🌮',
    date: '29 Mai 2026',
    heure: '12:30',
    articles: 4,
    total: 44.50,
    statut: 'Annulée',
  },
  {
    id: '5',
    marchand: "Chicken House",
    emoji: '🍗',
    date: '27 Mai 2026',
    heure: '18:55',
    articles: 2,
    total: 29.00,
    statut: 'Livrée',
  },
  {
    id: '6',
    marchand: "Café Tunis",
    emoji: '☕',
    date: '25 Mai 2026',
    heure: '09:10',
    articles: 1,
    total: 8.50,
    statut: 'Livrée',
  },
  {
    id: '7',
    marchand: "Pasta Roma",
    emoji: '🍝',
    date: '23 Mai 2026',
    heure: '21:00',
    articles: 3,
    total: 42.00,
    statut: 'Annulée',
  },
  {
    id: '8',
    marchand: "Le Grill",
    emoji: '🥩',
    date: '20 Mai 2026',
    heure: '20:30',
    articles: 4,
    total: 56.00,
    statut: 'Livrée',
  },
];

const FILTERS = ['Toutes', 'En cours', 'Livrées', 'Annulées'];

const STATUS_STYLES = {
  'Livrée': { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ADE80' },
  'En cours': { bg: 'rgba(245, 166, 35, 0.15)', text: '#F5A623' },
  'Annulée': { bg: 'rgba(248, 113, 113, 0.15)', text: '#F87171' },
};

export default function DeliveryOrderHistoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Toutes');

  const filteredOrders = MOCK_ORDERS.filter((o) => {
    if (activeFilter === 'Toutes') return true;
    if (activeFilter === 'En cours') return o.statut === 'En cours';
    if (activeFilter === 'Livrées') return o.statut === 'Livrée';
    if (activeFilter === 'Annulées') return o.statut === 'Annulée';
    return true;
  });

  const handleRecommander = (order) => {
    Alert.alert(
      "Recommander",
      `Vous avez recommandé ${order.articles} article(s) de ${order.marchand}. La commande a été ajoutée à votre panier.`,
      [{ text: 'Super !' }]
    );
  };

  const renderOrder = ({ item }) => {
    const statusStyle = STATUS_STYLES[item.statut] || STATUS_STYLES['En cours'];
    const isLivree = item.statut === 'Livrée';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.marchandRow}>
            <Text style={styles.marchandEmoji}>{item.emoji}</Text>
            <Text style={styles.marchandName}>{item.marchand}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{item.statut}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.dateText}>{item.date} · {item.heure}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.articlesText}>
              {item.articles} article{item.articles > 1 ? 's' : ''}
            </Text>
            <Text style={styles.totalText}>{item.total.toFixed(2)} TND</Text>
          </View>
        </View>
        {isLivree && (
          <TouchableOpacity style={styles.recommanderBtn} onPress={() => handleRecommander(item)}>
            <Text style={styles.recommanderText}>🔄 Recommander</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes commandes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScroll}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterTabText, activeFilter === f && styles.filterTabTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune commande trouvée</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 4 },
  backArrow: { fontSize: 22, color: COLORS.text },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSpacer: { width: 30 },
  filterScroll: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  filterTabTextActive: { color: '#000' },
  listContent: { padding: 16, paddingTop: 12 },
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
  marchandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marchandEmoji: { fontSize: 22 },
  marchandName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardBody: { gap: 4 },
  dateText: { fontSize: 12, color: COLORS.muted },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  articlesText: { fontSize: 13, color: COLORS.muted },
  totalText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  recommanderBtn: {
    marginTop: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  recommanderText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  emptyText: { textAlign: 'center', color: COLORS.muted, marginTop: 40, fontSize: 15 },
});
