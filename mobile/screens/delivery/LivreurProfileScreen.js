import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', surfaceAlt: '#16161F',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
  green: '#27AE60', red: '#E74C3C', blue: '#3498DB', orange: '#E67E22',
};

const MOCK = {
  name: 'Khaled Mansouri', zone: 'Tunis Nord', rating: 4.8,
  deliveriesToday: 11, earningsToday: 55.50,
  deliveriesTotal: 1247, earningsMonth: 1820.00,
  vehicle: 'Scooter · TUN-5541', status: 'active',
  joinDate: 'Janvier 2024',
  docs: [
    { label: 'Permis de conduire', status: 'valid', expires: '12/2028' },
    { label: 'Carte d\'identité', status: 'valid', expires: '08/2027' },
    { label: 'Assurance véhicule', status: 'warning', expires: '30/06/2026' },
  ],
  badges: ['⚡ Rapide', '⭐ Top noté', '🔥 100+ livraisons'],
  recentDeliveries: [
    { id: 'DEL-4441', merchant: 'Pizza Roma', fare: 6.50, time: '15:02', rating: 5 },
    { id: 'DEL-4440', merchant: 'Burger House', fare: 7.00, time: '14:20', rating: null },
    { id: 'DEL-4439', merchant: 'Épicerie Centrale', fare: 5.50, time: '13:45', rating: 4 },
  ],
};

const DOC_META = {
  valid:   { label: 'Valide',    color: COLORS.green },
  warning: { label: 'Expire bientôt', color: COLORS.orange },
  expired: { label: 'Expiré',   color: COLORS.red },
};

export default function LivreurProfileScreen({ navigation }) {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tab, setTab] = useState('info');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Modifier</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar + Name */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 40 }}>🛵</Text>
        </View>
        <Text style={styles.profileName}>{MOCK.name}</Text>
        <Text style={styles.profileRole}>LIVREUR · {MOCK.zone}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>⭐ {MOCK.rating}</Text>
          <Text style={styles.ratingDot}>·</Text>
          <Text style={styles.ratingText}>{MOCK.deliveriesTotal} livraisons</Text>
          <Text style={styles.ratingDot}>·</Text>
          <Text style={styles.ratingText}>Depuis {MOCK.joinDate}</Text>
        </View>
        <View style={styles.badgeRow}>
          {MOCK.badges.map(b => (
            <View key={b} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>
          ))}
        </View>
      </View>

      {/* Today stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{MOCK.deliveriesToday}</Text>
          <Text style={styles.statLbl}>Livraisons</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: COLORS.accent }]}>{MOCK.earningsToday.toFixed(2)} TND</Text>
          <Text style={styles.statLbl}>Gains auj.</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: COLORS.green }]}>{MOCK.earningsMonth.toLocaleString()} TND</Text>
          <Text style={styles.statLbl}>Ce mois</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[['info', 'Infos'], ['docs', 'Docs'], ['history', 'Historique']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.tab, tab === val && styles.tabActive]}
            onPress={() => setTab(val)}
          >
            <Text style={[styles.tabText, tab === val && { color: '#000' }]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {tab === 'info' && (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoRow2}>🛵 Véhicule : <Text style={{ color: COLORS.white }}>{MOCK.vehicle}</Text></Text>
              <Text style={styles.infoRow2}>📍 Zone : <Text style={{ color: COLORS.white }}>{MOCK.zone}</Text></Text>
              <Text style={styles.infoRow2}>🟢 Statut : <Text style={{ color: COLORS.green }}>Actif</Text></Text>
            </View>

            <Text style={styles.sectionTitle}>🔔 Préférences notifications</Text>
            <View style={styles.toggleCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Notifications push</Text>
                <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: COLORS.accent }} />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Son pour nouvelles commandes</Text>
                <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ true: COLORS.accent }} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: '💰', label: 'Gains', screen: 'LivreurEarnings' },
                { icon: '📋', label: 'Commandes', screen: 'LivreurHistory' },
                { icon: '📞', label: 'Support', screen: 'Support' },
                { icon: '⚙️', label: 'Paramètres', screen: 'Settings' },
              ].map(a => (
                <TouchableOpacity
                  key={a.screen}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(a.screen)}
                >
                  <Text style={{ fontSize: 24 }}>{a.icon}</Text>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {tab === 'docs' && (
          <>
            {MOCK.docs.map((d) => {
              const meta = DOC_META[d.status];
              return (
                <View key={d.label} style={[styles.docCard, { borderColor: meta.color + '55' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docLabel}>{d.label}</Text>
                    <Text style={styles.docExpire}>Expire : {d.expires}</Text>
                  </View>
                  <View style={[styles.docBadge, { backgroundColor: meta.color + '22' }]}>
                    <Text style={{ color: meta.color, fontSize: 12, fontWeight: '700' }}>{meta.label}</Text>
                  </View>
                </View>
              );
            })}
            <TouchableOpacity style={styles.uploadBtn}>
              <Text style={styles.uploadBtnText}>📤 Mettre à jour un document</Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'history' && (
          <>
            {MOCK.recentDeliveries.map((d) => (
              <View key={d.id} style={styles.delivRow}>
                <Text style={styles.delivTime}>{d.time}</Text>
                <Text style={styles.delivMerchant} numberOfLines={1}>{d.merchant}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.delivFare}>{d.fare.toFixed(2)} TND</Text>
                {d.rating ? (
                  <Text style={styles.delivRating}>⭐{d.rating}</Text>
                ) : (
                  <View style={styles.pendingBadge}>
                    <Text style={{ color: COLORS.muted, fontSize: 9 }}>En attente</Text>
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => navigation.navigate('LivreurHistory')}
            >
              <Text style={styles.seeAllText}>Voir tout l'historique ›</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  profileCard: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent, marginBottom: 12,
  },
  profileName: { color: COLORS.white, fontSize: 20, fontWeight: '900', marginBottom: 4 },
  profileRole: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  ratingText: { color: COLORS.muted, fontSize: 12 },
  ratingDot: { color: COLORS.border },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.border },
  badgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statNum: { color: COLORS.white, fontSize: 16, fontWeight: '900', marginBottom: 2 },
  statLbl: { color: COLORS.muted, fontSize: 10 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, gap: 8 },
  infoRow2: { color: COLORS.muted, fontSize: 13 },
  toggleCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  toggleLabel: { color: COLORS.white, fontSize: 13 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionCard: { width: '22%', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  actionLabel: { color: COLORS.muted, fontSize: 10, textAlign: 'center' },
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 8 },
  docLabel: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  docExpire: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  docBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  uploadBtn: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginTop: 8 },
  uploadBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  delivRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border },
  delivTime: { color: COLORS.muted, fontSize: 12, width: 40 },
  delivMerchant: { color: COLORS.white, fontSize: 13, fontWeight: '600', maxWidth: 120 },
  delivFare: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  delivRating: { color: COLORS.accent, fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  pendingBadge: { backgroundColor: COLORS.surfaceAlt, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.border },
  seeAllBtn: { alignItems: 'center', paddingVertical: 14 },
  seeAllText: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
});
