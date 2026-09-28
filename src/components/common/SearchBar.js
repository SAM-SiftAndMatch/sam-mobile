import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search jobs, skills, freelancers...',
  onFilterPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      ) : null}
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
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
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body2,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  filterBtn: {
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    marginLeft: 6,
  },
});

export default SearchBar;
