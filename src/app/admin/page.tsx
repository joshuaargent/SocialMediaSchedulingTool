'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, X, Users, Calendar, Clock, Shield, 
  Database, Wifi, HardDrive, AlertTriangle, 
  CheckCircle, XCircle, RefreshCw, Server,
  Image, Video, FileText, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Admin email whitelist - SECURITY: Only these emails can access admin features
const ADMIN_EMAILS = ['argentjackjoshua@outlook.com'];

// ============================================
// TYPES
// ============================================

interface Organization {
  id: string;
  name: string;
  approved: boolean;
  createdAt: string;
  _count: {
    users: number;
    posts: number;
  };
  users: Array<{ id: string; email: string; name: string | null }>;
}

interface StorageHealth {
  provider: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  endpoint: string;
  connected: boolean;
  latency: number | null;
  error?: string;
  capacity?: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  };
  lastChecked: string;
}

interface GarageStats {
  server: {
    version: string;
    uptime: number;
    status: 'online' | 'offline' | 'unknown';
  };
  storage: {
    provider: string;
    endpoint: string;
    bucket: string;
    capacity: {
      total: number;
      used: number;
      free: number;
      usedPercent: number;
    };
  };
  network: {
    latency: number | null;
    connected: boolean;
  };
  files: {
    total: number;
    images: number;
    videos: number;
    documents: number;
    totalSize: number;
  };
  security: {
    localNetworkOnly: boolean;
    authenticationRequired: boolean;
    credentialsConfigured: boolean;
  };
  lastUpdated: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  // Storage health state
  const [storageHealth, setStorageHealth] = useState<StorageHealth | null>(null);
  const [garageStats, setGarageStats] = useState<GarageStats | null>(null);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [activeTab, setActiveTab] = useState<'storage' | 'organizations'>('storage');

