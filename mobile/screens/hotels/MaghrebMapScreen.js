import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

const COUNTRY_COLORS = {
  Tunisie: '#E74C3C',
  Maroc: '#27AE60',
  Algérie: '#2980B9',
};

const COUNTRY_FLAGS = {
  Tunisie: '🇹🇳',
  Maroc: '🇲🇦',
  Algérie: '🇩🇿',
};

// Données hôtels Maghreb (simplifiées pour la carte)
const MAGHREB_HOTELS = [
  // Tunisie
  { id: 'hotel-001', name: 'The Palace Hotel Tunis', city: 'Tunis', country: 'Tunisie', lat: 36.8189, lng: 10.1657, stars: 5 },
  { id: 'hotel-002', name: 'Djerba Beach Resort', city: 'Djerba', country: 'Tunisie', lat: 33.8076, lng: 10.9854, stars: 5 },
  { id: 'hotel-003', name: 'Hasdrubal Thalassa Hammamet', city: 'Hammamet', country: 'Tunisie', lat: 36.3958, lng: 10.5835, stars: 5 },
  { id: 'hotel-004', name: 'Marhaba Royal Salem Sousse', city: 'Sousse', country: 'Tunisie', lat: 35.8245, lng: 10.6346, stars: 4 },
  { id: 'hotel-005', name: 'Novotel Tunis', city: 'Tunis', country: 'Tunisie', lat: 36.8172, lng: 10.1795, stars: 4 },
  { id: 'hotel-006', name: 'Radisson Blu Monastir', city: 'Monastir', country: 'Tunisie', lat: 35.7649, lng: 10.8116, stars: 5 },
  { id: 'hotel-007', name: 'Dar Ben Gacem Tunis', city: 'Tunis', country: 'Tunisie', lat: 36.7992, lng: 10.1714, stars: 4 },
  { id: 'hotel-008', name: 'El Mouradi Palm Marina', city: 'Sousse', country: 'Tunisie', lat: 35.8917, lng: 10.5948, stars: 5 },
  { id: 'hotel-009', name: 'Loews Hotel Le Concorde', city: 'Tunis', country: 'Tunisie', lat: 36.8156, lng: 10.1813, stars: 5 },
  { id: 'hotel-010', name: 'Iberostar Kantaoui Bay', city: 'Sousse', country: 'Tunisie', lat: 35.9010, lng: 10.5965, stars: 5 },
  { id: 'hotel-014', name: 'Novotel Hammamet', city: 'Hammamet', country: 'Tunisie', lat: 36.3878, lng: 10.5672, stars: 4 },
  { id: 'hotel-015', name: 'Hôtel Sindbad Hammamet', city: 'Hammamet', country: 'Tunisie', lat: 36.4012, lng: 10.5789, stars: 3 },
  // Maroc
  { id: 'hotel-ma-001', name: 'La Mamounia Marrakech', city: 'Marrakech', country: 'Maroc', lat: 31.6247, lng: -7.9992, stars: 5 },
  { id: 'hotel-ma-002', name: 'Four Seasons Marrakech', city: 'Marrakech', country: 'Maroc', lat: 31.6089, lng: -8.0083, stars: 5 },
  { id: 'hotel-ma-003', name: 'Sofitel Casablanca', city: 'Casablanca', country: 'Maroc', lat: 33.5914, lng: -7.6207, stars: 5 },
  { id: 'hotel-ma-004', name: 'Riad Fès', city: 'Fès', country: 'Maroc', lat: 34.0643, lng: -4.9773, stars: 5 },
  { id: 'hotel-ma-005', name: 'Mazagan Beach Resort', city: 'El Jadida', country: 'Maroc', lat: 33.2316, lng: -8.5007, stars: 5 },
  { id: 'hotel-ma-006', name: 'Movenpick Mansour Eddahbi', city: 'Marrakech', country: 'Maroc', lat: 31.6375, lng: -7.9901, stars: 5 },
  { id: 'hotel-ma-007', name: 'Hyatt Regency Casablanca', city: 'Casablanca', country: 'Maroc', lat: 33.5918, lng: -7.6135, stars: 5 },
  { id: 'hotel-ma-008', name: 'Kenzi Agdal Resort', city: 'Marrakech', country: 'Maroc', lat: 31.5960, lng: -8.0144, stars: 5 },
  // Algérie
  { id: 'hotel-dz-001', name: 'Sheraton Club des Pins', city: 'Alger', country: 'Algérie', lat: 36.7291, lng: 2.8981, stars: 5 },
  { id: 'hotel-dz-002', name: 'Sofitel Alger Hamma Garden', city: 'Alger', country: 'Algérie', lat: 36.7525, lng: 3.0589, stars: 5 },
  { id: 'hotel-dz-003', name: 'El Aurassi Hotel Alger', city: 'Alger', country: 'Algérie', lat: 36.7432, lng: 3.0591, stars: 4 },
  { id: 'hotel-dz-004', name: 'Marriott Oran Hotel', city: 'Oran', country: 'Algérie', lat: 35.6969, lng: -0.6341, stars: 5 },
  { id: 'hotel-dz-005', name: 'Hilton Alger', city: 'Alger', country: 'Algérie', lat: 36.7389, lng: 3.0534, stars: 5 },
];

