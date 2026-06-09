'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api} from '@/lib/api';

type Ticket = {
  id: number;
  subject: string;
  body: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export default function SupportPage() {
  const t = useTranslations('support');
  const qc = useQueryClient();
  const [form, setForm] = useState({subject: '', body: ''});
  const [success, setSuccess] = useState(false);

  const {data: tickets} = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const {data} = await api.get<Ticket[]>('/support-tickets');
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post('/support-tickets', form);
      return data;
    },
    onSuccess: () => {
      setForm({subject: '', body: ''});
      setSuccess(true);
      qc.invalidateQueries({queryKey: ['support-tickets']});
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const statusColor: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-neutral-100 text-neutral-600',
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-indigo-600">
          ← {t('back')}
        </Link>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </div>

      <form
        className="rounded-xl border border-neutral-200 bg-white p-6"
        onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(); }}
      >
        <h2 className="mb-4 font-medium">{t('newTicket')}</h2>
        <div className="space-y-3">
          <input
            required
            value={form.subject}
            onChange={(e) => setForm((f) => ({...f, subject: e.target.value}))}
            placeholder={t('subjectPlaceholder')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <textarea
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm((f) => ({...f, body: e.target.value}))}
            placeholder={t('bodyPlaceholder')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {success && <p className="mt-2 text-sm text-green-600">{t('ticketSent')}</p>}
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="mt-4 w-full rounded-full bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('submit')}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        <h2 className="font-semibold">{t('myTickets')}</h2>
        {tickets?.length === 0 && <p className="text-sm text-neutral-500">{t('noTickets')}</p>}
        {tickets?.map((ticket) => (
          <div key={ticket.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm">{ticket.subject}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[ticket.status] ?? 'bg-neutral-100'}`}>
                {t(`status.${ticket.status}`)}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{ticket.body}</p>
            {ticket.admin_reply && (
              <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">
                <p className="mb-1 text-xs font-semibold text-indigo-500">{t('adminReply')}</p>
                {ticket.admin_reply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
