import { useMarketplace } from '../../features/marketplace/MarketplaceProvider';
import { selectOpenJobs } from '../../features/marketplace/model/selectors';
import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../../design/Text';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../features/auth/AuthProvider';
import { Header } from '../../components/common/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { JobCard } from '../../components/job/JobCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';

export const JobsScreen = ({ navigation }) => {
  const { role } = useAuth();
  const {
    jobs,
    categories,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    refreshJobs,
  } = useMarketplace();

  const isFreelancer = role === 'freelancer';

  const filteredJobs = selectOpenJobs(jobs, searchQuery, selectedCategory);

  return (
    <View style={styles.container}>
      <Header
        title="Khám phá dự án"
        subtitle={`${filteredJobs.length} dự án`}
        rightIcon={!isFreelancer ? 'add-circle-outline' : undefined}
        onRightPress={!isFreelancer ? () => navigation.navigate('CreatePost') : undefined}
      />

      {/* Filter & Search Header Section */}
      <View style={styles.filterSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm theo tên dự án, kỹ năng…"
        />

        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory('All')}
            style={[styles.pill, selectedCategory === 'All' && styles.selectedPill]}
          >
            <Text style={[styles.pillText, selectedCategory === 'All' && styles.selectedPillText]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.name)}
              style={[styles.pill, selectedCategory === cat.name && styles.selectedPill]}
            >
              <Text
                style={[styles.pillText, selectedCategory === cat.name && styles.selectedPillText]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Job FlatList */}
      {loading ? (
        <LoadingState message="Đang tải danh sách dự án…" />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
              showApplyButton={isFreelancer}
              onApplyPress={() => navigation.navigate('ApplyJob', { job: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refreshJobs}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title="Không tìm thấy dự án"
              message="Chưa có dự án phù hợp với từ khóa hoặc lĩnh vực đã chọn."
              actionTitle="Xóa bộ lọc"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryPillsScroll: {
    marginVertical: 10,
    gap: 8,
  },
  pill: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  selectedPillText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    padding: SIZES.padding,
  },
});

export default JobsScreen;
