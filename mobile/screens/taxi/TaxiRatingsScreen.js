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

const MOCK_RATINGS = {
  avg: 4.82,
  total: 248,
  dist: [3, 6, 12, 58, 169],
  recent: [
    { id: 'RA1', clientName: 'Sana T.', stars: 5, comment: 'Chauffeur très professionnel, voiture propre !', date: 'Il y a 2h', route: 'Lac 1 → Aéroport' },
    { id: 'RA2', clientName: 'Karim B.', stars: 5, comment: 'Ponctuel et agréable.', date: 'Il y a 5h', route: 'La Marsa → Bardo' },
    { id: 'RA3', clientName: 'Rim H.', stars: 4, comment: 'Bonne conduite, légèrement en retard.', date: 'Hier', route: 'Centre → Ennasr' },
    { id: 'RA4', clientName: 'Nabil R.', stars: 5, comment: '', date: 'Hier', route: 'Sousse → Monastir' },
    { id: 'RA5', clientName: 'Hedi B.', stars: 3, comment: 'Trajet correct mais GPS mal configuré.', date: 'Il y a 3j', route: 'Bizerte → Tunis' },
  ],
};

function StarRow({ stars }) {
  return (
    <Text style={{ fontSize: 14, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Text key={s} style={{ color: s <= stars ? COLORS.accent : COLORS.border }}>★</Text>
      ))}
    </Text>
  );
}

function RatingCard({ item }) {
  return (
    <View style={styles.ratingCard}>
      <View style={styles.ratingTop}>
        <View style={styles.clientAvatar}><Text style={{ fontSize: 18 }}>👤</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.ratingRoute}>{item.route}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <StarRow stars={item.stars} />
          <Text style={styles.ratingDate}>{item.date}</Text>
        </View>
      </View>
      {!!item.comment && <Text style={styles.ratingComment}>"{item.comment}"</Text>}
    </View>
  );
}

export default function TaxiRatingsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/taxi/driver/ratings')
      .then(r => setData(r.data || MOCK_RATINGS))
      .catch(() => setData(MOCK_RATINGS))
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
            <View style={styles.summary}>
              <View style={styles.summaryLeft}>
                <Text style={styles.avgScore}>{data.avg}</Text>
                <Text style={styles.avgStars}>{'★'.repeat(5)}</Text>
                <Text style={styles.avgTotal}>{data.total} avis</Text>
              </View>
              <View style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map((star, i) => {
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
  summary: { flexDirection: 'row', gap: 20, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  summaryLeft: { alignItems: 'center', justifyContent: 'center', width: 80 },
  avgScore: { color: COLORS.accent, fontSize: 40, fontWeight: '900' },
  avgStars: { color: COLORS.accent, fontSize: 14 },
  avgTotal: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  distLabel: { color: COLORS.muted, fontSize: 11, width: 22 },
  distBarBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4 },
  distBar: { height: 8, borderRadius: 4 },
  distCount: { color: COLORS.muted, fontSize: 11, width: 24, textAlign: 'right' },
  ratingCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  ratingTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  clientAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  clientName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  ratingRoute: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  ratingDate: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  ratingComment: { color: COLORS.muted, fontSize: 12, fontStyle: 'italic', lineHeight: 18, paddingLeft: 50 },
});
