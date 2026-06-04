import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentLocationWithAddress } from '../../utils/locationUtils';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  pink: '#E91E8C', green: '#27AE60',
};

const DRIVERS = [
  { id: 'D1', name: 'Fatma Ben Ali', rating: 4.9, trips: 642, eta: '4 min', distance: 0.8, certified: true },
  { id: 'D2', name: 'Sonia Trabelsi', rating: 4.8, trips: 418, eta: '7 min', distance: 1.4, certified: true },
  { id: 'D3', name: 'Rania Gharbi', rating: 4.7, trips: 285, eta: '11 min', distance: 2.1, certified: false },
];

export default function EasyLadyScreen({ navigation }) {
  const [origin, setOrigin] = useState(null);
  const [originText, setOriginText] = useState('');
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState(null);

  const detect = async () => {
    setLocating(true);
    const r = await getCurrentLocationWithAddress();
    if (r) { setOrigin(r.coords); setOriginText(r.address); }
    setLocating(false);
  };

  const handleBook = () => {
    navigation.navigate('TaxiRequest', {
      taxiType: 'EASYLADY',
      prefilledDest: '',
      scheduledMode: false,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👩 Easy For Lady</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={{ fontSize: 52 }}>👩</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Easy For Lady</Text>
            <Text style={styles.heroSub}>Conductrices certifiées · Trajet 100% féminin</Text>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>✅ Vérifiées</Text></View>
              <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>🔒 Sécurisé</Text></View>
              <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>💗 Confort</Text></View>
            </View>
          </View>
        </View>

        {/* Localisation */}
        <TouchableOpacity style={styles.locBtn} onPress={detect} disabled={locating}>
          {locating
            ? <ActivityIndicator color={COLORS.pink} size="small" />
            : <Text style={styles.locBtnText}>
                {originText || '📍 Détecter ma position'}
              </Text>
          }
        </TouchableOpacity>

        {/* Conductrices disponibles */}
        <Text style={styles.sectionTitle}>CONDUCTRICES DISPONIBLES</Text>
        {DRIVERS.map(d => (
          <TouchableOpacity
            key={d.id}
            style={[styles.driverCard, selected === d.id && styles.driverCardSelected]}
            onPress={() => setSelected(d.id)}
            activeOpacity={0.85}
          >
            <View style={styles.driverAvatar}>
              <Text style={{ fontSize: 26 }}>👩</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.driverName}>{d.name}</Text>
                {d.certified && <Text style={styles.certBadge}>✅ Certifiée</Text>}
              </View>
              <Text style={styles.driverMeta}>⭐ {d.rating} · {d.trips} courses · 📏 {d.distance} km</Text>
            </View>
            <View style={styles.etaBox}>
              <Text style={styles.etaVal}>{d.eta}</Text>
              <Text style={styles.etaLabel}>d'arrivée</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Garanties */}
        <Text style={styles.sectionTitle}>NOS ENGAGEMENTS</Text>
        <View style={styles.guaranteesCard}>
          {[
            '👩 Conductrices exclusivement féminines',
            '🔍 Vérification identité & casier judiciaire',
            '📱 Suivi GPS partageable en temps réel',
            '💬 Chat sécurisé avec votre conductrice',
            '🌟 Note minimale garantie : 4.5/5',
          ].map((g, i) => (
            <View key={i} style={styles.guaranteeRow}>
              <Text style={styles.guaranteeText}>{g}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Text style={styles.bookBtnText}>👩 Réserver Easy For Lady</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4, width: 36 },
  backIcon: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: COLORS.pink, fontSize: 17, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.pink + '15', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.pink + '30' },
  heroTitle: { color: COLORS.pink, fontSize: 20, fontWeight: '900' },
  heroSub: { color: COLORS.muted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  heroBadge: { backgroundColor: COLORS.pink + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  heroBadgeText: { color: COLORS.pink, fontSize: 10, fontWeight: '700' },
  locBtn: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  locBtnText: { color: COLORS.text, fontSize: 14 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  driverCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  driverCardSelected: { borderColor: COLORS.pink, backgroundColor: COLORS.pink + '10' },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.pink + '20', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.pink + '40' },
  driverName: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  certBadge: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  driverMeta: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  etaBox: { alignItems: 'center' },
  etaVal: { color: COLORS.pink, fontSize: 16, fontWeight: '900' },
  etaLabel: { color: COLORS.muted, fontSize: 9 },
  guaranteesCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  guaranteeRow: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border + '60' },
  guaranteeText: { color: COLORS.text, fontSize: 13 },
  bookBtn: { backgroundColor: COLORS.pink, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
