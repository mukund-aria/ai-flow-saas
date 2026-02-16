/**
 * Onboarding Page
 *
 * Shown to first-time users who need to create or join an organization.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsCreating(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: orgName.trim() }),
      });

      if (res.ok) {
        await checkAuth();
        navigate('/home');
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to create organization');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to AI Flow</h1>
          <p className="text-gray-500 mt-2">
            Hi {user?.name || 'there'}! Let's set up your workspace.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Name your organization
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            This is where you'll build and manage your workflows.
          </p>

          <form onSubmit={handleCreate}>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g., Acme Corp"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              autoFocus
            />

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={!orgName.trim() || isCreating}
              className="w-full mt-4 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
