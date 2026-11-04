export type UserRole = 'customer' | 'freelancer';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  currency?: string;
  title?: string;
  bio?: string;
  location?: string;
  company?: string;
  reviewsCount?: number;
  totalEarnings?: number;
  skills?: string[];
  rating?: number;
  isPremium?: boolean;
  premiumPlan?: string;
  hourlyRate?: number;
  totalSpent?: number;
  completedJobs?: number;
  portfolio?: { id: string; title: string; link: string }[];
}
export type JobStatus =
  | 'draft'
  | 'open'
  | 'negotiating'
  | 'awaiting_payment'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'closed';
export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency?: string;
  category: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  customerRating?: number;
  skills: string[];
  status: JobStatus;
  createdAt: string;
  deadline: string;
  applicationsCount: number;
  location?: string;
  requirements?: string[];
  upgrades?: string[];
}
export type JobInput = Partial<Omit<Job, 'id'>> & Pick<Job, 'title' | 'description' | 'budget'>;
export type ProposalStatus = 'pending' | 'accepted' | 'rejected';
export interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerRating?: number;
  freelancerSkills?: string[];
  proposedPrice: number;
  currency?: string;
  deliveryTime: string;
  coverLetter: string;
  portfolioUrl?: string;
  status: ProposalStatus;
  appliedAt: string;
}
export type ProposalInput = Omit<
  Proposal,
  'id' | 'status' | 'appliedAt' | 'freelancerId' | 'freelancerName'
>;
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}
export interface Conversation {
  id: string;
  application: Proposal;
  project: Job;
  participants: string[];
  startedAt: string;
  messages: ChatMessage[];
  readCounts: Record<string, number>;
}
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}
export interface Category {
  id: string;
  name: string;
  icon: string;
  jobsCount?: number;
}
export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  badgeColor: string;
}
export interface Registration {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
