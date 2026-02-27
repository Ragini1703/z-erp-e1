// Subscription Management Types

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending_renewal' | 'trial';

export type SubscriptionType = 
  | 'saas_subscription'
  | 'website_amc'
  | 'website_hosting'
  | 'social_media_management'
  | 'domain'
  | 'server';

export type ReminderChannel = 'phone' | 'email' | 'whatsapp' | 'push_notification';

export type ReminderStatus = 'pending' | 'sent' | 'failed';

export type RenewalProbability = 'high' | 'medium' | 'low';

export interface Subscription {
  id: string;
  client_name: string;
  company_name: string;
  service_name: string;
  subscription_type: SubscriptionType;
  start_date: string;
  expiry_date: string;
  billing_cycle: BillingCycle;
  subscription_amount: number;
  renewal_reminder_days: number[];
  assigned_manager_id: string;
  assigned_manager_name?: string;
  status: SubscriptionStatus;
  auto_renew: boolean;
  auto_suspend: boolean;
  renewal_probability?: RenewalProbability;
  cancellation_reason?: string;
  cancellation_date?: string;
  notes?: string;
  client_email?: string;
  client_phone?: string;
  client_whatsapp?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  workspace_id?: string;
}

export interface SubscriptionReminder {
  id: string;
  subscription_id: string;
  reminder_date: string;
  days_before_expiry: number;
  channels: ReminderChannel[];
  status: ReminderStatus;
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export interface SubscriptionInvoice {
  id: string;
  subscription_id: string;
  invoice_number: string;
  amount: number;
  invoice_date: string;
  due_date: string;
  payment_status: 'paid' | 'pending' | 'overdue';
  payment_date?: string;
  payment_method?: string;
  created_at: string;
}

export interface SubscriptionMetrics {
  total_subscriptions: number;
  active_subscriptions: number;
  upcoming_renewals: number;
  expired_subscriptions: number;
  cancelled_subscriptions: number;
  total_renewal_revenue: number;
  monthly_recurring_revenue: number;
  yearly_recurring_revenue: number;
  churn_rate: number;
  growth_rate: number;
}

export interface RenewalClient {
  subscription_id: string;
  client_name: string;
  company_name: string;
  service_name: string;
  expiry_date: string;
  days_until_expiry: number;
  amount: number;
  assigned_staff: string;
  renewal_status: 'contacted' | 'pending' | 'confirmed' | 'cancelled';
  last_contact_date?: string;
  renewal_probability?: RenewalProbability;
}

export interface SubscriptionReport {
  type: 'revenue' | 'renewal' | 'expiry' | 'cancelled' | 'staff_wise';
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  start_date?: string;
  end_date?: string;
  data: any[];
}

export interface SubscriptionFormData {
  client_name: string;
  company_name: string;
  service_name: string;
  subscription_type: SubscriptionType;
  start_date: string;
  expiry_date: string;
  billing_cycle: BillingCycle;
  subscription_amount: number;
  renewal_reminder_days: number[];
  assigned_manager_id: string;
  status: SubscriptionStatus;
  auto_renew: boolean;
  auto_suspend: boolean;
  client_email?: string;
  client_phone?: string;
  client_whatsapp?: string;
  notes?: string;
}

export interface NotificationRecipient {
  type: 'client' | 'staff' | 'team_leader' | 'manager' | 'admin';
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
}

export const SUBSCRIPTION_TYPE_LABELS: Record<SubscriptionType, string> = {
  saas_subscription: 'SaaS Subscription',
  website_amc: 'Website AMC',
  website_hosting: 'Website Hosting',
  social_media_management: 'Social Media Management',
  domain: 'Domain Subscription',
  server: 'Server Subscription',
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  cancelled: 'Cancelled',
  pending_renewal: 'Pending Renewal',
  trial: 'Trial',
};

export const DEFAULT_REMINDER_DAYS = [30, 15, 7, 1, 0];
