'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Image, Video, Folder, Search, Trash2, Grid, List } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface MediaFile {
  filename: string;
  url: string;
  originalName?: string;
  type?: string;
  size?: number;
  createdAt?: string;
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch files
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/upload');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Handle file upload
  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return;

    setUploading(true);
    const newFiles: MediaFile[] = [];

    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          newFiles.push(data.file);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setFiles((prev) => [...newFiles, ...prev]);
    setUploading(false);
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

  // Delete file
  const handleDelete = async (filename: string) => {
    if (!confirm('Delete this file?')) return;
    setFiles((prev) => prev.filter((f) => f.filename !== filename));
  };

  // Copy URL to clipboard
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  // Filter files
  const filteredFiles = files.filter((f) =>
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

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
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Media Library</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your images and videos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors"
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <Upload className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
        <p className="text-lg font-medium text-[var(--color-text-primary)]">
          Drag files here or click to upload
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Supports images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, WebM)
        </p>
        {uploading && (
          <p className="text-sm text-[var(--color-accent)] mt-2">Uploading...</p>
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

      {/* File Grid/List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">Loading...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No files yet. Upload your first file!</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => {
            const Icon = getTypeIcon(file.type);
            const isImage = file.type?.startsWith('image');
            
            return (
              <div
                key={file.filename}
                onClick={() => copyUrl(file.url)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:shadow-md transition-shadow cursor-pointer"
              >
                {isImage ? (
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-12 h-12 text-[var(--color-text-muted)]" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.filename);
                    }}
                    className="p-2 bg-[var(--color-error)] text-white rounded-full hover:opacity-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Filename */}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-white truncate">{file.originalName || file.filename}</p>
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
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Size</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => {
                const Icon = getTypeIcon(file.type);
                return (
                  <tr key={file.filename} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)]">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded bg-[var(--color-bg-secondary)] flex items-center justify-center overflow-hidden">
                        {file.type?.startsWith('image') ? (
                          <img src={file.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Icon className="w-5 h-5 text-[var(--color-text-muted)]" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-primary)] truncate max-w-xs">{file.originalName || file.filename}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{formatSize(file.size)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copyUrl(file.url)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mr-2"
                        title="Copy URL"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}