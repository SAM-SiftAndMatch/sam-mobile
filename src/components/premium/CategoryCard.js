import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

export const CategoryCard = ({ category, isSelected = false, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          isSelected && styles.selectedIconCircle,
        ]}
      >
        <Ionicons
          name={category.icon || 'briefcase-outline'}
          size={20}
          color={isSelected ? COLORS.white : COLORS.primary}
        />
      </View>
      <Text
        style={[
          styles.categoryName,
          isSelected && styles.selectedText,
        ]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
      {category.jobsCount !== undefined && (
        <Text
          style={[
            styles.jobsCountText,
            isSelected && styles.selectedJobsCount,
          ]}
        >
          {category.jobsCount} jobs
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minWidth: 100,
  },
  selectedCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  selectedIconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryName: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectedText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  jobsCountText: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectedJobsCount: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default CategoryCard;
