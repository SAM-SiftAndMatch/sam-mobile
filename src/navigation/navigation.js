import { router } from 'expo-router';

const paths = { Home: '/', Jobs: '/jobs', Applications: '/applications', MyPosts: '/projects', Profile: '/profile', CreatePost: '/create-project', JobDetail: '/job-detail', ApplyJob: '/apply', Premium: '/premium', PremiumPlanDetail: '/premium-detail', Notifications: '/notifications', Login: '/login', Register: '/register', ForgotPassword: '/forgot-password', Splash: '/welcome', Messages: '/messages', Workspace: '/workspace' };
export const screenNavigation = {
  navigate(name, params = {}) {
    const { job, plan, ...rest } = params;
    router.navigate({ pathname: paths[name] || '/home', params: { ...rest, ...(job ? { jobId: job.id } : {}), ...(plan ? { planId: plan.id } : {}) } });
  },
  goBack() { if (router.canGoBack()) router.back(); else router.replace('/'); },
};
