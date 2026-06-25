'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  PenSquare, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  Link2,
  Plus,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { usePlatformStore } from '@/stores';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '#dashboard' },
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" />, href: '#calendar' },
  { id: 'compose', label: 'Compose', icon: <PenSquare className="w-5 h-5" />, href: '#compose' },
  { id: 'queue', label: 'Queue', icon: <FolderOpen className="w-5 h-5" />, href: '#queue' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '#analytics' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, href: '#settings' },
];

// ============================================
// Sidebar Component
// ============================================

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export function Sidebar({ activeItem = 'dashboard', onItemClick }: SidebarProps) {
  const connections = usePlatformStore((s) => s.connections);
  const connectedPlatforms = connections.map((c) => c.platform);

  return (
    <aside className="w-64 h-screen bg-bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-text-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-semibold">SMST</h1>
            <p className="text-xs text-text-muted">Creator Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              activeItem === item.id
                ? 'bg-text-primary text-white'
                : 'hover:bg-bg-secondary text-text-secondary'
            )}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Platform Connections */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Connected</span>
          <span className="text-xs text-text-muted">
            {connectedPlatforms.length}/4
          </span>
        </div>
        <div className="flex gap-2">
          {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
            const isConnected = connectedPlatforms.includes(platform);
            return (
              <div
                key={platform}
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                  platform === 'tiktok' && 'bg-black',
                  platform === 'facebook' && 'bg-[#1877F2]',
                  platform === 'instagram' && 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
                  platform === 'youtube' && 'bg-[#FF0000]',
                  !isConnected && 'opacity-30'
                )}
                title={platform.charAt(0).toUpperCase() + platform.slice(1)}
              >
                {platform.charAt(0).toUpperCase()}
              </div>
            );
          })}
        </div>
        <button className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed border-border hover:border-text-primary hover:text-text-primary transition-colors">
          <Link2 className="w-4 h-4" />
          Connect Platform
        </button>
      </div>
    </aside>
  );
}

// ============================================
// Header Component
// ============================================

interface HeaderProps {
  onMenuClick?: () => void;
  onComposeClick?: () => void;
}

export function Header({ onMenuClick, onComposeClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-bg-card border-b border-border px-4 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-bg-secondary"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search posts, analytics..."
            className="w-64 pl-10 pr-4 py-2 rounded-lg border border-border bg-bg-secondary focus:bg-bg-card focus:ring-2 focus:ring-text-primary"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onComposeClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-text-primary text-white hover:bg-text-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Compose</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-bg-secondary relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-bg-card rounded-lg shadow-lg border border-border z-50">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-4 text-center text-sm text-text-muted">
                  No new notifications
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================
// Mobile Sidebar Overlay
// ============================================

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export function MobileSidebar({ isOpen, onClose, activeItem, onItemClick }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-bg-card z-50 lg:hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onItemClick?.(item.id);
                onClose();
              }}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                activeItem === item.id
                  ? 'bg-text-primary text-white'
                  : 'hover:bg-bg-secondary text-text-secondary'
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ============================================
// Page Header Component
// ============================================

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ============================================
// Stats Card Component
// ============================================

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: { value: number; positive: boolean };
  icon?: React.ReactElement;
  className?: string;
}

export function StatsCard({ label, value, change, icon, className }: StatsCardProps) {
  return (
    <div className={clsx(
      'bg-bg-card rounded-xl border border-border p-5',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={clsx(
              'text-sm mt-1',
              change.positive ? 'text-green-600' : 'text-red-600'
            )}>
              {change.positive ? '+' : ''}{change.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-bg-primary/10 text-text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Section Component
// ============================================

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Section({ title, description, children, className, noPadding }: SectionProps) {
  return (
    <section className={clsx(className)}>
      <div className={clsx(!noPadding && 'p-6')}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}