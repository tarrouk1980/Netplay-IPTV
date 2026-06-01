import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceIcon from '../../components/ServiceIcon';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  header: '#F5A623',
  headerText: '#0A0A0F',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  taxiNormal: '#F5A623',
  taxiLady: '#E91E8C',
  taxiAccess: '#2196F3',
};

const TAXI_TYPES = [
  {
    key: 'NORMAL',
    iconService: 'EASYTAXY',
    title: 'EasyTaxy',
    subtitle: 'Course standard',
    color: COLORS.taxiNormal,
  },
  {
    key: 'EASYLADY',
    iconService: 'EASYLADY',
    title: 'EasyLady',
    subtitle: 'Conduit par une femme',
    color: COLORS.taxiLady,
  },
  {
    key: 'EASYACCESS',
    iconService: 'EASYACCESS',
    title: 'EasyAccess',
    subtitle: 'Véhicule adapté PMR',
    color: COLORS.taxiAccess,
  },
];

export default function TaxiHomeScreen({ navigation }) {
  const handleTaxiTypePress = (taxiType) => {
    navigation.navigate('TaxiRequest', { taxiType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.header} />

      {/* Amber header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Taxi EASYWAY</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Choisissez votre type de taxi</Text>
      </View>

      {/* Taxi type tiles */}
      <View style={styles.tilesContainer}>
        {TAXI_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.tile, { borderColor: type.color }]}
            onPress={() => handleTaxiTypePress(type.key)}
            activeOpacity={0.85}
          >
            <View style={[styles.tileIconBg, { backgroundColor: type.color + '22' }]}>
              <ServiceIcon service={type.iconService} size={32} />
            </View>
            <View style={styles.tileContent}>
              <Text style={[styles.tileTitle, { color: type.color }]}>{type.title}</Text>
              <Text style={styles.tileSubtitle}>{type.subtitle}</Text>
            </View>
            <Text style={[styles.tileChevron, { color: type.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick taxi shortcut */}
      <TouchableOpacity
        style={{ marginHorizontal: 20, marginBottom: 10, backgroundColor: '#1C1C28', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2C2C3E' }}
        onPress={() => navigation.navigate('QuickTaxi')}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 20, marginRight: 10 }}>⚡</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Taxi rapide</Text>
          <Text style={{ color: '#8E8E9A', fontSize: 12, marginTop: 2 }}>Depuis vos adresses enregistrées</Text>
        </View>
        <Text style={{ color: '#F5A623', fontSize: 20 }}>›</Text>
      </TouchableOpacity>

      {/* Legal footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tarifs conformes au décret du Ministère du Transport tunisien 2019.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.header,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  backArrow: {
    fontSize: 32,
    color: COLORS.headerText,
    lineHeight: 32,
    marginTop: -4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.headerText,
  },
  headerSpacer: {
    width: 32,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  tilesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
    paddingTop: 8,
  },
  tile: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  tileIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileEmoji: {
    fontSize: 28,
  },
  tileContent: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  tileSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  tileChevron: {
    fontSize: 26,
    fontWeight: '300',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
