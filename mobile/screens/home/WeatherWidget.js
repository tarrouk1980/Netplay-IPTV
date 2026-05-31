import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';

const COLORS = {
  surface: '#1C1C28',
  accent: '#F5A623',
  text: '#FFFFFF',
  textMuted: '#8E8E9A',
  border: '#2C2C3A',
  rain: '#4A9EFF',
};

// Open-Meteo: free, no API key required
// WMO weather codes: https://open-meteo.com/en/docs
const WMO_LABELS = {
  0: { label: 'Ciel dégagé', icon: '☀️', rain: false },
  1: { label: 'Partiellement nuageux', icon: '🌤', rain: false },
  2: { label: 'Nuageux', icon: '⛅', rain: false },
  3: { label: 'Couvert', icon: '☁️', rain: false },
  45: { label: 'Brouillard', icon: '🌫', rain: false },
  48: { label: 'Brouillard givrant', icon: '🌫', rain: false },
  51: { label: 'Bruine légère', icon: '🌦', rain: true },
  53: { label: 'Bruine', icon: '🌧', rain: true },
  55: { label: 'Bruine dense', icon: '🌧', rain: true },
  61: { label: 'Pluie légère', icon: '🌧', rain: true },
  63: { label: 'Pluie modérée', icon: '🌧', rain: true },
  65: { label: 'Pluie forte', icon: '⛈', rain: true },
  71: { label: 'Neige légère', icon: '🌨', rain: false },
  73: { label: 'Neige', icon: '❄️', rain: false },
  80: { label: 'Averses légères', icon: '🌦', rain: true },
  81: { label: 'Averses', icon: '🌧', rain: true },
  82: { label: 'Averses fortes', icon: '⛈', rain: true },
  95: { label: 'Orage', icon: '⛈', rain: true },
};

function getWeatherInfo(code) {
  return WMO_LABELS[code] || { label: 'Inconnu', icon: '🌡', rain: false };
}

export default function WeatherWidget({ onTaxiSuggest }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      let lat = 36.8, lon = 10.18; // Tunis par défaut

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      const cw = data.current_weather;
      const precipProb = data.hourly?.precipitation_probability?.[new Date().getHours()] ?? 0;

      setWeather({
        temp: Math.round(cw.temperature),
        code: cw.weathercode,
        precipProb,
        ...getWeatherInfo(cw.weathercode),
      });
    } catch {
      // Fail silently — widget optional
    } finally {
      setLoading(false);
    }
  };

  if (loading || !weather || dismissed) return null;

  const isRainy = weather.rain || weather.precipProb >= 40;

  return (
    <View style={[styles.card, isRainy && styles.cardRain]}>
      <View style={styles.left}>
        <Text style={styles.icon}>{weather.icon}</Text>
        <View>
          <Text style={styles.temp}>{weather.temp}°C</Text>
          <Text style={styles.label}>{weather.label}</Text>
          {weather.precipProb > 0 && (
            <Text style={styles.precip}>💧 {weather.precipProb}% de pluie</Text>
          )}
        </View>
      </View>

      {isRainy && (
        <TouchableOpacity
          style={styles.taxiBtn}
          onPress={onTaxiSuggest}
          activeOpacity={0.85}
        >
          <Text style={styles.taxiBtnText}>🚕 Prendre un taxi</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.closeBtn} onPress={() => setDismissed(true)}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardRain: {
    borderColor: COLORS.rain,
    backgroundColor: '#0D1E2E',
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  icon: { fontSize: 32 },
  temp: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  label: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  precip: { color: COLORS.rain, fontSize: 11, marginTop: 2 },
  taxiBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    marginRight: 8,
  },
  taxiBtnText: { color: '#000', fontWeight: '700', fontSize: 12 },
  closeBtn: { padding: 4 },
  closeText: { color: COLORS.textMuted, fontSize: 14 },
});
