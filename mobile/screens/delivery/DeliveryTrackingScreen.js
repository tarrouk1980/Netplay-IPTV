import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  green: '#2ECC71',
};

const MOCK_LIVREUR = {
  name: "Yassine D.",
  initials: "YD",
  type: "Moto",
  rating: 4.6,
};

const MOCK_ORDER = {
  restaurant: "Burger House",
  articles: 3,
  total: "34.50",
  eta: 18,
};

const STEPS = [
  { key: 'prep', label: "Préparation", done: true },
  { key: 'route', label: "En route", done: true },
  { key: 'proche', label: "Proche", done: false, active: true },
  { key: 'livre', label: "Livré", done: false },
];

export default function DeliveryTrackingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Map area */}
      <MapboxMap
        style={{ flex: 1 }}
        centerCoordinate={[10.1815, 36.8065]}
        zoom={14}
        markers={[
          { id: 'livreur', coordinates: [10.1815, 36.8065], color: '#2ECC71', label: '🛵' },
          { id: 'client', coordinates: [10.1950, 36.8200], color: '#E74C3C', label: '🏠' },
        ]}
        route={[[10.1815, 36.8065], [10.1880, 36.8120], [10.1950, 36.8200]]}
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
          <Text style={styles.headerTitle}>Livraison en cours</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      {/* Bottom card */}
      <SafeAreaView style={styles.bottomCardWrapper} edges={['bottom']}>
        <View style={styles.bottomCard}>
          {/* Livreur info */}
          <View style={styles.livreurRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{MOCK_LIVREUR.initials}</Text>
            </View>
            <View style={styles.livreurInfo}>
              <Text style={styles.livreurName}>{MOCK_LIVREUR.name}</Text>
              <Text style={styles.livreurType}>{MOCK_LIVREUR.type}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {MOCK_LIVREUR.rating}</Text>
            </View>
          </View>

          {/* Progress stepper */}
          <View style={styles.stepperRow}>
            {STEPS.map((step, index) => (
              <View key={step.key} style={styles.stepItem}>
                <View style={[
                  styles.stepDot,
                  step.done && styles.stepDotDone,
                  step.active && styles.stepDotActive,
                ]}>
                  {step.done && <Text style={styles.stepCheck}>✓</Text>}
                </View>
                <Text style={[
                  styles.stepLabel,
                  step.active && styles.stepLabelActive,
                  step.done && styles.stepLabelDone,
                ]}>{step.label}</Text>
                {index < STEPS.length - 1 && (
                  <View style={[styles.stepLine, step.done && styles.stepLineDone]} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Order summary */}
          <View style={styles.orderRow}>
            <View>
              <Text style={styles.restaurantName}>{MOCK_ORDER.restaurant}</Text>
              <Text style={styles.orderDetails}>{MOCK_ORDER.articles} articles</Text>
            </View>
            <Text style={styles.orderTotal}>{MOCK_ORDER.total} TND</Text>
          </View>

          {/* ETA */}
          <View style={styles.etaBox}>
            <Text style={styles.etaText}>
              Livraison estimée dans{' '}
              <Text style={styles.etaHighlight}>{MOCK_ORDER.eta} min</Text>
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>📞 Appeler livreur</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>✕ Annuler commande</Text>
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
  livreurRow: {
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
  livreurInfo: {
    flex: 1,
  },
  livreurName: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  livreurType: {
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
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotDone: {
    backgroundColor: COLORS.green,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepCheck: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  stepLine: {
    position: 'absolute',
    top: 12,
    left: '60%',
    right: '-60%',
    height: 2,
    backgroundColor: COLORS.border,
  },
  stepLineDone: {
    backgroundColor: COLORS.green,
  },
  stepLabel: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepLabelDone: {
    color: COLORS.green,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantName: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  orderDetails: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  orderTotal: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  etaBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  etaText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  etaHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  callBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(231,76,60,0.15)',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  cancelBtnText: {
    color: COLORS.red,
    fontWeight: '700',
    fontSize: 13,
  },
});
