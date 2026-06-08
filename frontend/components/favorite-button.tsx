'use client';

import {useTranslations} from 'next-intl';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api, type ExpertProfile} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';

export function useFavoriteIds() {
  const {user} = useAuth();
  const {data} = useQuery({
    queryKey: ['favorites'],
    enabled: !!user,
    queryFn: async () => {
      const {data} = await api.get<ExpertProfile[]>('/favorites');
      return data;
    },
  });
  return new Set((data ?? []).map((e) => e.id));
}

export function FavoriteButton({expertId, isFavorited}: {expertId: number; isFavorited: boolean}) {
  const t = useTranslations('favorites');
  const {user} = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await api.delete(`/experts/${expertId}/favorite`);
      } else {
        await api.post(`/experts/${expertId}/favorite`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['favorites']});
      queryClient.invalidateQueries({queryKey: ['experts']});
      queryClient.invalidateQueries({queryKey: ['expert', expertId]});
    },
  });

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      aria-label={isFavorited ? t('remove') : t('add')}
      className={`rounded-full p-2 text-lg transition ${
        isFavorited ? 'text-rose-500' : 'text-neutral-300 hover:text-rose-400'
      }`}
    >
      {isFavorited ? '♥' : '♡'}
    </button>
  );
}
