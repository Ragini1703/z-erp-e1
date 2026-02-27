// Subscription Utility Functions
import { supabase } from './superbase';
import { 
  Subscription, 
  SubscriptionMetrics, 
  RenewalClient,
  SubscriptionReminder,
  SubscriptionInvoice,
  ReminderChannel 
} from './subscription-types';

/**
 * Calculate days until expiry
 */
export function calculateDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if subscription needs renewal reminder
 */
export function needsRenewalReminder(subscription: Subscription): boolean {
  const daysUntilExpiry = calculateDaysUntilExpiry(subscription.expiry_date);
  return subscription.renewal_reminder_days.includes(daysUntilExpiry);
}

/**
 * Get subscription status color
 */
export function getSubscriptionStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'trial':
      return 'bg-blue-500';
    case 'pending_renewal':
      return 'bg-amber-500';
    case 'expired':
      return 'bg-red-500';
    case 'cancelled':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Get renewal probability color
 */
export function getRenewalProbabilityColor(probability?: string): string {
  switch (probability) {
    case 'high':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-amber-600 bg-amber-50';
    case 'low':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Fetch all subscriptions
 */
export async function fetchSubscriptions(workspaceId?: string) {
  let query = supabase
    .from('subscriptions')
    .select('*, assigned_manager:users(id, full_name)');
  
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  
  const { data, error } = await query.order('expiry_date', { ascending: true });
  
  if (error) throw error;
  
  return data?.map(sub => ({
    ...sub,
    assigned_manager_name: sub.assigned_manager?.full_name,
  })) as Subscription[];
}

/**
 * Fetch subscription metrics
 */
export async function fetchSubscriptionMetrics(workspaceId?: string): Promise<SubscriptionMetrics> {
  let query = supabase.from('subscriptions').select('*');
  
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  
  const { data: subscriptions, error } = await query;
  
  if (error) throw error;
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const total = subscriptions?.length || 0;
  const active = subscriptions?.filter(s => s.status === 'active').length || 0;
  const expired = subscriptions?.filter(s => s.status === 'expired').length || 0;
  const cancelled = subscriptions?.filter(s => s.status === 'cancelled').length || 0;
  
  const upcoming = subscriptions?.filter(s => {
    const expiry = new Date(s.expiry_date);
    return s.status === 'active' && expiry >= today && expiry <= thirtyDaysFromNow;
  }).length || 0;
  
  const totalRevenue = subscriptions
    ?.filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const daysUntilExpiry = calculateDaysUntilExpiry(s.expiry_date);
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        return sum + s.subscription_amount;
      }
      return sum;
    }, 0) || 0;
  
  const mrr = subscriptions
    ?.filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
    .reduce((sum, s) => sum + s.subscription_amount, 0) || 0;
  
  const arr = subscriptions
    ?.filter(s => s.status === 'active')
    .reduce((sum, s) => {
      if (s.billing_cycle === 'yearly') return sum + s.subscription_amount;
      if (s.billing_cycle === 'monthly') return sum + (s.subscription_amount * 12);
      if (s.billing_cycle === 'quarterly') return sum + (s.subscription_amount * 4);
      return sum;
    }, 0) || 0;
  
  return {
    total_subscriptions: total,
    active_subscriptions: active,
    upcoming_renewals: upcoming,
    expired_subscriptions: expired,
    cancelled_subscriptions: cancelled,
    total_renewal_revenue: totalRevenue,
    monthly_recurring_revenue: mrr,
    yearly_recurring_revenue: arr,
    churn_rate: total > 0 ? (cancelled / total) * 100 : 0,
    growth_rate: 8.2, // This would be calculated based on historical data
  };
}

/**
 * Fetch upcoming renewals
 */
