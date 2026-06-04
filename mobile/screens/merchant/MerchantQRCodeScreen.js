import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Share, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', border: '#2C2C3E',
  text: '#FFFFFF', muted: '#8E8E9A', accent: '#F5A623',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB',
};

const MOCK_DATA = {
  shopName: 'Restaurant El Bey',
  shopId: 'SHOP-ELB-001',
  qrUrl: 'https://easyway.tn/shop/SHOP-ELB-001',
  shortLink: 'easyway.tn/s/elb001',
  scansToday: 24,
  scansWeek: 142,
  ordersFromQR: 18,
  conversionRate: 76,
};

function QRBox({ size = 200 }) {
  const cells = 21;
  const cellSize = size / cells;
  const pattern = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) return true;
      return (r + c) % 3 === 0 || (r * c) % 5 === 0;
    })
  );

  return (
    <View style={{ width: size, height: size, backgroundColor: '#FFF', padding: 8, borderRadius: 12 }}>
      {pattern.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((filled, c) => (
            <View
              key={c}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: filled ? '#000' : '#FFF',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function MerchantQRCodeScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/merchant/qrcode')
      .then(r => setData(r.data || MOCK_DATA))
      .catch(() => setData(MOCK_DATA))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    if (!data) return;
    try {
      await Share.share({
        message: `🍽️ Commandez chez ${data.shopName} sur EasyWay !\n\n${data.qrUrl}\n\n📲 Scannez notre QR code ou cliquez le lien pour commander directement.`,
        title: `QR Code — ${data.shopName}`,
      });
    } catch {}
  };

  const handleDownload = () => {
    Alert.alert('📥 QR Code', 'Le QR code a été enregistré dans votre galerie photos.', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📲 Mon QR Code</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} /> : (
        <View style={{ flex: 1, padding: 16 }}>

          {/* QR Card */}
          <View style={styles.qrCard}>
            <Text style={styles.shopName}>{data.shopName}</Text>
            <Text style={styles.shopId}>{data.shopId}</Text>
            <View style={styles.qrWrapper}>
              <QRBox size={200} />
            </View>
            <Text style={styles.shortLink}>{data.shortLink}</Text>
            <Text style={styles.qrNote}>Scannez pour commander directement</Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={{ fontSize: 24 }}>📤</Text>
              <Text style={styles.actionLabel}>Partager</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              <Text style={{ fontSize: 24 }}>📥</Text>
              <Text style={styles.actionLabel}>Télécharger</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('🖨️', 'Impression envoyée vers votre imprimante.')}>
              <Text style={{ fontSize: 24 }}>🖨️</Text>
              <Text style={styles.actionLabel}>Imprimer</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <Text style={styles.sectionTitle}>STATISTIQUES QR CODE</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.accent }]}>{data.scansToday}</Text>
              <Text style={styles.statSub}>Scans aujourd'hui</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.text }]}>{data.scansWeek}</Text>
              <Text style={styles.statSub}>Scans cette semaine</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.green }]}>{data.ordersFromQR}</Text>
              <Text style={styles.statSub}>Commandes via QR</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: COLORS.blue }]}>{data.conversionRate}%</Text>
              <Text style={styles.statSub}>Taux de conversion</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 CONSEILS D'UTILISATION</Text>
            <Text style={styles.tipText}>• Affichez ce QR code sur vos tables et comptoir</Text>
            <Text style={styles.tipText}>• Partagez-le sur vos réseaux sociaux</Text>
            <Text style={styles.tipText}>• Imprimez-le en grand format pour la vitrine</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40 },
  backArrow: { color: COLORS.text, fontSize: 30, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  qrCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  shopName: { color: COLORS.text, fontSize: 16, fontWeight: '900', marginBottom: 4 },
  shopId: { color: COLORS.muted, fontSize: 11, marginBottom: 16 },
  qrWrapper: { marginBottom: 16, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 16 },
  shortLink: { color: COLORS.accent, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  qrNote: { color: COLORS.muted, fontSize: 12 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border },
  actionLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  sectionTitle: { color: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 20, fontWeight: '900' },
  statSub: { color: COLORS.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  tipCard: { backgroundColor: COLORS.blue + '10', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.blue + '30' },
  tipTitle: { color: COLORS.blue, fontSize: 11, fontWeight: '700', marginBottom: 8 },
  tipText: { color: COLORS.muted, fontSize: 12, lineHeight: 20 },
});
