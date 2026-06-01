import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2A2A3A',
  text: '#FFFFFF',
  muted: '#8A8A9A',
  green: '#27AE60',
  orange: '#F57C00',
  accent: '#D32F2F',
  teal: '#00838F',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const STEPS = [
  { key: 'PICKUP', label: 'Aller chercher la commande', icon: '🏪', color: COLORS.orange },
  { key: 'TRANSIT', label: 'En route vers le client', icon: '🛵', color: COLORS.teal },
  { key: 'DELIVERED', label: 'Commande remise', icon: '✅', color: COLORS.green },
];

const MOCK_ORDER = {
  id: 'del-001',
  status: 'ACCEPTED',
  merchantName: 'Pizza Roma',
  merchantPhone: '+21622345678',
  merchantAddress: '12 Rue Alain Savary, Tunis',
  clientName: 'Sami Ben Youssef',
  clientPhone: '+21655678901',
  clientAddress: 'Les Berges du Lac 2, Tunis',
  price: 32,
  items: [{ name: 'Pizza Margherita Large', qty: 1 }, { name: 'Coca-Cola 33cl', qty: 2 }],
  pickup: { lat: 36.8190, lng: 10.1658 },
  delivery: { lat: 36.8340, lng: 10.2300 },
};

function PulseRing({ color }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.6, duration: 1200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', width: 40, height: 40, borderRadius: 20,
      borderWidth: 2, borderColor: color, transform: [{ scale }], opacity,
    }} />
  );
}

export default function LivreurMapScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/delivery/orders/${orderId || 'current'}`);
      setOrder(res.data.order || MOCK_ORDER);
    } catch {
      setOrder(MOCK_ORDER);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const currentStep = STEPS[step];
  const isPickupStep = step === 0;
  const targetLat = isPickupStep ? order?.pickup?.lat : order?.delivery?.lat;
  const targetLng = isPickupStep ? order?.pickup?.lng : order?.delivery?.lng;

  const mapUrl = order
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+f57c00(${order.pickup?.lng},${order.pickup?.lat}),pin-s+27ae60(${order.delivery?.lng},${order.delivery?.lat})/auto/600x280@2x?padding=60&access_token=${MAPBOX_TOKEN}`
    : null;

  const openNavigation = () => {
    if (!targetLat || !targetLng) return;
    const url = `https://maps.google.com/?q=${targetLat},${targetLng}`;
    Linking.openURL(url).catch(() => Alert.alert('Impossible d\'ouvrir Google Maps'));
  };

  const callContact = () => {
    const phone = isPickupStep ? order?.merchantPhone : order?.clientPhone;
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const advanceStep = async () => {
    if (step === STEPS.length - 1) {
      setCompleting(true);
      try {
        await api.post(`/api/delivery/orders/${order?.id}/complete`);
        Alert.alert('Livraison terminée ✅', 'La commande a été remise au client.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch {
        Alert.alert('Erreur', 'Impossible de confirmer la livraison.');
      } finally {
        setCompleting(false);
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  if (loading) return <View style={s.centered}><ActivityIndicator color={COLORS.green} size="large" /></View>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🛵 En livraison</Text>
        <View style={[s.stepBadge, { backgroundColor: currentStep.color }]}>
          <Text style={s.stepBadgeTxt}>{step + 1}/{STEPS.length}</Text>
        </View>
      </View>

      {/* Map */}
      {mapUrl ? (
        <View style={s.mapContainer}>
          <Animated.Image
            source={{ uri: mapUrl }}
            style={s.map}
            resizeMode="cover"
          />
          <View style={s.mapOverlay}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <PulseRing color={currentStep.color} />
              <Text style={{ fontSize: 20 }}>{currentStep.icon}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={[s.mapContainer, { backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ fontSize: 48 }}>🗺</Text>
        </View>
      )}

      {/* Step progress */}
      <View style={s.stepsRow}>
        {STEPS.map((st, i) => (
          <View key={st.key} style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.stepDot, {
              backgroundColor: i < step ? COLORS.green : i === step ? currentStep.color : COLORS.border,
            }]}>
              <Text style={{ fontSize: 12 }}>{i < step ? '✓' : st.icon}</Text>
            </View>
            <Text style={[s.stepLbl, i === step && { color: currentStep.color }]} numberOfLines={2}>
              {st.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Order info card */}
      <View style={s.orderCard}>
        <View style={s.orderTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.orderTitle}>
              {isPickupStep ? `🏪 ${order?.merchantName}` : `👤 ${order?.clientName}`}
            </Text>
            <Text style={s.orderAddr} numberOfLines={1}>
              📍 {isPickupStep ? order?.merchantAddress : order?.clientAddress}
            </Text>
          </View>
          <Text style={[s.orderPrice, { color: COLORS.green }]}>{order?.price} TND</Text>
        </View>

        {isPickupStep && order?.items && (
          <View style={s.itemsRow}>
            {order.items.map((it, i) => (
              <Text key={i} style={s.itemChip}>{it.qty}× {it.name}</Text>
            ))}
          </View>
        )}

        <View style={s.ctaRow}>
          <TouchableOpacity style={s.callBtn} onPress={callContact}>
            <Text style={s.callBtnTxt}>📞 Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={openNavigation}>
            <Text style={s.navBtnTxt}>🗺 Naviguer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Advance button */}
      <View style={s.bottomArea}>
        <TouchableOpacity
          style={[s.advanceBtn, { backgroundColor: currentStep.color }]}
          onPress={advanceStep}
          disabled={completing}
        >
          {completing
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={s.advanceBtnTxt}>
                {step === STEPS.length - 1 ? '✅ Confirmer la livraison' : `${STEPS[step + 1]?.icon} Étape suivante`}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  back: { color: COLORS.text, fontSize: 28, fontWeight: '300' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', flex: 1 },
  stepBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  stepBadgeTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  mapContainer: { height: 200, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  stepsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 4, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepLbl: { color: COLORS.muted, fontSize: 9, textAlign: 'center', fontWeight: '600' },
  orderCard: { backgroundColor: COLORS.surface, margin: 16, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  orderTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  orderAddr: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  orderPrice: { fontSize: 16, fontWeight: '800' },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  itemChip: { backgroundColor: COLORS.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, color: COLORS.muted, fontSize: 11, borderWidth: 1, borderColor: COLORS.border },
  ctaRow: { flexDirection: 'row', gap: 8 },
  callBtn: { flex: 1, backgroundColor: COLORS.green + '22', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.green },
  callBtnTxt: { color: COLORS.green, fontSize: 13, fontWeight: '700' },
  navBtn: { flex: 1, backgroundColor: COLORS.teal + '22', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.teal },
  navBtnTxt: { color: COLORS.teal, fontSize: 13, fontWeight: '700' },
  bottomArea: { padding: 16, paddingTop: 0 },
  advanceBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  advanceBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
