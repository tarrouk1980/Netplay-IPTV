'use client';

import {useTranslations} from 'next-intl';
import {useQuery} from '@tanstack/react-query';
import {api, type Paginated, type Review} from '@/lib/api';

export function ReviewList({expertId}: {expertId: number}) {
  const t = useTranslations('review');

  const {data} = useQuery({
    queryKey: ['reviews', expertId],
    queryFn: async () => {
      const {data} = await api.get<Paginated<Review>>('/reviews', {params: {expert_id: expertId}});
      return data;
    },
  });

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
          </div>
        ))}
      </div>
    </div>
  );
}
