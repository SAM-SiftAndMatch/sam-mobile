import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppNavigator from './navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureChatStorage } from './services/mockService';
import { ProjectChatModal } from './components/chat/ProjectChatModal';

configureChatStorage(AsyncStorage);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <AppNavigator />
          <ProjectChatModal />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
