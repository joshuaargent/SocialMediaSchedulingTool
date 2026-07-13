'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Wifi, WifiOff, Clock, FolderOpen, Download } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  platform: string;
  hostname: string;
  deviceType: string;
  status: 'online' | 'offline';
  lastHeartbeat: string;
  watchFolders: Array<{ id: string; path: string }>;
  localVideoCount: number;
}

export function DeviceStatus() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    fetchDevices();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/agent');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows':
        return '🪟';
      case 'macos':
        return '🍎';
      case 'linux':
        return '🐧';
      default:
        return '💻';
    }
  };

  const formatLastSeen = (heartbeat: string) => {
    const date = new Date(heartbeat);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-4 bg-bg-secondary rounded w-24 mb-2"></div>
        <div className="h-8 bg-bg-secondary rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-text-primary" />
          <h3 className="font-semibold text-text-primary">Desktop Agent</h3>
        </div>
        <button
          onClick={() => setShowDownloadModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Agent
        </button>
      </div>

      {/* Privacy Message */}
      <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm">
        <p className="text-success font-medium flex items-center gap-2">
          <span className="text-lg">🔒</span>
          Privacy-First Publishing
        </p>
        <p className="text-text-secondary mt-1">
          Your videos stay on your computer. Never uploaded until posting time.
        </p>
      </div>

      {/* Devices List */}
      {devices.length === 0 ? (
        <div className="text-center py-6 text-text-secondary">
          <Monitor className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No devices connected</p>
          <p className="text-xs mt-1">Download the agent to enable local publishing</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div 
              key={device.id}
              className="p-4 rounded-xl bg-bg-secondary border border-border-subtle"
            >
              {/* Device Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPlatformIcon(device.platform)}</span>
                  <div>
                    <p className="font-medium text-text-primary">{device.name}</p>
                    <p className="text-xs text-text-muted capitalize">{device.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {device.status === 'online' ? (
                    <span className="flex items-center gap-1.5 text-xs text-success">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                      </span>
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <span className="h-2 w-2 rounded-full bg-text-muted"></span>
                      Offline
                    </span>
                  )}
                </div>
              </div>

              {/* Watch Folders */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                  <FolderOpen className="w-3.5 h-3.5" />
                  Watching {device.watchFolders?.length || 0} folders
                </div>
                {device.watchFolders && device.watchFolders.length > 0 && (
                  <div className="space-y-1">
                    {device.watchFolders.slice(0, 2).map((folder) => (
                      <div key={folder.id} className="text-xs font-mono text-text-secondary bg-bg-primary/50 px-2 py-1 rounded">
                        {folder.path}
                      </div>
                    ))}
                    {device.watchFolders.length > 2 && (
                      <p className="text-xs text-text-muted">+{device.watchFolders.length - 2} more</p>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Last seen {formatLastSeen(device.lastHeartbeat)}
                </span>
                {device.localVideoCount > 0 && (
                  <span>{device.localVideoCount} videos tracked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDownloadModal(false)}>
          <div className="bg-bg-primary border border-border-subtle rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Download Desktop Agent</h3>
            
            <p className="text-sm text-text-secondary mb-4">
              Download the agent for your operating system. Once installed, it will connect to your dashboard and enable local video publishing.
            </p>

            <div className="space-y-3">
              <a 
                href="#"
                className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary hover:bg-bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🪟</span>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">Windows</p>
                    <p className="text-xs text-text-muted">x64 installer</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-text-muted" />
              </a>

              <a 
                href="#"
                className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary hover:bg-bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍎</span>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">macOS</p>
                    <p className="text-xs text-text-muted">Universal (Intel & Apple Silicon)</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-text-muted" />
              </a>

              <a 
                href="#"
                className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary hover:bg-bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🐧</span>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">Linux</p>
                    <p className="text-xs text-text-muted">AppImage</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-text-muted" />
              </a>
            </div>

            <button
              onClick={() => setShowDownloadModal(false)}
              className="w-full mt-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
