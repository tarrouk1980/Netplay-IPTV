import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import hotelAPI from '../../services/hotelService';

export default function HotelSearchBar({ value, onChangeText, onSelect, placeholder = 'Destination, hôtel...' }) {
  const [suggestions, setSuggestions] = useState([]);
  const timeout = useRef(null);

  function handleChange(text) {
    onChangeText && onChangeText(text);
    clearTimeout(timeout.current);
    if (text.length >= 2) {
      timeout.current = setTimeout(async () => {
        try {
          const res = await hotelAPI.autocomplete(text);
          setSuggestions(res.data?.data || []);
        } catch {}
      }, 300);
    } else {
      setSuggestions([]);
    }
  }

  function handleSelect(s) {
    setSuggestions([]);
    onSelect && onSelect(s);
  }

  return (
    <View>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color="#FF6B35" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          value={value}
          onChangeText={handleChange}
        />
        {value?.length > 0 && (
          <TouchableOpacity onPress={() => { onChangeText && onChangeText(''); setSuggestions([]); }}>
            <Ionicons name="close-circle" size={18} color="#A0AEC0" />
          </TouchableOpacity>
        )}
      </View>
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => handleSelect(s)}>
              <Ionicons name={s.type === 'hotel' ? 'bed-outline' : 'location-outline'} size={16} color="#718096" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.suggestionLabel}>{s.label}</Text>
                <Text style={styles.suggestionSub}>{s.sublabel}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: '#E2E8F0' },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#2D3748', fontWeight: '500' },
  suggestions: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 4, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  suggestionLabel: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
  suggestionSub: { fontSize: 12, color: '#718096' },
});
