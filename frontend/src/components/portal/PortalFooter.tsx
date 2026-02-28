/**
 * Portal Footer
 *
 * Simple footer with "Powered by ServiceFlow" branding.
 */

export function PortalFooter() {
  return (
    <footer className="py-4 px-6 text-center border-t border-gray-100">
      <p className="text-xs text-gray-400">
        Powered by{' '}
        <span className="font-medium text-gray-500">ServiceFlow</span>
      </p>
    </footer>
  );
}
