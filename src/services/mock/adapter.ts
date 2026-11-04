import type { Repository } from '../contracts';
import * as driver from './service';
import { publicUser } from '../../lib/session';

/** Typed boundary around the legacy JS mock driver. Screens never depend on its DTOs. */
export const mockRepository: Repository = {
  auth: {
    login: async (email, password) => publicUser(await driver.loginUser(email, password)),
    register: async (data) => publicUser(await driver.registerUser(data)),
    updateProfile: async (id, data) => publicUser(await driver.updateUser(id, data)),
  },
  marketplace: {
    listJobs: driver.getJobs as Repository['marketplace']['listJobs'],
    listCategories: driver.getCategories,
    listProposals: (userId, role) =>
      driver.getApplications(
        role === 'freelancer' ? { freelancerId: userId } : { customerId: userId },
      ) as ReturnType<Repository['marketplace']['listProposals']>,
    createJob: driver.createJob as Repository['marketplace']['createJob'],
    deleteJob: driver.deleteJob,
    createProposal: driver.createApplication as Repository['marketplace']['createProposal'],
    decideProposal: driver.updateApplicationStatus as Repository['marketplace']['decideProposal'],
  },
  chat: {
    list: driver.getConversations,
    send: driver.sendProjectMessage,
    markRead: driver.markConversationRead,
  },
  notifications: { list: driver.getNotifications, markRead: driver.markNotificationAsRead },
  subscriptions: {
    listPlans: driver.getPremiumPlans,
    subscribe: driver.subscribePremium as Repository['subscriptions']['subscribe'],
  },
};
