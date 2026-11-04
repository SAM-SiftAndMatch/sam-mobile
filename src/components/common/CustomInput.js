import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  isPassword = false,
  error,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  required = false,
  style,
  inputStyle,
  onFocus,
  onBlur,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          !!error && styles.errorWrapper,
          multiline && styles.multilineWrapper,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? COLORS.primary : COLORS.textMuted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          accessibilityLabel={label || placeholder}
          autoCapitalize={isPassword || keyboardType === 'email-address' ? 'none' : 'sentences'}
          autoCorrect={!(isPassword || keyboardType === 'email-address')}
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={(event) => { setIsFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setIsFocused(false); onBlur?.(event); }}
          style={[
            styles.textInput,
            multiline && { textAlignVertical: 'top', minHeight: 80 },
            inputStyle,
          ]}
        />

        {isPassword && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding,
  },
  label: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  requiredStar: {
    color: COLORS.danger,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  multilineWrapper: {
    paddingVertical: 10,
  },
  focusedWrapper: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  errorWrapper: {
    borderColor: COLORS.danger,
  },
  leftIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: SIZES.body1,
    fontFamily: 'BeVietnamPro_400Regular',
    color: COLORS.textPrimary,
    paddingVertical: 8,
  },
  eyeIcon: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
    marginLeft: 6,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.caption,
    marginTop: 4,
    marginLeft: 2,
  },
});

export default CustomInput;
