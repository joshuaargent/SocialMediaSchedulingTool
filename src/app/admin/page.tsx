'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

export default function AdminPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

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

  const toggleApproval = async (orgId: string, currentApproved: boolean) => {
    setUpdating(orgId);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !currentApproved }),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      // Update local state
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
        description="Manage organizations and approvals"
      />
      
      <Container>
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
          </div>
        )}

        {/* Approved Organizations */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            Approved Organizations ({approvedOrgs.length})
          </h2>
          
          <div className="space-y-4">
            {approvedOrgs.map(org => (
              <Card key={org.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Approved {format(new Date(org.createdAt), 'MMM d, yyyy')}
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
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleApproval(org.id, org.approved)}
                      disabled={updating === org.id}
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {approvedOrgs.length === 0 && (
              <p className="text-[var(--color-text-muted)] text-center py-8">
                No approved organizations yet
              </p>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}