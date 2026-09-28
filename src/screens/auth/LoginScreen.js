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
import { validateEmail, validatePassword } from '../../utils/validation';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen = ({ navigation }) => {
  const { login, isLoading, authError } = useAuth();

  const [email, setEmail] = useState('freelancer@example.com');
  const [password, setPassword] = useState('123456');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let errs = {};
    if (!validateEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!validatePassword(password)) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      await login(email, password);
      // Main navigator automatically handles navigation based on auth state
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    }
  };

  const fillQuickAccount = (role) => {
    if (role === 'freelancer') {
      setEmail('freelancer@example.com');
      setPassword('123456');
    } else {
      setEmail('customer@example.com');
      setPassword('123456');
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.logoBadge}>
            <Ionicons name="briefcase" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Sign in to access jobs, proposals & projects.</Text>
        </View>

        {/* Quick Prototype Role Pre-fill Helpers */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>💡 Quick Prototype Login Preset:</Text>
          <View style={styles.demoBtnRow}>
            <TouchableOpacity
              onPress={() => fillQuickAccount('freelancer')}
              style={styles.demoChip}
            >
              <Ionicons name="person" size={14} color={COLORS.primary} />
              <Text style={styles.demoChipText}>Freelancer Demo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => fillQuickAccount('customer')}
              style={[styles.demoChip, { borderColor: COLORS.customerBadge }]}
            >
              <Ionicons name="briefcase" size={14} color={COLORS.customerBadge} />
              <Text style={[styles.demoChipText, { color: COLORS.customerBadge }]}>
                Customer Demo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="enter your email"
            icon="mail-outline"
            keyboardType="email-address"
            error={errors.email}
            required
          />

          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="enter your password"
            icon="lock-closed-outline"
            isPassword
            error={errors.password}
            required
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    marginBottom: 16,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
  },
  demoBox: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoTitle: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  demoChipText: {
    fontSize: SIZES.caption,
    fontWeight: '700',
    color: COLORS.primary,
  },
  form: {
    marginBottom: 20,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitBtn: {
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default LoginScreen;
