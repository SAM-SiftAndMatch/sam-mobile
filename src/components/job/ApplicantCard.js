import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { formatCurrency } from '../../utils/formatCurrency';
import UserAvatar from '../common/UserAvatar';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const ApplicantCard = ({
  applicant,
  onAccept,
  onReject,
  onViewProfile,
  onChat,
  showActions = true,
}) => {
  if (!applicant) return null;

  return (
    <View style={styles.card}>
      {/* Top Freelancer Info Header */}
      <View style={styles.header}>
        <UserAvatar uri={applicant.freelancerAvatar} name={applicant.freelancerName} size={44} />
        <View style={styles.infoCol}>
          <Text style={styles.name}>{applicant.freelancerName}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={12} color={COLORS.accent} />
            <Text style={styles.ratingText}>{applicant.freelancerRating || '4.9'}</Text>
            <Text style={styles.dot}>•</Text>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.timeText}>{applicant.deliveryTime || '7 days'}</Text>
          </View>
        </View>

        <View style={styles.priceCol}>
          <Text style={styles.price}>{formatCurrency(applicant.proposedPrice, applicant.currency)}</Text>
          <StatusBadge status={applicant.status} style={styles.statusBadge} />
        </View>
      </View>

      {/* Proposal Cover Letter */}
      <Text style={styles.coverLetterTitle}>Cover Letter:</Text>
      <Text style={styles.coverLetter} numberOfLines={3}>
        {applicant.coverLetter}
      </Text>

      {/* Freelancer Skills */}
      {applicant.freelancerSkills && applicant.freelancerSkills.length > 0 && (
        <View style={styles.skillsRow}>
          {applicant.freelancerSkills.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      {showActions && applicant.status === 'pending' && (
        <View style={styles.actionRow}>
          <CustomButton
            title="Duyệt & bắt đầu"
            onPress={onAccept}
            variant="secondary"
            size="small"
            icon="checkmark-circle-outline"
            style={styles.actionBtn}
          />
          <CustomButton
            title="Reject"
            onPress={onReject}
            variant="danger"
            size="small"
            icon="close-circle-outline"
            style={styles.actionBtn}
          />
          {onViewProfile && (
            <CustomButton
              title="Profile"
              onPress={onViewProfile}
              variant="outline"
              size="small"
              style={styles.actionBtn}
            />
          )}
        </View>
      )}
      {applicant.status === 'accepted' && onChat && <CustomButton title="Chat với freelancer" icon="chatbubbles-outline" onPress={onChat} style={{ marginTop: 14 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
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
  },
  timeText: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: SIZES.h4,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-end',
  },
  coverLetterTitle: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 2,
  },
  coverLetter: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusSm,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flex: 1,
  },
});

export default ApplicantCard;
