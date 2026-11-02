import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Text from '../../design/Text';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApplicantCard } from '../../components/job/ApplicantCard';
import { UserAvatar } from '../../components/common/UserAvatar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { CustomButton } from '../../components/common/CustomButton';

export const ApplicationsScreen = ({ route, navigation }) => {
  const { jobId } = route.params || {};
  const { user, role } = useAuth();
  const { applications, changeAppStatus, loading, openMessages } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // "all" | "pending" | "accepted" | "rejected"

  const isFreelancer = role === 'freelancer';

  // Filter đề xuất list based on role & selected tab
  const roleApplications = isFreelancer
    ? applications.filter(
        (app) => app.freelancerId === user?.id
      )
    : applications.filter((app) => {
        return app.customerId === user?.id && (!jobId || app.jobId === jobId);
      });

  const filteredApps = roleApplications.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const handleStatusChange = async (appId, status) => {
    try {
      await changeAppStatus(appId, status);
      if (status === 'accepted') return;
      Alert.alert(
        'Đã cập nhật',
        `Trạng thái đề xuất đã được cập nhật.`
      );
    } catch (err) {
      Alert.alert('Không thể cập nhật', err.message || 'Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isFreelancer ? 'Đề xuất của tôi' : 'Ứng viên dự án'}
        subtitle={`${filteredApps.length} đề xuất`}
        showBack={!!jobId}
        rightIcon="chatbubbles-outline"
        onRightPress={() => openMessages()}
      />

      {/* Filter Tabs Bar */}
      <View style={styles.tabContainer}>
        {['all', 'pending', 'accepted', 'rejected'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {{ all: 'Tất cả', pending: 'Đang chờ', accepted: 'Đã xác nhận', rejected: 'Từ chối' }[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingState message="Đang tải đề xuất…" />
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (isFreelancer) {
              // Freelancer Application Card View
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('JobDetail', { jobId: item.jobId })
                  }
                  style={styles.freelancerAppCard}
                >
                  <View style={styles.cardHeader}>
                    <UserAvatar uri={item.customerAvatar} name={item.customerName} size={38} />
                    <View style={styles.customerCol}>
                      <Text style={styles.customerName}>{item.customerName}</Text>
                      <Text style={styles.appliedDate}>Đã gửi: {formatDate(item.appliedAt)}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>

                  <Text style={styles.jobTitle}>{item.jobTitle}</Text>

                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.priceLabel}>Báo giá đề xuất</Text>
                      <Text style={styles.priceValue}>{formatCurrency(item.proposedPrice, item.currency)}</Text>
                    </View>
                    <View>
                      <Text style={styles.priceLabel}>Thời gian thực hiện</Text>
                      <Text style={styles.deliveryValue}>{item.deliveryTime}</Text>
                    </View>
                  </View>
                  {item.status === 'accepted' ? <CustomButton title="Chat với khách hàng" icon="chatbubbles-outline" style={{ marginTop: 14 }} onPress={(event) => { event.stopPropagation(); openMessages(item.id); }} /> : item.status === 'pending' ? <Text style={{ color: COLORS.textMuted, marginTop: 12, fontSize: 12 }}>Bạn sẽ nhận thông báo khi khách hàng phản hồi.</Text> : null}
                </TouchableOpacity>
              );
            }

            // Customer Applicant Card View
            return (
              <ApplicantCard
                applicant={item}
                onAccept={() => handleStatusChange(item.id, 'accepted')}
                onReject={() => handleStatusChange(item.id, 'rejected')}
                onChat={() => openMessages(item.id)}
                onViewProfile={() =>
                  Alert.alert('Hồ sơ ứng viên', `Hồ sơ của ${item.freelancerName}`)
                }
              />
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="paper-plane-outline"
              title="Chưa có đề xuất"
              message={
                isFreelancer
                  ? "Bạn chưa có đề xuất ở trạng thái này."
                  : "Chưa có ứng viên cho dự án của bạn."
              }
              actionTitle={isFreelancer ? 'Tìm việc' : 'Đăng dự án'}
              onAction={() =>
                navigation.navigate(isFreelancer ? 'Jobs' : 'CreatePost')
              }
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 6,
  },
  tabBtn: {
    minHeight: 44,
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
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
  freelancerAppCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerCol: {
    flex: 1,
    marginLeft: 10,
  },
  customerName: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  appliedDate: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  jobTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: SIZES.radiusSm,
  },
  priceLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: SIZES.body2,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 2,
  },
  deliveryValue: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
});

export default ApplicationsScreen;
