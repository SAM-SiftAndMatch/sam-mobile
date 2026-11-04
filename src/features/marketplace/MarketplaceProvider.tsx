import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useAuth } from '../auth/AuthProvider';
import { repository } from '../../services/repository';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type {
  Category,
  Job,
  JobInput,
  Proposal,
  ProposalInput,
  ProposalStatus,
} from '../../types/domain';

const empty = { jobs: [] as Job[], categories: [] as Category[], applications: [] as Proposal[] };
function useMarketplaceValue() {
  const { user, role } = useAuth();
  const userId = user?.id;
  const load = useCallback(async () => {
    const [jobs, categories, applications] = await Promise.all([
      repository.marketplace.listJobs(),
      repository.marketplace.listCategories(),
      userId ? repository.marketplace.listProposals(userId, role) : Promise.resolve([]),
    ]);
    return { jobs, categories, applications };
  }, [userId, role]);
  const { data, setData, loading, error: resourceError, refresh } = useAsyncResource(load, empty);
  const { run, pending, isActive } = useAsyncAction();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const refreshJobs = useCallback(async () => (await refresh()).jobs, [refresh]);
  const postJob = useCallback(
    (data: JobInput) =>
      run(async () => {
        if (!user || role !== 'customer')
          throw new Error('Vui lòng đăng nhập bằng tài khoản khách hàng.');
        const job = await repository.marketplace.createJob({
          ...data,
          customerId: user.id,
          customerName: user.name,
          customerAvatar: user.avatar,
        });
        if (isActive()) setData((current) => ({ ...current, jobs: [job, ...current.jobs] }));
        return job;
      }),
    [user, role, run, isActive, setData],
  );
  const submitApplication = useCallback(
    (data: ProposalInput) =>
      run(async () => {
        if (!user || role !== 'freelancer')
          throw new Error('Vui lòng đăng nhập bằng tài khoản Freelancer.');
        const proposal = await repository.marketplace.createProposal({
          ...data,
          freelancerId: user.id,
          freelancerName: user.name,
          freelancerAvatar: user.avatar,
          freelancerRating: user.rating,
          freelancerSkills: user.skills,
        });
        if (isActive())
          setData((current) => ({ ...current, applications: [proposal, ...current.applications] }));
        if (isActive()) await refresh();
        return proposal;
      }),
    [user, role, run, isActive, setData, refresh],
  );
  const changeAppStatus = useCallback(
    (id: string, status: ProposalStatus) =>
      run(async () => {
        if (!userId || role !== 'customer') throw new Error('Chỉ khách hàng được xử lý đề xuất.');
        const proposal = await repository.marketplace.decideProposal(id, status, userId);
        if (isActive())
          setData((current) => ({
            ...current,
            applications: current.applications.map((item) => (item.id === id ? proposal : item)),
          }));
        if (isActive()) await refresh();
        return proposal;
      }),
    [userId, role, run, isActive, setData, refresh],
  );
  const deleteJob = useCallback(
    (id: string) =>
      run(async () => {
        const job = data.jobs.find((item) => item.id === id);
        if (!userId || job?.customerId !== userId || job.status !== 'draft')
          throw new Error('Chỉ chủ dự án được xóa bản nháp.');
        await repository.marketplace.deleteJob(id);
        if (isActive())
          setData((current) => ({
            ...current,
            jobs: current.jobs.filter((item) => item.id !== id),
          }));
      }),
    [userId, data.jobs, setData, run, isActive],
  );
  return useMemo(
    () => ({
      ...data,
      loading: loading,
      error: resourceError,
      submitting: pending,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      refreshJobs,
      postJob,
      submitApplication,
      changeAppStatus,
      deleteJob,
    }),
    [
      data,
      loading,
      resourceError,
      pending,
      searchQuery,
      selectedCategory,
      refreshJobs,
      postJob,
      submitApplication,
      changeAppStatus,
      deleteJob,
    ],
  );
}
const MarketplaceContext = createContext<ReturnType<typeof useMarketplaceValue> | null>(null);
export function MarketplaceProvider({ children }: PropsWithChildren) {
  const value = useMarketplaceValue();
  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}
export function useMarketplace() {
  const value = useContext(MarketplaceContext);
  if (!value) throw new Error('useMarketplace must be used within MarketplaceProvider');
  return value;
}
