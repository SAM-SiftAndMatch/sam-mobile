import { QuoteSection, PaidOrdersSection } from './PaidMaintenanceSection';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../features/auth/AuthProvider';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { apiMode, apiRequest, requestKey } from '../../services/api/client';
import { dateTime, statusLabel, type Maintenance, type Ticket } from '../../services/finance';
import Text from '../../design/Text';
import { Header } from '../../components/common/Header';
import { COLORS } from '../../constants/colors';
export default function MaintenanceScreen() {
  const params = useLocalSearchParams<{
    jobId: string;
  }>();
  const job = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [paidVersion, setPaidVersion] = useState(0);
  const [mode, setMode] = useState<'WARRANTY' | 'PAID' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const key = useRef<string | null>(null);
  const sending = useRef(false);
  const load = useCallback(async () => {
    if (!apiMode || !user?.id || !job) return { summary: null, tickets: [] };
    const [summary, tickets] = await Promise.all([
      apiRequest<Maintenance>(`/projects/${job}/maintenance`),
      apiRequest<Ticket[]>(`/projects/${job}/maintenance-tickets?page=${page}`),
    ]);
    return { summary, tickets };
  }, [job, page, user?.id]);
  const {
    data,
    loading,
    error: loadError,
    refresh,
  } = useAsyncResource<{
    summary: Maintenance | null;
    tickets: Ticket[];
  }>(load, {
    summary: null,
    tickets: [],
  });
  const open = (kind: 'WARRANTY' | 'PAID') => {
    setMode(kind);
    setTitle('');
    setDescription('');
    setError('');
    key.current = null;
  };
  const create = async () => {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError('');
    try {
      if (!title.trim() || !description.trim()) throw new Error('Nhập tiêu đề và mô tả chi tiết.');
      if (!key.current) key.current = await requestKey();
      const ticket = await apiRequest<Ticket>(`/projects/${job}/maintenance-tickets`, 'POST', {
        requestKey: key.current,
        kind: mode,
        title,
        description,
      });
      setMode(null);
      setSelected(await apiRequest<Ticket>(`/maintenance-tickets/${ticket.id}`));
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không gửi được yêu cầu.');
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };
  const update = async (action: string) => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      if (!content.trim()) throw new Error('Nhập nội dung hoặc căn cứ cho thao tác.');
      setSelected(
        await apiRequest<Ticket>(`/maintenance-tickets/${selected.id}/actions`, 'POST', {
          action,
          content,
        }),
      );
      setContent('');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không cập nhật được ticket.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <Header title="Bảo trì dự án" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void refresh().catch(() => {})} />
        }
      >
        <Text style={styles.title}>Dự án hoàn thành, vẫn được hỗ trợ</Text>
        <Text style={styles.note}>
          Báo lỗi trong 7 ngày sau nghiệm thu. Ticket gửi đúng hạn tiếp tục được xử lý miễn phí sau
          hạn; công nợ chỉ được chi khi đủ thời gian và hết các chặn liên quan.
        </Text>
        {loadError && <Text style={styles.error}>{loadError}</Text>}
        {data.summary && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hạn mở ticket miễn phí</Text>
            <Text>{dateTime(data.summary.warrantyEndsAt)}</Text>
            <Text style={styles.muted}>
              {data.summary.payoutBlocked ? 'Công nợ đang được giữ' : 'Công nợ được xét khả dụng'} ·{' '}
              {data.summary.openIssueCount} ticket chưa kết thúc
            </Text>
            {data.summary.canCreateWarrantyTicket && (
              <ActionButton
                label={'Báo lỗi trong thời gian bảo trì'}
                onPress={() => open('WARRANTY')}
              />
            )}
            {data.summary.canRequestPaidMaintenance && (
              <ActionButton label={'Yêu cầu bảo trì có phí'} onPress={() => open('PAID')} />
            )}
          </View>
        )}
        {!apiMode && (
          <Text style={styles.muted}>Thông tin bảo trì chưa khả dụng trong phiên hiện tại.</Text>
        )}
        {job && <PaidOrdersSection key={`${job}-${paidVersion}`} scopeId={job} />}
        {data.tickets.map((t) => (
          <TouchableOpacity
            key={t.id}
            accessibilityRole="button"
            style={styles.card}
            onPress={async () => {
              setError('');
              try {
                setSelected(await apiRequest<Ticket>(`/maintenance-tickets/${t.id}`));
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : 'Không tải được ticket.');
              }
            }}
          >
            <Text style={styles.cardTitle}>{t.title}</Text>
            <Text style={styles.muted}>
              {t.kind === 'PAID' ? 'Yêu cầu báo giá' : 'Bảo trì miễn phí'} · {statusLabel[t.status]}
            </Text>
            <Text style={styles.muted}>Hạn xử lý: {dateTime(t.resolutionDueAt)}</Text>
          </TouchableOpacity>
        ))}
        {!loading && !data.tickets.length && (
          <Text style={styles.muted}>Chưa có ticket hoặc yêu cầu bảo trì.</Text>
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
              disabled={data.tickets.length !== 25}
            />
          }
        </View>
      </ScrollView>
      <Modal
        visible={mode !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (!busy) setMode(null);
        }}
      >
        <SafeAreaView style={styles.page}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>
              {mode === 'WARRANTY' ? 'Báo lỗi bảo trì' : 'Yêu cầu báo giá bảo trì'}
            </Text>
            <Text style={styles.note}>
              {mode === 'WARRANTY'
                ? 'Ghi rõ bước tái hiện, kết quả mong đợi, thực tế và bằng chứng. Không gửi mật khẩu hoặc khóa bí mật.'
                : 'Yêu cầu này chưa phát sinh phí. Hai bên cần thống nhất báo giá và thời hạn trước khi thực hiện.'}
            </Text>
            <Text style={styles.label}>Tiêu đề</Text>
            <TextInput
              accessibilityLabel="Tiêu đề ticket"
              maxLength={200}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
            <Text style={styles.label}>Chi tiết</Text>
            <TextInput
              accessibilityLabel="Chi tiết ticket"
              multiline
              maxLength={8000}
              textAlignVertical="top"
              style={[styles.input, { minHeight: 180 }]}
              value={description}
              onChangeText={setDescription}
            />
            {error && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}
            {busy ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <ActionButton label={'Gửi yêu cầu'} onPress={() => void create()} />
            )}
            {<ActionButton label={'Đóng'} onPress={() => setMode(null)} disabled={busy} />}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={Boolean(selected)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (!busy) setSelected(null);
        }}
      >
        <SafeAreaView style={styles.page}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {selected && (
              <>
                <Text style={styles.title}>{selected.title}</Text>
                <Text style={styles.note}>
                  {statusLabel[selected.status]} ·{' '}
                  {selected.kind === 'PAID' ? 'Yêu cầu báo giá' : 'Bảo trì miễn phí'}
                </Text>
                <Text style={styles.body}>{selected.description}</Text>
                {selected.kind === 'PAID' && !selected.closedAt && (
                  <QuoteSection
                    ticketId={selected.id}
                    onChanged={() => {
                      setPaidVersion((n) => n + 1);
                      void refresh().catch(() => {});
                    }}
                  />
                )}
                <Text style={styles.muted}>Hạn xử lý {dateTime(selected.resolutionDueAt)}</Text>
                {selected.events?.map((event) => (
                  <View key={event.id} style={styles.card}>
                    <Text style={styles.muted}>
                      {dateTime(event.createdAt)} · {event.action}
                    </Text>
                    <Text style={styles.body}>{event.content}</Text>
                  </View>
                ))}
                {!selected.closedAt && (
                  <>
                    <Text style={styles.label}>Nội dung cập nhật / căn cứ</Text>
                    <TextInput
                      accessibilityLabel="Nội dung cập nhật ticket"
                      multiline
                      maxLength={8000}
                      style={[styles.input, { minHeight: 100 }]}
                      value={content}
                      onChangeText={setContent}
                    />
                    {error && (
                      <Text accessibilityRole="alert" style={styles.error}>
                        {error}
                      </Text>
                    )}
                    {busy ? (
                      <ActivityIndicator color={COLORS.primary} />
                    ) : (
                      <View style={styles.row}>
                        {
                          <ActionButton
                            label={'Trao đổi thêm'}
                            onPress={() => void update('COMMENT')}
                          />
                        }
                        {
                          <ActionButton
                            label={'Nhờ admin hỗ trợ'}
                            onPress={() => void update('ESCALATE')}
                          />
                        }
                        {user?.role === 'freelancer' &&
                          ['OPEN', 'WAITING_CLIENT'].includes(selected.status) && (
                            <ActionButton
                              label={'Tiếp nhận xử lý'}
                              onPress={() => void update('START')}
                            />
                          )}
                        {user?.role === 'freelancer' &&
                          selected.kind === 'WARRANTY' &&
                          ['OPEN', 'IN_PROGRESS', 'WAITING_CLIENT'].includes(selected.status) && (
                            <ActionButton
                              label={'Gửi bản vá'}
                              onPress={() => void update('SUBMIT_FIX')}
                            />
                          )}
                        {user?.role === 'customer' && selected.status === 'FIX_SUBMITTED' && (
                          <>
                            {
                              <ActionButton
                                label={'Xác nhận đã sửa'}
                                onPress={() => void update('ACCEPT_FIX')}
                              />
                            }
                            {
                              <ActionButton
                                label={'Lỗi vẫn còn'}
                                onPress={() => void update('REJECT_FIX')}
                              />
                            }
                          </>
                        )}
                      </View>
                    )}
                  </>
                )}
              </>
            )}
            {
              <ActionButton
                label={'Đóng'}
                onPress={() => {
                  setSelected(null);
                  setContent('');
                  setError('');
                }}
                disabled={busy}
              />
            }
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 23, fontWeight: '700', color: COLORS.textPrimary },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    borderRadius: 14,
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  body: { fontSize: 14, lineHeight: 23, color: COLORS.textPrimary },
  note: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    fontSize: 13,
    lineHeight: 21,
    color: '#1E40AF',
  },
  muted: { fontSize: 12, lineHeight: 20, color: COLORS.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    minHeight: 48,
    color: COLORS.textPrimary,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 12,
    minHeight: 46,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  error: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    borderRadius: 10,
    fontSize: 13,
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
