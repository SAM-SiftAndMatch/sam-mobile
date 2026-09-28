import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getPremiumPlans } from '../../services/mockService';
import Header from '../../components/common/Header';
import PremiumCard from '../../components/premium/PremiumCard';
import LoadingState from '../../components/common/LoadingState';

export const PremiumScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { subscribeToPlan, loading } = useApp();

  const [plans, setPlans] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await getPremiumPlans();
      setPlans(data);
      setFetching(false);
    } catch (e) {
      setFetching(false);
    }
  };

  const handleSelectPlan = (plan) => {
    if (plan.id === 'plan_free') {
      Alert.alert('Free Plan', 'You are currently on the standard Free plan.');
      return;
    }
    navigation.navigate('PremiumPlanDetail', { plan });
  };

  return (
    <View style={styles.container}>
      <Header title="WorkMarket Premium" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.badgeCircle}>
            <Ionicons name="sparkles" size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.heroTitle}>Unlock Premium Features</Text>
          <Text style={styles.heroSub}>
            Supercharge your freelance career or hire top talent 5x faster with WorkMarket PRO & PREMIUM.
          </Text>
        </View>

        {fetching ? (
          <LoadingState message="Loading subscription plans..." />
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
