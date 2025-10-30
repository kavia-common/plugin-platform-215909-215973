'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { Connector, Connection } from '@/lib/api';
import { ConnectorCard } from '@/components/ConnectorCard';

type Props = {
  connectors: Connector[];
  connectionsByConnector: Record<string, Connection>;
};

export function IntegrationsClient({
  connectors,
  connectionsByConnector,
}: Props) {
  const [connMap, setConnMap] = useState<Record<string, Connection>>(
    connectionsByConnector || {}
  );

  const handleDisconnected = useCallback((connectorName: string) => {
    setConnMap((prev) => {
      const next = { ...prev };
      delete next[connectorName];
      return next;
    });
  }, []);

  const handleConnecting = useCallback(() => {
    // Optionally mark as 'connecting' or add a placeholder
    setConnMap((prev) => ({ ...prev }));
  }, []);

  const sorted = useMemo(
    () =>
      [...connectors].sort((a, b) =>
        (a.title || a.name).localeCompare(b.title || b.name)
      ),
    [connectors]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sorted.map((c) => (
        <ConnectorCard
          key={c.name}
          connector={c}
          connection={connMap[c.name]}
          onDisconnected={handleDisconnected}
          onConnecting={handleConnecting}
        />
      ))}
    </div>
  );
}
