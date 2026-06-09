'use client';

import {use, useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api, type Booking} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {BookingChat} from '@/components/booking-chat';
import {ReviewForm} from '@/components/review-form';
import {RescheduleModal} from '@/components/reschedule-modal';
import {VideoCall} from '@/components/video-call';

export default function BookingDetailPage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const t = useTranslations('booking');
  const tVideo = useTranslations('video');
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [videoRoom, setVideoRoom] = useState<{room_url: string; token: string} | null>(null);
  const [videoError, setVideoError] = useState('');
  const {user} = useAuth();

  const {data: booking, refetch} = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const {data} = await api.get<Booking>(`/bookings/${id}`);
      return data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post<{checkout_url: string}>(`/bookings/${id}/checkout`);
      return data;
    },
    onSuccess: ({checkout_url}) => {
      window.location.href = checkout_url;
    },
  });

  const meetingLinkMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.patch(`/bookings/${id}/meeting-link`, {meeting_link: meetingLink});
      return data;
    },
    onSuccess: () => {
      setMeetingLink('');
      refetch();
    },
  });

  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  const saveNotesMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/bookings/${id}/notes`, {expert_notes: notes});
    },
    onSuccess: () => setNotesSaved(true),
  });

  const videoRoomMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post<{room_url: string; room_name: string; token: string}>(
        `/bookings/${id}/video-room`,
      );
      return data;
    },
    onSuccess: (data) => {
      setVideoRoom({room_url: data.room_url, token: data.token});
      setVideoError('');
    },
    onError: () => {
      setVideoError('Failed to start video room. Please try again.');
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/bookings/${id}/send-invite`);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (reason: string) => {
      const {data} = await api.post(`/bookings/${id}/cancel`, {cancellation_reason: reason || null});
      return data;
    },
    onSuccess: () => {
      setShowCancelModal(false);
      setCancelReason('');
      refetch();
    },
  });

  useEffect(() => {
    if (booking && (booking as any).expert_notes != null) {
      setNotes((booking as any).expert_notes ?? '');
    }
  }, [booking]);

  if (!booking) {
    return null;
  }

  const durationHours =
    (new Date(booking.slot_datetime_end).getTime() - new Date(booking.slot_datetime_start).getTime()) /
    3600000;

  return (
    <div className="mx-auto max-w-lg">
    <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-indigo-600">
      ← {t('backToDashboard')}
    </Link>
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{booking.expert?.user.name}</h1>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
          {t(`status.${booking.status}`)}
        </span>
      </div>

      <p className="text-sm text-neutral-500">
        {new Date(booking.slot_datetime_start).toLocaleString()} —{' '}
        {new Date(booking.slot_datetime_end).toLocaleTimeString()}
      </p>

      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">{t('price')}</dt>
          <dd className="font-medium">
            {booking.price}
            {booking.expert && durationHours > 0 && (
              <span className="ml-1 text-xs font-normal text-neutral-400">
                ({durationHours}h × {booking.expert.hourly_rate} {booking.expert.currency})
              </span>
            )}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">{t('commission')}</dt>
          <dd>{booking.commission_amount}</dd>
        </div>
      </dl>

      {booking.status === 'confirmed' && booking.meeting_link && (
        <a
          href={booking.meeting_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        >
          📹 {t('joinMeeting')}
        </a>
      )}

      {(booking.status === 'confirmed' || (booking.status as string) === 'in_progress') && (
        videoRoom ? (
          <VideoCall
            roomUrl={videoRoom.room_url}
            token={videoRoom.token}
            onLeave={() => setVideoRoom(null)}
          />
        ) : (
          <>
            <button
              onClick={() => videoRoomMutation.mutate()}
              disabled={videoRoomMutation.isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              📹 {videoRoomMutation.isPending ? tVideo('connecting') : tVideo('start')}
            </button>
            {videoError && (
              <p className="mt-2 text-center text-xs text-red-600">{videoError}</p>
            )}
          </>
        )
      )}

      {booking.status === 'confirmed' && user?.role === 'expert' && (
        <button
          onClick={() => sendInviteMutation.mutate()}
          disabled={sendInviteMutation.isPending || sendInviteMutation.isSuccess}
          className="mt-4 w-full rounded-full border border-indigo-300 px-6 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
        >
          {sendInviteMutation.isSuccess ? t('inviteSent') : t('sendInvite')}
        </button>
      )}

      {booking.status === 'confirmed' && user?.role === 'expert' && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); meetingLinkMutation.mutate(); }}
        >
          <input
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder={booking.meeting_link ?? t('meetingLinkPlaceholder')}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={meetingLinkMutation.isPending}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t('meetingLinkSave')}
          </button>
        </form>
      )}

      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <button
          onClick={async () => {
            const res = await api.get(`/bookings/${id}/ics`, {responseType: 'blob'});
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `booking-${id}.ics`;
            a.click();
            window.URL.revokeObjectURL(url);
          }}
          className="mt-3 w-full rounded-full border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-700 hover:border-indigo-300"
        >
          {t('addToCalendar')}
        </button>
      )}

      {booking.status === 'pending' && (
        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={checkoutMutation.isPending}
          className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('payNow')}
        </button>
      )}

      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <button
          onClick={() => setShowReschedule(true)}
          className="mt-3 w-full rounded-full border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-700 hover:border-indigo-300"
        >
          {t('reschedule')}
        </button>
      )}

      {booking.status === 'cancelled' && booking.cancellation_reason && (
        <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
          <span className="font-medium">{t('cancelReasonLabel')}:</span> {booking.cancellation_reason}
        </p>
      )}

      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <button
          onClick={() => setShowCancelModal(true)}
          disabled={cancelMutation.isPending}
          className="mt-3 w-full rounded-full border border-red-300 px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {t('cancel')}
        </button>
      )}

      <button
        onClick={() => refetch()}
        className="mt-3 w-full rounded-full border border-neutral-300 px-6 py-2 text-sm text-neutral-600 hover:border-neutral-400"
      >
        ↻
      </button>
    </div>

    {user?.role === 'expert' && (
      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold">{t('expertNotes')}</h3>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
          placeholder={t('expertNotesPlaceholder')}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => saveNotesMutation.mutate()}
            disabled={saveNotesMutation.isPending}
            className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t('saveNotes')}
          </button>
          {notesSaved && <span className="text-xs text-emerald-600">{t('notesSaved')}</span>}
        </div>
      </div>
    )}

    {(booking.status === 'confirmed' || booking.status === 'completed') && (
      <BookingChat bookingId={id} />
    )}

    {booking.status === 'completed' && <ReviewForm bookingId={id} />}

    {showCancelModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="font-semibold">{t('cancelTitle')}</h2>
          <p className="mt-1 text-sm text-neutral-500">{t('cancelReasonHint')}</p>
          <div className="mt-4 space-y-2">
            {(t.raw('cancelReasons') as string[]).map((reason) => (
              <label key={reason} className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 hover:bg-neutral-50">
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={cancelReason === reason}
                  onChange={() => setCancelReason(reason)}
                  className="accent-indigo-600"
                />
                <span className="text-sm">{reason}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => cancelMutation.mutate(cancelReason)}
              disabled={cancelMutation.isPending}
              className="flex-1 rounded-full bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {t('cancelConfirmBtn')}
            </button>
            <button
              onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
              className="flex-1 rounded-full border border-neutral-300 py-2 text-sm hover:bg-neutral-50"
            >
              {t('cancelAbort')}
            </button>
          </div>
        </div>
      </div>
    )}

    {showReschedule && booking.expert && (
      <RescheduleModal
        bookingId={id}
        expertId={booking.expert.id}
        durationMs={
          new Date(booking.slot_datetime_end).getTime() - new Date(booking.slot_datetime_start).getTime()
        }
        onClose={() => setShowReschedule(false)}
        onSuccess={() => refetch()}
      />
    )}
    </div>
  );
}
