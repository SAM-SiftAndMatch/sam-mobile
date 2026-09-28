// Mock Service layer that simulates async REST API calls
import { mockJobs } from '../data/jobs';
import { mockUsers } from '../data/users';
import { mockApplications } from '../data/applications';
import { mockCategories } from '../data/categories';
import { mockPremiumPlans } from '../data/premiumPlans';
import { mockNotifications } from '../data/notifications';
import { createProjectChatStore, makeProjectConversation } from './projectChatStore';

// Helper to simulate network latency
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory data store for live CRUD interactions during session
let jobsList = [...mockJobs];
let usersList = [...mockUsers];
let applicationsList = [...mockApplications];
let notificationsList = [...mockNotifications];

const seedChats = mockApplications.filter((app) => app.status === 'accepted').flatMap((app) => {
  const project = mockJobs.find((job) => job.id === app.jobId);
  return project && ['open', 'in_progress'].includes(project.status)
    ? [makeProjectConversation(app, { ...project, status: 'in_progress' })] : [];
});
let chatStore = createProjectChatStore(seedChats);
let chatHydration;
export const configureChatStorage = (storage) => {
  chatStore = createProjectChatStore(seedChats, storage);
  chatHydration = undefined;
};
async function hydrateProjects() {
  if (!chatHydration) {
    chatHydration = chatStore.snapshot().then((rooms) => {
      for (const room of rooms) {
        jobsList = [...jobsList.filter((job) => job.id !== room.project.id), room.project];
        applicationsList = [...applicationsList.filter((app) => app.id !== room.application.id), room.application];
      }
    }).catch((error) => { chatHydration = undefined; throw error; });
  }
  await chatHydration;
}
export const getConversations = async (userId) => { await hydrateProjects(); return chatStore.list(userId); };
export const sendProjectMessage = (id, userId, text, clientId) => chatStore.send(id, userId, text, clientId);
export const markConversationRead = (id, userId) => chatStore.markRead(id, userId);

// --- AUTH SERVICES ---
export const loginUser = async (email, password) => {
  await delay(400);
  const user = usersList.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) {
    throw new Error('Invalid email or password. Try freelancer@example.com / 123456');
  }
  return user;
};

export const registerUser = async (userData) => {
  await delay(500);
  const existing = usersList.find(
    (u) => u.email.toLowerCase() === userData.email.toLowerCase()
  );
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const newUser = {
    id: `user${Date.now()}`,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role || 'freelancer',
    avatar: userData.role === 'freelancer'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bio: userData.role === 'freelancer' ? 'Enthusiastic freelancer looking for great projects.' : 'Hiring talented freelancers.',
    skills: userData.role === 'freelancer' ? ['React Native', 'JavaScript'] : ['Product Management'],
    location: 'Làm việc từ xa',
    rating: 5.0,
    reviewsCount: 0,
    completedJobs: 0,
    isPremium: false,
    hourlyRate: 45,
    totalEarnings: 0,
    totalSpent: 0,
  };

  usersList.push(newUser);
  return newUser;
};

export const getUserById = async (id) => {
  await delay(200);
  const user = usersList.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  return user;
};

export const updateUser = async (id, updateData) => {
  await delay(400);
  usersList = usersList.map((u) => (u.id === id ? { ...u, ...updateData } : u));
  return usersList.find((u) => u.id === id);
};

// --- JOBS SERVICES ---
export const getJobs = async (filters = {}) => {
  await hydrateProjects();
  await delay(300);
  let result = [...jobsList];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        job.skills.some((skill) => skill.toLowerCase().includes(q))
    );
  }

  if (filters.category && filters.category !== 'All') {
    result = result.filter((job) => job.category === filters.category);
  }

  if (filters.status) {
    result = result.filter((job) => job.status === filters.status);
  }

  if (filters.customerId) {
    result = result.filter((job) => job.customerId === filters.customerId);
  }

  return result;
};

export const getJobById = async (id) => {
  await hydrateProjects();
  await delay(200);
  const job = jobsList.find((j) => j.id === id);
  if (!job) throw new Error('Job post not found');
  return job;
};

