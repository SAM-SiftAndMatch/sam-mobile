import type { StyleProp, ViewStyle } from 'react-native';
export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
}
export interface LoadingStateProps {
  message?: string;
  style?: StyleProp<ViewStyle>;
}
export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}
export interface EmptyStateProps {
  icon?: string;
  title?: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}
