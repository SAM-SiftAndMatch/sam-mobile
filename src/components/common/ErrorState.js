import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { CustomButton } from './CustomButton';

/** @param {import('./types').ErrorStateProps} props */
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Unable to fetch requested data. Please try again.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <CustomButton
          title="Thử lại"
          onPress={onRetry}
          variant="outline"
          size="medium"
          style={styles.btn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.paddingLg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding,
    marginVertical: 16,
  },
  title: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.danger,
    marginTop: 8,
  },
  message: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 6,
  },
  btn: {
    marginTop: 8,
    borderColor: COLORS.danger,
  },
});

export default ErrorState;
