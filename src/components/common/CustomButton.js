import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'medium', // 'small' | 'medium' | 'large'
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    let base = [styles.button];

    // Variant
    if (variant === 'primary') base.push(styles.primaryBtn);
    else if (variant === 'secondary') base.push(styles.secondaryBtn);
    else if (variant === 'outline') base.push(styles.outlineBtn);
    else if (variant === 'ghost') base.push(styles.ghostBtn);
    else if (variant === 'danger') base.push(styles.dangerBtn);

    // Size
    if (size === 'small') base.push(styles.smallBtn);
    else if (size === 'large') base.push(styles.largeBtn);

    // State
    if (disabled || loading) base.push(styles.disabledBtn);

    return base;
  };

  const getTextStyle = () => {
    let base = [styles.text];

    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      base.push(styles.whiteText);
    } else if (variant === 'outline') {
      base.push(styles.outlineText);
    } else if (variant === 'ghost') {
      base.push(styles.ghostText);
    }

    if (size === 'small') base.push(styles.smallText);
    else if (size === 'large') base.push(styles.largeText);

    return base;
  };

  const getIconColor = () => {
    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      return COLORS.white;
    }
    return COLORS.primary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[getContainerStyle(), style]}
    >
      {variant === 'primary' && (
        <LinearGradient
          pointerEvents="none"
          colors={[COLORS.primaryDark, COLORS.primary, COLORS.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: size === 'large' ? SIZES.radiusLg : size === 'small' ? SIZES.radiusSm : SIZES.radius }]}
        />
      )}
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={size === 'small' ? 16 : 20} color={getIconColor()} style={{ marginRight: 6 }} />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={size === 'small' ? 16 : 20} color={getIconColor()} style={{ marginLeft: 6 }} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.light,
  },
  secondaryBtn: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.light,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghostBtn: {
    backgroundColor: 'transparent',
  },
  dangerBtn: {
    backgroundColor: COLORS.danger,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm,
  },
  largeBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: SIZES.radiusLg,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  text: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
  whiteText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.primary,
  },
  smallText: {
    fontSize: SIZES.body3,
  },
  largeText: {
    fontSize: SIZES.h4,
    fontWeight: '700',
  },
});

export default CustomButton;
