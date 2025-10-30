import { listConnectors, listConnections, type Connector, type Connection } from '@/lib/api';
import { IntegrationsClient } from './pageClient';

// This page is a server component that fetches data, with a client component for interactivity.
export const dynamic = 'force-dynamic';

async function getData(): Promise<{
  connectors: Connector[];
  connectionsByConnector: Record<string, Connection>;
}> {
  const [connectors, connectionsResp] = await Promise.all([
    listConnectors(),
    listConnections(),
  ]);
  const byConnector: Record<string, Connection> = {};
  for (const c of connectionsResp.items || []) {
    // assume one connection per connector per tenant
    if (!byConnector[c.connector]) byConnector[c.connector] = c;
  }
  return { connectors, connectionsByConnector: byConnector };
}

import { SearchStatusBanner } from './SearchStatusClient';

export default async function IntegrationsPage() {
  const { connectors, connectionsByConnector } = await getData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Integrations</h1>
      <p className="text-sm text-gray-600 mb-4">
        Connect external tools (e.g., Jira, Confluence) to use them in chat and actions.
      </p>

      <SearchStatusBanner />

      <IntegrationsClient
        connectors={connectors}
        connectionsByConnector={connectionsByConnector}
      />
    </div>
  );
}
