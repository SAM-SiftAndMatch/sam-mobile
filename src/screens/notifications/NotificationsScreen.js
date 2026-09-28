import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES, SHADOWS } from '../../constants/sizes';
import { formatDate } from '../../utils/formatCurrency';
import { useApp } from '../../context/AppContext';
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';

export const NotificationsScreen = ({ navigation }) => {
  const { notifications, markRead } = useApp();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return { icon: 'checkmark-circle-outline', color: COLORS.success, bg: COLORS.successBg };
      case 'applicant':
        return { icon: 'person-add-outline', color: COLORS.primary, bg: COLORS.primaryBackground };
      case 'premium':
        return { icon: 'sparkles-outline', color: COLORS.accent, bg: COLORS.accentLight };
      case 'job':
        return { icon: 'briefcase-outline', color: COLORS.info, bg: COLORS.infoBg };
      default:
        return { icon: 'notifications-outline', color: COLORS.textMuted, bg: COLORS.surface };
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const iconConfig = getNotificationIcon(item.type);

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => markRead(item.id)}
              style={[
                styles.notifCard,
                !item.isRead && styles.unreadCard,
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
                <Ionicons name={iconConfig.icon} size={22} color={iconConfig.color} />
              </View>

              <View style={styles.contentCol}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            message="You don't have any notifications at the moment."
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
  listContent: {
    padding: SIZES.padding,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: COLORS.primaryLight,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  message: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginVertical: 4,
    lineHeight: 18,
  },
  dateText: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
  },
});

export default NotificationsScreen;
