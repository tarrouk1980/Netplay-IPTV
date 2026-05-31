import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  red: '#D32F2F',
  green: '#27AE60',
};

const CONTACTS_KEY = 'emergency_contacts';

export default function EmergencyScreen({ navigation }) {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [addingContact, setAddingContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [sosActive, setSosActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const locationWatcher = useRef(null);
  const broadcastInterval = useRef(null);
  const timerInterval = useRef(null);

  useEffect(() => {
    loadContacts();
    return () => stopSos();
  }, []);

  // Pulse animation
  useEffect(() => {
    if (sosActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [sosActive]);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTACTS_KEY);
      if (stored) setContacts(JSON.parse(stored));
    } catch {}
  };

  const saveContacts = async (list) => {
    setContacts(list);
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(list));
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Erreur', 'Renseignez le nom et le téléphone');
      return;
    }
    if (contacts.length >= 5) {
      Alert.alert('Limite', 'Maximum 5 contacts d\'urgence');
      return;
    }
    const updated = [...contacts, { id: Date.now().toString(), name: newName.trim(), phone: newPhone.trim() }];
    saveContacts(updated);
    setNewName('');
    setNewPhone('');
    setAddingContact(false);
  };

  const removeContact = (id) => {
    Alert.alert('Supprimer', 'Supprimer ce contact ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => saveContacts(contacts.filter((c) => c.id !== id)) },
    ]);
  };

  const startSos = async () => {
    if (contacts.length === 0) {
      Alert.alert('Aucun contact', 'Ajoutez au moins un contact d\'urgence');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Activez la géolocalisation');
      return;
    }

    setSosActive(true);
    setSeconds(0);

    // Timer
    timerInterval.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    // Get initial location and send SMS
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });

      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      // Send SMS to all contacts
      for (const contact of contacts) {
        const msg = `🆘 ${user?.name || 'Un utilisateur'} a activé le mode urgence EASYWAY. Position en temps réel: ${mapsLink}`;
        const encoded = encodeURIComponent(msg);
        const smsUrl = Platform.OS === 'android'
          ? `sms:${contact.phone}?body=${encoded}`
          : `sms:${contact.phone}&body=${encoded}`;
        Linking.openURL(smsUrl).catch(() => {});
      }
    } catch {}

    // Watch position
    locationWatcher.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (loc) => {
        setCurrentLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    );

    // Broadcast every 30s
    broadcastInterval.current = setInterval(async () => {
      if (currentLocation) {
        try {
          await api.post('/api/emergency/location', {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            contacts: contacts.map((c) => c.phone),
          });
        } catch {}
      }
    }, 30000);
  };

  const stopSos = () => {
    setSosActive(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (broadcastInterval.current) clearInterval(broadcastInterval.current);
    if (locationWatcher.current) locationWatcher.current.remove();
    timerInterval.current = null;
    broadcastInterval.current = null;
    locationWatcher.current = null;
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mode Urgence Famille</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* SOS Button */}
        <View style={styles.sosSection}>
          {sosActive && (
            <Text style={styles.timer}>⏱ {formatTime(seconds)}</Text>
          )}
          <Animated.View style={[styles.sosPulse, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={[styles.sosBtn, sosActive && styles.sosBtnActive]}
              onPress={sosActive ? stopSos : startSos}
              activeOpacity={0.85}
            >
              <Text style={styles.sosBtnEmoji}>🆘</Text>
              <Text style={styles.sosBtnLabel}>
                {sosActive ? 'DÉSACTIVER' : 'SOS FAMILLE'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {sosActive ? (
            <Text style={styles.sosStatus}>
              Position partagée avec {contacts.length} contact{contacts.length > 1 ? 's' : ''}
            </Text>
          ) : (
            <Text style={styles.sosHint}>
              Appuyez pour envoyer votre position à vos contacts d'urgence
            </Text>
          )}
          {sosActive && currentLocation && (
            <Text style={styles.locationText}>
              📍 {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
            </Text>
          )}
        </View>

        {/* Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contacts d'urgence</Text>
            {contacts.length < 5 && (
              <TouchableOpacity onPress={() => setAddingContact(true)}>
                <Text style={styles.addText}>+ Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>

          {addingContact && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Nom"
                placeholderTextColor={COLORS.textMuted}
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                style={styles.input}
                placeholder="Téléphone (+216...)"
                placeholderTextColor={COLORS.textMuted}
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
              />
              <View style={styles.addFormBtns}>
                <TouchableOpacity style={styles.confirmBtn} onPress={addContact}>
                  <Text style={styles.confirmBtnText}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelFormBtn} onPress={() => setAddingContact(false)}>
                  <Text style={styles.cancelFormText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {contacts.length === 0 && !addingContact && (
            <Text style={styles.emptyText}>Aucun contact d'urgence. Ajoutez-en un.</Text>
          )}

          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactRow}>
              <Text style={styles.contactEmoji}>👤</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => removeContact(contact.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Comment ça fonctionne</Text>
          <Text style={styles.infoText}>
            1. Ajoutez vos contacts de confiance (famille, amis){'\n'}
            2. En cas d'urgence, appuyez sur SOS FAMILLE{'\n'}
            3. Un SMS avec votre position GPS est envoyé à tous vos contacts{'\n'}
            4. Votre position est mise à jour en temps réel toutes les 30 secondes
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backText: { color: COLORS.text, fontSize: 28 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },

  sosSection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  timer: { color: COLORS.red, fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  sosPulse: {},
  sosBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.red,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  sosBtnActive: { backgroundColor: '#B71C1C' },
  sosBtnEmoji: { fontSize: 40 },
  sosBtnLabel: { color: '#fff', fontWeight: '900', fontSize: 14, marginTop: 6, letterSpacing: 1 },
  sosStatus: { color: COLORS.green, fontSize: 14, fontWeight: '600' },
  sosHint: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 32 },
  locationText: { color: COLORS.textMuted, fontSize: 11 },

  section: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  addText: { color: COLORS.red, fontWeight: '600', fontSize: 14 },

  addForm: { gap: 10, marginBottom: 16 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addFormBtns: { flexDirection: 'row', gap: 10 },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
  cancelFormBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelFormText: { color: COLORS.textMuted },

  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 12 },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  contactEmoji: { fontSize: 22 },
  contactName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  contactPhone: { color: COLORS.textMuted, fontSize: 13 },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#2A0A0A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.red + '55',
  },
  deleteBtnText: { color: COLORS.red, fontSize: 14 },

  infoCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
  },
  infoTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  infoText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 22 },
});
