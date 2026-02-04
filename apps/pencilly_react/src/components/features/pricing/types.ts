export interface PlansResponse {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  next: any;
  previous: any;
  results: PlanItem[];
}

export interface PlanFeatureRules {
  key: string;
  type: string;
  icon: string;
  value: any;
}

export interface PlanItem {
  //new
  icon: string;
  badge?: string;
  price: number;
  yearly_price: number;
  discount_price?: number;
  //current
  id: string;
  name: string;
  description: string;
  credits_amount: number;
  duration_days: number;
  is_active: boolean;
  plan_type: string;
  min_amount: number;
  max_amount: number;
  min_credits: number;
  max_credits: number;
  status: string;
  features: PlanFeature[];
  feature_rules: PlanFeatureRules[];
  notification_rules: NotificationRules;
  created_at: string;
  updated_at: string;
}

export interface PlanFeature {
  title: string;
  icon: string;
  description?: string;
}

export type NotificationRules = Record<string, string | number | boolean>;

export type BillingPeriod = "monthly" | "annually";
