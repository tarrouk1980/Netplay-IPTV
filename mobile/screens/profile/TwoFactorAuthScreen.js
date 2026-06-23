import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0A0A0F', surface: '#1C1C28',
  accent: '#F5A623', white: '#FFFFFF', muted: '#8A8A9A', border: '#2A2A3A',
};

export default function TwoFactorAuthScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Double authentification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🚧</Text>
        <Text style={styles.title}>Bientôt disponible</Text>
        <Text style={styles.sub}>
          La double authentification (2FA) sera bientôt disponible pour sécuriser davantage votre compte.
        </Text>
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
  headerTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  sub: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
