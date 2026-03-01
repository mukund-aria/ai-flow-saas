/**
 * Admin Org Detail
 *
 * Shows org info, stats, members, recent runs, and danger zone.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  FileText,
  Play,
  UserCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    members: number;
    templates: number;
    runs: number;
    contacts: number;
    runsByStatus: Record<string, number>;
  };
  members: {
    userId: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
  }[];
  recentRuns: {
    id: string;
    name: string;
    status: string;
    startedAt: string;
    templateName: string;
  }[];
}

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  PAUSED: 'bg-amber-50 text-amber-700',
};

export function AdminOrgDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/admin/organizations/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrg(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleActive = async () => {
    if (!org) return;
    setToggling(true);
    try {
      const res = await fetch(`${API_BASE}/admin/organizations/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !org.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setOrg(prev => prev ? { ...prev, isActive: data.data.isActive } : prev);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== org?.name) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/admin/organizations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-24 text-gray-500">Organization not found</div>
    );
  }

  return (
    <div>
      {/* Back + Header */}
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to organizations
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                org.isActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {org.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {org.slug} &middot; Created {new Date(org.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Members', value: org.stats.members, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Templates', value: org.stats.templates, icon: FileText, color: 'bg-violet-50 text-violet-600' },
          { label: 'Flows', value: org.stats.runs, icon: Play, color: 'bg-green-50 text-green-600' },
          { label: 'Contacts', value: org.stats.contacts, icon: UserCheck, color: 'bg-rose-50 text-rose-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Runs by Status */}
      {Object.keys(org.stats.runsByStatus).length > 0 && (
        <div className="flex gap-3 mb-8">
          {Object.entries(org.stats.runsByStatus).map(([status, cnt]) => (
            <span
              key={status}
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}
            >
              {status.replace(/_/g, ' ')}: {cnt}
            </span>
          ))}
        </div>
      )}

      {/* Members Table */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Members ({org.members.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {org.members.map(m => (
                <tr key={m.userId} className="border-b border-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-900">{m.name}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{m.email}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        m.role === 'ADMIN'
                          ? 'bg-violet-50 text-violet-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">
                    {new Date(m.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {org.members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                    No members
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Runs Table */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent Runs
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Started</th>
                <th className="text-left px-4 py-3 font-medium">Template</th>
              </tr>
            </thead>
            <tbody>
              {org.recentRuns.map(run => (
                <tr key={run.id} className="border-b border-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-900">{run.name}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        statusColors[run.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {run.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">
                    {new Date(run.startedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{run.templateName}</td>
                </tr>
              ))}
              {org.recentRuns.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                    No runs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h2>
        <div className="bg-white rounded-xl border border-red-200 p-6 space-y-6">
          {/* Toggle Active */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {org.isActive ? 'Deactivate' : 'Reactivate'} Organization
              </p>
              <p className="text-xs text-gray-500">
                {org.isActive
                  ? 'Deactivating will prevent members from logging in.'
                  : 'Reactivating will restore member access.'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleActive}
              disabled={toggling}
              className={org.isActive ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-green-300 text-green-700 hover:bg-green-50'}
            >
              {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : org.isActive ? (
                'Deactivate'
              ) : (
                'Reactivate'
              )}
            </Button>
          </div>

          {/* Delete */}
          <div className="pt-4 border-t border-red-100">
            <p className="text-sm font-medium text-gray-900 mb-1">Delete Organization</p>
            <p className="text-xs text-gray-500 mb-3">
              Type <strong>{org.name}</strong> to confirm. This action soft-deletes the organization.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder={org.name}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleteConfirm !== org.name || deleting}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
