import { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Text from '../../design/Text';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../features/auth/AuthProvider';
import { finance, money, dateTime } from '../../services/finance';
import { apiMode } from '../../services/api/client';

function useFocusedFinance<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const request = useRef(0);
  const execute = useCallback(async () => {
    const ticket = ++request.current;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const value = await load();
      if (ticket === request.current) setData(value);
    } catch (cause) {
      if (ticket === request.current)
        setError(cause instanceof Error ? cause.message : 'Không tải được dữ liệu.');
    } finally {
      if (ticket === request.current) setLoading(false);
    }
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      void execute();
      return () => {
        request.current++;
      };
    }, [execute]),
  );
  return {
    data,
    error,
    loading,
    retry: () => {
      void execute();
    },
  };
}
function Action({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && { opacity: 0.4 }]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}
export function BankSetupNotice() {
  const { user } = useAuth();
  const load = useCallback(
    () =>
      user?.id ? finance.bankSetup() : Promise.reject(new Error('Phiên đăng nhập đã thay đổi.')),
    [user?.id],
  );
  const { data, error, loading, retry } = useFocusedFinance(load);
  if (loading || data?.status === 'READY') return null;
  if (error)
    return (
      <View style={styles.card}>
        <Text style={styles.note}>Chưa kiểm tra được tài khoản nhận tiền.</Text>
        <Action label="Thử lại" onPress={retry} />
      </View>
    );
  const pending = data?.status === 'PENDING';
  return (
    <View style={[styles.card, styles.reminder]} accessibilityLiveRegion="polite">
      <Text style={styles.heading}>
        {pending ? 'Ngân hàng đang chờ xác minh' : 'Bổ sung ngân hàng để nhận thanh toán'}
      </Text>
      <Text style={styles.note}>
        {pending
          ? 'SAM đang kiểm tra thông tin bạn đã gửi. Tài khoản cần được xác minh trước khi rút tiền.'
          : 'Bạn chưa có tài khoản nhận tiền hợp lệ. Hãy thêm tài khoản chính chủ để SAM xác minh.'}
      </Text>
      <Action
        label={pending ? 'Xem tài khoản' : 'Cập nhật ngân hàng'}
        onPress={() =>
          router.push({
            pathname: '/finance',
            params: { tab: 'banks', ...(pending ? {} : { action: 'add-bank' }) },
          })
        }
      />
    </View>
  );
}
export default function IncomeOverview({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [year, setYear] = useState<number>();
  const [page, setPage] = useState(0);
  const load = useCallback(
    () =>
      user?.id ? finance.income(year) : Promise.reject(new Error('Phiên đăng nhập đã thay đổi.')),
    [year, user?.id],
  );
  const income = useFocusedFinance(load);
  const selectedYear = income.data?.year;
  const loadEntries = useCallback(
    () =>
      !compact && selectedYear !== undefined && Boolean(user?.id)
        ? finance.incomeEntries(selectedYear, page)
        : Promise.resolve(null),
    [compact, selectedYear, page, user?.id],
  );
  const entries = useFocusedFinance(loadEntries);
  if (income.loading) return <ActivityIndicator color={COLORS.primary} style={{ padding: 16 }} />;
  if (income.error)
    return (
      <View style={styles.card}>
        <Text accessibilityRole="alert" style={styles.note}>
          Không tải được thu nhập.
        </Text>
        <Action label="Thử lại" onPress={income.retry} />
      </View>
    );
  const data = income.data;
  if (!data) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Thu nhập từ công việc</Text>
      <View style={styles.card}>
        <Text style={styles.note}>Tổng thu nhập sau phí</Text>
        <Text style={styles.total}>{money(data.totalNetIncome)}</Text>
        <Text style={styles.note}>
          Năm {data.year}: {money(data.yearNetIncome)} · {data.yearCompletedCount} lần nghiệm thu
        </Text>
      </View>
      <Text style={styles.note}>
        Thù lao sau phí từ công việc đã nghiệm thu, không cộng tiền hoàn cọc. Rút tiền không làm
        giảm tổng thu nhập.
      </Text>
      {data.sandboxNetIncome > 0 && (
        <Text style={styles.note}>
          Mô phỏng: {money(data.sandboxNetIncome)}. Không cộng vào thu nhập thật.
        </Text>
      )}
      {compact ? (
        <Action label="Xem thu nhập" onPress={() => router.push('/finance')} />
      ) : (
        <>
          <View style={styles.row}>
            <Action
              label="Năm trước"
              disabled={data.year <= 2000}
              onPress={() => {
                setYear(data.year - 1);
                setPage(0);
              }}
            />
            <Text style={styles.heading}>{data.year}</Text>
            <Action
              label="Năm sau"
              disabled={data.year >= Math.min(2100, new Date().getFullYear())}
              onPress={() => {
                setYear(data.year + 1);
                setPage(0);
              }}
            />
          </View>
          <Text style={styles.note}>
            Giá trị nghiệm thu: {money(data.yearGrossIncome)} · Phí nền tảng:{' '}
            {money(data.yearPlatformFees)}
          </Text>
          <View style={styles.card}>
            {data.months.map((month) => (
              <View key={month.month} style={styles.row}>
                <Text style={styles.note}>Tháng {month.month}</Text>
                <Text style={styles.heading}>{money(month.netIncome)}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.heading}>Chi tiết thu nhập</Text>
          {entries.loading && <ActivityIndicator color={COLORS.primary} />}
          {entries.error && (
            <View>
              <Text accessibilityRole="alert" style={styles.note}>
                Không tải được chi tiết thu nhập.
              </Text>
              <Action label="Thử lại" onPress={entries.retry} />
            </View>
          )}
          {entries.data?.items.length === 0 && (
            <Text style={styles.note}>Chưa có thu nhập thật trong năm này.</Text>
          )}
          {entries.data?.items.map((entry) => (
            <View key={entry.id} style={styles.card}>
              <Text style={styles.heading}>
                {entry.jobTitle}
                {entry.maintenanceOrderId ? ' · Bảo trì có phí' : ''}
              </Text>
              <Text style={styles.total}>{money(entry.netIncome)}</Text>
              <Text style={styles.note}>Nghiệm thu {dateTime(entry.acceptedAt)}</Text>
              <Text style={styles.note}>
                Giá trị {money(entry.grossIncome)} · Phí {money(entry.platformFees)}
              </Text>
            </View>
          ))}
          <View style={styles.row}>
            <Action
              label="Trước"
              disabled={page === 0 || entries.loading}
              onPress={() => setPage((p) => p - 1)}
            />
            <Text style={styles.note}>Trang {page + 1}</Text>
            <Action
              label="Tiếp"
              disabled={
                !entries.data || (page + 1) * 25 >= entries.data.totalElements || entries.loading
              }
              onPress={() => setPage((p) => p + 1)}
            />
          </View>
        </>
      )}
    </View>
  );
}
export function FreelancerFinanceHome() {
  const { user } = useAuth();
  if (!apiMode || user?.role !== 'freelancer') return null;
  return (
    <View style={styles.section}>
      <BankSetupNotice />
      <IncomeOverview compact />
    </View>
  );
}
const styles = StyleSheet.create({
  section: { gap: 12, marginVertical: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  reminder: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  heading: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  total: { fontSize: 25, fontWeight: '700', color: COLORS.primary },
  note: { fontSize: 12, lineHeight: 19, color: COLORS.textSecondary },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
});
