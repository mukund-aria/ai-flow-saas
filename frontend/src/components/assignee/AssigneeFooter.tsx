/**
 * Assignee Footer
 *
 * "Powered by ServiceFlow" branding footer.
 * Shows company name if white-label branding is configured.
 */

interface AssigneeFooterProps {
  companyName?: string;
}

export function AssigneeFooter({ companyName }: AssigneeFooterProps = {}) {
  return (
    <footer className="py-6 text-center border-t border-gray-100 bg-white">
      <span className="text-xs text-gray-400">
        Powered by{' '}
        {companyName ? (
          <span className="font-semibold text-gray-500">{companyName}</span>
        ) : (
          <a
            href="https://serviceflow.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-500 hover:text-violet-600 transition-colors"
          >
            ServiceFlow
          </a>
        )}
      </span>
    </footer>
  );
}
