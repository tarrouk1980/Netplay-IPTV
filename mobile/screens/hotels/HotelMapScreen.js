import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Image, ActivityIndicator, StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

function buildMapHTML(hotels) {
  const hotelData = JSON.stringify(
    hotels.slice(0, 30).map(h => ({
      id: h.id,
      lat: h.lat || 36.8,
      lng: h.lng || 10.18,
      name: h.name,
      stars: h.stars,
      rating: h.rating,
      price: h.bestOffer?.discountedPrice || h.bestPrice || h.pricePerNight || 0,
      mainImage: h.mainImage,
      city: h.city,
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family: sans-serif; }
html,body,#map { width:100%; height:100%; }
.pm {
  background: #004E89; color:#fff; font-size:11px; font-weight:900;
  border-radius:14px; padding:4px 9px; white-space:nowrap;
  border:2.5px solid #fff; box-shadow:0 2px 10px rgba(0,0,0,0.35);
  cursor:pointer; transition: transform 0.1s;
}
.pm:active { transform: scale(0.95); }
.pm.excellent { background: #276749; }
.pm.good { background: #2B6CB0; }
.pm.ok { background: #C05621; }
.pm.low { background: #C53030; }
.pm.selected { transform: scale(1.15); border-color: #FF6B35; box-shadow: 0 3px 15px rgba(255,107,53,0.5); }
.leaflet-control-zoom { border: none !important; }
.leaflet-control-zoom a { border-radius: 8px !important; border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script>
const hotels = ${hotelData};
let selectedId = null;
let markerMap = {};

const map = L.map('map', { zoomControl: true, attributionControl: false });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const cluster = L.markerClusterGroup({ showCoverageOnHover:false, maxClusterRadius:60, spiderfyOnMaxZoom:true });

function ratingClass(r) {
  if (!r) return '';
  if (r >= 9) return 'excellent';
  if (r >= 8) return 'good';
  if (r >= 7) return 'ok';
  return 'low';
}

hotels.forEach(h => {
  const cls = ratingClass(h.rating);
  const label = h.price ? h.price + ' TND' : h.stars + '★';
  const icon = L.divIcon({
    className: '',
    html: '<div class="pm ' + cls + '" id="m_' + h.id + '">' + label + '</div>',
    iconAnchor: [32, 12],
  });
  const marker = L.marker([h.lat, h.lng], { icon });
  marker.on('click', () => {
    if (selectedId && markerMap[selectedId]) {
      const el = document.getElementById('m_' + selectedId);
      if (el) el.classList.remove('selected');
    }
    selectedId = h.id;
    const el = document.getElementById('m_' + h.id);
    if (el) el.classList.add('selected');
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'tap', hotel: h }));
  });
  markerMap[h.id] = marker;
  cluster.addLayer(marker);
});

map.addLayer(cluster);

if (hotels.length > 0) {
  const lats = hotels.map(h=>h.lat), lngs = hotels.map(h=>h.lng);
  map.fitBounds([[Math.min(...lats)-0.05,Math.min(...lngs)-0.05],[Math.max(...lats)+0.05,Math.max(...lngs)+0.05]], {padding:[40,40]});
}
</script>
</body>
</html>`;
}

export default function HotelMapScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { hotels = [], destination = '', checkIn, checkOut, guests } = route.params || {};
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapHTML = buildMapHTML(hotels);

  function handleMessage(event) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'tap') setSelectedHotel(msg.hotel);
    } catch {}
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{destination || 'Résultats'}</Text>
        </View>
        <View style={styles.countBadge}>
          <Ionicons name="bed-outline" size={13} color="#fff" />
          <Text style={styles.countText}>{hotels.length} hôtels</Text>
        </View>
      </View>

      {/* Loading state */}
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Chargement de la carte...</Text>
        </View>
      )}

      <WebView
        source={{ html: mapHTML }}
        style={StyleSheet.absoluteFill}
        onLoadEnd={() => setMapLoaded(true)}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
      />

      {/* Rating legend */}
      <View style={[styles.legend, { top: insets.top + 58 }]}>
        {[
          { color: '#276749', label: 'Excellent' },
          { color: '#2B6CB0', label: 'Très bien' },
          { color: '#C05621', label: 'Bien' },
          { color: '#C53030', label: 'Moyen' },
        ].map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Hotel Preview Card */}
      {selectedHotel && (
        <View style={[styles.previewCard, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.previewInner}>
            <Image source={{ uri: selectedHotel.mainImage }} style={styles.previewImage} />
            <View style={styles.previewContent}>
              <Text style={styles.previewName} numberOfLines={2}>{selectedHotel.name}</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: selectedHotel.stars || 0 }).map((_, i) => (
                  <Ionicons key={i} name="star" size={11} color="#F5A623" />
                ))}
              </View>
              <View style={styles.previewBottom}>
                <View style={[styles.ratingBadge, { backgroundColor: (selectedHotel.rating||0) >= 8.5 ? '#276749' : '#C05621' }]}>
                  <Text style={styles.ratingText}>{(selectedHotel.rating||0).toFixed(1)}</Text>
                </View>
                <View>
                  <Text style={styles.priceLabel}>Dès</Text>
                  <Text style={styles.priceText}>{selectedHotel.price || '—'} TND</Text>
                </View>
              </View>
            </View>
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.closePreview} onPress={() => setSelectedHotel(null)}>
                <Ionicons name="close" size={16} color="#718096" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => {
                  navigation.navigate('HotelDetail', { hotelId: selectedHotel.id, checkIn, checkOut, guests });
                  setSelectedHotel(null);
                }}
              >
                <LinearGradient colors={['#FF6B35','#e85520']} style={styles.viewBtnGrad}>
                  <Text style={styles.viewBtnText}>Voir</Text>
                  <Ionicons name="chevron-forward" size={14} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12, paddingBottom: 10,
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#718096', fontWeight: '600' },
  legend: {
    position: 'absolute', right: 12, zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.93)', borderRadius: 12, padding: 10, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontSize: 10, fontWeight: '600', color: '#2D3748' },
  previewCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 200,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 16, paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },
  previewInner: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  previewImage: { width: 90, height: 90, borderRadius: 12 },
  previewContent: { flex: 1 },
  previewName: { fontSize: 15, fontWeight: '800', color: '#1A202C', marginBottom: 4, lineHeight: 20 },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  previewBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  priceLabel: { fontSize: 10, color: '#A0AEC0' },
  priceText: { fontSize: 18, fontWeight: '900', color: '#FF6B35' },
  previewActions: { alignItems: 'flex-end', gap: 8 },
  closePreview: { backgroundColor: '#F7FAFC', borderRadius: 14, padding: 5 },
  viewBtn: { borderRadius: 10, overflow: 'hidden' },
  viewBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10 },
  viewBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
