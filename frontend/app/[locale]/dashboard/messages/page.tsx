'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useSearchParams} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {api} from '@/lib/api';
import {Avatar} from '@/components/avatar';

type Conversation = {
  partner: {id: number; name: string; avatar_url: string | null};
  last_message: string;
  last_message_at: string;
  unread_count: number;
};

type DmMessage = {
  id: number;
  body: string;
  sender_id: number;
  sender: {id: number; name: string; avatar_url: string | null};
  read_at: string | null;
  created_at: string;
};

export default function MessagesPage() {
  const t = useTranslations('dm');
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const p = searchParams.get('partnerId');
    return p ? Number(p) : null;
  });
  const [draft, setDraft] = useState('');

  const {data: conversations} = useQuery({
    queryKey: ['dm-conversations'],
    queryFn: async () => {
      const {data} = await api.get<Conversation[]>('/dm/conversations');
      return data;
    },
  });

  const {data: thread, refetch: refetchThread} = useQuery({
    queryKey: ['dm-thread', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const {data} = await api.get<DmMessage[]>(`/dm/${selectedId}`);
      return data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post(`/dm/${selectedId}`, {body: draft});
      return data;
    },
    onSuccess: () => {
      setDraft('');
      refetchThread();
      qc.invalidateQueries({queryKey: ['dm-conversations']});
    },
  });

  const selected = conversations?.find((c) => c.partner.id === selectedId);

  return (
    <div className="flex h-[70vh] gap-4">
      <aside className="w-64 shrink-0 overflow-y-auto rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-4">
          <Link href="/dashboard" className="text-xs text-neutral-500 hover:text-indigo-600">← {t('back')}</Link>
          <h1 className="mt-1 font-semibold">{t('title')}</h1>
        </div>
        {conversations?.length === 0 && (
          <p className="p-4 text-sm text-neutral-400">{t('noConversations')}</p>
        )}
        {conversations?.map((conv) => (
          <button
            key={conv.partner.id}
            onClick={() => setSelectedId(conv.partner.id)}
            className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-neutral-50 ${selectedId === conv.partner.id ? 'bg-indigo-50' : ''}`}
          >
            <Avatar name={conv.partner.name} url={conv.partner.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium">{conv.partner.name}</p>
                {conv.unread_count > 0 && (
                  <span className="ml-1 shrink-0 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-neutral-400">{conv.last_message}</p>
            </div>
          </button>
        ))}
      </aside>

      <div className="flex flex-1 flex-col rounded-xl border border-neutral-200 bg-white">
        {!selectedId && (
          <div className="flex flex-1 items-center justify-center text-neutral-400 text-sm">
            {t('selectConversation')}
          </div>
        )}
        {selectedId && (
          <>
            <div className="flex items-center gap-3 border-b border-neutral-200 p-4">
              <Avatar name={selected?.partner.name ?? ''} url={selected?.partner.avatar_url ?? null} size="sm" />
              <p className="font-medium">{selected?.partner.name}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {thread?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id !== selectedId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                      msg.sender_id !== selectedId
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {msg.body}
                    <span className={`mt-1 block text-[10px] ${msg.sender_id !== selectedId ? 'text-indigo-200' : 'text-neutral-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-neutral-200 p-4"
              onSubmit={(e) => { e.preventDefault(); if (draft.trim()) sendMutation.mutate(); }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('typePlaceholder')}
                className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={sendMutation.isPending || !draft.trim()}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {t('send')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
