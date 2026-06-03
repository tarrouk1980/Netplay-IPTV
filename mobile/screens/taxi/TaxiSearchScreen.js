import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
};

const RECENT_DESTINATIONS = [
  { id: '1', address: '12 Rue de la Liberté, Tunis', distance: '2.3 km' },
  { id: '2', address: 'Aéroport Tunis-Carthage, La Soukra', distance: '14.7 km' },
  { id: '3', address: 'Centre Commercial Géant, La Marsa', distance: '8.1 km' },
  { id: '4', address: 'Hôpital Charles Nicolle, Tunis', distance: '3.9 km' },
];

const SAVED_PLACES = [
  { id: 'home', icon: '🏠', label: 'Domicile', address: '7 Rue Ibn Khaldoun, Ariana' },
  { id: 'work', icon: '💼', label: 'Bureau', address: '45 Avenue Habib Bourguiba, Tunis' },
];

const MOCK_SEARCH_RESULTS = [
  { id: 's1', address: 'Avenue Habib Bourguiba, Tunis Centre' },
  { id: 's2', address: 'Rue Habib Bourguiba, Sfax' },
  { id: 's3', address: 'Boulevard Habib Bourguiba, Sousse' },
  { id: 's4', address: 'Habib Bourguiba, Monastir' },
];

export default function TaxiSearchScreen({ navigation }) {
  const [departure, setDeparture] = useState("Ma position actuelle");
  const [destination, setDestination] = useState('');
  const [showResults, setShowResults] = useState(false);
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const destinationRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (destinationRef.current) {
        destinationRef.current.focus();
      }
    }, 300);

    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleDestinationChange = (text) => {
    setDestination(text);
    setShowResults(text.length > 0);
  };

  const handleSelectAddress = (address) => {
    setDestination(address);
    setShowResults(false);
  };

  const handleConfirm = () => {
    navigation.navigate('TaxiRequest', {
      departure,
      destination,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Où allons-nous ?</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Input Fields */}
      <View style={styles.inputsCard}>
        <View style={styles.inputRow}>
          <View style={styles.dotGreen} />
          <TextInput
            style={styles.input}
            value={departure}
            onChangeText={setDeparture}
            placeholder="Point de départ"
            placeholderTextColor={COLORS.muted}
          />
        </View>
        <View style={styles.inputDivider} />
        <View style={styles.inputRow}>
          <View style={styles.dotRed} />
          <TextInput
            ref={destinationRef}
            style={styles.input}
            value={destination}
            onChangeText={handleDestinationChange}
            placeholder="Destination"
            placeholderTextColor={COLORS.muted}
            autoFocus
          />
          {destination.length === 0 && (
            <Animated.View style={[styles.cursor, { opacity: cursorAnim }]} />
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Search Results */}
        {showResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultats</Text>
            {MOCK_SEARCH_RESULTS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.resultItem}
                onPress={() => handleSelectAddress(item.address)}
              >
                <Text style={styles.resultIcon}>📍</Text>
                <Text style={styles.resultText}>{item.address}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!showResults && (
          <>
            {/* Saved Places */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lieux enregistrés</Text>
              {SAVED_PLACES.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.savedPlaceItem}
                  onPress={() => handleSelectAddress(place.address)}
                >
                  <View style={styles.savedPlaceIconWrap}>
                    <Text style={styles.savedPlaceIcon}>{place.icon}</Text>
                  </View>
                  <View style={styles.savedPlaceInfo}>
                    <Text style={styles.savedPlaceLabel}>{place.label}</Text>
                    <Text style={styles.savedPlaceAddress}>{place.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Destinations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Destinations récentes</Text>
              {RECENT_DESTINATIONS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItem}
                  onPress={() => handleSelectAddress(item.address)}
                >
                  <Text style={styles.recentIcon}>🕐</Text>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentAddress}>{item.address}</Text>
                    <Text style={styles.recentDistance}>{item.distance}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Confirm Button */}
      {destination.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Confirmer la destination</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  inputsCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  dotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  cursor: {
    width: 2,
    height: 18,
    backgroundColor: COLORS.primary,
    marginLeft: 2,
  },
  inputDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 24,
  },
  scroll: {
    flex: 1,
    marginTop: 12,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  savedPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  savedPlaceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedPlaceIcon: {
    fontSize: 20,
  },
  savedPlaceInfo: {
    flex: 1,
  },
  savedPlaceLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  savedPlaceAddress: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentAddress: {
    color: COLORS.text,
    fontSize: 14,
  },
  recentDistance: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  resultText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
