import { useQuery } from "@tanstack/react-query";

import { axiosClient } from "@/lib/axios-client";
import { queryKeys } from "@/services/query-keys";

import { PlanItem, PlansResponse } from "./types";

export const useGetAllPlans = () => {
  return useQuery({
    queryKey: queryKeys.getPlans(),
    queryFn: async () => {
      const { data } = await axiosClient.get<PlansResponse>(
        "/billing/pricing_plan/?is_active=true&page=1&page_size=20",
      );
      // return mockPlansResponse.results.sort((a, b) => a.price - b.price);
      return (data.results || ([] as PlanItem[])).map(item => ({
        ...item,
        price: item.price || 0,
      }));
    },
  });
};

// export const mockPlansResponse: PlansResponse = {
//   count: 3,
//   total_pages: 1,
//   page: 1,
//   page_size: 20,
//   next: null,
//   previous: null,
//   results: [
//     {
//       icon: "hugeicons:rocket-01",
//       price: 20,
//       yearly_price: 220,
//       id: "basic",
//       name: "Basic",
//       description:
//         "Basic access with limited credits, suitable for trials and small usage.",
//       credits_amount: 100,
//       duration_days: 30,
//       is_active: true,
//       plan_type: "monthly",
//       min_amount: 0,
//       max_amount: 0,
//       min_credits: 0,
//       max_credits: 100,
//       status: "available",
//       features: [
//         { title: "100 credits/month", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Email support", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Community access", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Basic analytics", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Access to templates", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Webhook support", icon: "hugeicons:checkmark-badge-01" },
//       ],
//       notification_rules: { notify_on_expiry_days: 7, allow_pause: false },
//       created_at: "2025-01-01T00:00:00Z",
//       updated_at: "2025-01-05T00:00:00Z",
//     },
//     {
//       icon: "hugeicons:rocket-01",
//       badge: "Most Popular",
//       price: 29,
//       yearly_price: 290,
//       id: "professional",
//       name: "Professional",
//       description: "Full feature set for professionals and growing teams.",
//       credits_amount: 2000,
//       duration_days: 30,
//       is_active: true,
//       plan_type: "monthly",
//       min_amount: 29,
//       max_amount: 0,
//       min_credits: 1000,
//       max_credits: 5000,
//       status: "available",
//       features: [
//         { title: "2,000 credits/month", icon: "hugeicons:checkmark-badge-01" },
//         {
//           title: "Priority email support",
//           icon: "hugeicons:checkmark-badge-01",
//         },
//         { title: "Team seats", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Advanced analytics", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Custom templates", icon: "hugeicons:checkmark-badge-01" },
//         { title: "API access", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Single sign-on (SSO)", icon: "hugeicons:checkmark-badge-01" },
//         {
//           title: "Monthly usage reports",
//           icon: "hugeicons:checkmark-badge-01",
//         },
//       ],
//       notification_rules: { notify_on_expiry_days: 14, allow_pause: true },
//       created_at: "2025-01-02T00:00:00Z",
//       updated_at: "2025-01-06T00:00:00Z",
//     },
//     {
//       icon: "hugeicons:rocket-01",
//       price: 99,
//       discount_price: 79,
//       yearly_price: 930,
//       id: "enterprise",
//       name: "Enterprise",
//       description:
//         "Custom solutions, dedicated support, and highest usage limits.",
//       credits_amount: 10000,
//       duration_days: 30,
//       is_active: true,
//       plan_type: "monthly",
//       min_amount: 99,
//       max_amount: 0,
//       min_credits: 5000,
//       max_credits: 50000,
//       status: "available",
//       features: [
//         {
//           title: "10,000 credits/month",
//           icon: "hugeicons:checkmark-badge-01",
//           description: "Scalable credit options to meet your enterprise needs.",
//         },
//         {
//           title: "Dedicated account manager",
//           icon: "hugeicons:checkmark-badge-01",
//         },
//         {
//           title: "SLA & custom integrations",
//           icon: "hugeicons:checkmark-badge-01",
//         },
//         { title: "Unlimited team seats", icon: "hugeicons:checkmark-badge-01" },
//         {
//           title: "Onboarding & training",
//           icon: "hugeicons:checkmark-badge-01",
//         },
//         { title: "Custom SLA", icon: "hugeicons:checkmark-badge-01" },
//         {
//           title: "Priority phone support",
//           icon: "hugeicons:checkmark-badge-01",
//         },
//         { title: "White-labeling", icon: "hugeicons:checkmark-badge-01" },
//         { title: "Advanced security", icon: "hugeicons:checkmark-badge-01" },
//         {
//           title: "Dedicated infrastructure",
//           icon: "hugeicons:checkmark-badge-01",
//         },
//       ],
//       notification_rules: {
//         notify_on_expiry_days: 30,
//         allow_pause: true,
//         sla: "24x7",
//       },
//       created_at: "2025-01-03T00:00:00Z",
//       updated_at: "2025-01-07T00:00:00Z",
//     },
//   ],
// };
