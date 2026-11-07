import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import IncomeOverview, { BankSetupNotice } from './IncomeOverview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../features/auth/AuthProvider';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { apiMode, apiRequest } from '../../services/api/client';
import {
  finance,
  money,
  dateTime,
  statusLabel,
  type Wallet,
  type FinanceTransaction,
  type Bank,
  type Withdrawal,
} from '../../services/finance';
import Text from '../../design/Text';
import { Header } from '../../components/common/Header';
import { COLORS } from '../../constants/colors';
export default function FinanceRoute() {
  const params = useLocalSearchParams<{ tab?: string; action?: string }>();
  const { user } = useAuth();
  return (
    <FinanceScreen
      key={`${user?.id}:${params.tab}:${params.action}`}
      initialTab={params.tab === 'banks' ? 'banks' : 'income'}
      addBank={params.action === 'add-bank'}
    />
  );
}
function FinanceScreen({ initialTab, addBank }: { initialTab: string; addBank: boolean }) {
  const { user } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [bankVersion, setBankVersion] = useState(0);
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<'bank' | 'withdraw' | 'disable' | null>(addBank ? 'bank' : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [bankCode, setBankCode] = useState('VCB');
  const [account, setAccount] = useState('');
  const [holder, setHolder] = useState('');
  const [password, setPassword] = useState('');
  const [bankId, setBankId] = useState('');
  const [amount, setAmount] = useState('');
  const key = useRef<string | null>(null);
  const sending = useRef(false);
  const [detail, setDetail] = useState<Withdrawal | null>(null);
  const load = useCallback(async () => {
    if (!apiMode || !user?.id || user?.role !== 'freelancer')
      return { wallet: null, banks: [], withdrawals: [], transactions: [] };
    const [wallet, banks, withdrawals, transactions] = await Promise.all([
      finance.wallet(),
      finance.banks(),
      finance.withdrawals(page),
      tab === 'transactions' ? finance.transactions(page) : Promise.resolve([]),
    ]);
    return { wallet, banks, withdrawals, transactions };
  }, [user?.id, user?.role, page, tab]);
  const {
    data,
    loading,
    error: loadError,
    refresh,
  } = useAsyncResource<{
    wallet: Wallet | null;
    banks: Bank[];
    withdrawals: Withdrawal[];
    transactions: FinanceTransaction[];
  }>(load, {
    wallet: null,
    banks: [],
    withdrawals: [],
    transactions: [],
  });
  const wallet = data.wallet;
  const close = () => {
    setMode(null);
    setEditingBank(null);
    setPassword('');
    setAccount('');
    setHolder('');
    setError('');
  };
  const submit = async () => {
    if (!password.trim()) {
      setError('Nhập mật khẩu hiện tại để xác thực.');
      return;
    }
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError('');
    try {
      if (mode === 'bank')
        await apiRequest(
          editingBank ? `/finance/bank-accounts/${editingBank}` : '/finance/bank-accounts',
          editingBank ? 'PUT' : 'POST',
          {
            bankCode,
            accountNumber: account,
            accountHolder: holder,
            password,
          },
        );
      else if (mode === 'disable')
        await apiRequest(`/finance/bank-accounts/${bankId}/disable`, 'POST', { password });
      else {
        if (!key.current) key.current = await finance.requestKey();
        await apiRequest('/finance/withdrawals', 'POST', {
          bankAccountId: bankId,
          amount: Number(amount),
          requestKey: key.current,
          password,
        });
      }
      setNotice(
        mode === 'bank'
          ? 'Đã lưu tài khoản. Thông tin thay đổi cần được xác minh trước khi rút tiền.'
          : mode === 'disable'
            ? 'Đã ngừng sử dụng tài khoản.'
            : 'Đã tạo yêu cầu rút. Tiền chưa chuyển ngân hàng và đang chờ duyệt.',
      );
      close();
      setBankVersion((v) => v + 1);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thực hiện được thao tác.');
    } finally {
      sending.current = false;
      setBusy(false);
      setPassword('');
    }
  };
  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <Header title="Thu nhập & thanh toán" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void refresh().catch(() => {})} />
        }
      >
        <Text style={styles.title}>Thu nhập & thanh toán</Text>
        {apiMode && user?.role === 'freelancer' && <BankSetupNotice key={bankVersion} />}
        <Text style={styles.note}>
          Công nợ chỉ được rút sau 7 ngày bảo trì và khi ticket liên quan đã được giải quyết. Hoàn
          cọc được theo dõi riêng.
        </Text>
        {!apiMode && (
          <Text style={styles.note}>Thu nhập ngân hàng chưa khả dụng trong phiên hiện tại.</Text>
        )}
        {loadError && (
          <Text accessibilityRole="alert" style={styles.error}>
            {loadError}
          </Text>
        )}
        {notice && <Text style={styles.note}>{notice}</Text>}
        {tab !== 'income' && (
          <>
            <View style={styles.stats}>
              {[
                ['Khả dụng', wallet?.availableBalance],
                ['Chờ bảo trì', wallet?.pendingBalance],
                ['Giữ do ticket', wallet?.heldBalance],
                ['Đang chờ chi', wallet?.reservedBalance],
              ].map(([label, value]) => (
                <View key={String(label)} style={styles.stat}>
                  <Text style={styles.muted}>{String(label)}</Text>
                  <Text style={styles.value}>{money(Number(value || 0))}</Text>
                </View>
              ))}
            </View>
            {wallet && (
              <Text style={styles.muted}>
                Escrow chưa nghiệm thu: {money(wallet.escrowGross)} · Cọc đang giữ:{' '}
                {money(wallet.lockedDeposit)} · Đã chi: {money(wallet.paidTotal)}
              </Text>
            )}
            {wallet && wallet.sandboxBalance > 0 && (
              <Text style={styles.muted}>
                Mô phỏng: {money(wallet.sandboxBalance)}. Không rút được thành tiền thật.
              </Text>
            )}
          </>
        )}
        <View style={styles.row}>
          {
            <ActionButton
              label={'Thêm ngân hàng'}
              onPress={() => {
                key.current = null;
                setEditingBank(null);
                setAccount('');
                setHolder('');
                setPassword('');
                setMode('bank');
                setError('');
              }}
              disabled={!apiMode}
            />
          }
          {
            <ActionButton
              label={'Rút tiền'}
              onPress={() => {
                key.current = null;
                setMode('withdraw');
                setError('');
              }}
              disabled={
                !wallet?.withdrawalsEnabled ||
                !wallet.availableBalance ||
                !data.banks.some((b) => b.status === 'VERIFIED')
              }
            />
          }
        </View>
        <View style={styles.row}>
          {[
            ['income', 'Thu nhập'],
            ['overview', 'Số dư'],
            ['banks', 'Ngân hàng'],
            ['withdrawals', 'Lịch sử rút'],
            ['transactions', 'Giao dịch'],
          ].map(([value, label]) => (
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === value }}
              key={value}
              onPress={() => {
                setPage(0);
                setTab(value);
              }}
              style={[styles.tab, tab === value && styles.activeTab]}
            >
              <Text style={styles.tabText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {tab === 'income' && apiMode && user?.role === 'freelancer' && <IncomeOverview />}
        {tab === 'overview' &&
          (wallet?.payables.length ? (
            wallet.payables.map((p) => (
              <View key={p.id} style={styles.card}>
                <Text style={styles.cardTitle}>{p.jobTitle}</Text>
                <Text style={styles.body}>
                  Thù lao {money(p.earnings)} · Hoàn cọc {money(p.depositRefund)}
                </Text>
                <Text style={styles.muted}>Hạn bảo trì: {dateTime(p.availableAt)}</Text>
                <Text style={styles.note}>
                  {p.sandbox
                    ? 'Dữ liệu mô phỏng'
                    : p.blocked
                      ? 'Đang giữ do ticket'
                      : 'Công nợ được xét theo hạn bảo trì'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>Chưa có công nợ từ dự án đã nghiệm thu.</Text>
          ))}
        {tab === 'banks' &&
          (data.banks.length ? (
            data.banks.map((b) => (
              <View key={b.id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {b.bankCode} · •••• {b.lastFour}
                </Text>
                <Text style={styles.body}>{statusLabel[b.status]}</Text>
                {b.verificationNote && <Text style={styles.muted}>{b.verificationNote}</Text>}
                {b.status !== 'DISABLED' && (
                  <ActionButton
                    label="Cập nhật tài khoản"
                    onPress={() => {
                      setEditingBank(b.id);
                      setBankCode(b.bankCode);
                      setAccount('');
                      setHolder('');
                      setPassword('');
                      setError('');
                      setMode('bank');
                    }}
                  />
                )}
                {b.status !== 'DISABLED' && (
                  <ActionButton
                    label={'Ngừng sử dụng'}
                    onPress={() => {
                      setBankId(b.id);
                      setMode('disable');
                      setPassword('');
                    }}
                  />
                )}
              </View>
            ))
          ) : (
            <Text style={styles.muted}>
              Chưa có tài khoản nhận tiền. Hãy thêm tài khoản đứng tên bạn.
            </Text>
          ))}
        {tab === 'transactions' && (
          <>
            {data.transactions.map((entry) => (
              <View key={entry.id} style={styles.card}>
                <Text style={styles.cardTitle}>{entry.description}</Text>
                <Text style={styles.body}>Giá trị giao dịch: {money(entry.grossAmount)}</Text>
                <Text style={styles.note}>
                  Thay đổi công nợ: {Number(entry.payableChange) > 0 ? '+' : ''}
                  {money(entry.payableChange)}
                </Text>
                <Text style={styles.muted}>
                  {dateTime(entry.createdAt)}
                  {entry.sandbox ? ' · Mô phỏng' : ''}
                </Text>
              </View>
            ))}
            {!data.transactions.length && <Text style={styles.muted}>Chưa có giao dịch.</Text>}
            <View style={styles.row}>
              <ActionButton
                label="Trước"
                onPress={() => setPage((p) => p - 1)}
                disabled={page === 0}
              />
              <ActionButton
                label="Tiếp"
                onPress={() => setPage((p) => p + 1)}
                disabled={data.transactions.length !== 25}
              />
            </View>
          </>
        )}
        {tab === 'withdrawals' && (
          <>
            {data.withdrawals.map((w) => (
              <TouchableOpacity
                key={w.id}
                accessibilityRole="button"
                onPress={async () => {
                  try {
                    setDetail(await apiRequest<Withdrawal>(`/finance/withdrawals/${w.id}`));
                  } catch (cause) {
                    setNotice(cause instanceof Error ? cause.message : 'Không tải được yêu cầu.');
                  }
                }}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{money(w.amount)}</Text>
                <Text style={styles.body}>
                  {w.bankCode} · •••• {w.lastFour}
                </Text>
                <Text style={styles.note}>{statusLabel[w.status]}</Text>
                <Text style={styles.muted}>{dateTime(w.createdAt)}</Text>
              </TouchableOpacity>
            ))}
            {!data.withdrawals.length && (
              <Text style={styles.muted}>Chưa có yêu cầu rút tiền.</Text>
            )}
            <View style={styles.row}>
              {
                <ActionButton
                  label={'Trước'}
                  onPress={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                />
              }
              {
                <ActionButton
                  label={'Tiếp'}
                  onPress={() => setPage((p) => p + 1)}
                  disabled={data.withdrawals.length !== 25}
                />
              }
            </View>
          </>
        )}
      </ScrollView>
      <Modal
        visible={mode !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (!busy) close();
        }}
      >
        <SafeAreaView style={styles.page}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>
                {mode === 'bank'
                  ? editingBank
                    ? 'Cập nhật tài khoản nhận tiền'
                    : 'Thêm tài khoản nhận tiền'
                  : mode === 'disable'
                    ? 'Ngừng sử dụng tài khoản'
                    : 'Yêu cầu rút tiền'}
              </Text>
              {mode === 'bank' ? (
                <>
                  {editingBank && (
                    <Text style={styles.note}>
                      Nhập lại đầy đủ thông tin. Thay đổi tạo phiên bản mới để xác minh; nếu đang có
                      lệnh chi chưa kết thúc, hãy thêm tài khoản mới.
                    </Text>
                  )}
                  <Text style={styles.label}>Mã ngân hàng</Text>
                  <TextInput
                    accessibilityLabel="Mã ngân hàng"
                    value={bankCode}
                    onChangeText={setBankCode}
                    autoCapitalize="characters"
                    maxLength={20}
                    style={styles.input}
                  />
                  <Text style={styles.label}>Số tài khoản</Text>
                  <TextInput
                    accessibilityLabel="Số tài khoản"
                    value={account}
                    onChangeText={setAccount}
                    keyboardType="number-pad"
                    autoCorrect={false}
                    maxLength={40}
                    style={styles.input}
                  />
                  <Text style={styles.label}>Tên chủ tài khoản</Text>
                  <TextInput
                    accessibilityLabel="Tên chủ tài khoản"
                    value={holder}
                    onChangeText={setHolder}
                    maxLength={150}
                    style={styles.input}
                  />
                </>
              ) : mode === 'withdraw' ? (
                <>
                  <Text style={styles.note}>
                    Rút tối thiểu {money(wallet?.minimumWithdrawal || 0)}. Hạn mức mỗi ngày{' '}
                    {money(wallet?.dailyWithdrawalLimit || 0)}.
                  </Text>
                  <Text style={styles.label}>Chọn tài khoản đã xác minh</Text>
                  {data.banks
                    .filter((b) => b.status === 'VERIFIED')
                    .map((b) => (
                      <TouchableOpacity
                        key={b.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: bankId === b.id }}
                        onPress={() => {
                          setBankId(b.id);
                          key.current = null;
                        }}
                        style={[styles.card, bankId === b.id && styles.activeTab]}
                      >
                        <Text>
                          {b.bankCode} · •••• {b.lastFour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  <Text style={styles.label}>Số tiền rút (VND)</Text>
                  <TextInput
                    accessibilityLabel="Số tiền rút"
                    value={amount}
                    onChangeText={(value) => {
                      setAmount(value.replace(/[^0-9]/g, ''));
                      key.current = null;
                    }}
                    keyboardType="number-pad"
                    maxLength={12}
                    style={styles.input}
                  />
                  <Text style={styles.muted}>
                    Khả dụng {money(wallet?.availableBalance || 0)}. Yêu cầu sẽ chờ duyệt và đối
                    soát.
                  </Text>
                </>
              ) : (
                <Text style={styles.note}>
                  Tài khoản này không dùng cho yêu cầu mới. Thông tin người nhận của lệnh đã tạo
                  được giữ nguyên.
                </Text>
              )}
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
              <TextInput
                accessibilityLabel="Mật khẩu hiện tại"
                secureTextEntry
                autoComplete="current-password"
                value={password}
                onChangeText={setPassword}
                maxLength={200}
                style={styles.input}
              />
              {error && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              )}
              {busy ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <ActionButton label={'Xác nhận'} onPress={() => void submit()} />
              )}
              {<ActionButton label={'Đóng'} onPress={close} disabled={busy} />}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={Boolean(detail)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetail(null)}
      >
        <SafeAreaView style={styles.page}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Chi tiết yêu cầu rút</Text>
            {detail && (
              <>
                <Text style={styles.value}>{money(detail.amount)}</Text>
                <Text>
                  {detail.bankCode} · •••• {detail.lastFour} · {statusLabel[detail.status]}
                </Text>
                {detail.history?.map((event, index) => (
                  <View key={`${event.createdAt}-${index}`} style={styles.card}>
                    <Text style={styles.muted}>{dateTime(event.createdAt)}</Text>
                    <Text style={styles.cardTitle}>
                      {statusLabel[event.action] || event.action}
                    </Text>
                    <Text style={styles.body}>{event.detail}</Text>
                  </View>
                ))}
              </>
            )}
            {<ActionButton label={'Đóng'} onPress={() => setDetail(null)} />}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  note: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 21,
    color: '#1E40AF',
  },
  muted: { fontSize: 12, color: COLORS.textMuted, lineHeight: 19 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  value: { fontSize: 19, fontWeight: '700', color: COLORS.textPrimary, marginTop: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  disabled: { opacity: 0.4 },
  tab: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  activeTab: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  tabText: { fontSize: 13, color: COLORS.primary },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  body: { fontSize: 13, lineHeight: 21, color: COLORS.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 48,
    color: COLORS.textPrimary,
  },
  error: {
    fontSize: 13,
    color: '#B91C1C',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
  },
});

function ActionButton({
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
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && { opacity: 0.4 }]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}
