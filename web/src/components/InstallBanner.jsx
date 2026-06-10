import { useState, useEffect } from 'react';
import { promptInstall, isInstalled } from '../utils/pwa';

const DISMISSED_KEY = 'easyhotels-install-banner-dismissed';

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInstalled()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Show banner when beforeinstallprompt fires (deferred in pwa.js)
    const handler = () => setVisible(true);
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
      color: '#fff',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      boxShadow: '0 -2px 16px rgba(0,0,0,0.18)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <span style={{ fontSize: 28 }}>📱</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
            Installez EasyHotels sur votre téléphone
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
            Accès rapide, notifications prix
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          style={{
            background: '#fff',
            color: '#FF6B35',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 12px',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
