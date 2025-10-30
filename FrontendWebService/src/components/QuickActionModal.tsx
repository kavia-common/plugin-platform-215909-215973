'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

type QuickActionType = 'issue' | 'page';

type NormalizedCreateItemRequest = {
  title: string;
  description?: string | null;
  project_key?: string | null; // Jira project key or Confluence space key
  additional?: Record<string, unknown>;
};

type NormalizedCreateItemResponse = {
  id: string;
  key?: string | null;
  url: string;
  type: string; // issue | page
  title: string;
};

type Props = {
  // Connector ID must be either 'jira' (issues) or 'confluence' (pages)
  connectorId: string;
  // The action to perform: issue (Jira) or page (Confluence)
  action: QuickActionType;
  // Open/close
  open: boolean;
  // Close handler
  onClose?: () => void;
  // Success callback with the created item response
  onSuccess?: (res: NormalizedCreateItemResponse) => void;
};

/**
 * PUBLIC_INTERFACE
 * QuickActionModal
 * Accessible modal for creating a Jira issue or a Confluence page via BackendAPIService.
 * Because Next.js uses output: "export", we cannot define Next API routes;
 * therefore, the client calls backend endpoints directly using env-provided base URL and dev bearer.
 */
export function QuickActionModal({ connectorId, action, open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<NormalizedCreateItemResponse | null>(null);

  useEffect(() => {
    if (open) {
      // Reset when opening
      setTitle('');
      setDesc('');
      setProjectKey('');
      setError(null);
      setCreated(null);
      setWorking(false);
    }
  }, [open]);

  const heading = useMemo(() => {
    return action === 'issue' ? 'Create Issue (Jira)' : 'Create Page (Confluence)';
  }, [action]);

  const submitLabel = useMemo(() => {
    return action === 'issue' ? 'Create Issue' : 'Create Page';
  }, [action]);

  const projectLabel = useMemo(() => {
    return action === 'issue' ? 'Project Key (optional)' : 'Space Key (optional)';
  }, [action]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setWorking(true);
    setError(null);
    try {
      const base =
        (process.env.NEXT_PUBLIC_BACKEND_API_URL as string) ||
        (process.env.NEXT_PUBLIC_API_URL as string) ||
        'http://localhost:8000';
      const path =
        action === 'issue'
          ? `/connectors/${encodeURIComponent(connectorId)}/issues`
          : `/connectors/${encodeURIComponent(connectorId)}/pages`;
      const url = new URL(path, base.endsWith('/') ? base : base + '/');

      const body: NormalizedCreateItemRequest = {
        title: title.trim(),
        description: desc.trim() || undefined,
        project_key: projectKey.trim() || undefined,
        additional: {},
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (process.env.NEXT_PUBLIC_DEV_BEARER) {
        headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_DEV_BEARER}`;
      }

      const res = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(
          `Create ${action} failed: ${res.status} ${res.statusText} - ${txt}`
        );
      }
      const data = (await res.json()) as NormalizedCreateItemResponse;
      setCreated(data);
      onSuccess?.(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setError(msg);
    } finally {
      setWorking(false);
    }
  }, [action, connectorId, desc, projectKey, title, onSuccess]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] bg-black/40 flex items-start justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="mt-24 w-full max-w-lg rounded-lg bg-white shadow-lg border">
        <div className="border-b px-4 py-3">
          <h2 id="qa-modal-title" className="text-base font-semibold text-gray-900">
            {heading}
          </h2>
        </div>

        <div className="px-4 py-3 space-y-3">
          {created ? (
            <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <div className="font-medium mb-1">Created successfully</div>
              <div className="space-y-0.5">
                <div>
                  <span className="text-gray-700">Title:</span>{' '}
                  <span className="font-mono">{created.title}</span>
                </div>
                {created.key ? (
                  <div>
                    <span className="text-gray-700">Key:</span>{' '}
                    <span className="font-mono">{created.key}</span>
                  </div>
                ) : null}
                <div>
                  <span className="text-gray-700">URL:</span>{' '}
                  <a
                    className="text-blue-600 hover:underline break-all"
                    href={created.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {created.url}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm outline-none"
                  placeholder={action === 'issue' ? 'e.g., Fix login bug' : 'e.g., Sprint Notes'}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">{projectLabel}</label>
                <input
                  type="text"
                  value={projectKey}
                  onChange={(e) => setProjectKey(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm outline-none"
                  placeholder={action === 'issue' ? 'e.g., ENG' : 'e.g., ENGSPACE'}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm outline-none min-h-[90px]"
                  placeholder={action === 'issue' ? 'Issue details, steps, etc.' : 'Page content...'}
                />
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onClose?.()}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {created ? 'Close' : 'Cancel'}
          </button>
          {!created && (
            <button
              disabled={working}
              onClick={handleSubmit}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-60"
            >
              {working ? 'Working…' : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
