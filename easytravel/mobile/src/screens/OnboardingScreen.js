import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: '✈️⛴️',
    title: 'EasyFlight + Ferries',
    subtitle:
      'Comparez vols ET ferries Espagne ↔ Maghreb en quelques secondes',
  },
  {
    id: '2',
    icon: '💶',
    title: 'Les meilleurs prix',
    subtitle:
      'Ryanair, Vueling, Iberia, Balearia côte à côte. On trouve le moins cher pour vous.',
  },
  {
    id: '3',
    icon: '🔔',
    title: 'Alertes & Calendrier',
    subtitle:
      "Définissez votre prix cible. On vous alerte dès qu'il baisse.",
  },
];

export default function OnboardingScreen({ onDone }) {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleDone();
    }
  };

  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('onboarding_done', '1');
    } catch (_) {
      // ignore storage errors
    }
    onDone?.();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Slide
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 120, // space for dots + button
  },
  icon: {
    fontSize: 80,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  dot: {
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.subtle,
  },

  // Button
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
