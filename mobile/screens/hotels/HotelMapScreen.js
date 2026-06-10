import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, WebView as RNWebView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HotelMapScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { hotels = [], destination = '' } = route.params || {};
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Build OSM map HTML with markers
  const markers = hotels.slice(0, 20).map((h, i) => ({
    lat: h.lat || 36.8, lng: h.lng || 10.18, name: h.name, price: h.bestOffer?.discountedPrice || h.bestPrice || '?', id: h.id
  }));

  const mapHTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  #map { width: 100vw; height: 100vh; }
  .price-marker { background: #FF6B35; color: white; padding: 4px 8px; border-radius: 14px; font-weight: 800; font-size: 12px; white-space: nowrap; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
</style>
</head>
<body>
<div id="map"></div>
<script>
var markers = ${JSON.stringify(markers)};
var center = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [36.8, 10.18];
var map = L.map('map').setView(center, 9);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

markers.forEach(function(m) {
  var icon = L.divIcon({
    className: '',
    html: '<div class="price-marker">' + m.price + ' TND</div>',
    iconAnchor: [30, 16],
  });
  L.marker([m.lat, m.lng], { icon: icon })
    .bindPopup('<strong>' + m.name + '</strong><br/>Dès ' + m.price + ' TND/nuit')
    .addTo(map)
    .on('click', function() {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ hotelId: m.id, name: m.name, price: m.price }));
    });
});

if (markers.length > 1) {
  var bounds = markers.map(m => [m.lat, m.lng]);
  map.fitBounds(bounds, { padding: [40, 40] });
}
</script>
</body>
</html>`;

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setSelectedHotel(data);
    } catch {}
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.title}>Carte · {destination || 'Résultats'}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{hotels.length} hôtels</Text>
        </View>
      </View>

      <WebView
        source={{ html: mapHTML }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        javaScriptEnabled
        originWhitelist={['*']}
      />

      {selectedHotel && (
        <View style={[styles.hotelPreview, { paddingBottom: insets.bottom + 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewName} numberOfLines={1}>{selectedHotel.name}</Text>
            <Text style={styles.previewPrice}>Dès {selectedHotel.price} TND/nuit</Text>
          </View>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => {
              const h = hotels.find(h => h.id === selectedHotel.hotelId);
              if (h) navigation.navigate('HotelDetail', { hotelId: h.id });
              setSelectedHotel(null);
            }}
          >
            <Text style={styles.viewBtnText}>Voir l'hôtel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedHotel(null)}>
            <Ionicons name="close" size={16} color="#718096" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingBottom: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  backBtn: { padding: 6 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1A202C' },
  countBadge: { backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  hotelPreview: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  previewName: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  previewPrice: { fontSize: 13, color: '#FF6B35', fontWeight: '600', marginTop: 2 },
  viewBtn: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  closeBtn: { padding: 4 },
});
