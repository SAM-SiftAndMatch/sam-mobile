import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { validateEmail } from '../../utils/validation';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReset = () => {
    if (!validateEmail(email)) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.title}>Khôi phục mật khẩu</Text>
      <Text style={styles.subtitle}>
        Tính năng khôi phục mật khẩu chưa khả dụng. Vui lòng liên hệ người quản lý tài khoản.
      </Text>

      {submitted ? (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={54} color={COLORS.success} />
          <Text style={styles.successTitle}>Yêu cầu đã được ghi nhận</Text>
          <Text style={styles.successText}>Yêu cầu khôi phục cho {email}.</Text>
          <CustomButton
            title="Quay lại đăng nhập"
            onPress={() => navigation.navigate('Login')}
            variant="primary"
            size="medium"
            style={{ marginTop: 20, width: '100%' }}
          />
        </View>
      ) : (
        <View style={styles.form}>
          <CustomInput
            label="Email đã đăng ký"
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email của bạn"
            icon="mail-outline"
            keyboardType="email-address"
            error={error}
            required
          />

          <CustomButton
            title="Gửi liên kết khôi phục"
            onPress={handleReset}
            disabled
            variant="primary"
            size="large"
            style={{ marginTop: 10 }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.paddingLg,
  },
  backBtn: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.paddingLg,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 20,
  },
  successTitle: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  successText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;
