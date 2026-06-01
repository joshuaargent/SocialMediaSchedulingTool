'use client';

import { useState } from 'react';
import { 
  TrendingUp, Users, Bell, Plus, ExternalLink,
  AlertTriangle, CheckCircle, Copy, Trash2, Search,
  Instagram, Youtube, Facebook, Twitter
} from 'lucide-react';

interface Trend {
  id: string;
  platform: string;
  keyword: string;
  source: string;
  createdAt: string;
  expiresAt: string | null;
  alert: boolean;
}

interface Competitor {
  id: string;
  platform: string;
  username: string;
  url: string;
  notes?: string;
  lastChecked?: string;
}

export default function TrendsPage() {
  const [activeTab, setActiveTab] = useState<'trends' | 'competitors' | 'alerts'>('trends');
  const [trends, setTrends] = useState<Trend[]>([
    { id: '1', platform: 'tiktok', keyword: '#productivityhacks', source: 'Trending Now', createdAt: new Date().toISOString(), expiresAt: null, alert: true },
    { id: '2', platform: 'youtube', keyword: 'morning routine', source: 'Rising Search', createdAt: new Date().toISOString(), expiresAt: null, alert: false },
  ]);
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: '1', platform: 'youtube', username: '@topcreator', url: 'https://youtube.com/@topcreator' },
    { id: '2', platform: 'tiktok', username: '@trendingcreator', url: 'https://tiktok.com/@trendingcreator' },
  ]);
  const [showAddTrend, setShowAddTrend] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-4 h-4 text-red-600" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'tiktok': return <span className="text-lg">🎵</span>;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-sky-500" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  // Add trend
  const addTrend = (trend: Partial<Trend>) => {
    setTrends([...trends, {
      id: Date.now().toString(),
      platform: trend.platform || 'general',
      keyword: trend.keyword || '',
      source: trend.source || 'Manual',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      alert: false,
    }]);
    setShowAddTrend(false);
  };

  // Add competitor
  const addCompetitor = (comp: Partial<Competitor>) => {
    setCompetitors([...competitors, {
      id: Date.now().toString(),
      platform: comp.platform || 'youtube',
      username: comp.username || '',
      url: comp.url || '',
    }]);
    setShowAddCompetitor(false);
  };

  // Delete trend
  const deleteTrend = (id: string) => {
    setTrends(trends.filter(t => t.id !== id));
  };

  // Delete competitor
  const deleteCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  // Toggle alert
  const toggleAlert = (id: string) => {
    setTrends(trends.map(t => t.id === id ? { ...t, alert: !t.alert } : t));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trends & Competitors</h1>
        <p className="text-gray-500 mt-1">Track trending topics and competitor activity</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'trends', label: 'Trending Topics', icon: TrendingUp },
          { id: 'competitors', label: 'Competitors', icon: Users },
          { id: 'alerts', label: 'Alert Settings', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Trend List */}
          <div className="col-span-2 bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Trends</h2>
              <button
                onClick={() => setShowAddTrend(true)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Trend
              </button>
            </div>

            <div className="space-y-3">
              {trends.map((trend) => (
                <div
                  key={trend.id}
                  className={`p-4 rounded-lg border ${
                    trend.alert ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(trend.platform)}
                      <div>
                        <p className="font-medium">{trend.keyword}</p>
                        <p className="text-xs text-gray-500">
                          {trend.source} • {new Date(trend.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlert(trend.id)}
                        className={`p-2 rounded-full ${trend.alert ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}
                        title={trend.alert ? 'Alert Enabled' : 'Get Alert'}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteTrend(trend.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {trends.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                  <p>No trends tracked yet</p>
                  <button
                    onClick={() => setShowAddTrend(true)}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Add your first trend
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Platform Trends Quick Links */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <div className="space-y-2">
                <a href="https://trends.google.com" target="_blank" rel="noopener" className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                  <Search className="w-4 h-4" />
                  Google Trends
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
                <a href="https://www.tiktok.com/discovery" target="_blank" rel="noopener" className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                  <span>🎵</span>
                  TikTok Discover
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
                <a href="https://www.youtube.com/trending" target="_blank" rel="noopener" className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                  <Youtube className="w-4 h-4 text-red-600" />
                  YouTube Trending
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">Alert Settings</h2>
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Email notifications
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Browser notifications
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  Daily digest
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tracked Competitors</h2>
              <button
                onClick={() => setShowAddCompetitor(true)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Competitor
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {competitors.map((comp) => (
                <div key={comp.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    {getPlatformIcon(comp.platform)}
                    <button 
                      onClick={() => deleteCompetitor(comp.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-medium">{comp.username}</p>
                  <a 
                    href={comp.url} 
                    target="_blank" 
                    rel="noopener"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Channel <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </div>
              ))}
            </div>

            {competitors.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <p>No competitors tracked yet</p>
                <button
                  onClick={() => setShowAddCompetitor(true)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Add your first competitor
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Tips for Tracking</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p>Track competitors who create similar content</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p>Note their posting frequency and timing</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p>Identify what makes their content successful</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p>Watch for new formats or trends they try first</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Alert Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Trend Alerts</p>
                  <p className="text-sm text-gray-500">Get notified when tracked keywords trend</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Competitor Updates</p>
                  <p className="text-sm text-gray-500">Get notified of competitor milestones</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="Font-medium">Algorithm Changes</p>
                  <p className="text-sm text-gray-500">Platform policy and algorithm updates</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Channels</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">In-App Notifications</p>
                    <p className="text-sm text-gray-500">Always enabled</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="font-medium">Email Digest</p>
                    <p className="text-sm text-gray-500">Daily/Weekly summary</p>
                  </div>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Trend Modal */}
      {showAddTrend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Trend</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              addTrend({ keyword: e.currentTarget.keyword.value, platform: e.currentTarget.platform.value });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Keyword/Topic</label>
                <input name="keyword" type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="#topic or keyword" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select name="platform" className="w-full px-3 py-2 border rounded-lg">
                  <option value="general">General</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTrend(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddCompetitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Competitor</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              addCompetitor({ username: e.currentTarget.username.value, url: e.currentTarget.url.value, platform: e.currentTarget.platform.value });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username/Channel Name</label>
                <input name="username" type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="@username" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profile URL</label>
                <input name="url" type="url" className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select name="platform" className="w-full px-3 py-2 border rounded-lg">
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddCompetitor(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}