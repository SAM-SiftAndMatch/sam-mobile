import { useChat } from '../../features/chat/useChat';
import { useNotifications } from '../../features/notifications/NotificationsProvider';
import { useMarketplace } from '../../features/marketplace/MarketplaceProvider';
import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Text from '../../design/Text';
import BrandLogo from '../../components/common/BrandLogo';
import { CustomButton } from '../../components/common/CustomButton';
import { JobCard } from '../../components/job/JobCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS } from '../../constants/colors';
import { FreelancerFinanceHome } from '../finance/IncomeOverview';
import { useAuth } from '../../features/auth/AuthProvider';

export default function HomeScreen({ navigation }) {
  const { user, role } = useAuth();
  const { jobs, applications, loading, error, refreshJobs } = useMarketplace();
  const { unreadCount } = useNotifications();
  const { conversations } = useChat();
  const freelancer = role === 'freelancer';
  const owned = jobs.filter((j) => j.customerId === user?.id);
  const active = freelancer
    ? conversations.map((c) => c.project)
    : owned.filter((j) => j.status === 'in_progress');
  const pending = applications.filter((a) => a.status === 'pending').length;
  const cards = freelancer
    ? jobs.filter((j) => j.status === 'open').slice(0, 4)
    : owned.slice(0, 4);
  return (
    <View style={styles.page}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.header}>
        <BrandLogo tagline />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Thông báo, ${unreadCount} chưa đọc`}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.icon}
        >
          <Ionicons name="notifications-outline" size={23} color={COLORS.textPrimary} />
          {unreadCount > 0 && <View style={styles.dot} />}
        </TouchableOpacity>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>
          {freelancer ? 'KHÔNG GIAN FREELANCER' : 'KHÔNG GIAN KHÁCH HÀNG'}
        </Text>
        <Text style={styles.title}>Xin chào, {user?.name?.split(' ')[0] || 'bạn'}.</Text>
        <Text style={styles.subtitle}>
          {freelancer
            ? 'Tìm cơ hội phù hợp và theo dõi công việc của bạn.'
            : 'Biến ý tưởng thành dự án cùng chuyên gia phù hợp.'}
        </Text>
        {freelancer && <FreelancerFinanceHome />}
        <View style={styles.prompt}>
          <View style={styles.promptIcon}>
            <Ionicons
              name={freelancer ? 'search-outline' : 'sparkles-outline'}
              size={24}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.promptTitle}>
            {freelancer ? 'Cơ hội tiếp theo của bạn' : 'Bạn muốn xây dựng điều gì?'}
          </Text>
          <Text style={styles.subtitle}>
            {freelancer
              ? 'Khám phá dự án theo kỹ năng và ngân sách.'
              : 'Bắt đầu từ mục tiêu, ngân sách và yêu cầu của dự án.'}
          </Text>
          <CustomButton
            title={freelancer ? 'Khám phá việc làm' : 'Tạo dự án mới'}
            icon={freelancer ? 'arrow-forward' : 'add'}
            onPress={() => navigation.navigate(freelancer ? 'Jobs' : 'CreatePost')}
            style={{ marginTop: 18 }}
          />
        </View>
        <View style={styles.stats}>
          {[
            [active.length, 'Đang thực hiện', 'layers-outline'],
            [pending, freelancer ? 'Đề xuất đang chờ' : 'Ứng viên đang chờ', 'paper-plane-outline'],
          ].map(([value, label, icon]) => (
            <View key={label} style={styles.stat}>
              <Ionicons name={icon} color={COLORS.primary} size={21} />
              <Text style={styles.number}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <SectionHeader
          title={freelancer ? 'Dự án mới nhất' : 'Dự án của bạn'}
          actionTitle="Xem tất cả"
          onAction={() => navigation.navigate(freelancer ? 'Jobs' : 'MyPosts')}
        />
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={refreshJobs} />
        ) : cards.length ? (
          cards.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
            />
          ))
        ) : (
          <EmptyState
            icon="briefcase-outline"
            title="Sẵn sàng cho dự án đầu tiên"
            message="Các dự án của bạn sẽ xuất hiện tại đây."
          />
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  content: { padding: 20, paddingBottom: 32 },
  eyebrow: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 12,
  },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginVertical: 10 },
  subtitle: { fontSize: 14, lineHeight: 23, color: COLORS.textSecondary },
  prompt: {
    marginTop: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  promptIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  promptTitle: { fontSize: 19, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  stat: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  number: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, marginVertical: 8 },
  statLabel: { fontSize: 12, lineHeight: 19, color: COLORS.textSecondary },
});