function buildLeafletHTML(hotels, activeFilter) {
  const filtered = activeFilter ? hotels.filter(h => h.country === activeFilter) : hotels;
  const markersJS = filtered.map(h => {
    const color = COUNTRY_COLORS[h.country] || '#999';
    const stars = '★'.repeat(h.stars);
    return `
      var marker_${h.id.replace(/-/g, '_')} = L.circleMarker([${h.lat}, ${h.lng}], {
        radius: 10,
        fillColor: '${color}',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);
      marker_${h.id.replace(/-/g, '_')}.bindPopup(
        '<div style="min-width:180px;font-family:sans-serif;">' +
        '<b style="font-size:13px;">${h.name.replace(/'/g, "\\'")}</b><br>' +
        '<span style="color:#666;font-size:11px;">${h.city}, ${h.country}</span><br>' +
        '<span style="color:#f39c12;font-size:12px;">${stars}</span>' +
        '</div>',
        { maxWidth: 220 }
      );
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { height: 100%; width: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script>
  var map = L.map('map', { zoomControl: true }).setView([33, 3], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  }).addTo(map);
  ${markersJS}
</script>
</body>
</html>`;
}

export default function MaghrebMapScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(null);

  const totalHotels = MAGHREB_HOTELS.length;
  const pays = Object.keys(COUNTRY_COLORS).length;
  const html = buildLeafletHTML(MAGHREB_HOTELS, activeFilter);

  const countryCounts = MAGHREB_HOTELS.reduce((acc, h) => {
    acc[h.country] = (acc[h.country] || 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Carte Maghreb</Text>
          <Text style={styles.headerSub}>EasyHotels Maghreb</Text>
        </View>
      </View>

      {/* Filtre pays */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterBtn, !activeFilter && styles.filterBtnActive]}
            onPress={() => setActiveFilter(null)}
          >
            <Text style={[styles.filterText, !activeFilter && styles.filterTextActive]}>Tous ({totalHotels})</Text>
          </TouchableOpacity>
          {Object.entries(COUNTRY_FLAGS).map(([country, flag]) => (
            <TouchableOpacity
              key={country}
              style={[styles.filterBtn, activeFilter === country && styles.filterBtnActive, { borderColor: COUNTRY_COLORS[country] }]}
              onPress={() => setActiveFilter(activeFilter === country ? null : country)}
            >
              <Text style={[styles.filterText, activeFilter === country && styles.filterTextActive]}>
                {flag} {country} ({countryCounts[country] || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Carte */}
      <View style={styles.mapContainer}>
        <WebView
          source={{ html }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          originWhitelist={['*']}
        />

        {/* Stats overlay haut-droite */}
        <View style={styles.statsOverlay}>
          <Text style={styles.statsText}>{totalHotels} hôtels • {pays} pays</Text>
        </View>

        {/* Légende bas-gauche */}
        <View style={styles.legend}>
          {Object.entries(COUNTRY_COLORS).map(([country, color]) => (
            <View key={country} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{COUNTRY_FLAGS[country]} {country}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    color: '#8E8E9A',
    fontSize: 12,
    marginTop: 1,
  },
  filterBar: {
    backgroundColor: '#111118',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  filterScroll: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1A1A2E',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#2C3E50',
    borderColor: '#FFFFFF',
  },
  filterText: {
    color: '#8E8E9A',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  statsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  legend: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
