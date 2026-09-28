import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/common/Header';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { formatCurrency } from '../../utils/formatCurrency';
import { PROJECT_UPGRADES, PROJECT_DURATIONS, initialProjectForm, upgradeTotal, validateProjectStep, buildProjectPayload } from '../../utils/projectForm';

const STEPS = ['Thông tin', 'Ngân sách', 'Nâng cấp', 'Xem lại'];
const TITLES = ['Bắt đầu với ý tưởng của bạn', 'Thiết lập ngân sách dự án', 'Tăng hiệu quả tuyển dụng', 'Xem lại dự án của bạn'];
const SUBTITLES = ['Mô tả công việc để tìm đúng chuyên gia đồng hành.', 'Chọn mức đầu tư và thời gian hoàn thành phù hợp.', 'Chọn dịch vụ phù hợp hoặc tiếp tục không nâng cấp.', 'Kiểm tra thông tin trước khi công khai dự án.'];
const money = (value) => formatCurrency(value, 'VND');

function Choice({ label, selected, onPress }) {
  return <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceActive]}>
    <Text style={[styles.choiceText, selected && styles.blue]}>{label}</Text>
  </TouchableOpacity>;
}
function ReviewCard({ title, onEdit, children }) {
  return <View style={styles.card}><View style={styles.row}><Text style={styles.cardTitle}>{title}</Text><TouchableOpacity accessibilityRole="button" onPress={onEdit} style={styles.edit}><Text style={styles.blue}>Chỉnh sửa</Text></TouchableOpacity></View>{children}</View>;
}

