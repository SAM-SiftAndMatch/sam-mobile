import { formatCurrency } from '../../utils/formatCurrency';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { CustomButton } from '../common/CustomButton';

export const PremiumCard = ({ plan, isCurrentPlan = false, onSelect }) => {
  return (
    <View style={[styles.card, plan.popular && styles.popularCard]}>
      {plan.popular && (
        <View style={styles.popularTag}>
          <Ionicons name="sparkles" size={12} color={COLORS.white} />
          <Text style={styles.popularTagText}>ĐƯỢC QUAN TÂM</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.planName, { color: plan.badgeColor || COLORS.primary }]}>
          {plan.name}
        </Text>
        <Text style={styles.description}>{plan.description}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            {plan.price === 0 ? 'Miễn phí' : formatCurrency(plan.price, plan.currency)}
          </Text>
          {plan.price > 0 && <Text style={styles.periodText}>/{plan.period}</Text>}
        </View>
      </View>

      {/* Feature list */}
      <View style={styles.featureList}>
        {plan.features.map((feature, idx) => (
          <View key={idx} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <CustomButton
        title={isCurrentPlan ? 'Gói đang sử dụng' : `Chọn gói ${plan.name}`}
        onPress={onSelect}
        variant={isCurrentPlan ? 'outline' : plan.popular ? 'secondary' : 'primary'}
        disabled={isCurrentPlan}
        style={styles.btn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  popularCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  popularTag: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularTagText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 16,
  },
  planName: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  periodText: {
    fontSize: SIZES.body2,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  featureList: {
    marginVertical: 12,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    flex: 1,
  },
  btn: {
    marginTop: 16,
  },
});

export default PremiumCard;
