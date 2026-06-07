'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api, type Message} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';

export function BookingChat({bookingId}: {bookingId: string}) {
  const t = useTranslations('messaging');
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');

  const {data} = useQuery({
    queryKey: ['booking-messages', bookingId],
    queryFn: async () => {
      const {data} = await api.get<Message[]>(`/bookings/${bookingId}/messages`);
      return data;
    },
    refetchInterval: 5000,
  });

  const send = useMutation({
    mutationFn: async () => {
      const {data} = await api.post<Message>(`/bookings/${bookingId}/messages`, {body});
      return data;
    },
    onSuccess: () => {
      setBody('');
      queryClient.invalidateQueries({queryKey: ['booking-messages', bookingId]});
    },
  });

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">{t('title')}</h2>

      {data && data.length === 0 && <p className="text-sm text-neutral-500">{t('empty')}</p>}

      <div className="max-h-80 space-y-2 overflow-y-auto">
        {data?.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              message.sender_id === user?.id
                ? 'ml-auto bg-indigo-600 text-white'
                : 'bg-neutral-100 text-neutral-800'
            }`}
          >
            <p>{message.body}</p>
            <p className={`mt-1 text-[10px] ${message.sender_id === user?.id ? 'text-indigo-200' : 'text-neutral-400'}`}>
              {new Date(message.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) send.mutate();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={send.isPending}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('send')}
        </button>
      </form>

      {send.isError && (
        <p className="mt-2 text-xs text-red-600">{t('unavailable')}</p>
      )}
    </div>
  );
}
