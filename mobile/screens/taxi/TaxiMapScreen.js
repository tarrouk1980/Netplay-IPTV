import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapboxMap from '../../components/MapboxMap';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  mapBg: '#0D0D1A',
  red: '#E74C3C',
};

const MOCK_DRIVER = {
  name: "Karim B.",
  initials: "KB",
  car: "Hyundai Accent",
  plate: "TN-4521-B",
  rating: 4.8,
};

const MOCK_TRIP = {
  from: "Av. Habib Bourguiba, Tunis",
  to: "Aéroport Tunis-Carthage",
  eta: "14 min",
};

export default function TaxiMapScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Map area */}
      <MapboxMap
        style={{ flex: 1 }}
        centerCoordinate={[10.1815, 36.8065]}
        zoom={13}
        markers={[
          { id: 'driver', coordinates: [10.1815, 36.8065], color: '#F5A623', label: '🚕' },
          { id: 'destination', coordinates: [10.2301, 36.8519], color: '#E74C3C', label: '🔴' },
        ]}
        route={[[10.1815, 36.8065], [10.1950, 36.8200], [10.2100, 36.8380], [10.2301, 36.8519]]}
      />

      {/* Header overlay */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation && navigation.goBack()}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course en cours</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      {/* Bottom card */}
      <SafeAreaView style={styles.bottomCardWrapper} edges={['bottom']}>
        <View style={styles.bottomCard}>
          {/* Driver info */}
          <View style={styles.driverRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{MOCK_DRIVER.initials}</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{MOCK_DRIVER.name}</Text>
              <Text style={styles.driverCar}>{MOCK_DRIVER.car} · {MOCK_DRIVER.plate}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {MOCK_DRIVER.rating}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Trip info */}
          <View style={styles.tripRow}>
            <View style={styles.tripAddr}>
              <View style={styles.dotGreen} />
              <Text style={styles.tripAddrText} numberOfLines={1}>{MOCK_TRIP.from}</Text>
            </View>
            <Text style={styles.tripArrow}>→</Text>
            <View style={styles.tripAddr}>
              <View style={styles.dotOrange} />
              <Text style={styles.tripAddrText} numberOfLines={1}>{MOCK_TRIP.to}</Text>
            </View>
          </View>

          {/* ETA */}
          <View style={styles.etaRow}>
            <Text style={styles.etaLabel}>Arrivée estimée</Text>
            <Text style={styles.etaValue}>{MOCK_TRIP.eta}</Text>
          </View>

          <View style={styles.divider} />

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionLabel}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnRed]}>
              <Text style={styles.actionIcon}>✕</Text>
              <Text style={[styles.actionLabel, styles.actionLabelRed]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mapBg,
  },
  mapArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 18,
    color: COLORS.muted,
    fontWeight: '600',
  },
  mapSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    opacity: 0.7,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(10,10,15,0.85)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  driverCar: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripAddr: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ECC71',
    marginRight: 6,
  },
  dotOrange: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  tripAddrText: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
  },
  tripArrow: {
    color: COLORS.muted,
    fontSize: 18,
    marginHorizontal: 6,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  etaLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  etaValue: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  actionBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    minWidth: 80,
  },
  actionBtnRed: {
    backgroundColor: 'rgba(231,76,60,0.15)',
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  actionLabelRed: {
    color: COLORS.red,
  },
});