  // Check if user is admin
  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.email) {
          setUserEmail(data.email);
          if (ADMIN_EMAILS.includes(data.email.toLowerCase())) {
            setIsAdmin(true);
          }
        }
        setCheckingAdmin(false);
      })
      .catch(() => {
        setCheckingAdmin(false);
      });
  }, []);

  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      router.push('/dashboard');
    } else if (isAdmin) {
      fetchOrganizations();
      fetchStorageHealth();
    }
  }, [isAdmin, checkingAdmin, router]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/admin/organizations');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrganizations(data.organizations);
    } catch (err) {
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageHealth = useCallback(async () => {
    setLoadingStorage(true);
    try {
      const [healthRes, statsRes] = await Promise.all([
        fetch('/api/admin/storage'),
        fetch('/api/admin/garage-stats'),
      ]);
      
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setStorageHealth(healthData.health);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setGarageStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch storage health:', err);
    } finally {
      setLoadingStorage(false);
    }
  }, []);

  const toggleApproval = async (orgId: string, currentApproved: boolean) => {
    setUpdating(orgId);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !currentApproved }),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      setOrganizations(orgs => 
        orgs.map(org => 
          org.id === orgId ? { ...org, approved: !currentApproved } : org
        )
      );
    } catch (err) {
      alert('Failed to update organization');
    } finally {
      setUpdating(null);
    }
  };

  const pendingOrgs = organizations.filter(org => !org.approved);
  const approvedOrgs = organizations.filter(org => org.approved);

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Checking permissions...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-[var(--color-text-muted)]">You don't have permission to access the admin panel.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Admin Dashboard" 
        description="Manage organizations, storage, and system health"
      />
      
      <Container>
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'storage' 
                ? 'text-[var(--color-accent)]' 
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Storage Health
            </div>
            {activeTab === 'storage' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'organizations' 
                ? 'text-[var(--color-accent)]' 
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Organizations
            </div>
            {activeTab === 'organizations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
            )}
          </button>
        </div>

        {/* Storage Health Tab */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            {/* Storage Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Connection Status */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    storageHealth?.connected 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {storageHealth?.connected ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <button
                    onClick={fetchStorageHealth}
                    disabled={loadingStorage}
                    className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingStorage ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">Connection Status</p>
                <p className={`text-xl font-bold ${storageHealth?.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {storageHealth?.connected ? 'Online' : 'Offline'}
                </p>
                {storageHealth?.latency && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Latency: {storageHealth.latency}ms
                  </p>
                )}
              </Card>

              {/* Storage Used */}
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <HardDrive className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">Storage Used</p>
                <p className="text-xl font-bold">
                  {garageStats?.files.totalSize 
                    ? formatBytes(garageStats.files.totalSize) 
                    : '0 B'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {garageStats?.files.total || 0} files total
                </p>
              </Card>

              {/* Storage Capacity */}
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <Database className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">Capacity (256GB SD)</p>
                <p className="text-xl font-bold">
                  {garageStats?.storage.capacity.free 
                    ? formatBytes(garageStats.storage.capacity.free)
                    : '238 GB'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {garageStats?.storage.capacity.usedPercent || 0}% used
                </p>
              </Card>

              {/* Provider */}
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">Storage Provider</p>
                <p className="text-xl font-bold capitalize">{storageHealth?.provider || 'Unknown'}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {garageStats?.storage.bucket || 'videos'}
                </p>
              </Card>
            </div>

            {/* Capacity Progress Bar */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Storage Capacity
              </h3>
              <div className="space-y-4">
                <div className="relative h-8 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      (garageStats?.storage.capacity.usedPercent || 0) > 80 
                        ? 'bg-red-500' 
                        : (garageStats?.storage.capacity.usedPercent || 0) > 60 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${garageStats?.storage.capacity.usedPercent || 0}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-white drop-shadow-md">
                      {garageStats?.storage.capacity.usedPercent || 0}% Used
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-[var(--color-text-muted)]">Used:</span>
                    <span className="ml-1 font-medium">
                      {garageStats?.storage.capacity.used ? formatBytes(garageStats.storage.capacity.used) : '0 B'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)]">Free:</span>
                    <span className="ml-1 font-medium">
                      {garageStats?.storage.capacity.free ? formatBytes(garageStats.storage.capacity.free) : '238 GB'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)]">Total:</span>
                    <span className="ml-1 font-medium">256 GB</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* File Statistics */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                File Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {garageStats?.files.total || 0}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">Total Files</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                  <Image className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{garageStats?.files.images || 0}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Images</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                  <Video className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{garageStats?.files.videos || 0}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Videos</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{garageStats?.files.documents || 0}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Documents</p>
                </div>
              </div>
            </Card>

            {/* Security Status */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    {garageStats?.security.localNetworkOnly ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span>Local Network Only</span>
                  </div>
                  <span className={`text-sm font-medium ${garageStats?.security.localNetworkOnly ? 'text-green-600' : 'text-yellow-600'}`}>
                    {garageStats?.security.localNetworkOnly ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    {garageStats?.security.authenticationRequired ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span>Authentication Required</span>
                  </div>
                  <span className={`text-sm font-medium ${garageStats?.security.authenticationRequired ? 'text-green-600' : 'text-yellow-600'}`}>
                    {garageStats?.security.authenticationRequired ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    {garageStats?.security.credentialsConfigured ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>Credentials Configured</span>
                  </div>
                  <span className={`text-sm font-medium ${garageStats?.security.credentialsConfigured ? 'text-green-600' : 'text-red-600'}`}>
                    {garageStats?.security.credentialsConfigured ? 'Configured' : 'Missing'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Network & Endpoint Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Network & Endpoint
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Endpoint</p>
                  <p className="font-mono text-sm bg-[var(--color-bg-secondary)] p-3 rounded">
                    {garageStats?.storage.endpoint || 'Not configured'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Latency</p>
                  <p className="font-medium">
                    {garageStats?.network.latency 
                      ? `${garageStats.network.latency}ms` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Pending Approval</p>
                    <p className="text-2xl font-bold">{pendingOrgs.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Approved</p>
                    <p className="text-2xl font-bold">{approvedOrgs.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-muted)]">Total Users</p>
                    <p className="text-2xl font-bold">{organizations.reduce((sum, o) => sum + o._count.users, 0)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pending Approvals */}
            {pendingOrgs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Pending Approval ({pendingOrgs.length})
                </h2>
                
                <div className="space-y-4">
                  {pendingOrgs.map(org => (
                    <Card key={org.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{org.name}</h3>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            Created {format(new Date(org.createdAt), 'MMM d, yyyy')}
                          </p>
                          <div className="mt-3 flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {org._count.users} user{org._count.users !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {org._count.posts} post{org._count.posts !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Users:</p>
                            <div className="flex flex-wrap gap-2">
                              {org.users.map(user => (
                                <span key={user.id} className="text-sm bg-[var(--color-bg-secondary)] px-2 py-1 rounded">
                                  {user.email}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => toggleApproval(org.id, org.approved)}
                            disabled={updating === org.id}
                            leftIcon={<Check className="w-4 h-4" />}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}