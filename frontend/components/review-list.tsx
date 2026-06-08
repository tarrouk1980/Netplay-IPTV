'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {api, type Paginated, type Review} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';

export function ReviewList({expertId}: {expertId: number}) {
  const t = useTranslations('review');
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});

  const {data} = useQuery({
    queryKey: ['reviews', expertId],
    queryFn: async () => {
      const {data} = await api.get<Paginated<Review>>('/reviews', {params: {expert_id: expertId}});
      return data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({reviewId, expert_reply}: {reviewId: number; expert_reply: string}) => {
      const {data} = await api.post<Review>(`/reviews/${reviewId}/reply`, {expert_reply});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['reviews', expertId]});
    },
  });

  const isOwner = user?.role === 'expert' && user.expert_profile?.id === expertId;

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">{t('title')}</h2>

      {data && data.data.length === 0 && <p className="text-sm text-neutral-500">{t('noReviews')}</p>}

      <div className="space-y-3">
        {data?.data.map((review) => (
          <div key={review.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{review.client.name}</p>
              <span className="text-sm text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            </div>
            {review.comment && <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>}
            <p className="mt-2 text-xs text-neutral-400">{new Date(review.created_at).toLocaleDateString()}</p>

            {review.expert_reply && (
              <div className="mt-3 rounded-lg bg-indigo-50 p-3">
                <p className="text-xs font-medium text-indigo-700">{t('expertReplyLabel')}</p>
                <p className="mt-1 text-sm text-indigo-900">{review.expert_reply}</p>
              </div>
            )}

            {isOwner && !review.expert_reply && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyDrafts[review.id] ?? ''}
                  onChange={(e) => setReplyDrafts((prev) => ({...prev, [review.id]: e.target.value}))}
                  placeholder={t('replyPlaceholder')}
                  rows={2}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={replyMutation.isPending || !replyDrafts[review.id]?.trim()}
                  onClick={() =>
                    replyMutation.mutate({reviewId: review.id, expert_reply: replyDrafts[review.id].trim()})
                  }
                  className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {t('replySubmit')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
