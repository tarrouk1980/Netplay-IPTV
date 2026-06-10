import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Dimensions, Alert, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Circle } from 'react-native-svg';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const PACKS = [
  {
    name: 'Starter',
    price: 50,
    color: '#38A169',
    features: [
      'Profil hôtel complet',
      'Comparatif de prix inclus',
      'Support par email',
      'Statistiques basiques',
    ],
  },
  {
    name: 'Pro',
    price: 150,
    color: '#004E89',
    features: [
      'Tout le pack Starter',
      'Listing mis en avant',
      'Photos HD illimitées',
      'Statistiques avancées',
      'Support prioritaire',
    ],
    recommended: true,
  },
  {
    name: 'Premium',
    price: 400,
    color: '#FF6B35',
    features: [
      'Tout le pack Pro',
      'Position #1 garantie',
      'Manager dédié',
      'Intégration API directe',
      'Tableau de bord personnalisé',
      'Publicité homepage',
    ],
  },
];

const MOCK_COMPETITORS = [
  { label: 'Concurrent A', bid: 2.80 },
  { label: 'Concurrent B', bid: 2.10 },
  { label: 'Vous', bid: null, isYou: true },
  { label: 'Concurrent C', bid: 1.20 },
  { label: 'Concurrent D', bid: 0.90 },
];

const MOCK_PERF = [12, 28, 19, 35, 44, 31, 52];

function PerfChart({ data, color = '#FF6B35', height = 80 }) {
  const chartWidth = width - 96;
  const maxVal = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = height - (v / maxVal) * (height - 10) - 5;
    return `${x},${y}`;
  });
  return (
    <Svg width={chartWidth} height={height}>
      <Polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const [x, y] = pts[i].split(',');
        return <Circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </Svg>
  );
}

