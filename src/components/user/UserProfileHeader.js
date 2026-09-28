import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import UserAvatar from '../common/UserAvatar';

export const UserProfileHeader = ({ user, onEditPress, onSwitchRolePress }) => {
  if (!user) return null;

  const isFreelancer = user.role === 'freelancer';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <UserAvatar uri={user.avatar} name={user.name} size={70} showOnline />
        <View style={styles.nameCol}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.isPremium && (
              <View style={styles.proBadge}>
                <Ionicons name="sparkles" size={12} color={COLORS.accent} />
                <Text style={styles.proText}>{user.premiumPlan || 'PRO'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userTitle}>{user.title || (isFreelancer ? 'Freelancer' : 'Customer')}</Text>

          <View style={styles.roleBadgeContainer}>
            <View style={[styles.roleBadge, isFreelancer ? styles.freelancerBadge : styles.customerBadge]}>
              <Ionicons
                name={isFreelancer ? 'briefcase-outline' : 'business-outline'}
                size={12}
                color={COLORS.white}
              />
              <Text style={styles.roleBadgeText}>
                {isFreelancer ? 'Freelancer' : 'Customer (Hiring)'}
              </Text>
            </View>

            {onSwitchRolePress && (
              <TouchableOpacity onPress={onSwitchRolePress} style={styles.switchRoleBtn}>
                <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
                <Text style={styles.switchText}>Switch Role</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Text style={styles.bio}>{user.bio}</Text>

      {/* Stats row */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.rating || '5.0'}</Text>
          <Text style={styles.statLabel}>Rating ★</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.completedJobs || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {isFreelancer ? `$${user.hourlyRate || 50}/h` : `$${(user.totalSpent / 1000).toFixed(1)}k`}
          </Text>
          <Text style={styles.statLabel}>{isFreelancer ? 'Hourly Rate' : 'Total Spent'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radiusLg,
    marginHorizontal: SIZES.padding,
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameCol: {
    flex: 1,
    marginLeft: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  proText: {
    fontSize: SIZES.tiny,
    fontWeight: '800',
    color: COLORS.accent,
  },
  userTitle: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusFull,
    gap: 4,
  },
  freelancerBadge: {
    backgroundColor: COLORS.freelancerBadge,
  },
  customerBadge: {
    backgroundColor: COLORS.customerBadge,
  },
  roleBadgeText: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
    color: COLORS.white,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusFull,
    gap: 3,
  },
  switchText: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bio: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.h4,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
});

export default UserProfileHeader;
