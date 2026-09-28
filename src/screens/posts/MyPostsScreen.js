import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import StatusBadge from '../../components/common/StatusBadge';
import CustomButton from '../../components/common/CustomButton';
import EmptyState from '../../components/common/EmptyState';
import { deleteJob } from '../../services/mockService';

export const MyPostsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { jobs, refreshJobs } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // "all" | "open" | "draft" | "completed"

  const myPosts = jobs.filter(
    (job) => job.customerId === user?.id
  );

  const filteredPosts = myPosts.filter((post) => {
    if (activeTab === 'all') return true;
    return post.status === activeTab;
  });

  const handleDelete = (id, title) => {
    Alert.alert(
      'Xóa dự án',
      `Bạn có chắc muốn xóa "${title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteJob(id);
            refreshJobs();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dự án của tôi"
        subtitle={`${myPosts.length} dự án`}
        rightIcon="add-circle-outline"
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
              {{ all: 'Tất cả', open: 'Đang tuyển', in_progress: 'Đang làm', draft: 'Bản nháp', completed: 'Hoàn thành' }[tab]}
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
                <Text style={styles.applicantText}>
                  {item.applicationsCount || 0} ứng viên
                </Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionRow}>
              <CustomButton
                title="Ứng viên"
                onPress={() => navigation.navigate('Applications', { jobId: item.id })}
                variant="primary"
                size="small"
                icon="people"
                style={styles.actionBtn}
              />
              <CustomButton
                title="Chi tiết"
                onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                variant="outline"
                size="small"
                style={styles.actionBtn}
              />
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.title)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="Chưa có dự án"
            message="Bạn chưa có dự án nào ở trạng thái này."
            actionTitle="Đăng dự án"
            onAction={() => navigation.navigate('CreatePost')}
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
