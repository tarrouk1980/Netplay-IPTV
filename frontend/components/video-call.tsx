'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';

interface VideoCallProps {
  roomUrl: string;
  token: string;
  onLeave: () => void;
}

export function VideoCall({roomUrl, token, onLeave}: VideoCallProps) {
  const t = useTranslations('video');
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<any>(null);
  const [started, setStarted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  const startCall = async () => {
    if (!containerRef.current) return;
    setConnecting(true);
    setStarted(true);

    const DailyIframe = (await import('@daily-co/daily-js')).default;

    const frame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '12px',
      },
      showLeaveButton: false,
      showFullscreenButton: true,
    });

    frameRef.current = frame;

    frame.on('joining-meeting', () => setConnecting(true));
    frame.on('joined-meeting', (event: any) => {
      setConnecting(false);
      setJoined(true);
      setParticipantCount(Object.keys(event?.participants ?? {}).length);
    });
    frame.on('participant-joined', () =>
      setParticipantCount((c) => c + 1),
    );
    frame.on('participant-left', () =>
      setParticipantCount((c) => Math.max(0, c - 1)),
    );
    frame.on('left-meeting', () => {
      setJoined(false);
      setStarted(false);
      onLeave();
    });
    frame.on('error', () => {
      setConnecting(false);
    });

    await frame.join({url: roomUrl, token});
  };

  const toggleAudio = () => {
    if (!frameRef.current) return;
    frameRef.current.setLocalAudio(audioMuted);
    setAudioMuted(!audioMuted);
  };

  const toggleVideo = () => {
    if (!frameRef.current) return;
    frameRef.current.setLocalVideo(videoMuted);
    setVideoMuted(!videoMuted);
  };

  const hangUp = () => {
    if (frameRef.current) {
      frameRef.current.leave();
    } else {
      onLeave();
    }
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        frameRef.current.destroy();
      }
    };
  }, []);

  if (!started) {
    return (
      <button
        onClick={startCall}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 active:scale-95 transition-transform"
      >
        📹 {t('join')}
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-indigo-600 text-white text-xs">
        <span className="font-medium">
          {connecting ? t('connecting') : joined ? t('joined') : ''}
        </span>
        {joined && (
          <span>
            👥 {participantCount}
          </span>
        )}
      </div>

      {/* Daily iframe container */}
      <div className="relative w-full" style={{paddingBottom: '56.25%', minHeight: '280px'}}>
        <div ref={containerRef} className="absolute inset-0" />
        {connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-50">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <span className="text-sm text-indigo-600">{t('connecting')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {joined && (
        <div className="flex items-center justify-center gap-3 p-3 bg-white border-t border-indigo-100">
          <button
            onClick={toggleAudio}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              audioMuted
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <span className="text-lg">{audioMuted ? '🔇' : '🎙️'}</span>
            {audioMuted ? t('unmute') : t('mute')}
          </button>

          <button
            onClick={toggleVideo}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              videoMuted
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <span className="text-lg">{videoMuted ? '📵' : '📷'}</span>
            {videoMuted ? t('camera') : t('noCamera')}
          </button>

          <button
            onClick={hangUp}
            className="flex flex-col items-center gap-0.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 transition-colors"
          >
            <span className="text-lg">📵</span>
            {t('end')}
          </button>
        </div>
      )}
    </div>
  );
}
