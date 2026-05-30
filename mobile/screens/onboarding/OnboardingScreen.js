import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'slide1',
    icon: '🚕',
    title: 'Bienvenue sur EASYWAY',
    subtitle: 'La super-app tunisienne de mobilité et services',
  },
  {
    key: 'slide2',
    icon: '🚛',
    title: 'Taxi, SOS, Livraison',
    subtitle: 'Tous vos services en un seul endroit, disponibles 24h/24',
  },
  {
    key: 'slide3',
    icon: '🎁',
    title: 'Pass journalier à 1 TND',
    subtitle: 'Zéro commission. Les prestataires payent 1 TND/jour seulement.',
    isLast: true,
  },
];

export default function OnboardingScreen({ navigation }) {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    navigation.replace('Login');
  };

  const handleStart = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.slideIcon}>{item.icon}</Text>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      {item.isLast && (
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>Commencer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>EASYWAY</Text>
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.75}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderSlide}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  logo: {
    color: '#F5A623',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  skipText: {
    color: '#8E8E9A',
    fontSize: 14,
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: 32,
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  slideSubtitle: {
    color: '#8E8E9A',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#F5A623',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 8,
  },
  startButtonText: {
    color: '#0A0A0F',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 48,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C2C3E',
  },
  dotActive: {
    backgroundColor: '#F5A623',
    width: 24,
  },
});
