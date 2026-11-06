import type { JobInput } from '../../../types/domain';
export interface ProjectForm {
  title: string;
  description: string;
  category: string;
  skills: string;
  audience: string;
  tone: string;
  assets: string;
  requirements: string;
  location: string;
  budget: string;
  duration: number;
  upgrades: string[];
}
export interface ProjectPayload extends JobInput {
  audience: string;
  tone: string;
  assets: string;
  durationDays: number;
  upgradeFee: number;
  totalBudget: number;
  status: 'open' | 'draft';
}

export const PROJECT_UPGRADES = [
  {
    id: 'featured',
    name: 'Nổi bật',
    icon: 'star-outline',
    price: 59000,
    description: 'Ưu tiên hiển thị khi dự án còn tuyển.',
  },
  {
    id: 'urgent',
    name: 'Tuyển gấp',
    icon: 'flash-outline',
    price: 99000,
    description: 'Đánh dấu dự án cần nhận đề xuất sớm.',
  },
];
export const PROJECT_DURATIONS = [
  { days: 21, label: 'Dưới 1 tháng' },
  { days: 60, label: '1 – 3 tháng' },
  { days: 120, label: 'Trên 3 tháng' },
];
export const initialProjectForm = (): ProjectForm => ({
  title: '',
  description: '',
  category: 'Lập trình web',
  skills: '',
  audience: '',
  tone: '',
  assets: '',
  requirements: '',
  location: 'Làm việc từ xa',
  budget: '1000000',
  duration: 21,
  upgrades: [],
});
export const upgradeTotal = (ids: readonly string[]) =>
  PROJECT_UPGRADES.filter((option) => ids.includes(option.id)).reduce(
    (sum, option) => sum + option.price,
    0,
  );
export const validateProjectStep = (form: ProjectForm, step: number): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (form.title.trim().length < 5) errors.title = 'Nhập tên dự án từ 5 ký tự.';
    if (form.description.trim().length < 20) errors.description = 'Mô tả dự án ít nhất 20 ký tự.';
    if (!form.category) errors.category = 'Chọn lĩnh vực dự án.';
  }
  if (step === 1) {
    const amount = Number(form.budget);
    if (!Number.isSafeInteger(amount) || amount < 500000 || amount > 100000000)
      errors.budget = 'Ngân sách từ 500.000 đến 100.000.000 VNĐ, không có phần thập phân.';
    if (!PROJECT_DURATIONS.some((item) => item.days === form.duration))
      errors.duration = 'Chọn thời hạn hoàn thành.';
  }
  return errors;
};
export const buildProjectPayload = (
  form: ProjectForm,
  status: 'open' | 'draft' = 'open',
  now = new Date(),
): ProjectPayload => {
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + form.duration);
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    skills: form.skills
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    requirements: form.requirements
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    audience: form.audience.trim(),
    tone: form.tone.trim(),
    assets: form.assets.trim(),
    budget: Number(form.budget),
    currency: 'VND',
    durationDays: form.duration,
    deadline: `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`,
    location: form.location.trim() || 'Làm việc từ xa',
    upgrades: PROJECT_UPGRADES.filter((item) => form.upgrades.includes(item.id)).map(
      (item) => item.id,
    ),
    upgradeFee: upgradeTotal(form.upgrades),
    totalBudget: Number(form.budget),
    status,
  };
};
