'use client';

import {useState, useEffect} from 'react';
import {api} from '@/lib/api';

type AnnouncementData = {
  message: string;
  type?: 'info' | 'warning' | 'success';
};

const bgColors: Record<string, string> = {
  info: 'bg-indigo-600 text-white',
  warning: 'bg-amber-500 text-white',
  success: 'bg-emerald-600 text-white',
};

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/announcement').then((res) => {
      if (res.data?.announcement?.message) {
        setAnnouncement(res.data.announcement);
      }
    }).catch(() => {});
  }, []);

  if (!announcement || dismissed) return null;

  const colorClass = bgColors[announcement.type ?? 'info'];

  return (
    <div className={`relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${colorClass}`}>
      <span>{announcement.message}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 opacity-80 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
