import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#0A0A0F',
  surface: '#1C1C28',
  primary: '#F5A623',
  text: '#FFFFFF',
  muted: '#8E8E9A',
  border: '#2C2C3A',
  green: '#4CAF50',
  red: '#F44336',
  orange: '#FF9800',
};

export default function SecurityScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sécurité du compte</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 2FA - not yet available */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Éléments de sécurité</Text>
          <View style={styles.card}>
            <View style={styles.securityItem}>
              <View style={styles.secItemLeft}>
                <Text style={styles.secItemLabel}>Vérification en 2 étapes</Text>
                <Text style={styles.secItemSub}>Bientôt disponible</Text>
              </View>
              <Text style={styles.statusIcon}>🚧</Text>
            </View>
          </View>
        </View>

        {/* Recent activity - not yet available */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <View style={styles.card}>
            <View style={styles.securityItem}>
              <View style={styles.secItemLeft}>
                <Text style={styles.secItemLabel}>Historique de connexion</Text>
                <Text style={styles.secItemSub}>Bientôt disponible</Text>
              </View>
              <Text style={styles.statusIcon}>🚧</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('SecuritySettings')}>
            <Text style={styles.outlineBtnText}>Changer le mot de passe</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { color: COLORS.text, fontSize: 22 },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  statusCard: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusEmoji: { fontSize: 40, marginBottom: 8 },
  statusLabel: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  scoreBarContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scoreText: { fontSize: 14, fontWeight: '700', width: 40, textAlign: 'right' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  secItemLeft: { flex: 1, marginRight: 12 },
  secItemLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  secItemSub: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  statusIcon: { fontSize: 18 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityLeft: { flex: 1 },
  activityDevice: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  activityDate: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  activityLocation: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  activityBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginLeft: 10 },
  activityBadgeText: { fontSize: 12, fontWeight: '700' },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  dangerBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerBtnText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});
