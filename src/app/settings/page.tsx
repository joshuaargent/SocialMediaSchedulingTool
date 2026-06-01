'use client';

import { useState } from 'react';
import { 
  Settings, 
  Link2, 
  Bell, 
  Clock, 
  Shield, 
  Palette,
  Save,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';
import { useOrganizationStore, usePlatformStore } from '@/stores';
import { Sidebar, Header, MobileSidebar, PageHeader, Section } from '@/components/dashboard/Layout';
import type { SocialPlatform } from '@/types';

// ============================================
// Settings Page
// ============================================

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('settings');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'scheduling' | 'notifications' | 'appearance'>('connections');

  const orgStore = useOrganizationStore();
  const platformStore = usePlatformStore();

  const tabs = [
    { id: 'connections', label: 'Connections', icon: <Link2 className="w-4 h-4" /> },
    { id: 'scheduling', label: 'Scheduling', icon: <Clock className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex">
      <Sidebar 
        activeItem={activeSection} 
        onItemClick={setActiveSection} 
      />
      
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 overflow-auto">
          <PageHeader 
            title="Settings" 
            description="Manage your preferences and connections"
          />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:w-64 flex-shrink-0">
              <nav className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-2">
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
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6">
              {activeTab === 'connections' && (
                <PlatformConnections />
              )}
              {activeTab === 'scheduling' && (
                <SchedulingSettings />
              )}
              {activeTab === 'notifications' && (
                <NotificationSettings />
              )}
              {activeTab === 'appearance' && (
                <AppearanceSettings />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================
// Platform Connections Tab
// ============================================

function PlatformConnections() {
  const platformStore = usePlatformStore();

  const platforms: { id: SocialPlatform; name: string; color: string; description: string }[] = [
    { id: 'tiktok', name: 'TikTok', color: 'bg-black', description: 'Connect to post short-form videos' },
    { id: 'facebook', name: 'Facebook', color: 'bg-[#1877F2]', description: 'Connect to post to your Facebook page' },
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]', description: 'Connect to post to Instagram' },
    { id: 'youtube', name: 'YouTube', color: 'bg-[#FF0000]', description: 'Connect to upload videos to YouTube' },
  ];

  return (
    <Section title="Connected Platforms" description="Manage your social media connections">
      <div className="space-y-4">
        {platforms.map((platform) => {
          const isConnected = platformStore.isPlatformConnected(platform.id);
          const stats = platformStore.platformStats[platform.id];
          
          return (
            <div 
              key={platform.id}
              className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
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
                      <button className="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors">
                      <Link2 className="w-4 h-4" />
                      Connect
                    </button>
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
              You can revoke access at any time from your platform settings.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ============================================
// Scheduling Settings Tab
// ============================================

function SchedulingSettings() {
  const orgStore = useOrganizationStore();
  const cooldowns = orgStore.organization?.settings.cooldownSettings || { tiktok: 60, facebook: 30, instagram: 60, youtube: 120 };

  const platforms: SocialPlatform[] = ['tiktok', 'facebook', 'instagram', 'youtube'];
  const platformNames: Record<SocialPlatform, string> = {
    tiktok: 'TikTok',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
  };

  return (
    <Section title="Cooldown Settings" description="Configure minimum time between posts per platform">
      <div className="space-y-4">
        {platforms.map((platform) => (
          <div 
            key={platform}
            className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
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
                onChange={(e) => orgStore.updateCooldownSettings({ [platform]: parseInt(e.target.value) || 0 })}
                className="w-20 px-3 py-2 rounded-lg border border-[var(--color-border)] text-center"
              />
              <span className="text-[var(--color-text-muted)]">minutes</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </Section>
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
    <Section title="Notification Preferences" description="Choose what notifications you want to receive">
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
            className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
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
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors">
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </Section>
  );
}

// ============================================
// Appearance Settings Tab
// ============================================

function AppearanceSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  return (
    <Section title="Appearance" description="Customize how ContentHub looks">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
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
          ContentHub v1.0.0 - Social Media Command Center
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Built with Next.js, TypeScript, Tailwind CSS, and Zustand
        </p>
      </div>
    </Section>
  );
}