export async function fetchUpcomingRenewals(
  workspaceId?: string,
  daysThreshold: number = 30
): Promise<RenewalClient[]> {
  let query = supabase
    .from('subscriptions')
    .select('*, assigned_manager:users(id, full_name)')
    .in('status', ['active', 'pending_renewal']);
  
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  const today = new Date();
  const threshold = new Date(today.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
  
  return (data || [])
    .map(sub => {
      const daysUntil = calculateDaysUntilExpiry(sub.expiry_date);
      const expiry = new Date(sub.expiry_date);
      
      return {
        subscription_id: sub.id,
        client_name: sub.client_name,
        company_name: sub.company_name,
        service_name: sub.service_name,
        expiry_date: sub.expiry_date,
        days_until_expiry: daysUntil,
        amount: sub.subscription_amount,
        assigned_staff: sub.assigned_manager?.full_name || 'Unassigned',
        renewal_status: (sub.status === 'pending_renewal' ? 'pending' : 'contacted') as 'contacted' | 'pending' | 'confirmed' | 'cancelled',
        renewal_probability: sub.renewal_probability,
      };
    })
    .filter(r => {
      const expiry = new Date(r.expiry_date);
      return expiry >= today && expiry <= threshold;
    })
    .sort((a, b) => a.days_until_expiry - b.days_until_expiry);
}

/**
 * Create subscription
 */
export async function createSubscription(subscription: Partial<Subscription>) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([subscription])
    .select()
    .single();
  
  if (error) throw error;
  
  // Create initial reminders
  if (data) {
    await createReminderSchedule(data.id, data.expiry_date, data.renewal_reminder_days);
  }
  
  return data;
}

/**
 * Update subscription
 */
export async function updateSubscription(id: string, updates: Partial<Subscription>) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update reminders if expiry date or reminder days changed
  if (updates.expiry_date || updates.renewal_reminder_days) {
    await supabase.from('subscription_reminders').delete().eq('subscription_id', id);
    const subscription = data as Subscription;
    await createReminderSchedule(
      id,
      updates.expiry_date || subscription.expiry_date,
      updates.renewal_reminder_days || subscription.renewal_reminder_days
    );
  }
  
  return data;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  id: string,
  reason: string
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancellation_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Cancel pending reminders
  await supabase
    .from('subscription_reminders')
    .update({ status: 'failed', error_message: 'Subscription cancelled' })
    .eq('subscription_id', id)
    .eq('status', 'pending');
  
  return data;
}

/**
 * Renew subscription
 */
export async function renewSubscription(
  id: string,
  newExpiryDate: string,
  amount?: number
) {
  const { data: oldSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!oldSub) throw new Error('Subscription not found');
  
  const updates: Partial<Subscription> = {
    status: 'active',
    expiry_date: newExpiryDate,
    updated_at: new Date().toISOString(),
  };
  
  if (amount) {
    updates.subscription_amount = amount;
  }
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Create new reminder schedule
  await supabase.from('subscription_reminders').delete().eq('subscription_id', id);
  await createReminderSchedule(id, newExpiryDate, oldSub.renewal_reminder_days);
  
  // Create renewal invoice
  await createRenewalInvoice(id, amount || oldSub.subscription_amount);
  
  return data;
}

/**
 * Create reminder schedule
 */
async function createReminderSchedule(
  subscriptionId: string,
  expiryDate: string,
  reminderDays: number[]
) {
  const expiry = new Date(expiryDate);
  const reminders = reminderDays.map(days => {
    const reminderDate = new Date(expiry);
    reminderDate.setDate(reminderDate.getDate() - days);
    
    return {
      subscription_id: subscriptionId,
      reminder_date: reminderDate.toISOString(),
      days_before_expiry: days,
      channels: ['email', 'push_notification'] as ReminderChannel[],
      status: 'pending' as const,
    };
  });
  
  const { error } = await supabase
    .from('subscription_reminders')
    .insert(reminders);
  
  if (error) throw error;
}

/**
 * Send renewal reminder
 */
export async function sendRenewalReminder(
  reminderId: string,
  channels: ReminderChannel[]
) {
  // Get reminder details
  const { data: reminder } = await supabase
    .from('subscription_reminders')
    .select('*, subscription:subscriptions(*)')
    .eq('id', reminderId)
    .single();
  
  if (!reminder) throw new Error('Reminder not found');
  
  try {
    // Send via each channel
    for (const channel of channels) {
      switch (channel) {
        case 'email':
          // Send email (integrate with email service)
          console.log('Sending email reminder...');
          break;
        case 'whatsapp':
          // Send WhatsApp (integrate with WhatsApp API)
          console.log('Sending WhatsApp reminder...');
          break;
        case 'phone':
          // Log phone call task
          console.log('Creating phone call task...');
          break;
        case 'push_notification':
          // Send push notification
          console.log('Sending push notification...');
          break;
      }
    }
    
    // Mark as sent
    await supabase
      .from('subscription_reminders')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', reminderId);
    
  } catch (error) {
    // Mark as failed
    await supabase
      .from('subscription_reminders')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', reminderId);
    
    throw error;
  }
}

