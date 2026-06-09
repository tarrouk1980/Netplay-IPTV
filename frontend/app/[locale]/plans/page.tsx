'use client';

import {useTranslations} from 'next-intl';
import {useQuery, useMutation} from '@tanstack/react-query';
import {api} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';

type SubscriptionPlan = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  is_active: boolean;
};

type Subscription = {
  id: number;
  status: string;
  plan: SubscriptionPlan;
  current_period_end: string;
};

export default function PlansPage() {
  const t = useTranslations('plans');
  const {user} = useAuth();

  const {data: plans} = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const {data} = await api.get<SubscriptionPlan[]>('/subscription-plans');
      return data;
    },
  });

  const {data: currentSub, refetch: refetchSub} = useQuery({
    queryKey: ['my-subscription'],
    queryFn: async () => {
      const {data} = await api.get<Subscription[]>('/subscriptions');
      return data.find((s) => s.status === 'active') ?? null;
    },
    enabled: !!user,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: number) => {
      const {data} = await api.post<{checkout_url: string}>('/subscriptions/checkout', {plan_id: planId});
      return data;
    },
    onSuccess: ({checkout_url}) => {
      window.location.href = checkout_url;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (subId: number) => {
      await api.post(`/subscriptions/${subId}/cancel`);
    },
    onSuccess: () => refetchSub(),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-neutral-500">{t('subtitle')}</p>
      </div>

      {currentSub && (
        <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">
            {t('activePlan', {name: currentSub.plan.name, date: new Date(currentSub.current_period_end).toLocaleDateString()})}
          </p>
          <button
            onClick={() => cancelMutation.mutate(currentSub.id)}
            disabled={cancelMutation.isPending}
            className="mt-2 text-xs text-red-600 hover:underline disabled:opacity-50"
          >
            {t('cancelPlan')}
          </button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans?.filter((p) => p.is_active).map((plan) => {
          const isCurrent = currentSub?.plan.id === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 ${isCurrent ? 'border-indigo-400 bg-indigo-50' : 'border-neutral-200 bg-white'}`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-4 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                  {t('currentBadge')}
                </span>
              )}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.description && (
                <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>
              )}
              <p className="mt-4 text-3xl font-bold">
                {plan.price} <span className="text-base font-normal text-neutral-500">{plan.currency}/{plan.interval === 'month' ? t('month') : t('year')}</span>
              </p>

              {plan.features && plan.features.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="mt-0.5 text-emerald-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => {
                  if (!user) { window.location.href = '/login'; return; }
                  checkoutMutation.mutate(plan.id);
                }}
                disabled={isCurrent || checkoutMutation.isPending}
                className="mt-6 w-full rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isCurrent ? t('currentBadge') : t('subscribe')}
              </button>
            </div>
          );
        })}
      </div>

      {(!plans || plans.length === 0) && (
        <p className="text-center text-neutral-400">{t('noPlans')}</p>
      )}
    </div>
  );
}
