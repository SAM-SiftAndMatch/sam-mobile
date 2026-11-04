import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Text from '../../design/Text';
import BrandLogo from '../../components/common/BrandLogo';
import { CustomButton } from '../../components/common/CustomButton';
import { COLORS } from '../../constants/colors';
export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.page}>
      <BrandLogo tagline />
      <View style={styles.hero}>
        <View style={styles.icon}>
          <Ionicons name="layers-outline" size={44} color={COLORS.primary} />
        </View>
        <Text style={styles.eyebrow}>Ý TƯỞNG · KẾT NỐI · THỰC HIỆN</Text>
        <Text style={styles.title}>Cùng xây dựng{'\n'}điều tiếp theo.</Text>
        <Text style={styles.body}>
          Không gian kết nối khách hàng và Freelancer. Từ yêu cầu đầu tiên đến sản phẩm bàn giao.
        </Text>
      </View>
      <View style={styles.actions}>
        <CustomButton title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
        <CustomButton
          title="Tạo tài khoản"
          variant="outline"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  hero: { flex: 1, justifyContent: 'center' },
  icon: {
    height: 80,
    width: 80,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  eyebrow: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 1 },
  title: {
    fontSize: 34,
    lineHeight: 46,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginVertical: 16,
  },
  body: { fontSize: 15, lineHeight: 25, color: COLORS.textSecondary },
  actions: { gap: 12, paddingBottom: 24 },
});
