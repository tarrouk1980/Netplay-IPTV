import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { loadUser, logout, AuthUser } from '@/lib/auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MENU_ITEMS = [
  { icon: 'calendar-outline', label: 'Mes séances', route: '/bookings' },
  { icon: 'heart-outline', label: 'Mes favoris', route: '/dashboard/favorites' },
  { icon: 'settings-outline', label: 'Paramètres', route: '/settings' },
  { icon: 'help-circle-outline', label: 'Aide & Support', route: '/support' },
];

export default function ProfileScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    loadUser().then(setUser);
  }, []);

  async function handleLogout() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
          setUser(null);
          router.replace('/login' as any);
        },
      },
    ]);
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.lockIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Non connecté</Text>
          <Text style={styles.emptyDesc}>Connectez-vous pour accéder à votre profil</Text>
          <TouchableOpacity style={styles.authButton} onPress={() => router.push('/login' as any)}>
            <Text style={styles.authButtonText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.authButton, styles.secondaryButton]} onPress={() => router.push('/register' as any)}>
            <Text style={[styles.authButtonText, styles.secondaryButtonText]}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUrl = user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <LinearGradient
          colors={['#1E1B4B', '#4338CA']}
          style={styles.profileHeader}
        >
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role === 'expert' ? '🎯 Expert' : user.role === 'admin' ? '⚡ Admin' : '👤 Client'}</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Séances</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>4.9</Text>
            <Text style={styles.statLabel}>Note moy.</Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={20} color="#4F46E5" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 24 },
  lockIcon: { fontSize: 64, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E1B4B' },
  emptyDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 8 },
  authButton: { width: '100%', backgroundColor: '#4F46E5', borderRadius: 99, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  authButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#4F46E5' },
  secondaryButtonText: { color: '#4F46E5' },
  profileHeader: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', marginBottom: 12 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  userEmail: { color: '#A5B4FC', fontSize: 13, marginBottom: 10 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 5 },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: -16,
    borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: '#1E1B4B' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },
  menuSection: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIconContainer: { width: 36, height: 36, backgroundColor: '#EEF2FF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E1B4B' },
  logoutSection: { marginHorizontal: 16, marginTop: 12 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
});
