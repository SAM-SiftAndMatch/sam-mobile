import { useRef, useState } from 'react';
import type { ScrollView } from 'react-native';
import type { Job } from '../../types/domain';
import { errorMessage } from '../../lib/errors';
import { useRequestGate } from '../../hooks/useRequestGate';
import { useMarketplace } from './MarketplaceProvider';
import {
  initialProjectForm,
  upgradeTotal,
  validateProjectStep,
  buildProjectPayload,
} from './model/projectForm';

type ProjectForm = ReturnType<typeof initialProjectForm>;
export function useProjectForm() {
  const { postJob, categories } = useMarketplace();
  const gate = useRequestGate();
  const [form, setForm] = useState(initialProjectForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Job | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [assisted, setAssisted] = useState(true);
  const scroll = useRef<ScrollView>(null);
  const lock = useRef(false);
  function set<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  function goTo(nextStep: number) {
    setErrors({});
    setStep(nextStep);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function next() {
    const issues = validateProjectStep(form, step);
    setErrors(issues);
    if (Object.keys(issues).length) {
      scroll.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (step < 3) goTo(step + 1);
    else setConfirming(true);
  }
  function makeBrief() {
    if (form.title.trim().length < 5) {
      setErrors({ title: 'Nhập ý tưởng từ 5 ký tự để tạo gợi ý.' });
      return;
    }
    set(
      'description',
      [
        form.title.trim(),
        form.audience && `Đối tượng: ${form.audience.trim()}.`,
        form.tone && `Phong cách: ${form.tone.trim()}.`,
        form.assets && `Tài liệu hiện có: ${form.assets.trim()}.`,
        'Mục tiêu: hoàn thành sản phẩm theo yêu cầu, kiểm tra chất lượng và bàn giao đầy đủ.',
      ]
        .filter(Boolean)
        .join('\n\n'),
    );
    setErrors({});
    setAssisted(false);
  }
  async function submit(status: 'open' | 'draft') {
    if (lock.current) return;
    for (const index of [0, 1]) {
      const issues = validateProjectStep(form, index);
      if (Object.keys(issues).length) {
        setConfirming(false);
        goTo(index);
        setErrors(issues);
        return;
      }
    }
    lock.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      const saved = await postJob(buildProjectPayload(form, status));
      if (gate.isActive()) {
        setResult(saved);
        setConfirming(false);
      }
    } catch (cause) {
      if (gate.isActive()) setSubmitError(errorMessage(cause));
    } finally {
      lock.current = false;
      if (gate.isActive()) setSubmitting(false);
    }
  }
  function reset() {
    setForm(initialProjectForm());
    setResult(null);
    setSubmitError('');
    setAssisted(true);
    goTo(0);
  }
  return {
    form,
    set,
    step,
    errors,
    confirming,
    setConfirming,
    submitting,
    result,
    submitError,
    assisted,
    setAssisted,
    scroll,
    categories,
    fees: upgradeTotal(form.upgrades),
    goTo,
    next,
    makeBrief,
    submit,
    reset,
  };
}
