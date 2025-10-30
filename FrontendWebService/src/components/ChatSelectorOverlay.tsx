'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type NormalizedItem = {
  id: string;
  title: string;
  url: string;
  type: string;
  subtitle?: string | null;
};

type Props = {
  // The connector to search (e.g., 'jira', 'confluence')
  connectorId: string;
  // Whether the overlay is open
  open: boolean;
  // Called when user selects an item
  onSelect?: (item: NormalizedItem) => void;
  // Called on close (ESC or backdrop click)
  onClose?: () => void;
  // Optional initial query
  initialQuery?: string;
  // Max results to fetch
  limit?: number;
};

/**
 * PUBLIC_INTERFACE
 * ChatSelectorOverlay
 * An accessible overlay with debounced typeahead search against /api/typeahead.
 * - Keyboard: Up/Down to move, Enter to select, ESC to close.
 * - Screen readers: ARIA combobox + listbox semantics and focus management.
 */
export function ChatSelectorOverlay({
  connectorId,
  open,
  onSelect,
  onClose,
  initialQuery = '',
  limit = 10,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NormalizedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch when debounced value changes
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!open) return;
      if (!debounced) {
        setItems([]);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Directly call BackendAPIService since Next.js output: "export" doesn't support API routes.
        const base =
          (process.env.NEXT_PUBLIC_BACKEND_API_URL as string) ||
          (process.env.NEXT_PUBLIC_API_URL as string) ||
          'http://localhost:8000';
        const endpoint = new URL(
          `/connectors/${encodeURIComponent(connectorId)}/search`,
          base.endsWith('/') ? base : base + '/'
        );
        endpoint.searchParams.set('q', debounced);
        endpoint.searchParams.set('limit', String(limit));
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (process.env.NEXT_PUBLIC_DEV_BEARER) {
          headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_DEV_BEARER}`;
        }
        const res = await fetch(endpoint.toString(), { method: 'GET', headers });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Typeahead failed: ${res.status} ${res.statusText} ${txt}`);
        }
        const data = (await res.json()) as { items: NormalizedItem[] };
        if (cancelled) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Search failed';
        setError(msg);
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [debounced, connectorId, limit, open]);

  // Manage focus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    } else {
      setQuery(initialQuery);
      setItems([]);
      setActiveIndex(-1);
      setError(null);
    }
  }, [open, initialQuery]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = Math.min((prev < 0 ? -1 : prev) + 1, items.length - 1);
          return next;
        });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          return next;
        });
        return;
      }
      if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < items.length) {
          e.preventDefault();
          const item = items[activeIndex];
          onSelect?.(item);
          onClose?.();
        }
        return;
      }
    },
    [activeIndex, items, onClose, onSelect]
  );

  const onClickBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose?.();
      }
    },
    [onClose]
  );

  const hasResults = items.length > 0;

  if (!open) return null;

  const listboxId = 'chat-selector-listbox';
  const inputId = 'chat-selector-input';

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/40 flex items-start justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-selector-label"
      onMouseDown={onClickBackdrop}
    >
      <div
        className="mt-24 w-full max-w-2xl rounded-lg bg-white shadow-lg border"
        onKeyDown={onKeyDown}
      >
        <div className="border-b px-3 py-2">
          <label id="chat-selector-label" htmlFor={inputId} className="sr-only">
            Search
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="w-full outline-none text-base px-2 py-2"
            placeholder={`Search ${connectorId}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded={hasResults}
            aria-controls={listboxId}
            aria-autocomplete="list"
          />
        </div>

        <div className="max-h-80 overflow-auto">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-600">Searching…</div>
          )}
          {error && !loading && (
            <div className="px-3 py-2 text-sm text-red-700 bg-red-50">{error}</div>
          )}
          {!loading && !error && items.length === 0 && debounced && (
            <div className="px-3 py-2 text-sm text-gray-600">No results</div>
          )}
          {!loading && items.length > 0 && (
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Search results"
              className="divide-y"
            >
              {items.map((item, idx) => {
                const active = idx === activeIndex;
                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={active}
                    className={`px-3 py-2 cursor-pointer ${
                      active ? 'bg-blue-50' : 'bg-white'
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      // Prevent input blur before click
                      e.preventDefault();
                      onSelect?.(item);
                      onClose?.();
                    }}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.subtitle || item.type}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t px-3 py-2 text-xs text-gray-500 flex items-center justify-between">
          <span>Enter to select • Esc to close • ↑/↓ to navigate</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onClose?.();
            }}
            className="text-blue-600 hover:underline"
          >
            Close
          </a>
        </div>
      </div>
    </div>
  );
}
