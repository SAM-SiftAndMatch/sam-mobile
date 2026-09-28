import React from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Platform } from 'react-native';
import { EdgeSwipeBack } from '../components/common/EdgeSwipeBack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import ApplyJobScreen from '../screens/jobs/ApplyJobScreen';
import CreatePostScreen from '../screens/jobs/CreatePostScreen';
import MyPostsScreen from '../screens/posts/MyPostsScreen';
import PremiumScreen from '../screens/premium/PremiumScreen';
import PremiumPlanDetailScreen from '../screens/premium/PremiumPlanDetailScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const canSwipeBack = () => navigationRef.isReady() && navigationRef.canGoBack()
    && (Platform.OS !== 'ios' || (navigationRef.getRootState()?.index === 0 && !!user));

  return (
    <EdgeSwipeBack canGoBack={canSwipeBack} onBack={() => navigationRef.goBack()}>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true, gestureDirection: 'horizontal' }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="MyPosts" component={MyPostsScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
            <Stack.Screen name="PremiumPlanDetail" component={PremiumPlanDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </EdgeSwipeBack>
  );
};

export default AppNavigator;
