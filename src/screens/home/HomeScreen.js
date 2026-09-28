import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import UserAvatar from '../../components/common/UserAvatar';
import SectionHeader from '../../components/common/SectionHeader';
import CategoryCard from '../../components/premium/CategoryCard';
import JobCard from '../../components/job/JobCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export const HomeScreen = ({ navigation }) => {
  const { user, role } = useAuth();
  const {
    jobs,
    categories,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    unreadCount,
    refreshJobs,
    openMessages,
    chatUnreadCount,
  } = useApp();

  const isFreelancer = role === 'freelancer';

  // Home recommendations only follow the selected category.
  const filteredJobs = jobs.filter((job) => {
    if (job.status !== 'open') return false;
    const matchesCat =
      selectedCategory === 'All' || job.category === selectedCategory;
    return matchesCat;
  });

  // Mock popular freelancers list for home page
  const popularFreelancers = [
    {
      id: 'f1',
      name: 'Marcus Vance',
      title: 'UI/UX Designer',
      rating: 4.9,
      rate: '$55/h',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'f2',
      name: 'Sophia Chen',
      title: 'React Native Expert',
      rating: 5.0,
      rate: '$70/h',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'f3',
      name: 'David Kim',
      title: 'Full Stack Node.js',
      rating: 4.8,
      rate: '$60/h',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.topHeader}>
        <View style={styles.greetingRow}>
          <UserAvatar uri={user?.avatar} name={user?.name || 'Alex'} size={44} showOnline />
          <View style={styles.greetingCol}>
            <Text style={styles.greetingSub}>
              {new Date().getHours() < 12 ? 'Good morning,' : 'Good afternoon,'}
            </Text>
            <Text style={styles.userName}>{user?.name || 'Alex Johnson'}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Tin nhắn${chatUnreadCount ? `, ${chatUnreadCount} tin chưa đọc` : ''}`} onPress={() => openMessages()} style={styles.notifBtn}>
          <Ionicons name="chatbubbles-outline" size={24} color={COLORS.primary} />
          {chatUnreadCount > 0 && <View style={styles.badgeCircle}><Text style={styles.badgeText}>{chatUnreadCount > 99 ? '99+' : chatUnreadCount}</Text></View>}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notifBtn}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
          {unreadCount > 0 && (
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#EEEBFF', '#E9F5FF']} style={styles.hero}>
          <Text style={styles.brand}>SAM<Text style={{ color: COLORS.cyan }}>.</Text></Text>
          <Text style={styles.heroTitle}>Kết nối Freelancer{'\n'}<Text style={{ color: COLORS.primary }}>phù hợp nhất</Text> cho dự án</Text>
          <Text style={styles.heroDescription}>Biến ý tưởng thành hiện thực cùng cộng đồng chuyên gia tài năng.</Text>
        </LinearGradient>
        {/* Premium Promotion Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Premium')}
          style={styles.premiumBanner}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTag}>
              <Ionicons name="sparkles" size={12} color={COLORS.accent} />
              <Text style={styles.bannerTagText}>SAM PRO</Text>
            </View>
            <Text style={styles.bannerTitle}>
              {isFreelancer ? 'Get 3x More Job Views & Proposals' : 'Hire Verified Top 1% Freelancers'}
            </Text>
            <Text style={styles.bannerSub}>Upgrade to Premium for featured priority visibility</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Categories Horizontal Scroll */}
        <SectionHeader
          title="Categories"
          actionTitle="See All"
          onAction={() => navigation.navigate('Jobs')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          <CategoryCard
            category={{ name: 'All', icon: 'grid-outline', jobsCount: jobs.length }}
            isSelected={selectedCategory === 'All'}
            onPress={() => setSelectedCategory('All')}
          />
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategory === cat.name}
              onPress={() => setSelectedCategory(cat.name)}
            />
          ))}
        </ScrollView>

        {/* Popular Freelancers (Highlight Section) */}
        <SectionHeader title="Top Rated Freelancers" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.freelancersScroll}
        >
          {popularFreelancers.map((freelancer) => (
            <View key={freelancer.id} style={styles.freelancerCard}>
              <Image source={{ uri: freelancer.avatar }} style={styles.freelancerAvatar} />
              <Text style={styles.freelancerName}>{freelancer.name}</Text>
              <Text style={styles.freelancerTitle}>{freelancer.title}</Text>
              <View style={styles.freelancerMeta}>
                <Ionicons name="star" size={12} color={COLORS.accent} />
                <Text style={styles.freelancerRating}>{freelancer.rating}</Text>
                <Text style={styles.freelancerRate}>{freelancer.rate}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Recommended Jobs List */}
        <SectionHeader
          title={selectedCategory === 'All' ? 'Dự án dành cho bạn' : `Dự án ${selectedCategory.toLowerCase()}`}
          actionTitle="Xem tất cả"
          onAction={() => navigation.navigate('Jobs')}
        />

        {loading ? (
          <LoadingState message="Loading latest job opportunities..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refreshJobs} />
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No jobs available in this category.</Text>
          </View>
        ) : (
          filteredJobs.slice(0, 4).map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
              showApplyButton={isFreelancer}
              onApplyPress={() => navigation.navigate('ApplyJob', { job })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  hero: { padding: 24, gap: 14, margin: 16, borderRadius: 24 },
  brand: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  heroTitle: { fontSize: 26, fontWeight: '800', lineHeight: 35, color: COLORS.textPrimary },
  heroDescription: { fontSize: 14, lineHeight: 23, color: COLORS.textSecondary, marginBottom: 4 },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greetingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingCol: {
    flex: 1,
    marginLeft: 10,
  },
  greetingSub: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
  },
  userName: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  notifBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  headerActions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  badgeCircle: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  premiumBanner: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: SIZES.radiusLg,
    marginHorizontal: SIZES.padding,
    marginTop: 14,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.medium,
  },
  bannerContent: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 6,
  },
  bannerTagText: {
    color: COLORS.accent,
    fontSize: SIZES.tiny,
    fontWeight: '800',
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    fontWeight: '800',
    lineHeight: 20,
  },
  bannerSub: {
    color: COLORS.primaryBackground,
    fontSize: SIZES.tiny,
    marginTop: 4,
  },
  categoriesScroll: {
    paddingLeft: SIZES.padding,
    paddingRight: SIZES.padding / 2,
    paddingBottom: 4,
  },
  freelancersScroll: {
    paddingLeft: SIZES.padding,
    paddingRight: SIZES.padding / 2,
  },
  freelancerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    width: 125,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  freelancerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
  },
  freelancerName: {
    fontSize: SIZES.body3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  freelancerTitle: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 6,
  },
  freelancerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  freelancerRating: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  freelancerRate: {
    fontSize: SIZES.tiny,
    color: COLORS.secondary,
    fontWeight: '700',
    marginLeft: 4,
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: SIZES.body3,
  },
});

export default HomeScreen;
