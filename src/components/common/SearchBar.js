import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Tìm dự án, kỹ năng…',
  onFilterPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.icon} />
      <TextInput
        accessibilityLabel="Tìm kiếm dự án"
        autoCapitalize="none"
        returnKeyType="search"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
      />
      {value ? (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm" onPress={() => onChangeText('')} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      ) : null}
      {onFilterPress && (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Bộ lọc tìm kiếm" onPress={onFilterPress} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    fontSize: SIZES.body1,
    fontFamily: 'BeVietnamPro_400Regular',
    color: COLORS.textPrimary,
  },
  clearBtn: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  filterBtn: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    marginLeft: 6,
  },
});

export default SearchBar;
