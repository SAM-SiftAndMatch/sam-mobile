import type {
  Category,
  Conversation,
  Job,
  JobInput,
  Notification,
  PremiumPlan,
  Proposal,
  ProposalInput,
  ProposalStatus,
  Registration,
  User,
} from '../types/domain';
export interface Repository {
  auth: {
    login(email: string, password: string): Promise<User>;
    register(data: Registration): Promise<User>;
    updateProfile(userId: string, data: Partial<User>): Promise<User>;
  };
  marketplace: {
    listJobs(): Promise<Job[]>;
    listCategories(): Promise<Category[]>;
    listProposals(userId: string, role: User['role']): Promise<Proposal[]>;
    createJob(data: JobInput): Promise<Job>;
    deleteJob(id: string): Promise<unknown>;
    createProposal(
      data: ProposalInput & { freelancerId: string; freelancerName: string },
    ): Promise<Proposal>;
    decideProposal(id: string, status: ProposalStatus, actorId: string): Promise<Proposal>;
  };
  chat: {
    list(userId: string): Promise<Conversation[]>;
    send(roomId: string, userId: string, text: string, clientId: string): Promise<unknown>;
    markRead(roomId: string, userId: string): Promise<void>;
  };
  notifications: {
    list(userId: string): Promise<Notification[]>;
    markRead(id: string): Promise<unknown>;
  };
  subscriptions: {
    listPlans(): Promise<PremiumPlan[]>;
    subscribe(userId: string, planId: string): Promise<{ success: boolean; plan: PremiumPlan }>;
  };
}
