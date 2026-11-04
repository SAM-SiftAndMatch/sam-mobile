import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../features/auth/AuthProvider';
import { useSubscriptions } from '../../features/subscriptions/SubscriptionsProvider';
import { ErrorState } from '../../components/common/ErrorState';
import { Header } from '../../components/common/Header';
import { PremiumCard } from '../../components/premium/PremiumCard';
import { LoadingState } from '../../components/common/LoadingState';

export const PremiumScreen = ({ navigation }) => {
  const { user } = useAuth();

  const { plans, loading: fetching, error, refreshPlans } = useSubscriptions();

  const handleSelectPlan = (plan) => {
    if (plan.id === 'plan_free') {
      Alert.alert('Gói cơ bản', 'Bạn đang sử dụng gói cơ bản.');
      return;
    }
    navigation.navigate('PremiumPlanDetail', { plan });
  };

  return (
    <View style={styles.container}>
      <Header title="SAM Premium" showBack />

      {error && <ErrorState message={error} onRetry={() => void refreshPlans().catch(() => {})} />}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.badgeCircle}>
            <Ionicons name="sparkles" size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.heroTitle}>Nâng cấp trải nghiệm SAM</Text>
          <Text style={styles.heroSub}>
            Khám phá các gói phù hợp với nhu cầu làm việc và tuyển dụng của bạn.
          </Text>
        </View>

        {fetching ? (
          <LoadingState message="Đang tải các gói…" />
        ) : (
          plans.map((plan) => (
            <PremiumCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={user?.premiumPlan === plan.name}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))
        )}
      </ScrollView>
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
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});

export default PremiumScreen;
