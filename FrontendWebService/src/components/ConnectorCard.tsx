'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { Connector, Connection } from '@/lib/api';
import { deleteConnectorConnection, startConnectorOAuthLogin } from '@/lib/api';
import { ConnectionStatus } from './ConnectionStatus';
import { useRouter } from 'next/navigation';

type Props = {
  connector: Connector;
  // Optional existing connection object matched by connector.name
  connection?: Connection | null;
  onDisconnected?: (connectorName: string) => void;
  onConnecting?: (connectorName: string) => void;
};

export function ConnectorCard({
  connector,
  connection,
  onDisconnected,
  onConnecting,
}: Props) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);
  const [optimisticConnected, setOptimisticConnected] = useState<
    'connected' | 'disconnected' | null
  >(null);
  const connected = useMemo(() => {
    if (optimisticConnected) return optimisticConnected === 'connected';
    return connection?.status === 'connected';
  }, [connection?.status, optimisticConnected]);

  const onConnect = useCallback(async () => {
    if (isWorking) return;
    setIsWorking(true);
    setOptimisticConnected('connected'); // optimistic while redirecting
    onConnecting?.(connector.name);
    try {
      const redirectUri =
        typeof window !== 'undefined'
          ? `${window.location.origin}/integrations` // fallback: return here after auth
          : undefined;

      const resp = await startConnectorOAuthLogin(connector.name, {
        redirect_uri: redirectUri,
        use_pkce: true,
      });

      // Persist state in sessionStorage in case we need to check on return
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `oauth_state_${connector.name}`,
          JSON.stringify({
            state: resp.state,
            ts: Date.now(),
            pkce: resp.pkce_challenge
              ? { challenge: resp.pkce_challenge, method: resp.pkce_method }
              : null,
          })
        );
        // Redirect to provider authorization page
        window.location.href = resp.authorize_url;
      }
    } catch (e) {
      console.error('OAuth start failed', e);
      setOptimisticConnected('disconnected');
      setIsWorking(false);
      alert(
        `Failed to initiate OAuth for ${connector.title}. Please try again.`
      );
    }
  }, [connector.name, connector.title, isWorking, onConnecting]);

  const onDisconnect = useCallback(async () => {
    if (isWorking) return;
    const confirmed = confirm(
      `Disconnect ${connector.title}? This will revoke the active connection for this tenant.`
    );
    if (!confirmed) return;

    setIsWorking(true);
    const prev = optimisticConnected;
    setOptimisticConnected('disconnected'); // optimistic removal
    try {
      await deleteConnectorConnection(connector.name);
      onDisconnected?.(connector.name);
      // stay on page and refresh list
      router.refresh?.();
    } catch (e) {
      console.error('Disconnect failed', e);
      // rollback optimistic update
      setOptimisticConnected(prev);
      alert(
        `Failed to disconnect ${connector.title}. Please retry or check logs.`
      );
    } finally {
      setIsWorking(false);
    }
  }, [
    connector.name,
    connector.title,
    isWorking,
    optimisticConnected,
    onDisconnected,
    router,
  ]);

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{connector.title}</h3>
          <p className="text-sm text-gray-600">{connector.description}</p>
          {connector.docs_url ? (
            <a
              className="text-sm text-blue-600 hover:underline"
              href={connector.docs_url}
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
          ) : null}
        </div>
        <ConnectionStatus
          status={
            connected ? 'connected' : connection ? connection.status : 'none'
          }
        />
      </div>

      <div className="flex gap-2">
        {connected ? (
          <button
            disabled={isWorking}
            onClick={onDisconnect}
            className="px-3 py-1.5 text-sm rounded bg-red-600 text-white disabled:opacity-60"
          >
            {isWorking ? 'Disconnecting...' : 'Disconnect'}
          </button>
        ) : (
          <button
            disabled={isWorking}
            onClick={onConnect}
            className="px-3 py-1.5 text-sm rounded bg-green-600 text-white disabled:opacity-60"
          >
            {isWorking ? 'Redirecting...' : 'Connect'}
          </button>
        )}
      </div>

      {connector.capabilities && connector.capabilities.length > 0 ? (
        <div className="text-xs text-gray-500">
          Capabilities:{' '}
          {connector.capabilities.map((c) => c.key).join(', ')}
        </div>
      ) : null}
    </div>
  );
}
