import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../features/auth/AuthProvider';
import { COLORS } from '../../constants/colors';
export default function MainLayout() {
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const freelancer = role === 'freelancer';
  const icons = {
    home: 'grid-outline',
    jobs: 'search-outline',
    applications: 'paper-plane-outline',
    projects: 'briefcase-outline',
    messages: 'chatbubbles-outline',
    profile: 'person-outline',
  };
  return (
    <Tabs
      initialRouteName={freelancer ? 'jobs' : 'home'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: Math.max(60, Math.ceil(56 * fontScale)) + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 4,
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: { fontFamily: 'BeVietnamPro_500Medium', fontSize: 11 },
        tabBarIcon: ({ color }) => <Ionicons name={icons[route.name]} size={22} color={color} />,
      })}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Tổng quan', href: freelancer ? null : '/home' }}
      />
      <Tabs.Screen name="jobs" options={{ title: 'Tìm việc', href: freelancer ? '/jobs' : null }} />
      <Tabs.Screen
        name="applications"
        options={{ title: 'Đề xuất', href: freelancer ? '/applications' : null }}
      />
      <Tabs.Screen name="projects" options={{ title: 'Dự án' }} />
      <Tabs.Screen name="messages" options={{ title: 'Tin nhắn' }} />
      <Tabs.Screen name="profile" options={{ title: 'Hồ sơ' }} />
    </Tabs>
  );
}
