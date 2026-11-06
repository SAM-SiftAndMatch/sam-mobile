import type { Repository } from '../contracts';
import type { Category, Conversation, Job, Proposal, PremiumPlan, User } from '../../types/domain';
import { apiLogin, apiRegister, apiRequest, apiUser } from './client';
interface Page<T> {
  items: T[];
  hasNext: boolean;
}
interface ApiJob {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  status: string;
  createdAt: string;
  deadline: string;
  skills?: { name: string }[];
}
interface ApiProposal {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  coverLetter: string;
  proposedBudget: number;
  estimatedDurationDays: number;
  status: string;
  createdAt: string;
}
interface ApiRoom {
  id: string;
  jobId: string;
  jobTitle: string;
  jobStatus: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  createdAt: string;
}
interface ApiMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  system: boolean;
}
const job = (j: ApiJob): Job => ({
  id: j.id,
  title: j.title,
  description: j.description || '',
  budget: Number(j.budgetMax || j.budgetMin || 0),
  currency: 'VND',
  category: 'Lập trình',
  customerId: j.clientId,
  customerName: j.clientName,
  skills: j.skills?.map((s) => s.name) || [],
  status: j.status.toLowerCase() as Job['status'],
  createdAt: j.createdAt,
  deadline: j.deadline,
  applicationsCount: 0,
});
const proposal = (p: ApiProposal): Proposal => ({
  id: p.id,
  jobId: p.jobId,
  jobTitle: p.jobTitle,
  customerId: '',
  customerName: '',
  freelancerId: p.freelancerId,
  freelancerName: p.freelancerName,
  proposedPrice: Number(p.proposedBudget),
  currency: 'VND',
  deliveryTime: p.estimatedDurationDays ? `${p.estimatedDurationDays} ngày` : 'Theo thỏa thuận',
  coverLetter: p.coverLetter || '',
  status: p.status === 'ACCEPTED' ? 'accepted' : p.status === 'REJECTED' ? 'rejected' : 'pending',
  appliedAt: p.createdAt,
});
async function page<T>(path: string): Promise<T[]> {
  return (await apiRequest<Page<T>>(path + (path.includes('?') ? '&' : '?') + 'page=0&size=50'))
    .items;
}
export const apiRepository: Repository = {
  auth: {
    login: apiLogin,
    register: (data) =>
      apiRegister({
        email: data.email,
        password: data.password,
        fullName: data.name,
        accountType: data.role === 'customer' ? 'CLIENT' : 'FREELANCER',
      }),
    updateProfile: async (_id, data) => {
      const user = apiUser();
      if (!user) throw new Error('Vui lòng đăng nhập.');
      const path = user.role === 'customer' ? '/profiles/client/me' : '/profiles/freelancer/me';
      const previous = await apiRequest<Record<string, unknown>>(path);
      await apiRequest(path, 'PUT', {
        ...previous,
        fullName: data.name || user.name,
        bio: data.bio ?? previous.bio,
        headline: data.title ?? previous.headline,
        companyName: data.company ?? previous.companyName,
        hourlyRate: data.hourlyRate ?? previous.hourlyRate,
      });
      return { ...user, ...data } as User;
    },
  },
  marketplace: {
    listJobs: async () => {
      const opened = await page<ApiJob>('/jobs/page');
      const user = apiUser();
      const owned = user
        ? await page<ApiJob>(
            user.role === 'customer'
              ? '/jobs/client/me/page'
              : `/jobs/freelancers/${user.id}/projects/page`,
          )
        : [];
      return [...new Map([...opened, ...owned].map((j) => [j.id, job(j)])).values()];
    },
    listCategories: async () => [] as Category[],
    listProposals: async () => (await page<ApiProposal>('/proposals/me/page')).map(proposal),
    createJob: async (data) =>
      job(
        await apiRequest<ApiJob>('/jobs', 'POST', {
          title: data.title,
          description: data.description,
          budgetMin: data.budget,
          budgetMax: data.budget,
          estimatedDurationMonths: 1,
          deadline: data.deadline || null,
        }),
      ),
    deleteJob: async () => {
      throw new Error('Bản nháp cần được quản lý trong không gian tạo dự án.');
    },
    createProposal: async (data) =>
      proposal(
        await apiRequest<ApiProposal>('/proposals', 'POST', {
          jobId: data.jobId,
          coverLetter: data.coverLetter,
          proposedBudget: data.proposedPrice,
          estimatedDurationDays: parseInt(data.deliveryTime, 10) || null,
        }),
      ),
    decideProposal: async (id, status) => {
      const result = await apiRequest<ApiProposal>(
        `/proposals/${id}/${status === 'accepted' ? 'accept' : 'reject'}`,
        'POST',
      );
      return proposal(result);
    },
  },
  chat: {
    list: async () => {
      const rooms = await page<ApiRoom>('/chat/rooms/page');
      return Promise.all(
        rooms.map(async (room) => {
          const [project, history] = await Promise.all([
            apiRequest<ApiJob>(`/jobs/${room.jobId}`),
            apiRequest<{ items: ApiMessage[] }>(`/chat/rooms/${room.id}/messages/page?size=50`),
          ]);
          return {
            id: room.id,
            project: job(project),
            participants: [room.clientId, room.freelancerId],
            startedAt: room.createdAt,
            readCounts: {},
            application: {
              id: room.id,
              jobId: room.jobId,
              jobTitle: room.jobTitle,
              customerId: room.clientId,
              customerName: room.clientName,
              freelancerId: room.freelancerId,
              freelancerName: room.freelancerName,
              proposedPrice: 0,
              deliveryTime: 'Theo hợp đồng',
              coverLetter: '',
              status: 'accepted',
              appliedAt: room.createdAt,
            },
            messages: history.items.map((m) => ({
              id: m.id,
              senderId: m.senderId || 'system',
              text: m.content,
              createdAt: m.createdAt,
            })),
          } as Conversation;
        }),
      );
    },
    send: async (room, _user, text) =>
      apiRequest(`/chat/rooms/${room}/messages`, 'POST', { content: text }),
    markRead: async (room) => {
      await apiRequest(`/chat/rooms/${room}/read`, 'POST');
    },
  },
  notifications: {
    list: async () => {
      const result = await apiRequest<{
        items: { id: string; message: string; type: string; createdAt: string; readAt?: string }[];
      }>('/notifications/recent');
      return result.items.map((n) => ({
        id: n.id,
        title: 'Thông báo SAM',
        message: n.message,
        type: n.type,
        createdAt: n.createdAt,
        isRead: Boolean(n.readAt),
      }));
    },
    markRead: (id) => apiRequest(`/notifications/${id}/read`, 'POST'),
  },
  subscriptions: {
    listPlans: async () => [] as PremiumPlan[],
    subscribe: async () => {
      throw new Error('Vui lòng quản lý gói dịch vụ trên website SAM.');
    },
  },
};
