import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.textInput,
            multiline && { textAlignVertical: 'top', minHeight: 80 },
            inputStyle,
          ]}
        />

        {isPassword && (
          <TouchableOpacity
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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    borderRadius: SIZES.radius,
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
    fontSize: SIZES.body2,
    color: COLORS.textPrimary,
    paddingVertical: 8,
  },
  eyeIcon: {
    padding: 4,
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
