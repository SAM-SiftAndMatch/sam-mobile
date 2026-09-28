import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';

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
      errs.name = 'Full name is required';
    }
    if (!validateEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!validatePassword(password)) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
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
      Alert.alert('Registration Successful', `Welcome to WorkMarket as a ${role}!`);
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Error creating account');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account 🚀</Text>
        <Text style={styles.subtitle}>Join thousands of professionals & employers.</Text>

        {/* Role Picker Selector */}
        <Text style={styles.roleLabel}>I want to join as a: *</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setRole('freelancer')}
            style={[
              styles.roleCard,
              role === 'freelancer' && styles.selectedRoleCard,
            ]}
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
            <Text
              style={[
                styles.roleTitle,
                role === 'freelancer' && styles.selectedRoleText,
              ]}
            >
              Freelancer
            </Text>
            <Text
              style={[
                styles.roleSub,
                role === 'freelancer' && styles.selectedRoleSub,
              ]}
            >
              Find jobs & build projects
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setRole('customer')}
            style={[
              styles.roleCard,
              role === 'customer' && styles.selectedRoleCardCustomer,
            ]}
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
            <Text
              style={[
                styles.roleTitle,
                role === 'customer' && styles.selectedRoleText,
              ]}
            >
              Customer
            </Text>
            <Text
              style={[
                styles.roleSub,
                role === 'customer' && styles.selectedRoleSub,
              ]}
            >
              Post jobs & hire talent
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <CustomInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            icon="person-outline"
            error={errors.name}
            required
          />

          <CustomInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            icon="mail-outline"
            keyboardType="email-address"
            error={errors.email}
            required
          />

          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            icon="lock-closed-outline"
            isPassword
            error={errors.password}
            required
          />

          <CustomInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            icon="shield-checkmark-outline"
            isPassword
            error={errors.confirmPassword}
            required
          />

          <CustomButton
            title={`Register as ${role === 'freelancer' ? 'Freelancer' : 'Customer'}`}
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
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
