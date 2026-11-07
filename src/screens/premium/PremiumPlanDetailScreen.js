import { useSubscriptions } from '../../features/subscriptions/SubscriptionsProvider';
import { formatCurrency } from '../../utils/formatCurrency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { ErrorState } from '../../components/common/ErrorState';
import { Header } from '../../components/common/Header';
import { CustomButton } from '../../components/common/CustomButton';

export const PremiumPlanDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { plan } = route.params || {};

  const { subscribeToPlan, subscribing: loading, error } = useSubscriptions();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!plan) return null;

  const handleConfirmSubscribe = async () => {
    try {
      const result = await subscribeToPlan(plan.id);
      if (result.success) setShowSuccessModal(true);
    } catch {
      // The subscription provider exposes this failure in the error state above the form.
    }
  };

  return (
    <View style={styles.container}>
      <Header title={`Gói ${plan.name}`} showBack />

      {error && <ErrorState message={error} />}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.planHeaderCard}>
          <View style={[styles.badge, { backgroundColor: plan.badgeColor || COLORS.primary }]}>
            <Text style={styles.badgeText}>{plan.name}</Text>
          </View>
          <Text style={styles.price}>
            {formatCurrency(plan.price, plan.currency)}{' '}
            <Text style={styles.period}>/{plan.period}</Text>
          </Text>
          <Text style={styles.description}>{plan.description}</Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Quyền lợi trong gói</Text>
          {plan.features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.mockPaymentNotice}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          <Text style={styles.noticeText}>
            Gói được kích hoạt sau khi Pay2S xác nhận thanh toán. Bạn có thể kiểm tra giao dịch khi
            quay lại ứng dụng.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <CustomButton
          title={`Chọn gói (${formatCurrency(plan.price, plan.currency)})`}
          onPress={handleConfirmSubscribe}
          loading={loading}
          variant="secondary"
          size="large"
          icon="sparkles"
        />
      </View>

      {/* Mock Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={72} color={COLORS.success} />
            <Text style={styles.modalTitle}>Gói đã được kích hoạt</Text>
            <Text style={styles.modalSub}>Tài khoản của bạn đã sử dụng gói {plan.name}.</Text>

            <CustomButton
              title="Về tổng quan"
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Home');
              }}
              variant="primary"
              size="large"
              style={{ width: '100%', marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 24,
  },
  planHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    marginBottom: 10,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: '800',
  },
  price: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  period: {
    fontSize: SIZES.body2,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  description: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  featuresCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  featuresTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  featureText: {
    fontSize: SIZES.body2,
    color: COLORS.textPrimary,
    flex: 1,
  },
  mockPaymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    padding: 14,
    borderRadius: SIZES.radius,
    gap: 10,
  },
  noticeText: {
    fontSize: SIZES.caption,
    color: COLORS.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  footerBar: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.dark,
  },
  modalTitle: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 14,
  },
  modalSub: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default PremiumPlanDetailScreen;
