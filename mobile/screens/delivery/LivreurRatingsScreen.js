import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK = {
  avg: 4.91,
  total: 312,
  dist: [2, 4, 8, 48, 250],
  recent: [
    { id: 'R1', clientName: 'Sana T.', stars: 5, comment: 'Très rapide et souriant, super livreur !', date: 'Aujourd\'hui 15:45', order: 'Restaurant El Bey' },
    { id: 'R2', clientName: 'Karim B.', stars: 5, comment: '', date: 'Aujourd\'hui 13:10', order: 'Pizza Roma' },
    { id: 'R3', clientName: 'Rim H.', stars: 4, comment: 'Commande bien livrée, légèrement en retard.', date: 'Hier 20:30', order: 'Sushi Palace' },
    { id: 'R4', clientName: 'Nabil R.', stars: 5, comment: 'Parfait comme toujours !', date: 'Hier 18:05', order: 'Burger Station' },
    { id: 'R5', clientName: 'Hedi B.', stars: 3, comment: 'Sac de livraison ouvert à l\'arrivée.', date: 'Il y a 3j', order: 'Tacos House' },
  ],
};

function StarRow({ stars, size = 14 }) {
  return (
    <Text style={{ fontSize: size, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Text key={s} style={{ color: s <= stars ? COLORS.accent : COLORS.border }}>★</Text>
      ))}
    </Text>
  );
}

function RatingCard({ item }) {
  return (
    <View style={styles.ratingCard}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}><Text style={{ fontSize: 18 }}>👤</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.orderName}>{item.order}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <StarRow stars={item.stars} />
          <Text style={styles.ratingDate}>{item.date}</Text>
        </View>
      </View>
      {!!item.comment && <Text style={styles.comment}>"{item.comment}"</Text>}
    </View>
  );
}

export default function LivreurRatingsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/livreur/ratings')
      .then(r => setData(r.data || MOCK))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const total = data ? data.dist.reduce((s, v) => s + v, 0) : 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⭐ Mes évaluations</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={data.recent}
          keyExtractor={r => r.id}
          ListHeaderComponent={() => (
            <>
              <View style={styles.summary}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.avgScore}>{data.avg}</Text>
                  <StarRow stars={5} size={16} />
                  <Text style={styles.avgTotal}>{data.total} avis</Text>
                </View>
                <View style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = data.dist[star - 1];
                    const pct = Math.round((count / total) * 100);
                    return (
                      <View key={star} style={styles.distRow}>
                        <Text style={styles.distLabel}>{star}★</Text>
                        <View style={styles.distBarBg}>
                          <View style={[styles.distBar, { width: `${pct}%`, backgroundColor: star >= 4 ? COLORS.green : star === 3 ? COLORS.accent : COLORS.red }]} />
                        </View>
                        <Text style={styles.distCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>CONSEILS POUR AMÉLIORER VOTRE NOTE</Text>
                {[
                  '😊 Soyez souriant et poli avec les clients',
                  '⏱️ Respectez les délais de livraison estimés',
                  '🌡️ Maintenez les plats chauds pendant le transport',
                  '📱 Appelez le client si vous ne trouvez pas l\'adresse',
                ].map((tip, i) => (
                  <Text key={i} style={styles.tipText}>{tip}</Text>
                ))}
              </View>

              <Text style={styles.sectionTitle}>AVIS RÉCENTS</Text>
            </>
          )}
          renderItem={({ item }) => <RatingCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingVertical: 40 }}><Text style={{ color: COLORS.muted }}>Aucune évaluation</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  summary: { flexDirection: 'row', gap: 20, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', width: 80 },
  avgScore: { color: COLORS.accent, fontSize: 40, fontWeight: '900' },
  avgTotal: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  distLabel: { color: COLORS.muted, fontSize: 11, width: 22 },
  distBarBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4 },
  distBar: { height: 8, borderRadius: 4 },
  distCount: { color: COLORS.muted, fontSize: 11, width: 24, textAlign: 'right' },
  tipsCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  tipsTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  tipText: { color: COLORS.text, fontSize: 12, lineHeight: 20, marginBottom: 4 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  ratingCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  clientName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  orderName: { color: COLORS.accent, fontSize: 11, marginTop: 2 },
  ratingDate: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  comment: { color: COLORS.muted, fontSize: 12, fontStyle: 'italic', lineHeight: 18, paddingLeft: 50 },
});
