import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../features/auth/AuthProvider';
import { AppLoading } from '../components/common/AppLoading';
export function RootNavigator() {
  const { user, role, initializing } = useAuth();
  if (initializing) return <AppLoading />;
  return (
    <>
      <StatusBar style="dark" />
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(main)" />
          <Stack.Screen name="job-detail" />
          <Stack.Protected guard={role === 'freelancer'}>
            <Stack.Screen name="apply" />
          </Stack.Protected>
          <Stack.Protected guard={role === 'customer'}>
            <Stack.Screen name="create-project" />
          </Stack.Protected>
          <Stack.Screen name="notifications" />
          <Stack.Screen name="premium" />
          <Stack.Screen name="premium-detail" />
          <Stack.Screen name="workspace" />
        </Stack.Protected>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
