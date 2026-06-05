'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Image, Video, Folder, Search, Trash2, Grid, List, X, Play, ExternalLink, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface MediaFile {
  id?: string;
  filename: string;
  url: string;
  originalName?: string;
  type?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
}

interface StorageInfo {
  provider: string;
  endpoint: string;
}

interface ConnectionStatus {
  connected: boolean;
  latency: number | null;
  status: 'checking' | 'online' | 'offline';
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false, latency: null, status: 'checking' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check storage connection health
  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/storage');
      if (res.ok) {
        const data = await res.json();
        setConnectionStatus({
          connected: data.health?.connected || false,
          latency: data.health?.latency || null,
          status: data.health?.connected ? 'online' : 'offline',
        });
      } else {
        setConnectionStatus({ connected: false, latency: null, status: 'offline' });
      }
    } catch {
      setConnectionStatus({ connected: false, latency: null, status: 'offline' });
    }
  }, []);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/upload');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        if (data.storage) {
          setStorageInfo(data.storage);
        }
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to load files');
        // Mark as offline if we can't reach the upload endpoint
        setConnectionStatus({ connected: false, latency: null, status: 'offline' });
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to connect to server');
      setConnectionStatus({ connected: false, latency: null, status: 'offline' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    // Check connection status periodically (every 30 seconds)
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [fetchFiles, checkConnection]);

  // Handle file upload with progress
  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return;

    // Check connection before uploading
    if (!connectionStatus.connected) {
      setError('Storage is offline. Please check your tablet connection and refresh the page.');
      return;
    }

    setUploading(true);
    setError(null);

    const filesToUpload = Array.from(fileList);

    for (const file of filesToUpload) {
      // Set initial progress
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Simulate progress (actual progress would need XMLHttpRequest)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[file.name] || 0;
            if (current < 90) {
              return { ...prev, [file.name]: current + 10 };
            }
            return prev;
          });
        }, 200);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        const data = await res.json();

        if (data.success) {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
          
          // Add to file list with delay for animation
          setTimeout(() => {
            setFiles((prev) => [{
              url: data.file.url,
              filename: data.file.key,
              originalName: data.file.originalName,
              type: data.file.type,
              mimeType: data.file.type,
              size: data.file.size,
              id: data.file.mediaAssetId,
            }, ...prev]);
          }, 300);

          // Remove progress indicator after animation
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          }, 600);
        } else {
          setError(data.error || 'Upload failed');
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }
      } catch (err) {
        console.error('Upload failed:', err);
        setError('Upload failed. Please try again.');
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }

    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-[var(--color-accent)]', 'bg-[var(--color-accent-light)]/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-[var(--color-accent)]', 'bg-[var(--color-accent-light)]/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[var(--color-accent)]', 'bg-[var(--color-accent-light)]/50');
    handleUpload(e.dataTransfer.files);
  };

  // Delete file with confirmation
  const handleDelete = async (file: MediaFile) => {
    if (deleteConfirm !== file.url) {
      setDeleteConfirm(file.url);
      return;
    }

    try {
      const res = await fetch(`/api/upload?url=${encodeURIComponent(file.url)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.url !== file.url));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete file');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete file');
    }

    setDeleteConfirm(null);
  };

  // Copy URL to clipboard
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Open video in modal
  const openVideoModal = (video: MediaFile) => {
    setSelectedVideo(video);
  };

  // Filter files
  const filteredFiles = files.filter((f) => {
    const matchesSearch = (f.originalName || f.filename).toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || f.type?.startsWith(filterType);
    return matchesSearch && matchesType;
  });

  // Get file type icon
  const getTypeIcon = (type: string | undefined) => {
    if (type?.startsWith('video')) return Video;
    return Image;
  };

  // Format file size
  const formatSize = (bytes: number | undefined) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Media Library</h1>
          <p className="text-[var(--color-text-secondary)] mt-1 flex items-center gap-2 flex-wrap">
            Manage your images and videos
            {storageInfo && (
              <span className="text-xs px-2 py-0.5 bg-[var(--color-bg-secondary)] rounded">
                {storageInfo.provider}
              </span>
            )}
            {/* Connection Status Indicator */}
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
              connectionStatus.status === 'online' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : connectionStatus.status === 'checking'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {connectionStatus.status === 'online' ? (
                <>
                  <Wifi className="w-3 h-3" />
                  Online
                  {connectionStatus.latency && ` • ${connectionStatus.latency}ms`}
                </>
              ) : connectionStatus.status === 'checking' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Offline
                </>
              )}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Type filter */}
          <div className="flex items-center bg-[var(--color-bg-secondary)] rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-sm rounded ${filterType === 'all' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${filterType === 'image' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`}
            >
              <Image className="w-4 h-4" /> Images
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${filterType === 'video' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)]'}`}
            >
              <Video className="w-4 h-4" /> Videos
            </button>
          </div>
          
          {/* View mode */}
          <div className="flex items-center bg-[var(--color-bg-secondary)] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-lg text-[var(--color-error)]">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError(null)} className="p-1 hover:bg-[var(--color-error)]/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!connectionStatus.connected) {
            setError('Storage is offline. Please check your tablet and refresh the page.');
            return;
          }
          fileInputRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative ${
          !connectionStatus.connected
            ? 'border-red-300 bg-red-50 dark:bg-red-900/10 cursor-not-allowed'
            : 'border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)]'
        }`}
      >
        {/* Offline Warning Overlay */}
        {!connectionStatus.connected && connectionStatus.status !== 'checking' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-card)]/90 rounded-xl z-10">
            <div className="text-center p-6">
              <WifiOff className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <p className="text-lg font-semibold text-red-600 mb-2">Storage Offline</p>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Your tablet storage is not connected. Please:
              </p>
              <ul className="text-sm text-[var(--color-text-secondary)] text-left list-disc list-inside space-y-1">
                <li>Make sure Garage is running on your tablet</li>
                <li>Make sure Cloudflare Tunnel is active</li>
                <li>Check that your tablet is connected to the internet</li>
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  checkConnection();
                }}
                className="mt-4 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Check Connection
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium text-[var(--color-text-primary)]">Uploading...</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {Object.keys(uploadProgress).length} file(s) in progress
            </p>
          </div>
        ) : (
          <>
            <Upload className={`w-12 h-12 mx-auto mb-4 ${!connectionStatus.connected ? 'text-gray-400' : 'text-[var(--color-text-muted)]'}`} />
            <p className={`text-lg font-medium ${!connectionStatus.connected ? 'text-gray-400' : 'text-[var(--color-text-primary)]'}`}>
              {connectionStatus.connected ? 'Drag files here or click to upload' : 'Uploads disabled - Storage Offline'}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              Supports images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, WebM)
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Max file size: 500MB for videos, 10MB for images
            </p>
          </>
        )}
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
        />
      </div>

      {/* File count */}
      <div className="text-sm text-[var(--color-text-muted)]">
        Showing {filteredFiles.length} of {files.length} files
      </div>

      {/* File Grid/List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          <div className="w-12 h-12 mx-auto border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4">Loading files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No files yet. Upload your first file!</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => {
            const Icon = getTypeIcon(file.type);
            const isImage = file.type?.startsWith('image');
            const isVideo = file.type?.startsWith('video');
            const isUploading = file.originalName && uploadProgress[file.originalName] !== undefined;
            const uploadProgressValue = file.originalName ? uploadProgress[file.originalName] : 0;
            
            return (
              <div
                key={file.url}
                className="group relative aspect-square rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Thumbnail/Preview */}
                {isImage ? (
                  <img
                    src={file.url}
                    alt={file.originalName || file.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : isVideo ? (
                  <div 
                    className="w-full h-full flex items-center justify-center bg-[var(--color-bg-tertiary)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      openVideoModal(file);
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <Play className="w-12 h-12 text-white relative z-10" />
                    {/* Video duration could be shown here */}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-12 h-12 text-[var(--color-text-muted)]" />
                  </div>
                )}
                
                {/* Upload progress overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="w-3/4">
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--color-accent)] transition-all duration-200"
                          style={{ width: `${uploadProgressValue}%` }}
                        />
                      </div>
                      <p className="text-white text-xs text-center mt-2">{uploadProgressValue}%</p>
                    </div>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {isVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openVideoModal(file);
                      }}
                      className="p-2 bg-white text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                      title="Play video"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(file.url);
                    }}
                    className="p-2 bg-white text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                    title="Copy URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      deleteConfirm === file.url 
                        ? 'bg-[var(--color-error)] text-white' 
                        : 'bg-white text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white'
                    }`}
                    title={deleteConfirm === file.url ? 'Click again to confirm' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Filename & size */}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white truncate" title={file.originalName || file.filename}>
                    {file.originalName || file.filename}
                  </p>
                  <p className="text-xs text-white/70">{formatSize(file.size)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Preview</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Size</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => {
                const Icon = getTypeIcon(file.type);
                const isImage = file.type?.startsWith('image');
                const isVideo = file.type?.startsWith('video');
                
                return (
                  <tr key={file.url} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)]">
                    <td className="px-4 py-3">
                      <div 
                        className="w-12 h-12 rounded bg-[var(--color-bg-secondary)] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80"
                        onClick={() => isVideo && openVideoModal(file)}
                      >
                        {isImage ? (
                          <img src={file.url} alt="" className="w-full h-full object-cover" />
                        ) : isVideo ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-[var(--color-bg-tertiary)]">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <Icon className="w-6 h-6 text-[var(--color-text-muted)]" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-[var(--color-text-primary)] truncate max-w-xs" title={file.originalName || file.filename}>
                        {file.originalName || file.filename}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        isVideo ? 'bg-purple-100 text-purple-700' : 
                        isImage ? 'bg-green-100 text-green-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {file.mimeType || file.type || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{formatSize(file.size)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{formatDate(file.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isVideo && (
                          <button
                            onClick={() => openVideoModal(file)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                            title="Play video"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => copyUrl(file.url)}
                          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                          title="Copy URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className={`p-2 ${
                            deleteConfirm === file.url 
                              ? 'text-white bg-[var(--color-error)]' 
                              : 'text-[var(--color-text-muted)] hover:text-[var(--color-error)]'
                          }`}
                          title={deleteConfirm === file.url ? 'Click again to confirm' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[var(--color-bg-card)] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
              <h3 className="text-white font-medium truncate">{selectedVideo.originalName || selectedVideo.filename}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Video Player */}
            <video
              src={selectedVideo.url}
              controls
              autoPlay
              className="w-full max-h-[80vh] object-contain bg-black"
            />
            
            {/* Footer */}
            <div className="p-4 bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div className="text-sm text-[var(--color-text-secondary)]">
                {formatSize(selectedVideo.size)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyUrl(selectedVideo.url)}
                  className="px-4 py-2 text-sm bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation toast */}
      {deleteConfirm && (
        <div className="fixed bottom-4 right-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg shadow-lg p-4 z-40">
          <p className="text-sm text-[var(--color-text-primary)] mb-2">Click delete again to confirm</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-secondary)]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const file = files.find((f) => f.url === deleteConfirm);
                if (file) handleDelete(file);
              }}
              className="px-4 py-2 text-sm bg-[var(--color-error)] text-white rounded-lg hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}