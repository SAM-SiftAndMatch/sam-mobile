import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import UserAvatar from '../common/UserAvatar';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const JobCard = ({ job, onPress, onApplyPress, showApplyButton = false }) => {
  if (!job) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardContainer}
    >
      {/* Top Header: Customer Info & Status */}
      <View style={styles.topRow}>
        <View style={styles.customerInfo}>
          <UserAvatar uri={job.customerAvatar} name={job.customerName} size={36} />
          <View style={styles.customerTextCol}>
            <Text style={styles.customerName}>{job.customerName}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={COLORS.accent} />
              <Text style={styles.ratingText}>{job.customerRating || '5.0'}</Text>
              <Text style={styles.dot}>•</Text>
              <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.locationText}>{job.location || 'Làm việc từ xa'}</Text>
            </View>
          </View>
        </View>

        <StatusBadge status={job.status || 'open'} />
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {job.title}
      </Text>

      {/* Description preview */}
      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>

      {/* Skills Chips */}
      {job.skills && job.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {job.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {job.skills.length > 3 && (
            <View style={[styles.skillChip, styles.moreChip]}>
              <Text style={styles.moreSkillText}>+{job.skills.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom Footer Meta (Budget, Applicants, Date) */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.budgetValue}>{formatCurrency(job.budget, job.currency)}</Text>
          <Text style={styles.budgetLabel}>Ngân sách cố định</Text>
        </View>

        <View style={styles.metaCol}>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{job.applicationsCount || 0} ứng viên</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(job.createdAt)}</Text>
        </View>
      </View>

      {showApplyButton && job.status === 'open' && (
        <View style={styles.actionRow}>
          <CustomButton
            title="Xem chi tiết & ứng tuyển"
            onPress={onApplyPress || onPress}
            variant="primary"
            size="small"
            style={styles.applyBtn}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  customerName: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 3,
  },
  dot: {
    marginHorizontal: 6,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  locationText: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  title: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  skillChip: {
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  moreChip: {
    backgroundColor: COLORS.surface,
  },
  moreSkillText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  budgetValue: {
    fontSize: SIZES.h4,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  budgetLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
  },
  metaCol: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  dateText: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionRow: {
    marginTop: 12,
  },
  applyBtn: {
    width: '100%',
  },
});

export default JobCard;
