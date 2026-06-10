import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, Image,
  StyleSheet, Dimensions, StatusBar, Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import hotelAPI from '../../services/hotelService';

const NOTIF_OPTIONS = [
  { key: 'push', label: 'Push', icon: 'phone-portrait-outline' },
  { key: 'email', label: 'Email', icon: 'mail-outline' },
  { key: 'both', label: 'Les deux', icon: 'notifications-outline' },
];

const MOCK_ACTIVE_ALERTS = [
  { id: 'a1', hotelName: 'Djerba Beach Resort', targetPrice: 320, notif: 'push', createdAt: '2024-12-01', triggered: false },
  { id: 'a2', hotelName: 'The Palace Hotel Tunis', targetPrice: 450, notif: 'email', createdAt: '2024-11-20', triggered: true },
];

const MOCK_HISTORY = [
  { id: 'h1', hotelName: 'Hasdrubal Hammamet', message: 'Prix descendu à 280 TND (votre budget: 300 TND)', date: '2024-11-15' },
  { id: 'h2', hotelName: 'Novotel Tunis', message: 'Annulation gratuite disponible', date: '2024-10-20' },
];

export default function PriceAlertScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { hotelId, hotelName = 'Hôtel', hotelImage, stars = 5, currentPrice = 350 } = route.params || {};

  const [budget, setBudget] = useState(currentPrice);
  const [alertOnPrice, setAlertOnPrice] = useState(true);
  const [alertOnFreeCancellation, setAlertOnFreeCancellation] = useState(false);
  const [alertOnBreakfast, setAlertOnBreakfast] = useState(false);
  const [notifPref, setNotifPref] = useState('push');
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    const alert = {
      id: 'alert-' + Date.now(),
      hotelId, hotelName,
      targetPrice: alertOnPrice ? budget : null,
      freeCancellation: alertOnFreeCancellation,
      breakfast: alertOnBreakfast,
      notif: notifPref,
      createdAt: new Date().toISOString().split('T')[0],
    };
    try {
      const existing = JSON.parse(await AsyncStorage.getItem('priceAlerts') || '[]');
      existing.push(alert);
      await AsyncStorage.setItem('priceAlerts', JSON.stringify(existing));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      Alert.alert('Alerte créée!', `Vous serez notifié si le prix de ${hotelName} descend sous ${budget} TND.`);
    } catch {}
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#004E89', '#1a6eac']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerte prix</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Hotel info */}
      <View style={styles.hotelCard}>
        {hotelImage ? (
          <Image source={{ uri: hotelImage }} style={styles.hotelThumb} />
        ) : (
          <View style={[styles.hotelThumb, { backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="bed-outline" size={28} color="#A0AEC0" />
          </View>
        )}
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName} numberOfLines={2}>{hotelName}</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: stars }).map((_, i) => (
              <Ionicons key={i} name="star" size={12} color="#F5A623" />
            ))}
          </View>
          <Text style={styles.currentPrice}>Prix actuel: <Text style={{ color: '#FF6B35', fontWeight: '900' }}>{currentPrice} TND</Text></Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 16 }}>

        {/* Budget slider */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Votre budget maximum</Text>
          <View style={styles.budgetDisplay}>
            <Text style={styles.budgetValue}>{budget} TND</Text>
            <Text style={styles.budgetPerNight}>par nuit</Text>
          </View>
          <Slider
            minimumValue={50}
            maximumValue={2000}
            step={10}
            value={budget}
            onValueChange={v => setBudget(Math.round(v))}
            minimumTrackTintColor="#FF6B35"
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor="#FF6B35"
            style={{ marginVertical: 8 }}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>50 TND</Text>
            <Text style={styles.sliderLabel}>2000 TND</Text>
          </View>
        </View>

        {/* Alert toggles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conditions d'alerte</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="trending-down-outline" size={20} color="#FF6B35" />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>M'alerter si le prix descend sous {budget} TND</Text>
                <Text style={styles.toggleSub}>Alerte prix basse</Text>
              </View>
            </View>
            <Switch
              value={alertOnPrice}
              onValueChange={setAlertOnPrice}
              trackColor={{ false: '#E2E8F0', true: '#FECDB2' }}
              thumbColor={alertOnPrice ? '#FF6B35' : '#A0AEC0'}
            />
          </View>

          <View style={[styles.toggleRow, styles.toggleRowBorder]}>
            <View style={styles.toggleLeft}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#38A169" />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Alerter si annulation gratuite disponible</Text>
                <Text style={styles.toggleSub}>Flexibilité maximale</Text>
              </View>
            </View>
            <Switch
              value={alertOnFreeCancellation}
              onValueChange={setAlertOnFreeCancellation}
              trackColor={{ false: '#E2E8F0', true: '#9AE6B4' }}
              thumbColor={alertOnFreeCancellation ? '#38A169' : '#A0AEC0'}
            />
          </View>

          <View style={[styles.toggleRow, styles.toggleRowBorder]}>
            <View style={styles.toggleLeft}>
              <Ionicons name="cafe-outline" size={20} color="#D69E2E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Alerter si petit-déjeuner inclus</Text>
                <Text style={styles.toggleSub}>Petit-déjeuner offert</Text>
              </View>
            </View>
            <Switch
              value={alertOnBreakfast}
              onValueChange={setAlertOnBreakfast}
              trackColor={{ false: '#E2E8F0', true: '#FAF089' }}
              thumbColor={alertOnBreakfast ? '#D69E2E' : '#A0AEC0'}
            />
          </View>
        </View>

        {/* Notification preference */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Préférence de notification</Text>
          <View style={styles.notifRow}>
            {NOTIF_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.notifOption, notifPref === opt.key && styles.notifOptionActive]}
                onPress={() => setNotifPref(opt.key)}
              >
                <Ionicons name={opt.icon} size={20} color={notifPref === opt.key ? '#FF6B35' : '#718096'} />
                <Text style={[styles.notifLabel, notifPref === opt.key && styles.notifLabelActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active alerts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alertes actives</Text>
          {MOCK_ACTIVE_ALERTS.map(alert => (
            <View key={alert.id} style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: alert.triggered ? '#E53E3E' : '#38A169' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertName}>{alert.hotelName}</Text>
                <Text style={styles.alertDetail}>Budget: {alert.targetPrice} TND · {alert.notif}</Text>
                <Text style={styles.alertDate}>Créée le {alert.createdAt}</Text>
              </View>
              <View style={[styles.alertStatus, { backgroundColor: alert.triggered ? '#FFF5F5' : '#F0FFF4' }]}>
                <Text style={[styles.alertStatusText, { color: alert.triggered ? '#E53E3E' : '#38A169' }]}>
                  {alert.triggered ? 'Déclenchée' : 'Active'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historique des alertes</Text>
          {MOCK_HISTORY.map(h => (
            <View key={h.id} style={styles.historyItem}>
              <Ionicons name="notifications" size={16} color="#FF6B35" />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyName}>{h.hotelName}</Text>
                <Text style={styles.historyMsg}>{h.message}</Text>
                <Text style={styles.historyDate}>{h.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <LinearGradient colors={saved ? ['#38A169','#276749'] : ['#FF6B35','#e85520']} style={styles.saveBtnGrad}>
            <Ionicons name={saved ? 'checkmark-circle' : 'notifications'} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saved ? 'Alerte sauvegardée!' : 'Sauvegarder l\'alerte'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  hotelCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 14, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  hotelThumb: { width: 80, height: 80, borderRadius: 12 },
  hotelInfo: { flex: 1 },
  hotelName: { fontSize: 15, fontWeight: '800', color: '#1A202C', marginBottom: 4, lineHeight: 20 },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 6 },
  currentPrice: { fontSize: 13, color: '#718096' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1A202C', marginBottom: 14 },
  budgetDisplay: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 4 },
  budgetValue: { fontSize: 36, fontWeight: '900', color: '#FF6B35' },
  budgetPerNight: { fontSize: 14, color: '#718096' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 11, color: '#A0AEC0' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  toggleRowBorder: { borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  toggleLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#2D3748', flex: 1 },
  toggleSub: { fontSize: 11, color: '#A0AEC0', marginTop: 2 },
  notifRow: { flexDirection: 'row', gap: 8 },
  notifOption: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#F7FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', gap: 6 },
  notifOptionActive: { backgroundColor: '#FFF5F0', borderColor: '#FF6B35' },
  notifLabel: { fontSize: 12, fontWeight: '700', color: '#718096' },
  notifLabelActive: { color: '#FF6B35' },
  alertItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  alertName: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  alertDetail: { fontSize: 12, color: '#718096', marginTop: 2 },
  alertDate: { fontSize: 11, color: '#A0AEC0', marginTop: 1 },
  alertStatus: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  alertStatusText: { fontSize: 11, fontWeight: '700' },
  historyItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  historyName: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
  historyMsg: { fontSize: 12, color: '#4A5568', lineHeight: 17, marginTop: 2 },
  historyDate: { fontSize: 11, color: '#A0AEC0', marginTop: 2 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 8 },
  saveBtn: { borderRadius: 14, overflow: 'hidden' },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
