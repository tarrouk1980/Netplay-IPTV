import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentLocationWithAddress } from '../../utils/locationUtils';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const TAXI_TYPES = [
  { id: 'STANDARD', icon: '🚕', label: 'Standard', desc: 'Économique', eta: '3 min', price: '1.2 TND/km' },
  { id: 'CONFORT', icon: '🚙', label: 'Confort', desc: 'Berline 5★', eta: '5 min', price: '1.8 TND/km' },
  { id: 'EASYLADY', icon: '👩', label: 'Easy For Lady', desc: 'Chauffeure certifiée', eta: '7 min', price: '1.5 TND/km' },
  { id: 'EASYACCESS', icon: '♿', label: 'Easy Access', desc: 'PMR adapté', eta: '10 min', price: '1.6 TND/km' },
];

export default function TaxiHomeScreen2({ navigation }) {
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('STANDARD');
  const [nearbyCount, setNearbyCount] = useState({ STANDARD: 4, CONFORT: 2, EASYLADY: 1, EASYACCESS: 1 });

  useEffect(() => {
    getCurrentLocationWithAddress().then(loc => {
      setLocation(loc);
      setLocLoading(false);
    }).catch(() => setLocLoading(false));
  }, []);

  const selected = TAXI_TYPES.find(t => t.id === selectedType);

  const book = () => {
    navigation.navigate('TaxiRequest', {
      taxiType: selectedType,
      origin: location,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚕 Réserver un taxi</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.locationCard}>
          <View style={[styles.locDot, { backgroundColor: COLORS.green }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locLabel}>Votre position</Text>
            {locLoading ? (
              <ActivityIndicator size="small" color={COLORS.accent} />
            ) : (
              <Text style={styles.locAddress} numberOfLines={2}>
                {location?.address || 'Position non détectée'}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ClientAddressMap')}>
            <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Changer</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.destBtn}
          onPress={() => navigation.navigate('TaxiRequest', { taxiType: selectedType, origin: location })}
        >
          <View style={[styles.locDot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.destText}>Où allez-vous ?</Text>
          <Text style={{ color: COLORS.muted, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>TYPE DE VÉHICULE</Text>
        {TAXI_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[styles.typeCard, selectedType === type.id && styles.typeCardActive]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.typeName, selectedType === type.id && { color: COLORS.accent }]}>{type.label}</Text>
              <Text style={styles.typeDesc}>{type.desc}</Text>
            </View>
            <View style={styles.typeRight}>
              <View style={[styles.etaBadge, { backgroundColor: COLORS.green + '20' }]}>
                <Text style={{ color: COLORS.green, fontSize: 11, fontWeight: '700' }}>⏱ {type.eta}</Text>
              </View>
              <Text style={styles.typePrice}>{type.price}</Text>
              <View style={[styles.countBadge, { backgroundColor: COLORS.blue + '20' }]}>
                <Text style={{ color: COLORS.blue, fontSize: 10, fontWeight: '700' }}>
                  {nearbyCount[type.id] || 0} dispo
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.scheduleBtn} onPress={() => navigation.navigate('TaxiScheduleRide')}>
          <Text style={styles.scheduleBtnText}>📅 Programmer une course</Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookBtn} onPress={book}>
          <Text style={styles.bookBtnText}>Réserver — {selected?.label}</Text>
        </TouchableOpacity>
      </View>
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
  backBtn: { padding: 4 },
  backText: { color: COLORS.accent, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  scroll: { padding: 16, paddingBottom: 100 },
  locationCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.green + '40',
  },
  locDot: { width: 10, height: 10, borderRadius: 5 },
  locLabel: { color: COLORS.muted, fontSize: 11, marginBottom: 2 },
  locAddress: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  destBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  destText: { flex: 1, color: COLORS.muted, fontSize: 14 },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  typeCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '08' },
  typeIcon: { fontSize: 28 },
  typeName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  typeDesc: { color: COLORS.muted, fontSize: 12 },
  typeRight: { alignItems: 'flex-end', gap: 4 },
  etaBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  typePrice: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  countBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  scheduleBtn: {
    backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 13,
    alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  scheduleBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: COLORS.bg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  bookBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  bookBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
