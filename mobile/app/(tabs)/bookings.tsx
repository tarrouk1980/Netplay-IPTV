import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api, Booking, Paginated } from '@/lib/api';
import { BookingCard } from '@/components/BookingCard';
import { loadUser, AuthUser } from '@/lib/auth';
import { router } from 'expo-router';

export default function BookingsScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    loadUser().then(setUser);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Booking>>('/bookings');
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Connexion requise</Text>
          <Text style={styles.emptyDesc}>Connectez-vous pour voir vos réservations</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login' as any)}>
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bookings = data?.data ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes séances</Text>
        <Text style={styles.headerSub}>Gérez vos réservations</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.lockIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Aucune réservation</Text>
          <Text style={styles.emptyDesc}>Réservez votre première session avec un expert</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/experts' as any)}>
            <Text style={styles.loginButtonText}>Trouver un expert</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <BookingCard booking={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1E1B4B', marginBottom: 2 },
  headerSub: { fontSize: 13, color: '#6B7280' },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 24 },
  lockIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E1B4B' },
  emptyDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  loginButton: {
    marginTop: 8, backgroundColor: '#4F46E5', borderRadius: 99,
    paddingHorizontal: 28, paddingVertical: 13,
  },
  loginButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
