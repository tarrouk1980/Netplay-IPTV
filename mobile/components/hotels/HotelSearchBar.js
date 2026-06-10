import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = '@hotel_recent_searches';
const POPULAR = ['Tunis', 'Djerba', 'Hammamet', 'Sousse', 'Paris', 'Dubai'];
const MAX_RECENT = 5;

export default function HotelSearchBar({ value, onChangeText, onSubmit, placeholder = 'Destination, hôtel...' }) {
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    if (focused) {
      loadRecent();
      Animated.spring(expandAnim, { toValue: 1, useNativeDriver: false, tension: 60, friction: 8 }).start();
    } else {
      Animated.timing(expandAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    }
  }, [focused]);

  async function loadRecent() {
    try {
      const raw = await AsyncStorage.getItem(RECENT_KEY);
      setRecentSearches(JSON.parse(raw || '[]'));
    } catch {}
  }

  async function saveRecent(query) {
    if (!query?.trim()) return;
    try {
      const existing = JSON.parse(await AsyncStorage.getItem(RECENT_KEY) || '[]');
      const updated = [query, ...existing.filter(s => s !== query)].slice(0, MAX_RECENT);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}
  }

  async function clearRecent() {
    await AsyncStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  }

  function handleSubmit(query) {
    const q = query || value;
    if (!q?.trim()) return;
    saveRecent(q);
    setFocused(false);
    inputRef.current?.blur();
    onSubmit?.(q);
  }

  function handleSuggestionPress(q) {
    onChangeText?.(q);
    handleSubmit(q);
  }

  const dropdownHeight = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 290] });
  const dropdownOpacity = expandAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });

  const showDropdown = focused;

  return (
    <View style={styles.container}>
      <View style={[styles.bar, focused && styles.barFocused]}>
        <Ionicons name="search" size={18} color={focused ? '#FF6B35' : '#A0AEC0'} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          returnKeyType="search"
          onSubmitEditing={() => handleSubmit(value)}
        />
        {value?.length > 0 && (
          <TouchableOpacity onPress={() => { onChangeText?.(''); inputRef.current?.focus(); }}>
            <Ionicons name="close-circle" size={18} color="#A0AEC0" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.voiceBtn} onPress={() => {}}>
          <Ionicons name="mic-outline" size={18} color="#718096" />
        </TouchableOpacity>
      </View>

      {showDropdown && (
        <Animated.View style={[styles.dropdown, { maxHeight: dropdownHeight, opacity: dropdownOpacity }]}>
          {recentSearches.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>Récentes</Text>
                <TouchableOpacity onPress={clearRecent}>
                  <Text style={styles.clearText}>Effacer</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((s, i) => (
                <TouchableOpacity key={`r-${i}`} style={styles.item} onPress={() => handleSuggestionPress(s)}>
                  <Ionicons name="time-outline" size={15} color="#A0AEC0" />
                  <Text style={styles.itemText}>{s}</Text>
                  <TouchableOpacity onPress={() => {
                    const upd = recentSearches.filter(r => r !== s);
                    setRecentSearches(upd);
                    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(upd)).catch(() => {});
                  }}>
                    <Ionicons name="close" size={14} color="#CBD5E0" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          )}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Populaires</Text>
          </View>
          <View style={styles.popularRow}>
            {POPULAR.map(p => (
              <TouchableOpacity key={p} style={styles.popularChip} onPress={() => handleSuggestionPress(p)}>
                <Ionicons name="location-outline" size={12} color="#FF6B35" />
                <Text style={styles.popularChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 50 },
  bar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11,
    borderWidth: 1.5, borderColor: '#E2E8F0', gap: 8,
  },
  barFocused: {
    borderColor: '#FF6B35', backgroundColor: '#fff',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  input: { flex: 1, fontSize: 15, color: '#2D3748', fontWeight: '500' },
  voiceBtn: { backgroundColor: '#F7FAFC', borderRadius: 10, padding: 4 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
    zIndex: 100,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 0.5 },
  clearText: { fontSize: 12, color: '#FF6B35', fontWeight: '600' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  itemText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#2D3748' },
  popularRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
  popularChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF5F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#FECDB2' },
  popularChipText: { fontSize: 12, fontWeight: '600', color: '#FF6B35' },
});
