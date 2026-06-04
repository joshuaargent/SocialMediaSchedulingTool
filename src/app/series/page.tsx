'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, MoreVertical, Film, Edit3, Trash2, 
  ChevronLeft, ChevronRight, X, Play, RefreshCw
} from 'lucide-react';
import { usePostsStore, usePlatformStore } from '@/stores';

interface Series {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  color: string;
  sortOrder: number;
  contentProjects: { id: string; title: string; status: string; thumbnailUrl: string | null }[];
}

export default function SeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Get posts from store
  const posts = usePostsStore((s) => s.posts);
  const connections = usePlatformStore((s) => s.connections);
  
  // Fetch series from API
  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      try {
        // Try to fetch from API first
        const response = await fetch('/api/db/series');
        if (response.ok) {
          const data = await response.json();
          if (data.series && data.series.length > 0) {
            setSeries(data.series);
            setLoading(false);
            return;
          }
        }
        
        // If no API data, generate series from posts grouped by tags or platforms
        const generatedSeries = generateSeriesFromPosts(posts);
        setSeries(generatedSeries);
      } catch (error) {
        console.error('Failed to fetch series:', error);
        // Fallback to generated series from posts
        const generatedSeries = generateSeriesFromPosts(posts);
        setSeries(generatedSeries);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, [posts]);

  // Generate series from posts data
  function generateSeriesFromPosts(posts: typeof usePostsStore.getState extends () => infer S ? S extends { posts: infer P } ? P : never : never) {
    // Group posts by platform for now - in future could use tags/campaigns
    const platformGroups: Record<string, typeof posts> = {};
    
    posts.forEach(post => {
      post.platforms.forEach(platform => {
        if (!platformGroups[platform]) {
          platformGroups[platform] = [];
        }
        platformGroups[platform].push(post);
      });
    });
    
    const platformColors: Record<string, string> = {
      youtube: '#FF0000',
      tiktok: '#000000',
      facebook: '#1877F2',
      instagram: '#E4405F',
    };
    
    const platformNames: Record<string, string> = {
      youtube: 'YouTube Videos',
      tiktok: 'TikTok Videos',
      facebook: 'Facebook Posts',
      instagram: 'Instagram Posts',
    };
    
    const generated: Series[] = [];
    
    // Create a series for each platform that has posts
    Object.entries(platformGroups).forEach(([platform, platformPosts]) => {
      if (platformPosts.length > 0) {
        generated.push({
          id: `platform-${platform}`,
          name: platformNames[platform] || `${platform} Content`,
          description: `All ${platform} content from your posts`,
          thumbnailUrl: null,
          color: platformColors[platform] || '#0D9488',
          sortOrder: generated.length,
          contentProjects: platformPosts.map((p, idx) => ({
            id: p.id,
            title: p.content.slice(0, 50) || `Post ${idx + 1}`,
            status: p.status,
            thumbnailUrl: p.mediaUrls[0] || null,
          })),
        });
      }
    });
    
    // If no posts, show sample series
    if (generated.length === 0) {
      generated.push({
        id: 'sample-series',
        name: 'Content Series',
        description: 'Start creating posts to build your series',
        thumbnailUrl: null,
        color: '#0D9488',
        sortOrder: 0,
        contentProjects: [],
      });
    }
    
    return generated;
  }

  const [newSeriesName, setNewSeriesName] = useState('');
  const [newSeriesColor, setNewSeriesColor] = useState('#0D9488');

  // Create series
  const createSeries = async (data: Partial<Series>) => {
    const newSeries: Series = {
      id: Date.now().toString(),
      name: data.name || 'New Series',
      description: data.description || null,
      thumbnailUrl: data.thumbnailUrl || null,
      color: data.color || '#0D9488',
      sortOrder: series.length,
      contentProjects: [],
    };
    
    // Try to save to API
    try {
      const response = await fetch('/api/db/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeries),
      });
      if (!response.ok) throw new Error('Failed to save');
    } catch (e) {
      // Continue with local state if API fails
    }
    
    setSeries([...series, newSeries]);
    setShowCreateModal(false);
  };

  // Suggested colors
  const colorOptions = [
    '#0D9488', '#8B5CF6', '#EC4899', '#F59E0B', 
    '#10B981', '#3B82F6', '#EF4444', '#6366F1',
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Series & Playlists</h1>
          <p className="text-gray-500 mt-1">Organize your content into themed series</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Series
        </button>
      </div>

      {/* Series Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : series.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No series created yet</p>
          <p className="text-sm">Create a series to group your content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSeries(s)}
            >
              {/* Color banner */}
              <div 
                className="h-16" 
                style={{ backgroundColor: s.color }}
              />
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{s.name}</h3>
                    {s.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span>{s.contentProjects.length} videos</span>
                  <span>
                    {s.contentProjects.filter((p) => p.status === 'published').length} published
                  </span>
                </div>

                {/* Thumbnail grid preview */}
                {s.contentProjects.length > 0 && (
                  <div className="flex gap-1 mt-4">
                    {s.contentProjects.slice(0, 4).map((p, i) => (
                      <div
                        key={p.id}
                        className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden"
                      >
                        {p.thumbnailUrl ? (
                          <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">{i + 1}</span>
                        )}
                      </div>
                    ))}
                    {s.contentProjects.length > 4 && (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                        +{s.contentProjects.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Series Detail Sidebar */}
      {selectedSeries && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-xl z-50">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div 
              className="h-24 relative"
              style={{ backgroundColor: selectedSeries.color }}
            >
              <button
                onClick={() => setSelectedSeries(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <h2 className="text-xl font-bold">{selectedSeries.name}</h2>
              {selectedSeries.description && (
                <p className="text-gray-500 mt-2">{selectedSeries.description}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm text-red-600">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              {/* Videos in Series */}
              <div className="mt-6">
                <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide">
                  Videos in Series
                </h3>
                
                {selectedSeries.contentProjects.length === 0 ? (
                  <div className="mt-3 text-center py-8 text-gray-400 text-sm">
                    <p>No videos in this series yet</p>
                    <button className="mt-2 text-blue-600 hover:underline text-sm">
                      Add existing content
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {selectedSeries.contentProjects.map((project, i) => (
                      <div
                        key={project.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <span className="w-6 h-6 bg-gray-100 rounded text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div className="w-16 h-9 bg-gray-100 rounded flex items-center justify-center">
                          {project.thumbnailUrl ? (
                            <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover rounded" />
                          ) : (
                            <Film className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{project.title}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          project.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Series Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Series</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              createSeries({ name: newSeriesName, color: newSeriesColor });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Series Name</label>
                <input
                  name="name"
                  type="text"
                  value={newSeriesName}
                  onChange={(e) => setNewSeriesName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Weekly Tips"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this series about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Series Color</label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      name="color"
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${newSeriesColor === color ? 'border-gray-800' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSeriesColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}