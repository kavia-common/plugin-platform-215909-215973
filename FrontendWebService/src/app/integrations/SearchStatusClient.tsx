'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';

export function SearchStatusBanner() {
  const sp = useSearchParams();
  const status = sp.get('status') || '';
  const message = sp.get('message') || '';

  if (!status && !message) return null;

  return (
    <div className="mb-4">
      <div className="rounded border p-3 text-sm">
        <strong>Status:</strong> {status || 'ok'}
        {message ? <span className="ml-2 text-gray-600">{message}</span> : null}
      </div>
    </div>
  );
}
