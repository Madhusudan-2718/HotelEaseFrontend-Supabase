import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { BeforeInstallPromptEvent, setupInstallPrompt, isStandalone } from '../utils/pwa';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) {
      return;
    }

    setupInstallPrompt((event) => {
      setDeferredPrompt(event);
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-lg shadow-2xl p-6 border border-[#FFD700]">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-[#2D2D2D]" />
          </div>
          <div className="flex-1">
            <h3 className="font-playfair mb-2" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
              Install HotelEase
            </h3>
            <p className="text-gray-600 mb-4" style={{ fontSize: '0.875rem' }}>
              Install our app for quick access to our services and a better experience.
            </p>
            <Button
              onClick={handleInstall}
              className="w-full bg-[#6B8E23] text-white hover:bg-[#6B8E23]/90"
            >
              Install App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
