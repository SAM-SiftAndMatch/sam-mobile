import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/home/HomeScreen';
import JobsScreen from '../screens/jobs/JobsScreen';
import CreatePostScreen from '../screens/jobs/CreatePostScreen';
import ApplicationsScreen from '../screens/applications/ApplicationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { role } = useAuth();
  const isFreelancer = role === 'freelancer';
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      backBehavior="history"
      safeAreaInsets={{ bottom: 0, left: 0, right: 0 }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: COLORS.background },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          height: 72,
          marginHorizontal: 16,
          marginLeft: Math.max(insets.left, 16),
          marginRight: Math.max(insets.right, 16),
          marginBottom: Math.max(insets.bottom, 12),
          marginTop: 8,
          borderRadius: 36,
          paddingHorizontal: 6,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 6,
          shadowColor: COLORS.primaryDark,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        tabBarItemStyle: { borderRadius: 28 },
        tabBarIconStyle: { width: 48, height: 48 },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'CreatePost') {
            iconName = 'add';
            return (
              <View style={[styles.centerAddCircle, focused && styles.centerAddActive]}>
                <Ionicons name="add" size={26} color={COLORS.white} />
              </View>
            );
          } else if (route.name === 'Applications') {
            iconName = focused ? 'paper-plane' : 'paper-plane-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={[styles.iconBubble, focused && styles.activeBubble]}>
              <Ionicons name={iconName} size={23} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarAccessibilityLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ tabBarAccessibilityLabel: 'Tìm việc' }}
      />
      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          tabBarAccessibilityLabel: 'Đăng dự án',
        }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          tabBarAccessibilityLabel: isFreelancer ? 'Đề xuất của tôi' : 'Ứng viên',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarAccessibilityLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBubble: { backgroundColor: COLORS.primaryBackground },
  centerAddActive: { backgroundColor: COLORS.primaryDark },
  centerAddCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default MainTabNavigator;
