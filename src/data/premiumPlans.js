// Mock Premium Subscription Plans
export const mockPremiumPlans = [
  {
    id: "plan_free",
    name: "FREE",
    price: 0,
    period: "Forever Free",
    description: "Essential job browsing & standard proposal submissions.",
    popular: false,
    badgeColor: "#64748B",
    features: [
      "Basic job browsing & search",
      "Apply up to 5 jobs per month",
      "Standard client response time",
      "Basic profile visibility"
    ]
  },
  {
    id: "plan_pro",
    name: "PRO",
    price: 19,
    period: "per month",
    description: "Boost your profile visibility and double your applications.",
    popular: true,
    badgeColor: "#4F46E5",
    features: [
      "Apply up to 30 jobs per month",
      "Highlighted proposal badge",
      "Profile boost in category search",
      "Advanced salary & budget insights",
      "Instant email & push notifications"
    ]
  },
  {
    id: "plan_premium",
    name: "PREMIUM",
    price: 49,
    period: "per month",
    description: "Maximum visibility, unlimited applications, & priority client matching.",
    popular: false,
    badgeColor: "#10B981",
    features: [
      "Unlimited job applications",
      "Top-tier Featured Profile tag",
      "Priority visibility to active customers",
      "Dedicated account manager support",
      "Advanced analytics & application tracking",
      "Verified Pro badge on profile"
    ]
  }
];
