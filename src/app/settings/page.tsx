'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Link2, 
  Bell, 
  Clock, 
  Palette,
  Save,
  AlertCircle,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useOrganizationStore, usePlatformStore } from '@/stores';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OAuthCallbackHandler } from '@/components/auth/OAuthCallbackHandler';
import type { SocialPlatform } from '@/types';

// ============================================
// Settings Page
// ============================================

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'connections' | 'scheduling' | 'notifications' | 'appearance'>('connections');
  const searchParams = useSearchParams();
  const [platformConfigs, setPlatformConfigs] = useState<Record<string, { configured: boolean }>>({});
  
  // Check for OAuth callback params
  const connectedParam = searchParams.get('connected');
  const errorParam = searchParams.get('error');

  // Fetch platform configs and connections on mount
  useEffect(() => {
    // Fetch platform configs
    fetch('/api/platforms/config')
      .then(res => res.json())
      .then(data => {
        if (data.configs) {
          setPlatformConfigs(data.configs);
        }
      })
      .catch(console.error);

    // Fetch connections from database (syncs tokens across devices)
    fetch('/api/platforms/connections')
      .then(res => res.json())
      .then(data => {
        if (data.connections?.length) {
          const addConnection = usePlatformStore.getState().addConnection;
          const currentPlatforms = usePlatformStore.getState().connections.map(c => c.platform);
          
          for (const conn of data.connections) {
            if (!currentPlatforms.includes(conn.platform)) {
              addConnection({
                platform: conn.platform,
                accessToken: conn.accessToken,
                refreshToken: conn.refreshToken,
                platformUserId: conn.platformUserId,
                platformUsername: conn.displayName,
                platformProfileImage: conn.profileImage,
              });
            }
          }
        }
      })
      .catch(console.error);
  }, []);

  const tabs = [
    { id: 'connections', label: 'Connections', icon: <Link2 className="w-4 h-4" /> },
    { id: 'scheduling', label: 'Scheduling', icon: <Clock className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Handle OAuth callbacks */}
      {connectedParam && <OAuthCallbackHandler platform={connectedParam as SocialPlatform} />}
      
      <PageHeader 
        title="Settings" 
        description="Manage your preferences and connections"
        align="left"
      />

      <Container>
        {/* Show error/success messages */}
        {errorParam && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300">
              Authentication failed: {errorParam}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {activeTab === 'connections' && <PlatformConnections platformConfigs={platformConfigs} />}
            {activeTab === 'scheduling' && <SchedulingSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
          </div>
        </div>
      </Container>
    </>
  );
}

// ============================================
// Platform Connections Tab
// ============================================

interface PlatformConnectionsProps {
  platformConfigs: Record<string, { configured: boolean }>;
}

function PlatformConnections({ platformConfigs }: PlatformConnectionsProps) {
  const connections = usePlatformStore((state) => state.connections);
  const platformStats = usePlatformStore((state) => state.platformStats);
  const removeConnection = usePlatformStore((state) => state.removeConnection);

  const platforms: { id: SocialPlatform; name: string; color: string; description: string }[] = [
    { id: 'tiktok', name: 'TikTok', color: 'bg-black', description: 'Connect to post short-form videos' },
    { id: 'facebook', name: 'Facebook', color: 'bg-[#1877F2]', description: 'Connect to post to your Facebook page' },
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]', description: 'Connect to Instagram' },
    { id: 'youtube', name: 'YouTube', color: 'bg-[#FF0000]', description: 'Connect to upload videos to YouTube' },
  ];

  const connectedPlatforms = useMemo(() => {
    return connections.map((c) => c.platform);
  }, [connections]);

  // Handle connect button click - redirects to OAuth flow
  const handleConnect = (platform: SocialPlatform) => {
    window.location.href = `/api/auth/${platform}/connect`;
  };

  // Handle disconnect - removes connection
  const handleDisconnect = (platform: SocialPlatform) => {
    removeConnection(platform);
  };

  // Check if at least one platform is configured (for the info message)
  const hasAnyPlatformConfigured = Object.values(platformConfigs).some(c => c?.configured);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Connected Platforms</h2>
      <div className="space-y-4">
        {platforms.map((platform) => {
          const isConnected = connectedPlatforms.includes(platform.id);
          const stats = platformStats[platform.id];
          
          return (
            <div 
              key={platform.id}
              className="p-4 rounded-lg bg-[var(--color-bg-secondary)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg',
                    platform.color
                  )}>
                    {platform.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{platform.description}</p>
                    {isConnected && stats?.followers && (
                      <p className="text-sm text-[var(--color-accent)]">
                        {stats.followers.toLocaleString()} followers
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <>
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        Connected
                      </span>
                      <Button size="sm" variant="danger" onClick={() => handleDisconnect(platform.id)}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      leftIcon={<Link2 className="w-4 h-4" />}
                      onClick={() => handleConnect(platform.id)}
                      disabled={!platformConfigs[platform.id]?.configured}
                    >
                      {platformConfigs[platform.id]?.configured ? 'Connect' : 'Not Configured'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200">OAuth Integration</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Platform connections are secured using OAuth 2.0. We never store your passwords.
              {!hasAnyPlatformConfigured && (
                <span className="block mt-1">
                  To enable connections, set the platform client IDs in your environment variables.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================
// Scheduling Settings Tab
// ============================================

function SchedulingSettings() {
  const organization = useOrganizationStore((state) => state.organization);
  const updateCooldownSettings = useOrganizationStore((state) => state.updateCooldownSettings);
  
  const cooldowns = organization?.settings.cooldownSettings || { tiktok: 60, facebook: 30, instagram: 60, youtube: 120 };

  const platforms: SocialPlatform[] = ['tiktok', 'facebook', 'instagram', 'youtube'];
  const platformNames: Record<SocialPlatform, string> = {
    tiktok: 'TikTok',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Cooldown Settings</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">Configure minimum time between posts per platform</p>
      <div className="space-y-4">
        {platforms.map((platform) => (
          <div 
            key={platform}
            className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-secondary)]"
          >
            <div>
              <h3 className="font-medium">{platformNames[platform]}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Recommended: {platform === 'youtube' ? '2 hours' : platform === 'tiktok' || platform === 'instagram' ? '1 hour' : '30 min'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="480"
                value={cooldowns[platform]}
                onChange={(e) => updateCooldownSettings({ [platform]: parseInt(e.target.value) || 0 })}
                className="w-20 px-3 py-2 rounded-lg border border-[var(--color-border)] text-center bg-[var(--color-bg-card)]"
              />
              <span className="text-[var(--color-text-muted)]">minutes</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button leftIcon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
}

// ============================================
// Notification Settings Tab
// ============================================

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    postPublished: true,
    postFailed: true,
    cooldownWarning: true,
    weeklyReport: true,
    algorithmAlert: true,
  });

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">Choose what notifications you want to receive</p>
      <div className="space-y-4">
        {[
          { key: 'postPublished', label: 'Post Published', description: 'Get notified when a post is successfully published' },
          { key: 'postFailed', label: 'Post Failed', description: 'Get notified when a post fails to publish' },
          { key: 'cooldownWarning', label: 'Cooldown Warning', description: 'Get warned when cooldown periods may delay posting' },
          { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive weekly analytics summary' },
          { key: 'algorithmAlert', label: 'Algorithm Alerts', description: 'Get notified about potential shadowban risks' },
        ].map((item) => (
          <div 
            key={item.key}
            className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-secondary)]"
          >
            <div>
              <h3 className="font-medium">{item.label}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-[var(--color-accent)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]" />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button leftIcon={<Save className="w-4 h-4" />}>
          Save Preferences
        </Button>
      </div>
    </Card>
  );
}

// ============================================
// Appearance Settings Tab
// ============================================

function AppearanceSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Appearance</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">Customize how SMST looks</p>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Theme</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', preview: 'bg-white border-gray-300' },
              { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-gray-700' },
              { value: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-gray-900' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as typeof theme)}
                className={clsx(
                  'p-4 rounded-lg border-2 transition-all',
                  theme === option.value
                    ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                )}
              >
                <div className={clsx('w-full h-8 rounded mb-2', option.preview)} />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-[var(--color-bg-secondary)]">
        <h3 className="font-medium mb-2">About</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          SMST v1.0.0 - Social Media Scheduling Tool
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Built with Next.js, TypeScript, Tailwind CSS, and Zustand
        </p>
      </div>
    </Card>
  );
}