export const createJob = async (jobData) => {
  await delay(500);
  const newJob = {
    id: `job${Date.now()}`,
    title: jobData.title,
    description: jobData.description,
    budget: Number(jobData.budget) || 500,
    currency: jobData.currency || 'USD',
    durationDays: jobData.durationDays,
    audience: jobData.audience || '',
    tone: jobData.tone || '',
    assets: jobData.assets || '',
    upgrades: jobData.upgrades || [],
    upgradeFee: jobData.upgradeFee || 0,
    totalBudget: jobData.totalBudget || Number(jobData.budget),
    category: jobData.category || 'Lập trình web',
    customerId: jobData.customerId,
    customerName: jobData.customerName || 'Sarah Miller',
    customerAvatar: jobData.customerAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    customerRating: 5.0,
    skills: Array.isArray(jobData.skills) ? jobData.skills : (jobData.skills ? jobData.skills.split(',').map(s=>s.trim()) : ['React Native']),
    location: jobData.location || 'Làm việc từ xa',
    status: jobData.status || 'open',
    createdAt: new Date().toISOString().split('T')[0],
    deadline: jobData.deadline || '2026-11-30',
    requirements: jobData.requirements || ['Experience required', 'Good communication'],
    applicationsCount: 0
  };

  jobsList.unshift(newJob);

  // Trigger mock notification for customer
  notificationsList.unshift({
    id: `notif${Date.now()}`,
    userId: jobData.customerId,
    title: newJob.status === 'draft' ? 'Đã lưu bản nháp' : 'Đăng dự án thành công',
    message: newJob.status === 'draft' ? `Đã lưu bản nháp "${newJob.title}".` : `Dự án "${newJob.title}" đã được đăng.`,
    type: 'job',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  return newJob;
};

export const updateJob = async (id, updateData) => {
  await delay(400);
  jobsList = jobsList.map((job) => (job.id === id ? { ...job, ...updateData } : job));
  return jobsList.find((j) => j.id === id);
};

export const deleteJob = async (id) => {
  await delay(300);
  jobsList = jobsList.filter((job) => job.id !== id);
  return { success: true, id };
};

// --- APPLICATIONS SERVICES ---
export const getApplications = async (filters = {}) => {
  await hydrateProjects();
  await delay(300);
  let result = [...applicationsList];

  if (filters.freelancerId) {
    result = result.filter((app) => app.freelancerId === filters.freelancerId);
  }

  if (filters.customerId) {
    result = result.filter((app) => app.customerId === filters.customerId);
  }

  if (filters.jobId) {
    result = result.filter((app) => app.jobId === filters.jobId);
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter((app) => app.status === filters.status);
  }

  return result;
};

export const createApplication = async (appData) => {
  await hydrateProjects();
  await delay(500);
  const job = jobsList.find((item) => item.id === appData.jobId);
  if (!job || job.status !== 'open') throw new Error('Dự án hiện không nhận ứng tuyển.');

  // Check if freelancer already applied to this job
  const existing = applicationsList.find(
    (a) => a.jobId === appData.jobId && a.freelancerId === appData.freelancerId
  );
  if (existing) {
    throw new Error('You have already submitted an application for this job.');
  }

  const newApp = {
    id: `app${Date.now()}`,
    jobId: appData.jobId,
    jobTitle: appData.jobTitle,
    customerId: appData.customerId,
    customerName: appData.customerName,
    customerAvatar: appData.customerAvatar,
    freelancerId: appData.freelancerId,
    freelancerName: appData.freelancerName,
    freelancerAvatar: appData.freelancerAvatar,
    freelancerRating: appData.freelancerRating || 4.9,
    freelancerSkills: appData.freelancerSkills || ['React Native'],
    proposedPrice: Number(appData.proposedPrice) || 500,
    currency: job.currency || 'USD',
    deliveryTime: appData.deliveryTime || '7 ngày',
    coverLetter: appData.coverLetter,
    portfolioUrl: appData.portfolioUrl || '',
    status: 'pending',
    appliedAt: new Date().toISOString().split('T')[0]
  };

  applicationsList.unshift(newApp);

  // Increment application count on the job
  jobsList = jobsList.map((j) =>
    j.id === appData.jobId ? { ...j, applicationsCount: j.applicationsCount + 1 } : j
  );

  // Notify customer
  notificationsList.unshift({
    id: `notif${Date.now()}`,
    userId: appData.customerId,
    title: 'Có ứng viên mới 📩',
    message: `${appData.freelancerName} đã gửi đề xuất cho dự án "${appData.jobTitle}".`,
    type: 'applicant',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  return newApp;
};

let applicationStatusQueue = Promise.resolve();
export const updateApplicationStatus = (id, status, actorId) => {
  const result = applicationStatusQueue.then(() => changeApplicationStatus(id, status, actorId));
  applicationStatusQueue = result.catch(() => {});
  return result;
};
const changeApplicationStatus = async (id, status, actorId) => {
  await hydrateProjects();
  await delay(400);
  const application = applicationsList.find((app) => app.id === id);
  if (!application || !actorId || application.customerId !== actorId) throw new Error('Chỉ chủ dự án được duyệt ứng viên.');
  if (!['accepted', 'rejected'].includes(status)) throw new Error('Trạng thái không hợp lệ.');
  if (application.status === status) return application;
  if (application.status !== 'pending') throw new Error('Đề xuất này đã được xử lý.');
  if (status === 'accepted') {
    const project = jobsList.find((job) => job.id === application.jobId);
    if (!project || !['open', 'in_progress'].includes(project.status)) throw new Error('Dự án không thể bắt đầu.');
    // Save the accepted proposal and active project together with the chat.
    await chatStore.start({ ...application, status }, { ...project, status: 'in_progress' }, actorId);
    jobsList = jobsList.map((job) => job.id === project.id ? { ...job, status: 'in_progress' } : job);
  }
  let updatedApp = null;

  applicationsList = applicationsList.map((app) => {
    if (app.id === id) {
      updatedApp = { ...app, status };
      return updatedApp;
    }
    return app;
  });

  if (updatedApp) {
    // Notify freelancer
    notificationsList.unshift({
      id: `notif${Date.now()}`,
      userId: updatedApp.freelancerId,
      title: status === 'accepted' ? 'Đề xuất đã được duyệt! 🎉' : 'Cập nhật đề xuất',
      message: status === 'accepted' 
        ? `Đề xuất của bạn cho dự án "${updatedApp.jobTitle}" đã được duyệt!`
        : `Đề xuất của bạn cho dự án "${updatedApp.jobTitle}" đã bị từ chối.`,
      type: 'application',
      createdAt: new Date().toISOString(),
      isRead: false
    });
  }

  return updatedApp;
};

// --- CATEGORIES & PREMIUM & NOTIFICATIONS SERVICES ---
export const getCategories = async () => {
  await delay(200);
  return mockCategories;
};

export const getPremiumPlans = async () => {
  await delay(200);
  return mockPremiumPlans;
};

export const subscribePremium = async (userId, planId) => {
  await delay(600);
  const plan = mockPremiumPlans.find((p) => p.id === planId);
  
  // Update user state
  usersList = usersList.map((u) =>
    u.id === userId ? { ...u, isPremium: true, premiumPlan: plan?.name || 'PRO' } : u
  );

  notificationsList.unshift({
    id: `notif${Date.now()}`,
    userId: userId,
    title: 'Subscription Activated! 🌟',
    message: `You are now subscribed to the ${plan?.name || 'PRO'} plan. Enjoy premium features!`,
    type: 'premium',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  return { success: true, plan };
};

export const getNotifications = async (userId) => {
  await delay(300);
  return notificationsList.filter((n) => n.userId === userId || !n.userId);
};

export const markNotificationAsRead = async (id) => {
  await delay(200);
  notificationsList = notificationsList.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  return { success: true };
};
