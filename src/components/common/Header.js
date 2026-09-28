import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const Header = ({ title, showBack = false, onBackPress, rightIcon, onRightPress, subtitle }) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContainer}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Quay lại" onPress={onBackPress || (() => navigation.goBack())} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {rightIcon && onRightPress && (
        <TouchableOpacity onPress={onRightPress} style={styles.rightBtn}>
          <Ionicons name={rightIcon} size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    paddingRight: 12,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightBtn: {
    padding: 6,
  },
});

export default Header;
