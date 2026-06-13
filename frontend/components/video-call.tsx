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
    setConnecting(true);
    setStarted(true);
    await new Promise((r) => setTimeout(r, 100));

    try {
      const DailyIframe = (await import('@daily-co/daily-js')).default;
      const frame = DailyIframe.createFrame(containerRef.current!, {
        iframeStyle: {position:'absolute',top:'0',left:'0',width:'100%',height:'100%',border:'none',borderRadius:'12px'},
        showLeaveButton: false,
        showFullscreenButton: true,
      });
      frameRef.current = frame;
      frame.on('joining-meeting', () => setConnecting(true));
      frame.on('joined-meeting', (e: any) => {setConnecting(false);setJoined(true);setParticipantCount(Object.keys(e?.participants??{}).length);});
      frame.on('participant-joined', () => setParticipantCount((c) => c + 1));
      frame.on('participant-left', () => setParticipantCount((c) => Math.max(0, c - 1)));
      frame.on('left-meeting', () => {setJoined(false);setStarted(false);onLeave();});
      frame.on('error', () => setConnecting(false));
      await frame.join({url: roomUrl});
    } catch (err: any) {
      console.error('Daily error:', JSON.stringify(err), err);
      setConnecting(false);
      setStarted(false);
    }
  };

  const toggleAudio = () => {frameRef.current?.setLocalAudio(audioMuted);setAudioMuted(!audioMuted);};
  const toggleVideo = () => {frameRef.current?.setLocalVideo(videoMuted);setVideoMuted(!videoMuted);};
  const hangUp = () => {frameRef.current ? frameRef.current.leave() : onLeave();};

  useEffect(() => () => {frameRef.current?.destroy();}, []);

  return (
    <div className="mt-4">
      {!started && (
        <button onClick={startCall} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700">
          📹 {t('join')}
        </button>
      )}

      <div style={{display: started ? 'block' : 'none'}} className="rounded-xl border border-indigo-200 overflow-hidden">
        {joined && (
          <div className="flex items-center justify-between px-4 py-2 bg-indigo-600 text-white text-xs">
            <span>{t('joined')}</span><span>👥 {participantCount}</span>
          </div>
        )}
        <div className="relative w-full" style={{paddingBottom:'56.25%',minHeight:'280px'}}>
          <div ref={containerRef} className="absolute inset-0" />
          {connecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-indigo-50">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          )}
        </div>
        {joined && (
          <div className="flex items-center justify-center gap-3 p-3 bg-white border-t border-indigo-100">
            <button onClick={toggleAudio} className={`rounded-lg px-3 py-2 text-xs font-medium ${audioMuted?'bg-red-100 text-red-600':'bg-neutral-100 text-neutral-700'}`}>
              {audioMuted ? '🔇 '+t('unmute') : '🎙️ '+t('mute')}
            </button>
            <button onClick={toggleVideo} className={`rounded-lg px-3 py-2 text-xs font-medium ${videoMuted?'bg-red-100 text-red-600':'bg-neutral-100 text-neutral-700'}`}>
              {videoMuted ? '📵 '+t('camera') : '📷 '+t('noCamera')}
            </button>
            <button onClick={hangUp} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white">
              📵 {t('end')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}