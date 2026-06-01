'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, TrendingUp, Calendar, Filter, 
  MoreVertical, Play, Copy, Trash2, Edit3, CheckCircle, Plus 
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post Queue</h1>
          <p className="text-gray-500 mt-1">Manage your scheduled posts</p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Edit3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-sm text-gray-500">Drafts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === 'draft' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            Drafts
          </button>
        </div>

        {selectedPosts.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedPosts.size} selected</span>
            <button
              onClick={bulkDelete}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Post List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No posts in queue</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={selectedPosts.size === posts.length && posts.length > 0}
              onChange={selectAll}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span>Select all</span>
          </div>

          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                selectedPosts.has(post.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedPosts.has(post.id)}
                  onChange={() => toggleSelect(post.id)}
                  className="mt-2 w-4 h-4 rounded border-gray-300"
                />

                {/* Media Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                  {post.mediaUrls.length > 0 ? (
                    <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Edit3 className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Content  */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    {/* Platforms */}
                    <div className="flex gap-1">
                      {post.platforms.map((p) => (
                        <div
                          key={p}
                          className={`px-2 py-0.5 text-xs rounded text-white capitalize ${platformColors[p] || 'bg-gray-400'}`}
                        >
                          {p}
                        </div>
                      ))}
                    </div>

                    {/* Scheduled */}
                    {post.scheduledAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {format(new Date(post.scheduledAt), 'MMM d, h:mm a')}
                      </div>
                    ) || (
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
                        <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.status === 'scheduled' 
                      ? 'bg-blue-100 text-blue-700' 
                      : post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {post.status}
                  </span>
                  
                  <Link
                    href={`/dashboard?edit=${post.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}