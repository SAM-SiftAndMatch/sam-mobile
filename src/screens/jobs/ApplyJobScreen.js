import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { validateRequired, validateNumber } from '../../utils/validation';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Header from '../../components/common/Header';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';

export const ApplyJobScreen = ({ route, navigation }) => {
  const { job } = route.params || {};
  const { user } = useAuth();
  const { submitApplication, loading } = useApp();

  const [proposedPrice, setProposedPrice] = useState(
    job ? job.budget.toString() : '500'
  );
  const [deliveryTime, setDeliveryTime] = useState('7 days');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(
    user?.portfolio?.[0]?.link || 'https://github.com/alexjohnson'
  );
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    let errs = {};
    if (!validateNumber(proposedPrice)) {
      errs.proposedPrice = 'Vui lòng nhập báo giá hợp lệ';
    }
    if (!validateRequired(deliveryTime)) {
      errs.deliveryTime = 'Delivery time is required (e.g. 5 days)';
    }
    if (!validateRequired(coverLetter) || coverLetter.length < 20) {
      errs.coverLetter = 'Cover letter must be at least 20 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await submitApplication({
        jobId: job?.id || 'job001',
        jobTitle: job?.title || 'React Native Developer',
        customerId: job?.customerId || 'user002',
        customerName: job?.customerName || 'Sarah Miller',
        customerAvatar: job?.customerAvatar,
        proposedPrice: Number(proposedPrice),
        deliveryTime,
        coverLetter,
        portfolioUrl,
      });

      setIsSuccess(true);
    } catch (err) {
      setErrors((previous) => ({ ...previous, submit: err.message || 'Không thể gửi đề xuất.' }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header title="Apply for Job" showBack />

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Target Job Info Card */}
          {job && (
            <View style={styles.jobBriefCard}>
              <Text style={styles.jobBriefTitle}>{job.title}</Text>
              <Text style={styles.jobBriefBudget}>Ngân sách: {formatCurrency(job.budget, job.currency)}</Text>
            </View>
          )}

          {isSuccess ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
              <Text style={styles.successTitle}>Application Submitted!</Text>
              <Text style={styles.successMessage}>
                Đã gửi đề xuất cho khách hàng. Khi đề xuất được duyệt và dự án bắt đầu, bạn có thể chat với khách hàng trong mục Tin nhắn.
              </Text>
              <View style={styles.successBtnGroup}>
                <CustomButton
                  title="View My Applications"
                  onPress={() => navigation.navigate('Applications')}
                  variant="primary"
                  size="large"
                  style={{ width: '100%', marginBottom: 10 }}
                />
                <CustomButton
                  title="Back to Jobs"
                  onPress={() => navigation.navigate('Jobs')}
                  variant="outline"
                  size="large"
                  style={{ width: '100%' }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Proposal Details</Text>

              <CustomInput
                label={`Báo giá (${job?.currency || 'USD'})`}
                value={proposedPrice}
                onChangeText={setProposedPrice}
                placeholder="e.g. 500"
                icon="cash-outline"
                keyboardType="numeric"
                error={errors.proposedPrice}
                required
              />

              <CustomInput
                label="Estimated Delivery Time"
                value={deliveryTime}
                onChangeText={setDeliveryTime}
                placeholder="e.g. 7 days, 2 weeks"
                icon="time-outline"
                error={errors.deliveryTime}
                required
              />

              <CustomInput
                label="Cover Letter"
                value={coverLetter}
                onChangeText={setCoverLetter}
                placeholder="Introduce yourself, explain your relevant experience, and why you are the best fit for this project..."
                icon="create-outline"
                multiline
                numberOfLines={6}
                error={errors.coverLetter}
                required
              />

              <CustomInput
                label="Portfolio / GitHub Link (Optional)"
                value={portfolioUrl}
                onChangeText={setPortfolioUrl}
                placeholder="https://github.com/yourprofile"
                icon="link-outline"
              />

              {!!errors.submit && <Text style={{ color: COLORS.danger }}>{errors.submit}</Text>}
              <CustomButton
                title="Submit Application"
                onPress={handleSubmit}
                loading={loading}
                variant="primary"
                size="large"
                icon="paper-plane-outline"
                style={styles.submitBtn}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  jobBriefCard: {
    backgroundColor: COLORS.primaryBackground,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  jobBriefTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  jobBriefBudget: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  submitBtn: {
    marginTop: 10,
    width: '100%',
  },
  successContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successTitle: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 14,
  },
  successMessage: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  successBtnGroup: {
    width: '100%',
  },
});

export default ApplyJobScreen;
