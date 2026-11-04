import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import Text from '../../design/Text';
import { COLORS } from '../../constants/colors';

export default function BrandLogo({ tagline = false }) {
  return (
    <View style={styles.row}>
      <Image
        source={require('../../../assets/brand/sam-logo.png')}
        accessibilityLabel="SAM"
        style={styles.logo}
        resizeMode="contain"
      />
      {tagline && <Text style={styles.tagline}>SIFT & MATCH</Text>}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 92, height: 36, tintColor: '#167EAC' },
  tagline: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    paddingLeft: 12,
    fontSize: 10,
    letterSpacing: 1,
    color: COLORS.textMuted,
  },
});
