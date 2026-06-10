import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSION_KEY = '@easyhotels_notifications_permission';

const benefits = [
  { icon: '⚡', label: 'Alertes en temps réel' },
  { icon: '💰', label: 'Économisez jusqu\'à 60%' },
  { icon: '🎯', label: 'Uniquement pour vos hôtels favoris' },
  { icon: '📵', label: 'Désactivez à tout moment' },
];

export default function NotificationsPermissionScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for bell
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim]);

  const handleEnable = async () => {
    try {
      if (Platform.OS === 'android') {
        // Android 13+ requires explicit permission request
        // In a real app: use react-native-permissions or Expo Notifications
        await AsyncStorage.setItem(PERMISSION_KEY, 'granted');
        Alert.alert(
          'Notifications activées !',
          'Vous recevrez des alertes dès que les prix baissent.',
          [{ text: 'Super !', onPress: () => navigation && navigation.goBack() }]
        );
      } else {
        // iOS: request permission via Notifications API in Expo or native module
        await AsyncStorage.setItem(PERMISSION_KEY, 'granted');
        Alert.alert(
          'Notifications activées !',
          'Vous recevrez des alertes dès que les prix baissent.',
          [{ text: 'Super !', onPress: () => navigation && navigation.goBack() }]
        );
      }
    } catch (err) {
      console.warn('[NotificationsPermission] Error saving permission:', err);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(PERMISSION_KEY, 'denied');
    navigation && navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Bell animation */}
        <Animated.View style={[styles.bellContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.bellEmoji}>🔔</Text>
        </Animated.View>

        <Text style={styles.title}>Activez les alertes prix</Text>
        <Text style={styles.subtitle}>
          Ne manquez plus jamais une bonne affaire !{'\n'}
          Recevez une notification dès que le prix de votre hôtel préféré baisse.
        </Text>

        {/* Benefits list */}
        <View style={styles.benefitsContainer}>
          {benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <Text style={styles.benefitLabel}>{b.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.enableButton} onPress={handleEnable} activeOpacity={0.85}>
          <Text style={styles.enableButtonText}>Activer les notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipButtonText}>Plus tard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  bellContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  bellEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  benefitIcon: {
    fontSize: 22,
    marginRight: 14,
    width: 32,
    textAlign: 'center',
  },
  benefitLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  enableButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '500',
  },
});
