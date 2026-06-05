import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

/**
 * EasywayLogo component
 * Props: size (default 120), showTagline (bool)
 */
export default function EasywayLogo({ size = 120, showTagline = false }) {
  // Scale factor relative to 120 base
  const scale = size / 120;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* Background square with rounded corners */}
        <Rect
          x="2"
          y="2"
          width="116"
          height="116"
          rx="22"
          ry="22"
          fill="#0A0A0F"
          stroke="#2A2A3A"
          strokeWidth="1.5"
        />
        {/* EASY in white */}
        <SvgText
          x="60"
          y="55"
          textAnchor="middle"
          fontSize="26"
          fontWeight="900"
          letterSpacing="2"
          fill="#FFFFFF"
          fontFamily="System"
        >
          EASY
        </SvgText>
        {/* WAY in red */}
        <SvgText
          x="60"
          y="83"
          textAnchor="middle"
          fontSize="26"
          fontWeight="900"
          letterSpacing="2"
          fill="#D32F2F"
          fontFamily="System"
        >
          WAY
        </SvgText>
      </Svg>
      {showTagline && (
        <Text style={styles.tagline}>La super-app tunisienne</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  tagline: {
    marginTop: 6,
    fontSize: 11,
    color: '#8E8E9A',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
