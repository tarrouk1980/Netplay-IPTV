'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api';

export function ReviewForm({bookingId}: {bookingId: string}) {
  const t = useTranslations('review');
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = useMutation({
    mutationFn: async () => {
      await api.post(`/bookings/${bookingId}/review`, {rating, comment: comment || undefined});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['booking', bookingId]});
    },
  });

  if (submit.isSuccess) {
    return (
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        {t('thanks')}
      </div>
    );
  }

  const alreadyReviewed = (submit.error as {response?: {status?: number}} | undefined)?.response?.status === 409;

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">{t('leaveReview')}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
        className="space-y-3"
      >
        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('rating')}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setRating(value)}
                className={`text-2xl ${value <= rating ? 'text-amber-500' : 'text-neutral-300'}`}
                aria-label={`${value}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('comment')}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('commentPlaceholder')}
            rows={3}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {alreadyReviewed && <p className="text-xs text-red-600">{t('alreadyReviewed')}</p>}

        <button
          type="submit"
          disabled={submit.isPending}
          className="w-full rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('submit')}
        </button>
      </form>
    </div>
  );
}
