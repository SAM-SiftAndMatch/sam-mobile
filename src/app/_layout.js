import React from 'react';
import { useFonts } from 'expo-font';
import { AppProviders } from '../providers/AppProviders';
import { RootNavigator } from '../navigation/RootNavigator';
import { AppLoading } from '../components/common/AppLoading';
import { APP_FONTS } from '../design/fonts';

export default function RootLayout() {
  const [loaded, error] = useFonts(APP_FONTS);
  if (!loaded && !error) return <AppLoading />;
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
