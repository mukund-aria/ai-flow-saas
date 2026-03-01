/**
 * Team Page
 *
 * Manage team members and send invitations.
 */

import { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Shield, UserPlus, Loader2, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface Member {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: string;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/team`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data.members);
        setInvites(data.data.pendingInvites);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSending(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });

      if (res.ok) {
        setInviteEmail('');
        fetchTeam();
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to send invite');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSending(false);
    }
  };

  const handleRevokeInvite = (id: string) => {
    setConfirmRevokeId(id);
  };

  const confirmRevoke = async () => {
    if (!confirmRevokeId) return;
    const id = confirmRevokeId;
    setConfirmRevokeId(null);
    try {
      const res = await fetch(`${API_BASE}/team/invite/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to revoke invite');
      fetchTeam();
    } catch {
      setError('Failed to revoke invitation. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage who has access to {user?.organizationName || 'your organization'}
          </p>
        </div>
      </div>

      {/* Invite Form */}
      {isAdmin && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite a team member
          </h3>
          <form onSubmit={handleInvite} className="flex items-center gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'ADMIN')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <Button
              type="submit"
              disabled={!inviteEmail.trim() || isSending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
            </Button>
          </form>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {/* Error banner (for non-form errors like revoke failures) */}
      {error && !isSending && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Revoke invitation confirmation */}
      {confirmRevokeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmRevokeId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revoke Invitation</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to revoke this invitation? The recipient will no longer be able to join.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmRevokeId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevoke}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members ({members.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3">
              {member.picture ? (
                <img src={member.picture} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">
                  {member.name?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                member.role === 'ADMIN'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {member.role === 'ADMIN' ? (
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>
                ) : (
                  'Member'
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Pending Invitations ({invites.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{invite.email}</p>
                  <p className="text-xs text-gray-500">
                    Invited by {invite.invitedBy} as {invite.role}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleRevokeInvite(invite.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Revoke invitation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
