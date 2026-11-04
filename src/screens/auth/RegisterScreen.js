import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Text from '../../design/Text';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { useAuth } from '../../features/auth/AuthProvider';

export const RegisterScreen = ({ navigation }) => {
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('freelancer'); // "freelancer" | "customer"
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let errs = {};
    if (!validateRequired(name)) {
      errs.name = 'Vui lòng nhập họ và tên';
    }
    if (!validateEmail(email)) {
      errs.email = 'Vui lòng nhập email hợp lệ';
    }
    if (!validatePassword(password)) {
      errs.password = 'Mật khẩu cần ít nhất 6 ký tự';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Mật khẩu nhập lại chưa khớp';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    try {
      await register({
        name,
        email,
        password,
        role,
      });
      Alert.alert('Đăng ký thành công', `Chào mừng bạn đến với SAM!`);
    } catch (err) {
      Alert.alert('Chưa thể đăng ký', err.message || 'Vui lòng thử lại');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Tạo tài khoản SAM</Text>
        <Text style={styles.subtitle}>Kết nối và làm việc cùng đối tác phù hợp.</Text>

        {/* Role Picker Selector */}
        <Text style={styles.roleLabel}>Tôi muốn tham gia với vai trò: *</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setRole('freelancer')}
            style={[styles.roleCard, role === 'freelancer' && styles.selectedRoleCard]}
          >
            <View
              style={[
                styles.roleIconCircle,
                role === 'freelancer' && styles.selectedRoleIconCircle,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={22}
                color={role === 'freelancer' ? COLORS.white : COLORS.primary}
              />
            </View>
            <Text style={[styles.roleTitle, role === 'freelancer' && styles.selectedRoleText]}>
              Freelancer
            </Text>
            <Text style={[styles.roleSub, role === 'freelancer' && styles.selectedRoleSub]}>
              Tìm việc và thực hiện dự án
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setRole('customer')}
            style={[styles.roleCard, role === 'customer' && styles.selectedRoleCardCustomer]}
          >
            <View
              style={[
                styles.roleIconCircle,
                role === 'customer' && styles.selectedRoleIconCircleCustomer,
              ]}
            >
              <Ionicons
                name="briefcase-outline"
                size={22}
                color={role === 'customer' ? COLORS.white : COLORS.customerBadge}
              />
            </View>
            <Text style={[styles.roleTitle, role === 'customer' && styles.selectedRoleText]}>
              Khách hàng
            </Text>
            <Text style={[styles.roleSub, role === 'customer' && styles.selectedRoleSub]}>
              Đăng dự án và tìm chuyên gia
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <CustomInput
            label="Họ và tên"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            icon="person-outline"
            error={errors.name}
            required
          />

          <CustomInput
            label="Địa chỉ email"
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            icon="mail-outline"
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email}
            required
          />

          <CustomInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="Ít nhất 6 ký tự"
            icon="lock-closed-outline"
            isPassword
            autoComplete="new-password"
            error={errors.password}
            required
          />

          <CustomInput
            label="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            icon="shield-checkmark-outline"
            isPassword
            autoComplete="new-password"
            error={errors.confirmPassword}
            required
          />

          <CustomButton
            title={`Tạo tài khoản`}
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={{ minHeight: 44, justifyContent: 'center' }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.paddingLg,
  },
  backBtn: {
    alignSelf: 'flex-start',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  selectedRoleCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBackground,
  },
  selectedRoleCardCustomer: {
    borderColor: COLORS.customerBadge,
    backgroundColor: '#F0FDFA',
  },
  roleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  selectedRoleIconCircle: {
    backgroundColor: COLORS.primary,
  },
  selectedRoleIconCircleCustomer: {
    backgroundColor: COLORS.customerBadge,
  },
  roleTitle: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedRoleText: {
    color: COLORS.textPrimary,
  },
  roleSub: {
    fontSize: SIZES.tiny,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedRoleSub: {
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: 20,
  },
  submitBtn: {
    marginTop: 10,
    width: '100%',
  },
  footerRow: {
    alignItems: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 14,
  },
  footerText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default RegisterScreen;
