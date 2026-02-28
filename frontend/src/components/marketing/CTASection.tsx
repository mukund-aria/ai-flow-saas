import { Link } from 'react-router-dom';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600" />

      {/* Subtle glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to automate your workflows?
        </h2>
        <p className="text-lg text-violet-100 mb-10 max-w-xl mx-auto">
          Start building in seconds. No credit card required.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-violet-700 text-lg font-semibold hover:bg-violet-50 transition-colors shadow-xl shadow-violet-900/20"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
