'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, TrendingUp, Calendar, Filter, 
  MoreVertical, Play, Copy, Trash2, Edit3, CheckCircle, Plus 
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: string | null;
  status: string;
  mediaUrls: string[];
  tags: string[];
  createdAt: string;
}

export default function Queue() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'draft'>('all');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const statusParam = filter === 'all' ? '' : `status=${filter}`;
        const res = await fetch(`/api/db/posts?${statusParam}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [filter]);

  // Delete post
  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch(`/api/db/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Duplicate post
  const duplicatePost = async (post: Post) => {
    try {
      await fetch('/api/db/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
    } catch (error) {
      console.error('Failed to duplicate:', error);
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (selectedPosts.size === 0) return;
    if (!confirm(`Delete ${selectedPosts.size} posts?`)) return;
    
    for (const id of selectedPosts) {
      await deletePost(id);
    }
    setSelectedPosts(new Set());
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all
  const selectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((p) => p.id)));
    }
  };

  // Platform colors
  const platformColors: Record<string, string> = {
    tiktok: 'bg-pink-500',
    facebook: 'bg-blue-600',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    youtube: 'bg-red-600',
  };

  // Stats
  const stats = {
    total: posts.length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    draft: posts.filter((p) => p.status === 'draft').length,
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Post Queue</h1>
          <p className="text-text-secondary mt-1">Manage your scheduled posts</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {}}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/10 text-accent">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-text-muted">Total Posts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
              <p className="text-sm text-text-muted">Scheduled</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-sm text-text-muted">Drafts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Bulk Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-full transition-colors',
                filter === 'all' ? 'bg-accent text-white' : 'hover:bg-bg-secondary text-text-secondary'
              )}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setFilter('scheduled')}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-full transition-colors',
                filter === 'scheduled' ? 'bg-accent text-white' : 'hover:bg-bg-secondary text-text-secondary'
              )}
            >
              Scheduled
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-full transition-colors',
                filter === 'draft' ? 'bg-accent text-white' : 'hover:bg-bg-secondary text-text-secondary'
              )}
            >
              Drafts
            </button>
          </div>

          {selectedPosts.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">{selectedPosts.size} selected</span>
              <button
                onClick={bulkDelete}
                className="px-3 py-1.5 text-sm bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Post List */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-text-secondary">No posts in queue</p>
          <Button variant="primary" className="mt-4">
            Create your first post
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={selectedPosts.size === posts.length && posts.length > 0}
              onChange={selectAll}
              className="w-4 h-4 rounded border-border"
            />
            <span>Select all</span>
          </div>

          {posts.map((post) => (
            <Card
              key={post.id}
              className={clsx(
                'p-4 transition-all hover:shadow-md',
                selectedPosts.has(post.id) ? 'ring-2 ring-accent' : ''
              )}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedPosts.has(post.id)}
                  onChange={() => toggleSelect(post.id)}
                  className="mt-2 w-4 h-4 rounded border-border"
                />

                {/* Media Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-bg-secondary overflow-hidden">
                  {post.mediaUrls.length > 0 ? (
                    <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Edit3 className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Content  */}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {/* Platforms */}
                    <div className="flex gap-1">
                      {post.platforms.map((p) => (
                        <div
                          key={p}
                          className={clsx('px-2 py-0.5 text-xs rounded text-white capitalize', platformColors[p])}
                        >
                          {p}
                        </div>
                      ))}
                    </div>

                    {/* Scheduled */}
                    {post.scheduledAt ? (
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3 h-3" />
                        {format(new Date(post.scheduledAt), 'MMM d, h:mm a')}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <Edit3 className="w-3 h-3" />
                        Draft
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs bg-bg-secondary text-text-secondary rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'px-2 py-1 text-xs rounded-full',
                    post.status === 'scheduled' 
                      ? 'bg-accent/10 text-accent' 
                      : post.status === 'published'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-yellow-500/10 text-yellow-600'
                  )}>
                    {post.status}
                  </span>
                  
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}