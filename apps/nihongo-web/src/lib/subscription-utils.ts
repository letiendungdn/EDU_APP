import type { Subscription, SubscriptionPlan } from '@/types/api';

export function isSubscriptionEntitled(sub: Subscription | null | undefined): boolean {
  return !!sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING');
}

/** Gói hiển thị trên UI (DB hoặc vừa mua xong, chờ webhook). */
export function resolveDisplaySubscription(
  currentSub: Subscription | null,
  pendingPlan: SubscriptionPlan | null,
): Subscription | null {
  if (currentSub && isSubscriptionEntitled(currentSub) && currentSub.plan !== 'FREE') {
    return currentSub;
  }
  if (!pendingPlan || pendingPlan === 'FREE') return null;
  return {
    id: currentSub?.id ?? 0,
    plan: pendingPlan,
    status: 'TRIALING',
    currentPeriodStart: currentSub?.currentPeriodStart ?? null,
    currentPeriodEnd: currentSub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: currentSub?.cancelAtPeriodEnd ?? false,
  };
}

export function isDisplayPlanCurrent(
  plan: SubscriptionPlan,
  currentSub: Subscription | null,
  pendingPlan: SubscriptionPlan | null,
): boolean {
  const display = resolveDisplaySubscription(currentSub, pendingPlan);
  if (!display || !isSubscriptionEntitled(display)) {
    return plan === 'FREE' && !pendingPlan;
  }
  return display.plan === plan;
}

export function isPaidSubscriptionIntent(
  clientSecret: string,
  setupIntent?: { status: string } | null,
  paymentIntent?: { status: string } | null,
): boolean {
  if (clientSecret.startsWith('seti_')) {
    return setupIntent?.status === 'succeeded';
  }
  return (
    paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing'
  );
}
