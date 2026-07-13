import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface WatchFolder {
  id: string;
  path: string;
  recursive: boolean;
}

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduled_at: string;
  local_video?: {
    id: string;
    path: string;
    filename: string;
  };
}

interface Status {
  online: boolean;
  deviceId: string | null;
  watchFolders: WatchFolder[];
  nextPost: ScheduledPost | null;
}

function App() {
  const [status, setStatus] = useState<Status>({
    online: false,
    deviceId: null,
    watchFolders: [],
    nextPost: null,
  });
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');
  const [deviceName, setDeviceName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved state
    const savedApiUrl = localStorage.getItem('smst_api_url');
    const savedDeviceId = localStorage.getItem('smst_device_id');
    if (savedApiUrl) setApiUrl(savedApiUrl);
    if (savedDeviceId) {
      setStatus(prev => ({ ...prev, deviceId: savedDeviceId }));
      startHeartbeat();
    }

    // Get initial status
    loadStatus();

    // Heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      loadStatus();
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, []);

  const loadStatus = async () => {
    try {
      const result = await invoke<Status>('get_status');
      setStatus(result);
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  };

  const startHeartbeat = async () => {
    try {
      await invoke('send_heartbeat');
      await loadStatus();
    } catch (err) {
      console.error('Failed to send heartbeat:', err);
    }
  };

  const registerDevice = async () => {
    if (!apiUrl || !deviceName) {
      setError('Please enter both API URL and device name');
      return;
    }

    setIsRegistering(true);
    setError(null);

    try {
      const hostname = await invoke<string>('get_host_name').catch(() => 'unknown');
      const platform = await invoke<string>('get_platform').catch(() => 'unknown');

      const result = await invoke<{ device: { id: string } }>('register_device', {
        apiUrl,
        name: deviceName,
        deviceType: 'desktop',
        hostname,
        platform,
      });

      localStorage.setItem('smst_api_url', apiUrl);
      localStorage.setItem('smst_device_id', result.device.id);
      
      setStatus(prev => ({ ...prev, deviceId: result.device.id }));
      await loadStatus();
      
      // Start heartbeat interval
      setInterval(async () => {
        try {
          await invoke('send_heartbeat');
          await invoke<ScheduledPost[]>('get_scheduled_posts');
          await loadStatus();
        } catch (err) {
          console.error('Heartbeat failed:', err);
        }
      }, 30000);

    } catch (err) {
      setError(String(err));
    } finally {
      setIsRegistering(false);
    }
  };

  const addWatchFolder = async () => {
    try {
      const folder = await invoke<WatchFolder>('add_watch_folder', {
        path: '/Videos',
        recursive: false,
      });
      await loadStatus();
    } catch (err) {
      setError(String(err));
    }
  };

  const formatNextPost = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Due now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `in ${Math.floor(hours / 24)} days`;
    }
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">SMST Agent</span>
        </div>
        <div className={`status-badge ${status.online ? 'online' : 'offline'}`}>
          <span className="status-dot"></span>
          {status.online ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {!status.deviceId ? (
        <div className="setup-section">
          <h2>Connect to Dashboard</h2>
          <p className="setup-description">
            Enter your SMST dashboard URL to link this device
          </p>
          <div className="form-group">
            <label>Dashboard URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://your-dashboard.com"
            />
          </div>
          <div className="form-group">
            <label>Device Name</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="My MacBook Pro"
            />
          </div>
          <button 
            className="primary-btn"
            onClick={registerDevice}
            disabled={isRegistering}
          >
            {isRegistering ? 'Connecting...' : 'Connect Device'}
          </button>
        </div>
      ) : (
        <>
          <div className="device-info">
            <div className="info-row">
              <span className="info-label">Device ID</span>
              <span className="info-value mono">{status.deviceId?.slice(0, 12)}...</span>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h3>Watching</h3>
              <button className="add-btn" onClick={addWatchFolder}>+ Add Folder</button>
            </div>
            {status.watchFolders.length === 0 ? (
              <div className="empty-state">
                No folders configured. Click "+ Add Folder" to start watching for videos.
              </div>
            ) : (
              <div className="folder-list">
                {status.watchFolders.map((folder) => (
                  <div key={folder.id} className="folder-item">
                    <span className="folder-icon">📁</span>
                    <span className="folder-path">{folder.path}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section">
            <div className="section-header">
              <h3>Next Post</h3>
            </div>
            {status.nextPost ? (
              <div className="next-post-card">
                <div className="post-time">
                  {formatNextPost(status.nextPost.scheduled_at)}
                </div>
                <div className="post-content">
                  {status.nextPost.content.slice(0, 80)}
                  {status.nextPost.content.length > 80 ? '...' : ''}
                </div>
                <div className="post-platforms">
                  {status.nextPost.platforms.map((p) => (
                    <span key={p} className="platform-badge">{p}</span>
                  ))}
                </div>
                {status.nextPost.local_video && (
                  <div className="video-file">
                    📹 {status.nextPost.local_video.filename}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                No scheduled posts for this device
              </div>
            )}
          </div>
        </>
      )}

      <footer className="footer">
        <span>Your videos stay on your computer</span>
      </footer>
    </div>
  );
}

export default App;
