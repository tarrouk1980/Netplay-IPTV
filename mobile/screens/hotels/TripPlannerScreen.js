import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, Animated, Share, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CITY_SUGGESTIONS = ['Tunis', 'Djerba', 'Hammamet', 'Sousse', 'Monastir', 'Paris', 'Dubai', 'Barcelone', 'Rome', 'Istanbul'];

const STEP_LABELS = ['Destinations', 'Dates', 'Résumé'];

function generateId() { return 'stop-' + Math.random().toString(36).slice(2, 8); }

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));
}

const BASE_PRICES = { 'Tunis': 220, 'Djerba': 280, 'Hammamet': 250, 'Sousse': 200, 'Monastir': 240, 'Paris': 600, 'Dubai': 500, 'Barcelone': 450, 'Rome': 400, 'Istanbul': 350 };

export default function TripPlannerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [guests, setGuests] = useState(2);
  const [stops, setStops] = useState([
    { id: generateId(), city: '', checkIn: '', checkOut: '', nights: 1, estPrice: 0 },
    { id: generateId(), city: '', checkIn: '', checkOut: '', nights: 1, estPrice: 0 },
  ]);
  const [cityFocus, setCityFocus] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function goStep(s) {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(s);
  }

  function addStop() {
    if (stops.length >= 5) {
      Alert.alert('Maximum atteint', 'Vous pouvez ajouter jusqu\'à 5 destinations.');
      return;
    }
    setStops(prev => [...prev, { id: generateId(), city: '', checkIn: '', checkOut: '', nights: 1, estPrice: 0 }]);
  }

  function removeStop(id) {
    if (stops.length <= 1) return;
    setStops(prev => prev.filter(s => s.id !== id));
  }

  function updateStop(id, field, value) {
    setStops(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      if (field === 'checkIn' || field === 'checkOut') {
        updated.nights = calcNights(updated.checkIn, updated.checkOut) || 1;
      }
      const base = BASE_PRICES[updated.city] || 200;
      updated.estPrice = Math.round(base * updated.nights * (1 + Math.random() * 0.2 - 0.1));
      return updated;
    }));
  }

  function moveStop(idx, dir) {
    const newStops = [...stops];
    const target = idx + dir;
    if (target < 0 || target >= newStops.length) return;
    [newStops[idx], newStops[target]] = [newStops[target], newStops[idx]];
    setStops(newStops);
  }

  const totalCost = stops.reduce((sum, s) => sum + (s.estPrice || 0), 0);
  const totalNights = stops.reduce((sum, s) => sum + (s.nights || 0), 0);
  const validStops = stops.filter(s => s.city);

  async function sharePlan() {
    const lines = validStops.map((s, i) => `${i + 1}. ${s.city} (${s.nights} nuit${s.nights > 1 ? 's' : ''}) — ~${s.estPrice} TND`);
    const text = `Mon voyage planifié:\n\n${lines.join('\n')}\n\nCoût total estimé: ${totalCost} TND\nVoyageurs: ${guests}\n\nCréé avec EasyWay Hotels`;
    try { await Share.share({ message: text, title: 'Mon voyage EasyWay' }); } catch {}
  }

  function handleSearchStop(stop) {
    if (!stop.city) return;
    navigation.navigate('HotelResults', { destination: stop.city, checkIn: stop.checkIn, checkOut: stop.checkOut, guests });
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#004E89', '#1a6eac', '#FF6B35']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Planifier mon voyage</Text>
          <View style={styles.stepIndicator}>
            {STEP_LABELS.map((l, i) => (
              <TouchableOpacity key={i} style={styles.stepItem} onPress={() => goStep(i)}>
                <View style={[styles.stepDot, step >= i && styles.stepDotActive]}>
                  <Text style={[styles.stepDotText, step >= i && { color: '#FF6B35' }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, step === i && styles.stepLabelActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity onPress={sharePlan} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

          {step === 0 && (
            <>
              <View style={styles.infoCard}>
                <Ionicons name="map-outline" size={24} color="#FF6B35" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.infoTitle}>Créez votre itinéraire</Text>
                  <Text style={styles.infoSub}>Ajoutez jusqu'à 5 destinations, réorganisez-les selon votre parcours.</Text>
                </View>
              </View>

              {/* Guests */}
              <View style={styles.guestsCard}>
                <Text style={styles.cardTitle}>Nombre de voyageurs</Text>
                <View style={styles.guestsPicker}>
                  <TouchableOpacity style={styles.guestBtn} onPress={() => setGuests(g => Math.max(1, g - 1))}>
                    <Ionicons name="remove" size={20} color="#FF6B35" />
                  </TouchableOpacity>
                  <Text style={styles.guestsCount}>{guests}</Text>
                  <TouchableOpacity style={styles.guestBtn} onPress={() => setGuests(g => Math.min(10, g + 1))}>
                    <Ionicons name="add" size={20} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stops */}
              {stops.map((stop, idx) => (
                <View key={stop.id} style={styles.stopCard}>
                  <View style={styles.stopHeader}>
                    <View style={styles.stopNumBadge}>
                      <Ionicons name="location" size={14} color="#fff" />
                      <Text style={styles.stopNum}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stopTitle}>Destination {idx + 1}</Text>
                    <View style={styles.stopActions}>
                      {idx > 0 && (
                        <TouchableOpacity onPress={() => moveStop(idx, -1)} style={styles.moveBtn}>
                          <Ionicons name="chevron-up" size={16} color="#718096" />
                        </TouchableOpacity>
                      )}
                      {idx < stops.length - 1 && (
                        <TouchableOpacity onPress={() => moveStop(idx, 1)} style={styles.moveBtn}>
                          <Ionicons name="chevron-down" size={16} color="#718096" />
                        </TouchableOpacity>
                      )}
                      {stops.length > 1 && (
                        <TouchableOpacity onPress={() => removeStop(stop.id)} style={styles.removeBtn}>
                          <Ionicons name="trash-outline" size={16} color="#E53E3E" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <Ionicons name="search" size={16} color="#FF6B35" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.cityInput}
                      placeholder="Ville ou hôtel..."
                      placeholderTextColor="#A0AEC0"
                      value={stop.city}
                      onFocus={() => setCityFocus(stop.id)}
                      onBlur={() => setTimeout(() => setCityFocus(null), 200)}
                      onChangeText={v => updateStop(stop.id, 'city', v)}
                    />
                    {stop.city ? (
                      <TouchableOpacity onPress={() => updateStop(stop.id, 'city', '')}>
                        <Ionicons name="close-circle" size={16} color="#A0AEC0" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {cityFocus === stop.id && (
                    <View style={styles.citySuggestions}>
                      {CITY_SUGGESTIONS.filter(c => !stop.city || c.toLowerCase().includes(stop.city.toLowerCase())).map(c => (
                        <TouchableOpacity key={c} style={styles.citySugItem} onPress={() => { updateStop(stop.id, 'city', c); setCityFocus(null); }}>
                          <Ionicons name="location-outline" size={14} color="#718096" />
                          <Text style={styles.citySugText}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <View style={styles.datesRow}>
                    <View style={styles.dateInput}>
                      <Text style={styles.dateLabel}>Arrivée</Text>
                      <TextInput
                        style={styles.dateText}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#A0AEC0"
                        value={stop.checkIn}
                        onChangeText={v => updateStop(stop.id, 'checkIn', v)}
                      />
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#A0AEC0" />
                    <View style={styles.dateInput}>
                      <Text style={styles.dateLabel}>Départ</Text>
                      <TextInput
                        style={styles.dateText}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#A0AEC0"
                        value={stop.checkOut}
                        onChangeText={v => updateStop(stop.id, 'checkOut', v)}
                      />
                    </View>
                  </View>

                  {stop.city && (
                    <View style={styles.stopSummaryRow}>
                      <Text style={styles.stopNights}>{stop.nights} nuit{stop.nights > 1 ? 's' : ''}</Text>
                      <Text style={styles.stopEst}>~{stop.estPrice} TND</Text>
                      <TouchableOpacity style={styles.findBtn} onPress={() => handleSearchStop(stop)}>
                        <Text style={styles.findBtnText}>Trouver hôtel</Text>
                        <Ionicons name="chevron-forward" size={12} color="#FF6B35" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {stops.length < 5 && (
                <TouchableOpacity style={styles.addStopBtn} onPress={addStop}>
                  <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
                  <Text style={styles.addStopText}>Ajouter une destination</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {step === 1 && (
            <View>
              <Text style={styles.sectionTitle}>Récapitulatif des dates</Text>
              {stops.filter(s => s.city).map((stop, idx) => (
                <View key={stop.id} style={styles.dateReviewCard}>
                  <View style={styles.dateReviewLeft}>
                    <View style={styles.dateDot} />
                    {idx < validStops.length - 1 && <View style={styles.dateLine} />}
                  </View>
                  <View style={styles.dateReviewContent}>
                    <Text style={styles.dateReviewCity}>{stop.city}</Text>
                    <Text style={styles.dateReviewDates}>{stop.checkIn || '?'} → {stop.checkOut || '?'}</Text>
                    <Text style={styles.dateReviewNights}>{stop.nights} nuit{stop.nights > 1 ? 's' : ''} · ~{stop.estPrice} TND</Text>
                  </View>
                </View>
              ))}
              {validStops.length === 0 && (
                <Text style={styles.noStopText}>Aucune destination ajoutée. Retournez à l'étape 1.</Text>
              )}
            </View>
          )}

          {step === 2 && (
            <View>
              <LinearGradient colors={['#004E89', '#FF6B35']} style={styles.summaryHero}>
                <Text style={styles.summaryTitle}>Mon Voyage</Text>
                <Text style={styles.summarySubtitle}>{validStops.length} destination{validStops.length > 1 ? 's' : ''} · {totalNights} nuits · {guests} voyageur{guests > 1 ? 's' : ''}</Text>
              </LinearGradient>

              <View style={styles.summaryCard}>
                <Text style={styles.cardTitle}>Résumé des coûts</Text>
                {stops.filter(s => s.city).map((stop, idx) => (
                  <View key={stop.id} style={styles.costRow}>
                    <Text style={styles.costCity}>{stop.city}</Text>
                    <Text style={styles.costNights}>{stop.nights}n</Text>
                    <Text style={styles.costPrice}>{stop.estPrice} TND</Text>
                  </View>
                ))}
                <View style={styles.costTotal}>
                  <Text style={styles.costTotalLabel}>Total estimé</Text>
                  <Text style={styles.costTotalValue}>{totalCost} TND</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.sharePlanBtn} onPress={sharePlan}>
                <LinearGradient colors={['#004E89', '#1a6eac']} style={styles.sharePlanGrad}>
                  <Ionicons name="share-social-outline" size={20} color="#fff" />
                  <Text style={styles.sharePlanText}>Partager mon voyage</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.searchAllBtn} onPress={() => navigation.navigate('HotelSearch')}>
                <Text style={styles.searchAllText}>Rechercher des hôtels</Text>
                <Ionicons name="search" size={16} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        {step > 0 && (
          <TouchableOpacity style={styles.prevBtn} onPress={() => goStep(step - 1)}>
            <Ionicons name="arrow-back" size={16} color="#004E89" />
            <Text style={styles.prevBtnText}>Précédent</Text>
          </TouchableOpacity>
        )}
        {step < 2 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => goStep(step + 1)}>
            <LinearGradient colors={['#FF6B35', '#e85520']} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>{step === 1 ? 'Voir le résumé' : 'Suivant'}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'flex-start' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8, marginTop: 4 },
  shareBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8, marginTop: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  stepIndicator: { flexDirection: 'row', gap: 16 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#fff' },
  stepDotText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  stepLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },
  stepLabelActive: { color: '#fff' },
  infoCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#BEE3F8' },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#2B6CB0', marginBottom: 2 },
  infoSub: { fontSize: 12, color: '#4A5568', lineHeight: 16 },
  guestsCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A202C', marginBottom: 12 },
  guestsPicker: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  guestBtn: { backgroundColor: '#FFF5F0', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: '#FECDB2' },
  guestsCount: { fontSize: 24, fontWeight: '900', color: '#FF6B35', minWidth: 30, textAlign: 'center' },
  stopCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  stopHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stopNumBadge: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 10 },
  stopNum: { color: '#fff', fontWeight: '800', fontSize: 12 },
  stopTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#2D3748' },
  stopActions: { flexDirection: 'row', gap: 4 },
  moveBtn: { backgroundColor: '#F7FAFC', borderRadius: 8, padding: 4 },
  removeBtn: { backgroundColor: '#FFF5F5', borderRadius: 8, padding: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  cityInput: { flex: 1, fontSize: 14, color: '#2D3748', fontWeight: '500' },
  citySuggestions: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 },
  citySugItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  citySugText: { fontSize: 14, color: '#2D3748', fontWeight: '500' },
  datesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dateInput: { flex: 1, backgroundColor: '#F7FAFC', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  dateLabel: { fontSize: 10, color: '#A0AEC0', fontWeight: '700', marginBottom: 3 },
  dateText: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
  stopSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  stopNights: { fontSize: 12, color: '#718096', fontWeight: '600', flex: 1 },
  stopEst: { fontSize: 14, fontWeight: '800', color: '#FF6B35' },
  findBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFF5F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  findBtnText: { fontSize: 12, color: '#FF6B35', fontWeight: '700' },
  addStopBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: '#FF6B35', borderStyle: 'dashed', marginBottom: 16 },
  addStopText: { fontSize: 15, color: '#FF6B35', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C', marginBottom: 16 },
  dateReviewCard: { flexDirection: 'row', marginBottom: 8 },
  dateReviewLeft: { width: 24, alignItems: 'center' },
  dateDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF6B35', marginTop: 4 },
  dateLine: { width: 2, flex: 1, backgroundColor: '#FF6B35', opacity: 0.3, marginVertical: 4 },
  dateReviewContent: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginLeft: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  dateReviewCity: { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  dateReviewDates: { fontSize: 13, color: '#718096', marginTop: 2 },
  dateReviewNights: { fontSize: 12, color: '#FF6B35', fontWeight: '700', marginTop: 4 },
  noStopText: { color: '#A0AEC0', textAlign: 'center', marginTop: 20, fontSize: 14 },
  summaryHero: { borderRadius: 16, padding: 24, marginBottom: 16 },
  summaryTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 },
  summarySubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  costRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  costCity: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2D3748' },
  costNights: { fontSize: 13, color: '#718096', marginRight: 16 },
  costPrice: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  costTotal: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  costTotalLabel: { flex: 1, fontSize: 16, fontWeight: '800', color: '#1A202C' },
  costTotalValue: { fontSize: 22, fontWeight: '900', color: '#FF6B35' },
  sharePlanBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  sharePlanGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15 },
  sharePlanText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  searchAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, padding: 15, borderWidth: 1.5, borderColor: '#FF6B35' },
  searchAllText: { fontSize: 15, color: '#FF6B35', fontWeight: '700' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 8, gap: 10 },
  prevBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F7FAFC', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  prevBtnText: { fontSize: 14, color: '#004E89', fontWeight: '700' },
  nextBtn: { flex: 1, maxWidth: 220, borderRadius: 12, overflow: 'hidden' },
  nextBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
