export const PROJECT_UPGRADES = [
  { id: 'featured', name: 'Nổi bật', icon: 'star-outline', price: 59000, description: 'Ưu tiên hiển thị dự án trong 7 ngày.' },
  { id: 'urgent', name: 'Tuyển gấp', icon: 'flash-outline', price: 99000, description: 'Đánh dấu dự án cần nhận đề xuất sớm.' },
  { id: 'guarantee', name: 'Gói bảo hành', icon: 'shield-checkmark-outline', price: 59000, description: 'Thêm yêu cầu hỗ trợ sau bàn giao.' },
];
export const PROJECT_DURATIONS = [{ days: 21, label: 'Dưới 1 tháng' }, { days: 60, label: '1 – 3 tháng' }, { days: 120, label: 'Trên 3 tháng' }];
export const initialProjectForm = () => ({ title: '', description: '', category: 'Lập trình web', skills: '', audience: '', tone: '', assets: '', requirements: '', location: 'Làm việc từ xa', budget: '1000000', duration: 21, upgrades: [] });
export const upgradeTotal = (ids) => PROJECT_UPGRADES.filter((option) => ids.includes(option.id)).reduce((sum, option) => sum + option.price, 0);
export const validateProjectStep = (form, step) => {
  const errors = {};
  if (step === 0) {
    if (form.title.trim().length < 5) errors.title = 'Nhập tên dự án từ 5 ký tự.';
    if (form.description.trim().length < 20) errors.description = 'Mô tả dự án ít nhất 20 ký tự.';
    if (!form.category) errors.category = 'Chọn lĩnh vực dự án.';
  }
  if (step === 1) {
    const amount = Number(form.budget);
    if (!Number.isSafeInteger(amount) || amount < 500000 || amount > 100000000) errors.budget = 'Ngân sách từ 500.000 đến 100.000.000 VNĐ, không có phần thập phân.';
    if (!PROJECT_DURATIONS.some((item) => item.days === form.duration)) errors.duration = 'Chọn thời hạn hoàn thành.';
  }
  return errors;
};
export const buildProjectPayload = (form, status = 'open', now = new Date()) => {
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + form.duration);
  return {
    title: form.title.trim(), description: form.description.trim(), category: form.category,
    skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
    requirements: form.requirements.split('\n').map((item) => item.trim()).filter(Boolean),
    audience: form.audience.trim(), tone: form.tone.trim(), assets: form.assets.trim(),
    budget: Number(form.budget), currency: 'VND', durationDays: form.duration,
    deadline: `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`,
    location: form.location.trim() || 'Làm việc từ xa', upgrades: PROJECT_UPGRADES.filter((item) => form.upgrades.includes(item.id)).map((item) => item.id),
    upgradeFee: upgradeTotal(form.upgrades), totalBudget: Number(form.budget) + upgradeTotal(form.upgrades), status,
  };
};
