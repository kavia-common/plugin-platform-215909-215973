'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Connector, Connection } from '@/lib/api';
import { listConnectors, listConnections } from '@/lib/api';
import { ConnectorCard } from '@/components/ConnectorCard';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Simple banner component to show status from OAuth callback redirects.
 */
function Banner({ status, message }: { status: string; message: string }) {
  const palette: Record<string, string> = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    unknown: 'bg-gray-50 text-gray-800 border-gray-200',
  };
  const key = palette[status] ? status : 'unknown';
  return (
    <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${palette[key]}`}>
      {message}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * IntegrationsClient presents connector cards and manages minor optimistic UI updates.
 * In static export mode, it fetches connectors and connections on the client.
 */
export function IntegrationsClient() {
  const [connectors, setConnectors] = useState<Connector[] | null>(null);
  const [connMap, setConnMap] = useState<Record<string, Connection>>({});
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Read banner info from query params (set by callback)
  const bannerMessage = searchParams.get('banner') ?? undefined;
  const bannerStatus = (searchParams.get('bannerStatus') ?? 'unknown').toLowerCase();

  // Clean the URL after showing a banner to avoid keeping it on refresh
  useEffect(() => {
    if (bannerMessage) {
      const url = new URL(window.location.href);
      url.searchParams.delete('banner');
      url.searchParams.delete('bannerStatus');
      router.replace(
        url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''),
        { scroll: false }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [cs, conns] = await Promise.all([
          listConnectors(),
          listConnections(),
        ]);
        if (cancelled) return;
        setConnectors(cs);
        const byConnector: Record<string, Connection> = {};
        for (const c of conns.items || []) {
          if (!byConnector[c.connector]) byConnector[c.connector] = c;
        }
        setConnMap(byConnector);
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : 'Failed to load integrations data'
        );
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const sorted = useMemo(() => {
    if (!connectors) return [];
    return [...connectors].sort((a, b) =>
      (a.title || a.name).localeCompare(b.title || b.name)
    );
  }, [connectors]);

  if (error) {
    return (
      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
        {error}
      </div>
    );
  }

  if (!connectors) {
    return (
      <div className="text-sm text-gray-600">
        Loading integrations...
      </div>
    );
  }

  return (
    <>
      {bannerMessage && <Banner status={bannerStatus} message={bannerMessage} />}
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
    </>
  );
}