export const CreatePostScreen = () => {
  const { postJob, categories } = useApp();
  const [form, setForm] = useState(initialProjectForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [assisted, setAssisted] = useState(true);
  const scroll = useRef(null);
  const lock = useRef(false);
  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const fees = upgradeTotal(form.upgrades);
  const goTo = (nextStep) => { setErrors({}); setStep(nextStep); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const next = () => {
    const issues = validateProjectStep(form, step);
    setErrors(issues);
    if (Object.keys(issues).length) { scroll.current?.scrollTo({ y: 0, animated: true }); return; }
    if (step < 3) goTo(step + 1); else setConfirming(true);
  };
  const makeBrief = () => {
    if (form.title.trim().length < 5) { setErrors({ title: 'Nhập ý tưởng từ 5 ký tự để tạo gợi ý.' }); return; }
    set('description', [form.title.trim(), form.audience && `Đối tượng: ${form.audience.trim()}.`, form.tone && `Phong cách: ${form.tone.trim()}.`, form.assets && `Tài liệu hiện có: ${form.assets.trim()}.`, 'Mục tiêu: hoàn thành sản phẩm theo yêu cầu, kiểm tra chất lượng và bàn giao đầy đủ.'].filter(Boolean).join('\n\n'));
    setErrors({}); setAssisted(false);
  };
  const submit = async (status) => {
    if (lock.current) return;
    for (const index of [0, 1]) {
      const issues = validateProjectStep(form, index);
      if (Object.keys(issues).length) { setConfirming(false); goTo(index); setErrors(issues); return; }
    }
    lock.current = true; setSubmitting(true); setSubmitError('');
    try { const saved = await postJob(buildProjectPayload(form, status)); setResult(saved); setConfirming(false); }
    catch (error) { setSubmitError(error.message || 'Chưa thể lưu dự án. Vui lòng thử lại.'); }
    finally { lock.current = false; setSubmitting(false); }
  };
  const reset = () => { setForm(initialProjectForm()); setResult(null); setSubmitError(''); setAssisted(true); goTo(0); };
  const input = (key, label, props = {}) => <CustomInput label={label} value={form[key]} onChangeText={(value) => set(key, value)} error={errors[key]} {...props} />;

  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Header title="SAM • Đăng dự án" subtitle={result ? 'Dự án của bạn' : `Bước ${step + 1} / 4`} showBack={!result && step > 0 && !submitting} onBackPress={() => goTo(step - 1)} />
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      {result ? <View style={[styles.card, styles.success]}>
        <Ionicons name="checkmark-circle" size={70} color={COLORS.success} />
        <Text style={styles.heading}>{result.status === 'draft' ? 'Đã lưu bản nháp' : 'Dự án đã được đăng!'}</Text>
        <Text style={styles.body}>{result.title}</Text>
        <Text style={styles.subtitle}>{result.status === 'draft' ? 'Bản nháp chưa hiển thị cho freelancer.' : 'Freelancer có thể xem dự án và gửi đề xuất cho bạn.'}</Text>
        <CustomButton title="Tạo dự án mới" onPress={reset} style={styles.fullWidth} />
      </View> : <>
        <View style={styles.steps}>{STEPS.map((label, index) => <View key={label} style={styles.step}>
          <View style={[styles.stepCircle, index === step && styles.currentStep, index < step && styles.doneStep]}>{index < step ? <Ionicons name="checkmark" size={16} color={COLORS.white} /> : <Text style={[styles.stepNumber, index === step && styles.white]}>{index + 1}</Text>}</View>
          <Text style={[styles.stepLabel, index === step && styles.blue]}>{label}</Text>
        </View>)}</View>
        <Text style={styles.eyebrow}>TÌM ĐÚNG NGƯỜI · LÀM ĐÚNG VIỆC</Text>
        <Text style={styles.heading}>{TITLES[step]}</Text><Text style={styles.subtitle}>{SUBTITLES[step]}</Text>
        {step === 0 && <View style={styles.card}>
          <Text style={styles.cardTitle}>Bạn cần hoàn thành công việc gì?</Text>
          {input('title', 'Tên dự án', { placeholder: 'Ví dụ: Thiết kế app tài chính', required: true })}
          <Text style={styles.label}>Lĩnh vực</Text>
          <View style={styles.choices}>{(categories.length ? categories : [{ name: 'Lập trình web' }]).map((category) => <Choice key={category.name} label={category.name} selected={form.category === category.name} onPress={() => set('category', category.name)} />)}</View>
          {assisted && <View style={styles.assistant}>
            <Text style={styles.cardTitle}>✦ Trợ lý tạo brief</Text><Text style={styles.hint}>Trả lời vài câu hỏi để tạo bản mô tả mẫu có thể chỉnh sửa.</Text>
            {input('audience', 'Khách hàng mục tiêu là ai?', { placeholder: 'Gen Z, doanh nghiệp nhỏ…' })}
            {input('tone', 'Phong cách bạn mong muốn?', { placeholder: 'Tối giản, hiện đại…' })}
            {input('assets', 'Bạn đã có tài liệu gì?', { placeholder: 'Logo, bộ nhận diện, bản thiết kế…' })}
            <CustomButton title="Tạo bản brief gợi ý" icon="sparkles-outline" onPress={makeBrief} />
            <CustomButton title="Bỏ qua & tự nhập thông tin" variant="ghost" onPress={() => setAssisted(false)} />
          </View>}
          {input('description', 'Mô tả dự án', { multiline: true, numberOfLines: 6, placeholder: 'Mục tiêu, phạm vi công việc và kết quả cần bàn giao…', required: true })}
          {input('skills', 'Kỹ năng cần có', { placeholder: 'Figma, React Native, UI/UX…' })}
          {input('requirements', 'Yêu cầu bàn giao', { placeholder: 'Mỗi yêu cầu trên một dòng', multiline: true, numberOfLines: 3 })}
          {input('location', 'Địa điểm làm việc')}
        </View>}
        {step === 1 && <>
          <View style={styles.card}>
            <View style={styles.row}><Text style={styles.cardTitle}>Ngân sách dự kiến</Text><Text style={styles.currency}>VNĐ</Text></View>
            <Text style={styles.amount}>{money(Number(form.budget) || 0)}</Text>
            {input('budget', 'Nhập ngân sách', { keyboardType: 'number-pad' })}
            <View style={styles.choices}>{[500000, 1000000, 5000000].map((amount) => <Choice key={amount} label={money(amount)} selected={Number(form.budget) === amount} onPress={() => set('budget', String(amount))} />)}</View>
            <Text style={styles.hint}>Ngân sách từ 500.000 đến 100.000.000 VNĐ. Freelancer có thể gửi báo giá riêng.</Text>
          </View>
          <View style={styles.card}><Text style={styles.cardTitle}>Thời hạn hoàn thành</Text>
            <View style={styles.choices}>{PROJECT_DURATIONS.map((duration) => <Choice key={duration.days} label={duration.label} selected={duration.days === form.duration} onPress={() => set('duration', duration.days)} />)}</View>
            <Text style={styles.hint}>Dự kiến {form.duration} ngày kể từ khi đăng dự án.</Text>
          </View>
        </>}
        {step === 2 && <>
          {PROJECT_UPGRADES.map((option) => {
            const selected = form.upgrades.includes(option.id);
            return <TouchableOpacity key={option.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => set('upgrades', selected ? form.upgrades.filter((id) => id !== option.id) : [...form.upgrades, option.id])} style={[styles.card, selected && styles.selectedCard]}>
              <View style={styles.row}><View style={styles.iconBox}><Ionicons name={option.icon} size={22} color={COLORS.primary} /></View><Ionicons name={selected ? 'checkbox' : 'square-outline'} size={24} color={selected ? COLORS.primary : COLORS.borderDark} /></View>
              <Text style={styles.cardTitle}>{option.name}</Text><Text style={styles.body}>{option.description}</Text><Text style={styles.price}>{money(option.price)}</Text>
            </TouchableOpacity>;
          })}
          <Text style={styles.hint}>Lựa chọn được lưu cùng dự án. Phiên bản hiện tại chưa thu phí hoặc kích hoạt dịch vụ nâng cấp.</Text>
        </>}
        {step === 3 && <>
          <ReviewCard title="Mô tả dự án" onEdit={() => goTo(0)}><Text style={styles.label}>{form.title}</Text><Text style={styles.body}>{form.description}</Text></ReviewCard>
          <ReviewCard title="Thông tin công việc" onEdit={() => goTo(0)}><Text style={styles.body}>{form.category} · {form.location || 'Làm việc từ xa'}</Text><Text style={styles.body}>{form.skills || 'Không yêu cầu kỹ năng cụ thể'}</Text>{!!form.requirements && <Text style={styles.body}>{form.requirements}</Text>}</ReviewCard>
          <ReviewCard title="Ngân sách & thời hạn" onEdit={() => goTo(1)}><Text style={styles.price}>{money(Number(form.budget))}</Text><Text style={styles.body}>{PROJECT_DURATIONS.find((item) => item.days === form.duration)?.label} · {form.duration} ngày</Text></ReviewCard>
          <ReviewCard title="Nâng cấp đã chọn" onEdit={() => goTo(2)}>{form.upgrades.length ? PROJECT_UPGRADES.filter((item) => form.upgrades.includes(item.id)).map((item) => <View key={item.id} style={styles.row}><Text style={styles.body}>{item.name}</Text><Text style={styles.price}>{money(item.price)}</Text></View>) : <Text style={styles.body}>Không sử dụng nâng cấp.</Text>}</ReviewCard>
        </>}
        {step >= 2 && <LinearGradient colors={[COLORS.primaryBackground, '#E4F5FF']} style={styles.total}>
          <Text style={styles.label}>TỔNG NGÂN SÁCH DỰ KIẾN</Text><Text style={styles.amount}>{money(Number(form.budget) + fees)}</Text><Text style={styles.hint}>Ngân sách dự án + {money(fees)} phí nâng cấp dự kiến.</Text>
        </LinearGradient>}
        {!!submitError && <Text accessibilityRole="alert" style={styles.error}>{submitError}</Text>}
        <View style={styles.actions}>
          <CustomButton title={step === 3 ? 'Đăng dự án ngay' : 'Tiếp tục'} icon={step === 3 ? 'rocket-outline' : 'arrow-forward'} iconPosition="right" onPress={next} disabled={submitting} size="large" />
          {step > 0 && <CustomButton title="Quay lại" variant="ghost" onPress={() => goTo(step - 1)} disabled={submitting} />}
          {step === 3 && <CustomButton title="Lưu bản nháp" variant="outline" onPress={() => submit('draft')} loading={submitting} />}
        </View>
      </>}
    </ScrollView>
    <Modal visible={confirming} transparent animationType="fade" onRequestClose={() => { if (!submitting) setConfirming(false); }}>
      <SafeAreaView style={styles.overlay}><ScrollView contentContainerStyle={styles.modalScroll}><View style={styles.modalCard}>
        <Ionicons name="help-circle-outline" size={64} color={COLORS.primary} />
        <Text style={styles.heading}>Bạn có chắc muốn đăng dự án này?</Text><Text style={styles.subtitle}>Dự án sẽ hiển thị cho freelancer để nhận đề xuất.</Text>
        <Text style={styles.cardTitle}>{form.title}</Text><Text style={styles.price}>{money(Number(form.budget) + fees)}</Text>
        {!!submitError && <Text accessibilityRole="alert" style={styles.error}>{submitError}</Text>}
        <CustomButton title="Xác nhận đăng dự án" icon="rocket-outline" onPress={() => submit('open')} loading={submitting} style={styles.fullWidth} />
        <CustomButton title="Quay lại" variant="ghost" disabled={submitting} onPress={() => setConfirming(false)} />
      </View></ScrollView></SafeAreaView>
    </Modal>
  </KeyboardAvoidingView>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48, maxWidth: 640, width: '100%', alignSelf: 'center' },
  steps: { flexDirection: 'row', marginBottom: 30, paddingVertical: 10 },
  step: { flex: 1, alignItems: 'center', gap: 8 },
  stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  currentStep: { backgroundColor: COLORS.primary, borderColor: COLORS.primary }, doneStep: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  stepNumber: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700' }, stepLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  eyebrow: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10 },
  heading: { fontSize: 26, lineHeight: 34, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  card: { backgroundColor: COLORS.white, borderRadius: 22, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.primaryDark, shadowOpacity: 0.04, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 1 },
  cardTitle: { fontSize: 16, lineHeight: 23, color: COLORS.textPrimary, fontWeight: '700', marginBottom: 14, flexShrink: 1 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 10 },
  body: { fontSize: 14, lineHeight: 23, color: COLORS.textSecondary, marginBottom: 8, flexShrink: 1 },
  hint: { fontSize: 12, lineHeight: 19, color: COLORS.textSecondary, marginVertical: 10 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  choice: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  choiceActive: { backgroundColor: COLORS.primaryBackground, borderColor: COLORS.primary }, choiceText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  blue: { color: COLORS.primary, fontWeight: '700' }, white: { color: COLORS.white },
  assistant: { padding: 14, borderRadius: 16, backgroundColor: COLORS.primaryBackground, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  currency: { backgroundColor: COLORS.surface, padding: 8, borderRadius: 8, color: COLORS.textSecondary, fontWeight: '700' },
  amount: { color: COLORS.primary, fontSize: 30, fontWeight: '800', marginVertical: 16 },
  selectedCard: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBackground },
  iconBox: { padding: 10, backgroundColor: COLORS.primaryBackground, borderRadius: 12, marginBottom: 12 },
  price: { color: COLORS.primary, fontWeight: '700', fontSize: 15, marginVertical: 8 },
  total: { padding: 20, borderRadius: 20, marginVertical: 8, borderWidth: 1, borderColor: COLORS.borderDark },
  actions: { gap: 10, marginTop: 20 }, edit: { paddingVertical: 12 }, error: { color: COLORS.danger, lineHeight: 21, marginVertical: 12 },
  success: { alignItems: 'center', gap: 10, marginTop: 24 }, fullWidth: { alignSelf: 'stretch' },
  overlay: { flex: 1, backgroundColor: COLORS.overlay }, modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: COLORS.white, borderRadius: 26, padding: 24, gap: 10, maxWidth: 480, width: '100%', alignSelf: 'center' },
});
export default CreatePostScreen;
