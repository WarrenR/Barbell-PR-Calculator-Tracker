import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm border border-amber-500">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Gym Mode — Local storage active</span>
    </div>
  );
};
