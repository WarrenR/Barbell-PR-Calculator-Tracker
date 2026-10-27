import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Android / Chrome flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
        title="Install app to your home screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow or generic install guide
  return (
    <>
      <button
        onClick={() => setShowIOSGuide(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 px-3 py-1.5 text-xs font-medium text-slate-200 transition"
        title="Add to home screen"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
                <img src="/icon.svg" alt="App Icon" className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Install Barbell PR</h3>
                <p className="text-xs text-slate-400">Add to your Home Screen for quick offline gym access</p>
              </div>
            </div>

            <div className="space-y-3 py-2 text-sm text-slate-300">
              <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <Share className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">Step 1</div>
                  <div className="text-xs text-slate-300">Tap the <strong>Share</strong> button in Safari's bottom toolbar.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <PlusSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">Step 2</div>
                  <div className="text-xs text-slate-300">Scroll down and select <strong>Add to Home Screen</strong>.</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
