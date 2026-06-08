'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useMutation, useQuery} from '@tanstack/react-query';
import {api, type AvailabilitySlot} from '@/lib/api';

function nextSlotOccurrences(slot: AvailabilitySlot, count: number): Date[] {
  const [hours, minutes] = slot.start_time.split(':').map(Number);
  const occurrences: Date[] = [];
  const now = new Date();

  if (slot.specific_date) {
    const d = new Date(`${slot.specific_date}T00:00:00`);
    d.setHours(hours, minutes, 0, 0);
    if (d > now) occurrences.push(d);
    return occurrences;
  }

  if (slot.day_of_week === null || !slot.is_recurring) {
    return occurrences;
  }

  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  while (d.getDay() !== slot.day_of_week || d <= now) {
    d.setDate(d.getDate() + 1);
  }
  for (let i = 0; i < count; i++) {
    occurrences.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return occurrences;
}

export function RescheduleModal({
  bookingId,
  expertId,
  durationMs,
  onClose,
  onSuccess,
}: {
  bookingId: string;
  expertId: number;
  durationMs: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations('booking');
  const tc = useTranslations('common');
  const [selected, setSelected] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {data: slots} = useQuery({
    queryKey: ['availability-slots', expertId],
    queryFn: async () => {
      const {data} = await api.get<AvailabilitySlot[]>('/availability-slots', {params: {expert_id: expertId}});
      return data;
    },
  });

  const occurrences = (slots ?? [])
    .flatMap((slot) => nextSlotOccurrences(slot, 4))
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, 12);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      const end = new Date(selected.getTime() + durationMs);
      const {data} = await api.post(`/bookings/${bookingId}/reschedule`, {
        slot_datetime_start: selected.toISOString(),
        slot_datetime_end: end.toISOString(),
      });
      return data;
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: () => setError(t('rescheduleError')),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('rescheduleTitle')}</h2>

        {occurrences.length === 0 && <p className="text-sm text-neutral-500">{t('selectNewSlot')}</p>}

        <div className="grid grid-cols-2 gap-2">
          {occurrences.map((d) => (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => setSelected(d)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                selected?.getTime() === d.getTime()
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-neutral-300 hover:border-indigo-300'
              }`}
            >
              {d.toLocaleString()}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:border-neutral-400"
          >
            {tc('cancel')}
          </button>
          <button
            type="button"
            disabled={!selected || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t('rescheduleConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