function SimpleSlider({ value, min, max, step, onChange, color = '#FF6B35' }) {
  const trackWidth = width - 80;
  const pct = (value - min) / (max - min);
  const filled = pct * trackWidth;

  function handlePress(e) {
    const x = e.nativeEvent.locationX;
    const raw = min + (x / trackWidth) * (max - min);
    const snapped = Math.round(raw / step) * step;
    onChange(Math.max(min, Math.min(max, snapped)));
  }

  return (
    <View style={{ paddingVertical: 12 }} onStartShouldSetResponder={() => true} onResponderMove={handlePress} onResponderGrant={handlePress}>
      <View style={{ width: trackWidth, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3 }}>
        <View style={{ width: filled, height: 6, backgroundColor: color, borderRadius: 3 }} />
        <View
          style={{
            position: 'absolute',
            left: filled - 12,
            top: -9,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: color,
            borderWidth: 3,
            borderColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      </View>
    </View>
  );
}

export default function HotelManagerScreen({ navigation }) {
  const [cpcBid, setCpcBid] = useState(1.50);
  const [sponsoredEnabled, setSponsoredEnabled] = useState(false);
  const [dailyBudget, setDailyBudget] = useState(20);
  const [currentPack, setCurrentPack] = useState('Pro');
  const [stats, setStats] = useState({
    views: 1240,
    clicks: 87,
    conversion: 3.2,
    monthSpend: 131.0,
  });

  useEffect(() => {
    api.get('/api/hotelManager/stats').then(res => {
      if (res.data?.data) setStats(res.data.data);
    }).catch(() => {});
  }, []);

  function computeRank(bid) {
    const sorted = [...MOCK_COMPETITORS.filter(c => !c.isYou).map(c => c.bid), bid].sort((a, b) => b - a);
    return sorted.indexOf(bid) + 1;
  }
  const myRank = computeRank(cpcBid);

  function handleChoosePack(pack) {
    Alert.alert(
      `Pack ${pack.name} — ${pack.price} TND/mois`,
      'Voulez-vous souscrire à ce pack ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Choisir', style: 'default', onPress: () => setCurrentPack(pack.name) },
      ]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#004E89', '#002d5a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>EasyHotels Manager</Text>
            <Text style={styles.headerSub}>Gérez votre visibilité</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('RevenueAdmin')}>
            <Ionicons name="bar-chart-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Vues', value: stats.views.toLocaleString('fr-FR'), icon: 'eye', color: '#004E89' },
            { label: 'Clics', value: stats.clicks.toLocaleString('fr-FR'), icon: 'finger-print', color: '#FF6B35' },
            { label: 'Conv.', value: stats.conversion + '%', icon: 'checkmark-circle', color: '#38A169' },
            { label: 'Dépense', value: stats.monthSpend + ' TND', icon: 'cash', color: '#805AD5' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={s.icon + '-outline'} size={18} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* CPC Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mon Enchère CPC</Text>
          <View style={styles.bidRow}>
            <Text style={styles.bidLabel}>Votre enchère actuelle :</Text>
            <Text style={styles.bidValue}>{cpcBid.toFixed(2)} TND</Text>
          </View>
          <SimpleSlider value={cpcBid} min={0.5} max={5.0} step={0.05} onChange={setCpcBid} color="#FF6B35" />
          <View style={styles.sliderBounds}>
            <Text style={styles.sliderBound}>0,50 TND</Text>
            <Text style={styles.sliderBound}>5,00 TND</Text>
          </View>
          <View style={styles.rankBadge}>
            <Ionicons name="trophy-outline" size={18} color="#FF6B35" />
            <Text style={styles.rankText}>
              Vous êtes actuellement en position <Text style={{ fontWeight: '900', color: '#FF6B35' }}>#{myRank}</Text>
            </Text>
          </View>
          <Text style={styles.competitorsTitle}>Enchères concurrentes</Text>
          {MOCK_COMPETITORS.map((c, i) => {
            const bid = c.isYou ? cpcBid : c.bid;
            const maxBid = 5;
            const pct = (bid / maxBid) * 100;
            return (
              <View key={i} style={styles.competitorRow}>
                <Text style={[styles.competitorLabel, c.isYou && { color: '#FF6B35', fontWeight: '800' }]}>
                  {c.isYou ? 'Vous' : c.label}
                </Text>
                <View style={styles.competitorTrack}>
                  <View style={[styles.competitorBar, { width: `${pct}%`, backgroundColor: c.isYou ? '#FF6B35' : '#CBD5E0' }]} />
                </View>
                <Text style={[styles.competitorBid, c.isYou && { color: '#FF6B35', fontWeight: '800' }]}>
                  {bid.toFixed(2)} TND
                </Text>
              </View>
            );
          })}
        </View>

        {/* Sponsored section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Listing Sponsorisé</Text>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Activer la sponsorisation</Text>
              <Text style={styles.toggleSub}>Votre hôtel apparaît en tête des résultats</Text>
            </View>
            <Switch
              value={sponsoredEnabled}
              onValueChange={setSponsoredEnabled}
              trackColor={{ false: '#CBD5E0', true: '#FF6B35' }}
              thumbColor="#fff"
            />
          </View>
          {sponsoredEnabled && (
            <>
              <Text style={styles.budgetLabel}>Budget journalier : <Text style={{ color: '#FF6B35', fontWeight: '800' }}>{dailyBudget} TND/jour</Text></Text>
              <SimpleSlider value={dailyBudget} min={5} max={100} step={5} onChange={setDailyBudget} color="#004E89" />
              <View style={styles.sliderBounds}>
                <Text style={styles.sliderBound}>5 TND</Text>
                <Text style={styles.sliderBound}>100 TND</Text>
              </View>

              {/* Preview card */}
              <Text style={styles.previewTitle}>Aperçu de votre annonce</Text>
              <View style={styles.previewCard}>
                <View style={styles.sponsoredBadge}>
                  <Ionicons name="star" size={10} color="#FF6B35" />
                  <Text style={styles.sponsoredText}>Sponsorisé</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.previewImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewName}>Votre Hôtel</Text>
                    <Text style={styles.previewCity}>Tunis, Tunisie</Text>
                    <Text style={styles.previewPrice}>Dès 250 TND / nuit</Text>
                  </View>
                  <View style={styles.previewScore}>
                    <Text style={styles.previewScoreText}>8.9</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Packs section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Packs Premium</Text>
          {PACKS.map((pack, i) => (
            <View
              key={i}
              style={[
                styles.packCard,
                { borderColor: pack.color },
                currentPack === pack.name && styles.packCardActive,
              ]}
            >
              {pack.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: pack.color }]}>
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              )}
              {currentPack === pack.name && (
                <View style={[styles.currentPlanBadge, { backgroundColor: pack.color }]}>
                  <Text style={styles.currentPlanText}>Plan actuel</Text>
                </View>
              )}
              <View style={styles.packHeader}>
                <Text style={[styles.packName, { color: pack.color }]}>{pack.name}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.packPrice, { color: pack.color }]}>{pack.price} TND</Text>
                  <Text style={styles.packPer}>/mois</Text>
                </View>
              </View>
              {pack.features.map((f, j) => (
                <View key={j} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={14} color={pack.color} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.chooseBtn, { backgroundColor: currentPack === pack.name ? '#E2E8F0' : pack.color }]}
                onPress={() => currentPack !== pack.name && handleChoosePack(pack)}
              >
                <Text style={[styles.chooseBtnText, { color: currentPack === pack.name ? '#718096' : '#fff' }]}>
                  {currentPack === pack.name ? 'Plan actuel' : 'Choisir'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 7-day performance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance (7 derniers jours)</Text>
          <PerfChart data={MOCK_PERF} color="#004E89" height={80} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => (
              <Text key={i} style={{ fontSize: 10, color: '#A0AEC0', fontWeight: '600' }}>{d}</Text>
            ))}
          </View>
        </View>

        {/* Contact button */}
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Linking.openURL('mailto:hotels@easyway.tn').catch(() => {
            Alert.alert('Contact', 'Contactez-nous à hotels@easyway.tn');
          })}
        >
          <LinearGradient colors={['#FF6B35', '#e55a25']} style={styles.contactGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.contactText}>Contacter notre équipe</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 54, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', margin: 16, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 14, fontWeight: '900' },
  statLabel: { fontSize: 10, color: '#718096', fontWeight: '600' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#1A202C', marginBottom: 14 },
  bidRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bidLabel: { fontSize: 14, color: '#4A5568', fontWeight: '600' },
  bidValue: { fontSize: 22, fontWeight: '900', color: '#FF6B35' },
  sliderBounds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 },
  sliderBound: { fontSize: 11, color: '#A0AEC0', fontWeight: '600' },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF5F0', borderRadius: 10, padding: 10, marginBottom: 14 },
  rankText: { fontSize: 14, color: '#2D3748', fontWeight: '600' },
  competitorsTitle: { fontSize: 13, fontWeight: '700', color: '#718096', marginBottom: 10 },
  competitorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  competitorLabel: { width: 90, fontSize: 12, color: '#4A5568', fontWeight: '600' },
  competitorTrack: { flex: 1, height: 8, backgroundColor: '#EDF2F7', borderRadius: 4, overflow: 'hidden' },
  competitorBar: { height: '100%', borderRadius: 4 },
  competitorBid: { width: 60, fontSize: 12, color: '#4A5568', fontWeight: '600', textAlign: 'right' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: '#2D3748' },
  toggleSub: { fontSize: 12, color: '#718096', marginTop: 2 },
  budgetLabel: { fontSize: 14, color: '#4A5568', fontWeight: '600', marginBottom: 6 },
  previewTitle: { fontSize: 13, fontWeight: '700', color: '#718096', marginBottom: 10, marginTop: 6 },
  previewCard: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, padding: 12 },
  sponsoredBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  sponsoredText: { fontSize: 11, color: '#FF6B35', fontWeight: '700' },
  previewImg: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#EDF2F7' },
  previewName: { fontSize: 14, fontWeight: '800', color: '#1A202C' },
  previewCity: { fontSize: 11, color: '#718096', marginTop: 2 },
  previewPrice: { fontSize: 13, fontWeight: '700', color: '#FF6B35', marginTop: 4 },
  previewScore: { backgroundColor: '#38A169', borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  previewScoreText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  packCard: { borderWidth: 2, borderRadius: 16, padding: 16, marginBottom: 12, position: 'relative' },
  packCardActive: { shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  recommendedBadge: { position: 'absolute', top: -12, right: 16, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  recommendedText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  currentPlanBadge: { position: 'absolute', top: -12, left: 16, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  currentPlanText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  packHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  packName: { fontSize: 22, fontWeight: '900' },
  packPrice: { fontSize: 24, fontWeight: '900' },
  packPer: { fontSize: 12, color: '#718096', textAlign: 'right' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  featureText: { fontSize: 13, color: '#4A5568', fontWeight: '500' },
  chooseBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  chooseBtnText: { fontWeight: '800', fontSize: 15 },
  contactBtn: { marginHorizontal: 16, marginBottom: 8, borderRadius: 16, overflow: 'hidden' },
  contactGrad: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  contactText: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '800' },
});
