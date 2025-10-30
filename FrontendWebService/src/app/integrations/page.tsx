import { Suspense } from 'react';
import { SearchStatusBanner } from './SearchStatusClient';
import { IntegrationsClient } from './pageClient';

/**
 * Static-export friendly Integrations page.
 * We render the shell and let the client component fetch data at runtime.
 * Wrap client-side hooks usage in a Suspense boundary per Next.js CSR bailout guidance.
 */
export default function IntegrationsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Integrations</h1>
      <p className="text-sm text-gray-600 mb-4">
        Connect external tools (e.g., Jira, Confluence) to use them in chat and actions.
      </p>

      <SearchStatusBanner />

      <Suspense fallback={<div className="text-sm text-gray-600">Loading...</div>}>
        <IntegrationsClient />
      </Suspense>
    </div>
  );
}
