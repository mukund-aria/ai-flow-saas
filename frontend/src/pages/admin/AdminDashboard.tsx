/**
 * Admin Dashboard
 *
 * Platform summary cards, org table with search, provision dialog.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Play,
  UserCheck,
  Activity,
  Search,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface DashboardStats {
  totalOrgs: number;
  totalUsers: number;
  totalRuns: number;
  totalContacts: number;
  activeOrgs30d: number;
}

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  memberCount: number;
  templateCount: number;
  runCount: number;
  contactCount: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showProvision, setShowProvision] = useState(false);
  const [provisionName, setProvisionName] = useState('');
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState('');

  const load = async () => {
    try {
      const [dashRes, orgsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/dashboard`, { credentials: 'include' }),
        fetch(`${API_BASE}/admin/organizations`, { credentials: 'include' }),
      ]);
      const dashData = await dashRes.json();
      const orgsData = await orgsRes.json();
      if (dashData.success) setStats(dashData.data);
      if (orgsData.success) setOrgs(orgsData.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredOrgs = useMemo(() => {
    if (!search.trim()) return orgs;
    const q = search.toLowerCase();
    return orgs.filter(
      o => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q),
    );
  }, [orgs, search]);

  const handleProvision = async () => {
    if (!provisionName.trim() || !provisionEmail.trim()) return;
    setProvisioning(true);
    setProvisionError('');
    try {
      const res = await fetch(`${API_BASE}/admin/organizations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: provisionName, adminEmail: provisionEmail }),
      });
      const data = await res.json();
      if (!data.success) {
        setProvisionError(data.error?.message || 'Failed to provision');
        return;
      }
      setShowProvision(false);
      setProvisionName('');
      setProvisionEmail('');
      load();
    } catch {
      setProvisionError('Network error');
    } finally {
      setProvisioning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Orgs', value: stats?.totalOrgs ?? 0, icon: Building2, color: 'violet' },
    { label: 'Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'blue' },
    { label: 'Flows', value: stats?.totalRuns ?? 0, icon: Play, color: 'green' },
    { label: 'Active Orgs (30d)', value: stats?.activeOrgs30d ?? 0, icon: Activity, color: 'amber' },
    { label: 'Contacts', value: stats?.totalContacts ?? 0, icon: UserCheck, color: 'rose' },
  ];

  const colorMap: Record<string, string> = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage organizations, users, and platform settings
          </p>
        </div>
        <Button onClick={() => setShowProvision(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Provision Org
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {cards.map(card => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorMap[card.color]}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search organizations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Org Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Organization</th>
              <th className="text-center px-4 py-3 font-medium">Members</th>
              <th className="text-center px-4 py-3 font-medium">Templates</th>
              <th className="text-center px-4 py-3 font-medium">Runs</th>
              <th className="text-center px-4 py-3 font-medium">Contacts</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  No organizations found
                </td>
              </tr>
            ) : (
              filteredOrgs.map(org => (
                <tr
                  key={org.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orgs/${org.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-violet-600"
                    >
                      {org.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{org.slug}</span>
                      {!org.isActive && (
                        <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {org.memberCount}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {org.templateCount}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {org.runCount}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {org.contactCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Provision Dialog */}
      <Dialog open={showProvision} onOpenChange={setShowProvision}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provision Organization</DialogTitle>
            <DialogDescription>
              Create a new organization and assign an admin user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={provisionName}
                onChange={e => setProvisionName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={provisionEmail}
                onChange={e => setProvisionEmail(e.target.value)}
                placeholder="admin@acme.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            {provisionError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {provisionError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProvision(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProvision}
              disabled={provisioning || !provisionName.trim() || !provisionEmail.trim()}
            >
              {provisioning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
