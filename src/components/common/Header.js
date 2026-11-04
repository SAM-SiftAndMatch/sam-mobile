import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { screenNavigation } from '../../navigation/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

/** @param {import('./types').HeaderProps} props */
export const Header = ({
  title,
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  subtitle,
  rightAccessibilityLabel,
}) => {
  const navigation = screenNavigation;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContainer}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={onBackPress || (() => navigation.goBack())}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.heading}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {rightIcon && onRightPress && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            rightAccessibilityLabel ||
            {
              'add-circle-outline': 'Tạo dự án',
              'chatbubbles-outline': 'Mở tin nhắn',
              'log-out-outline': 'Đăng xuất',
            }[rightIcon] ||
            'Tùy chọn'
          }
          onPress={onRightPress}
          style={styles.rightBtn}
        >
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: 12,
  },
  heading: { flex: 1, minWidth: 0 },
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
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
});

export default Header;
