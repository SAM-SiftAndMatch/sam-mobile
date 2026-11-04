import { router } from 'expo-router';
import { screenDestination, type ScreenName } from './routes';
export const screenNavigation = {
  navigate(name: ScreenName, params: Record<string, unknown> = {}) {
    router.navigate(screenDestination(name, params));
  },
  goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  },
};
