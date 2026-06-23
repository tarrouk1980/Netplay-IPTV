import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28', accent: '#F5A623',
  white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
};

export default function LiveTrafficScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🚦 Trafic en Direct</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🚧</Text>
        <Text style={styles.emptyTitle}>Bientôt disponible</Text>
        <Text style={styles.emptySub}>Les données de trafic en direct ne sont pas encore disponibles côté serveur.</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.browseBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
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
  title: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  browseBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14,
  },
  browseBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
});
