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
        <span className="font-semibold text-gray-500">
          {companyName || 'ServiceFlow'}
        </span>
      </span>
    </footer>
  );
}
