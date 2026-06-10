import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CITY_WEATHER = {
  'Tunis': { temp: 22, condition: 'sunny', humidity: 55, wind: 15, country: 'Tunisie', bestPeriod: 'Avril–Juin & Sept–Nov' },
  'Djerba': { temp: 26, condition: 'partly_cloudy', humidity: 60, wind: 20, country: 'Tunisie', bestPeriod: 'Mai–Octobre' },
  'Hammamet': { temp: 24, condition: 'sunny', humidity: 58, wind: 12, country: 'Tunisie', bestPeriod: 'Juin–Septembre' },
  'Sousse': { temp: 23, condition: 'sunny', humidity: 56, wind: 14, country: 'Tunisie', bestPeriod: 'Mai–Octobre' },
  'Monastir': { temp: 22, condition: 'partly_cloudy', humidity: 60, wind: 18, country: 'Tunisie', bestPeriod: 'Mai–Octobre' },
  'Paris': { temp: 12, condition: 'cloudy', humidity: 75, wind: 22, country: 'France', bestPeriod: 'Juin–Août' },
  'Dubai': { temp: 35, condition: 'sunny', humidity: 40, wind: 10, country: 'Émirats', bestPeriod: 'Novembre–Mars' },
  'Barcelone': { temp: 18, condition: 'sunny', humidity: 62, wind: 16, country: 'Espagne', bestPeriod: 'Juin–Septembre' },
};

const DAYS = ['Lun','Mar','Mer','Jeu','Ven'];
const CONDITIONS = ['sunny','sunny','partly_cloudy','sunny','cloudy'];

function WeatherIcon({ condition, size = 28, color }) {
  const iconMap = {
    sunny: 'sunny',
    partly_cloudy: 'partly-sunny',
    cloudy: 'cloudy',
    rainy: 'rainy',
    stormy: 'thunderstorm',
  };
  return <Ionicons name={iconMap[condition] || 'sunny'} size={size} color={color || '#F5A623'} />;
}

function getGradient(condition) {
  switch (condition) {
    case 'sunny': return ['#2B6CB0', '#4299E1'];
    case 'partly_cloudy': return ['#3182CE', '#63B3ED'];
    case 'cloudy': return ['#4A5568', '#718096'];
    case 'rainy': return ['#2D3748', '#4A5568'];
    default: return ['#2B6CB0', '#4299E1'];
  }
}

export default function WeatherWidget({ city = 'Tunis' }) {
  const weather = useMemo(() => CITY_WEATHER[city] || CITY_WEATHER['Tunis'], [city]);
  const gradient = useMemo(() => getGradient(weather.condition), [weather.condition]);

  const forecast = useMemo(() => {
    return DAYS.map((day, i) => ({
      day,
      condition: CONDITIONS[i],
      high: weather.temp + Math.round((Math.random() - 0.5) * 6),
      low: weather.temp - 6 + Math.round((Math.random() - 0.5) * 4),
    }));
  }, [city]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradient} style={styles.mainCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.cityName}>{city}</Text>
            <Text style={styles.countryName}>{weather.country}</Text>
          </View>
          <WeatherIcon condition={weather.condition} size={48} color="#fff" />
        </View>

        <Text style={styles.tempMain}>{weather.temp}°C</Text>
        <Text style={styles.conditionText}>
          {weather.condition === 'sunny' ? 'Ensoleillé' : weather.condition === 'partly_cloudy' ? 'Partiellement nuageux' : weather.condition === 'cloudy' ? 'Nuageux' : 'Pluvieux'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>{weather.humidity}%</Text>
            <Text style={styles.statLabel}>Humidité</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Ionicons name="flag-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>{weather.wind} km/h</Text>
            <Text style={styles.statLabel}>Vent</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Bonne</Text>
            <Text style={styles.statLabel}>Visibilité</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 5-day forecast */}
      <View style={styles.forecastRow}>
        {forecast.map((f, i) => (
          <View key={i} style={styles.forecastItem}>
            <Text style={styles.forecastDay}>{f.day}</Text>
            <WeatherIcon condition={f.condition} size={18} color="#718096" />
            <Text style={styles.forecastHigh}>{f.high}°</Text>
            <Text style={styles.forecastLow}>{f.low}°</Text>
          </View>
        ))}
      </View>

      {/* Best period banner */}
      <View style={styles.bestPeriodRow}>
        <Ionicons name="calendar-outline" size={14} color="#276749" />
        <Text style={styles.bestPeriodText}>Meilleure période: {weather.bestPeriod}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  mainCard: { padding: 16, paddingBottom: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cityName: { color: '#fff', fontSize: 18, fontWeight: '900' },
  countryName: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  tempMain: { color: '#fff', fontSize: 48, fontWeight: '900', lineHeight: 52 },
  conditionText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statSep: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  statText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  forecastRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  forecastItem: { flex: 1, alignItems: 'center', gap: 5 },
  forecastDay: { fontSize: 11, fontWeight: '700', color: '#718096' },
  forecastHigh: { fontSize: 13, fontWeight: '700', color: '#1A202C' },
  forecastLow: { fontSize: 11, color: '#A0AEC0' },
  bestPeriodRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, backgroundColor: '#F0FFF4' },
  bestPeriodText: { fontSize: 12, fontWeight: '600', color: '#276749' },
});
