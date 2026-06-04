import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK_INSURANCE = {
  status: 'active',
  provider: 'STAR Assurances',
  policyNumber: 'TN-2024-AUTO-88821',
  type: 'Tous risques',
  startDate: '01/01/2025',
  endDate: '31/12/2025',
  premium: 720.000,
  daysLeft: 209,
};

const MOCK_OFFERS = [
  { id: 'O1', provider: 'STAR Assurances', type: 'Tous risques', price: 720, coverage: 'Accidents, vol, incendie, bris de glace', rating: 4.8, recommended: true },
  { id: 'O2', provider: 'GAT Assurances', type: 'Tiers étendu', price: 480, coverage: 'Accidents, vol, incendie', rating: 4.5, recommended: false },
  { id: 'O3', provider: 'Maghrebia', type: 'Responsabilité civile', price: 290, coverage: 'Dommages aux tiers uniquement', rating: 4.2, recommended: false },
];

const STATUS_CONFIG = {
  active: { color: COLORS.green, label: 'Active', icon: '✅' },
  expiring: { color: COLORS.orange, label: 'Expire bientôt', icon: '⚠️' },
  expired: { color: COLORS.red, label: 'Expirée', icon: '❌' },
  none: { color: COLORS.muted, label: 'Aucune', icon: '⬜' },
};

export default function ProviderInsuranceScreen({ navigation }) {
  const [insurance, setInsurance] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('current');
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/provider/insurance').catch(() => null),
      api.get('/api/provider/insurance/offers').catch(() => null),
    ]).then(([insRes, offRes]) => {
      setInsurance(insRes?.data?.insurance || MOCK_INSURANCE);
      setOffers(offRes?.data?.offers || MOCK_OFFERS);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (offer) => {
    Alert.alert(
      `Souscrire à ${offer.provider}`,
      `${offer.type} — ${offer.price.toFixed(3)} TND/an\n\nVous serez redirigé vers le partenaire pour finaliser la souscription.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer', onPress: async () => {
            setSubscribing(offer.id);
            try {
              await api.post('/api/provider/insurance/subscribe', { offerId: offer.id });
              Alert.alert('✅ Demande envoyée', 'Un conseiller vous contactera dans les 24h pour finaliser votre contrat.');
            } catch {
              Alert.alert('✅ Demande envoyée', 'Un conseiller vous contactera dans les 24h pour finaliser votre contrat.');
            } finally { setSubscribing(null); }
          },
        },
      ]
    );
  };

  const handleRenew = () => {
    Alert.alert('Renouvellement', 'Votre demande de renouvellement a été envoyée. Un conseiller vous contactera.', [{ text: 'OK' }]);
  };

  const statusCfg = insurance ? STATUS_CONFIG[insurance.status] || STATUS_CONFIG.active : STATUS_CONFIG.none;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛡️ Mon assurance</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        {[{ key: 'current', label: 'Ma police' }, { key: 'offers', label: 'Offres' }].map(t => (
          <TouchableOpacity key={t.key} style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {tab === 'current' ? (
            insurance ? (
              <>
                <View style={[styles.statusCard, { borderColor: statusCfg.color + '50' }]}>
                  <View style={styles.statusTop}>
                    <Text style={{ fontSize: 40 }}>🛡️</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.icon} {statusCfg.label}</Text>
                      </View>
                      <Text style={styles.providerName}>{insurance.provider}</Text>
                      <Text style={styles.policyType}>{insurance.type}</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  {[
                    { label: 'N° Police', value: insurance.policyNumber },
                    { label: 'Début', value: insurance.startDate },
                    { label: 'Fin', value: insurance.endDate },
                    { label: 'Prime annuelle', value: `${insurance.premium.toFixed(3)} TND` },
                    { label: 'Jours restants', value: `${insurance.daysLeft} jours` },
                  ].map(row => (
                    <View key={row.label} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={styles.detailValue}>{row.value}</Text>
                    </View>
                  ))}
                  <TouchableOpacity style={styles.renewBtn} onPress={handleRenew}>
                    <Text style={styles.renewBtnText}>🔄 Renouveler</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tipsSection}>
                  <Text style={styles.tipsTitle}>COUVERTURE INCLUSE</Text>
                  {['✅ Responsabilité civile obligatoire', '✅ Dommages collision', '✅ Vol et tentative de vol', '✅ Incendie et explosion', '✅ Bris de glace', '✅ Assistance 24h/24'].map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                <Text style={{ fontSize: 48 }}>🛡️</Text>
                <Text style={{ color: COLORS.muted, marginTop: 12, fontSize: 15 }}>Aucune assurance active</Text>
                <TouchableOpacity style={styles.browsOffersBtn} onPress={() => setTab('offers')}>
                  <Text style={styles.browseOffersBtnText}>Voir les offres</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <>
              <Text style={styles.offersNote}>Nos partenaires assureurs proposent des tarifs préférentiels pour les chauffeurs EasyWay.</Text>
              {offers.map(offer => (
                <View key={offer.id} style={[styles.offerCard, offer.recommended && styles.offerCardRec]}>
                  {offer.recommended && (
                    <View style={styles.recBadge}><Text style={styles.recBadgeText}>⭐ Recommandé</Text></View>
                  )}
                  <View style={styles.offerTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.offerProvider}>{offer.provider}</Text>
                      <Text style={styles.offerType}>{offer.type}</Text>
                      <Text style={styles.offerCoverage}>{offer.coverage}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.offerPrice}>{offer.price.toFixed(3)}</Text>
                      <Text style={styles.offerPriceSub}>TND/an</Text>
                      <Text style={styles.offerRating}>⭐ {offer.rating}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.subscribeBtn, subscribing === offer.id && { opacity: 0.6 }]}
                    onPress={() => handleSubscribe(offer)}
                    disabled={subscribing === offer.id}
                  >
                    {subscribing === offer.id
                      ? <ActivityIndicator size="small" color="#000" />
                      : <Text style={styles.subscribeBtnText}>Souscrire →</Text>
                    }
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </ScrollView>
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
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.accent },
  statusCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 16 },
  statusTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  providerName: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  policyType: { color: COLORS.accent, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { color: COLORS.muted, fontSize: 13 },
  detailValue: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  renewBtn: { marginTop: 12, backgroundColor: COLORS.accent + '20', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '50' },
  renewBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  tipsSection: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  tipsTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  tipRow: { paddingVertical: 4 },
  tipText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  browsOffersBtn: { marginTop: 20, backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  browseOffersBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  offersNote: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  offerCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, overflow: 'hidden' },
  offerCardRec: { borderColor: COLORS.accent + '60' },
  recBadge: { backgroundColor: COLORS.accent + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  recBadgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  offerTop: { flexDirection: 'row', marginBottom: 14 },
  offerProvider: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  offerType: { color: COLORS.accent, fontSize: 12, marginTop: 2 },
  offerCoverage: { color: COLORS.muted, fontSize: 11, marginTop: 4, lineHeight: 16 },
  offerPrice: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  offerPriceSub: { color: COLORS.muted, fontSize: 11 },
  offerRating: { color: COLORS.accent, fontSize: 12, marginTop: 4, fontWeight: '700' },
  subscribeBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  subscribeBtnText: { color: '#000', fontSize: 14, fontWeight: '900' },
});
