import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Header from '../../components/common/Header';
import CustomButton from '../../components/common/CustomButton';

export const PremiumPlanDetailScreen = ({ route, navigation }) => {
  const { plan } = route.params || {};
  const { user, updateProfile } = useAuth();
  const { subscribeToPlan, loading } = useApp();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!plan) return null;

  const handleConfirmSubscribe = async () => {
    try {
      await subscribeToPlan(plan.id);
      await updateProfile({ isPremium: true, premiumPlan: plan.name });
      setShowSuccessModal(true);
    } catch (err) {
      console.log('Subscribe error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={`${plan.name} Subscription`} showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.planHeaderCard}>
          <View style={[styles.badge, { backgroundColor: plan.badgeColor || COLORS.primary }]}>
            <Text style={styles.badgeText}>{plan.name}</Text>
          </View>
          <Text style={styles.price}>
            ${plan.price} <Text style={styles.period}>/{plan.period}</Text>
          </Text>
          <Text style={styles.description}>{plan.description}</Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Included Features</Text>
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
            Prototype Demo: No real payment required. Pressing Subscribe will immediately activate your account.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footerBar}>
        <CustomButton
          title={`Confirm Subscription ($${plan.price})`}
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
            <Text style={styles.modalTitle}>Subscription Successful! 🎉</Text>
            <Text style={styles.modalSub}>
              Congratulations! Your account has been upgraded to the {plan.name} plan.
            </Text>

            <CustomButton
              title="Back to Marketplace"
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
    paddingBottom: 100,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
