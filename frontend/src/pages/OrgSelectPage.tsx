/**
 * Org Select Page
 *
 * Shown after login when a user has 1+ organizations.
 * Lets them pick an existing org or create a new one.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
  isActive: boolean;
}

export function OrgSelectPage() {
  const navigate = useNavigate();
  const { user, switchOrg, logout, isLoading: authLoading } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch(`${API_BASE}/organizations`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setOrgs(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  const handleSelectOrg = async (org: Organization) => {
    setSwitchingOrgId(org.id);
    try {
      await switchOrg(org.id);
      navigate('/home');
    } catch {
      setSwitchingOrgId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Edge case: no orgs after loading — redirect to onboarding
  useEffect(() => {
    if (!authLoading && !isLoading && orgs.length === 0) {
      navigate('/onboarding');
    }
  }, [authLoading, isLoading, orgs, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-gray-500 text-sm">No organizations found. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
          }
        `}</style>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Choose organization</h1>
          <p className="mt-2 text-gray-500">
            Organizations found for <span className="font-medium text-gray-700">{user?.email}</span>
          </p>
        </div>

        {/* Org List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelectOrg(org)}
                disabled={switchingOrgId !== null}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {org.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Name + Slug */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{org.name}</p>
                  <p className="text-sm text-gray-400 truncate">{org.slug}</p>
                </div>

                {/* Arrow / Spinner */}
                {switchingOrgId === org.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Create Organization */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Want to use ServiceFlow for a new business?
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create organization
          </button>
        </div>

        {/* Different Email */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Don't see your organization?{' '}
            <button
              onClick={handleLogout}
              className="text-violet-600 hover:text-violet-700 font-medium hover:underline"
            >
              Try a different email
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
