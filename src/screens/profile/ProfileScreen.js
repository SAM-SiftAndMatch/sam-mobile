import React from 'react';
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
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import UserProfileHeader from '../../components/user/UserProfileHeader';
import CustomButton from '../../components/common/CustomButton';

export const ProfileScreen = ({ navigation }) => {
  const { user, role, logout, switchRole } = useAuth();

  const isFreelancer = role === 'freelancer';

  const handleRoleToggle = () => {
    const targetRole = isFreelancer ? 'customer' : 'freelancer';
    switchRole(targetRole);
    Alert.alert('Role Switched', `Switched role to ${targetRole.toUpperCase()} mode.`);
  };

  const menuItems = [
    {
      id: 'm1',
      title: isFreelancer ? 'My Applications' : 'My Posted Jobs',
      icon: isFreelancer ? 'paper-plane-outline' : 'briefcase-outline',
      onPress: () => navigation.navigate(isFreelancer ? 'Applications' : 'MyPosts'),
    },
    {
      id: 'm2',
      title: 'WorkMarket Premium',
      icon: 'sparkles-outline',
      badge: user?.isPremium ? 'ACTIVE' : 'UPGRADE',
      badgeColor: user?.isPremium ? COLORS.success : COLORS.accent,
      onPress: () => navigation.navigate('Premium'),
    },
    {
      id: 'm3',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'm4',
      title: 'Switch Account Role',
      subtitle: `Current: ${isFreelancer ? 'Freelancer' : 'Customer'}`,
      icon: 'swap-horizontal-outline',
      onPress: handleRoleToggle,
    },
    {
      id: 'm5',
      title: 'Settings & Security',
      icon: 'settings-outline',
      onPress: () => Alert.alert('Settings', 'Account settings & notifications preferences'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="My Profile" rightIcon="log-out-outline" onRightPress={logout} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Header Component */}
        <UserProfileHeader
          user={user}
          onSwitchRolePress={handleRoleToggle}
        />

        {/* Skills & Portfolio Section (For Freelancer) */}
        {isFreelancer && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Skills & Expertise</Text>
            <View style={styles.skillsRow}>
              {user?.skills?.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Ionicons name="checkmark" size={14} color={COLORS.primary} />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            {user?.portfolio && user.portfolio.length > 0 && (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.subTitle}>Featured Portfolio</Text>
                {user.portfolio.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => Alert.alert('Portfolio Link', item.link)}
                    style={styles.portfolioItem}
                  >
                    <Ionicons name="folder-open-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.portfolioTitle}>{item.title}</Text>
                    <Ionicons name="open-outline" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Action Menu List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account Options</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={item.onPress}
              style={styles.menuRow}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBg}>
                  <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.subtitle ? <Text style={styles.menuSub}>{item.subtitle}</Text> : null}
                </View>
              </View>

              <View style={styles.menuRight}>
                {item.badge ? (
                  <View style={[styles.badgePill, { backgroundColor: item.badgeColor }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton
          title="Sign Out"
          onPress={logout}
          variant="danger"
          size="medium"
          icon="log-out-outline"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: 16,
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
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    gap: 4,
  },
  skillText: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.primary,
  },
  subTitle: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  portfolioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: SIZES.radiusSm,
    marginBottom: 6,
    gap: 8,
  },
  portfolioTitle: {
    flex: 1,
    fontSize: SIZES.body3,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuSub: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontWeight: '800',
  },
  logoutBtn: {
    marginHorizontal: SIZES.padding,
    marginTop: 6,
  },
});

export default ProfileScreen;
