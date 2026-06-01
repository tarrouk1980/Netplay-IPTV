import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import api from '../../services/api';
import useLocationStore from '../../store/locationStore';
import useAuthStore from '../../store/authStore';

const COLORS = {
  bg: '#0A0A0F',
  surface: '#1C1C28',
  border: '#2C2C3E',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  accent: '#F5A623',
  green: '#27AE60',
  red: '#E74C3C',
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

const QUICK_DESTINATIONS = [
  { key: 'HOME',   icon: '🏠', label: 'Maison',  addressKey: 'homeAddress' },
  { key: 'WORK',   icon: '💼', label: 'Travail', addressKey: 'workAddress' },
  { key: 'GYM',    icon: '🏋️', label: 'Gym',     addressKey: 'gymAddress' },
  { key: 'FAMILY', icon: '👨‍👩‍👧', label: 'Famille', addressKey: 'familyAddress' },
];

const PRICE_ESTIMATE = { base: 1.2, perKm: 0.65 };

function buildMapUrl(oLat, oLng, dLat, dLng) {
  const pins = `pin-s+27AE60(${oLng},${oLat}),pin-s+E74C3C(${dLng},${dLat})`;
  const midLat = (oLat + dLat) / 2;
  const midLng = (oLng + dLng) / 2;
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pins}/${midLng},${midLat},12/340x160@2x?access_token=${MAPBOX_TOKEN}`;
}

function haversine(la1, lo1, la2, lo2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(la2 - la1);
  const dLon = toRad(lo2 - lo1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function QuickTaxiScreen({ navigation }) {
  const { location } = useLocationStore();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const userLat = location?.latitude || 36.8065;
  const userLng = location?.longitude || 10.1815;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/users/addresses');
        const list = res.data?.addresses || [];
        const map = {};
        list.forEach(a => { map[a.type + 'Address'] = a; });
        setAddresses(map);
      } catch {
        // no saved addresses yet
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dest = selected ? addresses[selected.addressKey] : null;
  const distance = dest?.lat && dest?.lng ? Math.round(haversine(userLat, userLng, dest.lat, dest.lng) * 10) / 10 : null;
  const price = distance ? (PRICE_ESTIMATE.base + PRICE_ESTIMATE.perKm * distance).toFixed(3) : null;
  const mapUrl = dest?.lat ? buildMapUrl(userLat, userLng, dest.lat, dest.lng) : null;

  const handleBook = useCallback(async () => {
    if (!dest) return;
    setBooking(true);
    try {
      const res = await api.post('/api/taxi/request', {
        originLat: userLat,
        originLng: userLng,
        originAddress: 'Ma position actuelle',
        destinationLat: dest.lat,
        destinationLng: dest.lng,
        destinationAddress: dest.address,
      });
      navigation.replace('TaxiTracking', { orderId: res.data?.order?.id });
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Réservation échouée');
    } finally {
      setBooking(false);
    }
  }, [dest, userLat, userLng, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚕 Taxi rapide</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.greeting}>Bonjour {user?.name?.split(' ')[0] || ''} 👋</Text>
        <Text style={styles.sub}>Où voulez-vous aller ?</Text>

        {/* Quick destinations */}
        <View style={styles.grid}>
          {QUICK_DESTINATIONS.map(dest => {
            const addr = addresses[dest.addressKey];
            const isActive = selected?.key === dest.key;
            return (
              <TouchableOpacity
                key={dest.key}
                style={[styles.destCard, isActive && styles.destCardActive, !addr && styles.destCardEmpty]}
                onPress={() => addr && setSelected(dest)}
                activeOpacity={addr ? 0.75 : 1}
              >
                <Text style={styles.destIcon}>{dest.icon}</Text>
                <Text style={[styles.destLabel, isActive && { color: COLORS.accent }]}>{dest.label}</Text>
                {addr ? (
                  <Text style={styles.destAddr} numberOfLines={1}>{addr.address?.split(',')[0]}</Text>
                ) : (
                  <TouchableOpacity onPress={() => navigation.navigate('AddressBook')}>
                    <Text style={styles.destAddLink}>+ Ajouter</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Map preview */}
        {selected && dest && (
          <>
            {mapUrl && (
              <View style={styles.mapContainer}>
                <Image source={{ uri: mapUrl }} style={styles.mapImage} resizeMode="cover" />
                <View style={styles.mapLegend}>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.green }]} /><Text style={styles.legendText}>Départ</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.red }]} /><Text style={styles.legendText}>{selected.label}</Text></View>
                </View>
              </View>
            )}

            {/* Estimate card */}
            <View style={styles.estimateCard}>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLbl}>📍 Départ</Text>
                <Text style={styles.estimateVal}>Ma position actuelle</Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLbl}>{selected.icon} Destination</Text>
                <Text style={styles.estimateVal} numberOfLines={1}>{dest.address?.split(',').slice(0, 2).join(',')}</Text>
              </View>
              {distance !== null && (
                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLbl}>📏 Distance</Text>
                  <Text style={styles.estimateVal}>{distance} km</Text>
                </View>
              )}
              {price && (
                <View style={[styles.estimateRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.estimateLbl}>💰 Estimation</Text>
                  <Text style={[styles.estimateVal, { color: COLORS.accent, fontWeight: '800', fontSize: 16 }]}>{price} TND</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.bookBtn}
              onPress={handleBook}
              disabled={booking}
              activeOpacity={0.85}
            >
              {booking ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.bookBtnText}>🚕 Commander maintenant</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {!selected && !loading && (
          <View style={styles.hintBox}>
            <Text style={styles.hintIcon}>☝️</Text>
            <Text style={styles.hintText}>
              Sélectionnez une destination enregistrée pour commander un taxi en un clic.
            </Text>
            <TouchableOpacity style={styles.hintLink} onPress={() => navigation.navigate('TaxiRequest')}>
              <Text style={styles.hintLinkText}>Ou saisir une adresse manuellement →</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 16 },
  greeting: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  sub: { color: COLORS.muted, fontSize: 14, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  destCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1.5, borderColor: COLORS.border,
  },
  destCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '12' },
  destCardEmpty: { opacity: 0.6 },
  destIcon: { fontSize: 26, marginBottom: 6 },
  destLabel: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  destAddr: { color: COLORS.muted, fontSize: 11 },
  destAddLink: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  mapContainer: { borderRadius: 14, overflow: 'hidden', height: 160, marginBottom: 14, position: 'relative' },
  mapImage: { width: '100%', height: 160 },
  mapLegend: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: 6, gap: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  estimateCard: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 16,
  },
  estimateRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  estimateLbl: { color: COLORS.muted, fontSize: 13 },
  estimateVal: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },
  bookBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  bookBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  hintBox: {
    alignItems: 'center', paddingVertical: 32,
    backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, padding: 20,
  },
  hintIcon: { fontSize: 36, marginBottom: 12 },
  hintText: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  hintLink: { paddingVertical: 8 },
  hintLinkText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
});
