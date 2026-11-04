import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import Text from '../../design/Text';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
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
  } = useApp();


  const isFreelancer = role === 'freelancer';

  // Apply filters
  const filteredJobs = jobs.filter((job) => {
    if (job.status !== 'open') return false;
    const matchesCategory =
      selectedCategory === 'All' || job.category === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Khám phá dự án"
        subtitle={`${filteredJobs.length} dự án`}
        rightIcon={!isFreelancer ? "add-circle-outline" : undefined}
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
            style={[
              styles.pill,
              selectedCategory === 'All' && styles.selectedPill,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === 'All' && styles.selectedPillText,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.name)}
              style={[
                styles.pill,
                selectedCategory === cat.name && styles.selectedPill,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedCategory === cat.name && styles.selectedPillText,
                ]}
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
  statusFilterRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  statusFilterLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  statusPill: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
  },
  selectedStatusPill: {
    backgroundColor: COLORS.primaryBackground,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusPillText: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  selectedStatusPillText: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SIZES.padding,
  },
});

export default JobsScreen;
