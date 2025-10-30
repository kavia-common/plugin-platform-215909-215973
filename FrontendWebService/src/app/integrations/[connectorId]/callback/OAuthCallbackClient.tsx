'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';

/**
 * PUBLIC_INTERFACE
 * OAuthCallbackClient
 * Client-side component that reads search params and renders the OAuth callback UI.
 * Must be wrapped by a Suspense boundary at the server page entry.
 */
export default function OAuthCallbackClient() {
  const searchParams = useSearchParams();
  const params = useParams<{ connectorId: string }>();
  const router = useRouter();

  const connectorId = params?.connectorId ?? 'unknown';

  // Extract known params
  const code = searchParams.get('code') ?? undefined;
  const state = searchParams.get('state') ?? undefined;
  const statusRaw = searchParams.get('status') ?? undefined;
  const message = searchParams.get('message') ?? undefined;
  const redirect = (searchParams.get('redirect') ?? 'false').toLowerCase() === 'true';

  // Normalize status to a limited set
  const status: 'success' | 'error' | 'pending' | 'unknown' = useMemo(() => {
    const mapValue = (statusRaw || '').toLowerCase();
    if (['ok', 'success', 'succeeded'].includes(mapValue)) return 'success';
    if (['error', 'failed', 'failure'].includes(mapValue)) return 'error';
    if (['pending', 'inprogress', 'processing'].includes(mapValue)) return 'pending';
    return statusRaw ? 'unknown' : 'pending';
  }, [statusRaw]);

  // Prepare unknown params for display only (debugging)
  const additionalParams = useMemo(() => {
    const recognized = new Set(['code', 'state', 'status', 'message', 'redirect']);
    const entries: Array<[string, string]> = [];
    searchParams.forEach((v, k) => {
      if (!recognized.has(k)) {
        entries.push([k, v]);
      }
    });
    return entries;
  }, [searchParams]);

  // Optional redirect back to /integrations with banner
  const [hasRedirected, setHasRedirected] = useState(false);
  useEffect(() => {
    if (redirect && !hasRedirected) {
      // Build banner params for the destination
      const dest = new URL('/integrations', window.location.origin);
      const bannerMsg =
        message ??
        (status === 'success'
          ? `Connected ${connectorId} successfully`
          : status === 'error'
          ? `Failed to connect ${connectorId}`
          : `Processed callback for ${connectorId}`);
      dest.searchParams.set('banner', bannerMsg);
      dest.searchParams.set('bannerStatus', status);
      dest.searchParams.set('connector', connectorId);
      if (state) dest.searchParams.set('state', state);

      setHasRedirected(true);
      router.replace(dest.pathname + '?' + dest.searchParams.toString());
    }
  }, [redirect, hasRedirected, router, connectorId, status, message, state]);

  const StatusBadge = ({ type }: { type: 'success' | 'error' | 'pending' | 'unknown' }) => {
    const palette: Record<string, string> = {
      success: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unknown: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${palette[type]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-10 text-sm text-gray-600">Loading…</div>}>
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">OAuth Callback</h1>
          <StatusBadge type={status} />
        </div>

        <div className="rounded-lg border border-gray-200 p-4 bg-white">
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Connector: <span className="font-mono">{connectorId}</span>
            </p>
            {message && (
              <p className="text-sm text-gray-700">
                Message: <span className="font-mono">{message}</span>
              </p>
            )}
            {code && (
              <p className="text-sm text-gray-700">
                Code: <span className="font-mono break-all">{code}</span>
              </p>
            )}
            {state && (
              <p className="text-sm text-gray-700">
                State: <span className="font-mono break-all">{state}</span>
              </p>
            )}
            {additionalParams.length > 0 && (
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-900">Additional details</p>
                <ul className="mt-1 list-disc pl-5 space-y-1">
                  {additionalParams.map(([k, v]) => (
                    <li key={k} className="text-sm text-gray-700">
                      <span className="font-mono">{k}</span>: <span className="font-mono break-all">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!redirect && (
            <div className="mt-6 flex items-center gap-3">
              <Link
                href={`/integrations?banner=${encodeURIComponent(
                  message ??
                    (status === 'success'
                      ? `Connected ${connectorId} successfully`
                      : status === 'error'
                      ? `Failed to connect ${connectorId}`
                      : `Processed callback for ${connectorId}`)
                )}&bannerStatus=${encodeURIComponent(status)}&connector=${encodeURIComponent(connectorId)}${
                  state ? `&state=${encodeURIComponent(state)}` : ''
                }`}
                className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Back to Integrations
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Home
              </Link>
            </div>
          )}
          {redirect && (
            <p className="mt-6 text-sm text-gray-500">
              Redirecting back to integrations…
              <br />
              If you are not redirected automatically, <Link className="underline" href="/integrations">click here</Link>.
            </p>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Tip: In mock mode, the backend may redirect here with only state/status/message. Unknown parameters are ignored safely.
        </p>
      </main>
    </Suspense>
  );
}