/**
 * Create renewal invoice
 */
async function createRenewalInvoice(subscriptionId: string, amount: number) {
  const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}`;
  
  const { error } = await supabase
    .from('subscription_invoices')
    .insert([{
      subscription_id: subscriptionId,
      invoice_number: invoiceNumber,
      amount,
      invoice_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      payment_status: 'pending',
    }]);
  
  if (error) throw error;
}

/**
 * Check and process expired subscriptions
 */
export async function processExpiredSubscriptions(workspaceId?: string) {
  let query = supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lt('expiry_date', new Date().toISOString());
  
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  
  const { data: expiredSubs, error } = await query;
  
  if (error) throw error;
  
  if (!expiredSubs || expiredSubs.length === 0) return;
  
  // Update status to expired
  const expiredIds = expiredSubs.map(s => s.id);
  await supabase
    .from('subscriptions')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .in('id', expiredIds);
  
  // Auto-suspend services if enabled
  const autoSuspendIds = expiredSubs
    .filter(s => s.auto_suspend)
    .map(s => s.id);
  
  if (autoSuspendIds.length > 0) {
    // Implement service suspension logic here
    console.log('Auto-suspending services for:', autoSuspendIds);
  }
  
  return expiredSubs;
}

/**
 * Fetch pending reminders
 */
export async function fetchPendingReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const { data, error } = await supabase
    .from('subscription_reminders')
    .select('*, subscription:subscriptions(*)')
    .eq('status', 'pending')
    .gte('reminder_date', today.toISOString())
    .lt('reminder_date', tomorrow.toISOString());
  
  if (error) throw error;
  
  return data;
}

/**
 * Generate subscription report
 */
export async function generateSubscriptionReport(
  type: 'revenue' | 'renewal' | 'expiry' | 'cancelled' | 'staff_wise',
  period: 'daily' | 'weekly' | 'monthly' | 'custom',
  startDate?: string,
  endDate?: string,
  workspaceId?: string
) {
  let query = supabase.from('subscriptions').select('*');
  
  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }
  
  // Apply date filters based on period
  const now = new Date();
  if (period === 'daily') {
    const today = new Date(now.setHours(0, 0, 0, 0));
    query = query.gte('created_at', today.toISOString());
  } else if (period === 'weekly') {
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    query = query.gte('created_at', weekAgo.toISOString());
  } else if (period === 'monthly') {
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
    query = query.gte('created_at', monthAgo.toISOString());
  } else if (period === 'custom' && startDate && endDate) {
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Process data based on report type
  let reportData: any[] = [];
  
  switch (type) {
    case 'revenue':
      reportData = processRevenueReport(data || []);
      break;
    case 'renewal':
      reportData = processRenewalReport(data || []);
      break;
    case 'expiry':
      reportData = processExpiryReport(data || []);
      break;
    case 'cancelled':
      reportData = data?.filter(s => s.status === 'cancelled') || [];
      break;
    case 'staff_wise':
      reportData = processStaffWiseReport(data || []);
      break;
  }
  
  return reportData;
}

function processRevenueReport(subscriptions: any[]) {
  const activeRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.subscription_amount, 0);
  
  return [{
    total_active_revenue: activeRevenue,
    subscriptions: subscriptions.filter(s => s.status === 'active'),
  }];
}

function processRenewalReport(subscriptions: any[]) {
  const upcoming = subscriptions.filter(s => {
    const daysUntil = calculateDaysUntilExpiry(s.expiry_date);
    return s.status === 'active' && daysUntil > 0 && daysUntil <= 30;
  });
  
  return upcoming;
}

function processExpiryReport(subscriptions: any[]) {
  return subscriptions.filter(s => s.status === 'expired');
}

function processStaffWiseReport(subscriptions: any[]) {
  const staffMap = new Map();
  
  subscriptions.forEach(sub => {
    const staffId = sub.assigned_manager_id;
    if (!staffMap.has(staffId)) {
      staffMap.set(staffId, {
        staff_id: staffId,
        total_subscriptions: 0,
        active_subscriptions: 0,
        total_revenue: 0,
      });
    }
    
    const staffData = staffMap.get(staffId);
    staffData.total_subscriptions++;
    if (sub.status === 'active') {
      staffData.active_subscriptions++;
      staffData.total_revenue += sub.subscription_amount;
    }
  });
  
  return Array.from(staffMap.values());
}
