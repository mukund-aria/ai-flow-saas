/**
 * Portal Login Page
 *
 * Branded login page with email OTP flow.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, Loader2, ArrowRight, Mail, KeyRound } from 'lucide-react';
import { useAssigneeAuth } from '@/contexts/AssigneeAuthContext';
import { Button } from '@/components/ui/button';
import { checkPortalSso } from '@/lib/api';

export function PortalLoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, login, verify, loadPortalInfo, portal } = useAssigneeAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [portalLoading, setPortalLoading] = useState(true);
  const [portalNotFound, setPortalNotFound] = useState(false);

  // Load portal info
  useEffect(() => {
    if (!slug) return;
    loadPortalInfo(slug)
      .then((info) => {
        if (!info) setPortalNotFound(true);
      })
      .finally(() => setPortalLoading(false));
  }, [slug, loadPortalInfo]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && slug) {
      navigate(`/portal/${slug}`, { replace: true });
    }
  }, [isAuthenticated, slug, navigate]);

  const [ssoAvailable, setSsoAvailable] = useState(false);
  const [ssoRedirectUrl, setSsoRedirectUrl] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !slug) return;
    setLoading(true);
    setError('');
    try {
      // Check portal SSO first
      const ssoResult = await checkPortalSso(slug, email.trim());
      if (ssoResult.ssoRequired && ssoResult.redirectUrl) {
        window.location.href = ssoResult.redirectUrl;
        return;
      }
      if (ssoResult.ssoAvailable && ssoResult.redirectUrl) {
        setSsoAvailable(true);
        setSsoRedirectUrl(ssoResult.redirectUrl);
      }
    } catch {
      // SSO check failed, proceed with OTP
    }

    try {
      await login(slug, email.trim());
      setStep('code');
    } catch (err) {
      setError((err as Error).message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !slug) return;
    setLoading(true);
    setError('');
    try {
      await verify(slug, email.trim(), code.trim());
      navigate(`/portal/${slug}`, { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = portal?.branding?.primaryColor || '#7c3aed';
  const logoUrl = portal?.branding?.logoUrl;
  const companyName = portal?.branding?.companyName || portal?.name || 'Portal';

  if (portalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (portalNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Portal Not Found</h1>
          <p className="text-sm text-gray-500 mt-2">
            The portal you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="w-12 h-12 object-contain mx-auto mb-3" />
          ) : (
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Layers className="w-6 h-6 text-white" />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your portal</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {step === 'email' ? (
            <form onSubmit={handleSendOTP}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="you@example.com"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 mb-3">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Code
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>

              {ssoAvailable && ssoRedirectUrl && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-gray-400">or</span>
                    </div>
                  </div>
                  <a
                    href={ssoRedirectUrl}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                  >
                    <KeyRound className="w-4 h-4" />
                    Sign in with SSO
                  </a>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <p className="text-sm text-gray-600 mb-4">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center tracking-[0.3em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="000000"
                  autoFocus
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 mb-3">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Verify & Sign In'
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        {/* Magic link note */}
        <p className="text-xs text-center text-gray-400 mt-4">
          Have a task link? You can access it directly without signing in.
        </p>
      </div>
    </div>
  );
}
