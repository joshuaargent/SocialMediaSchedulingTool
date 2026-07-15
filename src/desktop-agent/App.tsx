import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';

interface Video {
  id: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  status: 'available' | 'scheduled' | 'published';
  thumbnail?: string;
  scheduledFor?: string;
}

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: string;
  videoFilename?: string;
}

interface AppStatus {
  online: boolean;
  deviceId: string | null;
  videos: Video[];
  nextPost: ScheduledPost | null;
  folderPath: string;
  lastSync: string;
}

function App() {
  const [status, setStatus] = useState<AppStatus>({
    online: false,
    deviceId: null,
    videos: [],
    nextPost: null,
    folderPath: '',
    lastSync: '',
  });
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');
  const [deviceName, setDeviceName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSavedState();
    setupListeners();
    
    // Refresh status every 10 seconds
    const interval = setInterval(() => {
      refreshStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadSavedState = async () => {
    const savedApiUrl = localStorage.getItem('smst_api_url');
    const savedDeviceId = localStorage.getItem('smst_device_id');
    
    if (savedApiUrl) setApiUrl(savedApiUrl);
    
    if (savedDeviceId) {
      await refreshStatus();
    }
  };

  const setupListeners = async () => {
    // Listen for file changes from Rust backend
    await listen('videos-changed', (event: any) => {
      refreshStatus();
    });
  };

  const refreshStatus = async () => {
    try {
      const result = await invoke<AppStatus>('get_status');
      setStatus(result);
    } catch (err) {
      console.error('Failed to load status:', err);
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
      const result = await invoke<{ device: { id: string } }>('register_device', {
        apiUrl,
        name: deviceName,
      });

      localStorage.setItem('smst_api_url', apiUrl);
      localStorage.setItem('smst_device_id', result.device.id);
      
      await refreshStatus();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsRegistering(false);
    }
  };

  const openFolder = async () => {
    try {
      await invoke('open_videos_folder');
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  };

  const addFiles = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{
          name: 'Videos',
          extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm']
        }]
      });
      
      if (selected) {
        const files = Array.isArray(selected) ? selected : [selected];
        setSyncing(true);
        for (const file of files) {
          await invoke('add_video_file', { path: file });
        }
        await refreshStatus();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSyncing(false);
    }
  };

  const deleteVideo = async (video: Video) => {
    if (!confirm(`Delete "${video.filename}"? This cannot be undone.`)) return;
    
    try {
      await invoke('delete_video', { videoId: video.id });
      await refreshStatus();
    } catch (err) {
      setError(String(err));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatScheduled = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
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

  const getVideoIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp4': return '📹';
      case 'mov': return '🎬';
      case 'avi': return '🎥';
      case 'mkv': return '🎬';
      default: return '📁';
    }
  };

  const getStatusBadge = (video: Video) => {
    switch (video.status) {
      case 'scheduled':
        return <span className="status-badge scheduled">📅 Scheduled</span>;
      case 'published':
        return <span className="status-badge published">✅ Posted</span>;
      default:
        return <span className="status-badge available">🟢 Ready</span>;
    }
  };

  // Setup drag and drop handlers
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };
    
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      
      setSyncing(true);
      for (const file of Array.from(files)) {
        // In Tauri, we need the path - this is simplified
        // Real implementation would use the file path
        console.log('Dropped file:', file.name);
      }
      await refreshStatus();
      setSyncing(false);
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Setup page
  if (!status.deviceId) {
    return (
      <div className="container">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">SMST Agent</span>
          </div>
        </header>

        <div className="setup-card">
          <h2>Connect to Dashboard</h2>
          <p className="setup-desc">
            Link this device to your SMST dashboard to enable local video publishing.
          </p>
          
          <div className="form-group">
            <label>Dashboard URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://your-app.vercel.app"
            />
          </div>
          
          <div className="form-group">
            <label>Device Name</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="My Desktop PC"
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button 
            className="btn-primary"
            onClick={registerDevice}
            disabled={isRegistering}
          >
            {isRegistering ? 'Connecting...' : 'Connect Device'}
          </button>
        </div>

        <div className="privacy-note">
          <span>🔒</span>
          <span>Your videos never leave this computer</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">SMST Agent</span>
        </div>
        <div className="header-right">
          <div className={`connection-status ${status.online ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            {status.online ? 'Connected' : 'Offline'}
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* Video Library Section */}
      <section className="section">
        <div className="section-header">
          <h3>📁 Your Videos</h3>
          <div className="header-actions">
            <button className="btn-icon" onClick={openFolder} title="Open folder">
              📂
            </button>
            <button className="btn-secondary" onClick={addFiles} disabled={syncing}>
              {syncing ? 'Syncing...' : '+ Add Videos'}
            </button>
          </div>
        </div>

        {/* Drop Zone */}
        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            // Handle drop - would need Tauri file handling
          }}
        >
          <span className="drop-icon">📥</span>
          <span className="drop-text">Drop videos here</span>
          <span className="drop-hint">or click "+ Add Videos"</span>
        </div>

        {/* Video Grid */}
        {status.videos.length === 0 ? (
          <div className="empty-videos">
            <span className="empty-icon">🎬</span>
            <p>No videos yet</p>
            <p className="empty-hint">Add videos to schedule posts</p>
          </div>
        ) : (
          <div className="video-grid">
            {status.videos.map((video) => (
              <div key={video.id} className="video-card">
                <div className="video-preview">
                  <span className="video-icon">{getVideoIcon(video.filename)}</span>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteVideo(video)}
                    title="Delete video"
                  >
                    ×
                  </button>
                </div>
                <div className="video-info">
                  <p className="video-name" title={video.filename}>
                    {video.filename.length > 20 
                      ? video.filename.slice(0, 17) + '...' 
                      : video.filename}
                  </p>
                  <p className="video-size">{formatFileSize(video.size)}</p>
                  {getStatusBadge(video)}
                  {video.scheduledFor && (
                    <p className="video-scheduled">
                      📅 {formatScheduled(video.scheduledFor)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h3>Ready to schedule?</h3>
          <p>Go to your dashboard to create posts with these videos</p>
          <button className="btn-primary" onClick={() => window.open(apiUrl, '_blank')}>
            Open Dashboard →
          </button>
        </div>
      </section>

      {/* Status Bar */}
      <footer className="status-bar">
        <div className="status-left">
          <span className={`status-indicator ${status.online ? 'online' : 'offline'}`}>
            ●
          </span>
          <span>{status.videos.filter(v => v.status === 'available').length} videos ready</span>
        </div>
        <div className="status-right">
          {status.lastSync && <span>Synced {formatTime(status.lastSync)}</span>}
        </div>
      </footer>
    </div>
  );
}

export default App;
