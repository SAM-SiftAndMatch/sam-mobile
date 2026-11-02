import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { configureChatStorage } from '../services/mockService';
import { COLORS } from '../constants/colors';
configureChatStorage(AsyncStorage);
function Navigation() {
  const { user, role, initializing } = useAuth();
  if (initializing) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={COLORS.primary} /></View>;
  return <><StatusBar style="dark" /><Stack initialRouteName="index" screenOptions={{ headerShown: false }}><Stack.Protected guard={!!user}><Stack.Screen name="(main)" /><Stack.Screen name="job-detail" /><Stack.Protected guard={role === 'freelancer'}><Stack.Screen name="apply" /></Stack.Protected><Stack.Protected guard={role === 'customer'}><Stack.Screen name="create-project" /></Stack.Protected><Stack.Screen name="notifications" /><Stack.Screen name="premium" /><Stack.Screen name="premium-detail" /><Stack.Screen name="workspace" /></Stack.Protected><Stack.Protected guard={!user}><Stack.Screen name="(auth)" /></Stack.Protected><Stack.Screen name="index" /></Stack></>;
}
export default function RootLayout() {
  const [loaded, error] = useFonts({ BeVietnamPro_400Regular: require('@expo-google-fonts/be-vietnam-pro/400Regular/BeVietnamPro_400Regular.ttf'), BeVietnamPro_500Medium: require('@expo-google-fonts/be-vietnam-pro/500Medium/BeVietnamPro_500Medium.ttf'), BeVietnamPro_600SemiBold: require('@expo-google-fonts/be-vietnam-pro/600SemiBold/BeVietnamPro_600SemiBold.ttf'), BeVietnamPro_700Bold: require('@expo-google-fonts/be-vietnam-pro/700Bold/BeVietnamPro_700Bold.ttf') });
  if (!loaded && !error) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={COLORS.primary} /></View>;
  return <SafeAreaProvider><AuthProvider><AppProvider><Navigation /></AppProvider></AuthProvider></SafeAreaProvider>;
}
