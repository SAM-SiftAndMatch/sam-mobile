export const ROUTES = {
  Home: '/',
  Jobs: '/jobs',
  Applications: '/applications',
  MyPosts: '/projects',
  Profile: '/profile',
  CreatePost: '/create-project',
  JobDetail: '/job-detail',
  ApplyJob: '/apply',
  Premium: '/premium',
  PremiumPlanDetail: '/premium-detail',
  Notifications: '/notifications',
  Login: '/login',
  Register: '/register',
  ForgotPassword: '/forgot-password',
  Splash: '/welcome',
  Messages: '/messages',
  Workspace: '/workspace',
  Finance: '/finance',
  Maintenance: '/maintenance',
} as const;
export type ScreenName = keyof typeof ROUTES;
export function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Legacy screen props are translated once; full records never go into URLs. */
export function screenDestination(name: ScreenName, params: Record<string, unknown> = {}) {
  if (!Object.hasOwn(ROUTES, name)) throw new Error(`Unknown screen: ${name}`);
  const { job, plan, ...rest } = params;
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (typeof value === 'string' || typeof value === 'number') values[key] = String(value);
  }
  if (job && typeof job === 'object' && 'id' in job && typeof job.id === 'string')
    values.jobId = job.id;
  if (plan && typeof plan === 'object' && 'id' in plan && typeof plan.id === 'string')
    values.planId = plan.id;
  return { pathname: ROUTES[name], params: values };
}
