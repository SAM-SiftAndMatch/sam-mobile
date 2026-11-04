import { useMarketplace } from '../../features/marketplace/MarketplaceProvider';
import { selectUserProjects } from '../../features/marketplace/model/selectors';
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { useAuth } from '../../features/auth/AuthProvider';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CustomButton } from '../../components/common/CustomButton';
import { EmptyState } from '../../components/common/EmptyState';

export const MyPostsScreen = ({ navigation }) => {
  const { user, role } = useAuth();
  const { jobs, applications, deleteJob } = useMarketplace();

  const [activeTab, setActiveTab] = useState('all'); // "all" | "open" | "draft" | "completed"

  const myPosts = selectUserProjects(jobs, applications, user);

  const filteredPosts = myPosts.filter((post) => {
    if (activeTab === 'all') return true;
    return post.status === activeTab;
  });

  const handleDelete = (id, title) => {
    Alert.alert('Xóa dự án', `Bạn có chắc muốn xóa "${title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJob(id);
          } catch (error) {
            Alert.alert('Không thể xóa dự án', error.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dự án của tôi"
        subtitle={`${myPosts.length} dự án`}
        rightIcon={role === 'customer' ? 'add-circle-outline' : undefined}
        onRightPress={() => navigation.navigate('CreatePost')}
      />

      {/* Tabs Filter Bar */}
      <View style={styles.tabContainer}>
        {['all', 'open', 'in_progress', 'draft', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {
                {
                  all: 'Tất cả',
                  open: 'Đang tuyển',
                  in_progress: 'Đang làm',
                  draft: 'Bản nháp',
                  completed: 'Hoàn thành',
                }[tab]
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.topRow}>
              <StatusBadge status={item.status} />
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.budget}>{formatCurrency(item.budget, item.currency)}</Text>
              <View style={styles.applicantBadge}>
                <Ionicons name="people-outline" size={14} color={COLORS.primary} />
                <Text style={styles.applicantText}>{item.applicationsCount || 0} ứng viên</Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionRow}>
              {role === 'customer' && (
                <>
                  <CustomButton
                    title="Ứng viên"
                    onPress={() => navigation.navigate('Applications', { jobId: item.id })}
                    variant="primary"
                    size="small"
                    icon="people"
                    style={styles.actionBtn}
                  />
                </>
              )}
              <CustomButton
                title="Chi tiết"
                onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                variant="outline"
                size="small"
                style={styles.actionBtn}
              />
              {role === 'customer' && item.status === 'draft' && (
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.title)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="Chưa có dự án"
            message="Bạn chưa có dự án nào ở trạng thái này."
            actionTitle={role === 'customer' ? 'Đăng dự án' : 'Tìm việc'}
            onAction={() => navigation.navigate(role === 'customer' ? 'CreatePost' : 'Jobs')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tabBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.surface,
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.white,
  },
  listContent: {
    padding: SIZES.padding,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
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
    marginBottom: 8,
  },
  dateText: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  budget: {
    fontSize: SIZES.h4,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  applicantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    gap: 4,
  },
  applicantText: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flex: 1,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.dangerBg,
  },
});

export default MyPostsScreen;
