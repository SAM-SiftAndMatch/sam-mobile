import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Header from '../../components/common/Header';
import UserAvatar from '../../components/common/UserAvatar';
import StatusBadge from '../../components/common/StatusBadge';
import CustomButton from '../../components/common/CustomButton';
import LoadingState from '../../components/common/LoadingState';

export const JobDetailScreen = ({ route, navigation }) => {
  const { jobId } = route.params || {};
  const { user, role } = useAuth();
  const { jobs, applications, openMessages } = useApp();

  const [job, setJob] = useState(null);

  useEffect(() => {
    if (jobId) {
      const found = jobs.find((j) => j.id === jobId);
      if (found) setJob(found);
    }
  }, [jobId, jobs]);

  if (!job) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết dự án" showBack />
        <LoadingState message="Đang tải dự án…" />
      </View>
    );
  }

  const isFreelancer = role === 'freelancer';
  const isOwner = user?.id === job.customerId;

  // Check if current freelancer has already applied
  const existingApp = applications.find(
    (app) => app.jobId === job.id && app.freelancerId === user?.id
  );

  return (
    <View style={styles.container}>
      <Header title="Chi tiết dự án" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Job Overview Card */}
        <View style={styles.card}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag-outline" size={12} color={COLORS.primary} />
              <Text style={styles.categoryText}>{job.category}</Text>
            </View>
            <StatusBadge status={job.status} />
          </View>

          <Text style={styles.title}>{job.title}</Text>

          <View style={styles.budgetBox}>
            <View>
              <Text style={styles.budgetLabel}>Ngân sách</Text>
              <Text style={styles.budgetValue}>{formatCurrency(job.budget, job.currency)}</Text>
            </View>
            <View style={styles.budgetDivider} />
            <View>
              <Text style={styles.budgetLabel}>Hạn hoàn thành</Text>
              <Text style={styles.metaValue}>{formatDate(job.deadline)}</Text>
            </View>
            <View style={styles.budgetDivider} />
            <View>
              <Text style={styles.budgetLabel}>Ứng viên</Text>
              <Text style={styles.metaValue}>{job.applicationsCount || 0}</Text>
            </View>
          </View>
        </View>

        {/* Customer Profile Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Khách hàng đăng dự án</Text>
          <View style={styles.customerRow}>
            <UserAvatar uri={job.customerAvatar} name={job.customerName} size={48} />
            <View style={styles.customerCol}>
              <Text style={styles.customerName}>{job.customerName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={COLORS.accent} />
                <Text style={styles.ratingText}>{job.customerRating || '5.0'}</Text>
                <Text style={styles.dot}>•</Text>
                <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.locationText}>{job.location || 'Làm việc từ xa'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Mô tả dự án</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Required Skills Section */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Kỹ năng cần có</Text>
            <View style={styles.skillsRow}>
              {job.skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Requirements List Section */}
        {job.requirements && job.requirements.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Yêu cầu & kinh nghiệm</Text>
            {job.requirements.map((req, idx) => (
              <View key={idx} style={styles.reqRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.reqText}>{req}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Footer */}
      <View style={styles.footerBar}>
        {job.status === 'in_progress' && (isOwner || existingApp?.status === 'accepted') ? (
          <CustomButton title="Mở chat dự án" icon="chatbubbles-outline" onPress={() => openMessages((existingApp || applications.find((app) => app.jobId === job.id && app.status === 'accepted'))?.id)} />
        ) : isFreelancer ? (
          existingApp ? (
            <View style={styles.appliedBanner}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.appliedText}>
                Đã ứng tuyển ngày {formatDate(existingApp.appliedAt)}
              </Text>
            </View>
          ) : (
            <CustomButton
              title="Ứng tuyển ngay"
              disabled={job.status !== 'open'}
              onPress={() => navigation.navigate('ApplyJob', { job })}
              variant="primary"
              size="large"
              icon="send-outline"
              style={styles.actionBtn}
            />
          )
        ) : (
          <View style={styles.customerActionRow}>
            <CustomButton
              title="Xem ứng viên"
              onPress={() => navigation.navigate('Applications', { jobId: job.id })}
              variant="primary"
              size="large"
              icon="people-outline"
              style={{ flex: 1 }}
            />
            {isOwner && (
              <CustomButton
                title="Chỉnh sửa"
                onPress={() => Alert.alert('Chỉnh sửa dự án', 'Chức năng chỉnh sửa đang được phát triển.')}
                variant="outline"
                size="large"
                icon="create-outline"
              />
            )}
          </View>
        )}
      </View>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    gap: 4,
  },
  categoryText: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: 16,
  },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
  },
  budgetLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  metaValue: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  budgetDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerCol: {
    marginLeft: 12,
  },
  customerName: {
    fontSize: SIZES.body1,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ratingRow: {
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
  locationText: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  description: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
  },
  skillText: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reqText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    flex: 1,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  actionBtn: {
    width: '100%',
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successBg,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  appliedText: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.success,
  },
  customerActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default JobDetailScreen;
