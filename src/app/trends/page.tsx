'use client';

import { useState } from 'react';
import { 
  TrendingUp, Users, Bell, Plus, ExternalLink,
  AlertTriangle, CheckCircle, Copy, Trash2, Search,
  Instagram, Youtube, Facebook, Twitter
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Container } from '@/components/layout/Container';

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
  const [trends, setTrends] = useState<Trend[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
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
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Trends & Competitors</h1>
        <p className="text-text-secondary mt-1">Track trending topics and competitor activity</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'trends', label: 'Trending Topics', icon: TrendingUp },
          { id: 'competitors', label: 'Competitors', icon: Users },
          { id: 'alerts', label: 'Alert Settings', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors',
              activeTab === tab.id 
                ? 'border-accent text-accent' 
                : 'border-transparent text-text-muted hover:text-text-primary'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend List */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Active Trends</h2>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowAddTrend(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Trend
                </Button>
              </div>

              <div className="space-y-3">
                {trends.map((trend) => (
                  <div
                    key={trend.id}
                    className={clsx(
                      'p-4 rounded-lg border',
                      trend.alert ? 'bg-yellow-500/5 border-yellow-200' : 'bg-bg-secondary'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(trend.platform)}
                        <div>
                          <p className="font-medium">{trend.keyword}</p>
                          <p className="text-xs text-text-muted">
                            {trend.source} • {new Date(trend.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAlert(trend.id)}
                          className={clsx(
                            'p-2 rounded-full transition-colors',
                            trend.alert ? 'bg-yellow-500/10 text-yellow-600' : 'bg-bg-secondary text-text-muted'
                          )}
                          title={trend.alert ? 'Alert Enabled' : 'Get Alert'}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteTrend(trend.id)}
                          className="p-2 text-text-muted hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {trends.length === 0 && (
                  <div className="text-center py-12 text-text-muted">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No trends tracked yet</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddTrend(true)}
                      className="mt-2"
                    >
                      Add your first trend
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Platform Trends Quick Links */}
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <div className="space-y-2">
                <a href="https://trends.google.com" target="_blank" rel="noopener" className="flex items-center gap-2 p-3 bg-bg-secondary hover:bg-border rounded-lg transition-colors">
                  <Search className="w-4 h-4" />
                  Google Trends
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
                <a href="https://www.tiktok.com/discovery" target="_blank" rel="noopener" className="flex items-center gap-2 p-3 bg-bg-secondary hover:bg-border rounded-lg transition-colors">
                  <span>🎵</span>
                  TikTok Discover
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
                <a href="https://www.youtube.com/feed/trending" target="_blank" rel="noopener" className="flex items-center gap-2 p-3 bg-bg-secondary hover:bg-border rounded-lg transition-colors">
                  <Youtube className="w-4 h-4 text-red-600" />
                  YouTube Trending
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Alert Settings</h2>
              <div className="space-y-3 text-sm text-text-secondary">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-border" />
                  Email notifications
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-border" />
                  Browser notifications
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" />
                  Daily digest
                </label>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Tracked Competitors</h2>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowAddCompetitor(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Competitor
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitors.map((comp) => (
                  <div key={comp.id} className="p-4 bg-bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      {getPlatformIcon(comp.platform)}
                      <button 
                        onClick={() => deleteCompetitor(comp.id)}
                        className="p-1 text-text-muted hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-medium">{comp.username}</p>
                    <a 
                      href={comp.url} 
                      target="_blank" 
                      rel="noopener"
                      className="text-sm text-accent hover:underline"
                    >
                      View Channel <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </div>
                ))}
              </div>

              {competitors.length === 0 && (
                <div className="text-center py-12 text-text-muted">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No competitors tracked yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddCompetitor(true)}
                    className="mt-2"
                  >
                    Add your first competitor
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tips for Tracking</h2>
            <div className="space-y-4 text-sm text-text-secondary">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
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
            </Card>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Alert Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Trend Alerts</p>
                  <p className="text-sm text-text-muted">Get notified when tracked keywords trend</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Competitor Updates</p>
                  <p className="text-sm text-text-muted">Get notified of competitor milestones</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                <div>
                  <p className="font-medium">Algorithm Changes</p>
                  <p className="text-sm text-text-muted">Platform policy and algorithm updates</p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Channels</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-text-muted" />
                  <div>
                    <p className="font-medium">In-App Notifications</p>
                    <p className="text-sm text-text-muted">Always enabled</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="font-medium">Email Digest</p>
                    <p className="text-sm text-text-muted">Daily/Weekly summary</p>
                  </div>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Trend Modal */}
      {showAddTrend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-card rounded-xl p-6 w-full max-w-md border border-border">
            <h2 className="text-lg font-semibold mb-4">Add Trend</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              addTrend({ keyword: e.currentTarget.keyword.value, platform: e.currentTarget.platform.value });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Keyword/Topic</label>
                <input name="keyword" type="text" className="w-full px-3 py-2 border border-border rounded-lg bg-bg-card" placeholder="#topic or keyword" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select name="platform" className="w-full px-3 py-2 border border-border rounded-lg bg-bg-card">
                  <option value="general">General</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddTrend(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddCompetitor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-card rounded-xl p-6 w-full max-w-md border border-border">
            <h2 className="text-lg font-semibold mb-4">Add Competitor</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              addCompetitor({ username: e.currentTarget.username.value, url: e.currentTarget.url.value, platform: e.currentTarget.platform.value });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username/Channel Name</label>
                <input name="username" type="text" className="w-full px-3 py-2 border border-border rounded-lg bg-bg-card" placeholder="@username" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profile URL</label>
                <input name="url" type="url" className="w-full px-3 py-2 border border-border rounded-lg bg-bg-card" placeholder="https://..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select name="platform" className="w-full px-3 py-2 border border-border rounded-lg bg-bg-card">
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddCompetitor(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}